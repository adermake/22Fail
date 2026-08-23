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

  // ── Gemeinsamer Beutel (shared party stash) ──────────────────────────────
  // The stash is server-authoritative on purpose. Two players grabbing the same item at the
  // same moment must not both get it, and an item must never vanish because two clients wrote
  // the whole array at once — so clients never patch `partyStash` directly. They ask, the
  // server decides, and everyone (the asker included) learns the result from one broadcast.

  /** Units in one stash entry — an unstackable item is always exactly one. */
  private static amountOf(entry: any): number {
    if (!entry?.item) return 0;
    if (!entry.item.stackable) return 1;
    return Math.max(1, Math.floor(entry.item.amount ?? 1));
  }

  private readStash(worldName: string): { world: any; stash: any[] } | null {
    const worldJson = this.dataService.getWorld(worldName);
    if (!worldJson) return null;
    const world = JSON.parse(worldJson);
    return { world, stash: Array.isArray(world.partyStash) ? world.partyStash : [] };
  }

  private commitStash(worldName: string, stash: any[]): void {
    this.dataService.applyPatchToWorld(worldName, { path: 'partyStash', value: stash });
    this.server.to(worldName).emit('worldPatched', { path: 'partyStash', value: stash });
  }

  /**
   * Put an item in. Idempotent: re-sending the same entryId (a retry) never duplicates it.
   *
   * Identical stackable items merge into one pile. What counts as "identical" is decided by the
   * client and sent along as `stackKey` — that rule lives in item-stack.util.ts, and duplicating
   * it here in a second language is exactly how the two would drift apart.
   */
  @SubscribeMessage('partyStashDeposit')
  handleStashDeposit(
    @MessageBody() data: { worldName: string; entry: any },
  ): { ok: boolean; stash: any[]; reason?: string } {
    const { worldName, entry } = data ?? ({} as any);
    if (!worldName || !entry?.entryId) return { ok: false, stash: [], reason: 'bad-request' };

    const read = this.readStash(worldName);
    if (!read) return { ok: false, stash: [], reason: 'no-world' };

    if (read.stash.some((e: any) => e.entryId === entry.entryId)) {
      return { ok: true, stash: read.stash };
    }

    const amount = WorldGateway.amountOf(entry);
    const mergeIdx = entry.stackKey
      ? read.stash.findIndex((e: any) => e.stackKey === entry.stackKey && e.item?.stackable)
      : -1;

    let stash: any[];
    if (mergeIdx >= 0) {
      stash = [...read.stash];
      const target = stash[mergeIdx];
      stash[mergeIdx] = {
        ...target,
        item: { ...target.item, amount: WorldGateway.amountOf(target) + amount },
      };
    } else {
      stash = [...read.stash, entry];
    }
    this.commitStash(worldName, stash);
    return { ok: true, stash };
  }

  /**
   * Take an item out. The item is returned ONLY to the client whose request actually removed
   * it; everyone else gets `ok: false` and keeps nothing. That is the whole anti-duplication
   * rule — the taker adds it to their sheet only after this ack says it was theirs to take.
   */
  @SubscribeMessage('partyStashWithdraw')
  handleStashWithdraw(
    @MessageBody() data: { worldName: string; entryId: string; amount?: number },
  ): { ok: boolean; entry?: any; stash: any[]; reason?: string } {
    const { worldName, entryId, amount } = data ?? ({} as any);
    if (!worldName || !entryId) return { ok: false, stash: [], reason: 'bad-request' };

    const read = this.readStash(worldName);
    if (!read) return { ok: false, stash: [], reason: 'no-world' };

    const idx = read.stash.findIndex((e: any) => e.entryId === entryId);
    if (idx < 0) return { ok: false, stash: read.stash, reason: 'gone' };

    const entry = read.stash[idx];
    const have = WorldGateway.amountOf(entry);
    const wanted = amount === undefined ? have : Math.max(0, Math.floor(amount));
    if (wanted <= 0) return { ok: false, stash: read.stash, reason: 'bad-request' };

    // Taking part of a pile splits it here, in one step, so two takers can never both get the
    // same unit and a failed split can never leave the bag short.
    if (wanted < have && entry.item?.stackable) {
      const stash = [...read.stash];
      stash[idx] = { ...entry, item: { ...entry.item, amount: have - wanted } };
      this.commitStash(worldName, stash);
      const taken = { ...entry, item: { ...entry.item, amount: wanted } };
      return { ok: true, entry: taken, stash };
    }

    const stash = read.stash.filter((_: any, i: number) => i !== idx);
    this.commitStash(worldName, stash);
    return { ok: true, entry, stash };
  }

  /** Current contents — used when a sheet opens, before any change has been broadcast. */
  @SubscribeMessage('partyStashRead')
  handleStashRead(@MessageBody() data: { worldName: string }): { ok: boolean; stash: any[] } {
    const read = data?.worldName ? this.readStash(data.worldName) : null;
    return { ok: !!read, stash: read?.stash ?? [] };
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
