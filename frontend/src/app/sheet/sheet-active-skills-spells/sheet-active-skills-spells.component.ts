import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EventEmitter, inject, Input, OnChanges, Output, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SkillBlock } from '../../model/skill-block.model';
import { SpellBlock, CastingSpellEntry } from '../../model/spell-block-model';
import { JsonPatch } from '../../model/json-patch.model';

@Component({
  selector: 'app-sheet-active-skills-spells',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sheet-active-skills-spells.component.html',
  styleUrl: './sheet-active-skills-spells.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetActiveSkillsSpellsComponent implements OnChanges {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  private cdr = inject(ChangeDetectorRef);

  /** All skills that have perRound cost (sustained / toggle). */
  get sustainedSkills(): SkillBlock[] {
    return (this.sheet.skills || []).filter(s => s.cost?.perRound === true);
  }

  /** Whether a given skill name is currently active. */
  isSkillActive(skill: SkillBlock): boolean {
    return (this.sheet.activeSkillNames || []).includes(skill.name);
  }

  /** Active casting spells list (safe default). */
  get castingSpells(): CastingSpellEntry[] {
    return this.sheet.castingSpells || [];
  }

  get totalActive(): number {
    return this.sustainedSkills.filter(s => this.isSkillActive(s)).length + this.castingSpells.length;
  }

  get hasSomething(): boolean {
    return this.sustainedSkills.length > 0 || this.castingSpells.length > 0;
  }

  /** Look up the full SpellBlock for a casting entry */
  getSpellData(spellId: string): SpellBlock | undefined {
    return (this.sheet.spells || []).find(s => s.id === spellId);
  }

  /** Icon for a skill — use first letter of name as fallback */
  skillIcon(skill: SkillBlock): string {
    return skill.name?.charAt(0)?.toUpperCase() || '⚡';
  }

  /** Short cost label for per-turn cost */
  spellCostLabel(spell: SpellBlock | undefined): string {
    if (!spell) return '';
    const parts: string[] = [];
    if (spell.perTurnMana)  parts.push(`${spell.perTurnMana}M`);
    if (spell.perTurnFokus) parts.push(`${spell.perTurnFokus}F`);
    if (parts.length) return parts.join(' ') + '/Rd';
    if (spell.costMana)  parts.push(`${spell.costMana}M`);
    if (spell.costFokus) parts.push(`${spell.costFokus}F`);
    return parts.join(' ');
  }

  // ── Fokus bar ──────────────────────────────────────────────────────────────

  get usedFokus(): number {
    return this.castingSpells.reduce((sum, entry) => {
      const spell = this.getSpellData(entry.spellId);
      if (!spell) return sum;
      return sum + (spell.perTurnFokus || spell.costFokus || 0);
    }, 0);
  }

  get maxFokus(): number {
    return (this.sheet as any).maxFokus ?? (this.sheet as any).stats?.fokus ?? 100;
  }

  get fokusPercent(): number {
    const max = this.maxFokus;
    if (!max) return 0;
    return Math.min(100, Math.round((this.usedFokus / max) * 100));
  }

  // ── Active Skills ──────────────────────────────────────────────────────────

  toggleSkill(skill: SkillBlock): void {
    const current = [...(this.sheet.activeSkillNames || [])];
    const idx = current.indexOf(skill.name);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(skill.name);
    }
    this.sheet.activeSkillNames = current;
    this.patch.emit({ path: 'activeSkillNames', value: current });
    this.cdr.markForCheck();
  }

  // ── Casting Spells ─────────────────────────────────────────────────────────

  incrementCastLevel(entry: CastingSpellEntry): void {
    entry.castLevel = (entry.castLevel || 0) + 1;
    this._patchCasting();
  }

  decrementCastLevel(entry: CastingSpellEntry): void {
    entry.castLevel = Math.max(0, (entry.castLevel || 0) - 1);
    this._patchCasting();
  }

  setCastLevel(entry: CastingSpellEntry, value: number): void {
    entry.castLevel = isNaN(value) || value < 0 ? 0 : value;
    this._patchCasting();
  }

  removeCastingSpell(index: number): void {
    const updated = [...this.castingSpells];
    updated.splice(index, 1);
    this.sheet.castingSpells = updated;
    this._patchCasting();
    this.cdr.markForCheck();
  }

  /** Cost reduction from accumulated cast level: +10% per level, max 90%. */
  reductionLabel(castLevel: number): string {
    const pct = Math.min(90, Math.floor((castLevel || 0) / 10) * 10);
    return pct > 0 ? `-${pct}%` : '';
  }

  private _patchCasting(): void {
    this.patch.emit({ path: 'castingSpells', value: [...this.castingSpells] });
    this.cdr.markForCheck();
  }

  /** Adjust a counter on a spell definition and sync via patch */
  adjustSpellCounter(spellId: string, counterIndex: number, newValue: number): void {
    const spells = [...(this.sheet.spells || [])];
    const idx = spells.findIndex(s => s.id === spellId);
    if (idx < 0) return;
    const spell = { ...spells[idx] };
    if (!spell.counters || counterIndex >= spell.counters.length) return;
    spell.counters = spell.counters.map((c, i) =>
      i === counterIndex ? { ...c, current: Math.max(c.min, Math.min(c.max, newValue)) } : c
    );
    spells[idx] = spell;
    this.sheet.spells = spells;
    this.patch.emit({ path: 'spells', value: spells });
    this.cdr.markForCheck();
  }

  ngOnChanges(_: SimpleChanges): void {
    this.cdr.markForCheck();
  }
}
