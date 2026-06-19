import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EventEmitter, HostListener, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SpellBlock, CastingSpellEntry, generateSpellId } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { FormulaType } from '../../model/formula-type.enum';
import { JsonPatch } from '../../model/json-patch.model';
import { KeywordEnhancer } from '../keyword-enhancer';
import { ImageService } from '../../services/image.service';
import { WorldSocketService, DiceRollEvent } from '../../services/world-socket.service';
import { TrueStatsService } from '../../services/true-stats.service';
import { calculateSpellCost } from '../../shared/spell-node-editor/spell-cost-calculator';
import { RuneBlock } from '../../model/rune-block.model';

interface CastCostPreview {
  manaCost: number;
  fokusCost: number;
  manaAfter: number;
  fokusAfter: number;
  manaAfterPct: number;
  manaCostPct: number;
  fokusAfterPct: number;
  fokusCostPct: number;
}

const EMPTY_CAST_PREVIEW: CastCostPreview = {
  manaCost: 0,
  fokusCost: 0,
  manaAfter: 0,
  fokusAfter: 0,
  manaAfterPct: 0,
  manaCostPct: 0,
  fokusAfterPct: 0,
  fokusCostPct: 0,
};
import { SKILL_DEFINITIONS } from '../../data/skill-definitions';
import { SkillDefinition } from '../../model/skill-definition.model';

interface FloatingRune {
  id: number;
  symbol: string;
  x: number;   // % from left
  y: number;   // % from top
  size: number; // px
  opacity: number;
  speed: number; // animation duration s
  delay: number;
  color: string;
}

interface PortalRune {
  id: number;
  drawing: string | null; // resolved URL (via ImageService) or null
  symbol: string;         // fallback unicode glyph
  color: string;
  x: number;    // % from left
  y: number;    // % from top
  size: number; // px
  speed: number;
  delay: number;
  opacity: number;
}

/** Positions distributed around screen edges, avoiding the central card area */
const PORTAL_POSITIONS = [
  { x: 4,  y: 8  }, { x: 86, y: 6  }, { x: 4,  y: 50 }, { x: 90, y: 52 },
  { x: 12, y: 84 }, { x: 82, y: 86 }, { x: 42, y: 3  }, { x: 52, y: 91 },
  { x: 8,  y: 28 }, { x: 86, y: 30 }, { x: 18, y: 72 }, { x: 76, y: 75 },
  { x: 38, y: 5  }, { x: 60, y: 7  }, { x: 6,  y: 68 }, { x: 88, y: 70 },
];

const RUNE_SYMBOLS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];

