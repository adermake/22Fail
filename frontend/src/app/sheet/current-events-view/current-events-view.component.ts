import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CurrentEvent, ShopEvent, ShopDeal,
  formatCurrency, convertToCopper, copperToCurrency, Currency
} from '../../model/current-events.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import {
  DeskEntry, DeskTab, GRANT_TYPE_ICON, GRANT_TYPE_LABEL,
} from '../../model/gm-desk.model';
import { goldValue, isUnidentified, kindLabel, previewText } from '../../utils/entry-preview.util';

export interface BuyItemEvent {
  eventId: string;
  dealIndex: number;
  quantity: number;
  totalCostCopper: number;
}

/** Ein Spieler will einen Eintrag aus einem freigegebenen Reiter nehmen. */
export interface ClaimLootEvent {
  tabId: string;
  entry: DeskEntry;
}

@Component({
  selector: 'app-current-events-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './current-events-view.component.html',
  styleUrls: ['./current-events-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentEventsViewComponent {
  @Input() events: CurrentEvent[] = [];
  @Input() sheet!: CharacterSheet;
  @Input() characterId: string = '';
  /** Vom Spielleiter freigegebene Reiter des GM-Schreibtischs. */
  @Input() set lootPools(value: DeskTab[]) { this.poolsSignal.set(value ?? []); }
  /** entryId, dessen Anfrage gerade beim Server liegt. */
  @Input() claiming: string | null = null;
  /** "Jemand war schneller …" — kommt vom Bogen, wenn der Server ablehnt. */
  @Input() claimNotice: string | null = null;

  @Output() buyRequest = new EventEmitter<BuyItemEvent>();
  @Output() claimRequest = new EventEmitter<ClaimLootEvent>();
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() openPortalEvent = new EventEmitter<string>();

  expandedEvents = new Set<string>();
  buyQuantities: Map<string, number> = new Map(); // key: eventId-dealIndex

  formatCurrency = formatCurrency;
  readonly typeIcon = GRANT_TYPE_ICON;
  readonly typeLabel = GRANT_TYPE_LABEL;
  readonly goldValue = goldValue;
  readonly isUnidentified = isUnidentified;
  readonly kindLabel = kindLabel;
  readonly previewText = previewText;

  /**
   * Die freigegebenen Reiter als Signal — das offene Fenster muss Änderungen mitbekommen,
   * sonst steht ein bereits genommener Gegenstand weiter darin.
   */
  private readonly poolsSignal = signal<DeskTab[]>([]);
  readonly lootPoolList = this.poolsSignal.asReadonly();

  /** Der Reiter, dessen Fenster gerade offen ist. */
  private readonly openPoolId = signal<string | null>(null);

  readonly openPool = computed<DeskTab | null>(() => {
    const id = this.openPoolId();
    return id ? this.poolsSignal().find(p => p.tabId === id) ?? null : null;
  });

  /** Was in diesem Pool noch zu haben ist: nichts Verstecktes, nichts bereits Genommenes. */
  openEntries(pool: DeskTab): DeskEntry[] {
    return (pool.entries ?? []).filter(e => !e.hidden && !e.claimedBy);
  }

  entryName(entry: DeskEntry): string {
    if (entry.type === 'currency') return formatCurrency(entry.data as Currency);
    return entry.name || 'Unbekannt';
  }

  claimEntry(pool: DeskTab, entry: DeskEntry): void {
    if (this.claiming) return;
    this.claimRequest.emit({ tabId: pool.tabId, entry });
  }

  toggleExpanded(eventId: string) {
    if (this.expandedEvents.has(eventId)) {
      this.expandedEvents.delete(eventId);
    } else {
      this.expandedEvents.add(eventId);
    }
  }

  openPortal(eventId: string) {
    this.openPortalEvent.emit(eventId);
  }

  showPool(tabId: string): void { this.openPoolId.set(tabId); }
  closePool(): void { this.openPoolId.set(null); }

  asShop(event: CurrentEvent): ShopEvent {
    return event as ShopEvent;
  }

  getBuyQuantity(eventId: string, dealIndex: number): number {
    return this.buyQuantities.get(`${eventId}-${dealIndex}`) || 1;
  }

  setBuyQuantity(eventId: string, dealIndex: number, quantity: number) {
    this.buyQuantities.set(`${eventId}-${dealIndex}`, Math.max(1, quantity || 1));
  }

  getMaxBuyable(deal: ShopDeal): number {
    if (deal.quantity === undefined) {
      return 99;
    }
    return deal.quantity - deal.sold;
  }

  formatTotalCost(deal: ShopDeal, quantity: number): string {
    if (!deal.price) return 'Verhandelbar';
    const totalCopper = convertToCopper(deal.price) * quantity;
    return formatCurrency(copperToCurrency(totalCopper));
  }

  canAfford(deal: ShopDeal, quantity: number): boolean {
    if (!deal.price) return false; // Can't buy negotiable items with fixed button
    const totalCostCopper = convertToCopper(deal.price) * quantity;
    const playerCopper = this.getPlayerTotalCopper();
    return playerCopper >= totalCostCopper;
  }

  getPlayerTotalCopper(): number {
    if (!this.sheet?.currency) return 0;
    const c = this.sheet.currency;
    return (c.copper || 0) + 
           (c.silver || 0) * 10 + 
           (c.gold || 0) * 100 + 
           (c.platinum || 0) * 1000;
  }

  buyItem(eventId: string, dealIndex: number, deal: ShopDeal) {
    if (!deal.price) return; // Can't auto-buy negotiable items

    const quantity = this.getBuyQuantity(eventId, dealIndex);
    const totalCostCopper = convertToCopper(deal.price) * quantity;

    if (deal.isReverseDeal) {
      // Reverse deal: Player sells TO shop, gets money
      this.addMoney(totalCostCopper);
      // TODO: Remove item from player inventory (requires item selection UI)
    } else {
      // Normal deal: Player buys FROM shop, pays money
      this.deductMoney(totalCostCopper);
      // Add item to inventory based on what the deal provides
      this.addItemToInventory(deal, quantity);
    }

    // Emit buy request for backend to handle
    this.buyRequest.emit({
      eventId,
      dealIndex,
      quantity,
      totalCostCopper
    });

    // Reset quantity
    this.buyQuantities.delete(`${eventId}-${dealIndex}`);
  }

  private deductMoney(copperAmount: number) {
    const currency = { ...(this.sheet.currency || { copper: 0, silver: 0, gold: 0, platinum: 0 }) };

    // Convert all to copper for simplicity
    let totalCopper = (currency.copper || 0) + 
                      (currency.silver || 0) * 10 + 
                      (currency.gold || 0) * 100 + 
                      (currency.platinum || 0) * 1000;
    
    totalCopper -= copperAmount;
    if (totalCopper < 0) totalCopper = 0;

    // Convert back
    const newCurrency = copperToCurrency(totalCopper);

    this.patch.emit({
      path: '/currency',
      value: newCurrency
    } as any);
  }

  private addMoney(copperAmount: number) {
    const currency = { ...(this.sheet.currency || { copper: 0, silver: 0, gold: 0, platinum: 0 }) };

    // Convert all to copper for simplicity
    let totalCopper = (currency.copper || 0) + 
                      (currency.silver || 0) * 10 + 
                      (currency.gold || 0) * 100 + 
                      (currency.platinum || 0) * 1000;
    
    totalCopper += copperAmount;

    // Convert back
    const newCurrency = copperToCurrency(totalCopper);

    this.patch.emit({
      path: '/currency',
      value: newCurrency
    } as any);
  }

  private addItemToInventory(deal: ShopDeal, quantity: number) {
    // Add items based on what the deal provides
    for (let i = 0; i < quantity; i++) {
      if (deal.item) {
        this.patch.emit({
          path: '/inventory/-',
          value: { ...deal.item }
        } as any);
      }
      if (deal.rune) {
        this.patch.emit({
          path: '/runes/-',
          value: { ...deal.rune }
        } as any);
      }
      if (deal.spell) {
        this.patch.emit({
          path: '/spells/-',
          value: { ...deal.spell }
        } as any);
      }
      if (deal.skill) {
        this.patch.emit({
          path: '/skills/-',
          value: { ...deal.skill }
        } as any);
      }
      if (deal.statusEffect) {
        // Add to active status effects
        this.patch.emit({
          path: '/activeStatusEffects/-',
          value: { ...deal.statusEffect }
        } as any);
      }
    }
  }
}
