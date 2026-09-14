import { Injectable, inject, signal, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { LobbyApiService } from './lobby-api.service';
import { LobbySocketService } from './lobby-socket.service';
import { LobbyData, LobbyMap, Token } from '../model/lobby.model';
import { ItemBlock } from '../model/item-block.model';
import { Currency } from '../model/current-events.model';

/**
 * Ein Fenster von der GM-Ansicht in die Lobby.
 *
 * Die World-View kannte die Lobby bisher überhaupt nicht — sie sah NSCs nur, wenn jemand sie in
 * den Kampf-Tracker aufgenommen hatte, und NSCs, die bloß auf der Karte standen, waren unsichtbar.
 * Der GM-Schreibtisch braucht aber genau die: einen Reiter pro NSC der Karte, die der Spielleiter
 * gerade offen hat.
 *
 * Bewusst schlank gehalten und getrennt vom `LobbyStoreService`: Diese Ansicht liest Token und
 * schreibt deren Inventar, mehr nicht. Sie lädt nur den Karten-Index und die eine Karte.
 */
@Injectable({ providedIn: 'root' })
export class WorldLobbyBridgeService {
  private api = inject(LobbyApiService);
  private socket = inject(LobbySocketService);

  private mapId = signal('');
  private map = signal<LobbyMap | null>(null);
  private worldName = '';
  private subs: Subscription[] = [];
  private attached = false;

  /** Die Karte, die der Spielleiter in der Lobby offen hat. */
  readonly activeMap = this.map.asReadonly();

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

    const index = await this.api.loadLobby(worldName);
    if (!index) return;

    this.socket.connect();
    await this.socket.joinLobby(worldName);

    this.subs.push(this.socket.patches$.subscribe(patch => {
      if (!patch.mapId || patch.mapId === this.mapId()) this.applyPatch(patch.path, patch.value);
    }));
    // Der Spielleiter öffnet in der Lobby eine andere Karte — die Reiter wandern mit.
    this.subs.push(this.socket.indexChanged$.subscribe(changed => void this.follow(changed)));
    await this.follow(index);
  }

  detach(): void {
    for (const sub of this.subs) sub.unsubscribe();
    this.subs = [];
    this.map.set(null);
    this.mapId.set('');
    this.attached = false;
    this.worldName = '';
  }

  /** Das Inventar eines Tokens ersetzen. Geht als ganzes `tokens`-Array raus, wie in der Lobby. */
  setTokenInventory(tokenId: string, inventory: ItemBlock[]): void {
    this.updateToken(tokenId, t => ({ ...t, inventory }));
  }

  /** Die Cetris eines NSC-Tokens ersetzen; `undefined` leert den Beutel. */
  setTokenCurrency(tokenId: string, currency: Currency | undefined): void {
    this.updateToken(tokenId, t => ({ ...t, currency }));
  }

  /** Die Kennzeichnung eines Tokens setzen ("Kultist 2" → "Anführer"). */
  setTokenTag(tokenId: string, tag: string): void {
    this.updateToken(tokenId, t => ({ ...t, tag: tag.trim() || undefined }));
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

  private updateToken(tokenId: string, change: (token: Token) => Token): void {
    const map = this.map();
    if (!map) return;
    const tokens = map.tokens.map(t => (t.id === tokenId ? change(t) : t));
    // Optimistisch anwenden, damit der Reiter sofort stimmt; der Echo bestätigt es nur noch.
    this.writeTokens(tokens);
    this.socket.sendPatch(this.worldName, this.mapId(), { path: 'tokens', value: tokens });
  }

  /** Der Karte folgen, die der Spielleiter offen hat (sonst der Standardkarte). */
  private async follow(index: Partial<LobbyData>): Promise<void> {
    const target = index.gmMapId || index.activeMapId;
    if (!target || target === this.mapId()) return;
    this.mapId.set(target);
    await this.socket.joinMap(this.worldName, target);
    const map = await this.api.loadMap(this.worldName, target);
    if (this.mapId() === target) this.map.set(map);
  }

  /**
   * Nur der Pfad, der diese Ansicht angeht. Ein voller Patch-Walker wäre hier eine weitere Kopie
   * derselben Logik — und die Lobby schickt Token ohnehin immer als ganzes Array.
   */
  private applyPatch(rawPath: string, value: unknown): void {
    const path = rawPath.replace(/^\//, '').replace(/\//g, '.');
    if (path === 'tokens' && Array.isArray(value)) {
      this.writeTokens(value as Token[]);
    }
  }

  private writeTokens(tokens: Token[]): void {
    this.map.update(map => (map ? { ...map, tokens } : map));
  }
}
