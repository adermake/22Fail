import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrentEvent, ShopEvent, ShopDeal, CustomPrice, getCoinParts, CoinPart, formatCurrencyAsGold, convertToCopper, Currency } from '../../model/current-events.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import {
  canAffordDeal, dealCategory, dealContentData, formatCustomPrice, hasFixedPrice,
  knowsDealKnowledge, maxDealQuantity,
} from '../../utils/shop-deal.util';
import { kindLabel, previewText } from '../../utils/entry-preview.util';

type PriceMode = 'highest-units' | 'total-gold';

/** Ein Spieler will `quantity` Stück eines Deals kaufen (oder an den Handel verkaufen). */
export interface ShopBuyRequest {
  eventId: string;
  dealIndex: number;
  quantity: number;
}

@Component({
  selector: 'app-event-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (event) {
      <div class="portal-overlay">
        <!-- Close button OUTSIDE portal-background so it is never clipped -->
        <button class="portal-close-fixed" (click)="close.emit()" title="Portal verlassen">✕</button>

        <div class="portal-background shop-theme">
          <div class="portal-content">

            <!-- Portal Header -->
            <div class="portal-header">
              <div class="portal-title">
                <i class="portal-icon app-icon i-currency"></i>
                <h1>{{ event.name }}</h1>
              </div>

              @if (event.type === 'shop') {
                <div class="portal-header-controls">
                  <button class="mode-toggle-btn" (click)="togglePriceMode()" [title]="priceMode === 'highest-units' ? 'Zu Gesamtwert in Gold-Cetris wechseln' : 'Zu Münzen wechseln'">
                    @if (priceMode === 'highest-units') { 3 SC 2 KC } @else { 0,32 GC }
                  </button>
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
                            <i class="app-icon {{ dealIcon(deal) }}"></i>
                            {{ deal.name }}
                          </h3>
                          @if (deal.quantity !== undefined) {
                            <span class="deal-stock-badge">{{ deal.quantity - deal.sold }}/{{ deal.quantity }}</span>
                          }
                        </div>
                        <span class="deal-kind">{{ dealKind(deal) }}</span>

                        @if (dealText(deal)) {
                          <p class="deal-description-portal">
                            @if (deal.identified === false) {
                              <em class="unknown-effect">Unbekannter Effekt</em>
                            } @else {
                              {{ dealText(deal) }}
                            }
                          </p>
                        }

                        @if (hasDetails(deal)) {
                          <button class="inspect-btn" (click)="inspectDeal(deal)">Details ansehen</button>
                        }

                        <div class="deal-footer">
                          <div class="deal-price-large">
                            @if (deal.customPrice) {
                              <span class="custom-price">{{ formatCustom(deal.customPrice, getBuyQuantity(event.id, i)) }}</span>
                              @if (deal.isNegotiable) {
                                <span class="negotiable-badge">Verhandelbar</span>
                              }
                            } @else if (deal.price) {
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
                                <span class="negotiable-badge">Verhandelbar</span>
                              }
                            } @else {
                              <span class="price-negotiable">Verhandelbar</span>
                            }
                          </div>

                          <div class="deal-actions-portal">
                            @if (getMaxBuyable(deal) > 1) {
                              <input type="number"
                                     [value]="getBuyQuantity(event.id, i)"
                                     (input)="setBuyQuantity(event.id, i, $any($event.target).valueAsNumber)"
                                     min="1"
                                     [max]="getMaxBuyable(deal)"
                                     class="quantity-input-portal">
                            }
                            <button class="buy-btn-portal"
                                    (click)="buyItem(event.id, i, deal)"
                                    [disabled]="!canBuy(deal, getBuyQuantity(event.id, i))">
                              @if (deal.isReverseDeal) {
                                @if (hasFixedPrice(deal)) { <span class="btn-text">Verkaufen</span> } @else { <span class="btn-text">Anbieten</span> }
                              } @else {
                                @if (hasFixedPrice(deal)) { <span class="btn-text">Kaufen</span> } @else { <span class="btn-text">Verhandeln</span> }
                              }
                            </button>
                          </div>

                          @if (knowsKnowledge(deal)) {
                            <div class="deal-note-portal">Bereits bekannt</div>
                          } @else if (deal.customPrice && !deal.isReverseDeal) {
                            <div class="deal-note-portal">Bezahlung bitte selbst abziehen</div>
                          } @else if (!deal.isReverseDeal && !canAfford(deal, getBuyQuantity(event.id, i))) {
                            <div class="not-enough-gold-portal">Nicht genug Geld!</div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

          </div>
          <!-- Currency overlay – fixed bottom-right of portal -->
          @if (event.type === 'shop') {
            <div class="currency-overlay">
              <span class="currency-label">Deine Cetris</span>
              @for (coin of getPlayerCoinParts(); track coin.type) {
                <span class="coin-amount-lg" [style.color]="coin.color">
                  <span class="coin-icon" [style.background-color]="coin.color"></span>
                  {{ coin.amount }}
                </span>
              }
              <span class="currency-gold-total">= {{ getPlayerTotalAsGold() }} GC</span>
            </div>
          }
        </div>
      </div>

      <!-- Item Inspection Modal -->
      @if (inspectedDeal) {
        <div class="inspect-overlay" (click)="closeInspect()">
          <div class="inspect-modal" (click)="$event.stopPropagation()">
            <div class="inspect-header">
              <h2>{{ inspectedDeal.name }}</h2>
              <button class="inspect-close" (click)="closeInspect()">✕</button>
            </div>
            <div class="inspect-body">
              @if (inspectedDeal.identified === false) {
                <div class="unknown-item-info">
                  <p>Dieser Gegenstand ist nicht identifiziert.</p>
                  <p class="unknown-sub">Eigenschaften und Effekte sind unbekannt.</p>
                </div>
              } @else {
                @if (inspectedDeal.description) {
                  <p class="inspect-description">{{ inspectedDeal.description }}</p>
                }
                @if (itemOf(inspectedDeal); as item) {
                  <div class="item-detail-grid">
                    @if (item.weight !== undefined) {
                      <div class="detail-row"><span class="detail-label">Gewicht:</span><span>{{ item.weight }}</span></div>
                    }
                    @if (item.itemType) {
                      <div class="detail-row"><span class="detail-label">Typ:</span><span>{{ itemKind(item) }}</span></div>
                    }
                    @if (item.efficiency !== undefined) {
                      <div class="detail-row"><span class="detail-label">Effizienz:</span><span>{{ item.efficiency }}</span></div>
                    }
                    @if (item.stability !== undefined) {
                      <div class="detail-row"><span class="detail-label">Stabilität:</span><span>{{ item.stability }}</span></div>
                    }
                    @if (item.primaryEffect) {
                      <div class="detail-full"><p>{{ item.primaryEffect }}</p></div>
                    }
                    @if (item.description) {
                      <div class="detail-full"><p>{{ item.description }}</p></div>
                    }
                  </div>
                } @else {
                  <div class="item-detail-grid">
                    <div class="detail-row"><span class="detail-label">Art:</span><span>{{ dealKind(inspectedDeal) }}</span></div>
                    <div class="detail-full preview-text">{{ contentPreview(inspectedDeal) }}</div>
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
      /* border-box: ohne das ist der Inhalt 100% + Padding breit und wird rechts abgeschnitten */
      box-sizing: border-box;
      width: 100%; height: 100%;
      /* unten Platz für die feste Cetris-Anzeige, sonst verdeckt sie die letzte Reihe */
      padding: 2.5rem 3rem 6rem;
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
      font-size: 3rem;
      color: #ffd700;
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
    /* Currency overlay - fixed bottom-right */
    .currency-overlay {
      position: fixed;
      bottom: 2rem;
      right: 2.5rem;
      z-index: 20500;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: rgba(5, 5, 15, 0.82);
      backdrop-filter: blur(10px);
      padding: 0.7rem 1.3rem;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.18);
      box-shadow: 0 6px 28px rgba(0,0,0,0.6);
    }
    .currency-label {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-right: 0.2rem;
    }
    .coin-amount-lg {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 1.3rem; font-weight: bold;
    }
    .coin-icon {
      width: 18px; height: 18px;
      border-radius: 50%;
      display: inline-block; flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.25);
      box-shadow: inset 0 -2px 4px rgba(0,0,0,0.5),
                  inset 2px 3px 5px rgba(255,255,255,0.25),
                  0 2px 6px rgba(0,0,0,0.4);
    }
    .currency-gold-total {
      color: rgba(255,255,255,0.5);
      font-size: 0.9rem;
      margin-left: 0.2rem;
      border-left: 1px solid rgba(255,255,255,0.15);
      padding-left: 0.8rem;
    }

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
      grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
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

    .deal-kind { align-self:flex-start; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;
                 color:rgba(218,165,32,0.9); margin-top:-0.4rem; }
    .deal-description-portal { color:rgba(255,255,255,0.75); font-size:0.95rem; margin:0; line-height:1.4; white-space:pre-line; }
    .custom-price { color:#ffd700; font-weight:bold; font-size:1.05rem; }
    .deal-note-portal {
      text-align:center; color:rgba(255,255,255,0.7); font-size:0.9rem;
      padding:0.4rem; background:rgba(255,255,255,0.06); border-radius:7px;
    }
    .preview-text { white-space:pre-line; }
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
    .coin-circle {
      width: 13px; height: 13px;
      border-radius: 50%; display: inline-block; flex-shrink: 0;
      border: 1.5px solid rgba(255,255,255,0.2);
      box-shadow: inset 0 -1px 3px rgba(0,0,0,0.5),
                  inset 1px 2px 3px rgba(255,255,255,0.2);
    }
    .coin-val { color:white; }
    .price-gold-ref { color:rgba(255,255,255,0.5); font-size:0.8rem; }
    .price-negotiable { color:#4caf50; font-style:italic; font-size:0.9rem; }
    .negotiable-badge { color:#4caf50; font-size:0.8rem; font-style:italic; }

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
  /** Bezahlen, Vergeben und Bestand zählen erledigt der Bogen (`onBuyFromShop`). */
  @Output() buyRequest = new EventEmitter<ShopBuyRequest>();

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
    if (c.platinum > 0) parts.push({ amount: c.platinum, type: 'platinum', color: '#6ab2e5', symbol: '●' });
    if (c.gold > 0) parts.push({ amount: c.gold, type: 'gold', color: '#ffd700', symbol: '●' });
    if (c.silver > 0) parts.push({ amount: c.silver, type: 'silver', color: '#c0c0c0', symbol: '●' });
    if (c.copper > 0) parts.push({ amount: c.copper, type: 'copper', color: '#b87333', symbol: '●' });
    if (parts.length === 0) parts.push({ amount: 0, type: 'copper', color: '#b87333', symbol: '●' });
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

  getBuyQuantity(eventId: string, dealIndex: number): number {
    return this.buyQuantities.get(`${eventId}-${dealIndex}`) || 1;
  }

  setBuyQuantity(eventId: string, dealIndex: number, quantity: number) {
    if (quantity < 1) quantity = 1;
    this.buyQuantities.set(`${eventId}-${dealIndex}`, quantity);
  }

  getMaxBuyable(deal: ShopDeal): number {
    return maxDealQuantity(deal);
  }

  canAfford(deal: ShopDeal, quantity: number): boolean {
    return canAffordDeal(this.sheet?.currency, deal, quantity);
  }

  knowsKnowledge(deal: ShopDeal): boolean {
    return knowsDealKnowledge(this.sheet, deal);
  }

  /** Nur mit festem Preis; Verhandlungssache läuft über die Spielleitung. */
  canBuy(deal: ShopDeal, quantity: number): boolean {
    return hasFixedPrice(deal)
      && quantity >= 1 && quantity <= this.getMaxBuyable(deal)
      && this.canAfford(deal, quantity)
      && !this.knowsKnowledge(deal);
  }

  buyItem(eventId: string, dealIndex: number, deal: ShopDeal) {
    const quantity = Math.min(this.getBuyQuantity(eventId, dealIndex), this.getMaxBuyable(deal));
    if (!this.canBuy(deal, quantity)) return;
    this.buyRequest.emit({ eventId, dealIndex, quantity });
    this.buyQuantities.delete(`${eventId}-${dealIndex}`);
  }

  // ── Anzeige ────────────────────────────────────────────────────────────────

  readonly hasFixedPrice = hasFixedPrice;

  dealIcon(deal: ShopDeal): string {
    return deal.isReverseDeal ? 'i-currency' : dealCategory(deal).icon;
  }

  dealKind(deal: ShopDeal): string {
    return deal.isReverseDeal ? 'Ankauf' : dealCategory(deal).label;
  }

  /** Ankäufe beschreiben sich in `reverseDescription` — das wurde bisher nie angezeigt. */
  dealText(deal: ShopDeal): string {
    return (deal.isReverseDeal ? deal.reverseDescription : deal.description) ?? '';
  }

  formatCustom(price: CustomPrice, quantity: number): string {
    return formatCustomPrice(price, quantity);
  }

  hasDetails(deal: ShopDeal): boolean {
    return !deal.isReverseDeal && dealContentData(deal) !== null;
  }

  itemOf(deal: ShopDeal): ItemBlock | null {
    if (deal.item) return deal.item;
    return deal.grant?.type === 'item' || deal.grant?.type === 'resource'
      ? (deal.grant.data as ItemBlock)
      : null;
  }

  itemKind(item: ItemBlock): string {
    return kindLabel(item) || (item.itemType ?? '');
  }

  contentPreview(deal: ShopDeal): string {
    const data = dealContentData(deal) as { name?: string } | null;
    return previewText(data?.name ?? deal.name, data);
  }

  inspectDeal(deal: ShopDeal) {
    this.inspectedDeal = deal;
  }

  closeInspect() {
    this.inspectedDeal = null;
  }
}
