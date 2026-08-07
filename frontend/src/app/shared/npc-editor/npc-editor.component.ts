import {
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
  soulPointsSpent,
  soulPointsRemaining,
} from '../../model/npc-statblock.model';
import { AssetFile } from '../../model/asset-browser.model';
import { SkillBlock } from '../../model/skill-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { ItemBlock } from '../../model/item-block.model';
import {
  CLASS_DEFINITIONS,
  SKILL_DEFINITIONS,
} from '../../data/skill-definitions';
import { NpcGeneratorService } from '../../services/npc-generator.service';
import { ImageService } from '../../services/image.service';
import { SkillEditorComponent } from '../skill-editor/skill-editor.component';
import { ItemEditorComponent } from '../../sheet/item-editor/item-editor.component';
import { SpellEditorOverlayComponent } from '../../sheet/spell-editor-overlay/spell-editor-overlay.component';
import { ItemComponent } from '../../sheet/item/item.component';
import { SpellComponent } from '../../sheet/spell/spell.component';
import { SkillComponent } from '../../sheet/skill/skill.component';
import { ForgingComponent } from '../../sheet/forging/forging.component';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SpellCounter } from '../../model/spell-block-model';
import { RuneBlock } from '../../model/rune-block.model';

interface LibFolder { path: string; label: string; files: AssetFile[]; }

@Component({
  selector: 'app-npc-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, SkillEditorComponent, ItemEditorComponent, SpellEditorOverlayComponent, ItemComponent, SpellComponent, SkillComponent, ForgingComponent],
  templateUrl: './npc-editor.component.html',
  styleUrl: './npc-editor.component.css',
})
export class NpcEditorComponent implements OnInit, OnDestroy {
  @Input() statblock!: NpcStatblock;
  @Input() availableSpells: AssetFile[] = [];
  @Input() availableItems: AssetFile[] = [];
  @Input() availableSkills: AssetFile[] = [];
  @Input() availableRunes: RuneBlock[] = [];
  // Kept for backward-compatible parent bindings (weapon-gen removed from the UI).
  @Input() availableMaterials: AssetFile[] = [];
  @Input() availableForgeTraits: AssetFile[] = [];

  @Output() save = new EventEmitter<NpcStatblock>();
  @Output() cancel = new EventEmitter<void>();

  private npcGen = inject(NpcGeneratorService);
  private imageService = inject(ImageService);

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

  /** Roll bonus for a stat = ⌊(stat − 10) / 4⌋ (same as players), using the effective value. */
  rollBonus(k: NpcStatKey): number {
    return Math.trunc((this.effective[k] - 10) / 4);
  }

  readonly skillClasses = Object.keys(CLASS_DEFINITIONS).sort(
    (a, b) => (CLASS_DEFINITIONS[a].tier - CLASS_DEFINITIONS[b].tier) || a.localeCompare(b),
  );

  /** New body-mod being composed in the UI. */
  newMod: NpcBodyStatMod = { stat: 'constitution', value: 1, mode: 'add' };

  // ─── UI state ───────────────────────────────────────────────────────────────
  aktuellTab: 'skills' | 'spells' | 'equipment' | 'notes' = 'skills';
  browseCategory: 'skills' | 'items' | 'spells' = 'skills';
  skillTab: 'tree' | 'library' = 'tree';
  expandedClass: string | null = null;
  treeQuery = '';
  /** Class-tree: the skill currently highlighted for preview (not yet added). */
  selectedTreeSkillId: string | null = null;

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
    if (!this.draft.body) this.draft.body = createEmptyNpcBody();
    if (!this.draft.body.mods) this.draft.body.mods = [];
    if (!this.draft.customSkills) this.draft.customSkills = [];

    // Unify: materialize any class-tree learnedSkillIds into editable SkillBlocks, so every skill
    // renders the same and can be tweaked locally (without touching the class-tree definitions).
    for (const id of this.draft.learnedSkillIds ?? []) {
      if (this.draft.customSkills.some(s => s.skillId === id)) continue;
      const sk = this.materializeSkill(id);
      if (sk) this.draft.customSkills.push(sk);
    }
    this.draft.learnedSkillIds = [];

    // Group the library lists by their folder (like the class-tree dropdowns).
    this.itemFolders = this.groupByFolder(this.availableItems);
    this.spellFolders = this.groupByFolder(this.availableSpells);
    this.skillFolders = this.groupByFolder(this.availableSkills);

