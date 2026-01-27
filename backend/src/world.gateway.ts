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

  private truncateImageData(obj: any): any {
    if (typeof obj === 'string' && obj.startsWith('data:image') && obj.length > 100) {
      return obj.substring(0, 50) + '...[TRUNCATED ' + obj.length + ' chars]';
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.truncateImageData(item));
    }
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.truncateImageData(obj[key]);
      }
      return result;
    }
    return obj;
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
    // Truncate all image data in logs to keep console readable
    const logData = this.truncateImageData(data);
    console.log('[WORLD GATEWAY] Received patchWorld message:', logData);
    const { worldName, patch } = data;

    // Apply patch in backend
    const result = this.dataService.applyPatchToWorld(worldName, patch);
    console.log('[WORLD GATEWAY] Patch applied, result:', result ? 'success' : 'failed');

    // Broadcast patch to all clients in the same world room
    this.server.to(worldName).emit('worldPatched', patch);
    console.log('[WORLD GATEWAY] Broadcasted patch to room:', worldName);
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

  // Handle dice roll events - broadcast to all players in the world
  @SubscribeMessage('diceRoll')
  handleDiceRoll(
    @MessageBody() roll: {
      id: string;
      worldName: string;
      characterName: string;
      characterId: string;
      diceType: number;
      diceCount: number;
      bonuses: { name: string; value: number; source: string }[];
      result: number;
      rolls: number[];
      timestamp: Date;
      isSecret: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { worldName, isSecret, characterName } = roll;
    console.log(`[DICE ROLL] ${characterName} rolled in ${worldName}, isSecret: ${isSecret}`);

    if (isSecret) {
      // Secret roll - only send to the GM (world room with "gm-" prefix or just send to world for now)
      // For now, broadcast with isSecret flag so clients can filter based on GM status
      this.server.to(worldName).emit('diceRolled', roll);
    } else {
      // Normal roll - broadcast to everyone in the world
      this.server.to(worldName).emit('diceRolled', roll);
    }
  }
}
