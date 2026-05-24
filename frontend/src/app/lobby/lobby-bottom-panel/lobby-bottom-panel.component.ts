import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  inject, Input, OnChanges, Output, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Token, TokenStatusEffect } from '../../model/lobby.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { NpcStatblock } from '../../model/npc-statblock.model';
import { SpellBlock, CastingSpellEntry } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { FormulaType } from '../../model/formula-type.enum';
import { SKILL_DEFINITIONS } from '../../data/skill-definitions';
import { SkillDefinition } from '../../model/skill-definition.model';
import { CharacterSocketService } from '../../services/character-socket.service';

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
  private charSocket = inject(CharacterSocketService);

  activeTab: 'status' | 'aktiv' = 'aktiv';
  collapsed = false;

  // Pending cast state
  pendingCastSpell: SpellBlock | null = null;
  pendingCastLevel = 0;
  pendingSkalierung = 1;

  ngOnChanges(_: SimpleChanges): void {
    this.pendingCastSpell = null;
    this.cdr.markForCheck();
  }

  get hasSelection(): boolean {
    return !!(this.token);
  }

  get tokenName(): string {
    return this.token?.name ?? '';
  }

  private get characterId(): string | null {
    return this.token?.characterId ?? null;
  }

  // ── Status effects ────────────────────────────────────────────────────────

  get statusEffects(): TokenStatusEffect[] {
    return this.token?.activeStatusEffects ?? [];
  }

  // ── Available skills and spells ───────────────────────────────────────────

  get availableSkills(): SkillBlock[] {
    if (this.character) {
      return (this.character.skills ?? []).filter(s => {
        const effectiveType = this.getSkillDefinition(s)?.type ?? s.type;
        return effectiveType === 'active' && !s.disabled;
      });
    }
    return (this.npc?.customSkills ?? []).filter(s => s.type === 'active');
  }

  get availableSpells(): SpellBlock[] {
    if (this.character) return this.character.spells ?? [];
    return this.npc?.spells ?? [];
  }

  // ── Active state ──────────────────────────────────────────────────────────

  get activeSkillNames(): string[] {
    if (this.character) return this.character.activeSkillNames ?? [];
    return this.token?.activeSkillNames ?? [];
  }

  get castingSpells(): CastingSpellEntry[] {
    if (this.character) return this.character.castingSpells ?? [];
    return this.token?.castingSpells ?? [];
  }

  get activeSkillsList(): SkillBlock[] {
    return this.availableSkills.filter(s => this.isSkillActive(s));
  }

  get hasActiveContent(): boolean {
    return this.castingSpells.length > 0 || this.activeSkillsList.length > 0;
  }

  // ── Skill definition lookup ───────────────────────────────────────────────

  getSkillDefinition(skill: SkillBlock): SkillDefinition | undefined {
    if (skill.skillId) return SKILL_DEFINITIONS.find(s => s.id === skill.skillId);
    return SKILL_DEFINITIONS.find(s => s.name === skill.name && s.class === skill.class)
      ?? SKILL_DEFINITIONS.find(s => s.name === skill.name);
  }

  effectiveCost(skill: SkillBlock): { type: string; amount: number; perRound?: boolean } | undefined {
    return skill.cost ?? this.getSkillDefinition(skill)?.cost;
  }

  skillCostLabel(skill: SkillBlock): string {
    const cost = this.effectiveCost(skill);
    if (!cost) return '';
    const icon = cost.type === 'mana' ? '◆' : cost.type === 'energy' ? '⚡' : '❤';
    return `${cost.amount}${icon}${cost.perRound ? '/Rd' : ''}`;
  }

  // ── Spell helpers ─────────────────────────────────────────────────────────

  getSpell(spellId: string): SpellBlock | undefined {
    if (this.character) return (this.character.spells ?? []).find(s => s.id === spellId);
    return (this.npc?.spells ?? []).find(s => s.id === spellId);
  }

  spellColor(spell: SpellBlock): string {
    return spell.strokeColor || '#8b5cf6';
  }

  spellCostLabel(spell: SpellBlock): string {
    const mana = spell.costMana ?? 0;
    return mana > 0 ? `◆ ${mana}` : '';
  }

  perTurnLabel(spell: SpellBlock): string {
    const fokus = spell.perTurnFokus ?? spell.costFokus ?? 0;
    return fokus > 0 ? `Fokus/Rd: ${fokus}` : '';
  }

  castProgressPercent(entry: CastingSpellEntry): number {
    const total = entry.castLevel || 0;
    if (total <= 0) return 100;
    return Math.round(((total - entry.remainingCast) / total) * 100);
  }

  isSpellFinished(entry: CastingSpellEntry): boolean {
    if (entry.remainingCast > 0) return false;
    const spell = this.getSpell(entry.spellId);
    if (!spell?.durationTurns) return true;
    return (entry.roundsActive ?? 0) >= spell.durationTurns;
  }

  // ── Skill actions ─────────────────────────────────────────────────────────

  isSkillActive(skill: SkillBlock): boolean {
    return this.activeSkillNames.includes(skill.name);
  }

  toggleSkill(skill: SkillBlock): void {
    const current = [...this.activeSkillNames];
    const idx = current.indexOf(skill.name);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(skill.name);

    if (this.character) {
      this.character.activeSkillNames = current;
      const charId = this.characterId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'activeSkillNames', value: current });
    } else {
      this.tokenUpdate.emit({ activeSkillNames: current });
    }
    this.cdr.markForCheck();
  }

  paySkillRoundCost(skill: SkillBlock): void {
    const cost = this.effectiveCost(skill);
    if (!cost?.perRound || !cost.amount) return;

    if (this.character) {
      const formulaMap: Record<string, FormulaType> = {
        mana: FormulaType.MANA, energy: FormulaType.ENERGY, life: FormulaType.LIFE,
      };
      const targetType = formulaMap[cost.type];
      if (!targetType) return;
      const statuses = [...(this.character.statuses || [])];
      const idx = statuses.findIndex(s => s.formulaType === targetType);
      if (idx < 0) return;
      const newVal = Math.max(0, (statuses[idx].statusCurrent || 0) - cost.amount);
      statuses[idx] = { ...statuses[idx], statusCurrent: newVal };
      this.character.statuses = statuses;
      const charId = this.characterId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'statuses', value: statuses });
    } else {
      if (cost.type === 'mana') {
        const cur = this.token?.currentMana ?? this.npc?.maxMana ?? 0;
        this.tokenUpdate.emit({ currentMana: Math.max(0, cur - cost.amount) });
      } else if (cost.type === 'energy') {
        const cur = this.token?.currentEnergy ?? this.npc?.maxEnergy ?? 0;
        this.tokenUpdate.emit({ currentEnergy: Math.max(0, cur - cost.amount) });
      } else {
        const cur = this.token?.currentHealth ?? this.npc?.maxHealth ?? 0;
        this.tokenUpdate.emit({ currentHealth: Math.max(0, cur - cost.amount) });
      }
    }
    this.cdr.markForCheck();
  }

  adjustSkillCounter(skillName: string, counterIndex: number, newValue: number): void {
    if (!this.character) return;
    const skills = [...(this.character.skills || [])];
    const idx = skills.findIndex(s => s.name === skillName);
    if (idx < 0) return;
    const skill = { ...skills[idx] };
    if (!skill.counters || counterIndex >= skill.counters.length) return;
    skill.counters = skill.counters.map((c, i) =>
      i === counterIndex ? { ...c, current: Math.max(c.min, Math.min(c.max, newValue)) } : c
    );
    skills[idx] = skill;
    this.character.skills = skills;
    const charId = this.characterId;
    if (charId) this.charSocket.sendPatch(charId, { path: 'skills', value: skills });
    this.cdr.markForCheck();
  }

  // ── Spell actions ─────────────────────────────────────────────────────────

  requestCast(spell: SpellBlock): void {
    this.pendingCastSpell = spell;
    this.pendingCastLevel = 0;
    this.pendingSkalierung = 1;
    this.cdr.markForCheck();
  }

  cancelCast(): void {
    this.pendingCastSpell = null;
    this.cdr.markForCheck();
  }

  confirmCast(): void {
    const spell = this.pendingCastSpell;
    if (!spell) return;
    const cl = this.pendingCastLevel;
    const sk = this.pendingSkalierung;
    this.pendingCastSpell = null;
    this._castSpell(spell, cl, sk);
  }

  private _castSpell(spell: SpellBlock, castLevel: number, skalierung: number): void {
    const entryId = `${spell.id ?? 'spell'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: CastingSpellEntry = {
      spellId: spell.id ?? entryId,
      spellName: spell.name,
      castLevel,
      entryId,
      skalierung: skalierung !== 1 ? skalierung : undefined,
      remainingCast: castLevel,
      roundsActive: castLevel <= 0 ? 0 : undefined,
    };
    const updated = [...this.castingSpells, entry];

    if (this.character) {
      this.character.castingSpells = updated;
      const manaCost = Math.round((spell.costMana || 0) * skalierung * 100) / 100;
      if (manaCost > 0) this._consumeCharacterMana(manaCost);
      const charId = this.characterId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'castingSpells', value: updated });
    } else {
      this.tokenUpdate.emit({ castingSpells: updated });
    }
    this.cdr.markForCheck();
  }

  private _consumeCharacterMana(amount: number): void {
    if (!this.character || amount <= 0) return;
    const statuses = [...(this.character.statuses || [])];
    const idx = statuses.findIndex(s => s.formulaType === FormulaType.MANA);
    if (idx < 0) return;
    const newVal = Math.max(0, (statuses[idx].statusCurrent || 0) - amount);
    statuses[idx] = { ...statuses[idx], statusCurrent: newVal };
    this.character.statuses = statuses;
    const charId = this.characterId;
    if (charId) this.charSocket.sendPatch(charId, { path: 'statuses', value: statuses });
  }

  stopCasting(entry: CastingSpellEntry): void {
    const updated = entry.entryId
      ? this.castingSpells.filter(e => e.entryId !== entry.entryId)
      : this.castingSpells.filter(e => e.spellId !== entry.spellId);
    this._patchCasting(updated);
  }

  rollCast(entry: CastingSpellEntry): void {
    const roll = Math.floor(Math.random() * 20) + 1;
    entry.remainingCast = Math.max(0, entry.remainingCast - roll);
    if (entry.remainingCast <= 0 && entry.roundsActive === undefined) {
      entry.roundsActive = 0;
    }
    this._patchCasting([...this.castingSpells]);
  }

  advanceRound(entry: CastingSpellEntry): void {
    entry.roundsActive = (entry.roundsActive ?? 0) + 1;
    this._patchCasting([...this.castingSpells]);
  }

  setRemainingCast(entry: CastingSpellEntry, value: number): void {
    entry.remainingCast = Math.max(0, value);
    if (entry.remainingCast <= 0 && entry.roundsActive === undefined) {
      entry.roundsActive = 0;
    }
    this._patchCasting([...this.castingSpells]);
  }

  setRoundsActive(entry: CastingSpellEntry, value: number): void {
    entry.roundsActive = Math.max(0, value);
    this._patchCasting([...this.castingSpells]);
  }

  adjustSpellCounter(spellId: string, counterIndex: number, newValue: number): void {
    if (!this.character) return;
    const spells = [...(this.character.spells || [])];
    const idx = spells.findIndex(s => s.id === spellId);
    if (idx < 0) return;
    const spell = { ...spells[idx] };
    if (!spell.counters || counterIndex >= spell.counters.length) return;
    spell.counters = spell.counters.map((c, i) =>
      i === counterIndex ? { ...c, current: Math.max(c.min, Math.min(c.max, newValue)) } : c
    );
    spells[idx] = spell;
    this.character.spells = spells;
    const charId = this.characterId;
    if (charId) this.charSocket.sendPatch(charId, { path: 'spells', value: spells });
    this.cdr.markForCheck();
  }

  private _patchCasting(updated: CastingSpellEntry[]): void {
    if (this.character) {
      this.character.castingSpells = updated;
      const charId = this.characterId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'castingSpells', value: updated });
    } else {
      this.tokenUpdate.emit({ castingSpells: updated });
    }
    this.cdr.markForCheck();
  }
}
