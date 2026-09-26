import { ChangeDetectorRef, Component, DoCheck, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SpellComponent } from '../spell/spell.component';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SpellBlock, SpellKnowledge, generateSpellId } from '../../model/spell-block-model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellEditorOverlayComponent } from '../spell-editor-overlay/spell-editor-overlay.component';
import { SpellInscribeDialogComponent } from '../spell-inscribe-dialog/spell-inscribe-dialog.component';
import { applyJsonPatchTo } from '../../utils/json-patch.util';
import {
  CastableSpell, SpellKnowledgeState, SpellMedium, castableSpells, spellKey, spellKnowledge,
} from '../../utils/spell-medium.util';

@Component({
  selector: 'app-spells',
  imports: [
    CommonModule, SpellComponent, CardComponent, DragDropModule, FormsModule,
    SpellEditorOverlayComponent, SpellInscribeDialogComponent,
  ],
  templateUrl: './spells.component.html',
  styleUrl: './spells.component.css',
})
export class SpellsComponent implements DoCheck {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() editingSpells!: Set<number>;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() editingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() requestCastWindow = new EventEmitter<void>();

  placeholderHeight = '90px';
  placeholderWidth = '100%';

  // ── Context menu (rendered at this level to escape stacking contexts) ──────
  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuIndex = -1;

  onSpellContextMenu(event: { x: number; y: number; index: number }) {
    this.contextMenuX = event.x;
    this.contextMenuY = event.y;
    this.contextMenuIndex = event.index;
    this.showContextMenu = true;
  }

  closeContextMenu() {
    this.showContextMenu = false;
    this.contextMenuIndex = -1;
  }

  openEditorFromMenu() {
    if (this.contextMenuIndex >= 0) this.openNodeEditor(this.contextMenuIndex);
    this.closeContextMenu();
  }

  /** Label the context menu against the spell it was opened on. */
  get contextSpellVerinnerlicht(): boolean {
    const spell = this.sheet.spells?.[this.contextMenuIndex];
    return !!spell && spellKnowledge(spell) === 'verinnerlicht';
  }

  /**
   * Flip gelernt ↔ verinnerlicht. One click, no cost and no cap: the ruleset makes internalising a
   * matter of hours of study and a limited number of slots, and the group tracks that themselves.
   */
  toggleVerinnerlichtFromMenu() {
    const index = this.contextMenuIndex;
    this.closeContextMenu();
    const spell = this.sheet.spells?.[index];
    if (!spell) return;
    const next: SpellKnowledge = spellKnowledge(spell) === 'verinnerlicht' ? 'gelernt' : 'verinnerlicht';
    spell.knowledge = next;
    this.sheet.spells = [...this.sheet.spells];
    this.invalidateCastable();
    this.patch.emit({ path: `spells.${index}.knowledge`, value: next });
  }

  openInscribeFromMenu() {
    const index = this.contextMenuIndex;
    this.closeContextMenu();
    this.inscribeSpell = this.sheet.spells?.[index] ?? null;
  }

  /** Copy the spell and open the editor on the copy, ready to be renamed. */
  duplicateFromMenu() {
    const index = this.contextMenuIndex;
    this.closeContextMenu();
    if (index < 0) return;
    const source = this.sheet.spells[index];
    if (!source) return;
    const copy: SpellBlock = JSON.parse(JSON.stringify(source));
    copy.id = generateSpellId();
    copy.name = `${source.name} (Kopie)`;
    this.sheet.spells = [...this.sheet.spells.slice(0, index + 1), copy, ...this.sheet.spells.slice(index + 1)];
    this.patch.emit({ path: 'spells', value: this.sheet.spells });
    this.openNodeEditor(index + 1);
  }

