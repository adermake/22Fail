import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrentEvent, ShopEvent, LootBundleEvent, ShopDeal, LootItem, formatCurrency, getCoinParts, CoinPart, formatCurrencyAsGold, convertToCopper, copperToCurrency, Currency } from '../../model/current-events.model';
import { CharacterSheet } from '../../model/character-sheet-model';

type PriceMode = 'highest-units' | 'total-gold';

@Component({
  selector: 'app-event-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (event) {
      <div class="portal-overlay">
        <!-- Close button OUTSIDE portal-background so it is never clipped -->
        <button class="portal-close-fixed" (click)="close.emit()" title="Portal verlassen">âœ•</button>

        <div class="portal-background" [class.shop-theme]="event.type === 'shop'" [class.loot-theme]="event.type === 'loot'">
          <div class="portal-content">

            <!-- Portal Header -->
            <div class="portal-header">
              <div class="portal-title">
                <span class="portal-icon">{{ event.type === 'shop' ? 'ðŸª' : 'ðŸ’°' }}</span>
                <h1>{{ event.name }}</h1>
              </div>

              @if (event.type === 'shop') {
                <div class="portal-header-controls">
                  <button class="mode-toggle-btn" (click)="togglePriceMode()" [title]="priceMode === 'highest-units' ? 'Zu Gesamtgold wechseln' : 'Zu Einheiten wechseln'">
                    @if (priceMode === 'highest-units') { 3S 2K } @else { 0.32g }
                  </button>
                  <div class="player-currency-bar">
                    @for (coin of getPlayerCoinParts(); track coin.type) {
                      <span class="coin-amount" [style.color]="coin.color">
                        <span class="coin-dot" [style.color]="coin.color">â—</span>
                        {{ coin.amount }}
                      </span>
                    }
                    <span class="currency-gold-ref">({{ getPlayerTotalAsGold() }}g)</span>
                  </div>
                </div>
              }
            </div>

            @if (event.description) {
              <p class="portal-description">{{ event.description }}</p>
            }

            <!-- Shop Portal -->
            @if (event.type === 'shop') {
              <div class="shop-portal-content">
                @if (asShop(event).deals.length === 0) {
                  <div class="empty-portal">
                    <span class="empty-icon">ðŸšï¸</span>
                    <p>Dieser Shop hat momentan keine Angebote</p>
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
                              <span class="reverse-icon" title="Shop kauft an">â¬…ï¸</span>
                            }
                            {{ deal.name }}
                          </h3>
                          @if (deal.quantity !== undefined) {
                            <span class="deal-stock-badge">{{ deal.quantity - deal.sold }}/{{ deal.quantity }}</span>
                          }
                        </div>

                        @if (deal.description) {
                          <p class="deal-description-portal">
                            @if (deal.identified === false) {
                              <em class="unknown-effect">Unbekannter Effekt</em>
                            } @else {
                              {{ deal.description }}
                            }
                          </p>
                        }

                        @if (deal.item || deal.rune || deal.spell || deal.skill) {
                          <button class="inspect-btn" (click)="inspectDeal(deal)">ðŸ” Details ansehen</button>
                        }

                        <div class="deal-footer">
                          <div class="deal-price-large">
                            @if (deal.price) {
                              <div class="coin-display">
                                @for (coin of getPriceCoinParts(deal); track coin.type) {
                                  <span class="coin-pill" [style.border-color]="coin.color">
                                    <span class="coin-circle" [style.background]="coin.color"></span>
                                    <span class="coin-val">{{ coin.amount }}</span>
                                  </span>
                                }
                              </div>
                              @if (priceMode === 'total-gold') {
                                <span class="price-gold-ref">({{ formatAsGold(deal.price) }})</span>
                              }
                              @if (deal.isNegotiable) {
                                <span class="negotiable-badge" title="Verhandelbar">ðŸ¤</span>
                              }
                            } @else {
                              <span class="price-negotiable">Verhandelbar</span>
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
                                @if (deal.price) { <span class="btn-text">Verkaufen</span> } @else { <span class="btn-text">Anbieten</span> }
                              } @else {
                                @if (deal.price) { <span class="btn-text">Kaufen</span> } @else { <span class="btn-text">Verhandeln</span> }
                              }
                            </button>
                          </div>

                          @if (deal.price && !deal.isReverseDeal && !canAfford(deal, getBuyQuantity(event.id, i))) {
                            <div class="not-enough-gold-portal">âš ï¸ Nicht genug Geld!</div>
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
                    <span class="empty-icon">ðŸ“¦</span>
                    <p>Dieses BÃ¼ndel wurde geleert</p>
                  </div>
                } @else {
                  <div class="loot-grid">
                    @for (item of asLootBundle(event).items; track item.id; let i = $index) {
                      <div class="loot-portal-card" [class.claimed]="item.claimedBy">
                        <div class="loot-item-type">{{ item.type }}</div>
                        <h3 class="loot-item-name">{{ getItemName(item) }}</h3>

                        @if (item.claimedBy) {
                          <div class="claimed-badge">âœ“ Beansprucht</div>
                        } @else {
                          <button class="claim-btn-portal" (click)="claimItem(event.id, i)">
                            Beanspruchen
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

      <!-- Item Inspection Modal -->
      @if (inspectedDeal) {
        <div class="inspect-overlay" (click)="closeInspect()">
          <div class="inspect-modal" (click)="$event.stopPropagation()">
            <div class="inspect-header">
              <h2>{{ inspectedDeal.name }}</h2>
              <button class="inspect-close" (click)="closeInspect()">âœ•</button>
            </div>
            <div class="inspect-body">
              @if (inspectedDeal.identified === false) {
                <div class="unknown-item-info">
                  <span class="unknown-icon">â“</span>
                  <p>Dieser Gegenstand ist nicht identifiziert.</p>
                  <p class="unknown-sub">Eigenschaften und Effekte sind unbekannt.</p>
                </div>
              } @else {
                @if (inspectedDeal.description) {
                  <p class="inspect-description">{{ inspectedDeal.description }}</p>
                }
                @if (inspectedDeal.item) {
                  <div class="item-detail-grid">
                    @if (inspectedDeal.item.weight !== undefined) {
                      <div class="detail-row"><span class="detail-label">Gewicht:</span><span>{{ inspectedDeal.item.weight }}</span></div>
                    }
                    @if (inspectedDeal.item.itemType) {
                      <div class="detail-row"><span class="detail-label">Typ:</span><span>{{ inspectedDeal.item.itemType }}</span></div>
                    }
                    @if (inspectedDeal.item.efficiency !== undefined) {
                      <div class="detail-row"><span class="detail-label">Effizienz:</span><span>{{ inspectedDeal.item.efficiency }}</span></div>
                    }
                    @if (inspectedDeal.item.stability !== undefined) {
                      <div class="detail-row"><span class="detail-label">Stabilität:</span><span>{{ inspectedDeal.item.stability }}</span></div>
                    }
                    @if (inspectedDeal.item.primaryEffect) {
                      <div class="detail-full"><p>{{ inspectedDeal.item.primaryEffect }}</p></div>
                    }
                    @if (inspectedDeal.item.description) {
                      <div class="detail-full"><p>{{ inspectedDeal.item.description }}</p></div>
                    }
                  </div>
                }
                @if (inspectedDeal.spell) {
                  <div class="item-detail-grid">
                    @if (inspectedDeal.spell.tags && inspectedDeal.spell.tags.length > 0) {
                      <div class="detail-row"><span class="detail-label">Tags:</span><span>{{ inspectedDeal.spell.tags.join(', ') }}</span></div>
                    }
                    @if (inspectedDeal.spell.description) {
                      <div class="detail-full"><p>{{ inspectedDeal.spell.description }}</p></div>
                    }
                  </div>
                }
                @if (inspectedDeal.rune) {
                  <div class="item-detail-grid">
                    @if (inspectedDeal.rune.description) {
                      <div class="detail-full"><p>{{ inspectedDeal.rune.description }}</p></div>
                    }
                  </div>
                }
                @if (inspectedDeal.skill) {
                  <div class="item-detail-grid">
                    @if (inspectedDeal.skill.description) {
                      <div class="detail-full"><p>{{ inspectedDeal.skill.description }}</p></div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .portal-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      background: rgba(0,0,0,0.5);
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

    /* Close button fixed top-right, outside portal background so it is never clipped */
    .portal-close-fixed {
      position: fixed;
      top: 18px;
      right: 22px;
      z-index: 20100;
      background: rgba(25, 20, 35, 0.95);
      border: 2px solid rgba(255,255,255,0.25);
      color: white;
      font-size: 1.3rem;
      width: 46px; height: 46px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.25s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    }
    .portal-close-fixed:hover {
      background: rgba(200, 40, 40, 0.9);
      transform: rotate(90deg);
      border-color: rgba(255,80,80,0.5);
    }

    .portal-background {
      position: relative;
      width: 95vw;
      height: 95vh;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
      animation: portalOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes portalOpen {
      from { transform: scale(0.3) rotate(-10deg); opacity:0; }
      to { transform: scale(1) rotate(0deg); opacity:1; }
    }
    .portal-background.shop-theme {
      background:
        radial-gradient(ellipse at 20% 80%, rgba(139,69,19,0.4), transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(218,165,32,0.3), transparent 50%),
        linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #3a2418 100%);
    }
    .portal-background.loot-theme {
      background:
        radial-gradient(ellipse at 30% 70%, rgba(255,215,0,0.2), transparent 60%),
        radial-gradient(ellipse at 70% 30%, rgba(255,140,0,0.2), transparent 60%),
        linear-gradient(135deg, #0a0a1a 0%, #1a1020 50%, #2a1530 100%);
    }
    .portal-background::before {
      content: '';
      position: absolute;
      top:0; left:0; width:100%; height:100%;
      background-image:
        radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.3), transparent),
        radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.3), transparent);
      background-size: 200% 200%;
      animation: sparkle 10s infinite;
      pointer-events: none;
    }
    @keyframes sparkle {
      0%,100% { opacity:0.5; background-position:0% 0%; }
      50% { opacity:1; background-position:100% 100%; }
    }

    .portal-content {
      position: relative;
      width: 100%; height: 100%;
      padding: 2.5rem 3rem;
      overflow-y: auto;
      z-index: 1;
    }
    .portal-content::-webkit-scrollbar { width: 10px; }
    .portal-content::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius:10px; }
    .portal-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius:10px; }
    .portal-content::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

    /* Header */
    .portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1.2rem;
      border-bottom: 2px solid rgba(255,255,255,0.15);
      gap: 1rem;
      flex-wrap: wrap;
    }
    .portal-title { display: flex; align-items: center; gap: 1.2rem; }
    .portal-icon {
      font-size: 3.5rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    .portal-title h1 { margin:0; font-size:2.5rem; color:#fff; text-shadow: 0 2px 10px rgba(0,0,0,0.7); }

    /* Header controls - price toggle + currency */
    .portal-header-controls { display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap; }
    .mode-toggle-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.3);
      color: rgba(255,255,255,0.85);
      padding: 0.4rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-family: monospace;
      transition: all 0.2s;
    }
    .mode-toggle-btn:hover { background: rgba(255,255,255,0.2); }
    .player-currency-bar {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(0,0,0,0.3);
      padding: 0.4rem 0.9rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .coin-amount { display:flex; align-items:center; gap:0.25rem; font-weight:bold; font-size:0.95rem; }
    .coin-dot { font-size:0.65rem; line-height:1; }
    .currency-gold-ref { color:rgba(255,255,255,0.45); font-size:0.8rem; margin-left:0.2rem; }

    .portal-description {
      text-align: center;
      font-size: 1.2rem;
      color: rgba(255,255,255,0.9);
      margin-bottom: 1.5rem;
      font-style: italic;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    /* Shop */
    .shop-portal-content { animation: slideInUp 0.5s ease-out; }
    @keyframes slideInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }

    .deals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.8rem;
      padding: 0.5rem;
    }
    .deal-portal-card {
      background: rgba(30,20,10,0.8);
      border: 2px solid rgba(218,165,32,0.4);
      border-radius: 14px;
      padding: 1.6rem;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .deal-portal-card:hover { transform:translateY(-4px); border-color:rgba(218,165,32,0.8); box-shadow:0 8px 25px rgba(218,165,32,0.3); }
    .deal-portal-card.sold-out { opacity:0.5; filter:grayscale(0.7); }
    .deal-portal-card.reverse-deal { border-color:rgba(76,175,80,0.4); }
    .deal-portal-card.reverse-deal:hover { border-color:rgba(76,175,80,0.8); box-shadow:0 8px 25px rgba(76,175,80,0.3); }

    .deal-header-portal { display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; }
    .deal-header-portal h3 { margin:0; font-size:1.4rem; color:#fff; display:flex; align-items:center; gap:0.4rem; }
    .reverse-icon { font-size:1.1rem; }
    .deal-stock-badge { background:rgba(255,255,255,0.18); padding:0.25rem 0.7rem; border-radius:18px; font-size:0.85rem; color:#fff; white-space:nowrap; }

    .deal-description-portal { color:rgba(255,255,255,0.75); font-size:0.95rem; margin:0; line-height:1.4; }
    .unknown-effect { color:#777; font-size:0.85rem; }

    .inspect-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.7);
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      text-align: left;
      transition: all 0.2s;
      align-self: flex-start;
    }
    .inspect-btn:hover { background:rgba(255,255,255,0.15); color:white; }

    /* Coin display */
    .deal-footer { display:flex; flex-direction:column; gap:0.7rem; margin-top:auto; }
    .deal-price-large {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
      padding: 0.7rem 0.9rem;
      background: rgba(0,0,0,0.3);
      border-radius: 9px;
    }
    .coin-display { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; }
    .coin-pill {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      border: 1.5px solid;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
    }
    .coin-circle { width:10px; height:10px; border-radius:50%; display:inline-block; }
    .coin-val { color:white; }
    .price-gold-ref { color:rgba(255,255,255,0.5); font-size:0.8rem; }
    .price-negotiable { color:#4caf50; font-style:italic; font-size:0.9rem; }
    .negotiable-badge { font-size:1.1rem; }

    .deal-actions-portal { display:flex; gap:0.8rem; align-items:center; }
    .quantity-input-portal {
      width: 72px; padding: 0.75rem;
      font-size: 1.1rem;
      background: rgba(0,0,0,0.5);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 8px;
      color: white; text-align: center;
    }
    .buy-btn-portal {
      flex: 1; padding: 0.9rem 1.5rem;
      font-size: 1.1rem; font-weight: bold;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #1a0f0a; border: none; border-radius: 10px;
      cursor: pointer; transition: all 0.3s;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 15px rgba(255,215,0,0.4);
    }
    .buy-btn-portal:hover:not(:disabled) { transform:scale(1.05); box-shadow:0 6px 20px rgba(255,215,0,0.6); }
    .buy-btn-portal:disabled { background:rgba(100,100,100,0.3); color:rgba(255,255,255,0.4); cursor:not-allowed; box-shadow:none; }
    .deal-portal-card.reverse-deal .buy-btn-portal {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
      color: white;
      box-shadow: 0 4px 15px rgba(76,175,80,0.4);
    }
    .deal-portal-card.reverse-deal .buy-btn-portal:hover:not(:disabled) { box-shadow:0 6px 20px rgba(76,175,80,0.6); }
    .btn-text { font-size:1.1rem; }
    .not-enough-gold-portal {
      text-align:center; color:#ff6b6b; font-weight:bold; font-size:1rem;
      padding:0.4rem; background:rgba(255,0,0,0.1); border-radius:7px;
    }

    /* Loot */
    .loot-portal-content { animation: slideInUp 0.5s ease-out; }
    .loot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 1.8rem; padding: 0.5rem;
    }
    .loot-portal-card {
      background: rgba(20,10,30,0.8);
      border: 2px solid rgba(255,215,0,0.4);
      border-radius: 14px; padding: 1.8rem;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      position: relative;
    }
    .loot-portal-card:hover:not(.claimed) { transform:translateY(-5px) scale(1.02); border-color:rgba(255,215,0,0.8); box-shadow:0 8px 25px rgba(255,215,0,0.3); }
    .loot-portal-card.claimed { opacity:0.6; filter:grayscale(0.5); border-color:rgba(100,100,100,0.4); }
    .loot-portal-card::before {
      content:'âœ¨'; position:absolute; top:10px; right:10px;
      font-size:1.8rem; animation: twinkle 2s infinite;
    }
    .loot-portal-card.claimed::before { content:'âœ“'; color:#4caf50; animation:none; }
    @keyframes twinkle { 0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:1;transform:scale(1.2);} }
    .loot-item-type { background:rgba(138,43,226,0.6); color:white; padding:0.35rem 0.9rem; border-radius:18px; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; }
    .loot-item-name { margin:0; font-size:1.4rem; color:#fff; text-align:center; }
    .claimed-badge { background:rgba(76,175,80,0.3); border:2px solid #4caf50; color:#4caf50; padding:0.7rem 1.3rem; border-radius:10px; font-weight:bold; font-size:1rem; }
    .claim-btn-portal {
      width: 100%; padding: 0.9rem 1.5rem;
      font-size: 1.2rem; font-weight: bold;
      background: linear-gradient(135deg, #2e7d32, #43a047);
      color: white; border: none; border-radius: 10px;
      cursor: pointer; transition: all 0.3s;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 15px rgba(46,125,50,0.4);
    }
    .claim-btn-portal:hover { transform:scale(1.07); box-shadow:0 6px 20px rgba(46,125,50,0.6); }

    /* Empty */
    .empty-portal { text-align:center; padding:4rem; color:rgba(255,255,255,0.6); }
    .empty-icon { font-size:4rem; display:block; margin-bottom:1rem; opacity:0.6; }
    .empty-portal p { font-size:1.4rem; margin:0; }

    /* Item inspection modal */
    .inspect-overlay {
      position: fixed; inset: 0; z-index: 25000;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(5px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }
    .inspect-modal {
      background: linear-gradient(135deg, #1a1520 0%, #201a2e 100%);
      border: 2px solid rgba(107,70,193,0.5);
      border-radius: 14px; padding: 2rem;
      max-width: 540px; width: 90%; max-height: 78vh; overflow-y: auto;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7);
      animation: inspectOpen 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes inspectOpen { from { transform:scale(0.6); opacity:0; } to { transform:scale(1); opacity:1; } }
    .inspect-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.3rem; padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.15); }
    .inspect-header h2 { margin:0; color:#fff; font-size:1.5rem; }
    .inspect-close { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.25); color:white; font-size:1.2rem; width:36px; height:36px; border-radius:50%; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; }
    .inspect-close:hover { background:rgba(200,40,40,0.8); transform:rotate(90deg); }
    .inspect-description { color:rgba(255,255,255,0.85); line-height:1.6; margin-bottom:1rem; }
    .item-detail-grid { display:flex; flex-direction:column; gap:0.45rem; }
    .detail-row { display:flex; gap:0.8rem; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.8); }
    .detail-label { color:rgba(255,255,255,0.45); min-width:100px; font-size:0.9rem; }
    .detail-full { padding:0.6rem 0; color:rgba(255,255,255,0.75); line-height:1.5; }
    .unknown-item-info { text-align:center; padding:2rem; color:rgba(255,255,255,0.6); }
    .unknown-icon { font-size:3rem; display:block; margin-bottom:1rem; }
    .unknown-sub { font-size:0.85rem; color:rgba(255,255,255,0.4); margin-top:0.5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.Default
})
export class EventPortalComponent implements OnInit {
  @Input() event: CurrentEvent | null = null;
  @Input() sheet!: CharacterSheet;
  @Output() close = new EventEmitter<void>();
  @Output() patch = new EventEmitter<any>();
  @Output() buyRequest = new EventEmitter<{ eventId: string; dealIndex: number; quantity: number; totalCostCopper: number }>();
  @Output() claimRequest = new EventEmitter<{ eventId: string; itemIndex: number; characterId: string; characterName: string }>();

  buyQuantities = new Map<string, number>();
  inspectedDeal: ShopDeal | null = null;
  priceMode: PriceMode = 'highest-units';

  ngOnInit() {
    const stored = localStorage.getItem('priceDisplayMode');
    if (stored === 'total-gold' || stored === 'highest-units') {
      this.priceMode = stored;
    }
  }

  togglePriceMode() {
    this.priceMode = this.priceMode === 'highest-units' ? 'total-gold' : 'highest-units';
    localStorage.setItem('priceDisplayMode', this.priceMode);
  }

  formatAsGold(currency: Currency): string {
    return formatCurrencyAsGold(currency);
  }

  getPriceCoinParts(deal: ShopDeal): CoinPart[] {
    if (!deal.price) return [];
    return getCoinParts(deal.price);
  }

  getPlayerCoinParts(): CoinPart[] {
    if (!this.sheet?.currency) return [];
    const c = this.sheet.currency;
    const parts: CoinPart[] = [];
    if (c.platinum > 0) parts.push({ amount: c.platinum, type: 'platinum', color: '#6ab2e5', symbol: 'â—' });
    if (c.gold > 0) parts.push({ amount: c.gold, type: 'gold', color: '#ffd700', symbol: 'â—' });
    if (c.silver > 0) parts.push({ amount: c.silver, type: 'silver', color: '#c0c0c0', symbol: 'â—' });
    if (c.copper > 0) parts.push({ amount: c.copper, type: 'copper', color: '#b87333', symbol: 'â—' });
    if (parts.length === 0) parts.push({ amount: 0, type: 'copper', color: '#b87333', symbol: 'â—' });
    return parts;
  }

  getPlayerTotalAsGold(): string {
    if (!this.sheet?.currency) return '0';
    const totalCopper = convertToCopper(this.sheet.currency);
    const gold = totalCopper / 100;
    return gold % 1 === 0 ? `${gold}` : gold.toFixed(2);
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
    if (quantity < 1) quantity = 1;
    this.buyQuantities.set(`${eventId}-${dealIndex}`, quantity);
  }

  getMaxBuyable(deal: ShopDeal): number {
    if (deal.quantity === undefined) return 999;
    return Math.max(0, deal.quantity - deal.sold);
  }

  canAfford(deal: ShopDeal, quantity: number): boolean {
    if (!deal.price) return true;
    if (deal.isReverseDeal) return true;
    const totalCost = convertToCopper(deal.price) * quantity;
    const currentCopper = convertToCopper(this.sheet?.currency || { copper: 0, silver: 0, gold: 0, platinum: 0 });
    return currentCopper >= totalCost;
  }

  buyItem(eventId: string, dealIndex: number, deal: ShopDeal) {
    if (!deal.price) return;

    const quantity = this.getBuyQuantity(eventId, dealIndex);
    const totalCostCopper = convertToCopper(deal.price) * quantity;

    if (deal.isReverseDeal) {
      this.addMoney(totalCostCopper);
    } else {
      this.deductMoney(totalCostCopper);
      this.addItemToInventory(deal, quantity);
    }

    this.buyRequest.emit({ eventId, dealIndex, quantity, totalCostCopper });
    this.buyQuantities.delete(`${eventId}-${dealIndex}`);
  }

  claimItem(eventId: string, itemIndex: number) {
    const characterId = this.sheet.id || '';
    const characterName = this.sheet.name || 'Unbekannt';
    this.claimRequest.emit({ eventId, itemIndex, characterId, characterName });
  }

  getItemName(item: LootItem): string {
    const data = item.data as any;
    return data?.name || 'Unbekannter Gegenstand';
  }

  inspectDeal(deal: ShopDeal) {
    this.inspectedDeal = deal;
  }

  closeInspect() {
    this.inspectedDeal = null;
  }

  private deductMoney(copperAmount: number) {
    const currency = { ...(this.sheet?.currency || { copper: 0, silver: 0, gold: 0, platinum: 0 }) };
    let totalCopper = Math.max(0, convertToCopper(currency) - copperAmount);
    this.patch.emit({ path: '/currency', value: copperToCurrency(totalCopper) });
  }

  private addMoney(copperAmount: number) {
    const currency = { ...(this.sheet?.currency || { copper: 0, silver: 0, gold: 0, platinum: 0 }) };
    let totalCopper = convertToCopper(currency) + copperAmount;
    this.patch.emit({ path: '/currency', value: copperToCurrency(totalCopper) });
  }

  private addItemToInventory(deal: ShopDeal, quantity: number) {
    for (let i = 0; i < quantity; i++) {
      if (deal.item) {
        this.patch.emit({ path: '/inventory/-', value: { ...deal.item } });
      }
      if (deal.rune) {
        this.patch.emit({ path: '/runes/-', value: { ...deal.rune } });
      }
      if (deal.spell) {
        this.patch.emit({ path: '/spells/-', value: { ...deal.spell } });
      }
      if (deal.skill) {
        this.patch.emit({ path: '/skills/-', value: { ...deal.skill } });
      }
      if (deal.statusEffect) {
        this.patch.emit({ path: '/activeStatusEffects/-', value: { ...deal.statusEffect } });
      }
    }
  }
}
