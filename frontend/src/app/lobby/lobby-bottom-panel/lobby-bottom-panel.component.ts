import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter,
  inject, Input, OnChanges, OnInit, Output, SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Token, TokenStatusEffect } from '../../model/lobby.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { NpcStatblock } from '../../model/npc-statblock.model';
import { SpellBlock, CastingSpellEntry, ActiveSkillEntry } from '../../model/spell-block-model';
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
export class LobbyBottomPanelComponent implements OnChanges, OnInit {
  @Input() token: Token | null = null;
  @Input() character: CharacterSheet | null = null;
  @Input() npc: NpcStatblock | null = null;
  @Input() isGM = false;
  @Output() tokenUpdate = new EventEmitter<Partial<Omit<Token, 'id'>>>();

  private cdr = inject(ChangeDetectorRef);
  private charSocket = inject(CharacterSocketService);
  private destroyRef = inject(DestroyRef);

  activeTab: 'status' | 'aktiv' = 'aktiv';
  collapsed = false;

  ngOnInit(): void {
    // Re-render immediately when the character panel mutates data locally (before server echo)
    this.charSocket.localUpdate$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(_: SimpleChanges): void {
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

  get activeSkillEntries(): ActiveSkillEntry[] {
    if (this.character) return this.character.activeSkillEntries ?? [];
    return this.token?.activeSkillEntries ?? [];
  }

  /** Look up the SkillBlock for a given skill entry. */
  getSkillBlock(entry: ActiveSkillEntry): SkillBlock | undefined {
    return this.availableSkills.find(s =>
      (entry.skillId && s.skillId && entry.skillId === s.skillId) || s.name === entry.skillName
    );
  }

  get hasActiveContent(): boolean {
    return this.castingSpells.length > 0 || this.activeSkillEntries.length > 0;
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
    return this.activeSkillEntries.some(e =>
      (e.skillId && skill.skillId && e.skillId === skill.skillId) || e.skillName === skill.name
    );
  }

  stopSkillEntry(entry: ActiveSkillEntry): void {
    const updated = this.activeSkillEntries.filter(e => e.entryId !== entry.entryId);
    this._patchSkillEntries(updated);
  }

  adjustSkillEntryCounter(entry: ActiveSkillEntry, counterIndex: number, newValue: number): void {
    const updated = this.activeSkillEntries.map(e => {
      if (e.entryId !== entry.entryId || !e.counters) return e;
      const counters = e.counters.map((c, i) =>
        i === counterIndex ? { ...c, current: Math.max(c.min, Math.min(c.max, newValue)) } : c
      );
      return { ...e, counters };
    });
    this._patchSkillEntries(updated);
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

  private _patchSkillEntries(updated: ActiveSkillEntry[]): void {
    if (this.character) {
      this.character.activeSkillEntries = updated;
      const charId = this.characterId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'activeSkillEntries', value: updated });
    } else {
      this.tokenUpdate.emit({ activeSkillEntries: updated });
    }
    this.cdr.markForCheck();
  }

  // ── Spell actions ─────────────────────────────────────────────────────────

  stopCasting(entry: CastingSpellEntry): void {
    const updated = entry.entryId
      ? this.castingSpells.filter(e => e.entryId !== entry.entryId)
      : this.castingSpells.filter(e => e.spellId !== entry.spellId);
    this._patchCasting(updated);
  }

  advanceRound(entry: CastingSpellEntry): void {
    entry.roundsActive = (entry.roundsActive ?? 0) + 1;
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
