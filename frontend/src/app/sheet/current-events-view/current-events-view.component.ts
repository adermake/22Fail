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
  templateUrl: './current-events-view.component.html',
  styleUrls: ['./current-events-view.component.css'],
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
