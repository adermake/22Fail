import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  NpcStatblock,
  NpcSoul,
  NpcStatKey,
  NPC_STAT_KEYS,
  NpcBodyStatMod,
  createEmptyNpcSoul,
  createEmptyNpcBody,
  effectiveNpcStats,
  soulPointBudget,
  soulBudget,
  soulPointsSpent,
  soulPointsRemaining,
  distributeByRatio,
  normalizeNpcSoul,
  normalizeNpcVariation,
  defaultRollEntry,
  NpcRollList,
  NpcRollListKey,
  NpcGearTemplate,
  NpcEquipmentGroups,
  NpcRollBounds,
} from '../../model/npc-statblock.model';
import { CETRIS_LABEL, CETRIS_ORDER, CetrisKey } from '../../model/current-events.model';
import { ARMOR_TYPES, WEAPON_STAT_KEYS } from '../../model/forging.model';
import { DEFAULT_LEVEL_CHANCE, applyDerivedNpcStats, equipmentKind } from '../../utils/npc-roll.util';
import { canMerge, mergeStacks } from '../../utils/item-stack.util';
import { applyJsonPatchTo } from '../../utils/json-patch.util';
import { defaultBudgetForLevel } from '../../utils/gear-generator.util';
import { WeaponTypeService } from '../../services/weapon-type.service';
import { NpcRollBarComponent } from './npc-roll-bar/npc-roll-bar.component';
import { NpcRollChanceComponent } from './npc-roll-bar/npc-roll-chance.component';
import { NpcRollBoundsComponent } from './npc-roll-bar/npc-roll-bounds.component';
import { AssetFile } from '../../model/asset-browser.model';
import { SkillBlock } from '../../model/skill-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { ItemBlock, ResourceItemType } from '../../model/item-block.model';
import { createResourceItem } from '../../model/brewing.model';
import { assetEntryId } from '../../model/gm-desk.model';
import {
  CLASS_DEFINITIONS,
  SKILL_DEFINITIONS,
} from '../../data/skill-definitions';
import { NpcGeneratorService } from '../../services/npc-generator.service';
import { ImageService } from '../../services/image.service';
import { RaceService } from '../../services/race.service';
import { Race } from '../../model/race.model';
import { SkillEditorComponent } from '../skill-editor/skill-editor.component';
import { ItemEditorComponent } from '../../sheet/item-editor/item-editor.component';
import { SpellEditorOverlayComponent } from '../../sheet/spell-editor-overlay/spell-editor-overlay.component';
import { ItemComponent } from '../../sheet/item/item.component';
import { SpellComponent } from '../../sheet/spell/spell.component';
import { SkillComponent } from '../../sheet/skill/skill.component';
import { ForgingComponent } from '../../sheet/forging/forging.component';
import { GearGeneratorComponent } from '../gear-generator/gear-generator.component';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SpellCounter } from '../../model/spell-block-model';
import { RuneBlock } from '../../model/rune-block.model';
import { goldValue, isUnidentified, kindLabel, previewText } from '../../utils/entry-preview.util';

interface LibFolder { path: string; label: string; files: AssetFile[]; }

/** One racial ability, flattened out of a race so the tree can list it like a class skill. */
interface RaceSkillEntry {
  /** Stable row id: race + bucket + position (racial skills have no definition id). */
  key: string;
  skill: SkillBlock;
  raceId: string;
  /** Where it sits in the race: Vorteil, Nachteil or "Stufe N". */
  origin: string;
}

interface RaceGroup { raceId: string; raceName: string; entries: RaceSkillEntry[]; }

@Component({
  selector: 'app-npc-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, SkillEditorComponent, ItemEditorComponent, SpellEditorOverlayComponent, ItemComponent, SpellComponent, SkillComponent, ForgingComponent, GearGeneratorComponent, NpcRollBarComponent, NpcRollChanceComponent, NpcRollBoundsComponent],
  templateUrl: './npc-editor.component.html',
  styleUrl: './npc-editor.component.css',
})
export class NpcEditorComponent implements OnInit, OnDestroy {
  @Input() statblock!: NpcStatblock;
  @Input() availableSpells: AssetFile[] = [];
  @Input() availableItems: AssetFile[] = [];
  @Input() availableSkills: AssetFile[] = [];
  @Input() availableRunes: RuneBlock[] = [];
  /** Summon mode: the soul's stats + level are fixed (read-only); only body/skills are editable. */
  @Input() soulLocked = false;
  /** Schmiedematerialien, Brau-Wirkstoffe und Extraktoren — als Beute (Rohstoff) wählbar. */
  @Input() availableMaterials: AssetFile[] = [];
  @Input() availableIngredients: AssetFile[] = [];
  @Input() availableExtractors: AssetFile[] = [];
  // Kept for backward-compatible parent bindings (weapon-gen removed from the UI).
  @Input() availableForgeTraits: AssetFile[] = [];

  @Output() save = new EventEmitter<NpcStatblock>();
  @Output() cancel = new EventEmitter<void>();

  private npcGen = inject(NpcGeneratorService);
  private cdr = inject(ChangeDetectorRef);
  private imageService = inject(ImageService);
  private raceService = inject(RaceService);
  readonly weaponTypeService = inject(WeaponTypeService);

