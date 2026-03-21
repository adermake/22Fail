import {
  CdkDragDrop,
  CdkDragEnd,
  CdkDragMove,
  CdkDragStart,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RuneBlock } from '../../model/rune-block.model';
import { RuneEditorComponent } from '../rune-editor/rune-editor.component';
import { ImageUrlPipe } from '../image-url.pipe';

@Component({
  selector: 'app-runes',
  imports: [CommonModule, DragDropModule, RuneEditorComponent, ImageUrlPipe],
  templateUrl: './runes.component.html',
  styleUrl: './runes.component.css',
})
export class RunesComponent implements OnChanges {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  selectedIndex: number | null = null;
  showEditor = false;
  editingIndex: number | null = null;

  // Drag state
  dragSourceSlotIdx: number | null = null;
  dropTargetSlotIdx: number | null = null;

  // Context menu state
  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuIndex: number | null = null;

  ngOnChanges() {
    if (!this.sheet.runes) this.sheet.runes = [];
  }

  get runes(): (RuneBlock | null)[] { return this.sheet.runes || []; }

  /** Padded slot array: runes at their exact indices, null fills empty slots. Min 10 slots, 5 per row. */
  get paddedSlots(): (RuneBlock | null)[] {
    const runes = this.runes;
    const slotCount = Math.max(10, Math.ceil((runes.length + 5) / 5) * 5);
    const result: (RuneBlock | null)[] = new Array(slotCount).fill(null);
    runes.forEach((rune, i) => { result[i] = rune; });
    return result;
  }

  get selectedRune(): RuneBlock | null {
    if (this.selectedIndex === null) return null;
    return this.runes[this.selectedIndex] ?? null;
  }

  selectRune(index: number) {
    const slot = this.runes[index];
    if (!slot) return;
    this.selectedIndex = this.selectedIndex === index ? null : index;
  }

  openAddDialog() {
    this.editingIndex = null;
    this.showEditor = true;
  }

  openEditDialog() {
    if (this.selectedIndex === null) return;
    const rune = this.runes[this.selectedIndex];
    if (!rune || !rune.identified) return; // Unidentified runes cannot be edited
    this.editingIndex = this.selectedIndex;
    this.showEditor = true;
  }

  onEditorSave(rune: RuneBlock) {
    const newRunes = [...this.runes] as (RuneBlock | null)[];
    if (this.editingIndex !== null) {
      newRunes[this.editingIndex] = rune;
    } else {
      const emptyIdx = newRunes.indexOf(null);
      if (emptyIdx !== -1) {
        newRunes[emptyIdx] = rune;
        this.selectedIndex = emptyIdx;
      } else {
        newRunes.push(rune);
        this.selectedIndex = newRunes.length - 1;
      }
    }
    this._trimAndSave(newRunes);
    this.showEditor = false;
  }

  onEditorCancel() { this.showEditor = false; }

  onEditorDelete() {
    if (this.editingIndex !== null) {
      this._deleteRune(this.editingIndex);
      if (this.selectedIndex === this.editingIndex) this.selectedIndex = null;
    }
    this.showEditor = false;
  }

  private _deleteRune(index: number) {
    const newRunes = [...this.runes] as (RuneBlock | null)[];
    newRunes[index] = null;
    this._trimAndSave(newRunes);
  }

  private _trimAndSave(runes: (RuneBlock | null)[]) {
    while (runes.length > 0 && runes[runes.length - 1] === null) runes.pop();
    this.sheet.runes = runes;
    this.patch.emit({ path: 'runes', value: runes });
  }

  toggleLearned() {
    if (this.selectedIndex === null) return;
    const rune = this.runes[this.selectedIndex];
    if (!rune) return;
    const newRunes = [...this.runes] as (RuneBlock | null)[];
    newRunes[this.selectedIndex] = { ...rune, learned: !rune.learned };
    this.sheet.runes = newRunes;
    this.patch.emit({ path: 'runes', value: newRunes });
  }

