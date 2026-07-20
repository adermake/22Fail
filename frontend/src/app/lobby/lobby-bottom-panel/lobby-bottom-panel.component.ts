import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter,
  inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Token, TokenStatusEffect } from '../../model/lobby.model';
import { CharacterSheet, createEmptySheet } from '../../model/character-sheet-model';
import { NpcStatblock } from '../../model/npc-statblock.model';
import { SpellBlock, CastingSpellEntry, ActiveSkillEntry } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { FormulaType } from '../../model/formula-type.enum';
import { SKILL_DEFINITIONS } from '../../data/skill-definitions';
import { TALENT_DEFINITIONS } from '../../data/talent-definitions';
import { SkillDefinition } from '../../model/skill-definition.model';
import { CharacterSocketService } from '../../services/character-socket.service';
import { DerivedGrantedSkill, TrueStatsService } from '../../services/true-stats.service';
import { ActiveStatusEffect, StatusEffect } from '../../model/status-effect.model';
import { ActionMacro } from '../../model/action-macro.model';
import { LibraryStoreService } from '../../services/library-store.service';
import { UnifiedMacroExecutorService, UnifiedMacroResult, ScriptExecution } from '../../services/unified-macro-executor.service';
import { StatusEffectEditorComponent } from '../../shared/status-effect-editor/status-effect-editor.component';