  draft!: NpcStatblock;

  // ─── Static metadata ────────────────────────────────────────────────────────
  readonly statKeys = NPC_STAT_KEYS;
  readonly statMeta: Record<NpcStatKey, { label: string }> = {
    strength:     { label: 'Stärke' },
    dexterity:    { label: 'Geschick' },
    speed:        { label: 'Tempo' },
    intelligence: { label: 'Intelligenz' },
    constitution: { label: 'Konstitution' },
    wille:        { label: 'Wille' },
  };
  /** Same 2×3 arrangement as the character sheet: STR/KON/SPD then GES/INT/WIL. */
  readonly statGrid: NpcStatKey[] = ['strength', 'constitution', 'speed', 'dexterity', 'intelligence', 'wille'];

  /** Stabilität the worn armour actually provides: Σ stability ÷ 5, same rule as the sheet. */
  get equipmentStability(): number {
    const sum = (this.draft?.equipment ?? [])
      .filter(i => i && !i.lost)
      .reduce((acc, i) => acc + (i.stability ?? 0), 0);
    return Math.floor(sum / 5);
  }

  /** Effizienz of the wielded weapon(s) — the best one, mirroring the lobby's default. */
  get equipmentEfficiency(): number {
    const weapons = (this.draft?.equipment ?? [])
      .filter(i => i && !i.lost && i.itemType === 'weapon' && i.efficiency !== undefined);
    return weapons.length ? Math.max(...weapons.map(w => w.efficiency!)) : 0;
  }

  /** What the Körper card should SHOW for these two, given the "use equipment" toggles. */
  get shownStabilitaet(): number {
    return this.draft?.body?.useArmorStabilitaet ? this.equipmentStability : (this.draft?.body?.stabilitaet ?? 0);
  }

  get shownEffizienz(): number {
    return this.draft?.body?.useWeaponEffizienz ? this.equipmentEfficiency : (this.draft?.body?.effizienz ?? 0);
  }

  /** Würfelmodifikator = ⌊(10 − stat) / 4⌋ (same as players: negative helps, positive hurts). */
  rollBonus(k: NpcStatKey): number {
    return Math.trunc((10 - this.effective[k]) / 4);
  }

  readonly skillClasses = Object.keys(CLASS_DEFINITIONS).sort(
    (a, b) => (CLASS_DEFINITIONS[a].tier - CLASS_DEFINITIONS[b].tier) || a.localeCompare(b),
  );

  /** New body-mod being composed in the UI. */
  newMod: NpcBodyStatMod = { stat: 'constitution', value: 1, mode: 'add' };

  // ─── UI state ───────────────────────────────────────────────────────────────
  aktuellTab: 'skills' | 'spells' | 'equipment' | 'inventory' | 'notes' = 'skills';

  /**
   * Die Datei-ID, die gerade grün aufblitzt. Ein Klick in der Bibliothek hatte vorher überhaupt
   * keine sichtbare Antwort — kein Zustand, keine Animation, und das Ergebnis oft außerhalb des
   * Blickfelds.
   */
  justAddedId: string | null = null;
  private justAddedTimer?: number;

  // Kurzinfos beim Überfahren einer Bibliothekszeile — geteilt mit dem GM-Schreibtisch.
  readonly goldValue = goldValue;
  readonly isUnidentified = isUnidentified;
  readonly kindLabel = kindLabel;
  readonly previewText = previewText;

  /** Tooltip für eine Bibliotheksdatei. */
  filePreview(file: AssetFile): string {
    return previewText(file.name, file.data);
  }
  browseCategory: 'skills' | 'items' | 'spells' | 'resources' = 'skills';
  /** Ressourcen-Browser: welche Rohstoffart gerade gelistet wird. */
  resourceTab: ResourceItemType = 'raw-material';
  readonly resourceTabs: { kind: ResourceItemType; label: string }[] = [
    { kind: 'raw-material', label: 'Materialien' },
    { kind: 'ingredient', label: 'Wirkstoffe' },
    { kind: 'extractor', label: 'Extraktoren' },
  ];
  resourceFolders: Record<ResourceItemType, LibFolder[]> = { 'raw-material': [], ingredient: [], extractor: [] };
  skillTab: 'tree' | 'library' = 'tree';
  expandedClass: string | null = null;
  treeQuery = '';
  /** Class-tree: the skill currently highlighted for preview (not yet added). */
  selectedTreeSkillId: string | null = null;
  /** Rassenfertigkeiten in the same tree: groups, open group, and the previewed row. */
  raceGroups: RaceGroup[] = [];
  private raceEntries = new Map<string, RaceSkillEntry>();
  expandedRace: string | null = null;
  selectedRaceKey: string | null = null;

  /** Library browser: folder groups per category + which folder is open (keyed "cat|path"). */
  itemFolders: LibFolder[] = [];
  spellFolders: LibFolder[] = [];
  skillFolders: LibFolder[] = [];
  expandedFolder: string | null = null;

