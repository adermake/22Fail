import { Injectable, inject, signal, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { LobbyApiService } from './lobby-api.service';
import { LobbySocketService } from './lobby-socket.service';
import { LobbyData, LobbyMap, Token } from '../model/lobby.model';
import { ItemBlock } from '../model/item-block.model';

/**
 * Ein Fenster von der GM-Ansicht in die Lobby.
 *
 * Die World-View kannte die Lobby bisher überhaupt nicht — sie sah NSCs nur, wenn jemand sie in
 * den Kampf-Tracker aufgenommen hatte, und NSCs, die bloß auf der Karte standen, waren unsichtbar.
 * Der GM-Schreibtisch braucht aber genau die: einen Reiter pro NSC der **aktiven** Karte.
 *
 * Bewusst schlank gehalten und getrennt vom `LobbyStoreService`: Diese Ansicht liest Token und
 * schreibt deren Inventar, mehr nicht — sie braucht weder Zeichen-Ebenen noch Nebel noch die
 * Bild-Bibliothek.
 */
@Injectable({ providedIn: 'root' })
export class WorldLobbyBridgeService {
  private api = inject(LobbyApiService);
  private socket = inject(LobbySocketService);

  private lobby = signal<LobbyData | null>(null);
  private worldName = '';
  private subs: Subscription[] = [];
  private attached = false;

  /** Die gerade in der Lobby angezeigte Karte. */
  readonly activeMap = computed<LobbyMap | null>(() => {
    const data = this.lobby();
    if (!data) return null;
    return data.maps[data.activeMapId] ?? null;
  });

  /** Alle Token der aktiven Karte. */
  readonly tokens = computed<Token[]>(() => this.activeMap()?.tokens ?? []);

  /**
   * Die Token, die ein eigenes Inventar führen können: entweder ein echter Charakter oder ein
   * NSC aus einem Statblock. Rein improvisierte Schnell-Token haben keine Datenbasis und
   * bekommen deshalb auch keinen Reiter.
   */
  readonly inventoryTokens = computed<Token[]>(() =>
    this.tokens().filter(t => !!t.statblockId || (!!t.characterId && !t.isQuickToken)),
  );

  /** Nur die NSCs — Spielercharaktere haben ihren eigenen Bogen. */
  readonly npcTokens = computed<Token[]>(() => this.tokens().filter(t => !!t.statblockId));

  async attach(worldName: string): Promise<void> {
    if (this.attached && this.worldName === worldName) return;
    this.detach();
    this.worldName = worldName;
    this.attached = true;

    const data = await this.api.loadLobby(worldName);
    if (!data) return;
    this.lobby.set(data);

    this.socket.connect();
    await this.socket.joinLobby(worldName);
    await this.socket.joinMap(worldName, data.activeMapId);

    this.subs.push(this.socket.patches$.subscribe(patch => this.applyPatch(patch.path, patch.value)));
    // Der Spielleiter wechselt in der Lobby die Karte — die Reiter müssen mitwandern.
    this.subs.push(this.socket.mainViewChanged$.subscribe(({ mapId }) => {
      void this.switchMap(mapId);
    }));
  }

  detach(): void {
    for (const sub of this.subs) sub.unsubscribe();
    this.subs = [];
    this.lobby.set(null);
    this.attached = false;
    this.worldName = '';
  }

  /** Das Inventar eines Tokens ersetzen. Geht als ganzes `tokens`-Array raus, wie in der Lobby. */
  setTokenInventory(tokenId: string, inventory: ItemBlock[]): void {
    const map = this.activeMap();
    const data = this.lobby();
    if (!map || !data) return;

    const tokens = map.tokens.map(t => (t.id === tokenId ? { ...t, inventory } : t));
    // Optimistisch anwenden, damit der Reiter sofort stimmt; der Echo bestätigt es nur noch.
    this.writeTokens(tokens);
    this.socket.sendPatch(this.worldName, data.activeMapId, { path: 'tokens', value: tokens });
  }

  /** Einen Gegenstand an das Inventar eines Tokens anhängen. */
  addToTokenInventory(tokenId: string, item: ItemBlock): void {
    const token = this.tokens().find(t => t.id === tokenId);
    if (!token) return;
    this.setTokenInventory(tokenId, [...(token.inventory ?? []), item]);
  }

  removeFromTokenInventory(tokenId: string, index: number): void {
    const token = this.tokens().find(t => t.id === tokenId);
    if (!token) return;
    const rest = [...(token.inventory ?? [])];
    rest.splice(index, 1);
    this.setTokenInventory(tokenId, rest);
  }

  private async switchMap(mapId: string): Promise<void> {
    const data = this.lobby();
    if (!data || data.activeMapId === mapId) return;
    this.lobby.set({ ...data, activeMapId: mapId });
    await this.socket.joinMap(this.worldName, mapId);
  }

  /**
   * Nur die zwei Pfade, die diese Ansicht angehen. Ein voller Patch-Walker wäre hier eine vierte
   * Kopie derselben Logik — und die Lobby schickt Token ohnehin immer als ganzes Array.
   */
  private applyPatch(rawPath: string, value: unknown): void {
    const path = rawPath.replace(/^\//, '').replace(/\//g, '.');
    if (path === 'tokens' && Array.isArray(value)) {
      this.writeTokens(value as Token[]);
    } else if (path === 'activeMapId' && typeof value === 'string') {
      void this.switchMap(value);
    }
  }

  private writeTokens(tokens: Token[]): void {
    const data = this.lobby();
    const map = this.activeMap();
    if (!data || !map) return;
    this.lobby.set({
      ...data,
      maps: { ...data.maps, [data.activeMapId]: { ...map, tokens } },
    });
  }
}
