import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  inject, Input, OnChanges, Output, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Token } from '../../model/lobby.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { NpcStatblock } from '../../model/npc-statblock.model';
import { SpellBlock, CastingSpellEntry } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { FormulaType } from '../../model/formula-type.enum';

@Component({
  selector: 'app-lobby-bottom-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lobby-bottom-panel.component.html',
  styleUrl: './lobby-bottom-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyBottomPanelComponent implements OnChanges {
  @Input() token: Token | null = null;
  @Input() character: CharacterSheet | null = null;
  @Input() npc: NpcStatblock | null = null;
  @Input() isGM = false;
  @Output() tokenUpdate = new EventEmitter<Partial<Omit<Token, 'id'>>>();

  private cdr = inject(ChangeDetectorRef);

  activeTab: 'stats' | 'aktiv' = 'aktiv';
  collapsed = false;

  ngOnChanges(_: SimpleChanges): void {
    this.cdr.markForCheck();
  }

  get hasSelection(): boolean {
    return !!(this.token);
  }

  get tokenName(): string {
    return this.token?.name ?? '';
  }

  // ── Resource values ─────────────────────────────────────────────────────────

  get currentHealth(): number {
    if (this.token?.currentHealth !== undefined) return this.token.currentHealth;
    if (this.character) {
      return this.character.statuses?.find(s => s.formulaType === FormulaType.LIFE)?.statusCurrent ?? 0;
    }
    return this.npc?.maxHealth ?? 0;
  }

  get maxHealth(): number {
    if (this.character) {
      const s = this.character.statuses?.find(s => s.formulaType === FormulaType.LIFE);
      if (s) return (s.statusBase || 0) + (s.statusBonus || 0) + (s.statusEffectBonus || 0);
    }
    return this.npc?.maxHealth ?? 0;
  }

  get currentMana(): number {
    if (this.token?.currentMana !== undefined) return this.token.currentMana;
    if (this.character) {
      return this.character.statuses?.find(s => s.formulaType === FormulaType.MANA)?.statusCurrent ?? 0;
    }
    return this.npc?.maxMana ?? 0;
  }

  get maxMana(): number {
    if (this.character) {
      const s = this.character.statuses?.find(s => s.formulaType === FormulaType.MANA);
      if (s) return (s.statusBase || 0) + (s.statusBonus || 0) + (s.statusEffectBonus || 0);
    }
    return this.npc?.maxMana ?? 0;
  }

  get currentEnergy(): number {
    if (this.token?.currentEnergy !== undefined) return this.token.currentEnergy;
    if (this.character) {
      return this.character.statuses?.find(s => s.formulaType === FormulaType.ENERGY)?.statusCurrent ?? 0;
    }
    return this.npc?.maxEnergy ?? 0;
  }

  get maxEnergy(): number {
    if (this.character) {
      const s = this.character.statuses?.find(s => s.formulaType === FormulaType.ENERGY);
      if (s) return (s.statusBase || 0) + (s.statusBonus || 0) + (s.statusEffectBonus || 0);
    }
    return this.npc?.maxEnergy ?? 0;
  }

  get healthPercent(): number {
    return this.maxHealth > 0 ? Math.min(100, Math.round((this.currentHealth / this.maxHealth) * 100)) : 0;
  }

  get manaPercent(): number {
    return this.maxMana > 0 ? Math.min(100, Math.round((this.currentMana / this.maxMana) * 100)) : 0;
  }

  get energyPercent(): number {
    return this.maxEnergy > 0 ? Math.min(100, Math.round((this.currentEnergy / this.maxEnergy) * 100)) : 0;
  }

  // ── Active spells and skills ─────────────────────────────────────────────────

  get activeSpells(): SpellBlock[] {
    if (this.character) {
      const casting: CastingSpellEntry[] = this.character.castingSpells ?? [];
      return casting
        .map(e => (this.character!.spells ?? []).find(s => s.id === e.spellId))
        .filter((s): s is SpellBlock => !!s);
    }
    return this.npc?.spells ?? [];
  }

  get activeSkills(): SkillBlock[] {
    if (this.character) {
      const names = this.character.activeSkillNames ?? [];
      return (this.character.skills ?? []).filter(s => names.includes(s.name));
    }
    return (this.npc?.customSkills ?? []).filter(s => s.type === 'active');
  }

  get hasActiveContent(): boolean {
    return this.activeSpells.length > 0 || this.activeSkills.length > 0;
  }

  // ── Resource editing ─────────────────────────────────────────────────────────

  setResource(resource: 'health' | 'mana' | 'energy', value: number): void {
    const clamped = Math.max(0, value);
    if (resource === 'health') this.tokenUpdate.emit({ currentHealth: clamped });
    else if (resource === 'mana') this.tokenUpdate.emit({ currentMana: clamped });
    else this.tokenUpdate.emit({ currentEnergy: clamped });
  }
}
