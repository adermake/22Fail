import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CurrentEvent, ShopEvent, LootBundleEvent, ShopDeal, LootItem as EventLootItem, 
  formatCurrency, convertToCopper, copperToCurrency, Currency 
} from '../../model/current-events.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';

export interface BuyItemEvent {
  eventId: string;
  dealIndex: number;
  quantity: number;
  totalCostCopper: number;
}

export interface ClaimLootEvent {
  eventId: string;
  itemIndex: number;
  characterId: string;
  characterName: string;
}

@Component({
  selector: 'app-current-events-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="events-view-container">
      @if (events.length === 0) {
        <div class="no-events">
          <span class="no-events-icon">📜</span>
          <p>Keine aktuellen Ereignisse</p>
          <p class="hint">Der Spielleiter kann Shops und Loot-Bündel aktivieren</p>
        </div>
      }

      @for (event of events; track event.id) {
        <div class="event-card" [class.shop]="event.type === 'shop'" [class.loot]="event.type === 'loot'">
          <div class="event-header" (click)="toggleExpanded(event.id)">
            <span class="event-icon">{{ event.type === 'shop' ? '🏪' : '💰' }}</span>
            <span class="event-name">{{ event.name }}</span>
            <span class="expand-icon">{{ expandedEvents.has(event.id) ? '▼' : '▶' }}</span>
          </div>

          @if (expandedEvents.has(event.id)) {
            @if (event.description) {
              <p class="event-description">{{ event.description }}</p>
            }

            @if (event.type === 'shop') {
              <div class="shop-content">
                @if (asShop(event).deals.length === 0) {
                  <p class="empty-hint">Dieser Shop hat keine Angebote</p>
                }
                @for (deal of asShop(event).deals; track deal.id; let i = $index) {
                  <div class="deal-card" [class.sold-out]="deal.quantity !== undefined && deal.sold >= deal.quantity">
                    <div class="deal-info">
                      <span class="deal-name">{{ deal.name }}</span>
                      @if (deal.quantity !== undefined) {
                        <span class="deal-stock">
                          Bestand: {{ deal.quantity - deal.sold }}/{{ deal.quantity }}
                        </span>
                      }
                    </div>
                    <div class="deal-price">
                      @if (deal.price) {
                        <span class="price">{{ formatCurrency(deal.price) }}</span>
                      } @else {
                        <span class="price negotiable-text">Verhandelbar</span>
                      }
                      @if (deal.isNegotiable && deal.price) {
                        <span class="negotiable-badge" title="Verhandelbar">🤝</span>
                      }
                    </div>
                    <div class="deal-actions">
                      <input type="number" 
                             [value]="getBuyQuantity(event.id, i)"
                             (input)="setBuyQuantity(event.id, i, $any($event.target).valueAsNumber)"
                             min="1" 
                             [max]="getMaxBuyable(deal)" 
                             class="quantity-input">
                      <button class="buy-btn" 
                              (click)="buyItem(event.id, i, deal)"
                              [disabled]="!deal.price || !canAfford(deal, getBuyQuantity(event.id, i)) || (deal.quantity !== undefined && deal.sold >= deal.quantity)">
                        @if (deal.price) {
                          Kaufen ({{ formatTotalCost(deal, getBuyQuantity(event.id, i)) }})
                        } @else {
                          Verhandeln
                        }
                      </button>
                    </div>
                    @if (deal.price && !canAfford(deal, getBuyQuantity(event.id, i))) {
                      <div class="not-enough-gold">Nicht genug Gold!</div>
                    }
                  </div>
                }
              </div>
            }

            @if (event.type === 'loot') {
              <div class="loot-content">
                @if (asLootBundle(event).items.length === 0) {
                  <p class="empty-hint">Dieses Bündel ist leer</p>
                }
                @for (item of asLootBundle(event).items; track item.id; let i = $index) {
                  <div class="loot-item" [class.claimed]="item.claimedBy">
                    <div class="loot-info">
                      <span class="loot-name">{{ getItemName(item) }}</span>
                      <span class="loot-type">({{ item.type }})</span>
                    </div>
                    @if (item.claimedBy) {
                      <div class="claimed-by">
                        <span>Beansprucht</span>
                      </div>
                    } @else {
                      <button class="claim-btn" (click)="claimItem(event.id, i)">
                        Beanspruchen
                      </button>
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .events-view-container {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .no-events {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }
    
    .no-events-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }
    
    .no-events p {
      margin: 8px 0;
    }
    
    .no-events .hint {
      font-size: 12px;
      color: #666;
    }

    .event-card {
      background: #2a2a2a;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .event-card.shop {
      border-left: 3px solid #4CAF50;
    }
    
    .event-card.loot {
      border-left: 3px solid #FFC107;
    }

    .event-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      cursor: pointer;
      background: rgba(255,255,255,0.05);
    }
    
    .event-header:hover {
      background: rgba(255,255,255,0.1);
    }
    
    .event-icon {
      font-size: 20px;
    }
    
    .event-name {
      flex: 1;
      font-weight: 500;
    }
    
    .expand-icon {
      color: #888;
      font-size: 12px;
    }

    .event-description {
      padding: 8px 12px;
      color: #aaa;
      font-size: 13px;
      border-bottom: 1px solid #333;
      margin: 0;
    }

    .shop-content, .loot-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .empty-hint {
      color: #777;
      font-style: italic;
      text-align: center;
      margin: 12px 0;
    }

    .deal-card {
      background: #1e1e1e;
      border-radius: 6px;
      padding: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    
    .deal-card.sold-out {
      opacity: 0.5;
    }

    .deal-info {
      flex: 1;
      min-width: 150px;
    }
    
    .deal-name {
      font-weight: 500;
      color: #fff;
    }
    
    .deal-stock {
      display: block;
      font-size: 11px;
      color: #888;
      margin-top: 2px;
    }

    .deal-price {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .price {
      color: #FFD700;
      font-weight: 500;
    }
    
    .negotiable-text {
      color: #aaa;
      font-style: italic;
    }
    
    .negotiable-badge {
      cursor: help;
    }

    .deal-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .quantity-input {
      width: 60px;
      padding: 6px 8px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #333;
      color: #fff;
      text-align: center;
    }
    
    .buy-btn {
      padding: 6px 12px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .buy-btn:hover:not(:disabled) {
      background: #45a049;
    }
    
    .buy-btn:disabled {
      background: #555;
      color: #888;
      cursor: not-allowed;
    }

    .not-enough-gold {
      width: 100%;
      color: #f44336;
      font-size: 12px;
      text-align: right;
    }

    .loot-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e1e1e;
      border-radius: 6px;
      padding: 10px 12px;
    }
    
    .loot-item.claimed {
      opacity: 0.6;
    }

    .loot-info {
      flex: 1;
    }
    
    .loot-name {
      font-weight: 500;
      color: #fff;
    }
    
    .loot-type {
      color: #888;
      font-size: 12px;
      margin-left: 4px;
    }

    .claimed-by {
      color: #888;
      font-size: 12px;
      font-style: italic;
    }

    .claim-btn {
      padding: 6px 12px;
      background: #FFC107;
      color: #000;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
    }
    
    .claim-btn:hover {
      background: #ffb300;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentEventsViewComponent {
  @Input() events: CurrentEvent[] = [];
  @Input() sheet!: CharacterSheet;
  @Input() characterId: string = '';

  @Output() buyRequest = new EventEmitter<BuyItemEvent>();
  @Output() claimRequest = new EventEmitter<ClaimLootEvent>();
  @Output() patch = new EventEmitter<JsonPatch>();

  expandedEvents = new Set<string>();
  buyQuantities: Map<string, number> = new Map(); // key: eventId-dealIndex

  formatCurrency = formatCurrency;

  toggleExpanded(eventId: string) {
    if (this.expandedEvents.has(eventId)) {
      this.expandedEvents.delete(eventId);
    } else {
      this.expandedEvents.add(eventId);
    }
  }

  asShop(event: CurrentEvent): ShopEvent {
    return event as ShopEvent;
  }

  asLootBundle(event: CurrentEvent): LootBundleEvent {
    return event as LootBundleEvent;
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

  getItemName(item: EventLootItem): string {
    // Try to get name from data based on type
    const data = item.data as any;
    if (data && data.name) return data.name;
    if (item.type === 'currency') {
      const currency = item.data as Currency;
      return formatCurrency(currency);
    }
    return 'Item';
  }

  buyItem(eventId: string, dealIndex: number, deal: ShopDeal) {
    if (!deal.price) return; // Can't auto-buy negotiable items

    const quantity = this.getBuyQuantity(eventId, dealIndex);
    const totalCostCopper = convertToCopper(deal.price) * quantity;

    // Deduct money from player
    this.deductMoney(totalCostCopper);

    // Emit buy request for backend to handle
    this.buyRequest.emit({
      eventId,
      dealIndex,
      quantity,
      totalCostCopper
    });

    // Add item to inventory based on what the deal provides
    this.addItemToInventory(deal, quantity);

    // Reset quantity
    this.buyQuantities.delete(`${eventId}-${dealIndex}`);
  }

  claimItem(eventId: string, itemIndex: number) {
    const characterName = (this.sheet as any)?.name || (this.sheet as any)?.bio?.name || 'Unbekannt';
    
    this.claimRequest.emit({
      eventId,
      itemIndex,
      characterId: this.characterId,
      characterName
    });
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
