import {
  Component, Input, Output, EventEmitter, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SpellBlock, SpellStatRequirements, SpellBinding,
  StoredCostSchedule, StoredCostCase, StoredCostTurn,
  SPELL_TAG_OPTIONS, generateSpellId,
} from '../../model/spell-block-model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellNodeEditorComponent } from '../../shared/spell-node-editor/spell-node-editor.component';
import { SpellCostResult } from '../../shared/spell-node-editor/spell-cost.model';
import { calculateSpellCost } from '../../shared/spell-node-editor/spell-cost-calculator';
import { ActionMacro, createEmptyActionMacro } from '../../model/action-macro.model';
import { SpellGraph } from '../../shared/spell-node-editor/spell-node.model';
import { EmbeddedMacroEditorComponent } from '../../shared/embedded-macro-editor/embedded-macro-editor.component';

@Component({
  selector: 'app-spell-editor-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, SpellNodeEditorComponent, EmbeddedMacroEditorComponent],
  templateUrl: './spell-editor-overlay.component.html',
  styleUrl: './spell-editor-overlay.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellEditorOverlayComponent implements OnInit {
  @Input() spell: SpellBlock | null = null;
  @Input() availableRunes: RuneBlock[] = [];
  @Output() save        = new EventEmitter<SpellBlock>();
  @Output() cancel      = new EventEmitter<void>();
  @Output() deleteSpell = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);

  // ── Form fields ──────────────────────────────────────────────────────────────
  spellId!: string;
  spellName = '';
  spellDescription = '';
  spellTags: string[] = [];
  spellCostMana = 0;
  spellCostFokus = 0;
  spellStatRequirements: SpellStatRequirements = {};
  spellBinding: SpellBinding = { type: 'learned' };
  costSchedule: StoredCostSchedule | null = null;
  graph: SpellGraph | undefined;
  embeddedMacro: ActionMacro | null = null;
  hasDrawing = false;
  // For add-turn form (single turn)
  newTurnMana = 0;
  newTurnFokus = 0;
  // For add range form (A-B)
  newRangeFrom = 1;
  newRangeTo = 10;
  newRangeMana = 0;
  newRangeFokus = 0;

  // ── UI state ─────────────────────────────────────────────────────────────────
  showNodeEditor = false;
  showDeleteConfirm = false;
  showMacroEditor = false;
  lastEstimatedCostResult: SpellCostResult | null = null;
  hasNewEstimate = false;
  savedFeedback = false;       // Brief "Gespeichert" flash
  showEstimatePopup = false;   // Inline estimate result popup

  readonly tagOptions = SPELL_TAG_OPTIONS;
  readonly statLabels: { key: keyof SpellStatRequirements; label: string }[] = [
    { key: 'intelligence',  label: 'Intelligenz' },
    { key: 'constitution',  label: 'Konstitution' },
    { key: 'strength',      label: 'Stärke' },
    { key: 'dexterity',     label: 'Geschick' },
    { key: 'speed',         label: 'Tempo' },
    { key: 'chill',         label: 'Chill' },
  ];

  get isNewSpell(): boolean { return !this.spell; }
  get hasGraph(): boolean { return (this.graph?.nodes?.length ?? 0) > 0; }

  ngOnInit(): void {
    if (this.spell) {
      this.spellId               = this.spell.id || generateSpellId();
      this.spellName             = this.spell.name || '';
      this.spellDescription      = this.spell.description || '';
      this.spellTags             = [...(this.spell.tags || [])];
      this.spellCostMana         = this.spell.costMana ?? 0;
      this.spellCostFokus        = this.spell.costFokus ?? 0;
      this.spellStatRequirements = { ...(this.spell.statRequirements || {}) };
      this.spellBinding          = { ...(this.spell.binding || { type: 'learned' }) };
      this.costSchedule          = this.spell.costSchedule ?? null;
      this.graph                 = this.spell.graph ? JSON.parse(JSON.stringify(this.spell.graph)) : undefined;
      this.embeddedMacro         = this.spell.embeddedMacro ? JSON.parse(JSON.stringify(this.spell.embeddedMacro)) : null;
      this.hasDrawing            = !!this.spell.drawing;
    } else {
      this.spellId = generateSpellId();
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  onSave(): void {
    const spell: SpellBlock = {
      id:              this.spellId,
      name:            this.spellName.trim() || 'Unbenannter Zauber',
      description:     this.spellDescription,
      tags:            [...this.spellTags],
      binding:         { ...this.spellBinding },
      strokeColor:     this.spell?.strokeColor,
      libraryOrigin:   this.spell?.libraryOrigin,
      libraryOriginName: this.spell?.libraryOriginName,
      drawing:         this.spell?.drawing,
      graph:           this.graph,
      costMana:        this.spellCostMana || undefined,
      costFokus:       this.spellCostFokus || undefined,
      statRequirements: this.hasAnyStatReq() ? { ...this.spellStatRequirements } : undefined,
      costSchedule:    this.costSchedule ?? undefined,
      embeddedMacro:   this.embeddedMacro ?? undefined,
    };
    this.save.emit(spell);
    // Brief visual feedback
    this.savedFeedback = true;
    this.cdr.markForCheck();
    setTimeout(() => { this.savedFeedback = false; this.cdr.markForCheck(); }, 1500);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDeleteConfirm(): void {
    this.deleteSpell.emit();
  }

  private hasAnyStatReq(): boolean {
    return Object.values(this.spellStatRequirements).some(v => (v ?? 0) > 0);
  }

  // ── Tags ─────────────────────────────────────────────────────────────────────

  toggleTag(tag: string): void {
    const idx = this.spellTags.indexOf(tag);
    if (idx >= 0) this.spellTags.splice(idx, 1);
    else          this.spellTags.push(tag);
    this.cdr.markForCheck();
  }

  // ── Rune editor ──────────────────────────────────────────────────────────────

  openNodeEditor(): void {
    this.showNodeEditor = true;
    this.cdr.markForCheck();
  }

  onNodeEditorSave(savedSpell: SpellBlock): void {
    this.graph = savedSpell.graph;
    if (savedSpell.costMana  !== undefined) this.spellCostMana  = savedSpell.costMana;
    if (savedSpell.costFokus !== undefined) this.spellCostFokus = savedSpell.costFokus;
    if (savedSpell.statRequirements)        this.spellStatRequirements = { ...savedSpell.statRequirements };
    this.cdr.markForCheck();
  }

  onNodeEditorCostResult(result: SpellCostResult | null): void {
    if (!result) return;
    this.lastEstimatedCostResult = result;
    this.hasNewEstimate = true;
    this.cdr.markForCheck();
  }

  closeNodeEditor(): void {
    this.showNodeEditor = false;
    this.cdr.markForCheck();
  }

  /** Build a SpellBlock to pass into the node editor, seeded with current form state */
  buildSpellForNodeEditor(): SpellBlock {
    return {
      id:               this.spellId,
      name:             this.spellName || 'Neuer Zauber',
      description:      this.spellDescription,
      tags:             [...this.spellTags],
      binding:          { ...this.spellBinding },
      strokeColor:      this.spell?.strokeColor,
      graph:            this.graph ? JSON.parse(JSON.stringify(this.graph)) : undefined,
      costMana:         this.spellCostMana || undefined,
      costFokus:        this.spellCostFokus || undefined,
      statRequirements: this.hasAnyStatReq() ? { ...this.spellStatRequirements } : undefined,
    };
  }

  get graphNodeCount(): number {
    return this.graph?.nodes?.length ?? 0;
  }

  // ── Cost schedule (manual editing) ────────────────────────────────────────────

  applyEstimatedCosts(): void {
    if (!this.lastEstimatedCostResult) return;
    const result = this.lastEstimatedCostResult;

    const convertCase = (cc: any): StoredCostCase => ({
      label:           cc.label,
      turns:           (cc.fullEntries || cc.entries || []).map((e: any): StoredCostTurn => ({
        turn:  e.turn,
        mana:  Math.round(e.mana  * 100) / 100,
        fokus: Math.round(e.fokus * 100) / 100,
      })),
      subcases:        cc.subcases?.map(convertCase),
      isUnknownBranch: cc.isUnknownMerge ?? false,
    });

    this.costSchedule = { cases: result.cases.map(convertCase) };
    this.spellCostMana  = Math.round(result.simpleTotals.mana  * 100) / 100;
    this.spellCostFokus = Math.round(result.simpleTotals.fokus * 100) / 100;
    this.hasNewEstimate = false;
    this.cdr.markForCheck();
  }

  ensureCostSchedule(): void {
    if (!this.costSchedule) {
      this.costSchedule = { cases: [{ label: 'Standard', turns: [] }] };
    }
  }

  addManualTurnToCase(caseIdx: number): void {
    this.ensureCostSchedule();
    const c = this.costSchedule!.cases[caseIdx];
    const nextTurn = (c.turns[c.turns.length - 1]?.turn ?? 0) + 1;
    c.turns = [...c.turns, { turn: nextTurn, mana: this.newTurnMana, fokus: this.newTurnFokus }];
    this.costSchedule = { ...this.costSchedule!, cases: [...this.costSchedule!.cases] };
    this.cdr.markForCheck();
  }

  removeManualTurn(caseIdx: number, turnIdx: number): void {
    const c = this.costSchedule!.cases[caseIdx];
    c.turns = c.turns.filter((_, i) => i !== turnIdx);
    this.costSchedule = { ...this.costSchedule!, cases: [...this.costSchedule!.cases] };
    this.cdr.markForCheck();
  }

  addCase(): void {
    this.ensureCostSchedule();
    this.costSchedule = {
      cases: [...this.costSchedule!.cases, { label: 'Fall ' + (this.costSchedule!.cases.length + 1), turns: [] }],
    };
    this.cdr.markForCheck();
  }

  removeCase(idx: number): void {
    if (!this.costSchedule) return;
    this.costSchedule = { cases: this.costSchedule.cases.filter((_, i) => i !== idx) };
    if (this.costSchedule.cases.length === 0) this.costSchedule = null;
    this.cdr.markForCheck();
  }

  clearCostSchedule(): void {
    this.costSchedule = null;
    this.cdr.markForCheck();
  }

  /** Add a range of turns (e.g. turns 5-100) with the same cost to a case */
  addRangeToCase(caseIdx: number): void {
    const from = Math.max(0, Math.round(this.newRangeFrom));
    const to   = Math.max(from, Math.round(this.newRangeTo));
    if (from > to) return;
    this.ensureCostSchedule();
    const c = this.costSchedule!.cases[caseIdx];
    const existingTurnNums = new Set(c.turns.map(t => t.turn));
    const newTurns: StoredCostTurn[] = [];
    for (let t = from; t <= to; t++) {
      if (!existingTurnNums.has(t)) {
        newTurns.push({ turn: t, mana: this.newRangeMana, fokus: this.newRangeFokus });
      }
    }
    c.turns = [...c.turns, ...newTurns].sort((a, b) => a.turn - b.turn);
    this.costSchedule = { ...this.costSchedule!, cases: [...this.costSchedule!.cases] };
    this.cdr.markForCheck();
  }

  // ── Estimate ─────────────────────────────────────────────────────────────────

  runEstimate(): void {
    if (!this.graph || !this.graph.nodes?.length) return;
    try {
      const result = calculateSpellCost(this.graph, this.availableRunes);
      this.lastEstimatedCostResult = result;
      this.hasNewEstimate = true;
      this.showEstimatePopup = true;
    } catch (e) {
      console.error('Spell cost estimate failed:', e);
    }
    this.cdr.markForCheck();
  }

  closeEstimatePopup(): void {
    this.showEstimatePopup = false;
    this.cdr.markForCheck();
  }

  /** Format estimate cases for display in popup */
  get estimateCaseSummaries(): Array<{ label: string; mana: number; fokus: number; turns: number }> {
    if (!this.lastEstimatedCostResult) return [];
    return this.lastEstimatedCostResult.cases.map(c => {
      const entries = c.fullEntries || c.entries || [];
      const totalMana  = entries.reduce((s, e) => s + e.mana, 0);
      const totalFokus = entries.reduce((s, e) => s + e.fokus, 0);
      return {
        label: c.label,
        mana:  Math.round(totalMana  * 100) / 100,
        fokus: Math.round(totalFokus * 100) / 100,
        turns: entries.length,
      };
    });
  }



  enableMacro(): void {
    const m = createEmptyActionMacro();
    m.name = this.spellName || 'Zauber-Makro';
    this.embeddedMacro = m;
    this.showMacroEditor = true;
    this.cdr.markForCheck();
  }

  disableMacro(): void {
    this.embeddedMacro = null;
    this.showMacroEditor = false;
    this.cdr.markForCheck();
  }

  onMacroSave(macro: ActionMacro): void {
    this.embeddedMacro = macro;
    this.showMacroEditor = false;
    this.cdr.markForCheck();
  }

  onMacroCancel(): void {
    if (!this.embeddedMacro) {
      // was creating new, cancel means kill it
      this.embeddedMacro = null;
    }
    this.showMacroEditor = false;
    this.cdr.markForCheck();
  }
}
