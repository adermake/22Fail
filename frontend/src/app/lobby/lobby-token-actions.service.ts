import { EventEmitter, Injectable, OnDestroy, Signal, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Token, TokenStatusEffect } from '../model/lobby.model';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { NpcStatblock } from '../model/npc-statblock.model';
import { SUMMON_RUNE_ID } from '../shared/spell-node-editor/spell-node.model';
import { SpellBlock, CastingSpellEntry, ActiveSkillEntry } from '../model/spell-block-model';
import { SkillBlock } from '../model/skill-block.model';
import { FormulaType } from '../model/formula-type.enum';
import { SKILL_DEFINITIONS } from '../data/skill-definitions';
import { TALENT_DEFINITIONS } from '../data/talent-definitions';
import { SkillDefinition } from '../model/skill-definition.model';
import { CharacterSocketService } from '../services/character-socket.service';
import { TrueStatsService } from '../services/true-stats.service';
import { ActiveStatusEffect, StatusEffect } from '../model/status-effect.model';
import { ActionMacro } from '../model/action-macro.model';
import { LibraryStoreService } from '../services/library-store.service';
import {
  UnifiedMacroExecutorService, UnifiedMacroResult, ScriptExecution,
} from '../services/unified-macro-executor.service';
import { hasBaseAction, listTriggers } from '../scripting/interpreter';
import { cleanseFromList } from '../utils/status-cleanse.util';
import { isItemEquipped } from '../utils/equip-slot.utils';
import { ItemBlock } from '../model/item-block.model';
import { applyStacking } from '../utils/status-stacking.utils';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scroll-lock.util';
import { StatBlock } from '../model/stat-block.model';
import { RuneBlock } from '../model/rune-block.model';
import { committedFokus, spellFokusCost, spellManaCost } from '../utils/spell-costs.util';

/** Stack cap for statuses created by giveStatus(...) — effectively "always stackable". */
const GIVEN_STATUS_MAX_STACKS = 99;

/** Where the service reads the selected token from — the lobby's own signals. */
export interface TokenActionSources {
  token: Signal<Token | null>;
  character: Signal<CharacterSheet | null>;
  npc: Signal<NpcStatblock | null>;
  isGM: Signal<boolean>;
}

/**
 * Everything you can DO with the selected token in the lobby: its status effects (and running
 * them), its active spells/skills/gear with their triggers, and activating new ones.
 *
 * This used to live inside one tabbed bottom panel. The lobby now spreads it over the screen —
 * status strip on top, active column on the left, abilities dock at the bottom — and those three
 * views share this one instance (provided by `LobbyComponent`), so a run started in the strip and
 * a trigger fired in the column keep one consistent state.
 *
 * Views are OnPush: they read `tick()` so a change to the plain fields here re-renders them.
 */
@Injectable()
export class LobbyTokenActionsService implements OnDestroy {
  private charSocket = inject(CharacterSocketService);
  private trueStats = inject(TrueStatsService);
  private libraryStore = inject(LibraryStoreService);
  private macroExecutor = inject(UnifiedMacroExecutorService);

  private sources: TokenActionSources | null = null;
  private subs: Subscription[] = [];

  /** Bumped on every local state change; views read it to refresh. */
  readonly tick = signal(0);
  readonly tokenUpdate = new EventEmitter<Partial<Omit<Token, 'id'>>>();
  readonly sheetPatched = new EventEmitter<{ characterId: string; patch: any }>();
  /** A spell was picked to cast (id, or name when it has none) — the character panel opens the cast window. */
  readonly castRequest = new EventEmitter<string>();

  // ── Status effect state ───────────────────────────────────────────────────
  resolvedEffects = new Map<string, StatusEffect>();

  private expandedFxId: string | null = null;
  editingFx: TokenStatusEffect | null = null;
  editedStatusEffect: StatusEffect | null = null;
  showPicker = false;
  pickerSearch = '';
  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  /** When set, the context menu targets this effect (Bearbeiten/Auslösen); else the add menu. */
  contextMenuFx: TokenStatusEffect | null = null;
  executeAllInProgress = false;
  chainEffects: TokenStatusEffect[] = [];
  chainIndex = 0;
  chainResult: UnifiedMacroResult | null = null;
  chainStepDone = false;

  /** Running per-resource totals for the whole "Alle ausführen" run. */
  chainResourceTotals: { resource: string; displayName: string; total: number }[] = [];
  /** Full itemised log so a summed total can be expanded into its breakdown. */
  private chainResourceLog: { resource: string; displayName: string; amount: number; source: string }[] = [];
  /** Breakdown popup shown when a summarised number is clicked. */
  breakdownPopup: { title: string; color: string; rows: { label: string; value: string; positive: boolean }[] } | null = null;
  /**
   * Anchors the floating results popup BELOW the status chip that triggered it (the strip sits at
   * the top). `cardX` is the chip centre (connector target); `panelX` is clamped to stay on screen.
   */
  resultAnchor: { cardX: number; panelX: number; top: number; color: string } | null = null;
  triggeringEffects = new Set<string>();
  expiringEffects = new Set<string>();
  lastRollResults = new Map<string, UnifiedMacroResult>();

  constructor() {
    // Re-render immediately when the character panel mutates data locally (before server echo)
    this.subs.push(this.charSocket.localUpdate$.subscribe(() => this.bump()));
    this.subs.push(this.libraryStore.allLibraries$.subscribe(() => {
      this.resolveEffects();
      this.bump();
    }));
    if (this.libraryStore.allLibraries.length === 0) {
      this.libraryStore.loadAllLibraries();
    } else {
      this.resolveEffects();
    }
  }

  ngOnDestroy(): void {
    for (const sub of this.subs) sub.unsubscribe();
  }

  bind(sources: TokenActionSources): void {
    this.sources = sources;
  }

  get token(): Token | null { return this.sources?.token() ?? null; }
  get character(): CharacterSheet | null { return this.sources?.character() ?? null; }
  get npc(): NpcStatblock | null { return this.sources?.npc() ?? null; }
  get isGM(): boolean { return this.sources?.isGM() ?? false; }

  private bump(): void {
    this.tick.update(n => n + 1);
  }

  /** A different token was selected: close everything that belonged to the previous one. */
  resetForToken(): void {
    this.expandedFxId = null;
    this.showPicker = false;
    this.showContextMenu = false;
    this.contextMenuFx = null;
    this.breakdownPopup = null;
    this.resultAnchor = null;
    this.chainEffects = [];
    this.chainIndex = 0;
    this.chainResult = null;
    this.chainStepDone = false;
    this.executeAllInProgress = false;
    this.chainResourceTotals = [];
    this.chainResourceLog = [];
    this.triggeringEffects.clear();
    this.expiringEffects.clear();
    this.bump();
  }

  get hasSelection(): boolean {
    return !!this.token;
  }

  private get characterId(): string | null {
    return this.token?.characterId ?? null;
  }