  // Fullscreen nested editors (open flags — editingSkill/Item are null when creating new)
  skillEditorOpen = false;
  editingSkill: SkillBlock | null = null;
  editingSkillIndex: number | null = null;
  itemEditorOpen = false;
  editingItem: ItemBlock | null = null;
  editingItemIndex: number | null = null;
  spellEditorOpen = false;
  editingSpell: SpellBlock | null = null;
  editingSpellIndex: number | null = null;
  forgeOpen = false;
  /** Fast path: roll a whole set of gear instead of forging each piece by hand. */
  gearGenOpen = false;

  /** Stub sheet so read-only display components (app-item/app-spell) can render NPC previews.
   * Stats are set high so item requirement badges always read as "met" (never a false red). */
  readonly previewSheet = (() => {
    const stat = () => ({ current: 999, base: 999, bonus: 0, free: 0, gain: 0 });
    return {
      statuses: [], skills: [], equipment: [], inventory: [],
      primary_class: '', secondary_class: '', level: 1,
      strength: stat(), dexterity: stat(), speed: stat(),
      intelligence: stat(), constitution: stat(), chill: stat(),
    } as unknown as CharacterSheet;
  })();

  imageUploading = false;
  private prevBodyOverflow = '';

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.draft = JSON.parse(JSON.stringify(this.statblock));
    // Ensure the soul/body structures exist for legacy statblocks (seed the soul from current stats).
    if (!this.draft.soul) {
      this.draft.soul = createEmptyNpcSoul();
      this.draft.soul.level = this.draft.level || 1;
      for (const k of this.statKeys) {
        this.draft.soul.stats[k] = Math.max(1, (this.draft as any)[k] || 1);
      }
    }
    // Legacy `growth` souls become locked ones; their stats stay exactly as summoned until the
    // level is actually moved.
    normalizeNpcSoul(this.draft.soul);
    if (!this.draft.body) this.draft.body = createEmptyNpcBody();
    if (!this.draft.body.mods) this.draft.body.mods = [];
    if (!this.draft.customSkills) this.draft.customSkills = [];
    // Statblöcke von vor dem Inventar-Feld kennen es nicht — hier reparieren, statt überall
    // gegen undefined zu prüfen.
    if (!this.draft.inventory) this.draft.inventory = [];
    if (!this.draft.equipment) this.draft.equipment = [];

    // Unify: materialize any class-tree learnedSkillIds into editable SkillBlocks, so every skill
    // renders the same and can be tweaked locally (without touching the class-tree definitions).
    for (const id of this.draft.learnedSkillIds ?? []) {
      if (this.draft.customSkills.some(s => s.skillId === id)) continue;
      const sk = this.materializeSkill(id);
      if (sk) this.draft.customSkills.push(sk);
    }
    this.draft.learnedSkillIds = [];

    // Roll config parallel to the lists — repaired after the skills above were materialised.
    normalizeNpcVariation(this.draft);
    void this.weaponTypeService.load();
    void this.loadRaceSkills();

    // Group the library lists by their folder (like the class-tree dropdowns).
    this.itemFolders = this.groupByFolder(this.availableItems);
    this.spellFolders = this.groupByFolder(this.availableSpells);
    this.skillFolders = this.groupByFolder(this.availableSkills);
    this.resourceFolders = {
      'raw-material': this.groupByFolder(this.availableMaterials),
      ingredient: this.groupByFolder(this.availableIngredients),
      extractor: this.groupByFolder(this.availableExtractors),
    };

    // Sync the flat gameplay fields with the soul/body up front.
    this.recalc();

    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  /** Gold value of a library item, for the browser list. 0/undefined shows nothing. */
  itemValue(file: AssetFile): number {
    const value = (file.data as ItemBlock | undefined)?.value;
    return typeof value === 'number' && value > 0 ? value : 0;
  }

