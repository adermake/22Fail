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
import { CharacterGateway } from './character.gateway';

@WebSocketGateway({
  cors: { origin: '*' },
  maxHttpBufferSize: 10 * 1024 * 1024,
})
export class WorldGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly dataService: DataService, private readonly characterGateway: CharacterGateway) {}

  handleConnection(client: Socket) {
    console.log('Client connected to world gateway:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected from world gateway:', client.id);
  }

  @SubscribeMessage('joinWorld')
  joinWorld(
    @MessageBody() worldName: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(worldName);
    console.log(`Client ${client.id} joined world ${worldName}`);
  }

  @SubscribeMessage('patchWorld')
  handlePatch(
    @MessageBody() data: { worldName: string; patch: JsonPatch },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, patch } = data;

    // Apply patch in backend
    this.dataService.applyPatchToWorld(worldName, patch);

    // Broadcast to other clients in room
    client.to(worldName).emit('worldPatched', patch);

    // If battleLoot changed, send loot offers to party members
    try {
      if (patch.path && patch.path.startsWith('battleLoot')) {
        const world = this.dataService.getWorld(worldName);
        if (world && Array.isArray(world.party) && Array.isArray(world.battleLoot)) {
          const itemsWithIndex = world.battleLoot.map((it: any, i: number) => ({ item: it, index: i }));
          for (const charId of world.party) {
            this.server.to(charId).emit('lootOffer', { worldName, items: itemsWithIndex });
          }
        }
      }
    } catch (e) {
      console.error('Error while sending loot offers', e);
    }
  }

  broadcastPatch(worldName: string, patch: JsonPatch) {
    if (this.server) {
      this.server.to(worldName).emit('worldPatched', patch);
    }
  }

  @SubscribeMessage('claimLoot')
  async handleClaim(
    @MessageBody() data: { worldName: string; index: number; characterId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, index, characterId } = data;

    const world = this.dataService.getWorld(worldName);
    if (!world || !Array.isArray(world.battleLoot)) return;

    const item = world.battleLoot[index];
    if (!item) return;

    // Remove from battleLoot
    const newBattle = world.battleLoot.filter((_: any, i: number) => i !== index);
    this.dataService.saveWorld(worldName, { ...world, battleLoot: newBattle });

    // Add to character inventory
    const charJson = this.dataService.getCharacter(characterId);
    if (!charJson) return;
    let sheet: any;
    try {
      sheet = JSON.parse(charJson);
    } catch {
      return;
    }
    const newInv = [...(sheet.inventory || []), item];
    this.dataService.applyPatchToCharacter(characterId, { path: 'inventory', value: newInv });

    // Broadcast updates
    this.broadcastPatch(worldName, { path: 'battleLoot', value: newBattle });
    this.characterGateway.broadcastPatch(characterId, { path: 'inventory', value: newInv });

    // Notify claimant
    this.server.to(characterId).emit('lootClaimed', { item, index, worldName });
  }
}
