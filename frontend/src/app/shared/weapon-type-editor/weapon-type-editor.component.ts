import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DAMAGE_TYPES,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_LABELS,
  WEAPON_HANDED_LABELS,
  WEAPON_WEIGHTS,
  WEAPON_WEIGHT_LABELS,
  WeaponHanded,
  WeaponTypeBlock,
  WeaponWeight,
  createEmptyWeaponType,
  describeWeaponReach,
  normalizeWeaponType,
  setWeaponTypeKnowledgeTier,
  toggleDamageType,
  weaponTypeKnowledgeTier,
  type WeaponCategory,
} from '../../model/weapon-type-block.model';
import { KNOWLEDGE_TIERS, KnowledgeTier } from '../../utils/knowledge-tier.util';
import { DamageType } from '../../model/forging.model';

/**
 * Editor for a Waffentyp — the library-defined replacement for the hardcoded weapon list.
 *
 * A type carries both reaches at once: a spear that is thrown has a melee AND a ranged range, and
 * forcing the old single `range` on it lost that. Either may be 0, meaning "not usable that way".
 */
@Component({
  selector: 'app-weapon-type-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weapon-type-editor.component.html',
  styleUrl: './weapon-type-editor.component.css',
})
export class WeaponTypeEditorComponent implements OnInit {
  @Input() weaponType: WeaponTypeBlock = createEmptyWeaponType();
  @Output() save = new EventEmitter<WeaponTypeBlock>();
  @Output() cancel = new EventEmitter<void>();

  readonly damageTypes = DAMAGE_TYPES;
  readonly categories = WEAPON_CATEGORIES;
  readonly categoryLabels = WEAPON_CATEGORY_LABELS;
  readonly weights = WEAPON_WEIGHTS;
  readonly weightLabels = WEAPON_WEIGHT_LABELS;
  readonly handedLabels = WEAPON_HANDED_LABELS;

  edit: WeaponTypeBlock = createEmptyWeaponType();

  readonly knowledgeTiers = KNOWLEDGE_TIERS;

  get tier(): KnowledgeTier { return weaponTypeKnowledgeTier(this.edit); }
  get tierHint(): string {
    return KNOWLEDGE_TIERS.find((t) => t.value === this.tier)?.hint ?? '';
  }
  setTier(tier: KnowledgeTier): void { setWeaponTypeKnowledgeTier(this.edit, tier); }

  ngOnInit(): void {
    this.edit = normalizeWeaponType({
      ...createEmptyWeaponType(),
      ...JSON.parse(JSON.stringify(this.weaponType)),
    });
    // A type lifted from the built-in list becomes a real, editable library entry on save.
    delete this.edit.builtin;
  }

  get reachSummary(): string {
    return describeWeaponReach(this.edit);
  }

  /** Neither reach set means the type can't actually be used — worth saying out loud. */
  get reachWarning(): boolean {
    return (this.edit.meleeRange || 0) <= 0 && (this.edit.rangedRange || 0) <= 0;
  }

  setCategory(c: WeaponCategory): void {
    this.edit.category = c;
  }

  hasDamageType(t: DamageType): boolean {
    return this.edit.damageTypes?.includes(t) ?? false;
  }

  /** Multi-select: a sword is Schnitt AND Stich. The last one cannot be switched off. */
  toggleDamage(t: DamageType): void {
    toggleDamageType(this.edit, t);
  }

  get onlyDamageType(): boolean {
    return (this.edit.damageTypes?.length ?? 0) <= 1;
  }

  setWeight(w: WeaponWeight): void {
    this.edit.weight = w;
  }

  setHanded(h: WeaponHanded): void {
    this.edit.handed = h;
  }

  onSave(): void {
    if (!this.edit.name?.trim()) return;
    this.edit.meleeRange = Math.max(0, Number(this.edit.meleeRange) || 0);
    this.edit.rangedRange = Math.max(0, Number(this.edit.rangedRange) || 0);
    this.save.emit(this.edit);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
