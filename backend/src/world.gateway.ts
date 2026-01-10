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

  // Manually reveal battle loot to party
  @SubscribeMessage('revealBattleLoot')
  handleRevealBattleLoot(
    @MessageBody() data: { worldName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName } = data;
    console.log(`Revealing battle loot for world ${worldName}`);

    const worldJson = this.dataService.getWorld(worldName);
    if (worldJson) {
      const world = JSON.parse(worldJson);
      if (world && world.partyIds && world.battleLoot) {
        // Send the entire battle loot array to all party members
        this.sendBattleLootToParty(worldName, world.partyIds, world.battleLoot);
      }
    }
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

  // Handle sending direct loot to a character (GM drops item on player)
  @SubscribeMessage('sendDirectLoot')
  handleSendDirectLoot(
    @MessageBody() data: { characterId: string; loot: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId, loot } = data;
    console.log(`Sending direct loot to ${characterId}:`, loot);
    this.sendLootToCharacter(characterId, loot);
  }

  // Send battle loot notification to all party members
  sendBattleLootToParty(worldName: string, partyIds: string[], loot: any) {
    if (this.server) {
      partyIds.forEach(characterId => {
        // Filter loot to only include items this character should receive
        const filteredLoot = loot.filter((item: any) => {
          // If recipientIds is not set or empty, everyone gets it
          if (!item.recipientIds || item.recipientIds.length === 0) {
            return true;
          }
          // Otherwise, only include if this character is in the recipients list
          return item.recipientIds.includes(characterId);
        });

        // Only send if there's loot for this character
        if (filteredLoot.length > 0) {
          this.server.to(characterId).emit('battleLootReceived', { worldName, loot: filteredLoot });
        }
      });
    }
  }

  // Handle claiming battle loot (removes item from battle loot)
  @SubscribeMessage('claimBattleLoot')
  handleClaimBattleLoot(
    @MessageBody() data: { worldName: string; lootId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, lootId } = data;
    console.log(`Claiming loot ${lootId} from world ${worldName}`);

    // Load the world
    const worldJson = this.dataService.getWorld(worldName);
    if (!worldJson) {
      console.error(`World ${worldName} not found`);
      return;
    }

    const world = JSON.parse(worldJson);

    // Remove the loot item
    const newBattleLoot = world.battleLoot.filter((item: any) => item.id !== lootId);

    // Apply the patch
    this.dataService.applyPatchToWorld(worldName, {
      path: 'battleLoot',
      value: newBattleLoot
    });

    // Broadcast the updated battle loot to all clients in the world
    this.server.to(worldName).emit('worldPatched', {
      path: 'battleLoot',
      value: newBattleLoot
    });
  }
}
