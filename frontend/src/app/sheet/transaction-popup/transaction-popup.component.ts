import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Currency, formatCurrency } from '../../model/current-events.model';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'claim';
  itemName: string;
  quantity: number;
  moneyGained?: Currency;
  moneyLost?: Currency;
  timestamp: number;
}

@Component({
  selector: 'app-transaction-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transaction-popups">
      @for (transaction of transactions; track transaction.id) {
        <div class="transaction-popup" 
             [class.fade-out]="shouldFadeOut(transaction)"
             [style.animation-delay]="getAnimationDelay(transaction) + 'ms'">
          <div class="transaction-icon">
            @if (transaction.type === 'buy') {
              🛒
            } @else if (transaction.type === 'sell') {
              💰
            } @else {
              🎁
            }
          </div>
          <div class="transaction-content">
            <div class="transaction-header">
              @if (transaction.type === 'buy') {
                Gekauft
              } @else if (transaction.type === 'sell') {
                Verkauft
              } @else {
                Beansprucht
              }
            </div>
            <div class="transaction-item">
              {{ transaction.quantity }}x {{ transaction.itemName }}
            </div>
            @if (transaction.moneyLost) {
              <div class="money-lost">
                - {{ formatCurrency(transaction.moneyLost) }}
              </div>
            }
            @if (transaction.moneyGained) {
              <div class="money-gained">
                + {{ formatCurrency(transaction.moneyGained) }}
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .transaction-popups {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .transaction-popup {
      background: linear-gradient(135deg, rgba(107, 70, 193, 0.95) 0%, rgba(75, 50, 140, 0.95) 100%);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 280px;
      animation: slideInRight 0.3s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }

    .transaction-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .transaction-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .transaction-header {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
    }

    .transaction-item {
      font-size: 1rem;
      font-weight: 700;
      color: white;
    }

    .money-lost {
      color: #ff6b6b;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .money-gained {
      color: #51cf66;
      font-weight: 600;
      font-size: 0.9rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionPopupComponent {
  @Input() transactions: Transaction[] = [];

  formatCurrency = formatCurrency;

  shouldFadeOut(transaction: Transaction): boolean {
    return Date.now() - transaction.timestamp > 2500;
  }

  getAnimationDelay(transaction: Transaction): number {
    // Stagger animations if multiple transactions happen quickly
    const index = this.transactions.indexOf(transaction);
    return index * 100;
  }
}