  // ── Available skills and spells ───────────────────────────────────────────

  get availableSkills(): SkillBlock[] {
    if (this.character) {
      const own = (this.character.skills ?? []).filter(s => {
        const effectiveType = this.getSkillDefinition(s)?.type ?? s.type;
        return effectiveType === 'active' && !s.disabled;
      });
      // Effect-bound skills granted by active effectActive blocks — derived on demand, so
      // they appear while the source effect is active and vanish when it is removed. Never
      // persisted to character.skills (that was the old "skill leak").
      return [
        ...own,
        ...this.trueStats.getDerivedSkillBlocks(this.character),
        // Abilities embedded in equipped items are usable in play too.
        ...this.trueStats.getItemSkillBlocks(this.character).filter(s => s.type === 'active'),
      ];
    }
    return (this.npc?.customSkills ?? []).filter(s => s.type === 'active');
  }

  get availableSpells(): SpellBlock[] {
    if (this.character) {
      return [...(this.character.spells ?? []), ...this.trueStats.getItemSpellBlocks(this.character)];
    }
    return this.npc?.spells ?? [];
  }

  // ── Active state ──────────────────────────────────────────────────────────

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
    return this.castingSpells.length > 0 || this.activeSkillEntries.length > 0
      || this.activeEquipment.length > 0;
  }

  // ── Summon tokens: every Begleiter of this character, always fieldable ────────
  /** No spell/active check on purpose — whether a summon is "really" out is the table's call. */
  get summonTokens(): { id: string; name: string; portrait: string }[] {
    const ownerId = this.character?.id ?? this.token?.id ?? '';
    if (!ownerId) return [];
    const out: { id: string; name: string; portrait: string }[] = [];
    const seen = new Set<string>();
    for (const c of this.character?.companions ?? []) {
      const id = 'companion-' + ownerId + '-' + c.id;
      seen.add(id);
      out.push({ id, name: c.name, portrait: c.statblock.image || c.statblock.defaultPortrait || '' });
    }
    // Legacy: NPC/imported spells that still carry an inline summon statblock (never migrated).
    for (const cs of this.castingSpells.filter(cs => (cs.remainingCast ?? 1) <= 0)) {
      const spell = this.availableSpells.find(s => s.id === cs.spellId || s.name === cs.spellName);
      for (const n of spell?.graph?.nodes ?? []) {
        if (n.runeId !== SUMMON_RUNE_ID || !n.summon?.statblock) continue;
        const id = 'summon-' + ownerId + '-' + n.id;
        if (seen.has(id)) continue; // same spell cast twice → one card is enough
        seen.add(id);
        const sb = n.summon.statblock;
        out.push({ id, name: sb.name, portrait: sb.image || sb.defaultPortrait || '' });
      }
    }
    return out;
  }

  onSummonDragStart(event: DragEvent, s: { id: string; name: string; portrait: string }): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'npc-statblock', statblockId: s.id, name: s.name, portrait: s.portrait,
    }));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
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

  effectiveActionType(skill: SkillBlock): string | undefined {
    return skill.actionType ?? this.getSkillDefinition(skill)?.actionType;
  }

  skillCostLabel(skill: SkillBlock): string {
    const cost = this.effectiveCost(skill);
    if (!cost) return '';
    const unit = cost.type === 'mana' ? 'MP' : cost.type === 'energy' ? 'EP' : 'LP';
    return `${cost.amount} ${unit}${cost.perRound ? '/Rd' : ''}`;
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
    const parts: string[] = [];
    if (spell.costMana)  parts.push(`${spell.costMana}M`);
    if (spell.costFokus) parts.push(`${spell.costFokus}F`);
    return parts.join(' ');
  }

  perTurnLabel(spell: SpellBlock): string {
    const parts: string[] = [];
    if (spell.perTurnMana)  parts.push(`${spell.perTurnMana}M/Rd`);
    if (spell.perTurnFokus) parts.push(`${spell.perTurnFokus}F/Rd`);
    return parts.join(' ');
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

  // ── Status effects ────────────────────────────────────────────────────────

  get statusEffects(): TokenStatusEffect[] {
    if (this.character) {
      return (this.character.activeStatusEffects ?? []).map(ae => this.activeToTokenEffect(ae));
    }
    return this.token?.activeStatusEffects ?? [];
  }

  /** The effect whose detail panel is open — looked up fresh, so server echoes never orphan it. */
  get expandedFx(): TokenStatusEffect | null {
    if (!this.expandedFxId) return null;
    return this.statusEffects.find(e => e.id === this.expandedFxId) ?? null;
  }

  private saveStatusEffects(effects: TokenStatusEffect[]): void {
    const charId = this.characterId;
    if (this.character && charId) {
      const activeEffects = effects.map(fx => this.tokenToActiveEffect(fx));
      this.character.activeStatusEffects = activeEffects;
      const patch = { path: 'activeStatusEffects', value: activeEffects };
      this.sheetPatched.emit({ characterId: charId, patch });
      this.charSocket.sendPatch(charId, patch);
      this.bump();
    } else {
      // Optimistically update the local token too. Without this the parent's round-trip is the
      // only source of truth, so two applications in quick succession both read the pre-save
      // list and each append a fresh instance instead of stacking into the existing one.
      if (this.token) this.token.activeStatusEffects = effects;
      this.tokenUpdate.emit({ activeStatusEffects: effects });
      this.bump();
    }
  }

  private activeToTokenEffect(ae: ActiveStatusEffect): TokenStatusEffect {
    if (ae.customEffect) {
      return {
        id: ae.statusEffectId + '_' + ae.appliedAt,
        statusEffectId: ae.statusEffectId,
        appliedAt: ae.appliedAt,
        customEffect: ae.customEffect,
        name: ae.customName ?? ae.customEffect.name,
        icon: ae.customEffect.icon,
        color: ae.customEffect.color,
        stacks: ae.stacks ?? 1,
        duration: ae.duration,
        isDebuff: ae.customEffect.isDebuff ?? false,
      };
    }
    const resolved = this.resolveLibraryEffect(ae.statusEffectId);
    return {
      id: ae.statusEffectId + '_' + ae.appliedAt,
      statusEffectId: ae.statusEffectId,
      appliedAt: ae.appliedAt,
      name: ae.customName ?? resolved?.name ?? ae.statusEffectId,
      icon: resolved?.icon,
      color: resolved?.color,
      stacks: ae.stacks ?? 1,
      duration: ae.duration,
      isDebuff: resolved?.isDebuff ?? false,
    };
  }

  private resolveLibraryEffect(statusEffectId: string | undefined): StatusEffect | undefined {
    if (!statusEffectId) return undefined;
    for (const lib of this.libraryStore.allLibraries) {
      const found = (lib.statusEffects ?? []).find(e => e.id === statusEffectId);
      if (found) return found;
    }
    return undefined;
  }

  private tokenToActiveEffect(fx: TokenStatusEffect): ActiveStatusEffect {
    // Keep appliedAt stable across saves so the instance id (statusEffectId_appliedAt) does
    // not churn — otherwise the open detail panel loses its effect on each click.
    const active: ActiveStatusEffect = {
      statusEffectId: fx.statusEffectId ?? fx.id,
      sourceLibraryId: '',
      appliedAt: fx.appliedAt ?? Date.now(),
      duration: fx.duration,
      stacks: fx.stacks ?? 1,
      customName: fx.name,
    } as ActiveStatusEffect;
    // Preserve the per-instance override (local edit) so it round-trips instead of reverting
    // to the library definition.
    if (fx.customEffect) {
      active.customEffect = fx.customEffect;
    } else if (!fx.statusEffectId) {
      active.customEffect = {
        id: fx.id, name: fx.name, description: '', icon: fx.icon, color: fx.color,
        isDebuff: fx.isDebuff ?? false,
      } as ActiveStatusEffect['customEffect'];
    }
    return active;
  }

  /** Build Map<id, StatusEffect> from all library entries */
  private resolveEffects(): void {
    const map = new Map<string, StatusEffect>();
    for (const lib of this.libraryStore.allLibraries) {
      for (const effect of (lib as any).statusEffects ?? []) {
        if (effect.id) map.set(effect.id, effect);
      }
    }
    this.resolvedEffects = map;
  }

  /** Resolve StatusEffect for a TokenStatusEffect (customEffect overrides library) */
  getEffect(fx: TokenStatusEffect): StatusEffect | undefined {
    if (fx.customEffect) return fx.customEffect;
    if (fx.statusEffectId) return this.resolvedEffects.get(fx.statusEffectId);
    return undefined;
  }

  /** The effect's own icon (authored data); empty means "render the generic app icon". */
  getEffectIcon(fx: TokenStatusEffect): string {
    return fx.icon || this.getEffect(fx)?.icon || '';
  }

  getEffectColor(fx: TokenStatusEffect): string {
    return fx.color || this.getEffect(fx)?.color || (fx.isDebuff ? '#ef4444' : '#22c55e');
  }

  private static readonly STAT_MOD_LABELS: Record<string, string> = {
    strength: 'STÄ', dexterity: 'GES', speed: 'SPD', intelligence: 'INT',
    constitution: 'KON', chill: 'WIL', life: 'LP', energy: 'EP', mana: 'MP',
    fokus: 'Fokus', armorMalus: 'Rüst.-Malus', armorNegation: 'Rüst.-Neg.',
    grundbonus: 'Grundbonus', reaktion: 'Reaktion', bewegung: 'Bewegung',
  };

  getStatModLabel(stat: string): string {
    return LobbyTokenActionsService.STAT_MOD_LABELS[stat] ?? stat.slice(0, 3).toUpperCase();
  }

  getTalentName(talentId: string): string {
    return TALENT_DEFINITIONS.find(t => t.id === talentId)?.name ?? talentId;
  }

  hasMacro(fx: TokenStatusEffect): boolean {
    const effect = this.getEffect(fx);
    if (!effect) return false;
    return !!(effect.embeddedMacro || (effect as any).embeddedMacros?.length || effect.macroActionId);
  }

  private getAllMacros(effect: StatusEffect): ActionMacro[] {
    const macros: ActionMacro[] = [];
    const e = effect as any;
    if (e.embeddedMacros?.length) {
      macros.push(...e.embeddedMacros);
    } else if (effect.embeddedMacro) {
      macros.push(effect.embeddedMacro);
    }
    if (effect.macroActionId) {
      const found = this.findMacroAction(effect.macroActionId);
      if (found) {
        const f = found as any;
        const asMacro: ActionMacro = {
          id: found.id,
          name: found.name || 'Macro',
          icon: f.icon || '✦',
          color: f.color || '#f59e0b',
          conditions: f.conditions ?? [],
          consequences: f.consequences ?? [],
          referencedSkillNames: f.referencedSkillNames ?? [],
          isValid: f.isValid ?? true,
          order: f.order ?? 0,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };
        macros.push(asMacro);
      }
    }
    return macros;
  }

  private findMacroAction(macroActionId: string): any {
    for (const lib of this.libraryStore.allLibraries) {
      const macro = (lib as any).macroActions?.find((m: any) => m.id === macroActionId);
      if (macro) return macro;
    }
    return null;
  }

  isFxTriggering(fx: TokenStatusEffect): boolean {
    return this.triggeringEffects.has(fx.id);
  }

  isFxExpiring(fx: TokenStatusEffect): boolean {
    return this.expiringEffects.has(fx.id);
  }

  getLastResult(fx: TokenStatusEffect): UnifiedMacroResult | null {
    return this.lastRollResults.get(fx.id) ?? null;
  }

  onFxClick(fx: TokenStatusEffect, event: MouseEvent): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.expandedFxId = this.expandedFxId === fx.id ? null : fx.id;
    this.bump();
  }

  closeExpandedView(): void {
    this.expandedFxId = null;
    this.bump();
  }

  changeDuration(fx: TokenStatusEffect, delta: number): void {
    if (!this.token) return;
    let newDuration: number | undefined;
    if (fx.duration === undefined || fx.duration === null) {
      if (delta > 0) newDuration = 1;
      else return;
    } else {
      const n = fx.duration + delta;
      newDuration = n < 0 ? undefined : n;
    }
    const effects = this.statusEffects.map(e =>
      e.id === fx.id ? { ...e, duration: newDuration } : e
    );
    this.saveStatusEffects(effects);
  }

  changeStacks(fx: TokenStatusEffect, delta: number): void {
    if (!this.token) return;
    const effect = this.getEffect(fx);
    const maxStacks = (effect as any)?.maxStacks ?? 99;
    const newStacks = fx.stacks + delta;
    if (newStacks < 1) {
      this.removeStatusEffect(fx.id);
      return;
    }
    if (newStacks > maxStacks) return;
    const effects = this.statusEffects.map(e =>
      e.id === fx.id ? { ...e, stacks: newStacks } : e
    );
    this.saveStatusEffects(effects);
  }

  removeStatusEffect(id: string): void {
    if (!this.token) return;
    const effects = this.statusEffects.filter(e => e.id !== id);
    if (this.expandedFxId === id) this.expandedFxId = null;
    this.saveStatusEffects(effects);
  }

  // ── Single effect execution ───────────────────────────────────────────────

  executeSingleEffect(fx: TokenStatusEffect, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const effect = this.getEffect(fx);
    if (!effect) return;
    const sheet = this.sheetForMacros;
    const hasScript = !!(effect.script && effect.script.trim());
    const macros = this.getAllMacros(effect);
    if ((!hasScript && macros.length === 0) || !sheet) return;
    const stacks = fx.stacks || 1;
    const allResults: UnifiedMacroResult[] = [];
    this.triggeringEffects.add(fx.id);
    this.bump();
    for (const result of this.runEffectResults(effect, sheet, stacks, fx.duration ?? 0)) {
      allResults.push(result);
      this.applyMacroResourceChanges(result);
    }
    if (allResults.length > 0) {
      this.lastRollResults.set(fx.id, this.mergeResults(allResults, stacks));
    }
    this.changeDuration(fx, -1);
    setTimeout(() => {
      this.triggeringEffects.delete(fx.id);
      this.bump();
    }, 800);
  }

  // ── Chain execution ───────────────────────────────────────────────────────

  startExecuteAllChain(): void {
    if (this.executeAllInProgress || this.chainEffects.length > 0 || this.statusEffects.length === 0) return;
    this.chainEffects = [...this.statusEffects];
    this.chainIndex = 0;
    this.chainResult = null;
    this.chainStepDone = false;
    this.executeAllInProgress = true;
    this.expandedFxId = null;
    this.chainResourceTotals = [];
    this.chainResourceLog = [];
    this.breakdownPopup = null;
    this.bump();
    this.executeCurrentChainStep();
  }

  executeNextInChain(): void {
    // Deliberately NOT gated on chainStepDone: the 800 ms flourish is cosmetic, and blocking
    // on it made stepping through a long list painfully slow. Clicking ahead just advances.
    if (this.chainEffects.length === 0) return;
    if (this.chainIndex >= this.chainEffects.length - 1) {
      this.finalizeChain();
      return;
    }
    this.chainIndex++;
    this.chainResult = null;
    this.chainStepDone = false;
    this.bump();
    this.executeCurrentChainStep();
  }

  private executeCurrentChainStep(): void {
    const fx = this.chainEffects[this.chainIndex];
    if (!fx) return;
    this.triggeringEffects.add(fx.id);
    this.bump();
    if (fx.duration !== undefined && fx.duration !== null && fx.duration > 0) {
      fx.duration -= 1;
    }
    const effect = this.getEffect(fx);
    if (effect) {
      const stacks = fx.stacks || 1;
      const allResults: UnifiedMacroResult[] = [];
      const sheet = this.sheetForMacros;
      if (sheet) {
        for (const result of this.runEffectResults(effect, sheet, stacks, fx.duration ?? 0)) {
          allResults.push(result);
          this.applyMacroResourceChanges(result);
        }
      }
      if (allResults.length > 0) {
        const merged = this.mergeResults(allResults, stacks);
        this.lastRollResults.set(fx.id, merged);
        this.chainResult = merged;
        this.accumulateChainTotals(merged, fx.name);
      } else {
        this.chainResult = this.emptyResult(fx);
      }
    } else {
      this.chainResult = this.emptyResult(fx);
    }
    this.updateResultAnchor();
    setTimeout(() => {
      this.triggeringEffects.delete(fx.id);
      this.chainStepDone = true;
      this.bump();
    }, 800);
  }

  /**
   * Run every effect at once, with no per-step animation. Same bookkeeping as the stepped
   * chain (duration tick-down, resource application, run totals) — just without the wait.
   */
  executeAllInstantly(): void {
    if (this.executeAllInProgress || this.statusEffects.length === 0) return;
    this.chainEffects = [...this.statusEffects];
    this.chainIndex = this.chainEffects.length - 1;
    this.chainResult = null;
    this.executeAllInProgress = true;
    this.expandedFxId = null;
    this.chainResourceTotals = [];
    this.chainResourceLog = [];
    this.breakdownPopup = null;
    this.resultAnchor = null;
    this.runChainStepsFrom(0);
    this.chainStepDone = true;
    this.finalizeChain();
  }

  /** Skip the remaining animation and resolve the rest of an in-progress chain immediately. */
  finishChainInstantly(): void {
    if (this.chainEffects.length === 0) return;
    this.runChainStepsFrom(this.chainIndex + 1);
    this.chainIndex = this.chainEffects.length - 1;
    this.chainStepDone = true;
    this.resultAnchor = null;
    this.finalizeChain();
  }

  /** Execute chain entries [from..end] synchronously (no animation, no timers). */
  private runChainStepsFrom(from: number): void {
    const sheet = this.sheetForMacros;
    for (let i = Math.max(0, from); i < this.chainEffects.length; i++) {
      const fx = this.chainEffects[i];
      if (!fx) continue;
      if (fx.duration !== undefined && fx.duration !== null && fx.duration > 0) fx.duration -= 1;
      const effect = this.getEffect(fx);
      if (!effect || !sheet) continue;
      const stacks = fx.stacks || 1;
      const results: UnifiedMacroResult[] = [];
      for (const result of this.runEffectResults(effect, sheet, stacks, fx.duration ?? 0)) {
        results.push(result);
        this.applyMacroResourceChanges(result);
      }
      if (results.length > 0) {
        const merged = this.mergeResults(results, stacks);
        this.lastRollResults.set(fx.id, merged);
        this.chainResult = merged;
        this.accumulateChainTotals(merged, fx.name);
      }
    }
    this.triggeringEffects.clear();
    this.bump();
  }

  private finalizeChain(): void {
    this.resultAnchor = null;
    const expiring = this.chainEffects.filter(e => e.duration !== undefined && e.duration !== null && e.duration === 0);
    for (const expired of expiring) this.expiringEffects.add(expired.id);
    // The save lands 600 ms later; if another token got selected meanwhile, it must not
    // write this run's durations into that token.
    const tokenId = this.token?.id;
    this.bump();
    setTimeout(() => {
      if (!this.token || this.token.id !== tokenId) return;
      const current = [...this.statusEffects];
      for (const chainFx of this.chainEffects) {
        const match = current.find(e => e.id === chainFx.id);
        if (match && chainFx.duration !== undefined && chainFx.duration !== null) {
          match.duration = chainFx.duration;
        }
      }
      const updated = current.filter(e => e.duration === undefined || e.duration === null || e.duration > 0);
      this.saveStatusEffects(updated);
      this.expiringEffects.clear();
      this.chainEffects = [];
      this.chainIndex = 0;
      this.chainResult = null;
      this.chainStepDone = false;
      this.executeAllInProgress = false;
      this.breakdownPopup = null;
      // Keep chainResourceTotals until the next run starts so the GM can review the total.
      this.bump();
    }, 600);
  }

  /** Fold a step's resource changes into the running run totals + itemised log. */
  private accumulateChainTotals(result: UnifiedMacroResult, source: string): void {
    for (const change of result.resourceChanges) {
      if (!change.amount) continue;
      this.chainResourceLog.push({
        resource: change.resource,
        displayName: change.displayName,
        amount: change.amount,
        source,
      });
      const existing = this.chainResourceTotals.find(t => t.resource === change.resource);
      if (existing) existing.total += change.amount;
      else this.chainResourceTotals.push({ resource: change.resource, displayName: change.displayName, total: change.amount });
    }
  }

  /** Per-resource summary of a single step's result (collapses the wall of numbers). */
  summarizeStepResources(result: UnifiedMacroResult | null): { resource: string; displayName: string; total: number }[] {
    if (!result) return [];
    const map = new Map<string, { resource: string; displayName: string; total: number }>();
    for (const c of result.resourceChanges) {
      if (!c.amount) continue;
      const e = map.get(c.resource);
      if (e) e.total += c.amount;
      else map.set(c.resource, { resource: c.resource, displayName: c.displayName, total: c.amount });
    }
    return [...map.values()];
  }

  /** Open the breakdown popup for one resource, itemised across the whole run. */
  openResourceBreakdown(resource: string, displayName: string, color: string): void {
    const rows = this.chainResourceLog
      .filter(l => l.resource === resource)
      .map(l => ({
        label: l.source,
        value: `${l.amount > 0 ? '+' : ''}${l.amount}`,
        positive: l.amount > 0,
      }));
    this.breakdownPopup = { title: displayName, color, rows };
    this.bump();
  }

  /** Position the floating results panel below the currently-triggering status chip. */
  private updateResultAnchor(): void {
    const fx = this.chainEffects[this.chainIndex];
    if (!fx) { this.resultAnchor = null; return; }
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-fx-id="${fx.id}"]`);
      if (!el) { this.resultAnchor = null; this.bump(); return; }
      const r = el.getBoundingClientRect();
      const cardX = Math.round(r.left + r.width / 2);
      const halfW = 170; // half of the 340px popup
      const panelX = Math.round(Math.min(Math.max(cardX, halfW + 8), window.innerWidth - halfW - 8));
      this.resultAnchor = {
        cardX,
        panelX,
        top: Math.round(r.bottom + 12), // popup sits 12px below the chip
        color: this.getEffectColor(fx),
      };
      this.bump();
    });
  }

  /** Breakdown for one resource of THIS effect only (not the whole run). */
  openStepResourceBreakdown(result: UnifiedMacroResult, resource: string, displayName: string): void {
    const rows = result.resourceChanges
      .filter(rc => rc.resource === resource && rc.amount !== 0)
      .map(rc => ({ label: rc.displayName, value: `${rc.amount > 0 ? '+' : ''}${rc.amount}`, positive: rc.amount > 0 }));
    this.breakdownPopup = { title: displayName, color: result.actionColor, rows };
    this.bump();
  }

  /** Open the roll breakdown for a step: every die, per roll (rolls are hidden by default). */
  openAllRollsBreakdown(result: UnifiedMacroResult): void {
    const rows = result.rolls.map(r => ({
      label: r.rolls.length ? `${r.name} [${r.rolls.join(', ')}]` : r.name,
      value: `= ${r.total}`,
      positive: false,
    }));
    this.breakdownPopup = { title: 'Würfel-Details', color: '#f59e0b', rows };
    this.bump();
  }

  closeBreakdown(): void {
    this.breakdownPopup = null;
    this.bump();
  }

  private mergeResults(results: UnifiedMacroResult[], _stacks: number): UnifiedMacroResult {
    if (results.length === 1) return results[0];
    return {
      success: results.every(r => r.success),
      actionName: results[0].actionName,
      actionIcon: results[0].actionIcon,
      actionColor: results[0].actionColor,
      conditionFailures: results.flatMap(r => r.conditionFailures),
      rolls: results.flatMap(r => r.rolls),
      resourceChanges: results.flatMap(r => r.resourceChanges),
      displays: results.flatMap(r => r.displays ?? []),
      timestamp: new Date(),
    };
  }

  private emptyResult(fx: TokenStatusEffect): UnifiedMacroResult {
    return {
      success: true, actionName: fx.name, actionIcon: this.getEffectIcon(fx),
      actionColor: this.getEffectColor(fx), conditionFailures: [], rolls: [],
      resourceChanges: [], timestamp: new Date(),
    };
  }

  private get sheetForMacros(): CharacterSheet | null {
    if (this.character) return this.character;
    if (this.npc) {
      const sheet = createEmptySheet();
      sheet.statuses = [
        { formulaType: FormulaType.LIFE, statusBase: this.npc.maxHealth ?? 0, statusCurrent: this.token?.currentHealth ?? 0, statusBonus: 0, statusEffectBonus: 0, statusName: 'Leben', statusColor: 'red' },
        { formulaType: FormulaType.MANA, statusBase: this.npc.maxMana ?? 0, statusCurrent: this.token?.currentMana ?? 0, statusBonus: 0, statusEffectBonus: 0, statusName: 'Mana', statusColor: 'blue' },
        { formulaType: FormulaType.ENERGY, statusBase: this.npc.maxEnergy ?? 0, statusCurrent: this.token?.currentEnergy ?? 0, statusBonus: 0, statusEffectBonus: 0, statusName: 'Ausdauer', statusColor: 'green' },
      ];
      return sheet;
    }
    return null;
  }

  /**
   * Run a status effect once. A FailScript runs a SINGLE time with `stacks`/`effectStrength`
   * exposed — the code decides how to apply the stack count. Legacy macros still repeat per stack.
   */
  private runEffectResults(effect: StatusEffect, sheet: CharacterSheet, stacks: number, duration = 0, trigger?: string): UnifiedMacroResult[] {
    if (effect.script && effect.script.trim()) {
      const exec = this.macroExecutor.executeScript(effect.script, sheet, {
        inCombat: true, stacks, turn: 0, duration, effectStrength: effect.strength ?? 0,
        name: effect.name, icon: effect.icon, color: effect.color, trigger,
      });
      this.applyScriptExtras(exec);
      return [exec.unified];
    }
    // Legacy macros have no named triggers; a trigger run does nothing for them.
    if (trigger) return [];
    const results: UnifiedMacroResult[] = [];
    const macros = this.getAllMacros(effect);
    for (let s = 0; s < stacks; s++) {
      for (const m of macros) results.push(this.macroExecutor.executeActionMacro(m, sheet));
    }
    return results;
  }

  /** Whether the effect has a base (non-trigger) action to run — legacy macro or script content. */
  hasBaseAction(fx: TokenStatusEffect): boolean {
    if (this.hasMacro(fx)) return true;
    const script = this.getEffect(fx)?.script;
    if (!script || !script.trim()) return false;
    try { return hasBaseAction(script); } catch { return false; }
  }

  /** Named onTrigger actions declared in this effect's script (for the manual-trigger menu). */
  getEffectTriggers(fx: TokenStatusEffect): string[] {
    const script = this.getEffect(fx)?.script;
    if (!script || !script.trim()) return [];
    try { return listTriggers(script).map(t => t.name); } catch { return []; }
  }

  // ── Manual triggers on active spells and skills ───────────────────────────

  /** Named onTrigger blocks declared by a script (empty when it has none or does not compile). */
  private triggersOf(script: string | undefined): string[] {
    if (!script || !script.trim()) return [];
    try { return listTriggers(script).map(t => t.name); } catch { return []; }
  }

  getSpellTriggers(entry: CastingSpellEntry): string[] {
    return this.triggersOf(this.getSpell(entry.spellId)?.script);
  }

  getSkillTriggers(entry: ActiveSkillEntry): string[] {
    return this.triggersOf(this.getSkillBlock(entry)?.script);
  }

  /** Run one named trigger of a script and apply everything it produced. */
  private fireScriptTrigger(
    script: string, trigger: string, key: string, name: string, icon: string, color: string,
  ): void {
    const sheet = this.sheetForMacros;
    if (!sheet) return;
    const exec = this.macroExecutor.executeScript(script, sheet, {
      inCombat: true, trigger, name, icon, color,
    });
    this.applyScriptExtras(exec);
    this.applyMacroResourceChanges(exec.unified);
    this.lastRollResults.set(key, exec.unified);
    this.triggeringEffects.add(key);
    this.bump();
    setTimeout(() => {
      this.triggeringEffects.delete(key);
      this.bump();
    }, 800);
  }

  executeSpellTrigger(entry: CastingSpellEntry, trigger: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const spell = this.getSpell(entry.spellId);
    if (!spell?.script) return;
    this.fireScriptTrigger(
      spell.script, trigger, entry.entryId ?? entry.spellId,
      entry.spellName, spell.icon || '✦', this.spellColor(spell),
    );
  }

  executeSkillTrigger(entry: ActiveSkillEntry, trigger: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const skill = this.getSkillBlock(entry);
    if (!skill?.script) return;
    this.fireScriptTrigger(
      skill.script, trigger, entry.entryId, entry.skillName, '✦', '#22d3ee',
    );
  }

  // ── Equipped items with effects ───────────────────────────────────────────

  private get equipmentList(): ItemBlock[] {
    return (this.character?.equipment ?? this.npc?.equipment ?? []).filter(Boolean) as ItemBlock[];
  }

  /** Worn items whose script does something: a continuous effect, or a trigger you can fire. */
  get activeEquipment(): ItemBlock[] {
    return this.equipmentList.filter(item => {
      if (!item?.script?.trim() || !isItemEquipped(item)) return false;
      return this.itemHasContinuousEffect(item) || this.getItemTriggers(item).length > 0;
    });
  }

  itemHasContinuousEffect(item: ItemBlock): boolean {
    const src = item.script ?? '';
    return src.includes('effectActive') || src.includes('untilNextTurn');
  }

  getItemTriggers(item: ItemBlock): string[] {
    return this.triggersOf(item.script);
  }

  /** Stable key for the per-card trigger animation / last result. */
  itemKey(item: ItemBlock): string { return item.id || item.name; }

  executeItemTrigger(item: ItemBlock, trigger: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const sheet = this.sheetForMacros;
    if (!item.script || !sheet) return;
    const key = this.itemKey(item);
    const exec = this.macroExecutor.executeScript(item.script, sheet, {
      inCombat: true, trigger, name: item.name, icon: '⚔', color: '#f59e0b', item,
    });
    this.applyScriptExtras(exec);
    this.applyMacroResourceChanges(exec.unified);
    this.lastRollResults.set(key, exec.unified);
    this.triggeringEffects.add(key);
    this.bump();
    setTimeout(() => {
      this.triggeringEffects.delete(key);
      this.bump();
    }, 800);
  }

  /** Result of the last manual trigger on an active card (spell or skill). */
  getLastCardResult(key: string): UnifiedMacroResult | null {
    return this.lastRollResults.get(key) ?? null;
  }

  isCardTriggering(key: string): boolean {
    return this.triggeringEffects.has(key);
  }

  /** Fire a single named onTrigger action (manual, event-based) on an effect. */
  executeTrigger(fx: TokenStatusEffect, trigger: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const effect = this.getEffect(fx);
    const sheet = this.sheetForMacros;
    if (!effect || !sheet) return;
    const stacks = fx.stacks || 1;
    const allResults: UnifiedMacroResult[] = [];
    this.triggeringEffects.add(fx.id);
    this.bump();
    for (const result of this.runEffectResults(effect, sheet, stacks, fx.duration ?? 0, trigger)) {
      allResults.push(result);
      this.applyMacroResourceChanges(result);
    }
    if (allResults.length > 0) {
      this.lastRollResults.set(fx.id, this.mergeResults(allResults, stacks));
    }
    setTimeout(() => {
      this.triggeringEffects.delete(fx.id);
      this.bump();
    }, 800);
  }

  /**
   * Apply a script run's non-resource effects: applyStatus/removeStatus and giveStatus.
   * (Resource changes are applied separately by applyMacroResourceChanges.)
   */
  private applyScriptExtras(exec: ScriptExecution): void {
    const s = exec.script;
    let effects = [...this.statusEffects];
    let changed = false;

    for (const op of s.statusOps) {
      if (op.op === 'remove') {
        // removeStatus(id) clears it; removeStatus(id, X) cleanses X stacks (or X turns of
        // duration when the effect does not stack).
        const cleansed = cleanseFromList(effects, e => e.statusEffectId === op.id, op.stacks);
        effects = cleansed.list;
        if (cleansed.changed) changed = true;
      } else {
        const def = this.resolveLibraryEffect(op.id);
        if (!def) continue;
        const incoming: TokenStatusEffect = {
          id: `fx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          statusEffectId: def.id, name: def.name, icon: def.icon, color: def.color,
          stacks: op.stacks ?? 1, duration: def.defaultDuration, isDebuff: def.isDebuff ?? false,
        };
        const res = applyStacking(effects, incoming, def.maxStacks || 1);
        effects = res.list;
        changed = changed || res.changed;
      }
    }

    // giveStatus(...) { …body… } → a per-instance status carrying its own script. The id comes
    // from the NAME so re-applying the same status stacks instead of piling up entries.
    for (const g of s.givenStatuses) {
      const id = `given_${g.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      const custom: StatusEffect = {
        id, name: g.name, description: g.description, script: g.script,
        icon: g.icon, isDebuff: g.isDebuff, maxStacks: GIVEN_STATUS_MAX_STACKS,
      };
      const incoming: TokenStatusEffect = {
        id: `fx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        statusEffectId: id, customEffect: custom, name: g.name, icon: g.icon,
        stacks: g.stacks, duration: g.duration, isDebuff: g.isDebuff,
      };
      const res = applyStacking(effects, incoming, GIVEN_STATUS_MAX_STACKS);
      effects = res.list;
      changed = changed || res.changed;
    }

    // effectActive modifiers and granted skills are derived on demand by TrueStatsService.
    if (changed) this.saveStatusEffects(effects);
  }

  private applyMacroResourceChanges(result: UnifiedMacroResult): void {
    const resourceMap: Record<string, FormulaType> = {
      health: FormulaType.LIFE, mana: FormulaType.MANA, energy: FormulaType.ENERGY,
    };

    if (this.character) {
      // Rebuild the statuses array (new reference) and persist like saveStatusEffects.
      let statuses = [...(this.character.statuses ?? [])];
      let changed = false;
      for (const change of result.resourceChanges) {
        const ft = resourceMap[change.resource];
        if (ft === undefined || !change.amount) continue;
        const idx = statuses.findIndex(s => s.formulaType === ft);
        if (idx < 0) continue;
        const max = this.trueStats.calculateResourceMax(this.character, ft);
        const newVal = this.trueStats.clampResourceCurrent(ft, (statuses[idx].statusCurrent || 0) + change.amount, max);
        statuses = statuses.map((s, i) => (i === idx ? { ...s, statusCurrent: newVal } : s));
        changed = true;
      }
      if (changed) {
        this.character.statuses = statuses;
        const charId = this.characterId;
        if (charId) {
          const patch = { path: 'statuses', value: statuses };
          this.sheetPatched.emit({ characterId: charId, patch });
          this.charSocket.sendPatch(charId, patch);
        }
        this.bump();
      }
      return;
    }

    // NPC token: adjust the token's current-resource fields.
    for (const change of result.resourceChanges) {
      const ft = resourceMap[change.resource];
      if (ft === FormulaType.LIFE) {
        this.tokenUpdate.emit({ currentHealth: (this.token?.currentHealth ?? 0) + change.amount });
      } else if (ft === FormulaType.MANA) {
        this.tokenUpdate.emit({ currentMana: Math.max(0, (this.token?.currentMana ?? 0) + change.amount) });
      } else if (ft === FormulaType.ENERGY) {
        this.tokenUpdate.emit({ currentEnergy: Math.max(0, (this.token?.currentEnergy ?? 0) + change.amount) });
      }
    }
  }

  // ── Picker ────────────────────────────────────────────────────────────────

  togglePicker(): void {
    this.showPicker = !this.showPicker;
    if (this.showPicker) {
      this.pickerSearch = '';
      if (this.libraryStore.allLibraries.length === 0) {
        this.libraryStore.loadAllLibraries();
      }
    }
    this.bump();
  }

  closePicker(): void {
    this.showPicker = false;
    this.bump();
  }

  get availableToAdd(): StatusEffect[] {
    const search = this.pickerSearch.toLowerCase().trim();
    const effects: StatusEffect[] = [];
    for (const lib of this.libraryStore.allLibraries) {
      for (const e of (lib as any).statusEffects ?? []) {
        if (!search || e.name.toLowerCase().includes(search)) {
          effects.push(e);
        }
      }
    }
    return effects;
  }

  applyEffect(effect: StatusEffect): void {
    if (!this.token) return;
    // Same effect + same duration stacks; a different duration becomes its own instance.
    const newFx: TokenStatusEffect = {
      id: `fx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      statusEffectId: effect.id,
      name: effect.name,
      icon: effect.icon,
      color: effect.color,
      stacks: 1,
      duration: effect.defaultDuration,
      isDebuff: effect.isDebuff,
    };
    const { list, changed } = applyStacking(this.statusEffects, newFx, effect.maxStacks || 1);
    if (changed) this.saveStatusEffects(list);
    this.closePicker();
  }

  // ── Context menu ──────────────────────────────────────────────────────────

  onRightClickStatusArea(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuFx = null;
    this.showContextMenu = true;
    this.expandedFxId = null;
    this.bump();
  }

  /** Right-click on a specific effect → menu with Bearbeiten + Auslösen. */
  onRightClickFx(fx: TokenStatusEffect, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuFx = fx;
    this.showContextMenu = true;
    this.expandedFxId = null;
    this.bump();
  }

  editFxFromContextMenu(): void {
    const fx = this.contextMenuFx;
    this.closeContextMenu();
    if (fx) this.editFx(fx);
  }

  executeFxFromContextMenu(event: MouseEvent): void {
    const fx = this.contextMenuFx;
    this.closeContextMenu();
    if (fx) this.executeSingleEffect(fx, event);
  }

  openPickerFromContextMenu(): void {
    this.closeContextMenu();
    this.togglePicker();
  }

  closeContextMenu(): void {
    if (!this.showContextMenu) return;
    this.showContextMenu = false;
    this.contextMenuFx = null;
    this.bump();
  }

  // ── Effect editor ─────────────────────────────────────────────────────────

  editFx(fx: TokenStatusEffect): void {
    const effect = this.getEffect(fx);
    if (!effect) return;
    this.editedStatusEffect = JSON.parse(JSON.stringify(effect));
    this.editingFx = fx;
    this.expandedFxId = null;
    lockBodyScroll(); // fullscreen editor: no background scrolling
    this.bump();
  }

  /** Save an edit as a LOCAL per-instance override (does not touch the library). */
  saveEditedFx(updated: StatusEffect): void {
    if (!this.editingFx) return;
    const effects = this.statusEffects.map(e =>
      e.id === this.editingFx!.id
        ? { ...e, customEffect: updated, name: updated.name, icon: updated.icon, color: updated.color, isDebuff: updated.isDebuff ?? false }
        : e
    );
    this.saveStatusEffects(effects);
    this.closeEditor();
  }

  /** GM: persist the edit to the library definition (affects everyone), then close. */
  async saveEditedFxGlobally(updated: StatusEffect): Promise<void> {
    const fx = this.editingFx;
    if (!fx?.statusEffectId) { this.saveEditedFx(updated); return; }
    const saved = await this.libraryStore.updateStatusEffectGlobally({ ...updated, id: fx.statusEffectId })
      .catch(() => false);
    if (!saved) {
      // Fall back to a local override if the library write didn't land.
      this.saveEditedFx(updated);
      return;
    }
    this.trueStats.bumpDerivedCache(); // library script changed → recompute derived stats/skills
    // Global edit means this instance should follow the library again → drop any local override.
    const effects = this.statusEffects.map(e =>
      e.id === fx.id ? { ...e, customEffect: undefined, name: updated.name, icon: updated.icon, color: updated.color, isDebuff: updated.isDebuff ?? false } : e
    );
    this.saveStatusEffects(effects);
    this.closeEditor();
  }

  cancelEditFx(): void {
    this.closeEditor();
  }

  private closeEditor(): void {
    if (this.editingFx) unlockBodyScroll();
    this.editingFx = null;
    this.editedStatusEffect = null;
    this.bump();
  }

  // ── Activation (abilities dock) ───────────────────────────────────────────

  isSkillActive(skill: SkillBlock): boolean {
    return this.activeSkillEntries.some(e =>
      (e.skillId && skill.skillId && e.skillId === skill.skillId) || e.skillName === skill.name
    );
  }

  isSpellActive(spell: SpellBlock): boolean {
    return this.castingSpells.some(e => e.spellId === spell.id);
  }

  /** Activating pays the skill's cost once; a per-round skill pays later rounds via „Zahlen". */
  activateSkill(skill: SkillBlock): void {
    if (!this.canAffordSkill(skill)) return;
    const cost = this.effectiveCost(skill);
    const entryId = `skill-${skill.skillId ?? skill.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: ActiveSkillEntry = {
      entryId,
      skillId: skill.skillId,
      skillName: skill.name,
      roundsActive: 0,
      counters: (skill.counters ?? []).map(c => ({ ...c })),
    };
    this._patchSkillEntries([...this.activeSkillEntries, entry]);
    if (cost?.amount) this.payCost(cost.type, cost.amount);
    this.charSocket.notifyLocalUpdate();
  }

  /**
   * Spells go through the cast window (cast level, Skalierung, Mana and Fokus are decided there), so
   * the dock only asks for it to open on this spell.
   */
  requestCast(spell: SpellBlock): void {
    if (!this.canAffordSpell(spell)) return;
    this.castRequest.emit(spell.id || spell.name);
  }

  // ── Resources & costs ─────────────────────────────────────────────────────

  private get learnedRunes(): RuneBlock[] {
    return (this.character?.runes ?? []).filter((r): r is RuneBlock => !!r);
  }

  /** Current Mana / Ausdauer / Leben; an NPC token without an override is at its maximum. */
  currentResource(kind: string): number {
    if (this.character) {
      const ft = kind === 'mana' ? FormulaType.MANA : kind === 'energy' ? FormulaType.ENERGY : FormulaType.LIFE;
      return this.character.statuses?.find(s => s.formulaType === ft)?.statusCurrent ?? 0;
    }
    if (kind === 'mana') return this.token?.currentMana ?? this.npc?.maxMana ?? 0;
    if (kind === 'energy') return this.token?.currentEnergy ?? this.npc?.maxEnergy ?? 0;
    return this.token?.currentHealth ?? this.npc?.maxHealth ?? 0;
  }

  get fokusMax(): number {
    if (this.character) return this.trueStats.calculateFokusMax(this.character);
    if (!this.npc) return 0;
    // Same rule as players, from the NPC's Intelligenz (the panel builds its cast sheet the same way).
    const sheet = createEmptySheet();
    const intelligence = new StatBlock('Intelligenz', this.npc.intelligence);
    intelligence.current = this.npc.intelligence;
    sheet.intelligence = intelligence;
    sheet.fokusBonus = 0;
    sheet.fokusMultiplier = 1;
    return this.trueStats.calculateFokusMax(sheet);
  }

  /** Fokus not bound by running spells. */
  get fokusAvailable(): number {
    return Math.max(0, this.fokusMax - committedFokus(this.availableSpells, this.castingSpells, this.learnedRunes));
  }

  canAffordSkill(skill: SkillBlock): boolean {
    const cost = this.effectiveCost(skill);
    if (!cost?.amount || !['mana', 'energy', 'life'].includes(cost.type)) return true;
    return this.currentResource(cost.type) >= cost.amount;
  }

  /** Castable right now at the lowest cast level? Pass `fokusFree` when checking many spells at once. */
  canAffordSpell(spell: SpellBlock, fokusFree = this.fokusAvailable): boolean {
    return this.currentResource('mana') >= spellManaCost(spell, this.learnedRunes)
      && fokusFree >= spellFokusCost(spell, this.learnedRunes);
  }

  spellCostSummary(spell: SpellBlock): string {
    const mana = spellManaCost(spell, this.learnedRunes);
    const fokus = spellFokusCost(spell, this.learnedRunes);
    const parts: string[] = [];
    if (mana > 0) parts.push(`${mana} MP`);
    if (fokus > 0) parts.push(`${fokus} Fokus`);
    return parts.join(' · ');
  }

  /** Spend Mana / Ausdauer / Leben from the character or the NPC token. */
  private payCost(type: string, amount: number): void {
    if (!amount) return;
    if (this.character) {
      const formulaMap: Record<string, FormulaType> = {
        mana: FormulaType.MANA, energy: FormulaType.ENERGY, life: FormulaType.LIFE,
      };
      const targetType = formulaMap[type];
      if (!targetType) return;
      const statuses = [...(this.character.statuses || [])];
      const idx = statuses.findIndex(s => s.formulaType === targetType);
      if (idx < 0) return;
      const newVal = Math.max(0, (statuses[idx].statusCurrent || 0) - amount);
      statuses[idx] = { ...statuses[idx], statusCurrent: newVal };
      this.character.statuses = statuses;
      const charId = this.characterId;
      if (charId) {
        const patch = { path: 'statuses', value: statuses };
        this.sheetPatched.emit({ characterId: charId, patch });
        this.charSocket.sendPatch(charId, patch);
      }
    } else if (type === 'mana') {
      this.tokenUpdate.emit({ currentMana: Math.max(0, this.currentResource('mana') - amount) });
    } else if (type === 'energy') {
      this.tokenUpdate.emit({ currentEnergy: Math.max(0, this.currentResource('energy') - amount) });
    } else if (type === 'life') {
      this.tokenUpdate.emit({ currentHealth: this.currentResource('life') - amount });
    }
    this.bump();
  }

  // ── Skill actions ─────────────────────────────────────────────────────────

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
    this.payCost(cost.type, cost.amount);
  }

  private _patchSkillEntries(updated: ActiveSkillEntry[]): void {
    if (this.character) {
      this.character.activeSkillEntries = updated;
      const charId = this.characterId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'activeSkillEntries', value: updated });
    } else {
      if (this.token) this.token.activeSkillEntries = updated;
      this.tokenUpdate.emit({ activeSkillEntries: updated });
    }
    this.bump();
  }

  adjustSkillRounds(entry: ActiveSkillEntry, delta: number): void {
    const updated = this.activeSkillEntries.map(e =>
      e.entryId === entry.entryId ? { ...e, roundsActive: Math.max(0, e.roundsActive + delta) } : e
    );
    this._patchSkillEntries(updated);
  }

  setSkillRounds(entry: ActiveSkillEntry, value: number): void {
    const updated = this.activeSkillEntries.map(e =>
      e.entryId === entry.entryId ? { ...e, roundsActive: Math.max(0, +value || 0) } : e
    );
    this._patchSkillEntries(updated);
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

  decrementRound(entry: CastingSpellEntry): void {
    entry.roundsActive = Math.max(0, (entry.roundsActive ?? 0) - 1);
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
    this.bump();
  }

  private _patchCasting(updated: CastingSpellEntry[]): void {
    if (this.character) {
      this.character.castingSpells = updated;
      const charId = this.characterId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'castingSpells', value: updated });
    } else {
      if (this.token) this.token.castingSpells = updated;
      this.tokenUpdate.emit({ castingSpells: updated });
    }
    this.bump();
  }
}