  deleteFromMenu() {
    if (this.contextMenuIndex >= 0) this.deleteSpell(this.contextMenuIndex);
    this.closeContextMenu();
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.showContextMenu) this.closeContextMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showContextMenu) this.closeContextMenu();
  }

  /** Spell whose Einschreiben dialog is open, if any. */
  inscribeSpell: SpellBlock | null = null;

  closeInscribe() {
    this.inscribeSpell = null;
  }

  /** Apply the inscription patch and let the card pick up its new Medium. */
  onInscribe(patch: JsonPatch) {
    applyJsonPatchTo(this.sheet, patch);
    this.inscribeSpell = null;
    this.invalidateCastable();
    this.patch.emit(patch);
  }

  // Node editor state
  showNodeEditor = false;
  nodeEditorSpellIndex: number | null = null;
  get nodeEditorSpell(): SpellBlock | null {
    if (this.nodeEditorSpellIndex === null) return null;
    return this.sheet.spells[this.nodeEditorSpellIndex] ?? null;
  }
  // ── Wissen & Medien ───────────────────────────────────────────────────────

  /**
   * Zauberbuch ∪ carried Media, recomputed per change-detection pass but memoised within it.
   *
   * `castableSpells` walks equipment, the sparse inventory and every Konstrukt subtree, and the
   * template asks for it once per card — so it is cached against the current sheet identity and
   * invalidated whenever we patch.
   */
  private _castableCache: CastableSpell[] | null = null;

  private get castable(): CastableSpell[] {
    return (this._castableCache ??= castableSpells(this.sheet));
  }

  private invalidateCastable(): void {
    this._castableCache = null;
  }

  /**
   * Drop the cache once per change-detection pass.
   *
   * The sheet is mutated IN PLACE by socket patches from other clients, so its identity never
   * changes and there is nothing to compare against. Invalidating here keeps the union at most one
   * pass stale — equipping a scroll in another tab shows up immediately — while still computing it
   * only once however many cards read it.
   */
  ngDoCheck() {
    this._castableCache = null;
  }

  private entryFor(spell: SpellBlock): CastableSpell | undefined {
    const key = spellKey(spell);
    return this.castable.find(c => c.key === key);
  }

  knowledgeOf(spell: SpellBlock): SpellKnowledgeState {
    return this.entryFor(spell)?.knowledge ?? spellKnowledge(spell);
  }

  mediaOf(spell: SpellBlock): SpellMedium[] {
    return this.entryFor(spell)?.media ?? [];
  }

  /**
   * Inscriptions for spells that are NOT in the Zauberbuch — someone else's scroll.
   *
   * Spells the character does know already show their Medium as a chip on their own card, so
   * repeating them here would list the same spell twice.
   */
  get foreignSpells(): CastableSpell[] {
    return this.castable.filter(c => c.knowledge === 'unbekannt');
  }

  get learnedRunes(): RuneBlock[] {
    return ((this.sheet.runes || []).filter(r => r !== null)) as RuneBlock[];
  }


  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.sheet.spells) {
      this.sheet.spells = [];
    }
  }

  // Spell editor overlay
  openNodeEditor(index: number | null) {
    this.nodeEditorSpellIndex = index;
    this.showNodeEditor = true;
  }

  closeNodeEditor() {
    this.showNodeEditor = false;
    this.nodeEditorSpellIndex = null;
  }

  deleteSpellFromEditor() {
    if (this.nodeEditorSpellIndex !== null) {
      this.deleteSpell(this.nodeEditorSpellIndex);
    }
    this.closeNodeEditor();
  }

  saveFromNodeEditor(spell: SpellBlock) {
    const spells = [...this.sheet.spells];

    // Prefer ID-based lookup — survives tab switching that resets nodeEditorSpellIndex
    let targetIndex = spell.id ? spells.findIndex(s => s.id === spell.id) : -1;

    // Fallback to index-based if no ID match (e.g., legacy spells without IDs)
    if (targetIndex < 0 && this.nodeEditorSpellIndex !== null) {
      targetIndex = this.nodeEditorSpellIndex;
    }

    if (targetIndex >= 0) {
      spells[targetIndex] = spell;
    } else {
      // Brand new spell — ensure it has an ID
      if (!spell.id) spell.id = generateSpellId();
      spells.push(spell);
    }

    this.sheet.spells = spells;
    this.patch.emit({ path: 'spells', value: this.sheet.spells });
    // Do NOT close — spell editor stays open after save (explicit close via cancel/X)
  }

  deleteSpell(index: number) {
    const spell = this.sheet.spells[index];
    this.sheet.spells = this.sheet.spells.filter((_, i) => i !== index);

    // Add to trash
    const trash = this.sheet.trash || [];
    trash.push({
      type: 'spell',
      data: spell,
      deletedAt: Date.now()
    });

    this.patch.emit({
      path: 'spells',
      value: this.sheet.spells,
    });
    this.patch.emit({
      path: 'trash',
      value: trash,
    });
  }

  updateSpell(index: number, patch: JsonPatch) {
    const pathParts = patch.path.split('.');
    
    if (pathParts.length === 1) {
      (this.sheet.spells[index] as any)[patch.path] = patch.value;
    } else if (pathParts[0] === 'binding') {
      if (!this.sheet.spells[index].binding) {
        this.sheet.spells[index].binding = { type: 'learned' };
      }
      (this.sheet.spells[index].binding as any)[pathParts[1]] = patch.value;
    }
    
    this.sheet.spells = [...this.sheet.spells];
    
    this.patch.emit({
      path: `spells.${index}.${patch.path}`,
      value: patch.value,
    });
  }

  onDragStarted(event: CdkDragStart) {
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    this.placeholderHeight = `${rect.height}px`;
    this.placeholderWidth = `${rect.width}px`;
  }

  onDrop(event: CdkDragDrop<SpellBlock[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    if (previousIndex === currentIndex) {
      return;
    }

    const newSpells = [...this.sheet.spells];
    moveItemInArray(newSpells, previousIndex, currentIndex);
    
    this.sheet.spells = newSpells;
    
    this.patch.emit({
      path: 'spells',
      value: newSpells,
    });
  }

  onEditingChange(index: number, isEditing: boolean) {
    this.editingChange.emit({index, isEditing});
  }

  isSpellEditing(index: number): boolean {
    return this.editingSpells.has(index);
  }
}