import {
  Component, Input, Output, EventEmitter, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SpellBlock, SpellStatRequirements, SpellBinding,
  StoredCostSchedule, StoredCostCase, StoredCostTurn,
  SPELL_TAG_OPTIONS, SPELL_GLOW_COLORS, generateSpellId,
} from '../../model/spell-block-model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellNodeEditorComponent } from '../../shared/spell-node-editor/spell-node-editor.component';
import { SpellCostResult } from '../../shared/spell-node-editor/spell-cost.model';
import { ActionMacro, ActionConsequence } from '../../model/action-macro.model';
import { SpellGraph } from '../../shared/spell-node-editor/spell-node.model';

@Component({
  selector: 'app-spell-editor-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, SpellNodeEditorComponent],
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
  spellStrokeColor = '#8b5cf6';
  costSchedule: StoredCostSchedule | null = null;
  graph: SpellGraph | undefined;
  embeddedMacro: ActionMacro | null = null;
  hasDrawing = false;

  // ── UI state ─────────────────────────────────────────────────────────────────
  showNodeEditor = false;
  showDeleteConfirm = false;
  showMacroEditor = false;
  lastEstimatedCostResult: SpellCostResult | null = null;
  hasNewEstimate = false;

  readonly tagOptions = SPELL_TAG_OPTIONS;
  readonly glowColors = SPELL_GLOW_COLORS;
  readonly statLabels: { key: keyof SpellStatRequirements; label: string }[] = [
    { key: 'intelligence',  label: 'Intelligenz' },
    { key: 'constitution',  label: 'Konstitution' },
    { key: 'strength',      label: 'Stärke' },
    { key: 'dexterity',     label: 'Geschick' },
    { key: 'speed',         label: 'Tempo' },
    { key: 'chill',         label: 'Chill' },
  ];

  readonly statIcons: Record<keyof SpellStatRequirements, string> = {
    intelligence: '🧠', constitution: '💪', strength: '⚔️',
    dexterity: '🏃', speed: '⚡', chill: '❄️',
  };

  get isNewSpell(): boolean { return !this.spell; }

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
      this.spellStrokeColor      = this.spell.strokeColor ?? '#8b5cf6';
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
      strokeColor:     this.spellStrokeColor,
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
      strokeColor:      this.spellStrokeColor,
      graph:            this.graph ? JSON.parse(JSON.stringify(this.graph)) : undefined,
      costMana:         this.spellCostMana || undefined,
      costFokus:        this.spellCostFokus || undefined,
      statRequirements: this.hasAnyStatReq() ? { ...this.spellStatRequirements } : undefined,
    };
  }

  get graphNodeCount(): number {
    return this.graph?.nodes?.length ?? 0;
  }

  // ── Cost schedule ─────────────────────────────────────────────────────────────

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

  clearCostSchedule(): void {
    this.costSchedule = null;
    this.cdr.markForCheck();
  }

  getCaseTurnsPreview(caseItem: StoredCostCase): string {
    if (!caseItem.turns?.length) return 'Keine Kosten';
    const first = caseItem.turns[0];
    const parts: string[] = [];
    if (first.mana  > 0) parts.push(`${first.mana}♦ Mana`);
    if (first.fokus > 0) parts.push(`${first.fokus}◇ Fokus`);
    const tail = caseItem.turns.length > 1 ? ` + ${caseItem.turns.length - 1} weitere Runden` : '';
    return (parts.join(', ') || 'Keine') + tail;
  }

  // ── Macro ─────────────────────────────────────────────────────────────────────

  enableMacro(): void {
    this.embeddedMacro = {
      id:          'macro_' + Date.now(),
      name:        this.spellName || 'Zauber-Makro',
      conditions:  [],
      consequences: [],
      referencedSkillNames: [],
      isValid:     true,
      order:       0,
      createdAt:   new Date(),
      modifiedAt:  new Date(),
    };
    this.showMacroEditor = true;
    this.cdr.markForCheck();
  }

  disableMacro(): void {
    this.embeddedMacro = null;
    this.showMacroEditor = false;
    this.cdr.markForCheck();
  }

  addConsequence(type: ActionConsequence['type']): void {
    if (!this.embeddedMacro) return;
    const c: ActionConsequence = {
      id:   'c_' + Date.now(),
      type,
      ...(type === 'spend_resource' || type === 'gain_resource' ? { resource: 'mana' as const, diceFormula: '1' } : {}),
      ...(type === 'dice_roll' ? { diceFormula: '1d6', rollName: 'Würfelwurf' } : {}),
    };
    this.embeddedMacro.consequences = [...this.embeddedMacro.consequences, c];
    this.cdr.markForCheck();
  }

  removeConsequence(id: string): void {
    if (!this.embeddedMacro) return;
    this.embeddedMacro.consequences = this.embeddedMacro.consequences.filter(c => c.id !== id);
    this.cdr.markForCheck();
  }

  consequenceLabel(type: ActionConsequence['type']): string {
    switch (type) {
      case 'dice_roll':      return '🎲 Würfelwurf';
      case 'spend_resource': return '💸 Ressource abziehen';
      case 'gain_resource':  return '✨ Ressource regenerieren';
      case 'apply_bonus':    return '⬆️ Bonus anwenden';
      default:               return type;
    }
  }

  resourceLabel(r: string | undefined): string {
    switch (r) {
      case 'mana':   return '♦ Mana';
      case 'fokus':  return '◇ Fokus';
      case 'health': return '❤️ Leben';
      case 'energy': return '⚡ Ausdauer';
      default:       return r || '';
    }
  }
}
