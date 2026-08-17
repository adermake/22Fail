import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { AssetFile } from '../../model/asset-browser.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SoulBlock } from '../../model/soul-block.model';
import {
  CompanionBlock, blankCompanion, companionFromSoul,
} from '../../model/companion-block.model';
import {
  NpcStatKey, NPC_STAT_KEYS, NpcStatblock, effectiveNpcStats,
} from '../../model/npc-statblock.model';
import { SummonAssets, SummonEditorService } from '../../services/summon-editor.service';

/**
 * Begleiter tab — the character's summons, familiars and permanent companions. Each entry holds a
 * full NpcStatblock, edited in the same NPC editor the GM uses (soul-bound ones keep their stats
 * locked). Every Begleiter is always draggable onto the map from the lobby; summoning runes in
 * spells just reference an entry from this list.
 */
@Component({
  selector: 'app-companions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './companions.component.html',
  styleUrl: './companions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanionsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  private summonEditor = inject(SummonEditorService);
  private cdr = inject(ChangeDetectorRef);

  /** Soul picked in the "aus Seele" dropdown. */
  soulPick = '';

  readonly statLabels: Record<NpcStatKey, string> = {
    strength: 'STR', dexterity: 'GES', speed: 'SPD',
    intelligence: 'INT', constitution: 'KON', wille: 'WIL',
  };
  /** Sheet's 3×2 order: STR/KON/SPD then GES/INT/WIL. */
  readonly statGrid: NpcStatKey[] = ['strength', 'constitution', 'speed', 'dexterity', 'intelligence', 'wille'];

  get companions(): CompanionBlock[] { return this.sheet.companions ?? []; }
  get souls(): SoulBlock[] { return this.sheet.souls ?? []; }

  // ── Display helpers ─────────────────────────────────────────────────────────

  companionLevel(c: CompanionBlock): number {
    return c.statblock.soul?.level ?? c.statblock.level ?? 1;
  }

  companionStat(c: CompanionBlock, k: NpcStatKey): number {
    const sb = c.statblock;
    if (sb.soul) return effectiveNpcStats(sb.soul, sb.body)[k];
    return (sb as any)[k] ?? 0;
  }

  /** Würfelmodifikator, same convention as the player stat card: negative helps, positive hurts. */
  companionMod(c: CompanionBlock, k: NpcStatKey): number {
    return Math.trunc((10 - this.companionStat(c, k)) / 4);
  }

  companionPortrait(c: CompanionBlock): string {
    return c.statblock.image || c.statblock.defaultPortrait || '';
  }

  skillCount(c: CompanionBlock): number { return (c.statblock.customSkills ?? []).length; }
  spellCount(c: CompanionBlock): number { return (c.statblock.spells ?? []).length; }

  // ── Assets handed to the Begleiter editor ───────────────────────────────────

  /** Everything the character knows/owns, so a Begleiter can be equipped and skilled from it. */
  private get assets(): SummonAssets {
    const wrap = (list: any[] | undefined, type: string, folder: string): AssetFile[] =>
      (list ?? []).filter(x => x).map((x, i) => ({
        id: 'owner_' + type + '_' + i,
        name: x?.name ?? `${type} ${i + 1}`,
        type: type as any,
        folderId: folder,
        path: `${folder}/${x?.name ?? i}`,
        data: x,
        createdAt: 0, updatedAt: 0,
      } as AssetFile));
    return {
      items: wrap(this.sheet.inventory, 'item', '/Inventar'),
      skills: wrap(this.sheet.skills, 'skill', '/Fähigkeiten'),
      spells: wrap(this.sheet.spells, 'spell', '/Zauber'),
      runes: ((this.sheet.runes ?? []).filter(r => r !== null)) as RuneBlock[],
    };
  }

  // ── Create / edit / remove ──────────────────────────────────────────────────

  /** Free-form Begleiter: authored from scratch, exactly like the GM builds an NPC. */
  async addBlank(): Promise<void> {
    const companion = blankCompanion();
    const built = await this.summonEditor.open(null, companion.statblock, this.assets);
    if (!built) return;
    companion.statblock = built;
    companion.name = built.name || companion.name;
    this.save([...this.companions, companion]);
  }

  /** Soul-bound Begleiter: the soul's stats are locked in, the body is the player's to shape. */
  async addFromSoul(): Promise<void> {
    const soul = this.souls.find(s => s.id === this.soulPick);
    if (!soul) return;
    this.soulPick = '';
    const companion = companionFromSoul(soul);
    const built = await this.summonEditor.open(soul, companion.statblock, this.assets);
    if (!built) return;
    companion.statblock = built;
    companion.name = built.name || companion.name;
    this.save([...this.companions, companion]);
  }

  async edit(companion: CompanionBlock): Promise<void> {
    const soul = companion.soulId ? this.souls.find(s => s.id === companion.soulId) ?? null : null;
    // A soul-bound Begleiter whose soul was discarded keeps its locked stats via statblock.soul.
    const locked = companion.soulId ? soul ?? this.soulFromStatblock(companion) : null;
    const built = await this.summonEditor.open(locked, companion.statblock, this.assets);
    if (!built) return;
    this.save(this.companions.map(c =>
      c.id === companion.id ? { ...c, statblock: built, name: built.name || c.name } : c
    ));
  }

  duplicate(companion: CompanionBlock): void {
    const copy: CompanionBlock = {
      ...JSON.parse(JSON.stringify(companion)) as CompanionBlock,
      id: 'comp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
      name: companion.name + ' (Kopie)',
      createdAt: Date.now(),
    };
    copy.statblock.name = copy.name;
    this.save([...this.companions, copy]);
  }

  remove(companion: CompanionBlock): void {
    if (!confirm(`„${companion.name}" wirklich löschen?`)) return;
    this.save(this.companions.filter(c => c.id !== companion.id));
  }

  rename(companion: CompanionBlock, name: string): void {
    const trimmed = name.trim();
    if (!trimmed || trimmed === companion.name) return;
    this.save(this.companions.map(c =>
      c.id === companion.id ? { ...c, name: trimmed, statblock: { ...c.statblock, name: trimmed } } : c
    ));
  }

  private save(next: CompanionBlock[]): void {
    this.sheet.companions = next;
    this.patch.emit({ path: 'companions', value: next });
    this.cdr.markForCheck();
  }

  /** Rebuild a minimal soul from the statblock, so an orphaned soul-bound Begleiter stays locked. */
  private soulFromStatblock(companion: CompanionBlock): SoulBlock | null {
    const soul = companion.statblock.soul;
    if (!soul) return null;
    const stats = {} as Record<NpcStatKey, number>;
    for (const k of NPC_STAT_KEYS) stats[k] = soul.stats[k] ?? 1;
    return {
      id: companion.soulId ?? 'orphan',
      sourceName: companion.soulName ?? companion.name,
      sourceType: 'npc',
      level: soul.level,
      stats,
      skills: [],
      createdAt: companion.createdAt,
    };
  }

  trackStatblock(_: number, c: CompanionBlock): NpcStatblock { return c.statblock; }
}