  identifyRune(index: number) {
    const rune = this.runes[index];
    if (!rune) return;
    const newRunes = [...this.runes] as (RuneBlock | null)[];
    newRunes[index] = { ...rune, identified: true };
    this.sheet.runes = newRunes;
    this.patch.emit({ path: 'runes', value: newRunes });
  }

  hasStatRequirements(rune: RuneBlock): boolean {
    const r = rune.statRequirements;
    if (!r) return false;
    return !!(r.strength || r.dexterity || r.speed || r.intelligence || r.constitution || r.chill);
  }

  // ─── Drag / Drop (slot-swap, sparse) ──────────────────────────────────────

  onDragStarted(event: CdkDragStart, slotIdx: number) {
    this.dragSourceSlotIdx = slotIdx;
    this.dropTargetSlotIdx = slotIdx;

  }

  onDragMoved(event: CdkDragMove) {
    const els = document.elementsFromPoint(event.pointerPosition.x, event.pointerPosition.y);
    const slotEl = els.find(el =>
      (el as HTMLElement).hasAttribute && (el as HTMLElement).hasAttribute('data-slot-idx')
    ) as HTMLElement | undefined;
    if (slotEl) {
      const idx = parseInt(slotEl.getAttribute('data-slot-idx')!, 10);
      this.dropTargetSlotIdx = isNaN(idx) ? null : idx;
    } else {
      this.dropTargetSlotIdx = null;
    }
  }

  onDragEnded(_event: CdkDragEnd) {
    const src = this.dragSourceSlotIdx;
    const tgt = this.dropTargetSlotIdx;
    this.dragSourceSlotIdx = null;
    this.dropTargetSlotIdx = null;

    if (src === null || tgt === null || src === tgt) return;

    const padded = [...this.paddedSlots] as (RuneBlock | null)[];
    [padded[src], padded[tgt]] = [padded[tgt], padded[src]];

    if (this.selectedIndex === src) this.selectedIndex = tgt;
    else if (this.selectedIndex === tgt) this.selectedIndex = src;

    this._trimAndSave(padded);
  }

  /** CDK drop event — we handle placement via onDragEnded */
  onDrop(_event: CdkDragDrop<(RuneBlock | null)[]>) { /* handled by onDragEnded */ }

  // ─── Context menu ──────────────────────────────────────────────────────────

  onRuneRightClick(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const rune = this.runes[index];
    if (!rune) return;
    this.contextMenuIndex = index;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.showContextMenu = true;
  }

  ctxDelete() {
    if (this.contextMenuIndex === null) return;
    if (this.selectedIndex === this.contextMenuIndex) this.selectedIndex = null;
    this._deleteRune(this.contextMenuIndex);
    this.showContextMenu = false;
    this.contextMenuIndex = null;
  }

  ctxToggleLearned() {
    if (this.contextMenuIndex === null) return;
    const rune = this.runes[this.contextMenuIndex];
    if (!rune) return;
    const newRunes = [...this.runes] as (RuneBlock | null)[];
    newRunes[this.contextMenuIndex] = { ...rune, learned: !rune.learned };
    this.sheet.runes = newRunes;
    this.patch.emit({ path: 'runes', value: newRunes });
    this.showContextMenu = false;
    this.contextMenuIndex = null;
  }

  ctxIdentify() {
    if (this.contextMenuIndex === null) return;
    this.identifyRune(this.contextMenuIndex);
    this.showContextMenu = false;
    this.contextMenuIndex = null;
  }

  get ctxRune(): RuneBlock | null {
    if (this.contextMenuIndex === null) return null;
    return this.runes[this.contextMenuIndex] ?? null;
  }

  @HostListener('document:click')
  onDocumentClick() { this.showContextMenu = false; }

  @HostListener('document:keydown.escape')
  onEscape() { this.showContextMenu = false; }
}