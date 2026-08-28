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
    if (
      typeof obj === 'string' &&
      obj.startsWith('data:image') &&
      obj.length > 100
    ) {
      return obj.substring(0, 50) + '...[TRUNCATED ' + obj.length + ' chars]';
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.truncateImageData(item));
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
    console.log(
      '[WORLD GATEWAY] Patch applied, result:',
      result ? 'success' : 'failed',
    );

    // Broadcast patch to all clients in the same world room
    this.server.to(worldName).emit('worldPatched', patch);
    console.log('[WORLD GATEWAY] Broadcasted patch to room:', worldName);
  }

  // Broadcast a patch to all clients in a world (called from controller)
  broadcastPatch(worldName: string, patch: JsonPatch) {
    if (this.server) {
      this.server.to(worldName).emit('worldPatched', patch);
    }
  }

  /**
   * Tells every client that a library changed, so worlds and lobbies can reload it instead of
   * showing months-old content until someone refreshes the page. Called from the library and
   * asset-browser controllers after every write.
   */
  broadcastLibraryChanged(libraryId: string) {
    if (this.server) {
      this.server.emit('libraryChanged', { libraryId });
    }
  }

  // ── GM-Schreibtisch: aufgedeckte Reiter als gemeinsamer Loot-Pool ─────────
  // Wie beim Beutel entscheidet der Server, wer einen Eintrag bekommt. Der Vorgänger löste das
  // im Client, indem jeder Spieler das ganze `currentEvents`-Array zurückschrieb — bei zwei
  // gleichzeitigen Zugriffen gewann der Letzte und beide hatten den Gegenstand.

  private readDesk(worldName: string): { world: any; desk: any[] } | null {
    const worldJson = this.dataService.getWorld(worldName);
    if (!worldJson) return null;
    const world = JSON.parse(worldJson);
    return { world, desk: Array.isArray(world.gmDesk) ? world.gmDesk : [] };
  }

  private commitDesk(worldName: string, desk: any[]): void {
    this.dataService.applyPatchToWorld(worldName, {
      path: 'gmDesk',
      value: desk,
    });
    this.server
      .to(worldName)
      .emit('worldPatched', { path: 'gmDesk', value: desk });
  }

  /**
   * Nimmt einen Eintrag aus einem aufgedeckten Reiter. Der Eintrag geht NUR an den Anfragenden,
   * dessen Zugriff ihn tatsächlich entfernt hat — alle anderen bekommen `ok: false`.
   */
  @SubscribeMessage('gmDeskClaim')
  handleDeskClaim(
    @MessageBody()
    data: {
      worldName: string;
      tabId: string;
      entryId: string;
      characterId: string;
    },
  ): { ok: boolean; entry?: any; desk: any[]; reason?: string } {
    const { worldName, tabId, entryId, characterId } = data ?? ({} as any);
    if (!worldName || !tabId || !entryId)
      return { ok: false, desk: [], reason: 'bad-request' };

    const read = this.readDesk(worldName);
    if (!read) return { ok: false, desk: [], reason: 'no-world' };

    const tabIdx = read.desk.findIndex((t: any) => t.tabId === tabId);
    if (tabIdx < 0) return { ok: false, desk: read.desk, reason: 'gone' };

    const tab = read.desk[tabIdx];
    // Ein zugedeckter Reiter gibt nichts heraus, auch wenn ein Client noch eine alte Liste hat.
    if (!tab.revealed) return { ok: false, desk: read.desk, reason: 'hidden' };

    const entries: any[] = Array.isArray(tab.entries) ? tab.entries : [];
    const entryIdx = entries.findIndex((e: any) => e.entryId === entryId);
    if (entryIdx < 0) return { ok: false, desk: read.desk, reason: 'gone' };

    const entry = entries[entryIdx];
    if (entry.hidden) return { ok: false, desk: read.desk, reason: 'hidden' };
    if (entry.claimedBy) return { ok: false, desk: read.desk, reason: 'gone' };

    // Der Eintrag bleibt als beansprucht stehen, statt zu verschwinden — so sieht der GM, wer
    // was genommen hat, und die Spieler sehen, dass der Pool abgearbeitet ist.
    const desk = [...read.desk];
    desk[tabIdx] = {
      ...tab,
      entries: entries.map((e: any, i: number) =>
        i === entryIdx ? { ...e, claimedBy: characterId || 'unbekannt' } : e,
      ),
    };
    this.commitDesk(worldName, desk);
    return { ok: true, entry, desk };
  }

  /** Aktueller Stand des Schreibtischs — beim Öffnen eines Bogens, vor der ersten Änderung. */
  @SubscribeMessage('gmDeskRead')
  handleDeskRead(@MessageBody() data: { worldName: string }): {
    ok: boolean;
    desk: any[];
  } {
    const read = data?.worldName ? this.readDesk(data.worldName) : null;
    return { ok: !!read, desk: read?.desk ?? [] };
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
    return {
      world,
      stash: Array.isArray(world.partyStash) ? world.partyStash : [],
    };
  }

  private commitStash(worldName: string, stash: any[]): void {
    this.dataService.applyPatchToWorld(worldName, {
      path: 'partyStash',
      value: stash,
    });
    this.server
      .to(worldName)
      .emit('worldPatched', { path: 'partyStash', value: stash });
  }

  /**
   * Put an item in. Idempotent: re-sending the same entryId (a retry) never duplicates it.
   *
   * Identical stackable items merge into one pile. What counts as "identical" is decided by the
   * client and sent along as `stackKey` — that rule lives in item-stack.util.ts, and duplicating
   * it here in a second language is exactly how the two would drift apart.
   */
  @SubscribeMessage('partyStashDeposit')
  handleStashDeposit(@MessageBody() data: { worldName: string; entry: any }): {
    ok: boolean;
    stash: any[];
    reason?: string;
  } {
    const { worldName, entry } = data ?? ({} as any);
    if (!worldName || !entry?.entryId)
      return { ok: false, stash: [], reason: 'bad-request' };

    const read = this.readStash(worldName);
    if (!read) return { ok: false, stash: [], reason: 'no-world' };

    if (read.stash.some((e: any) => e.entryId === entry.entryId)) {
      return { ok: true, stash: read.stash };
    }

    const amount = WorldGateway.amountOf(entry);
    const mergeIdx = entry.stackKey
      ? read.stash.findIndex(
          (e: any) => e.stackKey === entry.stackKey && e.item?.stackable,
        )
      : -1;

    let stash: any[];
    if (mergeIdx >= 0) {
      stash = [...read.stash];
      const target = stash[mergeIdx];
      stash[mergeIdx] = {
        ...target,
        item: {
          ...target.item,
          amount: WorldGateway.amountOf(target) + amount,
        },
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
    @MessageBody()
    data: {
      worldName: string;
      entryId: string;
      amount?: number;
    },
  ): { ok: boolean; entry?: any; stash: any[]; reason?: string } {
    const { worldName, entryId, amount } = data ?? ({} as any);
    if (!worldName || !entryId)
      return { ok: false, stash: [], reason: 'bad-request' };

    const read = this.readStash(worldName);
    if (!read) return { ok: false, stash: [], reason: 'no-world' };

    const idx = read.stash.findIndex((e: any) => e.entryId === entryId);
    if (idx < 0) return { ok: false, stash: read.stash, reason: 'gone' };

    const entry = read.stash[idx];
    const have = WorldGateway.amountOf(entry);
    const wanted =
      amount === undefined ? have : Math.max(0, Math.floor(amount));
    if (wanted <= 0)
      return { ok: false, stash: read.stash, reason: 'bad-request' };

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
  handleStashRead(@MessageBody() data: { worldName: string }): {
    ok: boolean;
    stash: any[];
  } {
    const read = data?.worldName ? this.readStash(data.worldName) : null;
    return { ok: !!read, stash: read?.stash ?? [] };
  }

  // Handle dice roll events - broadcast to all players in the world
  @SubscribeMessage('diceRoll')
  handleDiceRoll(
    @MessageBody()
    roll: {
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
    console.log(
      `[DICE ROLL] ${characterName} rolled in ${worldName}, isSecret: ${isSecret}`,
    );

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
