import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MapEditorService, MapOp, ObjectCollection } from './map-editor.service';
import { UsersService } from './users.service';

/**
 * Realtime channel for the map editor (format v2).
 *
 * Each world has two rooms: one every viewer joins, and a GM-only room. Ops that concern
 * secret objects are emitted to the GM room alone, so a hidden dungeon never crosses a
 * player's socket — the same reason the REST document is filtered. Public ops address both
 * rooms in a single emit, which Socket.IO de-duplicates, so GMs get exactly one copy.
 *
 * Revealing a secret is the interesting case: players have never received the object, so an
 * `upd` flipping `vis` to `public` has nothing to update. They are sent a full `add`
 * instead, while GMs get the plain `upd`.
 */
@WebSocketGateway({
  cors: { origin: '*' },
})
export class MapEditorGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MapEditorGateway.name);

  constructor(
    private readonly mapEditor: MapEditorService,
    private readonly users: UsersService,
  ) {}

  private room(worldName: string): string {
    return `mapeditor-${worldName}`;
  }

  private gmRoom(worldName: string): string {
    return `mapeditor-gm-${worldName}`;
  }

  /** Resolve GM status from the socket handshake auth the frontend attaches. */
  private isGM(client: Socket): boolean {
    const auth = client.handshake?.auth as { userId?: string; code?: string } | undefined;
    return !!this.users.resolve(auth?.userId, auth?.code)?.isAdmin;
  }

  @SubscribeMessage('joinMapEditor')
  join(@MessageBody() data: { worldName: string }, @ConnectedSocket() client: Socket) {
    const { worldName } = data ?? {};
    if (!worldName) return;

    // Exactly one room per client, so a single emit addressing both cannot double-deliver.
    const room = this.isGM(client) ? this.gmRoom(worldName) : this.room(worldName);
    client.join(room);
  }

  @SubscribeMessage('leaveMapEditor')
  leave(@MessageBody() data: { worldName: string }, @ConnectedSocket() client: Socket) {
    const { worldName } = data ?? {};
    if (!worldName) return;
    client.leave(this.room(worldName));
    client.leave(this.gmRoom(worldName));
  }

  @SubscribeMessage('mapEditorOp')
  op(
    @MessageBody() data: { worldName: string; op: MapOp },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, op } = data ?? ({} as any);
    if (!worldName || !op?.t) return;

    // Editing the world is a GM action. Rejecting loudly beats silently diverging state.
    if (!this.isGM(client)) {
      this.logger.warn(`Rejected map edit from non-GM socket ${client.id} on ${worldName}`);
      return;
    }

    // Visibility before the op decides who may be told about it afterwards.
    const priorVis =
      op.t === 'upd' || op.t === 'del'
        ? this.mapEditor.getObjectVisibility(worldName, op.c as ObjectCollection, op.id)
        : undefined;

    this.mapEditor.applyOp(worldName, op);

    const gm = this.gmRoom(worldName);
    const players = this.room(worldName);
    const toEveryone = () => this.server.to(gm).to(players).emit('mapEditorOp', op);
    const toGMs = () => this.server.to(gm).emit('mapEditorOp', op);

    switch (op.t) {
      case 'chunk':
      case 'set':
        // Terrain and shared state (palettes, fog, settings) are never secret.
        toEveryone();
        break;

      case 'add':
        if (op.v?.vis === 'secret') toGMs();
        else toEveryone();
        break;

      case 'del':
        // Players were never sent a secret object, so they have nothing to delete.
        if (priorVis === 'secret') toGMs();
        else toEveryone();
        break;

      case 'upd': {
        const nextVis = (op.v as any)?.vis as string | undefined;
        const wasSecret = priorVis === 'secret';
        const nowSecret = nextVis ? nextVis === 'secret' : wasSecret;

        toGMs();

        if (wasSecret && !nowSecret) {
          // Reveal: players are seeing this object for the first time.
          const full = this.mapEditor.getObject(worldName, op.c as ObjectCollection, op.id);
          if (full) this.server.to(players).emit('mapEditorOp', { t: 'add', c: op.c, v: full });
        } else if (!wasSecret && nowSecret) {
          // Hidden again: retract it from players entirely.
          this.server.to(players).emit('mapEditorOp', { t: 'del', c: op.c, id: op.id });
        } else if (!nowSecret) {
          this.server.to(players).emit('mapEditorOp', op);
        }
        break;
      }
    }
  }
}