@Component({
  selector: 'app-lobby-bottom-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusEffectEditorComponent],
  templateUrl: './lobby-bottom-panel.component.html',
  styleUrl: './lobby-bottom-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyBottomPanelComponent implements OnChanges, OnInit, OnDestroy {
  @Input() token: Token | null = null;
  @Input() character: CharacterSheet | null = null;
  @Input() npc: NpcStatblock | null = null;
  @Input() isGM = false;
  @Input() canViewStats = true;
  @Input() statusBarBlinking = false;
  @Output() dismissStatusReminder = new EventEmitter<void>();
  @Output() tokenUpdate = new EventEmitter<Partial<Omit<Token, 'id'>>>();
  @Output() sheetPatched = new EventEmitter<{ characterId: string; patch: any }>();

  private cdr = inject(ChangeDetectorRef);
  private charSocket = inject(CharacterSocketService);
  private trueStats = inject(TrueStatsService);
  private destroyRef = inject(DestroyRef);
  private libraryStore = inject(LibraryStoreService);
  private macroExecutor = inject(UnifiedMacroExecutorService);

  activeTab: 'status' | 'aktiv' = 'aktiv';
  collapsed = false;

  // ── Status effect state ───────────────────────────────────────────────────
  private libSub?: Subscription;
  private popupTimeout?: ReturnType<typeof setTimeout>;
  resolvedEffects = new Map<string, StatusEffect>();

  expandedFx: TokenStatusEffect | null = null;
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

  /** Running per-resource totals for the whole "Alle Ausführen" run. */
  chainResourceTotals: { resource: string; displayName: string; total: number }[] = [];
  /** Full itemised log so a summed total can be expanded into its breakdown. */
  private chainResourceLog: { resource: string; displayName: string; amount: number; source: string }[] = [];
  /** Breakdown popup shown when a summarised number is clicked. */
  breakdownPopup: { title: string; color: string; rows: { label: string; value: string; positive: boolean }[] } | null = null;
  /**
   * Anchors the floating results popup above the effect card that triggered it.
   * `cardX` is the card centre (connector target); `panelX` is clamped to keep the popup
   * on screen (so the leftmost effect's popup isn't cut off).
   */
  resultAnchor: { cardX: number; panelX: number; bottom: number; color: string } | null = null;
  triggeringEffects = new Set<string>();
  expiringEffects = new Set<string>();
  lastRollResults = new Map<string, UnifiedMacroResult>();

  ngOnInit(): void {
    // Re-render immediately when the character panel mutates data locally (before server echo)
    this.charSocket.localUpdate$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cdr.markForCheck();
    });
    // Subscribe to library changes and resolve effect definitions when data arrives
    this.libSub = this.libraryStore.allLibraries$.subscribe(() => {
      this.resolveEffects();
      this.cdr.markForCheck();
    });
    // Eagerly load library if not yet loaded
    if (this.libraryStore.allLibraries.length === 0) {
      this.libraryStore.loadAllLibraries();
    } else {
      this.resolveEffects();
    }
  }

  ngOnChanges(_: SimpleChanges): void {
    // Sync expandedFx reference when token/character updates from server
    if (this.expandedFx) {
      const synced = this.statusEffects.find(e => e.id === this.expandedFx!.id);
      this.expandedFx = synced ?? null;
    }
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.libSub?.unsubscribe();
    if (this.popupTimeout) clearTimeout(this.popupTimeout);
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
      const derived = this.trueStats.getDerivedSkills(this.character).map(g => this.derivedToSkillBlock(g));
      return [...own, ...derived];
    }
    return (this.npc?.customSkills ?? []).filter(s => s.type === 'active');
  }

  private derivedToSkillBlock(g: DerivedGrantedSkill): SkillBlock {
    return {
      name: g.name,
      class: `Effekt: ${g.source}`,
      description: g.description || 'Effektgebundene Fähigkeit',
      type: 'active',
      enlightened: false,
      script: g.script,
      derived: true,
      actionType: g.actionType,
      cost: g.manaCost ? { type: 'mana', amount: g.manaCost }
        : g.energyCost ? { type: 'energy', amount: g.energyCost }
        : g.lifeCost ? { type: 'life', amount: g.lifeCost }
        : undefined,
    } as SkillBlock;
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

  effectiveActionType(skill: SkillBlock): string | undefined {
    return skill.actionType ?? this.getSkillDefinition(skill)?.actionType;
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

  private saveStatusEffects(effects: TokenStatusEffect[]): void {
    const charId = this.characterId;
    if (this.character && charId) {
      const activeEffects = effects.map(fx => this.tokenToActiveEffect(fx));
      this.character.activeStatusEffects = activeEffects;
      const patch = { path: 'activeStatusEffects', value: activeEffects };
      this.sheetPatched.emit({ characterId: charId, patch });
      this.charSocket.sendPatch(charId, patch);
      this.cdr.markForCheck();
    } else {
      this.tokenUpdate.emit({ activeStatusEffects: effects });
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
    // not churn — otherwise expandedFx loses its reference and the panel closes on each click.
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

  getEffectIcon(fx: TokenStatusEffect): string {
    return fx.icon || this.getEffect(fx)?.icon || (fx.isDebuff ? '💀' : '⭐');
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
    return LobbyBottomPanelComponent.STAT_MOD_LABELS[stat] ?? stat.slice(0, 3).toUpperCase();
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

  trackByFx(_: number, fx: TokenStatusEffect): string {
    return fx.id;
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
    this.expandedFx = this.expandedFx?.id === fx.id ? null : fx;
    this.cdr.markForCheck();
  }

  closeExpandedView(): void {
    this.expandedFx = null;
    this.cdr.markForCheck();
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
    if (this.expandedFx?.id === fx.id) {
      this.expandedFx = { ...this.expandedFx, duration: newDuration };
    }
    this.cdr.markForCheck();
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
    if (this.expandedFx?.id === fx.id) {
      this.expandedFx = { ...this.expandedFx, stacks: newStacks };
    }
    this.cdr.markForCheck();
  }

  removeStatusEffect(id: string): void {
    if (!this.token) return;
    const effects = this.statusEffects.filter(e => e.id !== id);
    if (this.expandedFx?.id === id) this.expandedFx = null;
    this.saveStatusEffects(effects);
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
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
      this.cdr.markForCheck();
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
    this.expandedFx = null;
    this.chainResourceTotals = [];
    this.chainResourceLog = [];
    this.breakdownPopup = null;
    this.cdr.markForCheck();
    this.executeCurrentChainStep();
  }

  executeNextInChain(): void {
    if (!this.chainStepDone) return;
    if (this.chainIndex >= this.chainEffects.length - 1) {
      this.finalizeChain();
      return;
    }
    this.chainIndex++;
    this.chainResult = null;
    this.chainStepDone = false;
    this.cdr.markForCheck();
    this.executeCurrentChainStep();
  }

  private executeCurrentChainStep(): void {
    const fx = this.chainEffects[this.chainIndex];
    if (!fx) return;
    this.triggeringEffects.add(fx.id);
    this.cdr.markForCheck();
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
      this.cdr.markForCheck();
    }, 800);
  }

  private finalizeChain(): void {
    this.resultAnchor = null;
    const expiring = this.chainEffects.filter(e => e.duration !== undefined && e.duration !== null && e.duration === 0);
    for (const expired of expiring) this.expiringEffects.add(expired.id);
    this.cdr.markForCheck();
    setTimeout(() => {
      if (!this.token) return;
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
      this.cdr.markForCheck();
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

  /** Per-name roll summary of a single step (e.g. "Blutung ×4 = 6"). */
  summarizeStepRolls(result: UnifiedMacroResult | null): { name: string; total: number; count: number; color: string }[] {
    if (!result) return [];
    const map = new Map<string, { name: string; total: number; count: number; color: string }>();
    for (const r of result.rolls) {
      const e = map.get(r.name);
      if (e) { e.total += r.total; e.count++; }
      else map.set(r.name, { name: r.name, total: r.total, count: 1, color: r.color });
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
    this.cdr.markForCheck();
  }

  /** Open the breakdown popup for a step's rolls, itemised per die. */
  openRollBreakdown(result: UnifiedMacroResult | null, name: string, color: string): void {
    if (!result) return;
    const rows = result.rolls
      .filter(r => r.name === name)
      .map(r => ({
        label: r.rolls.length ? r.rolls.join(' + ') : r.formula,
        value: `= ${r.total}`,
        positive: false,
      }));
    this.breakdownPopup = { title: name, color, rows };
    this.cdr.markForCheck();
  }

  /** Position the floating results panel above the currently-triggering effect card. */
  private updateResultAnchor(): void {
    const fx = this.chainEffects[this.chainIndex];
    if (!fx) { this.resultAnchor = null; return; }
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`.lbp-sfx-card[data-fx-id="${fx.id}"]`);
      if (!el) { this.resultAnchor = null; this.cdr.markForCheck(); return; }
      const r = el.getBoundingClientRect();
      const cardX = Math.round(r.left + r.width / 2);
      const halfW = 170; // half of the 340px popup
      const panelX = Math.round(Math.min(Math.max(cardX, halfW + 8), window.innerWidth - halfW - 8));
      this.resultAnchor = {
        cardX,
        panelX,
        bottom: Math.round(window.innerHeight - r.top + 12), // popup sits 12px above the card
        color: this.getEffectColor(fx),
      };
      this.cdr.markForCheck();
    });
  }

  /** Breakdown for one resource of THIS effect only (not the whole run). */
  openStepResourceBreakdown(result: UnifiedMacroResult, resource: string, displayName: string): void {
    const rows = result.resourceChanges
      .filter(rc => rc.resource === resource && rc.amount !== 0)
      .map(rc => ({ label: rc.displayName, value: `${rc.amount > 0 ? '+' : ''}${rc.amount}`, positive: rc.amount > 0 }));
    this.breakdownPopup = { title: displayName, color: result.actionColor, rows };
    this.cdr.markForCheck();
  }

  /** Open the roll breakdown for a step: every die, per roll (rolls are hidden by default). */
  openAllRollsBreakdown(result: UnifiedMacroResult): void {
    const rows = result.rolls.map(r => ({
      label: r.rolls.length ? `${r.name} [${r.rolls.join(', ')}]` : r.name,
      value: `= ${r.total}`,
      positive: false,
    }));
    this.breakdownPopup = { title: 'Würfel-Details', color: '#f59e0b', rows };
    this.cdr.markForCheck();
  }

  closeBreakdown(): void {
    this.breakdownPopup = null;
    this.cdr.markForCheck();
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
  private runEffectResults(effect: StatusEffect, sheet: CharacterSheet, stacks: number, duration = 0): UnifiedMacroResult[] {
    if (effect.script && effect.script.trim()) {
      const exec = this.macroExecutor.executeScript(effect.script, sheet, {
        inCombat: true, stacks, turn: 0, duration, effectStrength: effect.strength ?? 0,
        name: effect.name, icon: effect.icon, color: effect.color,
      });
      this.applyScriptExtras(exec);
      return [exec.unified];
    }
    const results: UnifiedMacroResult[] = [];
    const macros = this.getAllMacros(effect);
    for (let s = 0; s < stacks; s++) {
      for (const m of macros) results.push(this.macroExecutor.executeActionMacro(m, sheet));
    }
    return results;
  }

  /**
   * Apply a script run's non-resource effects: applyStatus/removeStatus, untilNextTurn
   * temporary modifiers, and granted skills. (Resource changes are applied separately by
   * applyMacroResourceChanges.)
   */
  private applyScriptExtras(exec: ScriptExecution): void {
    const s = exec.script;
    let effects = [...this.statusEffects];
    let changed = false;

    // applyStatus(id) / removeStatus(id)
    for (const op of s.statusOps) {
      if (op.op === 'remove') {
        const before = effects.length;
        effects = effects.filter(e => e.statusEffectId !== op.id);
        if (effects.length !== before) changed = true;
      } else {
        const def = this.resolveLibraryEffect(op.id);
        if (!def) continue;
        const existing = effects.find(e => e.statusEffectId === op.id);
        if (existing) {
          existing.stacks = (existing.stacks || 1) + (op.stacks ?? 1);
        } else {
          effects.push({
            id: `fx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            statusEffectId: def.id, name: def.name, icon: def.icon, color: def.color,
            stacks: op.stacks ?? 1, duration: def.defaultDuration, isDebuff: def.isDebuff ?? false,
          });
        }
        changed = true;
      }
    }

    // NOTE: effectActive stat modifiers and granted skills are NOT applied here. They are
    // continuous, effect-bound contributions derived on demand by TrueStatsService from the
    // active effects (never mutating real data, and gone the moment the effect is removed),
    // so a trigger run leaves result.modifiers / result.grantedSkills empty by design.
    if (changed) this.saveStatusEffects(effects);
  }

  private applyMacroResourceChanges(result: UnifiedMacroResult): void {
    const resourceMap: Record<string, FormulaType> = {
      health: FormulaType.LIFE, mana: FormulaType.MANA, energy: FormulaType.ENERGY,
    };

    if (this.character) {
      // Rebuild the statuses array (new reference) so OnPush children re-render, and
      // persist the SAME way as saveStatusEffects (sheetPatched + socket) — the previous
      // in-place mutation + socket-only patch didn't reach the lobby's character copy.
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
        this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  closePicker(): void {
    this.showPicker = false;
    this.cdr.markForCheck();
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
    const currentEffects = this.statusEffects;
    const existing = currentEffects.find(e => e.statusEffectId === effect.id);
    if (existing) {
      this.changeStacks(existing, 1);
    } else {
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
      const effects = [...currentEffects, newFx];
      this.saveStatusEffects(effects);
    }
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
    this.expandedFx = null;
    this.cdr.markForCheck();
  }

  /** Right-click on a specific effect card → menu with Bearbeiten + Auslösen. */
  onRightClickFx(fx: TokenStatusEffect, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuFx = fx;
    this.showContextMenu = true;
    this.expandedFx = null;
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  // ── Effect editor ─────────────────────────────────────────────────────────

  editFx(fx: TokenStatusEffect): void {
    const effect = this.getEffect(fx);
    if (!effect) return;
    this.editedStatusEffect = JSON.parse(JSON.stringify(effect));
    this.editingFx = fx;
    this.expandedFx = null;
    this.cdr.markForCheck();
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
    this.editingFx = null;
    this.editedStatusEffect = null;
    this.cdr.markForCheck();
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
    this.editingFx = null;
    this.editedStatusEffect = null;
    this.cdr.markForCheck();
  }

  cancelEditFx(): void {
    this.editingFx = null;
    this.editedStatusEffect = null;
    this.cdr.markForCheck();
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
        this.tokenUpdate.emit({ currentHealth: cur - cost.amount });
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