@Component({
  selector: 'app-spellcast-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spellcast-window.component.html',
  styleUrl: './spellcast-window.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellcastWindowComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() defaultTab: 'spells' | 'skills' = 'spells';
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() tabChange = new EventEmitter<'spells' | 'skills'>();
  @Output() close = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);
  private _sanitizer = inject(DomSanitizer);
  private _imageService = inject(ImageService);
  private _worldSocket = inject(WorldSocketService);
  private _trueStats = inject(TrueStatsService);
  protected readonly Math = Math;

  floatingRunes: FloatingRune[] = [];
  private runeIdCounter = 0;
  private _portalRunes: PortalRune[] = [];
  get portalRunes(): PortalRune[] { return this._portalRunes; }

  // ── Left panel tab ────────────────────────────────────────────────────────
  leftTab: 'spells' | 'skills' = 'spells';
  skillSearchText = '';

  // ── Pending cast state ────────────────────────────────────────────────────
  pendingCastSpell: SpellBlock | null = null;
  pendingCastLevel = 0;
  skalierung = 1;
  castPreview: CastCostPreview = { ...EMPTY_CAST_PREVIEW };

  // ── Cast-bonus (saved on sheet) ───────────────────────────────────────────

  get castBonus(): number {
    return this.sheet.spellCastBonus ?? 0;
  }

  setCastBonus(v: number): void {
    this.sheet.spellCastBonus = v;
    this.patch.emit({ path: 'spellCastBonus', value: v });
    this.cdr.markForCheck();
  }

  // ── Data accessors ────────────────────────────────────────────────────────

  get availableSpells(): SpellBlock[] {
    return this.sheet.spells || [];
  }

  get castingSpells(): CastingSpellEntry[] {
    return this.sheet.castingSpells || [];
  }

  get manaCurrent(): number {
    return this.sheet.statuses?.find(s => s.formulaType === FormulaType.MANA)?.statusCurrent ?? 0;
  }

  get manaMax(): number {
    const s = this.sheet.statuses?.find(s => s.formulaType === FormulaType.MANA);
    if (!s) return 100;
    return this._trueStats.calculateResourceMax(this.sheet, FormulaType.MANA);
  }

  get manaPercent(): number {
    const max = this.manaMax;
    return max ? Math.min(100, Math.round((this.manaCurrent / max) * 100)) : 0;
  }

  get lebenCurrent(): number {
    return this.sheet.statuses?.find(s => s.formulaType === FormulaType.LIFE)?.statusCurrent ?? 0;
  }

  get lebenMax(): number {
    const s = this.sheet.statuses?.find(s => s.formulaType === FormulaType.LIFE);
    if (!s) return 100;
    return this._trueStats.calculateResourceMax(this.sheet, FormulaType.LIFE);
  }

  get lebenPercent(): number {
    const max = this.lebenMax;
    return max ? Math.min(100, Math.round((this.lebenCurrent / max) * 100)) : 0;
  }

  get ausdauerCurrent(): number {
    return this.sheet.statuses?.find(s => s.formulaType === FormulaType.ENERGY)?.statusCurrent ?? 0;
  }

  get ausdauerMax(): number {
    const s = this.sheet.statuses?.find(s => s.formulaType === FormulaType.ENERGY);
    if (!s) return 100;
    return this._trueStats.calculateResourceMax(this.sheet, FormulaType.ENERGY);
  }

  get ausdauerPercent(): number {
    const max = this.ausdauerMax;
    return max ? Math.min(100, Math.round((this.ausdauerCurrent / max) * 100)) : 0;
  }

  get fokusMax(): number {
    const intelligence = this.sheet.intelligence?.current || 10;
    const base = Math.floor(intelligence / 2) + 5;
    return Math.floor((base + (this.sheet.fokusBonus || 0)) * (this.sheet.fokusMultiplier || 1));
  }

  get fokusUsed(): number {
    return this.castingSpells.reduce((sum, entry) => {
      const spell = this.availableSpells.find(s => s.id === entry.spellId);
      if (!spell) return sum;
      return sum + this.computeFokusCost(spell, entry.castLevel || 0, entry.skalierung ?? 1);
    }, 0);
  }

  get fokusPercent(): number {
    const max = this.fokusMax;
    return max ? Math.min(100, Math.round((this.fokusUsed / max) * 100)) : 0;
  }

  isActivelyCasting(spell: SpellBlock): boolean {
    return this.castingSpells.some(e => e.spellId === spell.id);
  }

  getActiveCast(spell: SpellBlock): CastingSpellEntry | undefined {
    return this.castingSpells.find(e => e.spellId === spell.id);
  }

  getSpell(spellId: string): SpellBlock | undefined {
    return this.availableSpells.find(s => s.id === spellId);
  }

  spellColor(spell: SpellBlock): string {
    return spell.strokeColor || '#8b5cf6';
  }

  costLabel(spell: SpellBlock): string {
    const parts: string[] = [];
    if (spell.costMana)  parts.push(`${spell.costMana}M`);
    if (spell.costFokus) parts.push(`${spell.costFokus}F`);
    return parts.join(' ');
  }

  perTurnLabel(spell: SpellBlock): string {
    const parts: string[] = [];
    if (spell.perTurnMana)  parts.push(`${spell.perTurnMana}M`);
    if (spell.perTurnFokus) parts.push(`${spell.perTurnFokus}F`);
    return parts.length ? parts.join(' ') + '/Rd' : '';
  }

  reductionLabel(castLevel: number): string {
    const pct = Math.min(90, Math.floor((castLevel || 0) / 10) * 10);
    return pct > 0 ? `-${pct}%` : '';
  }

  // ── Spell stat helpers ────────────────────────────────────────────────────

  spellStatReqs(spell: SpellBlock): { key: string; label: string; value: number }[] {
    const req = spell.statRequirements;
    if (!req) return [];
    const map = [
      { key: 'strength',     label: 'STR' },
      { key: 'dexterity',    label: 'GES' },
      { key: 'speed',        label: 'SPD' },
      { key: 'intelligence', label: 'INT' },
      { key: 'constitution', label: 'KON' },
      { key: 'chill',        label: 'WIL' },
    ];
    return map
      .filter(m => (req as Record<string, number>)[m.key] > 0)
      .map(m => ({ key: m.key, label: m.label, value: (req as Record<string, number>)[m.key] }));
  }

  spellMeetsStat(key: string, value: number): boolean {
    const stat = (this.sheet as any)[key];
    const current = stat?.current ?? 0;
    return current >= value;
  }

  castLevelMeetsReq(key: string, value: number): boolean {
    const stat = (this.sheet as any)[key];
    const current = stat?.current ?? 0;
    // Each 10 cast levels reduces the effective stat requirement by 1
    return current >= this.castLevelReducedReq(value);
  }

  /** Effective stat requirement after cast-level reduction */
  castLevelReducedReq(value: number): number {
    return Math.max(0, value - Math.floor(this.pendingCastLevel / 10));
  }

  castLevelForReq(key: string, value: number): number {
    const stat = (this.sheet as any)[key];
    const current = stat?.current ?? 0;
    if (current >= value) return 0;
    return Math.max(0, (value - current) * 10);
  }

  get castLevelMarkers(): { key: string; label: string; level: number }[] {
    if (!this.pendingCastSpell?.statRequirements) return [];
    return this.spellStatReqs(this.pendingCastSpell)
      .filter(req => !this.spellMeetsStat(req.key, req.value))
      .map(req => ({ key: req.key, label: req.label, level: this.castLevelForReq(req.key, req.value) }))
      .filter(m => m.level <= 100);
  }

  // ── Resource impact computations ──────────────────────────────────────────

  get fokusAvailable(): number {
    return Math.max(0, this.fokusMax - this.fokusUsed);
  }

  get fokusAvailPercent(): number {
    return this.fokusMax > 0 ? Math.min(100, Math.round((this.fokusAvailable / this.fokusMax) * 100)) : 0;
  }

  private castLevelReduction(castLevel: number): number {
    return Math.min(0.9, Math.floor(castLevel / 10) * 0.1);
  }

  private learnedRunes(): RuneBlock[] {
    return (this.sheet.runes || []).filter((r): r is RuneBlock => r !== null);
  }

  /** Resolve stored or graph-derived base costs for a spell */
  private spellBaseCosts(spell: SpellBlock): { mana: number; fokus: number } {
    let mana = spell.costMana ?? 0;
    let fokus = spell.perTurnFokus ?? spell.costFokus ?? 0;
    if ((mana <= 0 || fokus <= 0) && spell.graph) {
      const est = calculateSpellCost(spell.graph, this.learnedRunes());
      if (mana <= 0) mana = est.mana;
      if (fokus <= 0) fokus = est.fokus;
    }
    return { mana, fokus };
  }

  computeManaCost(spell: SpellBlock, castLevel: number, skalierung: number): number {
    const base = this.spellBaseCosts(spell).mana;
    const factor = (1 - this.castLevelReduction(castLevel)) * skalierung;
    return Math.round(base * factor * 100) / 100;
  }

  computeFokusCost(spell: SpellBlock, castLevel: number, skalierung: number): number {
    const base = this.spellBaseCosts(spell).fokus;
    const factor = (1 - this.castLevelReduction(castLevel)) * skalierung;
    return Math.round(base * factor * 100) / 100;
  }

  private recalcCastPreview(): void {
    const spell = this.pendingCastSpell;
    if (!spell) {
      this.castPreview = { ...EMPTY_CAST_PREVIEW };
      return;
    }

    const manaCost = this.computeManaCost(spell, this.pendingCastLevel, this.skalierung);
    const fokusCost = this.computeFokusCost(spell, this.pendingCastLevel, this.skalierung);
    const manaAfter = this.manaCurrent - manaCost;
    const fokusAfter = this.fokusAvailable - fokusCost;

    this.castPreview = {
      manaCost,
      fokusCost,
      manaAfter,
      fokusAfter,
      manaAfterPct: this.manaMax > 0 ? Math.round((Math.max(0, manaAfter) / this.manaMax) * 100) : 0,
      manaCostPct: this.manaMax > 0 ? Math.min(100, Math.round((manaCost / this.manaMax) * 100)) : 0,
      fokusAfterPct: this.fokusMax > 0 ? Math.round((Math.max(0, fokusAfter) / this.fokusMax) * 100) : 0,
      fokusCostPct: this.fokusMax > 0 ? Math.min(100, Math.round((fokusCost / this.fokusMax) * 100)) : 0,
    };
  }

  get canCast(): boolean {
    if (!this.pendingCastSpell) return false;
    const manaOk = this.castPreview.manaAfter >= 0;
    const fokusOk = this.castPreview.fokusAfter >= 0;
    const statsOk = this.spellStatReqs(this.pendingCastSpell).every(r => this.castLevelMeetsReq(r.key, r.value));
    return manaOk && fokusOk && statsOk;
  }

  get skalerungStars(): number[] {
    return Array.from({ length: Math.min(9, Math.floor(this.skalierung - 1)) });
  }

  // ── Cast confirmation popup ───────────────────────────────────────────────

  get showCastConfirm(): boolean { return this.pendingCastSpell !== null; }

  /** Explicit handlers so OnPush re-evaluates all derived template expressions */
  onCastLevelChange(val: number): void {
    this.pendingCastLevel = Math.max(0, +val || 0);
    this.recalcCastPreview();
    this.cdr.markForCheck();
  }

  onSkalierungChange(val: number): void {
    this.skalierung = Math.max(0.1, +val || 1);
    this.recalcCastPreview();
    this.cdr.markForCheck();
  }

  requestCast(spell: SpellBlock): void {
    // No restriction — same spell can be cast multiple times simultaneously
    this.pendingCastSpell = spell;
    this.pendingCastLevel = 0;
    this.skalierung = 1;
    this.recalcCastPreview();
    this._computePortalRunes(spell);
    this.cdr.markForCheck();
  }

  cancelCast(): void {
    this.pendingCastSpell = null;
    this.castPreview = { ...EMPTY_CAST_PREVIEW };
    this._portalRunes = [];
    this.cdr.markForCheck();
  }

  confirmCast(): void {
    const spell = this.pendingCastSpell;
    if (!spell || !this.canCast) return;
    const sk = this.skalierung;
    const cl = this.pendingCastLevel;
    this.pendingCastSpell = null;
    this.castPreview = { ...EMPTY_CAST_PREVIEW };
    this._portalRunes = [];
    this.castSpell(spell, cl, sk);
    this.cdr.markForCheck();
  }

  enhancedSpellDesc(spell: SpellBlock): SafeHtml {
    const enhanced = KeywordEnhancer.enhance(spell.description || '');
    return this._sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  private _computePortalRunes(spell: SpellBlock): void {
    const runeByName = new Map(
      (this.sheet.runes || []).filter(r => r !== null).map(r => [r!.name, r!])
    );
    const nodes = spell.graph?.nodes || [];
    const positions = PORTAL_POSITIONS;
    // Use at least 8 rune glyphs, up to positions.length
    const useCount = Math.min(positions.length, Math.max(nodes.length > 0 ? nodes.length : 0, 8));
    const speeds  = [12, 9, 14, 11, 8, 13, 10, 15, 12, 9, 11, 14, 8, 13, 10, 12];
    const delays  = [0, -4, -8, -2, -6, -10, -3, -7, -1, -5, -9, -2, -6, -4, -8, -3];
    const sizes   = [52, 38, 56, 42, 46, 40, 58, 44, 48, 36, 52, 40, 46, 42, 50, 38];
    const opacities = [0.6, 0.5, 0.65, 0.55, 0.45, 0.6, 0.5, 0.55, 0.65, 0.45, 0.55, 0.6, 0.5, 0.65, 0.55, 0.45];
    this._portalRunes = [];
    for (let i = 0; i < useCount; i++) {
      const nodeIdx = nodes.length > 0 ? (i % nodes.length) : -1;
      const node = nodeIdx >= 0 ? nodes[nodeIdx] : null;
      const rune = node ? runeByName.get(node.runeId) : null;
      const color = rune?.glowColor || spell.strokeColor || '#8b5cf6';
      const drawingUrl = rune?.drawing ? this._imageService.getImageUrl(rune.drawing) : null;
      const pos = positions[i % positions.length];
      this._portalRunes.push({
        id: i,
        drawing: drawingUrl,
        symbol: rune
          ? (rune.name?.charAt(0)?.toUpperCase() ?? '✦')
          : RUNE_SYMBOLS[i % RUNE_SYMBOLS.length],
        color,
        x: pos.x,
        y: pos.y,
        size: sizes[i % 16],
        speed: speeds[i % 16],
        delay: delays[i % 16],
        opacity: opacities[i % 16],
      });
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  castSpell(spell: SpellBlock, castLevel = 0, skalierung = 1): void {
    const entryId = `${spell.id || generateSpellId()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const manaCost = this.computeManaCost(spell, castLevel, skalierung);

    // Subtract mana from statuses immediately
    this._consumeMana(manaCost);

    // Build the entry — remainingCast = castLevel (d20 rolls will reduce it to 0)
    const entry: CastingSpellEntry = {
      spellId: spell.id || generateSpellId(),
      spellName: spell.name,
      castLevel,
      entryId,
      skalierung: skalierung !== 1 ? skalierung : undefined,
      remainingCast: castLevel,  // 0 = instant cast; >0 = needs d20 rolls to complete
      roundsActive: castLevel <= 0 ? 0 : undefined,  // instant spells start active immediately
    };
    const updated = [...this.castingSpells, entry];
    this.sheet.castingSpells = updated;
    this.patch.emit({ path: 'castingSpells', value: updated });
    // No lobby action yet — action fires on each d20 roll and when casting completes

    this._spawnRunesForSpell(spell);
    this.cdr.markForCheck();
  }

  private _consumeMana(amount: number): void {
    if (amount <= 0) return;
    const statuses = [...(this.sheet.statuses || [])];
    const idx = statuses.findIndex(s => s.statusName === 'Mana');
    if (idx < 0) return;
    const newVal = Math.max(0, statuses[idx].statusCurrent - amount);
    statuses[idx] = { ...statuses[idx], statusCurrent: newVal };
    this.sheet.statuses = statuses;
    this.patch.emit({ path: `statuses.${idx}.statusCurrent`, value: newVal });
  }

  /** Sent each time a d20 cast roll is made — shows the roll to the lobby */
  private _sendCastRollAction(entry: CastingSpellEntry, roll: number, bonus: number, total: number): void {
    if (!this.sheet.worldName) return;
    const spell = this.getSpell(entry.spellId);
    const spellName = entry.spellName;
    const remaining = entry.remainingCast;
    this._worldSocket.sendDiceRoll({
      id: `cast-roll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      worldName: this.sheet.worldName,
      characterName: this.sheet.name,
      characterId: this.sheet.id || '',
      diceType: 20,
      diceCount: 1,
      bonuses: bonus !== 0 ? [{ name: 'Wirk-Bonus', value: bonus, source: 'sheet' }] : [],
      result: total,
      rolls: [roll],
      timestamp: new Date(),
      isSecret: false,
      actionName: `🎲 Wirken: ${spellName} (noch ${remaining})`,
      actionIcon: spell?.icon || '🎲',
      actionColor: spell?.strokeColor || '#8b5cf6',
    });
  }

  /** Sent once when casting finishes (remainingCast reaches 0) */
  private _sendSpellActivatedAction(entry: CastingSpellEntry, manaCost: number): void {
    if (!this.sheet.worldName) return;
    const spell = this.getSpell(entry.spellId);
    const sk = entry.skalierung ?? 1;
    const cl = entry.castLevel || 0;
    const fokusCommit = spell ? this.computeFokusCost(spell, cl, sk) : 0;
    const resourceChanges: DiceRollEvent['resourceChanges'] = [];
    if (manaCost > 0) resourceChanges.push({ resource: 'Mana', amount: -manaCost });
    if (fokusCommit > 0) resourceChanges.push({ resource: 'Fokus', amount: -fokusCommit });
    this._worldSocket.sendDiceRoll({
      id: `cast-done-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      worldName: this.sheet.worldName,
      characterName: this.sheet.name,
      characterId: this.sheet.id || '',
      diceType: 0,
      diceCount: 0,
      bonuses: [],
      result: 0,
      rolls: [],
      timestamp: new Date(),
      isSecret: false,
      actionName: `✦ ${entry.spellName}${sk > 1 ? ` ×${sk}` : ''} — Gewirkt!`,
      actionIcon: spell?.icon || '✦',
      actionColor: spell?.strokeColor || '#8b5cf6',
      resourceChanges: resourceChanges.length > 0 ? resourceChanges : undefined,
    });
  }

  /** Roll d20 + castBonus and subtract from remaining cast. Sends lobby actions. */
  rollCast(entry: CastingSpellEntry): void {
    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = this.castBonus;
    const total = roll + bonus;
    const before = entry.remainingCast;
    entry.remainingCast = Math.max(0, before - total);

    const justCompleted = before > 0 && entry.remainingCast <= 0;
    if (justCompleted) {
      entry.roundsActive = 0;
    }

    // Send roll action first (shows remaining AFTER this roll)
    this._sendCastRollAction(entry, roll, bonus, total);

    // If casting just finished, also send the spell-activated action
    if (justCompleted) {
      // manaCost was already consumed at cast time — just show it in the notification
      const spell = this.getSpell(entry.spellId);
      const sk = entry.skalierung ?? 1;
      const manaCost = spell ? this.computeManaCost(spell, entry.castLevel || 0, sk) : 0;
      this._sendSpellActivatedAction(entry, manaCost);
    }

    this._patchCasting();
  }

  /** Advance round counter for an active spell */
  advanceRound(entry: CastingSpellEntry): void {
    entry.roundsActive = (entry.roundsActive ?? 0) + 1;
    this._patchCasting();
  }

  /** Whether a spell has exceeded its round duration and should be shown as finished */
  isSpellFinished(entry: CastingSpellEntry): boolean {
    if (entry.remainingCast > 0) return false; // still casting
    const spell = this.getSpell(entry.spellId);
    if (!spell?.durationTurns) return true;  // no duration = instantly done
    return (entry.roundsActive ?? 0) >= spell.durationTurns;
  }

  /** Whether the spell is actively sustained (casting complete, not yet finished) */
  isSpellActive(entry: CastingSpellEntry): boolean {
    return entry.remainingCast <= 0 && !this.isSpellFinished(entry);
  }

  castProgressPercent(entry: CastingSpellEntry): number {
    const total = entry.castLevel || 0;
    if (total <= 0) return 100;
    return Math.round(((total - entry.remainingCast) / total) * 100);
  }

  /** Edit remaining cast directly */
  setRemainingCast(entry: CastingSpellEntry, value: number): void {
    entry.remainingCast = Math.max(0, value);
    if (entry.remainingCast <= 0 && entry.roundsActive === undefined) {
      entry.roundsActive = 0;
    }
    this._patchCasting();
  }

  /** Edit round counter directly */
  setRoundsActive(entry: CastingSpellEntry, value: number): void {
    entry.roundsActive = Math.max(0, value);
    this._patchCasting();
  }

  /** Stop / dismiss a spell (removes from active list) */
  stopCasting(entry: CastingSpellEntry): void {
    const updated = entry.entryId
      ? this.castingSpells.filter(e => e.entryId !== entry.entryId)
      : this.castingSpells.filter(e => e.spellId !== entry.spellId);
    this.sheet.castingSpells = updated;
    this._patchCasting();
    this.cdr.markForCheck();
  }

  private _patchCasting(): void {
    this.patch.emit({ path: 'castingSpells', value: [...this.castingSpells] });
    this.cdr.markForCheck();
  }

  /** Adjust a counter on a spell's definition and sync via patch */
  adjustCounter(spellId: string, counterIndex: number, newValue: number): void {
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

  // ── Skill support ─────────────────────────────────────────────────────────

  /** Active skills (type === 'active') available on the sheet */
  get availableSkills(): SkillBlock[] {
    return (this.sheet.skills || []).filter(s => s.type === 'active' && !s.disabled);
  }

  /** Active skills filtered by search text */
  get filteredAvailableSkills(): SkillBlock[] {
    if (!this.skillSearchText.trim()) return this.availableSkills;
    const q = this.skillSearchText.toLowerCase();
    return this.availableSkills.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      (s.class || '').toLowerCase().includes(q)
    );
  }

  /** Active spells filtered by spell name for search */
  get filteredAvailableSpells(): SpellBlock[] {
    return this.availableSpells;
  }

  /** Skills currently toggled on (have name in activeSkillNames) */
  get activeSkillsList(): SkillBlock[] {
    return this.availableSkills.filter(s => this.isSkillActive(s));
  }

  /** Whether a skill is currently toggled on */
  isSkillActive(skill: SkillBlock): boolean {
    return (this.sheet.activeSkillNames || []).includes(skill.name);
  }

  /** Toggle a skill on/off and emit patch */
  toggleActiveSkill(skill: SkillBlock): void {
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

  /** Adjust a counter on a skill definition and sync via patch */
  adjustSkillCounter(skillName: string, counterIndex: number, newValue: number): void {
    const skills = [...(this.sheet.skills || [])];
    const idx = skills.findIndex(s => s.name === skillName);
    if (idx < 0) return;
    const skill = { ...skills[idx] };
    if (!skill.counters || counterIndex >= skill.counters.length) return;
    skill.counters = skill.counters.map((c, i) =>
      i === counterIndex ? { ...c, current: Math.max(c.min, Math.min(c.max, newValue)) } : c
    );
    skills[idx] = skill;
    this.sheet.skills = skills;
    this.patch.emit({ path: 'skills', value: skills });
    this.cdr.markForCheck();
  }

  // ── Skill definition resolution ───────────────────────────────────────────

  private getSkillDefinition(skill: SkillBlock): SkillDefinition | undefined {
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
    const type = cost.type === 'mana' ? 'M' : cost.type === 'energy' ? 'E' : '❤';
    return `${cost.amount}${type}${cost.perRound ? '/Rd' : ''}`;
  }

  /** Deduct per-round cost of an active skill from the matching status resource */
  paySkillRoundCost(skill: SkillBlock): void {
    const cost = this.effectiveCost(skill);
    if (!cost?.perRound || !cost.amount) return;
    const formulaMap: Record<string, FormulaType> = {
      mana: FormulaType.MANA,
      energy: FormulaType.ENERGY,
      life: FormulaType.LIFE,
    };
    const targetType = formulaMap[cost.type];
    if (!targetType) return;
    const statuses = [...(this.sheet.statuses || [])];
    const idx = statuses.findIndex(s => s.formulaType === targetType);
    if (idx < 0) return;
    const newVal = Math.max(0, (statuses[idx].statusCurrent || 0) - cost.amount);
    statuses[idx] = { ...statuses[idx], statusCurrent: newVal };
    this.sheet.statuses = statuses;
    this.patch.emit({ path: 'statuses', value: statuses });
    this.cdr.markForCheck();
  }

  // ── Floating runes ────────────────────────────────────────────────────────

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    this.leftTab = this.defaultTab;
    this._generateAmbientRunes();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this.pendingCastSpell) {
      this.recalcCastPreview();
    }
    this.cdr.markForCheck();
  }

  setLeftTab(tab: 'spells' | 'skills'): void {
    this.leftTab = tab;
    this.tabChange.emit(tab);
    this.cdr.markForCheck();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  private _generateAmbientRunes(): void {
    const count = 18;
    for (let i = 0; i < count; i++) {
      this.floatingRunes.push(this._makeRune());
    }
  }

  private _spawnRunesForSpell(spell: SpellBlock): void {
    const color = spell.strokeColor || '#8b5cf6';
    for (let i = 0; i < 5; i++) {
      this.floatingRunes.push(this._makeRune(color));
    }
    // cap total
    if (this.floatingRunes.length > 40) {
      this.floatingRunes = this.floatingRunes.slice(-40);
    }
    this.cdr.markForCheck();
  }

  private _makeRune(color?: string): FloatingRune {
    const colors = ['#8b5cf6','#3b82f6','#06b6d4','#ec4899','#a78bfa'];
    return {
      id: this.runeIdCounter++,
      symbol: RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)],
      x: Math.random() * 95,
      y: Math.random() * 95,
      size: 14 + Math.floor(Math.random() * 28),
      opacity: 0.05 + Math.random() * 0.15,
      speed: 8 + Math.random() * 14,
      delay: Math.random() * -12,
      color: color || colors[Math.floor(Math.random() * colors.length)],
    };
  }
}
