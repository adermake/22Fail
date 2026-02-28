import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CurrentEvent, 
  ShopEvent, 
  LootBundleEvent, 
  ShopDeal,
  LootItem,
  Currency,
  formatCurrency,
  createEmptyShopEvent,
  createEmptyLootBundleEvent,
  createEmptyShopDeal
} from '../../model/current-events.model';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { StatusEffect } from '../../model/status-effect.model';
import { Library } from '../../model/library.model';

@Component({
  selector: 'app-current-events-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="current-events-manager">
      <div class="events-header">
        <h3>🎪 Aktive Events</h3>
        <div class="event-actions">
          <button class="add-btn" (click)="showAddMenu = !showAddMenu">
            + Event hinzufügen
          </button>
          @if (showAddMenu) {
            <div class="add-menu">
              <button (click)="createNewLootBundle()">🎁 Neues Loot-Bündel</button>
              <button (click)="createNewShop()">🏪 Neuer Shop</button>
              @if (libraryShops.length > 0) {
                <hr>
                <span class="menu-label">Aus Bibliothek:</span>
                @for (shop of libraryShops; track shop.id) {
                  <button (click)="addShopFromLibrary(shop)">🏪 {{ shop.name }}</button>
                }
              }
              @if (libraryLootBundles.length > 0) {
                @for (bundle of libraryLootBundles; track bundle.id) {
                  <button (click)="addLootBundleFromLibrary(bundle)">🎁 {{ bundle.name }}</button>
                }
              }
            </div>
          }
        </div>
      </div>

      @if (events.length === 0) {
        <p class="empty-state">Keine aktiven Events. Events werden für alle Spieler in der Party sichtbar.</p>
      }

      <div class="events-list">
        @for (event of events; track event.id) {
          <div class="event-card" [class.shop]="event.type === 'shop'" [class.loot]="event.type === 'loot'">
            <div class="event-header">
              <span class="event-icon">{{ event.type === 'shop' ? '🏪' : '🎁' }}</span>
              @if (editingEventId === event.id) {
                <input 
                  type="text" 
                  [(ngModel)]="event.name" 
                  (blur)="stopEditingEvent()"
                  (keyup.enter)="stopEditingEvent()"
                  class="event-name-input"
                />
              } @else {
                <span class="event-name" (dblclick)="startEditingEvent(event.id)">{{ event.name }}</span>
              }
              <div class="event-actions-inline">
                @if (event.sourceRef) {
                  <button class="icon-btn library" (click)="editInLibrary(event)" title="In Bibliothek bearbeiten">
                    📚
                  </button>
                }
                <button class="icon-btn" (click)="toggleEventExpanded(event.id)" title="Details">
                  {{ expandedEvents.has(event.id) ? '▼' : '▶' }}
                </button>
                <button class="icon-btn delete" (click)="removeEvent(event.id)" title="Event entfernen">✕</button>
              </div>
            </div>

            @if (expandedEvents.has(event.id)) {
              <div class="event-content">
                @if (event.type === 'shop') {
                  <ng-container *ngTemplateOutlet="shopContent; context: { $implicit: asShop(event) }"></ng-container>
                } @else {
                  <ng-container *ngTemplateOutlet="lootContent; context: { $implicit: asLoot(event) }"></ng-container>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Shop Content Template -->
      <ng-template #shopContent let-shop>
        <div class="shop-content">
          <p class="event-description">{{ shop.description || 'Keine Beschreibung' }}</p>
          
          <div class="deals-section">
            <div class="deals-header">
              <h4>Angebote</h4>
              <button class="add-deal-btn" (click)="addDealToShop(shop)">+ Deal</button>
            </div>
            
            @for (deal of shop.deals; track deal.id; let dealIdx = $index) {
              <div class="deal-card" [class.editing]="editingDealId === deal.id" [class.reverse]="deal.isReverseDeal" [class.sold-out]="deal.quantity !== undefined && deal.sold >= deal.quantity">
                @if (editingDealId === deal.id) {
                  <!-- Deal Editor -->
                  <div class="deal-editor">
                    <div class="editor-row">
                      <label>Name:</label>
                      <input type="text" [(ngModel)]="deal.name" placeholder="Artikelname">
                    </div>
                    <div class="editor-row">
                      <label>Preis:</label>
                      <div class="currency-inputs">
                        <input type="number" [(ngModel)]="deal.price.platinum" min="0" placeholder="P" class="currency-input" title="Platin">
                        <input type="number" [(ngModel)]="deal.price.gold" min="0" placeholder="G" class="currency-input" title="Gold">
                        <input type="number" [(ngModel)]="deal.price.silver" min="0" placeholder="S" class="currency-input" title="Silber">
                        <input type="number" [(ngModel)]="deal.price.copper" min="0" placeholder="C" class="currency-input" title="Kupfer">
                      </div>
                    </div>
                    <div class="editor-row">
                      <label><input type="checkbox" [(ngModel)]="deal.isNegotiable"> Verhandelbar</label>
                      <label><input type="checkbox" [(ngModel)]="deal.isReverseDeal"> Ankauf (Shop kauft von Spieler)</label>
                    </div>
                    <div class="editor-row">
                      <label>Menge:</label>
                      <input type="number" [(ngModel)]="deal.quantity" min="1" placeholder="Unbegrenzt">
                      <small>(leer = unbegrenzt)</small>
                    </div>
                    <div class="editor-actions">
                      <button class="save-btn" (click)="saveDealEdit(shop)">💾 Speichern</button>
                      <button class="cancel-btn" (click)="cancelDealEdit()">✕ Abbrechen</button>
                    </div>
                  </div>
                } @else {
                  <!-- Deal Display -->
                  <div class="deal-info">
                    <span class="deal-name">{{ deal.name }}</span>
                    @if (deal.isNegotiable) {
                      <span class="deal-price negotiable">Verhandelbar</span>
                    } @else if (deal.price) {
                      <span class="deal-price">{{ formatCurrency(deal.price) }}</span>
                    }
                    @if (deal.quantity !== undefined) {
                      <span class="deal-stock">{{ deal.quantity - deal.sold }}/{{ deal.quantity }}</span>
                    }
                    @if (deal.isReverseDeal) {
                      <span class="deal-type reverse">⬅ Ankauf</span>
                    }
                  </div>
                  <div class="deal-actions">
                    <button class="icon-btn" (click)="editDeal(shop.id, deal)" title="Bearbeiten">✏️</button>
                    <button class="icon-btn delete" (click)="removeDeal(shop.id, deal.id)" title="Entfernen">✕</button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </ng-template>

      <!-- Loot Content Template -->
      <ng-template #lootContent let-loot>
        <div class="loot-content">
          <p class="event-description">{{ loot.description || 'Keine Beschreibung' }}</p>
          
          <div class="loot-items">
            @for (item of loot.items; track item.id) {
              <div class="loot-item" [class.claimed]="item.claimedBy">
                <span class="loot-type-icon">{{ getLootTypeIcon(item.type) }}</span>
                <span class="loot-name">{{ getLootName(item) }}</span>
                @if (item.claimedBy) {
                  <span class="claimed-by">Beansprucht</span>
                }
                <button class="icon-btn delete" (click)="removeLootItem(loot.id, item.id)" title="Entfernen">✕</button>
              </div>
            }
            
            <div class="add-loot-zone" 
                 (dragover)="onDragOver($event)" 
                 (drop)="onDropToLoot($event, loot.id)">
              Hierher ziehen oder 
              <button class="add-loot-btn" (click)="showAddLootMenu(loot.id)">+ Item</button>
              <button class="add-loot-btn" (click)="addCurrencyToLoot(loot.id)">+ Geld</button>
            </div>
            
            @if (addingLootToEventId === loot.id) {
              <div class="currency-loot-editor">
                <h5>Geld hinzufügen</h5>
                <div class="currency-inputs">
                  <label>Platin: <input type="number" [(ngModel)]="tempCurrency.platinum" min="0"></label>
                  <label>Gold: <input type="number" [(ngModel)]="tempCurrency.gold" min="0"></label>
                  <label>Silber: <input type="number" [(ngModel)]="tempCurrency.silver" min="0"></label>
                  <label>Kupfer: <input type="number" [(ngModel)]="tempCurrency.copper" min="0"></label>
                </div>
                <div class="editor-actions">
                  <button class="save-btn" (click)="saveCurrencyToLoot(loot.id)">💾 Hinzufügen</button>
                  <button class="cancel-btn" (click)="addingLootToEventId = null">✕ Abbrechen</button>
                </div>
              </div>
            }
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .current-events-manager {
      padding: 0.5rem;
    }

    .events-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      position: relative;
    }

    .events-header h3 {
      margin: 0;
      font-size: 1rem;
    }

    .add-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      z-index: 100;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .add-menu button {
      background: transparent;
      border: none;
      padding: 0.5rem;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
      color: var(--text);
    }

    .add-menu button:hover {
      background: var(--bg-hover);
    }

    .add-menu hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 0.25rem 0;
    }

    .menu-label {
      font-size: 0.75rem;
      color: var(--muted);
      padding: 0.25rem 0.5rem;
    }

    .empty-state {
      color: var(--muted);
      text-align: center;
      padding: 2rem;
      font-style: italic;
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .event-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .event-card.shop {
      border-left: 3px solid #4CAF50;
    }

    .event-card.loot {
      border-left: 3px solid #FF9800;
    }

    .event-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--bg-darker);
    }

    .event-icon {
      font-size: 1.25rem;
    }

    .event-name {
      flex: 1;
      font-weight: 600;
      cursor: pointer;
    }

    .event-name-input {
      flex: 1;
      background: var(--bg);
      border: 1px solid var(--accent);
      border-radius: 4px;
      padding: 0.25rem;
      color: var(--text);
    }

    .event-actions-inline {
      display: flex;
      gap: 0.25rem;
    }

    .icon-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: var(--text);
    }

    .icon-btn:hover {
      background: var(--bg-hover);
    }

    .icon-btn.delete:hover {
      background: #f44336;
      color: white;
    }

    .event-content {
      padding: 0.75rem;
    }

    .event-description {
      color: var(--muted);
      font-size: 0.85rem;
      margin: 0 0 0.75rem 0;
    }

    .deals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .deals-header h4 {
      margin: 0;
      font-size: 0.9rem;
    }

    .add-deal-btn {
      background: transparent;
      border: 1px solid var(--border);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      color: var(--text);
      font-size: 0.8rem;
    }

    .deal-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem;
      background: var(--bg);
      border-radius: 4px;
      margin-bottom: 0.25rem;
    }

    .deal-card.reverse {
      border-left: 2px solid #9C27B0;
    }

    .deal-card.sold-out {
      opacity: 0.5;
    }

    .deal-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .deal-name {
      font-weight: 500;
    }

    .deal-price {
      color: #FFD700;
      font-size: 0.85rem;
    }

    .deal-price.negotiable {
      color: #FF9800;
      font-style: italic;
    }

    .deal-stock {
      color: var(--muted);
      font-size: 0.8rem;
    }

    .deal-type.reverse {
      background: #9C27B0;
      color: white;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .loot-items {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .loot-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: var(--bg);
      border-radius: 4px;
    }

    .loot-item.claimed {
      opacity: 0.5;
      text-decoration: line-through;
    }

    .loot-type-icon {
      font-size: 1rem;
    }

    .loot-name {
      flex: 1;
    }

    .claimed-by {
      color: var(--muted);
      font-size: 0.8rem;
      font-style: italic;
    }

    .add-loot-zone {
      border: 2px dashed var(--border);
      border-radius: 4px;
      padding: 1rem;
      text-align: center;
      color: var(--muted);
      margin-top: 0.5rem;
    }

    .add-loot-zone:hover {
      border-color: var(--accent);
      background: rgba(var(--accent-rgb), 0.1);
    }

    .add-loot-btn {
      background: transparent;
      border: none;
      color: var(--accent);
      cursor: pointer;
      text-decoration: underline;
      margin: 0 0.25rem;
    }

    .deal-editor, .currency-loot-editor {
      background: var(--bg-darker);
      padding: 1rem;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .editor-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .editor-row label {
      min-width: 80px;
    }

    .editor-row input[type="text"],
    .editor-row input[type="number"] {
      flex: 1;
      padding: 0.4rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--bg-card);
      color: var(--text);
    }

    .currency-inputs {
      display: flex;
      gap: 0.5rem;
      flex: 1;
    }

    .currency-input {
      width: 60px;
      padding: 0.4rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--bg-card);
      color: var(--text);
      text-align: center;
    }

    .editor-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .save-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .cancel-btn {
      background: var(--bg-card);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .deal-card.editing {
      border-color: var(--accent);
    }

    .currency-loot-editor h5 {
      margin: 0 0 0.5rem 0;
    }
  `]
})
export class CurrentEventsManagerComponent {
  @Input() events: CurrentEvent[] = [];
  @Input() libraries: Library[] = [];
  @Input() mergedItems: ItemBlock[] = [];
  @Input() mergedRunes: RuneBlock[] = [];
  @Input() mergedSpells: SpellBlock[] = [];
  @Input() mergedSkills: SkillBlock[] = [];
  @Input() mergedStatusEffects: StatusEffect[] = [];
  
  @Output() eventsChange = new EventEmitter<CurrentEvent[]>();
  @Output() eventAdded = new EventEmitter<CurrentEvent>();
  @Output() eventRemoved = new EventEmitter<string>();
  @Output() eventUpdated = new EventEmitter<CurrentEvent>();
  @Output() navigateToLibrary = new EventEmitter<{ libraryId: string; tab: 'shops' | 'loot-bundles'; itemId: string }>();

  showAddMenu = false;
  expandedEvents = new Set<string>();
  editingEventId: string | null = null;
  editingDealId: string | null = null;
  addingLootToEventId: string | null = null;
  tempCurrency: Currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };

  // Get shops and loot bundles from linked libraries
  get libraryShops(): ShopEvent[] {
    return this.libraries.flatMap(lib => lib.shops || []);
  }

  get libraryLootBundles(): LootBundleEvent[] {
    return this.libraries.flatMap(lib => lib.lootBundles || []);
  }

  formatCurrency = formatCurrency;

  createNewLootBundle() {
    const bundle = createEmptyLootBundleEvent('Neues Loot-Bündel');
    this.eventAdded.emit(bundle);
    this.expandedEvents.add(bundle.id);
    this.showAddMenu = false;
  }

  createNewShop() {
    const shop = createEmptyShopEvent('Neuer Shop');
    this.eventAdded.emit(shop);
    this.expandedEvents.add(shop.id);
    this.showAddMenu = false;
  }

  addShopFromLibrary(shop: ShopEvent) {
    // Create a copy with new ID and track source library
    const sourceLibrary = this.libraries.find(lib => lib.shops.some(s => s.id === shop.id));
    const newShop: ShopEvent = {
      ...JSON.parse(JSON.stringify(shop)),
      id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      claimedDeals: {},
      sourceRef: sourceLibrary ? {
        libraryId: sourceLibrary.id,
        libraryName: sourceLibrary.name,
        itemId: shop.id
      } : undefined
    };
    this.eventAdded.emit(newShop);
    this.expandedEvents.add(newShop.id);
    this.showAddMenu = false;
  }

  addLootBundleFromLibrary(bundle: LootBundleEvent) {
    // Create a copy with new ID and reset claims, track source library
    const sourceLibrary = this.libraries.find(lib => lib.lootBundles.some(b => b.id === bundle.id));
    const newBundle: LootBundleEvent = {
      ...JSON.parse(JSON.stringify(bundle)),
      id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      items: bundle.items.map(item => ({
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        claimedBy: undefined
      })),
      sourceRef: sourceLibrary ? {
        libraryId: sourceLibrary.id,
        libraryName: sourceLibrary.name,
        itemId: bundle.id
      } : undefined
    };
    this.eventAdded.emit(newBundle);
    this.expandedEvents.add(newBundle.id);
    this.showAddMenu = false;
  }

  removeEvent(eventId: string) {
    if (confirm('Event wirklich entfernen?')) {
      this.eventRemoved.emit(eventId);
    }
  }

  toggleEventExpanded(eventId: string) {
    if (this.expandedEvents.has(eventId)) {
      this.expandedEvents.delete(eventId);
    } else {
      this.expandedEvents.add(eventId);
    }
  }

  startEditingEvent(eventId: string) {
    this.editingEventId = eventId;
  }

  stopEditingEvent() {
    if (this.editingEventId) {
      const event = this.events.find(e => e.id === this.editingEventId);
      if (event) {
        this.eventUpdated.emit(event);
      }
      this.editingEventId = null;
    }
  }

  asShop(event: CurrentEvent): ShopEvent {
    return event as ShopEvent;
  }

  asLoot(event: CurrentEvent): LootBundleEvent {
    return event as LootBundleEvent;
  }

  addDealToShop(shop: ShopEvent) {
    const deal = createEmptyShopDeal();
    shop.deals.push(deal);
    this.eventUpdated.emit(shop);
  }

  editDeal(shopId: string, deal: ShopDeal) {
    // Initialize price if it doesn't exist
    if (!deal.price) {
      deal.price = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    }
    this.editingDealId = deal.id;
  }

  saveDealEdit(shop: ShopEvent) {
    this.editingDealId = null;
    this.eventUpdated.emit(shop);
  }

  cancelDealEdit() {
    this.editingDealId = null;
  }

  removeDeal(shopId: string, dealId: string) {
    const shop = this.events.find(e => e.id === shopId) as ShopEvent;
    if (shop) {
      shop.deals = shop.deals.filter(d => d.id !== dealId);
      this.eventUpdated.emit(shop);
    }
  }

  getLootTypeIcon(type: string): string {
    switch (type) {
      case 'item': return '📦';
      case 'rune': return '🔮';
      case 'spell': return '✨';
      case 'skill': return '⚔️';
      case 'status-effect': return '💫';
      case 'currency': return '💰';
      default: return '❓';
    }
  }

  getLootName(item: LootItem): string {
    if (item.type === 'currency') {
      return formatCurrency(item.data as Currency);
    }
    return (item.data as any)?.name || 'Unbekannt';
  }

  removeLootItem(eventId: string, itemId: string) {
    const loot = this.events.find(e => e.id === eventId) as LootBundleEvent;
    if (loot) {
      loot.items = loot.items.filter(i => i.id !== itemId);
      this.eventUpdated.emit(loot);
    }
  }

  showAddLootMenu(eventId: string) {
    this.addingLootToEventId = eventId;
    // TODO: Open item picker dialog
  }

  addCurrencyToLoot(eventId: string) {
    this.addingLootToEventId = eventId;
    this.tempCurrency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  }

  saveCurrencyToLoot(eventId: string) {
    const loot = this.events.find(e => e.id === eventId) as LootBundleEvent;
    if (!loot) return;

    const currencyItem: LootItem = {
      id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'currency',
      data: { ...this.tempCurrency }
    };
    loot.items.push(currencyItem);
    this.addingLootToEventId = null;
    this.eventUpdated.emit(loot);
  }
  editInLibrary(event: CurrentEvent) {
    if (!event.sourceRef) return;
    
    const tab = event.type === 'shop' ? 'shops' : 'loot-bundles';
    this.navigateToLibrary.emit({
      libraryId: event.sourceRef.libraryId,
      tab,
      itemId: event.sourceRef.itemId!
    });
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDropToLoot(event: DragEvent, eventId: string) {
    event.preventDefault();
    const type = event.dataTransfer!.getData('lootType') as 'item' | 'rune' | 'spell' | 'skill';
    const index = parseInt(event.dataTransfer!.getData('lootIndex'));
    
    const loot = this.events.find(e => e.id === eventId) as LootBundleEvent;
    if (!loot) return;

    let data: any;
    switch (type) {
      case 'item': data = this.mergedItems[index]; break;
      case 'rune': data = this.mergedRunes[index]; break;
      case 'spell': data = this.mergedSpells[index]; break;
      case 'skill': data = this.mergedSkills[index]; break;
    }

    if (data) {
      const lootItem: LootItem = {
        id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        data: { ...data }
      };
      loot.items.push(lootItem);
      this.eventUpdated.emit(loot);
    }
  }
}
