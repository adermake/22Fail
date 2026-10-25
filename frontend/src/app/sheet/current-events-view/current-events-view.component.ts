import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrentEvent, ShopEvent, formatCurrency, Currency } from '../../model/current-events.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import {
  DeskEntry, DeskTab, GRANT_TYPE_ICON, GRANT_TYPE_LABEL,
} from '../../model/gm-desk.model';
import { goldValue, isUnidentified, kindLabel, previewText } from '../../utils/entry-preview.util';

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

  @Output() claimRequest = new EventEmitter<ClaimLootEvent>();
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() openPortalEvent = new EventEmitter<string>();

  expandedEvents = new Set<string>();

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

  // Kaufen läuft über das Event-Portal (`app-event-portal`) und `SheetComponent.onBuyFromShop`.
}