    // Sync the flat gameplay fields with the soul/body up front.
    this.recalc();

    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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
  }

  // ─── Soul: level → point budget → distribute over the 6 base stats ──────────
  get soul(): NpcSoul { return this.draft.soul!; }
  get budget(): number { return soulPointBudget(this.soul.level); }
  get spent(): number { return soulPointsSpent(this.soul); }
  get remaining(): number { return soulPointsRemaining(this.soul); }

  /** Effective stats (soul + body mods) — what actually feeds the derived readout & gameplay. */
  get effective(): Record<NpcStatKey, number> { return effectiveNpcStats(this.soul, this.draft.body); }

  setLevel(v: number): void {
    this.soul.level = Math.max(1, Math.floor(v) || 1);
    this.recalc();
  }

  incStat(key: NpcStatKey): void {
    if (this.remaining <= 0) return;
    this.soul.stats[key]++;
    this.recalc();
  }
  decStat(key: NpcStatKey): void {
    if (this.soul.stats[key] <= 1) return; // min 1 in every stat
    this.soul.stats[key]--;
    this.recalc();
  }
  setStat(key: NpcStatKey, v: number): void {
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
    const e = this.effective;
    const L = this.soul.level;
    this.draft.level = L;
    this.draft.strength = e.strength;
    this.draft.dexterity = e.dexterity;
    this.draft.speed = e.speed;
    this.draft.intelligence = e.intelligence;
    this.draft.constitution = e.constitution;
    this.draft.wille = e.wille;
    this.draft.maxHealth = e.constitution * 5;
    this.draft.maxEnergy = e.dexterity * 5;
    this.draft.maxMana = e.intelligence * 5;
    this.draft.reaktionswert = this.npcGen.calcReaktionswert(e.wille, L);
    this.draft.grundbonus = this.npcGen.calcGrundbonus(L, e.wille);
    this.recalcFokus();
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
    return SKILL_DEFINITIONS
      .filter(s => s.class === cls && (!q || s.name.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  toggleClass(cls: string): void {
    this.expandedClass = this.expandedClass === cls ? null : cls;
  }

  /** Class-tree click just SELECTS a skill for preview — you read it, then press Hinzufügen. */
  selectTreeSkill(id: string): void {
    this.selectedTreeSkillId = this.selectedTreeSkillId === id ? null : id;
  }

  /** The selected class-tree skill materialised for the full app-skill preview. */
  get selectedTreeSkill(): SkillBlock | null {
    return this.selectedTreeSkillId ? this.materializeSkill(this.selectedTreeSkillId) : null;
  }

  /** True once a class-tree skill has been added to this NPC (by its definition id). */
  isAdded(id: string): boolean { return this.draft.customSkills.some(s => s.skillId === id); }

  addSelectedTreeSkill(): void {
    const sk = this.selectedTreeSkill;
    if (!sk) return;
    this.draft.customSkills.push(sk);
    this.recalcFokus();
    this.selectedTreeSkillId = null;
  }

  // ─── Skills: library + custom ─────────────────────────────────────────────
  addSkillFromLibrary(file: AssetFile): void {
    const skill = JSON.parse(JSON.stringify(file.data)) as SkillBlock;
    this.draft.customSkills.push(skill);
  }

  openSkillEditor(index: number | null): void {
    this.editingSkillIndex = index;
    this.editingSkill = index === null ? null : JSON.parse(JSON.stringify(this.draft.customSkills[index]));
    this.skillEditorOpen = true;
  }

  onSkillSave(skill: SkillBlock): void {
    if (this.editingSkillIndex === null) this.draft.customSkills.push(skill);
    else this.draft.customSkills[this.editingSkillIndex] = skill;
    this.closeSkillEditor();
  }

  closeSkillEditor(): void {
    this.skillEditorOpen = false;
    this.editingSkill = null;
    this.editingSkillIndex = null;
  }

  removeCustomSkill(index: number): void { this.draft.customSkills.splice(index, 1); this.recalcFokus(); }

  // ─── Items: library + custom ──────────────────────────────────────────────
  addItemFromLibrary(file: AssetFile): void {
    const item = JSON.parse(JSON.stringify(file.data)) as ItemBlock;
    this.draft.equipment.push(item);
  }

  openItemEditor(index: number | null): void {
    this.editingItemIndex = index;
    this.editingItem = index === null ? null : JSON.parse(JSON.stringify(this.draft.equipment[index]));
    this.itemEditorOpen = true;
  }

  onItemSave(item: ItemBlock): void {
    if (this.editingItemIndex === null) this.draft.equipment.push(item);
    else this.draft.equipment[this.editingItemIndex] = item;
    this.closeItemEditor();
  }

  closeItemEditor(): void {
    this.itemEditorOpen = false;
    this.editingItem = null;
    this.editingItemIndex = null;
  }

  removeEquipment(index: number): void { this.draft.equipment.splice(index, 1); }

  // ─── Forge (all materials unlocked) ───────────────────────────────────────
  openForge(): void { this.forgeOpen = true; }
  closeForge(): void { this.forgeOpen = false; }

  /** The forge emits the finished item via a patch to /inventory/-; add it to NPC equipment. */
  onForgePatch(p: JsonPatch): void {
    if (p.path === '/inventory/-' && p.value) {
      this.draft.equipment.push(p.value as ItemBlock);
    }
    // Other patches (e.g. resource consumption) are irrelevant for an NPC — ignored.
  }

  // ─── Spells: library + custom ─────────────────────────────────────────────
  addSpellFromLibrary(file: AssetFile): void {
    this.draft.spells.push(JSON.parse(JSON.stringify(file.data)) as SpellBlock);
  }

  openSpellEditor(index: number | null): void {
    this.editingSpellIndex = index;
    this.editingSpell = index === null ? null : JSON.parse(JSON.stringify(this.draft.spells[index]));
    this.spellEditorOpen = true;
  }

  onSpellSave(spell: SpellBlock): void {
    if (this.editingSpellIndex === null) this.draft.spells.push(spell);
    else this.draft.spells[this.editingSpellIndex] = spell;
    this.closeSpellEditor();
  }

  closeSpellEditor(): void {
    this.spellEditorOpen = false;
    this.editingSpell = null;
    this.editingSpellIndex = null;
  }

  removeSpell(index: number): void { this.draft.spells.splice(index, 1); }
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
    this.draft.fokus = this.npcGen.calcFokus(this.draft.intelligence, this.draft.learnedSkillIds);
    this.save.emit(this.draft);
  }

  onCancel(): void { this.cancel.emit(); }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  tierClass(tier: number): string { return `tier-${Math.min(tier, 5)}`; }
}
