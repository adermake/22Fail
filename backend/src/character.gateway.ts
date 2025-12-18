// character.gateway.ts
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
export class CharacterGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly dataService: DataService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Join a character “room”
  @SubscribeMessage('joinCharacter')
  joinCharacter(
    @MessageBody() characterId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(characterId);
    console.log(`Client ${client.id} joined character ${characterId}`);
  }

  // Receive a patch from a client
  @SubscribeMessage('patchCharacter')
  handlePatch(
    @MessageBody() data: { characterId: string; patch: JsonPatch },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId, patch } = data;

    // 1️⃣ Apply patch in backend
    this.dataService.applyPatchToCharacter(characterId, patch);
    console.log('CHARACTER PATCH Chaining');
    // 2️⃣ Broadcast patch to all other clients in the same room
    client.to(characterId).emit('characterPatched', patch);
  }

  broadcastPatch(characterId: string, patch: JsonPatch) {
    if (this.server) {
      this.server.to(characterId).emit('characterPatched', patch);
    }
  }
}
