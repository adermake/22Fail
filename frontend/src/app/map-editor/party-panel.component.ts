/**
 * The party on the map: who is travelling, and how much Ausdauer each of them has left.
 *
 * Shown to everyone in game mode. Travel is a group activity — the party moves together, and
 * the slowest, most exhausted member decides how far it gets — so the players need to see each
 * other's Ausdauer, not just their own.
 *
 * The GM additionally gets one button that drains Ausdauer from the whole party at once, which
 * is the action travel actually asks for: an hour on the road costs everybody, and doing it
 * sheet by sheet at the table is the busywork this exists to remove. A member who is being
 * carried can be marked "Getragen" (GM only, stored on the world as `travelExemptIds`) and is
 * skipped by that drain.
 *
 * ## Why it loads in ngOnChanges
 *
 * The map view only learns its world name in `ngAfterViewInit`. Players are always in game mode,
 * so for them this panel is created on the very first render, while the name is still empty.
 * Loading once in ngOnInit fetched the world "" and showed no one; the GM never noticed because
 * they create the panel later, by switching to "Spielen". Party and carried list come from the
 * world store, so changes made elsewhere arrive here live.
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
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { CharacterApiService } from '../services/character-api.service';
import { CharacterSocketService } from '../services/character-socket.service';
import { WorldStoreService } from '../services/world-store.service';
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
            <div class="party-row" [class.party-row--carried]="row.carried">
              @if (row.portrait) {
                <img class="party-portrait" [src]="row.portrait | imageUrl" [alt]="row.name" />
              } @else {
                <span class="party-portrait party-initial">{{ row.name.charAt(0) }}</span>
              }
              <div class="party-info">
                <span class="party-name">
                  {{ row.name }}
                  @if (row.carried && !isGM) {
                    <span class="party-carried-tag">getragen</span>
                  }
                </span>
                <div class="party-bar" [title]="'Ausdauer ' + row.current + ' / ' + row.max">
                  <div class="party-bar-fill" [style.width.%]="row.percent"></div>
                  <span class="party-bar-value">{{ row.current }} / {{ row.max }}</span>
                </div>
              </div>
              @if (isGM) {
                <button
                  type="button"
                  class="party-carry-btn"
                  [class.active]="row.carried"
                  (click)="toggleCarried(row.id)"
                  [title]="row.carried ? carriedOnTitle : carriedOffTitle"
                >
                  Getragen
                </button>
              }
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
      .party-row--carried .party-bar {
        opacity: 0.5;
      }
      .party-carried-tag {
        margin-left: 4px;
        font-size: 10px;
        opacity: 0.6;
      }
      .party-carry-btn {
        flex: 0 0 auto;
        background: #2a2a33;
        color: #9a9aa6;
        border: 1px solid #3a3a46;
        border-radius: 5px;
        padding: 3px 6px;
        font-size: 10px;
        cursor: pointer;
      }
      .party-carry-btn.active {
        color: #e6e6ea;
        border-color: var(--accent, #e0b341);
        background: #343440;
      }
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
export class PartyPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) worldName!: string;
  @Input() isGM = false;

  private characterApi = inject(CharacterApiService);
  private characterSocket = inject(CharacterSocketService);
  private worldStore = inject(WorldStoreService);
  private trueStats = inject(TrueStatsService);

  private readonly members = signal<Member[]>([]);
  /** Party members marked as carried — skipped by "Allen abziehen". */
  private readonly carried = signal<ReadonlySet<string>>(new Set());
  /** Sheets are mutated in place by incoming patches; this tells the view they changed. */
  private readonly revision = signal(0);

  readonly loading = signal(true);
  readonly collapsed = signal(readCollapsed());
  readonly drainAmount = signal(STAMINA_PER_HOUR_ON_FOOT);

  readonly carriedOnTitle =
    'Wird getragen — verliert bei „Allen abziehen“ keine Ausdauer. Klicken zum Aufheben.';
  readonly carriedOffTitle = 'Als getragen markieren: verliert bei „Allen abziehen“ keine Ausdauer';

  readonly rows = computed(() => {
    void this.revision();
    const carried = this.carried();
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
        carried: carried.has(id),
      };
    });
  });

  private subs: Subscription[] = [];
  /** Bumped per member sync, so a slow earlier sync can't overwrite a newer one. */
  private syncToken = 0;

  ngOnInit(): void {
    this.characterSocket.connect();
    this.subs.push(
      this.characterSocket.patches$.subscribe(({ characterId, patch }) => {
        const member = this.members().find(m => m.id === characterId);
        if (!member) return;
        applyJsonPatchTo(member.sheet, patch);
        this.revision.update(n => n + 1);
      }),
      this.worldStore.world$.subscribe(world => {
        // The store is app-wide; ignore a world left over from another page.
        if (!world || !this.worldName || this.worldStore.worldName !== this.worldName) return;
        this.carried.set(new Set(world.travelExemptIds ?? []));
        void this.syncMembers(world.partyIds ?? []);
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['worldName'] && this.worldName) void this.loadWorld(this.worldName);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private async loadWorld(name: string): Promise<void> {
    this.loading.set(true);
    try {
      // load() runs the party -> partyIds migration and joins the world room for live patches.
      await this.worldStore.ensureLoaded(name);
      const world = this.worldStore.worldValue;
      if (world && this.worldStore.worldName === name) {
        this.carried.set(new Set(world.travelExemptIds ?? []));
        await this.syncMembers(world.partyIds ?? []);
      }
    } catch (err) {
      console.error('[PartyPanel] Gruppe konnte nicht geladen werden', err);
    } finally {
      this.loading.set(false);
    }
  }

  /** Bring the loaded sheets in line with the party list; only newcomers are fetched. */
  private async syncMembers(ids: string[]): Promise<void> {
    const current = this.members();
    if (current.length === ids.length && current.every((m, i) => m.id === ids[i])) return;

    const token = ++this.syncToken;
    const known = new Map(current.map(m => [m.id, m]));
    const next: Member[] = [];
    for (const id of ids) {
      let member = known.get(id);
      if (!member) {
        const sheet: CharacterSheet | null = await this.characterApi
          .loadCharacter(id)
          .catch(() => null);
        if (token !== this.syncToken) return;
        if (!sheet) continue;
        this.characterSocket.joinCharacter(id);
        member = { id, sheet };
      }
      next.push(member);
    }
    this.members.set(next);
  }

  toggle(): void {
    this.collapsed.update(v => !v);
    try {
      localStorage.setItem(COLLAPSED_KEY, this.collapsed() ? '1' : '0');
    } catch {
      // A lost preference is not worth an error.
    }
  }

  /** GM: mark a member as carried (or not) — synced to everyone through the world. */
  toggleCarried(id: string): void {
    if (!this.isGM) return;
    const next = new Set(this.carried());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.worldStore.applyPatch({ path: 'travelExemptIds', value: [...next] });
  }

  /** Drain Ausdauer from every party member — the cost of a stretch of travel. Carried members are spared. */
  drainAll(): void {
    if (!this.isGM) return;
    const amount = this.drainAmount();
    const carried = this.carried();

    for (const { id, sheet } of this.members()) {
      if (carried.has(id)) continue;
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