  // ─── Library folder grouping ────────────────────────────────────────────────
  private groupByFolder(files: AssetFile[]): LibFolder[] {
    const map = new Map<string, AssetFile[]>();
    for (const f of files ?? []) {
      const dir = this.folderPath(f.path);
      (map.get(dir) ?? map.set(dir, []).get(dir)!).push(f);
    }
    return [...map.entries()]
      .map(([path, list]) => ({
        path,
        label: this.folderLabel(path),
        files: list.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private folderPath(p: string): string {
    const i = (p || '').lastIndexOf('/');
    return i <= 0 ? '/' : p.slice(0, i);
  }
  private folderLabel(dir: string): string {
    return !dir || dir === '/' ? 'Wurzel' : dir.replace(/^\//, '');
  }

  /** Toggle a library folder open (one at a time, keyed by category so lists don't collide). */
  toggleFolder(cat: string, path: string): void {
    const key = cat + '|' + path;
    this.expandedFolder = this.expandedFolder === key ? null : key;
  }
  isFolderOpen(cat: string, path: string): boolean {
    return this.expandedFolder === cat + '|' + path;
  }

  /** Build a full editable SkillBlock from a class-tree definition id (same mapping the lobby uses). */
  private materializeSkill(id: string): SkillBlock | null {
    const def = SKILL_DEFINITIONS.find(s => s.id === id);
    if (!def) return null;
    return {
      name: def.name, class: def.class, description: def.description,
      type: def.type as SkillBlock['type'], enlightened: (def as any).enlightened ?? false,
      skillId: def.id, cost: (def as any).cost, actionType: (def as any).actionType,
    } as SkillBlock;
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.prevBodyOverflow;
    if (this.justAddedTimer) clearTimeout(this.justAddedTimer);
  }

  // ─── Soul: level → point budget → distribute over the 6 base stats ──────────
  get soul(): NpcSoul { return this.draft.soul!; }
  get budget(): number { return soulBudget(this.soul); }
  /** What the level alone would grant — shown next to the Zusatzpunkte field. */
  get levelOnlyBudget(): number { return soulPointBudget(this.soul.level); }
  get absBonusPoints(): number { return Math.abs(this.soul.bonusPoints ?? 0); }
  get spent(): number { return soulPointsSpent(this.soul); }
  get remaining(): number { return soulPointsRemaining(this.soul); }

  /** Effective stats (soul + body mods) — what actually feeds the derived readout & gameplay. */
  get effective(): Record<NpcStatKey, number> { return effectiveNpcStats(this.soul, this.draft.body); }

  setLevel(v: number): void {
    this.soul.level = Math.max(1, Math.floor(v) || 1);
    // Locked: the new budget is dealt out again along the frozen ratio. Unlocked: the level only
    // moves the budget, and the extra point waits for someone to place it.
    if (this.soul.locked) {
      this.soul.stats = distributeByRatio(this.budget, this.soul.ratio);
    }
    this.recalc();
  }

  /**
   * Zusatzpunkte: moves the budget without touching the level.
   *
   * Same split as `setLevel` — a locked soul re-deals the new budget along its frozen ratio, an
   * unlocked one just gets more (or fewer) points to place by hand. Taking points away can leave
   * the pad over budget; that shows as the usual red warning rather than silently trimming stats
   * the GM entered.
   */
  setBonusPoints(v: number): void {
    const n = Math.floor(v) || 0;
    this.soul.bonusPoints = n === 0 ? undefined : n;
    if (this.soul.locked) {
      this.soul.stats = distributeByRatio(this.budget, this.soul.ratio);
    }
    this.recalc();
  }

  get growthLocked(): boolean { return !!this.soul.locked; }

  /**
   * Freezes the current proportions and lets the level drive the stats, or hands them back.
   *
   * Locking re-deals immediately so the pad shows the numbers the level actually implies —
   * locking at the level you are already on is a no-op in practice, which is what makes it safe
   * to toggle mid-build. Unlocking keeps whatever is on the pad.
   */
  toggleGrowthLock(): void {
    if (this.soul.locked) {
      this.soul.locked = false;
    } else {
      this.soul.locked = true;
      this.soul.ratio = { ...this.soul.stats };
      this.soul.stats = distributeByRatio(this.budget, this.soul.ratio);
    }
    this.recalc();
  }

  /** Share of the budget a stat holds, in percent — what the ratio means in practice. */
  growthOf(k: NpcStatKey): number {
    const total = this.spent || 1;
    return Math.round((this.soul.stats[k] / total) * 100);
  }

  incStat(key: NpcStatKey): void {
    if (this.growthLocked || this.remaining <= 0) return;
    this.soul.stats[key]++;
    this.recalc();
  }
  decStat(key: NpcStatKey): void {
    if (this.growthLocked) return;
    if (this.soul.stats[key] <= 1) return; // min 1 in every stat
    this.soul.stats[key]--;
    this.recalc();
  }
  setStat(key: NpcStatKey, v: number): void {
    if (this.growthLocked) return;
    let n = Math.max(1, Math.floor(v) || 1);
    // Clamp so the total never exceeds the budget.
    const others = this.spent - this.soul.stats[key];
    n = Math.min(n, this.budget - others);
    this.soul.stats[key] = Math.max(1, n);
    this.recalc();
  }

  // ─── Body: Stabilität / Effizienz + per-stat add/override mods ──────────────
  addBodyMod(): void {
    this.draft.body!.mods.push({ ...this.newMod });
    this.newMod = { stat: 'constitution', value: 1, mode: 'add' };
    this.recalc();
  }
  removeBodyMod(i: number): void {
    this.draft.body!.mods.splice(i, 1);
    this.recalc();
  }

  // ─── Derived (all from the effective 6 stats, standard player formulas) ─────
  get derived() {
    const e = this.effective;
    const L = this.soul.level;
    return {
      maxHealth: e.constitution * 5,
      maxEnergy: e.dexterity * 5,
      maxMana: e.intelligence * 5,
      fokus: this.draft.fokus,
      reaktion: this.npcGen.calcReaktionswert(e.wille, L),
      grundbonus: this.npcGen.calcGrundbonus(L, e.wille),
      bewegung: Math.floor(8 + e.speed / 4),
    };
  }

  /** Write the effective stats + all derived values into the flat gameplay fields consumers read. */
  recalc(): void {
    // Same routine the spawn roller uses, so an edited and a rolled NSC can't disagree.
    applyDerivedNpcStats(this.draft, this.npcGen);
  }

  /** Fokus depends on Intelligenz + any fokus-granting learned skills (kept via their skillId). */
  private recalcFokus(): void {
    const ids = this.draft.customSkills.filter(s => s.skillId).map(s => s.skillId!);
    this.draft.fokus = this.npcGen.calcFokus(this.effective.intelligence, ids);
  }

  // ─── Skills: class tree ───────────────────────────────────────────────────
  classTier(cls: string): number { return CLASS_DEFINITIONS[cls]?.tier ?? 1; }

  skillsForClass(cls: string) {
    const q = this.treeQuery.trim().toLowerCase();
    // Searching the group itself ("Ritter") lists everything it grants; otherwise match names.
    const wholeGroup = !q || cls.toLowerCase().includes(q);
    return SKILL_DEFINITIONS
      .filter(s => s.class === cls && (wholeGroup || s.name.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  toggleClass(cls: string): void {
    this.expandedClass = this.expandedClass === cls ? null : cls;
  }

  /** Class-tree click just SELECTS a skill for preview — you read it, then press Hinzufügen. */
  selectTreeSkill(id: string): void {
    this.selectedRaceKey = null;
    this.selectedTreeSkillId = this.selectedTreeSkillId === id ? null : id;
  }

  /** The selected tree row (class skill OR racial ability) materialised for the preview. */
  get selectedTreeSkill(): SkillBlock | null {
    if (this.selectedTreeSkillId) return this.materializeSkill(this.selectedTreeSkillId);
    if (this.selectedRaceKey) return this.materializeRaceSkill(this.selectedRaceKey);
    return null;
  }

  /** True once a class-tree skill has been added to this NPC (by its definition id). */
  isAdded(id: string): boolean { return this.draft.customSkills.some(s => s.skillId === id); }

  /** Already on this NSC? By definition id when there is one, else by name (racial/library). */
  isSkillAdded(sk: SkillBlock): boolean {
    return this.draft.customSkills.some(s => (sk.skillId ? s.skillId === sk.skillId : s.name === sk.name));
  }

  /** Label state of the Hinzufügen button, for either kind of tree row. */
  get selectedIsAdded(): boolean {
    const sk = this.selectedTreeSkill;
    return !!sk && this.isSkillAdded(sk);
  }

  addSelectedTreeSkill(): void {
    const sk = this.selectedTreeSkill;
    if (!sk) return;
    this.listPush('customSkills', sk);
    this.recalcFokus();
    this.selectedTreeSkillId = null;
    this.selectedRaceKey = null;
  }

  /** Classes shown in the tree — while searching, only the ones with a hit. */
  get visibleSkillClasses(): string[] {
    if (!this.treeQuery.trim()) return this.skillClasses;
    return this.skillClasses.filter(cls => this.skillsForClass(cls).length > 0);
  }

  // ─── Skills: Rassenfertigkeiten ───────────────────────────────────────────
  /** Flatten every race's Vorteile, Nachteile and Stufen into searchable tree rows. */
  private async loadRaceSkills(): Promise<void> {
    let races: Race[] = [];
    try {
      races = await this.raceService.getRaces();
    } catch {
      races = []; // Kein Rassen-Endpunkt erreichbar: der Klassenbaum funktioniert weiter.
    }

    this.raceEntries.clear();
    this.raceGroups = [];
    for (const race of races) {
      const entries: RaceSkillEntry[] = [];
      const push = (skill: SkillBlock | undefined, bucket: string, origin: string): void => {
        if (!skill?.name) return;
        const entry: RaceSkillEntry = { key: `${race.id}|${bucket}`, skill, raceId: race.id, origin };
        entries.push(entry);
        this.raceEntries.set(entry.key, entry);
      };

      (race.advantages ?? []).forEach((sk, i) => push(sk, `adv${i}`, 'Vorteil'));
      (race.disadvantages ?? []).forEach((sk, i) => push(sk, `dis${i}`, 'Nachteil'));
      (race.skills ?? []).forEach((group, gi) =>
        (group.skills ?? []).forEach((sk, si) => push(sk, `lvl${gi}-${si}`, `Stufe ${group.levelRequired}`)),
      );

      if (entries.length) this.raceGroups.push({ raceId: race.id, raceName: race.name, entries });
    }
    this.cdr.markForCheck();
  }

  raceSkillsFor(group: RaceGroup): RaceSkillEntry[] {
    const q = this.treeQuery.trim().toLowerCase();
    // Same rule as the classes: the race name lists everything, otherwise match skill names.
    if (!q || group.raceName.toLowerCase().includes(q)) return group.entries;
    return group.entries.filter(e => e.skill.name.toLowerCase().includes(q));
  }

  /** Races shown in the tree — while searching, only the ones with a hit. */
  get visibleRaceGroups(): RaceGroup[] {
    if (!this.treeQuery.trim()) return this.raceGroups;
    return this.raceGroups.filter(g => this.raceSkillsFor(g).length > 0);
  }

  toggleRace(raceId: string): void {
    this.expandedRace = this.expandedRace === raceId ? null : raceId;
  }

  selectRaceSkill(key: string): void {
    this.selectedTreeSkillId = null;
    this.selectedRaceKey = this.selectedRaceKey === key ? null : key;
  }

  /** A racial ability copied for this NSC: tagged as racial so class gating can't disable it. */
  private materializeRaceSkill(key: string): SkillBlock | null {
    const entry = this.raceEntries.get(key);
    if (!entry) return null;
    const copy = JSON.parse(JSON.stringify(entry.skill)) as SkillBlock;
    copy.skillSource = 'race';
    copy.sourceRaceId = entry.raceId;
    return copy;
  }

  /** Kurzes grünes Aufblitzen der angeklickten Zeile — die Quittung für den Klick. */
  private flashAdded(fileId: string): void {
    this.justAddedId = fileId;
    if (this.justAddedTimer) clearTimeout(this.justAddedTimer);
    this.justAddedTimer = window.setTimeout(() => {
      this.justAddedId = null;
      this.cdr.markForCheck();
    }, 450);
  }

  // ─── Skills: library + custom ─────────────────────────────────────────────
  addSkillFromLibrary(file: AssetFile): void {
    const skill = JSON.parse(JSON.stringify(file.data)) as SkillBlock;
    this.listPush('customSkills', skill);
    this.aktuellTab = 'skills';
    this.flashAdded(file.id);
  }

  openSkillEditor(index: number | null): void {
    this.editingSkillIndex = index;
    this.editingSkill = index === null ? null : JSON.parse(JSON.stringify(this.draft.customSkills[index]));
    this.skillEditorOpen = true;
  }

  onSkillSave(skill: SkillBlock): void {
    if (this.editingSkillIndex === null) this.listPush('customSkills', skill);
    else this.draft.customSkills[this.editingSkillIndex] = skill;
    this.closeSkillEditor();
  }

  closeSkillEditor(): void {
    this.skillEditorOpen = false;
    this.editingSkill = null;
    this.editingSkillIndex = null;
  }

  removeCustomSkill(index: number): void { this.listRemove('customSkills', index); this.recalcFokus(); }

  // ─── Variation: Fest / Zufällig ───────────────────────────────────────────
  // Every push/splice on the four lists goes through these two, so `variation.lists[key].entries`
  // stays index-aligned with the list it describes.

  rollList(key: NpcRollListKey): NpcRollList {
    return normalizeNpcVariation(this.draft).lists![key]!;
  }

  isRandom(key: NpcRollListKey): boolean {
    return this.draft.variation?.lists?.[key]?.mode === 'random';
  }

  private listPush(key: NpcRollListKey, value: unknown): void {
    (this.draft[key] as unknown[]).push(value);
    this.rollList(key).entries.push(defaultRollEntry());
  }

  private listRemove(key: NpcRollListKey, index: number): void {
    (this.draft[key] as unknown[]).splice(index, 1);
    this.rollList(key).entries.splice(index, 1);
  }

  /** Stats: roll a level in a range and shuffle a few points at every spawn. */
  setStatVariation(on: boolean): void {
    const variation = normalizeNpcVariation(this.draft);
    variation.stats = {
      levelMin: this.soul.level, levelMax: this.soul.level, shuffle: 0,
      ...variation.stats,
      enabled: on,
    };
  }

  setVariationLevel(bound: 'levelMin' | 'levelMax', value: number): void {
    const stats = this.draft.variation?.stats;
    if (!stats) return;
    stats[bound] = Math.max(1, Math.floor(value) || 1);
    if (stats.levelMin > stats.levelMax) {
      if (bound === 'levelMin') stats.levelMax = stats.levelMin;
      else stats.levelMin = stats.levelMax;
    }
  }

  setVariationShuffle(value: number): void {
    const stats = this.draft.variation?.stats;
    if (stats) stats.shuffle = Math.max(0, Math.floor(value) || 0);
  }

  /** Percent per level every chance grows by — also applies when the GM changes the level in the lobby. */
  get levelChance(): number {
    return this.draft.variation?.levelChance ?? DEFAULT_LEVEL_CHANCE;
  }

  setLevelChance(value: number): void {
    normalizeNpcVariation(this.draft).levelChance = Math.max(0, Math.round(Number(value) || 0));
  }

  // ─── Cetris als Beute ─────────────────────────────────────────────────────
  readonly cetrisKeys = CETRIS_ORDER;
  readonly cetrisLabel = CETRIS_LABEL;

  /** Read-only view for the template; the draft only gets a `cetris` block once something is typed. */
  cetrisBounds(key: CetrisKey): NpcRollBounds {
    return this.draft.cetris?.[key] ?? { min: 0 };
  }

  setCetris(key: CetrisKey, bound: 'min' | 'max', value: number | string | null): void {
    const cetris = (this.draft.cetris ??= {});
    const bounds = (cetris[key] ??= { min: 0 });
    if (bound === 'max' && (value === null || value === '' || !Number.isFinite(+value))) {
      delete bounds.max;
      return;
    }
    bounds[bound] = Math.max(0, Math.floor(+(value ?? 0)) || 0);
  }

  // Generated equipment slots — forged fresh at every spawn while equipment is „Zufällig".
  readonly armorTypes = ARMOR_TYPES;
  readonly weaponStatKeys = WEAPON_STAT_KEYS;
  gearTemplateOpen = false;

  private ensureGear(): NpcGearTemplate {
    return (normalizeNpcVariation(this.draft).gear ??= {
      settings: { budget: defaultBudgetForLevel(this.soul.level), variation: 25, mutation: 25, poolIds: [] },
      slots: [],
    });
  }

  private gearSlotKey(): string {
    return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  addArmorSlot(armorSlot: ItemBlock['armorType']): void {
    this.ensureGear().slots.push({ key: this.gearSlotKey(), chance: 0.5, armorSlot });
  }

  addWeaponSlot(): void {
    this.ensureGear().slots.push({
      key: this.gearSlotKey(), chance: 1,
      weaponTypeName: this.weaponTypeService.types()[0]?.name ?? '', statRequirementKey: 'STR',
    });
  }

  removeGearSlot(index: number): void {
    this.draft.variation?.gear?.slots.splice(index, 1);
  }

  armorSlotLabel(slot: ItemBlock['armorType']): string {
    return ARMOR_TYPES.find(a => a.itemBlockType === slot)?.name ?? 'Rüstung';
  }

  get gearSummary(): string {
    const s = this.draft.variation?.gear?.settings;
    if (!s) return 'Standard-Einstellungen';
    const pool = s.poolIds.length ? `${s.poolIds.length} Material(ien)` : 'alle Materialien';
    return `${s.budget} SP je Teil · Streuung ${s.variation} % · Mutation ${s.mutation} % · ${pool}`;
  }

  openGearTemplate(): void {
    this.ensureGear();
    this.gearTemplateOpen = true;
  }

  onGearTemplate(settings: NpcGearTemplate['settings']): void {
    this.ensureGear().settings = settings;
  }

  /** Rüstung / Waffen limits for random equipment. */
  get equipmentGroups(): NpcEquipmentGroups {
    return normalizeNpcVariation(this.draft).equipmentGroups!;
  }

  /** Expected pieces in a group: chances of hand-picked items of that kind plus its generated slots. */
  groupExpected(kind: 'armor' | 'weapon'): number {
    const entries = this.rollList('equipment').entries;
    const picked = this.draft.equipment.reduce(
      (sum, item, i) => sum + (equipmentKind(item) === kind ? (entries[i]?.chance ?? 0) : 0), 0);
    const generated = (this.draft.variation?.gear?.slots ?? [])
      .filter(slot => (kind === 'armor') === !!slot.armorSlot)
      .reduce((sum, slot) => sum + (slot.chance || 0), 0);
    return picked + generated;
  }

  // ─── Items: library + custom ──────────────────────────────────────────────

  /** Welche der beiden Gegenstandslisten der Editor gerade bearbeitet. */
  private itemTarget: 'equipment' | 'inventory' = 'equipment';

  private itemList(target: 'equipment' | 'inventory'): ItemBlock[] {
    return target === 'inventory' ? this.draft.inventory : this.draft.equipment;
  }

  /**
   * Ein Klick im Bibliotheks-Browser legt den Gegenstand dorthin, wo die mittlere Spalte gerade
   * hinsieht — und schaltet sie auf den passenden Reiter, damit man sieht, dass etwas passiert
   * ist. Vorher landete alles unsichtbar in der Ausrüstung, während die Spalte auf Fertigkeiten
   * stand: der Klick fühlte sich an, als hätte er nichts getan.
   */
  addItemFromLibrary(file: AssetFile): void {
    const target = this.aktuellTab === 'inventory' ? 'inventory' : 'equipment';
    this.addItemTo(target, JSON.parse(JSON.stringify(file.data)) as ItemBlock);
    this.aktuellTab = target;
    this.flashAdded(file.id);
  }

  /** Stackable items join an equal pile instead of opening a second one (same rule as the sheet). */
  private addItemTo(target: 'equipment' | 'inventory', item: ItemBlock): void {
    const list = this.itemList(target);
    const at = list.findIndex(existing => canMerge(existing, item));
    if (at >= 0) list[at] = mergeStacks(list[at]!, item).merged;
    else this.listPush(target, item);
  }

  /**
   * Materialien, Wirkstoffe und Extraktoren sind eigene Assets, keine Items. Als Beute werden sie zu
   * dem stapelbaren Rohstoff-Item, das auch der Bogen führt: `libraryAssetId` verknüpft es mit dem
   * Rezept, und der GM-Schreibtisch vergibt es an die Rohstoffe statt ins Inventar.
   */
  addResourceFromLibrary(kind: ResourceItemType, file: AssetFile): void {
    const data = file.data as { name?: string; description?: string } | undefined;
    const item = createResourceItem(kind, data?.name || file.name, assetEntryId(file), 1,
      data?.description ? { description: data.description } : undefined);
    this.addItemTo('inventory', item);
    this.aktuellTab = 'inventory';
    this.flashAdded(file.id);
  }

  /** app-item edits itself through patches (e.g. the Anzahl +/−); apply them to the draft item. */
  onItemPatch(target: 'equipment' | 'inventory', index: number, patch: JsonPatch): void {
    const item = this.itemList(target)[index];
    if (item) applyJsonPatchTo(item, patch);
  }

  openItemEditor(index: number | null): void {
    this.itemTarget = 'equipment';
    this.editingItemIndex = index;
    this.editingItem = index === null ? null : JSON.parse(JSON.stringify(this.draft.equipment[index]));
    this.itemEditorOpen = true;
  }

  openInventoryEditor(index: number | null): void {
    this.itemTarget = 'inventory';
    this.editingItemIndex = index;
    this.editingItem = index === null ? null : JSON.parse(JSON.stringify(this.draft.inventory[index]));
    this.itemEditorOpen = true;
  }

  onItemSave(item: ItemBlock): void {
    if (this.editingItemIndex === null) this.addItemTo(this.itemTarget, item);
    else this.itemList(this.itemTarget)[this.editingItemIndex] = item;
    this.closeItemEditor();
  }

  closeItemEditor(): void {
    this.itemEditorOpen = false;
    this.editingItem = null;
    this.editingItemIndex = null;
    this.itemTarget = 'equipment';
  }

  removeEquipment(index: number): void { this.listRemove('equipment', index); }
  removeInventoryItem(index: number): void { this.listRemove('inventory', index); }

  // ─── Forge (all materials unlocked) ───────────────────────────────────────
  openForge(): void { this.forgeOpen = true; }
  openGearGen(): void { this.gearGenOpen = true; }
  closeGearGen(): void { this.gearGenOpen = false; }

  /** Take everything the generator rolled straight into the NSC's gear. */
  onGeneratedGear(items: ItemBlock[]): void {
    for (const item of items) this.addItemTo('equipment', item);
  }
  closeForge(): void { this.forgeOpen = false; }

  /** The forge emits the finished item via a patch to /inventory/-; add it to NPC equipment. */
  onForgePatch(p: JsonPatch): void {
    if (p.path === '/inventory/-' && p.value) {
      this.addItemTo('equipment', p.value as ItemBlock);
    }
    // Other patches (e.g. resource consumption) are irrelevant for an NPC — ignored.
  }

  // ─── Spells: library + custom ─────────────────────────────────────────────
  addSpellFromLibrary(file: AssetFile): void {
    this.listPush('spells', JSON.parse(JSON.stringify(file.data)) as SpellBlock);
    this.aktuellTab = 'spells';
    this.flashAdded(file.id);
  }

  openSpellEditor(index: number | null): void {
    this.editingSpellIndex = index;
    this.editingSpell = index === null ? null : JSON.parse(JSON.stringify(this.draft.spells[index]));
    this.spellEditorOpen = true;
  }

  onSpellSave(spell: SpellBlock): void {
    if (this.editingSpellIndex === null) this.listPush('spells', spell);
    else this.draft.spells[this.editingSpellIndex] = spell;
    this.closeSpellEditor();
  }

  closeSpellEditor(): void {
    this.spellEditorOpen = false;
    this.editingSpell = null;
    this.editingSpellIndex = null;
  }

  removeSpell(index: number): void { this.listRemove('spells', index); }
  getSpellName(spell: SpellBlock): string { return (spell as any).name ?? 'Zauber'; }

  // ─── Skill preview helpers (show how a skill will read in play) ────────────
  skillCostLabel(sk: SkillBlock): string {
    if (!sk.cost) return '';
    const res = sk.cost.type === 'mana' ? 'Mana' : sk.cost.type === 'energy' ? 'Ausdauer' : 'Leben';
    return `${sk.cost.amount} ${res}${sk.cost.perRound ? '/Runde' : ''}`;
  }
  skillTypeLabel(t: SkillBlock['type']): string {
    return ({ active: 'Aktiv', passive: 'Passiv', dice_bonus: 'Würfelbonus', stat_bonus: 'Stat-Bonus', talent_bonus: 'Talent' } as Record<string, string>)[t] ?? t;
  }
  barPct(c: SpellCounter): number {
    const span = (c.max ?? 0) - (c.min ?? 0);
    if (span <= 0) return 0;
    return Math.max(0, Math.min(100, ((c.current - c.min) / span) * 100));
  }

  // ─── Image ────────────────────────────────────────────────────────────────
  get imageUrl(): string | null {
    return this.draft.image ? this.imageService.getImageUrl(this.draft.image) : null;
  }

  async onImagePick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageUploading = true;
    try {
      const id = await this.imageService.uploadImageFile(file, file.name);
      this.draft.image = id;
      this.draft.defaultPortrait = id; // also use as token head
    } catch {
      alert('Bild konnte nicht hochgeladen werden.');
    } finally {
      this.imageUploading = false;
      input.value = '';
    }
  }

  clearImage(): void {
    this.draft.image = undefined;
    this.draft.defaultPortrait = undefined;
  }

  // ─── Save / cancel ────────────────────────────────────────────────────────
  onSave(): void {
    if (!this.draft.name?.trim()) this.draft.name = 'NSC';
    // Was calcFokus(int, learnedSkillIds) — always [] after init, so saving dropped skill Fokus bonuses.
    this.recalc();
    normalizeNpcVariation(this.draft);
    this.save.emit(this.draft);
  }

  onCancel(): void { this.cancel.emit(); }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  tierClass(tier: number): string { return `tier-${Math.min(tier, 5)}`; }
}
