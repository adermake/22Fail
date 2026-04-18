import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SpellBlock, SpellStatRequirements, SpellBinding,
  SPELL_TAG_OPTIONS, generateSpellId,
} from '../../model/spell-block-model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellNodeEditorComponent } from '../../shared/spell-node-editor/spell-node-editor.component';
import { SimpleSpellCost } from '../../shared/spell-node-editor/spell-cost.model';
import { ActionMacro, createEmptyActionMacro } from '../../model/action-macro.model';
import { SpellGraph } from '../../shared/spell-node-editor/spell-node.model';
import { EmbeddedMacroEditorComponent } from '../../shared/embedded-macro-editor/embedded-macro-editor.component';
import { MACRO_ICON_SYMBOLS } from '../../shared/embedded-macro-editor/embedded-macro-editor.component';

@Component({
  selector: 'app-spell-editor-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, SpellNodeEditorComponent, EmbeddedMacroEditorComponent],
  templateUrl: './spell-editor-overlay.component.html',
  styleUrl: './spell-editor-overlay.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellEditorOverlayComponent implements OnInit, OnDestroy {
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
  perTurnMana = 0;
  perTurnFokus = 0;
  durationTurns = 0;
  spellStatRequirements: SpellStatRequirements = {};
  spellBinding: SpellBinding = { type: 'learned' };
  graph: SpellGraph | undefined;
  embeddedMacro: ActionMacro | null = null;
  hasDrawing = false;
  spellIcon = '✦';
  spellColor = '#8b5cf6';

  // ── UI state ─────────────────────────────────────────────────────────────────
  showNodeEditor = false;
  showDeleteConfirm = false;
  showMacroEditor = false;
  lastSimpleEstimate: SimpleSpellCost | null = null;
  savedFeedback = false;

  readonly tagOptions = SPELL_TAG_OPTIONS;
  readonly iconOptions = MACRO_ICON_SYMBOLS;
  readonly colorPresets = [
    '#8b5cf6', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#3b82f6', '#ec4899',
    '#a78bfa', '#ffffff',
  ];
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
    document.body.style.overflow = 'hidden';
    if (this.spell) {
      this.spellId               = this.spell.id || generateSpellId();
      this.spellName             = this.spell.name || '';
      this.spellDescription      = this.spell.description || '';
      this.spellTags             = [...(this.spell.tags || [])];
      this.spellCostMana         = this.spell.costMana ?? 0;
      this.spellCostFokus        = this.spell.costFokus ?? 0;
      this.perTurnMana           = this.spell.perTurnMana ?? 0;
      this.perTurnFokus          = this.spell.perTurnFokus ?? 0;
      this.durationTurns         = this.spell.durationTurns ?? 0;
      this.spellStatRequirements = { ...(this.spell.statRequirements || {}) };
      this.spellBinding          = { ...(this.spell.binding || { type: 'learned' }) };
      this.graph                 = this.spell.graph ? JSON.parse(JSON.stringify(this.spell.graph)) : undefined;
      this.embeddedMacro         = this.spell.embeddedMacro ? JSON.parse(JSON.stringify(this.spell.embeddedMacro)) : null;
      this.hasDrawing            = !!this.spell.drawing;
      this.spellIcon             = this.spell.icon || '\u2726';
      this.spellColor            = this.spell.strokeColor || '#8b5cf6';
    } else {
      this.spellId = generateSpellId();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  onSave(): void {
    const spell: SpellBlock = {
      id:              this.spellId,
      name:            this.spellName.trim() || 'Unbenannter Zauber',
      description:     this.spellDescription,
      tags:            [...this.spellTags],
      binding:         { ...this.spellBinding },
      strokeColor:     this.spellColor,
      icon:            this.spellIcon,
      libraryOrigin:   this.spell?.libraryOrigin,
      libraryOriginName: this.spell?.libraryOriginName,
      drawing:         this.spell?.drawing,
      graph:           this.graph,
      costMana:        this.spellCostMana || undefined,
      costFokus:       this.spellCostFokus || undefined,
      perTurnMana:     this.perTurnMana || undefined,
      perTurnFokus:    this.perTurnFokus || undefined,
      durationTurns:   this.durationTurns || undefined,
      statRequirements: this.hasAnyStatReq() ? { ...this.spellStatRequirements } : undefined,
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

  onNodeEditorCostResult(result: SimpleSpellCost | null): void {
    if (!result) return;
    this.lastSimpleEstimate = result;
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

  // ── Macro ─────────────────────────────────────────────────────────────────────

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
