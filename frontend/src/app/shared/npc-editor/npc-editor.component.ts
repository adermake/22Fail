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
  createEmptyNpcSoul,
  createEmptyNpcBody,
  createEmptyEstimateSplits,
  soulBonusRemaining,
  computeSoulDerived,
  applyNpcEstimation,
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

type SoulKey = 'leben' | 'energie' | 'geschwindigkeit' | 'angriff';
type OverrideKey = 'maxHealth' | 'maxEnergy' | 'maxMana' | 'reaktion' | 'turnSpeed' | 'angriff';

@Component({
  selector: 'app-npc-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, SkillEditorComponent, ItemEditorComponent],
  templateUrl: './npc-editor.component.html',
  styleUrl: './npc-editor.component.css',
})
export class NpcEditorComponent implements OnInit, OnDestroy {
  @Input() statblock!: NpcStatblock;
  @Input() availableSpells: AssetFile[] = [];
  @Input() availableItems: AssetFile[] = [];
  @Input() availableSkills: AssetFile[] = [];
  // Kept for backward-compatible parent bindings (weapon-gen removed from the UI).
  @Input() availableMaterials: AssetFile[] = [];
  @Input() availableForgeTraits: AssetFile[] = [];

  @Output() save = new EventEmitter<NpcStatblock>();
  @Output() cancel = new EventEmitter<void>();

  private npcGen = inject(NpcGeneratorService);
  private imageService = inject(ImageService);

  draft!: NpcStatblock;

  // ─── Static metadata ────────────────────────────────────────────────────────
  readonly soulCats: { key: SoulKey; label: string; icon: string; hint: string }[] = [
    { key: 'leben',           label: 'Leben',          icon: '❤️', hint: 'Trefferpunkte' },
    { key: 'energie',         label: 'Energie',        icon: '⚡',       hint: 'Ausdauer + Mana' },
    { key: 'geschwindigkeit', label: 'Geschwindigkeit', icon: '💨', hint: 'Zugreihenfolge / Reaktion' },
    { key: 'angriff',         label: 'Angriff',        icon: '⚔️', hint: 'Angriffsbonus' },
  ];

  readonly skillClasses = Object.keys(CLASS_DEFINITIONS).sort(
    (a, b) => (CLASS_DEFINITIONS[a].tier - CLASS_DEFINITIONS[b].tier) || a.localeCompare(b),
  );

  readonly overrideFields: { key: OverrideKey; label: string }[] = [
    { key: 'maxHealth', label: '❤️ Leben' },
    { key: 'maxEnergy', label: '⚡ Ausdauer' },
    { key: 'maxMana',   label: '💧 Mana' },
    { key: 'reaktion',  label: '💨 Reaktion' },
    { key: 'turnSpeed', label: '⏱ Zug-Tempo' },
    { key: 'angriff',   label: '⚔️ Angriff' },
  ];

  // ─── UI state ───────────────────────────────────────────────────────────────
  skillTab: 'tree' | 'library' = 'tree';
  itemTab: 'library' | 'create' = 'library';
  expandedClass: string | null = null;
  treeQuery = '';

  // Fullscreen nested editors (open flags — editingSkill/Item are null when creating new)
  skillEditorOpen = false;
  editingSkill: SkillBlock | null = null;
  editingSkillIndex: number | null = null;
  itemEditorOpen = false;
  editingItem: ItemBlock | null = null;
  editingItemIndex: number | null = null;

  imageUploading = false;
  private prevBodyOverflow = '';

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.draft = JSON.parse(JSON.stringify(this.statblock));
    // Ensure the new soul/body/estimate structures exist for legacy statblocks.
    if (!this.draft.soul) {
      this.draft.soul = createEmptyNpcSoul();
      this.draft.soul.level = this.draft.level || 1;
    }
    if (!this.draft.body) this.draft.body = createEmptyNpcBody();
    if (!this.draft.estimate) this.draft.estimate = createEmptyEstimateSplits();
    if (!this.draft.body.overrides) this.draft.body.overrides = {};

    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.prevBodyOverflow;
  }

  // ─── Soul ───────────────────────────────────────────────────────────────────
  get soul(): NpcSoul { return this.draft.soul!; }
  get remaining(): number { return soulBonusRemaining(this.soul); }
  get derived() { return computeSoulDerived(this.soul, this.draft.body, this.draft.estimate!); }

  setLevel(v: number): void {
    this.soul.level = Math.max(1, Math.floor(v) || 1);
    // Trim over-allocated bonus points down to the new budget.
    let over = -this.remaining;
    if (over > 0) {
      for (const c of this.soulCats) {
        if (over <= 0) break;
        const take = Math.min(over, this.soul.bonus[c.key]);
        this.soul.bonus[c.key] -= take;
        over -= take;
      }
    }
    this.recalc();
  }

  addBonus(key: SoulKey): void {
    if (this.remaining <= 0) return;
    this.soul.bonus[key]++;
    this.recalc();
  }

  subBonus(key: SoulKey): void {
    if (this.soul.bonus[key] <= 0) return;
    this.soul.bonus[key]--;
    this.recalc();
  }

  /** Re-run the prefill from soul/body/sliders into the flat gameplay fields. */
  recalc(): void {
    applyNpcEstimation(this.draft);
    this.draft.fokus = this.npcGen.calcFokus(this.draft.intelligence, this.draft.learnedSkillIds);
  }

  // ─── Body overrides ───────────────────────────────────────────────────────
  get overrides() { return this.draft.body!.overrides; }

  toggleOverride(key: OverrideKey): void {
    const ov = this.overrides;
    if (ov[key] === undefined) {
      // Seed with the current soul-derived value so the number field starts sensibly.
      const d = computeSoulDerived(this.soul, undefined, this.draft.estimate!);
      ov[key] = d[key];
    } else {
      ov[key] = undefined;
    }
    this.recalc();
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

  hasSkill(id: string): boolean { return this.draft.learnedSkillIds.includes(id); }

  toggleLearnedSkill(id: string): void {
    if (this.hasSkill(id)) {
      this.draft.learnedSkillIds = this.draft.learnedSkillIds.filter(x => x !== id);
    } else {
      this.draft.learnedSkillIds = [...this.draft.learnedSkillIds, id];
    }
    this.draft.fokus = this.npcGen.calcFokus(this.draft.intelligence, this.draft.learnedSkillIds);
  }

  get learnedSkillDetails() {
    return this.draft.learnedSkillIds.map(id => {
      const def = SKILL_DEFINITIONS.find(s => s.id === id);
      return { id, name: def?.name ?? id, class: def?.class ?? '?', tier: CLASS_DEFINITIONS[def?.class ?? '']?.tier ?? 1 };
    });
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

  removeCustomSkill(index: number): void { this.draft.customSkills.splice(index, 1); }

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

  // ─── Spells (library only) ────────────────────────────────────────────────
  addSpellFromLibrary(file: AssetFile): void {
    this.draft.spells.push(JSON.parse(JSON.stringify(file.data)) as SpellBlock);
  }
  removeSpell(index: number): void { this.draft.spells.splice(index, 1); }
  getSpellName(spell: SpellBlock): string { return (spell as any).name ?? 'Zauber'; }

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
