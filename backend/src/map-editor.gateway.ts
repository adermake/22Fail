import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  MapEditorService,
  MapOp,
  ObjectCollection,
} from './map-editor.service';
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
export class MapEditorGateway implements OnGatewayDisconnect {
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
    const auth = client.handshake?.auth as
      | { userId?: string; code?: string }
      | undefined;
    return !!this.users.resolve(auth?.userId, auth?.code)?.isAdmin;
  }

  /**
   * The authenticated user behind a socket, or '' when the handshake proves nobody.
   *
   * Taken from the handshake, never from the message body: a sketch stroke says who drew it,
   * and if that came from the payload any client could sign a line with someone else's name.
   */
  private userId(client: Socket): string {
    const auth = client.handshake?.auth as
      | { userId?: string; code?: string }
      | undefined;
    return this.users.resolve(auth?.userId, auth?.code)?.name ?? '';
  }

  @SubscribeMessage('joinMapEditor')
  join(
    @MessageBody() data: { worldName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName } = data ?? {};
    if (!worldName) return;

    // Exactly one room per client, so a single emit addressing both cannot double-deliver.
    const room = this.isGM(client)
      ? this.gmRoom(worldName)
      : this.room(worldName);
    client.join(room);
  }

  @SubscribeMessage('leaveMapEditor')
  leave(
    @MessageBody() data: { worldName: string },
    @ConnectedSocket() client: Socket,
  ) {
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

    /*
     * Editing the world is a GM action, with one deliberate exception: the sketch layer,
     * which exists so players can trace a route during a session. Everything else from a
     * non-GM socket is refused loudly — silently diverging state is far worse to debug.
     */
    if (!this.isGM(client)) {
      const user = this.userId(client);
      if (!this.mapEditor.isPlayerWritableOp(op, user)) {
        this.logger.warn(
          `Rejected map edit from non-GM socket ${client.id} on ${worldName}`,
        );
        return;
      }
      // A player may rub out their own lines, never anyone else's.
      if (op.t === 'del') {
        const author = this.mapEditor.sketchAuthor(worldName, op.id);
        if (author !== user) {
          this.logger.warn(
            `Rejected sketch delete by ${user} of a stroke owned by ${author ?? 'nobody'}`,
          );
          return;
        }
      }
    }

    // Visibility before the op decides who may be told about it afterwards.
    const priorVis =
      op.t === 'upd' || op.t === 'del'
        ? this.mapEditor.getObjectVisibility(worldName, op.c, op.id)
        : undefined;

    this.mapEditor.applyOp(worldName, op);

    const gm = this.gmRoom(worldName);
    const players = this.room(worldName);
    const toEveryone = () =>
      this.server.to(gm).to(players).emit('mapEditorOp', op);
    const toGMs = () => this.server.to(gm).emit('mapEditorOp', op);

    switch (op.t) {
      case 'chunk':
      case 'chunkDrop':
      case 'fog':
        // Terrain is never secret — what a player may see of it is decided by the fog, and
        // the fog itself has to reach players or it would hide nothing on their screens.
        toEveryone();
        break;

      case 'set':
        /*
         * Shared scalar state (palettes, settings, fog, presets) is public — except the
         * secrets list, whose *names* are the spoiler. "Räuberlager" appearing in a player's
         * devtools gives away the ambush as surely as the symbols would, so the one path
         * that carries them stays GM-only. The members are protected separately, by `vis`.
         */
        if (op.path === 'secrets') toGMs();
        else toEveryone();
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
          const full = this.mapEditor.getObject(worldName, op.c, op.id);
          if (full)
            this.server
              .to(players)
              .emit('mapEditorOp', { t: 'add', c: op.c, v: full });
        } else if (!wasSecret && nowSecret) {
          // Hidden again: retract it from players entirely.
          this.server
            .to(players)
            .emit('mapEditorOp', { t: 'del', c: op.c, id: op.id });
        } else if (!nowSecret) {
          this.server.to(players).emit('mapEditorOp', op);
        }
        break;
      }
    }
  }

  // ── ephemeral play aids ──
  //
  // Pings and the ruler are *not* ops: they are gestures, not edits. Nothing about them
  // belongs in the document — persisting a ping would mean the map remembered where somebody
  // pointed three sessions ago — so they are broadcast and forgotten. Both are open to
  // players, which is the entire point of having them.

  /** Transient ruler lines: world → (socket id → line). Cleared when the socket goes. */
  private measurements = new Map<
    string,
    Map<string, { id: string; start: any; end: any; by: string }>
  >();

  private broadcastMeasurements(worldName: string): void {
    const all = Array.from(this.measurements.get(worldName)?.values() ?? []);
    this.server
      .to(this.gmRoom(worldName))
      .to(this.room(worldName))
      .emit('mapEditorMeasure', all);
  }

  /**
   * Relay a radial ping.
   *
   * The payload is the shared `PingBroadcast` the lobby and the old world map already use, so
   * the same overlay, animation and sounds serve every map in the app. Only `createdBy` is
   * overwritten, from the handshake — taken from the body it could be forged.
   */
  @SubscribeMessage('mapEditorPing')
  ping(
    @MessageBody()
    data: {
      worldName: string;
      ping: { id: string; type: string; worldX: number; worldY: number };
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, ping } = data ?? ({} as any);
    if (!worldName || !ping) return;
    if (!Number.isFinite(ping.worldX) || !Number.isFinite(ping.worldY)) return;

    this.server
      .to(this.gmRoom(worldName))
      .to(this.room(worldName))
      .emit('mapEditorPing', { ...ping, createdBy: this.userId(client) });
  }

  @SubscribeMessage('mapEditorMeasure')
  measure(
    @MessageBody()
    data: {
      worldName: string;
      line: { start: { x: number; y: number }; end: { x: number; y: number } } | null;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, line } = data ?? ({} as any);
    if (!worldName) return;

    let forWorld = this.measurements.get(worldName);
    if (!forWorld) {
      forWorld = new Map();
      this.measurements.set(worldName, forWorld);
    }

    // Keyed by socket, so a client always replaces its own line instead of adding another,
    // and dragging the ruler cannot leave a trail of stale ones behind.
    if (line === null) forWorld.delete(client.id);
    else {
      forWorld.set(client.id, {
        id: client.id,
        start: line.start,
        end: line.end,
        by: this.userId(client),
      });
    }
    this.broadcastMeasurements(worldName);
  }

  /**
   * Drop a disconnected client's ruler line.
   *
   * Without this a closed tab leaves its line on everyone else's map for the rest of the
   * session, with no way to clear it — the socket that owned it is gone.
   */
  handleDisconnect(client: Socket): void {
    for (const [worldName, lines] of this.measurements) {
      if (lines.delete(client.id)) this.broadcastMeasurements(worldName);
    }
  }
}
