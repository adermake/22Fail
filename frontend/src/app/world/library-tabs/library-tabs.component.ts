import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { ItemComponent } from '../../sheet/item/item.component';
import { RuneComponent } from '../../shared/rune/rune.component';
import { SpellComponent } from '../../sheet/spell/spell.component';

@Component({
  selector: 'app-library-tabs',
  imports: [CommonModule, FormsModule, ItemComponent, RuneComponent, SpellComponent],
  templateUrl: './library-tabs.component.html',
  styleUrl: './library-tabs.component.css',
})
export class LibraryTabsComponent {
  @Input({ required: true }) items: ItemBlock[] = [];
  @Input({ required: true }) runes: RuneBlock[] = [];
  @Input({ required: true }) spells: SpellBlock[] = [];
  @Input({ required: true }) dummySheet!: CharacterSheet;
  @Input({ required: true }) editingItems!: Set<number>;
  @Input({ required: true }) editingRunes!: Set<number>;
  @Input({ required: true }) editingSpells!: Set<number>;

  @Output() addItem = new EventEmitter<void>();
  @Output() addRune = new EventEmitter<void>();
  @Output() addSpell = new EventEmitter<void>();
  @Output() updateItem = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateRune = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateSpell = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() removeRune = new EventEmitter<number>();
  @Output() removeSpell = new EventEmitter<number>();
  @Output() itemEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() runeEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() spellEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() dragStart = new EventEmitter<{ event: DragEvent; type: 'item' | 'rune' | 'spell'; index: number }>();

  activeTab: 'items' | 'runes' | 'spells' = 'items';
  searchTerm: string = '';

  get filteredItems() {
    return this.filterAndSort(this.items, this.searchTerm);
  }

  get filteredRunes() {
    return this.filterAndSort(this.runes, this.searchTerm);
  }

  get filteredSpells() {
    return this.filterAndSort(this.spells, this.searchTerm);
  }

  private filterAndSort(array: any[], searchTerm: string) {
    let filtered = array;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = array.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  getOriginalIndex(item: any, type: 'items' | 'runes' | 'spells'): number {
    const originalArray = type === 'items' ? this.items :
                          type === 'runes' ? this.runes : this.spells;
    return originalArray.indexOf(item);
  }

  setActiveTab(tab: 'items' | 'runes' | 'spells') {
    this.activeTab = tab;
  }

  onDragStart(event: DragEvent, type: 'item' | 'rune' | 'spell', index: number) {
    this.dragStart.emit({ event, type, index });
  }

  isItemEditing(index: number): boolean {
    return this.editingItems.has(index);
  }

  isRuneEditing(index: number): boolean {
    return this.editingRunes.has(index);
  }

  isSpellEditing(index: number): boolean {
    return this.editingSpells.has(index);
  }

  onItemUpdate(index: number, patch: JsonPatch) {
    this.updateItem.emit({ index, patch });
  }

  onRuneUpdate(index: number, patch: JsonPatch) {
    this.updateRune.emit({ index, patch });
  }

  onSpellUpdate(index: number, patch: JsonPatch) {
    this.updateSpell.emit({ index, patch });
  }

  onItemEditingChange(index: number, isEditing: boolean) {
    this.itemEditingChange.emit({ index, isEditing });
  }

  onRuneEditingChange(index: number, isEditing: boolean) {
    this.runeEditingChange.emit({ index, isEditing });
  }

  onSpellEditingChange(index: number, isEditing: boolean) {
    this.spellEditingChange.emit({ index, isEditing });
  }
}
