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
  maxHttpBufferSize: 10 * 1024 * 1024, // 10 MB
})
export class WorldGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly dataService: DataService) {}

  handleConnection(client: Socket) {
    console.log('Client connected to world gateway:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected from world gateway:', client.id);
  }

  // Join a world "room"
  @SubscribeMessage('joinWorld')
  joinWorld(
    @MessageBody() worldName: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(worldName);
    console.log(`Client ${client.id} joined world ${worldName}`);
  }

  // Receive a patch from a client
  @SubscribeMessage('patchWorld')
  handlePatch(
    @MessageBody() data: { worldName: string; patch: JsonPatch },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, patch } = data;

    // Apply patch in backend
    this.dataService.applyPatchToWorld(worldName, patch);
    console.log('WORLD PATCH Applied');

    // Broadcast patch to all clients in the same world room
    this.server.to(worldName).emit('worldPatched', patch);
  }

  // Broadcast a patch to all clients in a world (called from controller)
  broadcastPatch(worldName: string, patch: JsonPatch) {
    if (this.server) {
      this.server.to(worldName).emit('worldPatched', patch);
    }
  }

  // Send loot notification to a specific character
  sendLootToCharacter(characterId: string, loot: any) {
    if (this.server) {
      this.server.to(characterId).emit('lootReceived', loot);
    }
  }

  // Send battle loot notification to all party members
  sendBattleLootToParty(worldName: string, partyIds: string[], loot: any) {
    if (this.server) {
      partyIds.forEach(characterId => {
        this.server.to(characterId).emit('battleLootReceived', loot);
      });
    }
  }
}
