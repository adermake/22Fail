import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { StatBlock } from '../model/stat-block.model';
import { LibraryStoreService } from './library-store.service';
import { StatusEffect, StatusModifierTarget } from '../model/status-effect.model';
import { FormulaType } from '../model/formula-type.enum';
import { createPlayerContext } from '../scripting/character-context';
import { ModifierOp, runScript, ScriptGrantedSkill } from '../scripting/interpreter';
import { SkillBlock } from '../model/skill-block.model';

/** A modifier derived from an active effect's `effectActive` block, tagged for the pipeline. */
export interface DerivedModifier {
  target: StatusModifierTarget;
  op: ModifierOp;
  amount: number;
  priority: number;
  source: string;
}
/** A skill derived (effect-bound) from an active effect's `effectActive` block. */
export interface DerivedGrantedSkill extends ScriptGrantedSkill { source: string; }

interface DerivedEntry { fp: string; mods: DerivedModifier[]; skills: DerivedGrantedSkill[]; }
const EMPTY_DERIVED: DerivedEntry = { fp: '', mods: [], skills: [] };

/** Combine a modifier with the running value in the ordered stat pipeline. */
function applyOp(acc: number, op: ModifierOp, amount: number): number {
  switch (op) {
    case 'add': return acc + amount;
    case 'sub': return acc - amount;
    case 'mul': return acc * amount;
    case 'div': return amount === 0 ? acc : acc / amount;
    case 'set': return amount;
  }
}

/**
 * All calculated stat values for a character.
 */
export interface CalculatedStats {
  strength: number;
  dexterity: number;
  speed: number;
  intelligence: number;
  constitution: number;
  wille: number;
}

/**
 * Detailed breakdown of a stat calculation.
 */
export interface CalculatedStatDetails {
  base: number;
  bonus: number;
  gain: number;
  level: number;
  levelBonus: number;
  effectBonus: number;
  total: number;
}

/**
 * Source of a stat modifier for display purposes.
 */
export interface StatModifierSource {
  name: string;
  amount: number;
  type: 'skill' | 'equipment' | 'status_effect';
}

type StatKey = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';
type StatKeyDisplay = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'wille';

/**
 * TrueStatsService - Centralized stat calculation service.
 * 
 * This service provides the canonical implementation for calculating character stats.
 * All stat calculations should go through this service to ensure consistency.
 * 
 * The formula is: (base + bonus + effectBonus + (gain * level)) | 0
 * 
 * Where:
 * - base: The character's base stat value
 * - bonus: Manual bonus added by user
 * - gain: Per-level stat increase (from race)
 * - level: Character's current level
 * - effectBonus: Sum of bonuses from skills (multiplied by skill level) and equipped items
 */
@Injectable({
  providedIn: 'root'
})
export class TrueStatsService {
  private libraryStore = inject(LibraryStoreService);

  // ── effectActive pipeline ──────────────────────────────────────────────────
  // Active effects can carry an `effectActive { … }` script whose stat assignments become
  // ordered modifiers (add/sub/mul/div/set) applied on top of the core value, and whose
  // grantSkill(s) become effect-bound derived skills. Nothing is ever mutated: stats are
  // recomputed from the core + the currently-active effects, so removing an effect makes its
  // contribution vanish automatically. Modifiers are applied in ascending effect `priority`.

  /** Guards against recursion: while collecting, calculators return their pre-pipeline value. */
  private collectingEffectActive = false;
  /** Per-sheet memo of derived modifiers/skills, keyed by a cheap fingerprint of the effects. */
  private derivedCache = new WeakMap<CharacterSheet, DerivedEntry>();
  /** Bumped to force all derived caches to recompute (e.g. after a library effect is edited). */
  private cacheVersion = 0;

  /** Invalidate every sheet's effectActive cache — call after a library effect definition changes. */
  bumpDerivedCache(): void { this.cacheVersion++; }

  /** Ordered stat modifiers derived from all active `effectActive` blocks (cached). */
  getEffectActiveModifiers(sheet: CharacterSheet): DerivedModifier[] {
    return this.getDerived(sheet).mods;
  }

  /** Effect-bound skills granted by active `effectActive` blocks (cached). */
  getDerivedSkills(sheet: CharacterSheet): DerivedGrantedSkill[] {
    return this.getDerived(sheet).skills;
  }

