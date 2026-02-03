import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DataService, JsonPatch } from './data.service';

@WebSocketGateway({
  cors: { origin: '*' }, // for dev, restrict later
})
export class BattleMapGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly dataService: DataService) {}

  handleConnection(client: Socket) {
    console.log('Client connected to battlemap gateway:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected from battlemap gateway:', client.id);
  }

  // Join a lobby room (for world-level coordination)
  @SubscribeMessage('joinLobby')
  joinLobby(
    @MessageBody() data: { worldName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `lobby-${data.worldName}`;
    client.join(room);
    console.log(`Client ${client.id} joined lobby for world ${data.worldName}`);
  }

  // Join a specific map room within a lobby
  @SubscribeMessage('joinMap')
  joinMap(
    @MessageBody() data: { worldName: string; mapId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `map-${data.mapId}`;
    client.join(room);
    console.log(`Client ${client.id} joined map ${data.mapId} in world ${data.worldName}`);
  }

  // Join a battle map "room" (legacy support)
  @SubscribeMessage('joinBattleMap')
  joinBattleMap(
    @MessageBody() data: { worldName: string, battleMapId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `battlemap-${data.battleMapId}`;
    client.join(room);
    console.log(`Client ${client.id} joined battle map ${data.battleMapId} in world ${data.worldName}`);
  }

  // Receive a patch from a client
  @SubscribeMessage('patchBattleMap')
  handlePatch(
    @MessageBody() data: { worldName: string; battleMapId: string; patch: JsonPatch },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('[BATTLEMAP GATEWAY] Received patchBattleMap message:', data);
    const { worldName, battleMapId, patch } = data;

    // Apply patch to the map in the lobby
    const result = this.dataService.applyPatchToMap(worldName, battleMapId, patch);
    console.log('[BATTLEMAP GATEWAY] Patch applied, result:', result ? 'success' : 'failed');

    // Broadcast patch to all clients in the same map room
    const mapRoom = `map-${battleMapId}`;
    this.server.to(mapRoom).emit('battleMapPatched', patch);
    
    // Also broadcast to legacy battlemap room for backward compatibility
    const battleMapRoom = `battlemap-${battleMapId}`;
    this.server.to(battleMapRoom).emit('battleMapPatched', patch);
    
    console.log('[BATTLEMAP GATEWAY] Broadcasted patch to rooms:', mapRoom, battleMapRoom);
  }

  // Broadcast a patch to all clients in a battle map room
  broadcastPatch(battleMapId: string, patch: JsonPatch) {
    if (this.server) {
      const room = `battlemap-${battleMapId}`;
      this.server.to(room).emit('battleMapPatched', patch);
    }
  }
}
