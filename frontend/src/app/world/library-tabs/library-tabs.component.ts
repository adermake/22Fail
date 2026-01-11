import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { ItemComponent } from '../../sheet/item/item.component';
import { RuneComponent } from '../../shared/rune/rune.component';
import { SpellComponent } from '../../sheet/spell/spell.component';
import { SkillComponent } from '../../sheet/skill/skill.component';

@Component({
  selector: 'app-library-tabs',
  imports: [CommonModule, FormsModule, ItemComponent, RuneComponent, SpellComponent, SkillComponent],
  templateUrl: './library-tabs.component.html',
  styleUrl: './library-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryTabsComponent {
  @Input({ required: true }) items: ItemBlock[] = [];
  @Input({ required: true }) runes: RuneBlock[] = [];
  @Input({ required: true }) spells: SpellBlock[] = [];
  @Input({ required: true }) skills: SkillBlock[] = [];
  @Input({ required: true }) dummySheet!: CharacterSheet;
  @Input({ required: true }) editingItems!: Set<number>;
  @Input({ required: true }) editingRunes!: Set<number>;
  @Input({ required: true }) editingSpells!: Set<number>;
  @Input({ required: true }) editingSkills!: Set<number>;

  @Output() addItem = new EventEmitter<void>();
  @Output() addRune = new EventEmitter<void>();
  @Output() addSpell = new EventEmitter<void>();
  @Output() addSkill = new EventEmitter<void>();
  @Output() updateItem = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateRune = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateSpell = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateSkill = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() removeRune = new EventEmitter<number>();
  @Output() removeSpell = new EventEmitter<number>();
  @Output() removeSkill = new EventEmitter<number>();
  @Output() itemEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() runeEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() spellEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() skillEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() dragStart = new EventEmitter<{ event: DragEvent; type: 'item' | 'rune' | 'spell' | 'skill'; index: number }>();

  activeTab: 'items' | 'runes' | 'spells' | 'skills' = 'items';
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

  get filteredSkills() {
    return this.filterAndSort(this.skills, this.searchTerm);
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

    return [...filtered].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  getOriginalIndex(item: any, type: 'items' | 'runes' | 'spells' | 'skills'): number {
    const originalArray = type === 'items' ? this.items :
                          type === 'runes' ? this.runes :
                          type === 'spells' ? this.spells : this.skills;
    return originalArray.indexOf(item);
  }

  // TrackBy functions to prevent unnecessary re-renders
  trackByOriginalIndex(index: number, item: any): number {
    // Use the original index from the unfiltered array as the unique identifier
    const originalIndex = this.getOriginalIndexForTrackBy(item);
    return originalIndex;
  }

  private getOriginalIndexForTrackBy(item: any): number {
    // Check which array this item belongs to based on activeTab
    let originalIndex = this.items.indexOf(item);
    if (originalIndex !== -1) return originalIndex;

    originalIndex = this.runes.indexOf(item);
    if (originalIndex !== -1) return originalIndex;

    originalIndex = this.spells.indexOf(item);
    if (originalIndex !== -1) return originalIndex;

    originalIndex = this.skills.indexOf(item);
    return originalIndex;
  }

  setActiveTab(tab: 'items' | 'runes' | 'spells' | 'skills') {
    this.activeTab = tab;
  }

  onDragStart(event: DragEvent, type: 'item' | 'rune' | 'spell' | 'skill', index: number) {
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

  isSkillEditing(index: number): boolean {
    return this.editingSkills.has(index);
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

  onSkillUpdate(index: number, patch: JsonPatch) {
    this.updateSkill.emit({ index, patch });
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

  onSkillEditingChange(index: number, isEditing: boolean) {
    this.skillEditingChange.emit({ index, isEditing });
  }
}