  /** Derived skills as usable SkillBlocks (read-only, effect-bound). Shared by all skill lists. */
  getDerivedSkillBlocks(sheet: CharacterSheet): SkillBlock[] {
    return this.getDerivedSkills(sheet).map(g => ({
      name: g.name,
      class: `Effekt: ${g.source}`,
      description: g.description || 'Effektgebundene Fähigkeit',
      type: 'active' as const,
      enlightened: false,
      script: g.script,
      derived: true,
      actionType: g.actionType,
      cost: g.manaCost ? { type: 'mana' as const, amount: g.manaCost }
        : g.energyCost ? { type: 'energy' as const, amount: g.energyCost }
        : g.lifeCost ? { type: 'life' as const, amount: g.lifeCost }
        : undefined,
    }));
  }

  private getDerived(sheet: CharacterSheet): DerivedEntry {
    if (this.collectingEffectActive) return EMPTY_DERIVED;
    const fp = this.effectFingerprint(sheet);
    const cached = this.derivedCache.get(sheet);
    if (cached && cached.fp === fp) return cached;
    const { mods, skills } = this.collectEffectActive(sheet);
    const entry: DerivedEntry = { fp, mods, skills };
    this.derivedCache.set(sheet, entry);
    return entry;
  }

  /** Invalidation key: which effects are active, their stacks/duration/level, and the RESOLVED
   * script + priority of each (so library effects, per-instance overrides, and effects whose
   * definition resolves only after the library finishes loading all re-derive correctly). */
  private effectFingerprint(sheet: CharacterSheet): string {
    let s = `V${this.cacheVersion}L${sheet.level ?? 1}`;
    for (const e of sheet.activeStatusEffects ?? []) {
      const eff = this.resolveStatusEffect(e.statusEffectId, e.customEffect);
      s += `|${e.statusEffectId}:${e.stacks ?? 1}:${e.duration ?? ''}#${eff?.priority ?? 0}#${eff?.script ?? ''}`;
    }
    return s;
  }

  private collectEffectActive(sheet: CharacterSheet): { mods: DerivedModifier[]; skills: DerivedGrantedSkill[] } {
    const mods: DerivedModifier[] = [];
    const skills: DerivedGrantedSkill[] = [];
    this.collectingEffectActive = true;
    try {
      for (const active of sheet.activeStatusEffects ?? []) {
        const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
        const src = effect?.script;
        if (!src || (!src.includes('effectActive') && !src.includes('untilNextTurn'))) continue;
        const ctx = createPlayerContext(sheet, this, {
          inCombat: true,
          stacks: active.stacks || 1,
          turn: 0,
          duration: active.duration ?? 0,
          effectStrength: effect?.strength ?? 0,
          rng: Math.random,
        });
        const res = runScript(src, ctx, { collect: true });
        const priority = effect?.priority ?? 0;
        const source = active.customName ?? effect?.name ?? active.statusEffectId;
        for (const m of res.modifiers) mods.push({ ...m, priority, source });
        for (const g of res.grantedSkills) skills.push({ ...g, source });
      }
    } finally {
      this.collectingEffectActive = false;
    }
    return { mods, skills };
  }

  /** Apply the derived modifiers for `target` (sorted by priority) on top of `base`. */
  private applyEffectPipeline(sheet: CharacterSheet, target: StatusModifierTarget, base: number): number {
    if (this.collectingEffectActive) return base;
    const mods = this.getEffectActiveModifiers(sheet);
    if (mods.length === 0) return base;
    const relevant = mods
      .map((m, i) => ({ m, i }))
      .filter(x => x.m.target === target)
      .sort((a, b) => (a.m.priority - b.m.priority) || (a.i - b.i));
    let acc = base;
    for (const { m } of relevant) acc = applyOp(acc, m.op, m.amount);
    return acc;
  }

  /**
   * Additive modifiers for a DERIVED target (bewegung/grundbonus/reaktion/armor*) from skills
   * (× skill level) and equipped items. Base attributes are handled by calculateEffectBonus;
   * without this, a skill or item could only ever buff a base stat, never movement et al.
   *
   * Skill/item modifiers spell some targets differently than StatusModifierTarget
   * ('movement' → 'bewegung', 'focus' → 'fokus'), so they are normalised here.
   */
  private getSkillItemModifierTotal(sheet: CharacterSheet, target: StatusModifierTarget): number {
    const normalise = (stat: string): string =>
      stat === 'movement' ? 'bewegung' : stat === 'focus' ? 'fokus' : stat;

    let total = 0;
    for (const skill of sheet.skills ?? []) {
      for (const mod of skill.statModifiers ?? []) {
        if (normalise(mod.stat) === target) total += mod.amount * (skill.level || 1);
      }
    }
    for (const item of sheet.equipment ?? []) {
      for (const mod of item.statModifiers ?? []) {
        if (normalise(mod.stat) === target) total += mod.amount;
      }
    }
    return total;
  }

