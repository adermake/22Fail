/**
 * The party on the map: who is travelling, and how much Ausdauer each of them has left.
 *
 * Shown to everyone in game mode. Travel is a group activity — the party moves together, and
 * the slowest, most exhausted member decides how far it gets — so the players need to see each
 * other's Ausdauer, not just their own.
 *
 * The GM additionally gets one button that drains Ausdauer from the whole party at once, which
 * is the action travel actually asks for: an hour on the road costs everybody, and doing it
 * sheet by sheet at the table is the busywork this exists to remove.
 *
 * ## Why it writes through the socket
 *
 * The REST `PATCH characters/:id` route stores the change but tells nobody — only the socket's
 * `patchCharacter` broadcasts to the character's room. Writing through REST would update the
 * file while every open character sheet kept showing the old number until reloaded. The socket
 * also does not echo to the sender, so the change is applied locally here as well.
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { CharacterApiService } from '../services/character-api.service';
import { CharacterSocketService } from '../services/character-socket.service';
import { WorldApiService } from '../services/world-api.service';
import { TrueStatsService } from '../services/true-stats.service';
import { CharacterSheet } from '../model/character-sheet-model';
import { FormulaType } from '../model/formula-type.enum';
import { ImageUrlPipe } from '../shared/image-url.pipe';
import { applyJsonPatchTo } from '../utils/json-patch.util';
import { STAMINA_PER_HOUR_ON_FOOT, currentStamina, staminaDrainPatch } from '../utils/travel.util';

interface Member {
  id: string;
  sheet: CharacterSheet;
}

const COLLAPSED_KEY = 'map.partyPanel.collapsed';

@Component({
  selector: 'app-party-panel',
  standalone: true,
  imports: [ImageUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./map-card.css'],
  template: `
    <div class="map-card" (wheel)="$event.stopPropagation()">
      <button type="button" class="map-card-head" (click)="toggle()">
        <span>Gruppe</span>
        <span class="map-card-caret">{{ collapsed() ? '▸' : '▾' }}</span>
      </button>

      @if (!collapsed()) {
        <div class="map-card-body">
          @if (loading()) {
            <p class="party-hint">Lädt …</p>
          } @else if (!rows().length) {
            <p class="party-hint">Keine Charaktere in der Gruppe.</p>
          }

          @for (row of rows(); track row.id) {
            <div class="party-row">
              @if (row.portrait) {
                <img class="party-portrait" [src]="row.portrait | imageUrl" [alt]="row.name" />
              } @else {
                <span class="party-portrait party-initial">{{ row.name.charAt(0) }}</span>
              }
              <div class="party-info">
                <span class="party-name">{{ row.name }}</span>
                <div class="party-bar" [title]="'Ausdauer ' + row.current + ' / ' + row.max">
                  <div class="party-bar-fill" [style.width.%]="row.percent"></div>
                  <span class="party-bar-value">{{ row.current }} / {{ row.max }}</span>
                </div>
              </div>
            </div>
          }

          @if (isGM && rows().length) {
            <!-- Eine Stunde zu Fuß kostet 2 Ausdauer; der Wert ist vorbelegt, damit der
                 häufigste Fall ein einziger Klick ist. -->
            <div class="party-drain">
              <input
                type="number"
                min="1"
                step="1"
                [value]="drainAmount()"
                (input)="drainAmount.set(+$any($event.target).value)"
                title="Ausdauer, die jedem Gruppenmitglied abgezogen wird"
              />
              <button type="button" (click)="drainAll()">Allen abziehen</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .party-hint {
        margin: 0;
        font-size: 11px;
        opacity: 0.6;
      }
      .party-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }
      .party-portrait {
        flex: 0 0 34px;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #3a3a46;
        background: #2a2a33;
      }
      .party-initial {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 15px;
      }
      .party-info {
        flex: 1;
        min-width: 0;
      }
      .party-name {
        display: block;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .party-bar {
        position: relative;
        height: 14px;
        margin-top: 2px;
        border-radius: 4px;
        background: #2a2a33;
        overflow: hidden;
      }
      .party-bar-fill {
        height: 100%;
        background: var(--energy-color, #e0b341);
        transition: width 0.25s ease-out;
      }
      .party-bar-value {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-variant-numeric: tabular-nums;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }
      .party-drain {
        display: flex;
        gap: 5px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #2e2e37;
      }
      .party-drain input {
        width: 52px;
        background: #2a2a33;
        color: #e6e6ea;
        border: 1px solid #3a3a46;
        border-radius: 5px;
        padding: 4px 6px;
        font-size: 12px;
      }
      .party-drain button {
        flex: 1;
        background: #2a2a33;
        color: #e6e6ea;
        border: 1px solid #3a3a46;
        border-radius: 5px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
      }
      .party-drain button:hover {
        background: #343440;
      }
    `,
  ],
})
export class PartyPanelComponent implements OnInit, OnDestroy {
  @Input({ required: true }) worldName!: string;
  @Input() isGM = false;

  private characterApi = inject(CharacterApiService);
  private characterSocket = inject(CharacterSocketService);
  private worldApi = inject(WorldApiService);
  private trueStats = inject(TrueStatsService);

  private readonly members = signal<Member[]>([]);
  /** Sheets are mutated in place by incoming patches; this tells the view they changed. */
  private readonly revision = signal(0);

  readonly loading = signal(true);
  readonly collapsed = signal(readCollapsed());
  readonly drainAmount = signal(STAMINA_PER_HOUR_ON_FOOT);

  readonly rows = computed(() => {
    void this.revision();
    return this.members().map(({ id, sheet }) => {
      const max = this.trueStats.calculateResourceMax(sheet, FormulaType.ENERGY);
      const current = currentStamina(sheet);
      return {
        id,
        name: sheet.name || 'Unbenannt',
        portrait: sheet.portrait,
        current,
        max,
        percent: max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0,
      };
    });
  });

  private sub?: Subscription;

  async ngOnInit(): Promise<void> {
    this.characterSocket.connect();
    this.sub = this.characterSocket.patches$.subscribe(({ characterId, patch }) => {
      const member = this.members().find(m => m.id === characterId);
      if (!member) return;
      applyJsonPatchTo(member.sheet, patch);
      this.revision.update(n => n + 1);
    });

    try {
      const world = await this.worldApi.loadWorld(this.worldName);
      // Mirrors the store's migration: worlds saved before `partyIds` existed used `party`.
      const legacy = world as unknown as { party?: string[] } | null;
      const ids = world?.partyIds ?? legacy?.party ?? [];

      const loaded: Member[] = [];
      for (const id of ids) {
        const sheet = await this.characterApi.loadCharacter(id);
        if (!sheet) continue;
        this.characterSocket.joinCharacter(id);
        loaded.push({ id, sheet });
      }
      this.members.set(loaded);
    } catch (err) {
      console.error('[PartyPanel] Gruppe konnte nicht geladen werden', err);
    } finally {
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggle(): void {
    this.collapsed.update(v => !v);
    try {
      localStorage.setItem(COLLAPSED_KEY, this.collapsed() ? '1' : '0');
    } catch {
      // A lost preference is not worth an error.
    }
  }

  /** Drain Ausdauer from every party member — the cost of a stretch of travel. */
  drainAll(): void {
    if (!this.isGM) return;
    const amount = this.drainAmount();

    for (const { id, sheet } of this.members()) {
      const patch = staminaDrainPatch(sheet, amount);
      if (!patch) continue;
      // Locally first: the socket broadcasts to everyone *except* the sender.
      applyJsonPatchTo(sheet, patch);
      this.characterSocket.sendPatch(id, patch);
    }
    this.revision.update(n => n + 1);
  }
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}
