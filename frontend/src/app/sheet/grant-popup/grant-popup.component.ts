import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/card/card.component';
import {
  GRANT_TYPE_ICON,
  GRANT_TYPE_LABEL,
  KNOWLEDGE_KIND_LABEL,
  PendingGrant,
} from '../../model/gm-desk.model';
import { Currency } from '../../model/currency-model';
import { CoinPart, getCoinParts } from '../../model/current-events.model';

/**
 * Was der Spielleiter anbietet, landet hier, bis der Spieler zusagt. Ein Angebot bleibt am Bogen
 * hängen, bis darüber entschieden ist — der Spieler muss also nicht online sein, wenn es kommt.
 */
@Component({
  selector: 'app-grant-popup',
  imports: [CommonModule, CardComponent],
  templateUrl: './grant-popup.component.html',
  styleUrl: './grant-popup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrantPopupComponent {
  @Input({ required: true }) grants: PendingGrant[] = [];

  @Output() accept = new EventEmitter<PendingGrant>();
  @Output() decline = new EventEmitter<PendingGrant>();
  @Output() acceptAll = new EventEmitter<void>();

  readonly typeLabel = GRANT_TYPE_LABEL;
  readonly typeIcon = GRANT_TYPE_ICON;

  /** Überschrift des Eintrags: bei Wissen die Wissensart, sonst der Typ. */
  badgeFor(grant: PendingGrant): string {
    if (grant.type === 'knowledge' && grant.knowledgeKind) {
      return KNOWLEDGE_KIND_LABEL[grant.knowledgeKind];
    }
    return GRANT_TYPE_LABEL[grant.type];
  }

  descriptionFor(grant: PendingGrant): string {
    const data = grant.data as { description?: string } | null;
    return data?.description ?? '';
  }

  coinsFor(grant: PendingGrant): CoinPart[] {
    return getCoinParts(grant.data as Currency);
  }

  /** Stückzahl eines Stapels — nur anzeigen, wenn es mehr als eines ist. */
  amountFor(grant: PendingGrant): number {
    const data = grant.data as { stackable?: boolean; amount?: number } | null;
    if (!data?.stackable) return 1;
    return Math.max(1, Math.floor(data.amount ?? 1));
  }
}