  /** Static modifiers for a derived target (status + skills + items), then the effectActive pipeline. */
  private statusTargetTotal(sheet: CharacterSheet, target: StatusModifierTarget): number {
    const base = this.getStatusModifierTotal(sheet, target)
      + this.getSkillItemModifierTotal(sheet, target);
    return this.applyEffectPipeline(sheet, target, base);
  }

  /** Public: apply the effectActive pipeline for `target` on top of a caller-computed core. */
  applyEffectActivePipeline(sheet: CharacterSheet, target: StatusModifierTarget, core: number): number {
    return this.applyEffectPipeline(sheet, target, core);
  }

  /** Public: derived modifiers for one target, in applied order (for a core → … → total view). */
  getEffectPipelineFor(sheet: CharacterSheet, target: StatusModifierTarget): DerivedModifier[] {
    return this.getEffectActiveModifiers(sheet)
      .map((m, i) => ({ m, i }))
      .filter(x => x.m.target === target)
      .sort((a, b) => (a.m.priority - b.m.priority) || (a.i - b.i))
      .map(x => x.m);
  }


  /**
   * Calculate the effect bonus for a specific stat from skills and equipment.
   * This matches the logic in stat.component.ts effectBonus getter.
   * 
   * @param sheet The character sheet
   * @param statKey The stat to calculate ('strength', 'dexterity', etc.)
   * @returns The total effect bonus from all sources
   */
  calculateEffectBonus(sheet: CharacterSheet, statKey: StatKey): number {
    let total = 0;

    // Add bonuses from skills (multiplied by skill level)
    if (sheet.skills) {
      for (const skill of sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
              const multiplier = skill.level || 1;
              total += modifier.amount * multiplier;
            }
          }
        }
      }
    }

    // Add bonuses from equipped items
    if (sheet.equipment) {
      for (const item of sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statKey) {
              total += modifier.amount;
            }
          }
        }
      }
    }

    // Add bonuses from active status effects
    if (sheet.activeStatusEffects) {
      for (const active of sheet.activeStatusEffects) {
        const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
        if (effect?.statModifiers) {
          for (const modifier of effect.statModifiers) {
            if (modifier.stat === statKey) {
              const stacks = active.stacks || 1;
              total += modifier.amount * stacks;
            }
          }
        }
      }
    }

    return total;
  }

  /**
   * Sum every active status effect's modifier for a given target (× stacks). This is the
   * single entry point derived-stat calculations use so status effects are always folded
   * in — Fokus, Rüstungsmalus/-negation, Grundbonus, Reaktion, Bewegung, resources, etc.
   */
  getStatusModifierTotal(sheet: CharacterSheet, target: StatusModifierTarget): number {
    let total = 0;
    for (const active of sheet.activeStatusEffects || []) {
      const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
      if (!effect?.statModifiers) continue;
      for (const mod of effect.statModifiers) {
        if (mod.stat === target) total += mod.amount * (active.stacks || 1);
      }
    }
    return total;
  }

  /** Total modifier a status effect adds to a specific Talent's Würfelbonus (× stacks). */
  getStatusTalentBonus(sheet: CharacterSheet, talentId: string): number {
    let total = 0;
    for (const active of sheet.activeStatusEffects || []) {
      const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
      if (!effect?.talentModifiers) continue;
      for (const mod of effect.talentModifiers) {
        if (mod.talentId === talentId) total += mod.amount * (active.stacks || 1);
      }
    }
    return total;
  }

  private resolveStatusEffect(statusEffectId: string, customEffect?: StatusEffect): StatusEffect | undefined {
    if (customEffect) return customEffect;
    for (const lib of this.libraryStore.allLibraries) {
      const found = lib.statusEffects?.find((se: StatusEffect) => se.id === statusEffectId);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Get all sources contributing to a stat's effect bonus.
   * Useful for displaying tooltips showing where bonuses come from.
   * 
   * @param sheet The character sheet
   * @param statKey The stat to get sources for
   * @returns Array of modifier sources with their names and amounts
   */
  getEffectBonusSources(sheet: CharacterSheet, statKey: StatKey): StatModifierSource[] {
    const sources: StatModifierSource[] = [];

    // Collect sources from skills
    if (sheet.skills) {
      for (const skill of sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
              const multiplier = skill.level || 1;
              const amount = modifier.amount * multiplier;
              sources.push({
                name: skill.name,
                amount,
                type: 'skill'
              });
            }
          }
        }
      }
    }

    // Collect sources from equipment
    if (sheet.equipment) {
      for (const item of sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statKey) {
              sources.push({
                name: item.name,
                amount: modifier.amount,
                type: 'equipment'
              });
            }
          }
        }
      }
    }

    // Collect sources from active status effects
    if (sheet.activeStatusEffects) {
      for (const active of sheet.activeStatusEffects) {
        const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
        if (effect?.statModifiers) {
          for (const modifier of effect.statModifiers) {
            if (modifier.stat === statKey) {
              const stacks = active.stacks || 1;
              sources.push({
                name: active.customName ?? effect.name ?? active.statusEffectId,
                amount: modifier.amount * stacks,
                type: 'status_effect'
              });
            }
          }
        }
      }
    }

    return sources;
  }

  /**
   * Calculate a single stat's true value.
   * Formula: (base + bonus + free + effectBonus + (gain * level)) | 0
   * 
   * @param sheet The character sheet
   * @param stat The stat block to calculate
   * @param statKey The stat key for effect bonus lookup
   * @returns The calculated stat value
   */
  calculateStat(sheet: CharacterSheet, stat: StatBlock | undefined, statKey: StatKey): number {
    if (!stat) return 10; // Default fallback
    
    const base = stat.base || 0;
    const bonus = stat.bonus || 0;
    const free = stat.free || 0;
    const gain = stat.gain || 0;
    const level = sheet.level || 1;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);

    // Core (base + additive bonuses), then the ordered effectActive pipeline (*, /, set …).
    const core = base + bonus + free + effectBonus + (gain * level);
    return this.applyEffectPipeline(sheet, statKey as StatusModifierTarget, core) | 0;
  }

  /**
   * Calculate a stat with full breakdown details.
   * Useful for debugging or displaying detailed stat information.
   * 
   * @param sheet The character sheet
   * @param stat The stat block to calculate
   * @param statKey The stat key for effect bonus lookup
   * @returns Detailed breakdown of the calculation
   */
  calculateStatDetails(sheet: CharacterSheet, stat: StatBlock | undefined, statKey: StatKey): CalculatedStatDetails {
    const base = stat?.base || 0;
    const bonus = stat?.bonus || 0;
    const free = stat?.free || 0;
    const gain = stat?.gain || 0;
    const level = sheet.level || 1;
    const levelBonus = gain * level;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);
    const total = (base + bonus + free + effectBonus + levelBonus) | 0;
    
    return { base, bonus, gain, level, levelBonus, effectBonus, total };
  }

  /**
   * Get all calculated stats for a character.
   * 
   * @param sheet The character sheet
   * @returns All six stats calculated
   */
  getAllStats(sheet: CharacterSheet): CalculatedStats {
    return {
      strength: this.calculateStat(sheet, sheet.strength, 'strength'),
      dexterity: this.calculateStat(sheet, sheet.dexterity, 'dexterity'),
      speed: this.calculateStat(sheet, sheet.speed, 'speed'),
      intelligence: this.calculateStat(sheet, sheet.intelligence, 'intelligence'),
      constitution: this.calculateStat(sheet, sheet.constitution, 'constitution'),
      wille: this.calculateStat(sheet, sheet.chill, 'chill'),
    };
  }

  /**
   * Calculate speed for battle/movement purposes.
   * This is the most commonly needed stat calculation.
   * IMPORTANT: This returns base speed WITHOUT penalties.
   * For actual movement speed, use calculateEffectiveSpeed()
   * 
   * @param sheet The character sheet
   * @returns The calculated base speed value
   */
  calculateSpeed(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.speed, 'speed');
  }

  /**
   * Calculate strength.
   */
  calculateStrength(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.strength, 'strength');
  }

  /**
   * Calculate dexterity.
   */
  calculateDexterity(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.dexterity, 'dexterity');
  }

  /**
   * Calculate intelligence.
   */
  calculateIntelligence(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.intelligence, 'intelligence');
  }

  /**
   * Calculate constitution.
   */
  calculateConstitution(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.constitution, 'constitution');
  }

  /**
   * Calculate wille (formerly chill).
   */
  calculateWille(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.chill, 'chill');
  }

  /**
   * Calculate the D&D-style modifier for a stat.
   * Formula: (total − 10) / 4 | 0  (neutral at 10)
   *
   * This gives:
   * - Stat 10 = +0 modifier
   * - Stat 14 = +1 modifier
   * - Stat 6  = −1 modifier
   *
   * @param sheet The character sheet
   * @param statKey The stat to calculate modifier for
   * @returns The dice roll modifier
   */
  calculateStatModifier(sheet: CharacterSheet, statKey: StatKey): number {
    const statBlock = sheet[statKey] as StatBlock;
    const total = this.calculateStat(sheet, statBlock, statKey);
    return ((total - 10) / 4) | 0;
  }

  /** Dice roll modifier (inverted — lower is better). Matches stat card display. */
  calculateStatDiceModifier(sheet: CharacterSheet, statKey: StatKey): number {
    const statBlock = sheet[statKey] as StatBlock;
    const total = this.calculateStat(sheet, statBlock, statKey);
    return ((10 - total) / 4) | 0;
  }

  /** ⌊Level / 8⌋ — base portion that shifts from Reaktion to Grundbonus. */
  calculateGrundbonusBaseFromLevel(sheet: CharacterSheet): number {
    return Math.floor((sheet.level || 1) / 8);
  }

  /** ⌊Wille / 8⌋ — Wille bonus added to Grundbonus. */
  calculateWilleBonus(sheet: CharacterSheet): number {
    return Math.floor(this.calculateWille(sheet) / 8);
  }

  /** Grundbonus = ⌊Level/8⌋ + ⌊Wille/8⌋ + Bonus (+ status effects). */
  calculateGrundbonus(sheet: CharacterSheet): number {
    return this.calculateGrundbonusBaseFromLevel(sheet)
      + this.calculateWilleBonus(sheet)
      + (sheet.grundbonusBonus || 0)
      + this.statusTargetTotal(sheet, 'grundbonus');
  }

  /** Reaktion = 5 − ⌊Wille/8⌋ − ⌊Level/8⌋ + Bonus (+ status effects). */
  calculateReaktionswert(sheet: CharacterSheet): number {
    return 5
      - this.calculateWilleBonus(sheet)
      - this.calculateGrundbonusBaseFromLevel(sheet)
      + (sheet.reaktionswertBonus || 0)
      + this.statusTargetTotal(sheet, 'reaktion');
  }

  /** Speed-penalty negation from the sheet plus any status effects (Rüstungsnegation). */
  calculateSpeedPenaltyNegation(sheet: CharacterSheet): number {
    return (sheet.speedPenaltyNegation || 0) + this.statusTargetTotal(sheet, 'armorNegation');
  }

  /** Total speed malus before negation (armor + encumbrance + status Rüstungsmalus). */
  calculateTotalSpeedMalus(sheet: CharacterSheet): number {
    const baseSpeed = this.calculateSpeed(sheet);
    return this.calculateTotalArmorDebuff(sheet)
      + this.calculateEncumbrancePenalty(sheet, baseSpeed)
      + this.statusTargetTotal(sheet, 'armorMalus');
  }

  getGrundbonusFormulaTooltip(sheet: CharacterSheet): string {
    const levelBase = this.calculateGrundbonusBaseFromLevel(sheet);
    const willeBonus = this.calculateWilleBonus(sheet);
    const extra = sheet.grundbonusBonus || 0;
    let line = `= ${levelBase} + ${willeBonus}`;
    if (extra) line += ` + ${extra}`;
    line += ` = ${this.calculateGrundbonus(sheet)}`;
    return `⌊Level / 8⌋ + ⌊Wille / 8⌋ + Bonus\n${line}`;
  }

  getReaktionswertFormulaTooltip(sheet: CharacterSheet): string {
    const levelBase = this.calculateGrundbonusBaseFromLevel(sheet);
    const willeBonus = this.calculateWilleBonus(sheet);
    const extra = sheet.reaktionswertBonus || 0;
    let line = `= 5 − ${willeBonus} − ${levelBase}`;
    if (extra) line += ` + ${extra}`;
    line += ` = ${this.calculateReaktionswert(sheet)}`;
    return `5 − ⌊Wille / 8⌋ − ⌊Level / 8⌋ + Bonus\n${line}`;
  }

  getMovementFormulaTooltip(sheet: CharacterSheet): string {
    const eff = this.calculateEffectiveSpeed(sheet);
    const mov = this.calculateMovementSpeed(sheet);
    const bewegung = this.getStatusModifierTotal(sheet, 'bewegung');
    const base = `⌊8 + Effektive Geschw. / 4⌋\nEffektive Geschw.: ${eff}\n= ⌊8 + ${eff} / 4⌋`;
    if (bewegung) {
      const sign = bewegung > 0 ? '+' : '−';
      return `${base} ${sign} ${Math.abs(bewegung)} (Bewegung) = ${mov}`;
    }
    return `${base} = ${mov}`;
  }

  getFokusFormulaTooltip(sheet: CharacterSheet): string {
    const int = this.calculateIntelligence(sheet);
    const intHalf = Math.floor(int / 2);
    const fb = sheet.fokusBonus || 0;
    const fm = sheet.fokusMultiplier || 1;
    const inner = fb ? `${intHalf} + 5 + ${fb}` : `${intHalf} + 5`;
    return `(⌊INT / 2⌋ + 5 + Bonus) × Multiplikator\n= (${inner}) × ${fm} = ${this.calculateFokusMax(sheet)}`;
  }

  getArmorNegationFormulaTooltip(sheet: CharacterSheet): string {
    const malus = this.calculateTotalSpeedMalus(sheet);
    const neg = this.calculateSpeedPenaltyNegation(sheet);
    const after = Math.max(0, malus - neg);
    return `1 Punkt negiert 1 Malus-Punkt (Rüstung + Belastung)\nMalus gesamt: ${malus}, Negation: ${neg}\nVerbleibender Malus: ${after}`;
  }

  /** Stack-aware item weight (weight × amount when stackable). */
  getItemStackWeight(item: { weight?: number; stackable?: boolean; amount?: number } | null | undefined): number {
    if (!item) return 0;
    const w = item.weight || 0;
    const qty = item.stackable && (item.amount ?? 1) > 1 ? (item.amount ?? 1) : 1;
    return w * qty;
  }

  /** Max spell fokus pool from calculated intelligence + sheet bonuses + status effects. */
  calculateFokusMax(sheet: CharacterSheet): number {
    const intelligence = this.calculateIntelligence(sheet);
    const base = Math.floor(intelligence / 2) + 5;
    const bonus = (sheet.fokusBonus || 0) + this.getStatusModifierTotal(sheet, 'fokus');
    return Math.floor((base + bonus) * (sheet.fokusMultiplier || 1));
  }

  /** Clamp resource current; life may go negative, others floor at 0. */
  clampResourceCurrent(formulaType: FormulaType, current: number, max: number): number {
    if (formulaType === FormulaType.LIFE) {
      return Math.min(max, current);
    }
    return Math.max(0, Math.min(max, current));
  }

  /**
   * Calculate effective speed after all penalties.
   * Takes into account:
   * - Armor debuff from equipped items
   * - Encumbrance penalty from inventory weight
   * - Speed penalty negation (reduces both penalties)
   * 
   * Rules:
   * - Armor: Each equipped item may have armorDebuff field
   * - Encumbrance: 80-99% = half speed, 100%+ = speed becomes 0
   * - Negation: speedPenaltyNegation reduces total penalty (but can't make speed higher than base)
   * 
   * @param sheet The character sheet
   * @returns Speed after all penalties
   */
  calculateEffectiveSpeed(sheet: CharacterSheet): number {
    const baseSpeed = this.calculateSpeed(sheet);

    // Armor penalty (items) + encumbrance + status Rüstungsmalus
    const armorDebuff = this.calculateTotalArmorDebuff(sheet);
    const encumbrancePenalty = this.calculateEncumbrancePenalty(sheet, baseSpeed);
    const statusMalus = this.statusTargetTotal(sheet, 'armorMalus');

    // Total penalty before negation
    const totalPenalty = armorDebuff + encumbrancePenalty + statusMalus;

    // Apply speed penalty negation (can reduce penalty but not create bonus speed)
    const negation = this.calculateSpeedPenaltyNegation(sheet);
    const finalPenalty = Math.max(0, totalPenalty - negation);

    // Apply penalty to base speed
    return Math.max(0, baseSpeed - finalPenalty);
  }

  /**
   * Movement speed in hex steps: ⌊5 + effective speed / 4⌋, then the status "Bewegung"
   * modifier is added flatly on top (it bypasses the speed→movement conversion; speed
   * itself is unaffected).
   */
  calculateMovementSpeed(sheet: CharacterSheet): number {
    const spd = this.calculateEffectiveSpeed(sheet);
    const bewegung = this.statusTargetTotal(sheet, 'bewegung');
    return Math.max(0, Math.floor(8 + spd / 4) + bewegung);
  }

  /**
   * Calculate encumbrance penalty from inventory weight.
   * 
   * Rules:
   * - < 80% capacity: No penalty
   * - 80-99% capacity: Half of current speed
   * - >= 100% capacity: All speed (becomes 0)
   * 
   * @param sheet The character sheet
   * @param currentSpeed The current base speed (before encumbrance)
   * @returns Speed penalty from being over-encumbered
   */
  private calculateEncumbrancePenalty(sheet: CharacterSheet, currentSpeed: number): number {
    const percentage = this.getEncumbrancePercentage(sheet);
    
    if (percentage < 80) {
      return 0; // No penalty
    } else if (percentage < 100) {
      return Math.floor(currentSpeed / 2); // Half speed penalty
    } else {
      return currentSpeed; // All speed (becomes 0)
    }
  }

  /**
   * Calculate encumbrance percentage.
   * 
   * @param sheet The character sheet
   * @returns Percentage of max capacity being used (0-100+)
   */
  getEncumbrancePercentage(sheet: CharacterSheet): number {
    const totalWeight = this.getTotalWeight(sheet);
    const maxCapacity = this.getMaxCapacity(sheet);
    
    if (maxCapacity === 0) return 100; // Avoid division by zero
    return (totalWeight / maxCapacity) * 100;
  }

  /**
   * Calculate total inventory weight including currency.
   * 
   * @param sheet The character sheet
   * @returns Total weight in pounds/kg
   */
  getTotalWeight(sheet: CharacterSheet): number {
    const itemWeight = sheet.inventory?.reduce((sum, item) => sum + this.getItemStackWeight(item), 0) || 0;
    const equipmentWeight = sheet.equipment?.reduce((sum, item) => sum + this.getItemStackWeight(item), 0) || 0;
    
    // Currency weight (using COIN_WEIGHT constant)
    const COIN_WEIGHT = 0.02; // 50 coins per pound
    const currencyWeight = sheet.currency ? (
      (sheet.currency.copper || 0) +
      (sheet.currency.silver || 0) +
      (sheet.currency.gold || 0) +
      (sheet.currency.platinum || 0)
    ) * COIN_WEIGHT : 0;
    
    return Math.floor(itemWeight + equipmentWeight + currencyWeight);
  }

  /**
   * Calculate maximum carry capacity.
   * Formula: (strength * 8) * multiplier + bonus
   * 
   * @param sheet The character sheet
   * @returns Maximum carry capacity
   */
  getMaxCapacity(sheet: CharacterSheet): number {
    const strength = this.calculateStrength(sheet);
    const baseCapacity = strength * 8;
    const multiplier = sheet.carryCapacityMultiplier || 1;
    const bonus = sheet.carryCapacityBonus || 0;
    
    return Math.floor(baseCapacity * multiplier + bonus);
  }

  /**
   * Raw armor speed malus points (before Rüstungsnegation).
   * Each 5 armor debuff = 1 malus; broken armor adds +5 malus.
   */
  calculateTotalArmorDebuff(sheet: CharacterSheet): number {
    if (!sheet.equipment) return 0;

    let sumOfArmorDebuffs = 0;
    let brokenPenalty = 0;
    for (const item of sheet.equipment) {
      sumOfArmorDebuffs += item.armorDebuff || 0;
      if (item.broken && item.itemType === 'armor') {
        brokenPenalty += 5;
      }
    }
    return Math.round(sumOfArmorDebuffs / 5) + brokenPenalty;
  }

  /**
   * Check if a character meets the stat requirements for an item.
   * 
   * @param sheet The character sheet
   * @param requirements Object with stat requirements
   * @returns True if all requirements are met
   */
  meetsRequirements(
    sheet: CharacterSheet, 
    requirements: Partial<Record<StatKey, number>>
  ): boolean {
    for (const [statKey, required] of Object.entries(requirements)) {
      if (required) {
        const statBlock = sheet[statKey as StatKey] as StatBlock;
        const current = this.calculateStat(sheet, statBlock, statKey as StatKey);
        if (current < required) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Update the .current property on all stat blocks.
   * Call this after making changes to ensure cached values are fresh.
   * 
   * @param sheet The character sheet to update
   */
  updateCurrentValues(sheet: CharacterSheet): void {
    const stats = this.getAllStats(sheet);
    
    if (sheet.strength) sheet.strength.current = stats.strength;
    if (sheet.dexterity) sheet.dexterity.current = stats.dexterity;
    if (sheet.speed) sheet.speed.current = stats.speed;
    if (sheet.intelligence) sheet.intelligence.current = stats.intelligence;
    if (sheet.constitution) sheet.constitution.current = stats.constitution;
    if (sheet.chill) sheet.chill.current = stats.wille;
  }

  /**
   * Check if the character has the Naturtalent skill (Human racial skill).
   * Naturtalent grants a free stat point every 2 levels instead of every 3.
   * 
   * @param sheet The character sheet
   * @returns True if the character has Naturtalent
   */
  hasNaturtalent(sheet: CharacterSheet): boolean {
    // Check if the character has learned the Naturtalent skill (skill-based only, not hardcoded by race)
    return sheet.learnedSkillIds?.includes('race_menschen_naturtalent') || 
           sheet.skills?.some(skill => skill.name === 'Naturtalent') || false;
  }

  /**
   * Calculate total free stat points earned at a given level.
   * Formula: 1 point every 3 levels (or every 2 levels with Naturtalent)
   * 
   * @param sheet The character sheet
   * @returns Total free stat points earned
   */
  calculateTotalFreeStatPoints(sheet: CharacterSheet): number {
    const level = sheet.level || 1;
    const hasNaturtalent = this.hasNaturtalent(sheet);
    const interval = hasNaturtalent ? 2 : 3;
    
    return Math.floor(level / interval);
  }

  /**
   * Calculate total free stat points spent.
   * 
   * @param sheet The character sheet
   * @returns Total free stat points allocated to stats
   */
  calculateSpentFreeStatPoints(sheet: CharacterSheet): number {
    const stats: StatBlock[] = [
      sheet.strength,
      sheet.dexterity,
      sheet.speed,
      sheet.intelligence,
      sheet.constitution,
      sheet.chill  // wille
    ];
    
    return stats.reduce((sum, stat) => sum + (stat?.free || 0), 0);
  }

  /**
   * Calculate available free stat points.
   * 
   * @param sheet The character sheet
   * @returns Available free stat points to spend
   */
  calculateAvailableFreeStatPoints(sheet: CharacterSheet): number {
    const total = this.calculateTotalFreeStatPoints(sheet);
    const spent = this.calculateSpentFreeStatPoints(sheet);
    const stored = sheet.freeStatPoints || 0;
    const bonus = sheet.freeStatPointsBonus || 0;
    
    // Available = (Total - Spent) + Stored + GM Bonus
    return (total - spent) + stored + bonus;
  }

  /**
   * Calculate the maximum value of a resource (life/energy/mana).
   * Mirrors the formula in currentstat.component.ts:
   *   max = statusBase + statusBonus + effectBonus + stat * 5
   */
  calculateResourceMax(sheet: CharacterSheet, formulaType: FormulaType): number {
    const status = sheet.statuses?.find(s => s.formulaType === formulaType);
    if (!status) return 0;

    const base = status.statusBase || 0;
    const bonus = status.statusBonus || 0;
    const effectBonus = this.calculateResourceEffectBonus(sheet, formulaType);

    let statBonus = 0;
    switch (formulaType) {
      case FormulaType.LIFE:
        statBonus = this.calculateConstitution(sheet) * 5;
        break;
      case FormulaType.ENERGY:
        statBonus = this.calculateDexterity(sheet) * 5;
        break;
      case FormulaType.MANA:
        statBonus = this.calculateIntelligence(sheet) * 5;
        break;
    }

    return base + bonus + effectBonus + statBonus;
  }

  private calculateResourceEffectBonus(sheet: CharacterSheet, formulaType: FormulaType): number {
    const statKey = formulaType === FormulaType.LIFE ? 'life'
      : formulaType === FormulaType.ENERGY ? 'energy'
      : 'mana';
    let total = 0;

    for (const skill of (sheet.skills || [])) {
      if (skill.statModifiers) {
        for (const mod of skill.statModifiers) {
          if (mod.stat === statKey) total += mod.amount * (skill.level || 1);
        }
      }
    }

    for (const item of (sheet.equipment || [])) {
      if (item?.statModifiers) {
        for (const mod of item.statModifiers) {
          if (mod.stat === statKey) total += mod.amount;
        }
      }
    }

    for (const active of (sheet.activeStatusEffects || [])) {
      const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
      if (effect?.statModifiers) {
        for (const mod of effect.statModifiers) {
          if (mod.stat === statKey) total += mod.amount * (active.stacks || 1);
        }
      }
    }

    return total;
  }
}
