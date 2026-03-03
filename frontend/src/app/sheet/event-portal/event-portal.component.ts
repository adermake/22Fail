import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrentEvent, ShopEvent, LootBundleEvent, ShopDeal, LootItem, formatCurrency, convertToCopper, Currency } from '../../model/current-events.model';
import { CharacterSheet } from '../../model/character-sheet-model';

@Component({
  selector: 'app-event-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (event) {
      <div class="portal-overlay">
        <div class="portal-background" [class.shop-theme]="event.type === 'shop'" [class.loot-theme]="event.type === 'loot'">
          <div class="portal-content" (click)="$event.stopPropagation()">
            
            <!-- Portal Header -->
            <div class="portal-header">
              <div class="portal-title">
                <span class="portal-icon">{{ event.type === 'shop' ? '🏪' : '💰' }}</span>
                <h1>{{ event.name }}</h1>
              </div>
              <button class="portal-close" (click)="close.emit()" title="Portal verlassen">
                ✕
              </button>
            </div>

            @if (event.description) {
              <p class="portal-description">{{ event.description }}</p>
            }

            <!-- Shop Portal -->
            @if (event.type === 'shop') {
              <div class="shop-portal-content">
                @if (asShop(event).deals.length === 0) {
                  <div class="empty-portal">
                    <span class="empty-icon">🏚️</span>
                    <p>Dieser Shop ist momentan geschlossen</p>
                  </div>
                } @else {
                  <div class="deals-grid">
                    @for (deal of asShop(event).deals; track deal.id; let i = $index) {
                      <div class="deal-portal-card" 
                           [class.sold-out]="deal.quantity !== undefined && deal.sold >= deal.quantity"
                           [class.reverse-deal]="deal.isReverseDeal">
                        <div class="deal-header-portal">
                          <h3>
                            @if (deal.isReverseDeal) {
                              <span class="reverse-icon" title="Shop kauft an">⬅️</span>
                            }
                            {{ deal.name }}
                          </h3>
                          @if (deal.quantity !== undefined) {
                            <span class="deal-stock-badge">
                              {{ deal.quantity - deal.sold }}/{{ deal.quantity }}
                            </span>
                          }
                        </div>

                        @if (deal.description || deal.isReverseDeal) {
                          <p class="deal-description-portal">{{ deal.description || 'Der Shop kauft diesen Gegenstand an' }}</p>
                        }

                        <div class="deal-footer">
                          <div class="deal-price-large">
                            @if (deal.price) {
                              <span class="price-label">Preis:</span>
                              <span class="price-value">{{ formatCurrency(deal.price) }}</span>
                              @if (deal.isNegotiable) {
                                <span class="negotiable-badge" title="Verhandelbar">🤝</span>
                              }
                            } @else {
                              <span class="price-value negotiable-text">Verhandelbar</span>
                            }
                          </div>

                          <div class="deal-actions-portal">
                            <input type="number" 
                                   [value]="getBuyQuantity(event.id, i)"
                                   (input)="setBuyQuantity(event.id, i, $any($event.target).valueAsNumber)"
                                   min="1" 
                                   [max]="getMaxBuyable(deal)" 
                                   class="quantity-input-portal">
                            <button class="buy-btn-portal" 
                                    (click)="buyItem(event.id, i, deal)"
                                    [disabled]="!deal.price || !canAfford(deal, getBuyQuantity(event.id, i)) || (deal.quantity !== undefined && deal.sold >= deal.quantity)">
                              @if (deal.isReverseDeal) {
                                @if (deal.price) {
                                  <span class="btn-text">Verkaufen</span>
                                  <span class="btn-price">{{ formatTotalCost(deal, getBuyQuantity(event.id, i)) }}</span>
                                } @else {
                                  <span class="btn-text">Anbieten</span>
                                }
                              } @else {
                                @if (deal.price) {
                                  <span class="btn-text">Kaufen</span>
                                  <span class="btn-price">{{ formatTotalCost(deal, getBuyQuantity(event.id, i)) }}</span>
                                } @else {
                                  <span class="btn-text">Verhandeln</span>
                                }
                              }
                            </button>
                          </div>

                          @if (deal.price && !canAfford(deal, getBuyQuantity(event.id, i))) {
                            <div class="not-enough-gold-portal">
                              <span>⚠️</span> Nicht genug Gold!
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Loot Bundle Portal -->
            @if (event.type === 'loot') {
              <div class="loot-portal-content">
                @if (asLootBundle(event).items.length === 0) {
                  <div class="empty-portal">
                    <span class="empty-icon">📦</span>
                    <p>Dieses Bündel wurde geleert</p>
                  </div>
                } @else {
                  <div class="loot-grid">
                    @for (item of asLootBundle(event).items; track item.id; let i = $index) {
                      <div class="loot-portal-card" [class.claimed]="item.claimedBy">
                        <div class="loot-item-type">{{ item.type }}</div>
                        <h3 class="loot-item-name">{{ getItemName(item) }}</h3>
                        
                        @if (item.claimedBy) {
                          <div class="claimed-badge">
                            <span>✓ Beansprucht</span>
                          </div>
                        } @else {
                          <button class="claim-btn-portal" (click)="claimItem(event.id, i)">
                            <span>🎁</span>
                            <span>Beanspruchen</span>
                          </button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Portal Overlay */
    .portal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Portal Background (different themes) */
    .portal-background {
      position: relative;
      width: 95vw;
      height: 95vh;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
      animation: portalOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes portalOpen {
      from {
        transform: scale(0.3) rotate(-10deg);
        opacity: 0;
      }
      to {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    .portal-background.shop-theme {
      background: 
        radial-gradient(ellipse at 20% 80%, rgba(139, 69, 19, 0.4), transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(218, 165, 32, 0.3), transparent 50%),
        linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #3a2418 100%);
    }

    .portal-background.loot-theme {
      background: 
        radial-gradient(ellipse at 30% 70%, rgba(255, 215, 0, 0.2), transparent 60%),
        radial-gradient(ellipse at 70% 30%, rgba(255, 140, 0, 0.2), transparent 60%),
        linear-gradient(135deg, #0a0a1a 0%, #1a1020 50%, #2a1530 100%);
    }

    /* Animated background particles */
    .portal-background::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.3), transparent),
        radial-gradient(2px 2px at 60% 70%, rgba(255, 255, 255, 0.2), transparent),
        radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.2), transparent),
        radial-gradient(1px 1px at 80% 10%, rgba(255, 255, 255, 0.3), transparent),
        radial-gradient(2px 2px at 90% 60%, rgba(255, 255, 255, 0.2), transparent);
      background-size: 200% 200%;
      animation: sparkle 10s infinite;
      pointer-events: none;
    }

    @keyframes sparkle {
      0%, 100% {
        opacity: 0.5;
        background-position: 0% 0%;
      }
      50% {
        opacity: 1;
        background-position: 100% 100%;
      }
    }

    /* Portal Content */
    .portal-content {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 3rem;
      overflow-y: auto;
      z-index: 1;
    }

    /* Portal Header */
    .portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }

    .portal-title {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .portal-icon {
      font-size: 4rem;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .portal-title h1 {
      margin: 0;
      font-size: 3rem;
      color: #fff;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    }

    .portal-close {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .portal-close:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }

    .portal-description {
      text-align: center;
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 2rem;
      font-style: italic;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    /* Shop Portal Content */
    .shop-portal-content {
      animation: slideInUp 0.5s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .deals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      padding: 1rem;
    }

    .deal-portal-card {
      background: rgba(30, 20, 10, 0.8);
      border: 2px solid rgba(218, 165, 32, 0.4);
      border-radius: 15px;
      padding: 2rem;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    }

    .deal-portal-card:hover {
      transform: translateY(-5px);
      border-color: rgba(218, 165, 32, 0.8);
      box-shadow: 0 8px 25px rgba(218, 165, 32, 0.3);
    }

    .deal-portal-card.sold-out {
      opacity: 0.5;
      filter: grayscale(0.7);
    }

    .deal-portal-card.reverse-deal {
      border-color: rgba(76, 175, 80, 0.4);
    }

    .deal-portal-card.reverse-deal:hover {
      border-color: rgba(76, 175, 80, 0.8);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
    }

    .deal-header-portal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .deal-header-portal h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .reverse-icon {
      font-size: 1.2rem;
    }

    .deal-stock-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.9rem;
      color: #fff;
    }

    .deal-description-portal {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .deal-footer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .deal-price-large {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 1.3rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
    }

    .price-label {
      color: rgba(255, 255, 255, 0.7);
    }

    .price-value {
      color: #ffd700;
      font-weight: bold;
      font-size: 1.5rem;
    }

    .negotiable-text {
      color: #4caf50;
      font-style: italic;
    }

    .negotiable-badge {
      font-size: 1.2rem;
    }

    .deal-actions-portal {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .quantity-input-portal {
      width: 80px;
      padding: 0.8rem;
      font-size: 1.2rem;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: white;
      text-align: center;
    }

    .buy-btn-portal {
      flex: 1;
      padding: 1rem 2rem;
      font-size: 1.2rem;
      font-weight: bold;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #1a0f0a;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }

    .buy-btn-portal:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
    }

    .buy-btn-portal:disabled {
      background: rgba(100, 100, 100, 0.3);
      color: rgba(255, 255, 255, 0.4);
      cursor: not-allowed;
      box-shadow: none;
    }

    .deal-portal-card.reverse-deal .buy-btn-portal {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
      color: white;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
    }

    .deal-portal-card.reverse-deal .buy-btn-portal:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
    }

    .btn-text {
      font-size: 1.2rem;
    }

    .btn-price {
      font-size: 1rem;
      opacity: 0.9;
    }

    .not-enough-gold-portal {
      text-align: center;
      color: #ff6b6b;
      font-weight: bold;
      font-size: 1.1rem;
      padding: 0.5rem;
      background: rgba(255, 0, 0, 0.1);
      border-radius: 8px;
    }

    /* Loot Portal Content */
    .loot-portal-content {
      animation: slideInUp 0.5s ease-out;
    }

    .loot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
      padding: 1rem;
    }

    .loot-portal-card {
      background: rgba(20, 10, 30, 0.8);
      border: 2px solid rgba(255, 215, 0, 0.4);
      border-radius: 15px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      position: relative;
    }

    .loot-portal-card:hover:not(.claimed) {
      transform: translateY(-5px) scale(1.02);
      border-color: rgba(255, 215, 0, 0.8);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
    }

    .loot-portal-card.claimed {
      opacity: 0.6;
      filter: grayscale(0.5);
      border-color: rgba(100, 100, 100, 0.4);
    }

    .loot-portal-card::before {
      content: '✨';
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 2rem;
      animation: twinkle 2s infinite;
    }

    .loot-portal-card.claimed::before {
      content: '✓';
      color: #4caf50;
      animation: none;
    }

    @keyframes twinkle {
      0%, 100% {
        opacity: 0.3;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
    }

    .loot-item-type {
      background: rgba(138, 43, 226, 0.6);
      color: white;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .loot-item-name {
      margin: 0;
      font-size: 1.5rem;
      color: #fff;
      text-align: center;
    }

    .claimed-badge {
      background: rgba(76, 175, 80, 0.3);
      border: 2px solid #4caf50;
      color: #4caf50;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .claim-btn-portal {
      width: 100%;
      padding: 1rem 2rem;
      font-size: 1.3rem;
      font-weight: bold;
      background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
    }

    .claim-btn-portal:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
    }

    /* Empty Portal */
    .empty-portal {
      text-align: center;
      padding: 4rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .empty-icon {
      font-size: 5rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    .empty-portal p {
      font-size: 1.5rem;
      margin: 0;
    }

    /* Scrollbar styling */
    .portal-content::-webkit-scrollbar {
      width: 12px;
    }

    .portal-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
    }

    .portal-content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
    }

    .portal-content::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `],
  changeDetection: ChangeDetectionStrategy.Default
})
export class EventPortalComponent {
  @Input() event: CurrentEvent | null = null;
  @Input() sheet!: CharacterSheet;
  @Output() close = new EventEmitter<void>();
  @Output() buyRequest = new EventEmitter<{ eventId: string; dealIndex: number; quantity: number; totalCostCopper: number }>();
  @Output() claimRequest = new EventEmitter<{ eventId: string; itemIndex: number; characterId: string; characterName: string }>();

  // Buy quantities per deal
  buyQuantities = new Map<string, number>();

  formatCurrency = formatCurrency;

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
    if (quantity < 1) quantity = 1;
    this.buyQuantities.set(`${eventId}-${dealIndex}`, quantity);
  }

  getMaxBuyable(deal: ShopDeal): number {
    if (deal.quantity === undefined) return 999;
    return Math.max(0, deal.quantity - deal.sold);
  }

  canAfford(deal: ShopDeal, quantity: number): boolean {
    if (!deal.price) return true; // Negotiable items can always be attempted
    if (deal.isReverseDeal) return true; // Selling always affordable
    
    const totalCost = convertToCopper(deal.price) * quantity;
    const currentCopper = convertToCopper(this.sheet.currency || { copper: 0, silver: 0, gold: 0, platinum: 0 });
    return currentCopper >= totalCost;
  }

  formatTotalCost(deal: ShopDeal, quantity: number): string {
    if (!deal.price) return '';
    const totalCopper = convertToCopper(deal.price) * quantity;
    return formatCurrency({ copper: totalCopper, silver: 0, gold: 0, platinum: 0 });
  }

  buyItem(eventId: string, dealIndex: number, deal: ShopDeal) {
    if (!deal.price) return;

    const quantity = this.getBuyQuantity(eventId, dealIndex);
    const totalCostCopper = convertToCopper(deal.price) * quantity;

    this.buyRequest.emit({
      eventId,
      dealIndex,
      quantity,
      totalCostCopper
    });

    this.buyQuantities.delete(`${eventId}-${dealIndex}`);
  }

  claimItem(eventId: string, itemIndex: number) {
    const characterId = this.sheet.id || '';
    const characterName = this.sheet.name || 'Unbekannt';

    this.claimRequest.emit({
      eventId,
      itemIndex,
      characterId,
      characterName
    });
  }

  getItemName(item: LootItem): string {
    const data = item.data as any;
    return data?.name || 'Unbekannter Gegenstand';
  }
}
