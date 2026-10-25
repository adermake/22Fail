import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssetFile } from '../../model/asset-browser.model';
import { Currency, ShopDeal, createEmptyShopDeal } from '../../model/current-events.model';
import {
  DEAL_CATEGORIES, DealCategory, createDealGrant, dealCategory, dealContentData,
} from '../../utils/shop-deal.util';

type PriceKind = 'cetris' | 'custom';

/**
 * Legt einen Shop-Deal an oder bearbeitet ihn.
 *
 * Aus dem Library-Editor herausgelöst, als der Deal mehr als fünf Inhaltsarten bekam: ein Deal
 * verkauft jetzt alles, was der GM-Schreibtisch vergeben kann (siehe `DEAL_CATEGORIES`), oder nur
 * Text, und kostet Cetris oder eine eigene Währung.
 */
@Component({
  selector: 'app-shop-deal-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="de">
      <div class="de-head">
        <h5>{{ initial ? 'Deal bearbeiten' : mode === 'buy' ? 'Ankauf anlegen' : mode === 'sell' ? 'Verkauf anlegen' : 'Neuer Deal' }}</h5>
        <button class="de-close" (click)="cancel.emit()" title="Abbrechen">✕</button>
      </div>

      @if (!mode) {
        <div class="de-modes">
          <button class="de-mode" (click)="mode = 'sell'">
            <strong>Handel verkauft</strong><span>Spieler kauft vom Handel</span>
          </button>
          <button class="de-mode buy" (click)="mode = 'buy'">
            <strong>Handel kauft an</strong><span>Spieler verkauft an den Handel</span>
          </button>
        </div>
      } @else {
        @if (mode === 'sell') {
          <div class="de-field">
            <label>Was wird verkauft?</label>
            <div class="de-cats">
              @for (cat of categories; track cat.id) {
                <button class="de-cat" [class.active]="category?.id === cat.id" (click)="pickCategory(cat)">
                  <i class="app-icon {{ cat.icon }}"></i>{{ cat.label }}
                </button>
              }
            </div>
          </div>

          @if (category?.assetType) {
            <div class="de-field">
              <label>{{ category!.label }} auswählen</label>
              @if (currentContentName && !pickedFile) {
                <small class="de-hint">Aktuell: {{ currentContentName }}</small>
              }
              <input type="search" [(ngModel)]="search" placeholder="Suchen …" />
              <select class="de-list" size="8" [value]="pickedFile?.id ?? ''" (change)="pickFile($any($event.target).value)">
                @for (file of options(); track file.id) {
                  <option [value]="file.id">{{ file.data?.name || file.name }}{{ folderOf(file) }}</option>
                } @empty {
                  <option disabled value="">Nichts gefunden — verknüpfte Bibliotheken prüfen</option>
                }
              </select>
            </div>
          }
        }

        @if (mode === 'buy' || category) {
          <div class="de-field">
            <label>{{ mode === 'buy' ? 'Ankauf-Titel' : 'Name' }}</label>
            <input type="text" [(ngModel)]="name"
                   [placeholder]="mode === 'buy' ? 'z.B. Schwerter verschiedener Art' : category?.id === 'text' ? 'z.B. Übernachtung im Gasthaus' : 'z.B. Schwert +1'" />
          </div>

          <div class="de-field">
            <label>{{ mode === 'buy' ? 'Was der Handel ankauft' : category?.id === 'text' ? 'Was der Spieler bekommt' : 'Beschreibung (optional)' }}</label>
            <textarea rows="3" [(ngModel)]="description"
                      [placeholder]="mode === 'buy' ? 'z.B. Beliebige Schwerter, auch verzauberte Klingen.' : category?.id === 'text' ? 'z.B. Ein Bett, ein warmes Essen und ein offenes Ohr des Wirts.' : ''"></textarea>
            @if (category?.id === 'text') {
              <small class="de-hint">Freitext vergibt nichts automatisch — den Rest regelt die Spielleitung.</small>
            }
          </div>

          <div class="de-field">
            <label>{{ mode === 'buy' ? 'Ankaufspreis pro Stück' : 'Preis pro Stück' }}</label>
            <div class="de-toggle">
              <button [class.active]="priceKind === 'cetris'" (click)="priceKind = 'cetris'">
                <i class="app-icon i-currency"></i>Cetris
              </button>
              <button [class.active]="priceKind === 'custom'" (click)="priceKind = 'custom'">Eigene Währung</button>
            </div>
            @if (priceKind === 'cetris') {
              <div class="de-coins">
                <input type="number" min="0" [(ngModel)]="price.platinum" /><span title="Platin-Cetris">PC</span>
                <input type="number" min="0" [(ngModel)]="price.gold" /><span title="Gold-Cetris">GC</span>
                <input type="number" min="0" [(ngModel)]="price.silver" /><span title="Silber-Cetris">SC</span>
                <input type="number" min="0" [(ngModel)]="price.copper" /><span title="Kupfer-Cetris">KC</span>
              </div>
            } @else {
              <div class="de-coins">
                <input type="number" min="0" [(ngModel)]="customAmount" />
                <input class="de-currency-name" type="text" list="shop-deal-currencies"
                       [(ngModel)]="customCurrency" placeholder="z.B. Drachenschuppen" />
                <datalist id="shop-deal-currencies">
                  @for (c of knownCurrencies; track c) { <option [value]="c"></option> }
                </datalist>
              </div>
              <small class="de-hint">
                Wird nicht automatisch abgebucht: {{ mode === 'buy' ? 'der Spieler trägt sie sich selbst ein.' : 'der Spieler streicht die Währung beim Kauf selbst.' }}
              </small>
            }
          </div>

          <div class="de-checks">
            <label><input type="checkbox" [(ngModel)]="isNegotiable" /> Verhandelbar</label>
            @if (mode === 'sell' && category?.id !== 'text') {
              <label><input type="checkbox" [(ngModel)]="identified" /> Identifiziert (Spieler sehen Details)</label>
            }
          </div>

          @if (mode === 'sell') {
            <div class="de-field">
              <label>Bestand (leer = unbegrenzt)</label>
              <input type="number" min="1" [(ngModel)]="quantity" placeholder="Unbegrenzt" />
            </div>
          }

          <div class="de-actions">
            <button class="de-save" [disabled]="!canSave" (click)="submit()">Deal speichern</button>
            <button class="de-cancel" (click)="cancel.emit()">Abbrechen</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .de { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: var(--card);
          border: 2px solid var(--accent); border-radius: 8px; }
    .de-head { display: flex; justify-content: space-between; align-items: center;
               padding-bottom: .6rem; border-bottom: 1px solid var(--border); }
    .de-head h5 { margin: 0; font-size: 1rem; color: var(--text); }
    .de-close, .de-cancel { background: transparent; border: 1px solid var(--border); border-radius: 4px;
                            color: var(--text); cursor: pointer; padding: .3rem .6rem; }
    .de-close:hover, .de-cancel:hover { border-color: #ff4444; color: #ff4444; }

    .de-modes { display: flex; gap: .75rem; }
    .de-mode { flex: 1; display: flex; flex-direction: column; gap: .25rem; padding: 1rem; cursor: pointer;
               background: var(--bg); border: 2px solid var(--border); border-radius: 8px; color: var(--text); }
    .de-mode:hover { border-color: var(--accent); }
    .de-mode.buy:hover { border-color: #ff9800; }
    .de-mode span { font-size: .8rem; opacity: .7; }

    .de-field { display: flex; flex-direction: column; gap: .4rem; }
    .de-field > label { font-weight: 600; font-size: .9rem; color: var(--text); }
    .de-field input, .de-field textarea, .de-list {
      padding: .55rem .7rem; background: var(--bg); border: 1px solid var(--border); border-radius: 4px;
      color: var(--text); font: inherit; font-size: .92rem;
    }
    .de-field input:focus, .de-field textarea:focus, .de-list:focus { outline: none; border-color: var(--accent); }
    .de-list option { padding: .2rem .3rem; }
    .de-hint { color: var(--text-dim); font-size: .8rem; }

    .de-cats { display: flex; flex-wrap: wrap; gap: .4rem; }
    .de-cat { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem .7rem; cursor: pointer;
              background: var(--bg); border: 1px solid var(--border); border-radius: 999px;
              color: var(--text); font-size: .85rem; }
    .de-cat:hover { border-color: var(--accent); }
    .de-cat.active { background: var(--accent); border-color: var(--accent); color: #fff; }

    .de-toggle { display: inline-flex; align-self: flex-start; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
    .de-toggle button { display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .8rem;
                        background: var(--bg); border: none; color: var(--text); cursor: pointer; font-size: .85rem; }
    .de-toggle button + button { border-left: 1px solid var(--border); }
    .de-toggle button.active { background: var(--accent); color: #fff; }

    .de-coins { display: flex; align-items: center; gap: .45rem; flex-wrap: wrap; }
    .de-coins input { width: 72px; text-align: center; }
    .de-coins .de-currency-name { width: auto; flex: 1; min-width: 160px; text-align: left; }
    .de-coins span { color: var(--text-dim); font-weight: 600; }

    .de-checks { display: flex; gap: 1rem; flex-wrap: wrap; }
    .de-checks label { display: flex; align-items: center; gap: .4rem; color: var(--text); font-size: .9rem; }

    .de-actions { display: flex; gap: .5rem; }
    .de-save { padding: .55rem 1.2rem; background: var(--accent); border: none; border-radius: 4px;
               color: #fff; font-weight: 600; cursor: pointer; }
    .de-save:disabled { opacity: .5; cursor: not-allowed; }
  `],
})
export class ShopDealEditorComponent implements OnInit {
  /** Bibliotheksdateien nach Asset-Typ (`item`, `material`, `forge-trait` …). */
  @Input() assets: Partial<Record<string, AssetFile[]>> = {};
  /** Bestehender Deal zum Bearbeiten; ohne ihn wird ein neuer angelegt. */
  @Input() initial: ShopDeal | null = null;
  /** Eigene Währungen, die in diesem Shop schon vorkommen — als Vorschlag. */
  @Input() knownCurrencies: string[] = [];

  @Output() save = new EventEmitter<ShopDeal>();
  @Output() cancel = new EventEmitter<void>();

  readonly categories = DEAL_CATEGORIES;

  mode: 'sell' | 'buy' | null = null;
  category: DealCategory | null = null;
  search = '';
  pickedFile: AssetFile | null = null;
  /** Name des Inhalts beim Bearbeiten, solange nichts Neues gewählt ist. */
  currentContentName = '';

  name = '';
  description = '';
  priceKind: PriceKind = 'cetris';
  price: Currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  customAmount = 1;
  customCurrency = '';
  isNegotiable = false;
  identified = true;
  quantity: number | null = null;

  /** Einmal beim Öffnen — nie bei späteren Input-Änderungen neu befüllen. */
  ngOnInit(): void {
    const deal = this.initial;
    if (!deal) return;
    this.mode = deal.isReverseDeal ? 'buy' : 'sell';
    if (!deal.isReverseDeal) {
      this.category = dealCategory(deal);
      const content = dealContentData(deal) as { name?: string } | null;
      this.currentContentName = content?.name ?? '';
    }
    this.name = deal.name ?? '';
    this.description = (deal.isReverseDeal ? deal.reverseDescription : deal.description) ?? '';
    if (deal.customPrice) {
      this.priceKind = 'custom';
      this.customAmount = deal.customPrice.amount;
      this.customCurrency = deal.customPrice.currency;
    }
    if (deal.price) this.price = { ...deal.price };
    this.isNegotiable = !!deal.isNegotiable;
    this.identified = deal.identified !== false;
    this.quantity = deal.quantity ?? null;
  }

  options(): AssetFile[] {
    const type = this.category?.assetType;
    if (!type) return [];
    const query = this.search.trim().toLowerCase();
    return (this.assets[type] ?? [])
      .filter(f => !query || (f.data?.name || f.name || '').toLowerCase().includes(query))
      .sort((a, b) => (a.data?.name || a.name).localeCompare(b.data?.name || b.name));
  }

  folderOf(file: AssetFile): string {
    const path = file.path ?? '';
    const folder = path.slice(0, path.lastIndexOf('/'));
    return folder ? `  —  ${folder}` : '';
  }

  pickCategory(cat: DealCategory): void {
    if (this.category?.id === cat.id) return;
    // Ein Wechsel der Art macht die alte Auswahl ungültig; ein automatisch gesetzter Name auch.
    if (this.pickedFile && this.name === this.autoName(this.pickedFile)) this.name = '';
    this.category = cat;
    this.pickedFile = null;
    this.search = '';
    this.currentContentName = '';
  }

  pickFile(id: string): void {
    const file = this.options().find(f => f.id === id) ?? null;
    if (!file) return;
    if (!this.name || (this.pickedFile && this.name === this.autoName(this.pickedFile))) {
      this.name = this.autoName(file);
    }
    this.pickedFile = file;
  }

  private autoName(file: AssetFile): string {
    return file.data?.name || file.name;
  }

  get canSave(): boolean {
    if (!this.name.trim()) return false;
    if (this.priceKind === 'custom' && !this.customCurrency.trim()) return false;
    if (this.mode === 'sell') {
      if (!this.category) return false;
      // Neu angelegt braucht einen Inhalt; beim Bearbeiten reicht der alte.
      if (this.category.assetType && !this.pickedFile && !this.currentContentName) return false;
    }
    return true;
  }

  submit(): void {
    if (!this.canSave) return;
    const deal: ShopDeal = this.initial ? structuredClone(this.initial) : createEmptyShopDeal();

    deal.name = this.name.trim();
    deal.isReverseDeal = this.mode === 'buy';
    deal.isNegotiable = this.isNegotiable;

    if (this.priceKind === 'custom') {
      deal.customPrice = { amount: Math.max(0, Number(this.customAmount) || 0), currency: this.customCurrency.trim() };
      delete deal.price;
    } else {
      deal.price = { ...this.price };
      delete deal.customPrice;
    }

    if (deal.isReverseDeal) {
      deal.reverseDescription = this.description.trim();
      delete deal.description;
      delete deal.identified;
      delete deal.quantity;
      clearContent(deal);
    } else {
      deal.description = this.description.trim() || undefined;
      deal.identified = this.identified;
      deal.quantity = typeof this.quantity === 'number' && this.quantity > 0 ? this.quantity : undefined;
      if (this.category?.id === 'text') {
        clearContent(deal);
      } else if (this.pickedFile && this.category) {
        clearContent(deal);
        deal.grant = createDealGrant(this.category, this.pickedFile);
      }
    }

    this.save.emit(deal);
  }
}

/** Entfernt den Inhalt — neuer wie alter Form —, bevor ein anderer gesetzt wird. */
function clearContent(deal: ShopDeal): void {
  delete deal.grant;
  delete deal.item;
  delete deal.rune;
  delete deal.spell;
  delete deal.skill;
  delete deal.statusEffect;
}
