import { DragDropModule, CdkDragStart, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RuneBlock, RuneStatRequirements } from '../../model/rune-block.model';
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

  // Drag centering for rune chip preview
  dragPreviewOffsetX = 0;
  dragPreviewOffsetY = 0;
  private readonly CHIP_HALF_W = 90;  // horizontal chip ~180px wide
  private readonly CHIP_HALF_H = 20;  // horizontal chip ~40px tall

  ngOnChanges() {
    if (!this.sheet.runes) this.sheet.runes = [];
  }

  get runes(): RuneBlock[] { return this.sheet.runes || []; }

  /** Padded slot array: runes packed to front, null fills the rest (at least 2 rows of 6). */
  get paddedSlots(): (RuneBlock | null)[] {
    const runes = this.runes;
    const slotCount = Math.max(12, Math.ceil((runes.length + 6) / 6) * 6);
    const result: (RuneBlock | null)[] = new Array(slotCount).fill(null);
    runes.forEach((rune, i) => { result[i] = rune; });
    return result;
  }

  get selectedRune(): RuneBlock | null {
    return this.selectedIndex !== null ? this.runes[this.selectedIndex] : null;
  }

  selectRune(index: number) {
    this.selectedIndex = this.selectedIndex === index ? null : index;
  }

  openAddDialog() {
    this.editingIndex = null;
    this.showEditor = true;
  }

  openEditDialog() {
    if (this.selectedIndex !== null) {
      this.editingIndex = this.selectedIndex;
      this.showEditor = true;
    }
  }

  onEditorSave(rune: RuneBlock) {
    const newRunes = [...this.runes];
    if (this.editingIndex !== null) {
      newRunes[this.editingIndex] = rune;
    } else {
      newRunes.push(rune);
      this.selectedIndex = newRunes.length - 1;
    }
    this.sheet.runes = newRunes;
    this.patch.emit({ path: 'runes', value: newRunes });
    this.showEditor = false;
  }

  onEditorCancel() { this.showEditor = false; }

  onEditorDelete() {
    if (this.editingIndex !== null) {
      const newRunes = this.runes.filter((_, i) => i !== this.editingIndex);
      this.sheet.runes = newRunes;
      this.patch.emit({ path: 'runes', value: newRunes });
      if (this.selectedIndex === this.editingIndex) this.selectedIndex = null;
      else if (this.selectedIndex !== null && this.editingIndex !== null && this.selectedIndex > this.editingIndex) {
        this.selectedIndex--;
      }
    }
    this.showEditor = false;
  }

  toggleLearned() {
    if (this.selectedIndex === null) return;
    const newRunes = [...this.runes];
    newRunes[this.selectedIndex] = { ...newRunes[this.selectedIndex], learned: !newRunes[this.selectedIndex].learned };
    this.sheet.runes = newRunes;
    this.patch.emit({ path: 'runes', value: newRunes });
  }

  hasStatRequirements(rune: RuneBlock): boolean {
    const r = rune.statRequirements;
    if (!r) return false;
    return !!(r.strength || r.dexterity || r.speed || r.intelligence || r.constitution || r.chill);
  }

  onDragStarted(event: CdkDragStart, _idx: number) {
    const nativeEvent = event.event as MouseEvent;
    const rect = (event.source.element.nativeElement as HTMLElement).getBoundingClientRect();
    const grabX = nativeEvent.clientX - rect.left;
    const grabY = nativeEvent.clientY - rect.top;
    this.dragPreviewOffsetX = grabX - this.CHIP_HALF_W;
    this.dragPreviewOffsetY = grabY - this.CHIP_HALF_H;
  }

  onDrop(event: CdkDragDrop<RuneBlock[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const newRunes = [...this.runes];
    moveItemInArray(newRunes, event.previousIndex, event.currentIndex);
    // Adjust selectedIndex after reorder
    if (this.selectedIndex !== null) {
      const s = this.selectedIndex;
      const f = event.previousIndex;
      const t = event.currentIndex;
      if (s === f) {
        this.selectedIndex = t;
      } else if (f < t && s > f && s <= t) {
        this.selectedIndex--;
      } else if (f > t && s >= t && s < f) {
        this.selectedIndex++;
      }
    }
    this.sheet.runes = newRunes;
    this.patch.emit({ path: 'runes', value: newRunes });
  }
}