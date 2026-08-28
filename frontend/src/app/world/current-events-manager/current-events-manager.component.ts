import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CurrentEvent,
  ShopEvent,
  Currency,
  formatCurrency,
  createEmptyShopEvent,
} from '../../model/current-events.model';
import { DeskEntry, DeskTab, GRANT_TYPE_ICON, GRANT_TYPE_LABEL } from '../../model/gm-desk.model';
import { PartyStashService } from '../../services/party-stash.service';
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
              <button (click)="createNewShop()">🏪 Neuer Shop</button>
              @if (libraryShops.length > 0) {
                <hr>
                <span class="menu-label">Aus Bibliothek:</span>
                @for (shop of libraryShops; track shop.id) {
                  <button (click)="addShopFromLibrary(shop)">🏪 {{ shop.name }}</button>
                }
              }
            </div>
          }
        </div>
      </div>

      @if (events.length === 0 && revealedTabs.length === 0) {
        <p class="empty-state">Keine aktiven Events. Events werden für alle Spieler in der Party sichtbar.</p>
      }

      <!-- Aufgedeckte Reiter des Schreibtischs: der gemeinsame Loot-Pool -->
      @for (tab of revealedTabs; track tab.tabId) {
        <div class="event-card loot revealed">
          <div class="event-header">
            <span class="event-icon">💰</span>
            <span class="event-name">{{ tab.name }}</span>
            <div class="event-actions-inline">
              <button class="icon-btn" (click)="toggleEventExpanded(tab.tabId)" title="Details">
                {{ expandedEvents.has(tab.tabId) ? '▼' : '▶' }}
              </button>
            </div>
          </div>

          @if (expandedEvents.has(tab.tabId)) {
            <div class="event-content">
              <div class="loot-items">
                @for (entry of tab.entries; track entry.entryId) {
                  @if (!entry.hidden) {
                    <div class="loot-item" [class.claimed]="entry.claimedBy">
                      <span class="loot-type-icon app-icon" [class]="typeIcon[entry.type]"></span>
                      <span class="loot-name">{{ deskEntryName(entry) }}</span>
                      @if (entry.claimedBy) {
                        <span class="claimed-by">Beansprucht</span>
                      }
                      <button
                        class="icon-btn delete"
                        (click)="deskEntryRemoved.emit({ tabId: tab.tabId, entryId: entry.entryId })"
                        title="Entfernen">✕</button>
                    </div>
                  }
                }
                @if (tab.entries.length === 0) {
                  <p class="event-description">Der Reiter ist leer.</p>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Beutel der Gruppe: server-autoritativ, dieselbe Ablage wie im Charakterbogen -->
      <div class="party-bag">
        <div class="party-bag-head">
          <span class="party-bag-icon app-icon i-item"></span>
          <span class="party-bag-title">Beutel der Gruppe</span>
          <span class="party-bag-count">{{ stash.entries().length }}</span>
          @if (stash.busy()) { <span class="party-bag-busy">…</span> }
        </div>

        @if (stash.notice(); as note) {
          <p class="party-bag-notice">{{ note }}</p>
        }

        @if (stash.entries().length === 0) {
          <p class="party-bag-empty">Leer — zieh etwas aus dem Schreibtisch hierher.</p>
        } @else {
          <div class="party-bag-list">
            @for (entry of stash.entries(); track entry.entryId) {
              <div class="party-bag-entry">
                <span class="party-bag-name">{{ entry.item.name }}</span>
                @if (entry.item.stackable && (entry.item.amount ?? 1) > 1) {
                  <span class="party-bag-amount">×{{ entry.item.amount }}</span>
                }
                @if (entry.fromName) {
                  <span class="party-bag-from">von {{ entry.fromName }}</span>
                }
                <button class="icon-btn delete" title="Aus dem Beutel nehmen"
                        [disabled]="stash.busy()" (click)="removeFromBag(entry.entryId)">✕</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="events-list"
           [class.drag-over]="isDraggingOverList"
           (dragover)="onDragOverEvents($event)"
           (dragleave)="onDragLeaveEvents($event)"
           (drop)="onDropEvent($event)">
        @for (event of events; track event.id) {
          <div class="event-card shop">
            <div class="event-header">
              <span class="event-icon">🏪</span>
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
                    <span class="app-icon i-folder"></span>
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
                <ng-container *ngTemplateOutlet="shopContent; context: { $implicit: asShop(event) }"></ng-container>
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
              <h4>Angebote ({{ shop.deals.length }})</h4>
            </div>
            
            @for (deal of shop.deals; track deal.id; let dealIdx = $index) {
              <div class="deal-card" [class.reverse]="deal.isReverseDeal" [class.sold-out]="deal.quantity !== undefined && deal.sold >= deal.quantity">
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
                <div class="deal-quick-actions">
                  <input 
                    type="number" 
                    [(ngModel)]="deal.discount" 
                    (change)="updateDealDiscount(shop.id, deal.id)"
                    min="0" 
                    max="100" 
                    placeholder="0"
                    class="discount-input"
                    title="Discount %"
                  />
                  <span class="discount-label">% Off</span>
                  <button class="icon-btn delete" (click)="removeDeal(shop.id, deal.id)" title="Entfernen">✕</button>
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

    /* ── Beutel der Gruppe ── */
    .party-bag {
      margin: 0 0 12px;
      padding: 8px 10px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    .party-bag-head {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 6px;
    }

    .party-bag-icon { width: 1em; height: 1em; background-color: var(--accent); }

    .party-bag-title {
      flex: 1;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text);
    }

    .party-bag-count,
    .party-bag-busy { font-size: 0.72rem; color: var(--text-muted, #9ca3af); }

    .party-bag-empty,
    .party-bag-notice {
      margin: 0;
      font-size: 0.76rem;
      font-style: italic;
      color: var(--text-muted, #9ca3af);
    }

    .party-bag-list { display: flex; flex-direction: column; gap: 4px; }

    .party-bag-entry {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 7px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 5px;
      font-size: 0.79rem;
    }

    .party-bag-name { flex: 1; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .party-bag-amount { font-weight: 600; color: var(--text-muted, #9ca3af); }
    .party-bag-from { font-size: 0.68rem; font-style: italic; color: var(--text-muted, #9ca3af); }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 100px;
      padding: 0.5rem;
      border: 2px dashed transparent;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .events-list.drag-over {
      border-color: var(--accent);
      background: rgba(107, 70, 193, 0.05);
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

    .deal-quick-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .discount-input {
      width: 50px;
      padding: 0.25rem;
      background: var(--bg-darker);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text);
      text-align: center;
    }

    .discount-label {
      font-size: 0.8rem;
      color: var(--muted);
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
  /** Aufgedeckte Reiter des GM-Schreibtischs — der gemeinsame Loot-Pool der Gruppe. */
  @Input() revealedTabs: DeskTab[] = [];

  @Output() eventsChange = new EventEmitter<CurrentEvent[]>();
  @Output() eventAdded = new EventEmitter<CurrentEvent>();
  @Output() eventRemoved = new EventEmitter<string>();
  @Output() eventUpdated = new EventEmitter<CurrentEvent>();
  @Output() navigateToLibrary = new EventEmitter<{ libraryId: string; tab: 'shops'; itemId: string }>();
  /** Der GM nimmt einen Eintrag aus einem aufgedeckten Reiter wieder heraus. */
  @Output() deskEntryRemoved = new EventEmitter<{ tabId: string; entryId: string }>();

  /** Derselbe server-autoritative Beutel wie im Charakterbogen — der GM sieht ihn jetzt auch. */
  readonly stash = inject(PartyStashService);

  showAddMenu = false;
  expandedEvents = new Set<string>();
  editingEventId: string | null = null;
  isDraggingOverList = false;

  /** Nimmt einen Eintrag endgültig aus dem Beutel (der Server gibt ihn genau einmal heraus). */
  async removeFromBag(entryId: string): Promise<void> {
    await this.stash.withdraw(entryId);
  }

  readonly typeIcon = GRANT_TYPE_ICON;
  readonly typeLabel = GRANT_TYPE_LABEL;

  // Get shops from linked libraries
  get libraryShops(): ShopEvent[] {
    return this.libraries.flatMap(lib => lib.shops || []);
  }

  formatCurrency = formatCurrency;

  /** Anzeigename eines Schreibtisch-Eintrags; Münzen werden als Betrag geschrieben. */
  deskEntryName(entry: DeskEntry): string {
    if (entry.type === 'currency') return formatCurrency(entry.data as Currency);
    return entry.name || 'Unbekannt';
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

  removeEvent(eventId: string) {
    this.eventRemoved.emit(eventId);
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

  updateDealDiscount(shopId: string, dealId: string) {
    const shop = this.events.find(e => e.id === shopId) as ShopEvent;
    if (shop) {
      this.eventUpdated.emit(shop);
    }
  }

  removeDeal(shopId: string, dealId: string) {
    const shop = this.events.find(e => e.id === shopId) as ShopEvent;
    if (shop) {
      shop.deals = shop.deals.filter(d => d.id !== dealId);
      this.eventUpdated.emit(shop);
    }
  }

  editInLibrary(event: CurrentEvent) {
    if (!event.sourceRef) return;

    this.navigateToLibrary.emit({
      libraryId: event.sourceRef.libraryId,
      tab: 'shops',
      itemId: event.sourceRef.itemId!
    });
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDragOverEvents(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    const type = event.dataTransfer!.types.includes('loottype');
    if (type) {
      this.isDraggingOverList = true;
    }
  }

  onDragLeaveEvents(event: DragEvent) {
    // Only reset if leaving the events-list itself (not child elements)
    const target = event.target as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    if (target === currentTarget) {
      this.isDraggingOverList = false;
    }
  }

  onDropEvent(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOverList = false;
    
    const type = event.dataTransfer!.getData('lootType');
    const index = parseInt(event.dataTransfer!.getData('lootIndex'));

    if (type === 'shop') {
      const shop = this.libraryShops[index];
      if (shop) this.addShopFromLibrary(shop);
    }
  }
}
