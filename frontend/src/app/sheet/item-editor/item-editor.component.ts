import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ItemBlock, 
  ItemType, 
  StatModifier, 
  ItemCounter, 
  ItemDiceBonus,
  AttachedSkill,
  AttachedSpell 
} from '../../model/item-block.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SkillBlock } from '../../model/skill-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { SkillEditorComponent } from '../../shared/skill-editor/skill-editor.component';
import { SpellEditorComponent } from '../../shared/spell-editor/spell-editor.component';

@Component({
  selector: 'app-item-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, SkillEditorComponent, SpellEditorComponent],
  templateUrl: './item-editor.component.html',
  styleUrl: './item-editor.component.css',
})
export class ItemEditorComponent implements OnInit {
  @Input() item: ItemBlock | null = null; // null = creating new item
  @Input() sheet?: CharacterSheet;
  @Input() availableSkills: { id: string; name: string }[] = [];
  @Input() availableSpells: { id: string; name: string }[] = [];
  @Input() librarySkills: SkillBlock[] = []; // Full library skills for world view
  @Input() librarySpells: SpellBlock[] = []; // Full library spells for world view
  @Input() showLibraryImport = false; // Whether to show library import options
  @Output() save = new EventEmitter<ItemBlock>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  // Working copy of the item
  editItem!: ItemBlock;
  isNewItem = true;

  // Stat modifier UI state
  statModifiers: { [key: string]: number } = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    constitution: 0,
    chill: 0,
    mana: 0,
    life: 0,
    energy: 0
  };

  // Counter being added
  newCounter: ItemCounter = {
    id: '',
    name: '',
    min: 0,
    max: 100,
    current: 0,
    color: '#22c55e'
  };

  // Dice bonus being added
  newDiceBonus: ItemDiceBonus = {
    name: '',
    value: 0
  };

  // Skill/Spell selection
  selectedSkillId = '';
  selectedSpellId = '';

  // Sub-editor state for embedded skills/spells
  showSkillEditor = false;
  editingSkillIndex: number | null = null;
  editingSkill: SkillBlock | null = null;

  showSpellEditor = false;
  editingSpellIndex: number | null = null;
  editingSpell: SpellBlock | null = null;

  // Available colors for counters
  counterColors = [
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#6b7280'  // Gray
  ];

  ngOnInit() {
    if (this.item) {
      // Editing existing item - deep clone
      this.editItem = JSON.parse(JSON.stringify(this.item));
      this.isNewItem = false;
      
      // Initialize stat modifiers from existing
      if (this.editItem.statModifiers) {
        for (const mod of this.editItem.statModifiers) {
          this.statModifiers[mod.stat] = mod.amount;
        }
      }
    } else {
      // Creating new item
      this.editItem = this.createEmptyItem();
      this.isNewItem = true;
    }
    
    // Initialize arrays if not present
    if (!this.editItem.counters) this.editItem.counters = [];
    if (!this.editItem.diceBonuses) this.editItem.diceBonuses = [];
    if (!this.editItem.attachedSkills) this.editItem.attachedSkills = [];
    if (!this.editItem.attachedSpells) this.editItem.attachedSpells = [];
    if (!this.editItem.requirements) this.editItem.requirements = {};
  }

  createEmptyItem(): ItemBlock {
    return {
      id: this.generateId(),
      name: '',
      description: '',
      weight: 0,
      itemType: 'other',
      lost: false,
      broken: false,
      requirements: {},
      hasDurability: false,
      counters: [],
      diceBonuses: [],
      attachedSkills: [],
      attachedSpells: [],
      statModifiers: []
    };
  }

  generateId(): string {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // === Item Type Methods ===
  setItemType(type: ItemType) {
    this.editItem.itemType = type;
    
    // Initialize type-specific defaults
    if (type === 'weapon') {
      if (this.editItem.efficiency === undefined) this.editItem.efficiency = 10;
    } else if (type === 'armor') {
      if (this.editItem.stability === undefined) this.editItem.stability = 10;
      if (this.editItem.armorDebuff === undefined) this.editItem.armorDebuff = 0;
    }
  }

  // === Durability Methods ===
  toggleDurability() {
    this.editItem.hasDurability = !this.editItem.hasDurability;
    if (this.editItem.hasDurability) {
      this.editItem.durability = 100;
      this.editItem.maxDurability = 100;
    } else {
      this.editItem.durability = undefined;
      this.editItem.maxDurability = undefined;
    }
  }

  // === Counter Methods ===
  addCounter() {
    if (!this.newCounter.name.trim()) return;
    
    const counter: ItemCounter = {
      id: 'counter_' + Date.now(),
      name: this.newCounter.name,
      min: this.newCounter.min,
      max: this.newCounter.max,
      current: this.newCounter.current,
      color: this.newCounter.color
    };
    
    this.editItem.counters!.push(counter);
    
    // Reset form
    this.newCounter = {
      id: '',
      name: '',
      min: 0,
      max: 100,
      current: 0,
      color: '#22c55e'
    };
  }

  removeCounter(index: number) {
    this.editItem.counters!.splice(index, 1);
  }

  // === Dice Bonus Methods ===
  addDiceBonus() {
    if (!this.newDiceBonus.name.trim()) return;
    
    this.editItem.diceBonuses!.push({
      name: this.newDiceBonus.name,
      value: this.newDiceBonus.value
    });
    
    // Reset form
    this.newDiceBonus = { name: '', value: 0 };
  }

  removeDiceBonus(index: number) {
    this.editItem.diceBonuses!.splice(index, 1);
  }

  // === Skill/Spell Attachment Methods ===
  attachSkill() {
    if (!this.selectedSkillId) return;
    
    const skill = this.availableSkills.find(s => s.id === this.selectedSkillId);
    if (skill && !this.editItem.attachedSkills!.some(s => s.skillId === skill.id)) {
      this.editItem.attachedSkills!.push({
        skillId: skill.id,
        skillName: skill.name
      });
    }
    this.selectedSkillId = '';
  }

  removeAttachedSkill(index: number) {
    this.editItem.attachedSkills!.splice(index, 1);
  }

  attachSpell() {
    if (!this.selectedSpellId) return;
    
    const spell = this.availableSpells.find(s => s.id === this.selectedSpellId);
    if (spell && !this.editItem.attachedSpells!.some(s => s.spellId === spell.id)) {
      this.editItem.attachedSpells!.push({
        spellId: spell.id,
        spellName: spell.name
      });
    }
    this.selectedSpellId = '';
  }

  removeAttachedSpell(index: number) {
    this.editItem.attachedSpells!.splice(index, 1);
  }

  // === Embedded Skill Methods ===
  openSkillEditor(index: number | null = null) {
    if (index !== null && this.editItem.embeddedSkills && this.editItem.embeddedSkills[index]) {
      this.editingSkillIndex = index;
      this.editingSkill = this.editItem.embeddedSkills[index];
    } else {
      this.editingSkillIndex = null;
      this.editingSkill = null;
    }
    this.showSkillEditor = true;
  }

  closeSkillEditor() {
    this.showSkillEditor = false;
    this.editingSkillIndex = null;
    this.editingSkill = null;
  }

  saveSkill(skill: SkillBlock) {
    if (!this.editItem.embeddedSkills) {
      this.editItem.embeddedSkills = [];
    }
    if (this.editingSkillIndex !== null) {
      // Editing existing
      this.editItem.embeddedSkills[this.editingSkillIndex] = skill;
    } else {
      // Adding new
      this.editItem.embeddedSkills.push(skill);
    }
    this.closeSkillEditor();
  }

  deleteEmbeddedSkill(index: number) {
    if (this.editItem.embeddedSkills) {
      this.editItem.embeddedSkills.splice(index, 1);
    }
  }

  // === Embedded Spell Methods ===
  openSpellEditor(index: number | null = null) {
    if (index !== null && this.editItem.embeddedSpells && this.editItem.embeddedSpells[index]) {
      this.editingSpellIndex = index;
      this.editingSpell = this.editItem.embeddedSpells[index];
    } else {
      this.editingSpellIndex = null;
      this.editingSpell = null;
    }
    this.showSpellEditor = true;
  }

  closeSpellEditor() {
    this.showSpellEditor = false;
    this.editingSpellIndex = null;
    this.editingSpell = null;
  }

  saveSpell(spell: SpellBlock) {
    if (!this.editItem.embeddedSpells) {
      this.editItem.embeddedSpells = [];
    }
    if (this.editingSpellIndex !== null) {
      // Editing existing
      this.editItem.embeddedSpells[this.editingSpellIndex] = spell;
    } else {
      // Adding new
      this.editItem.embeddedSpells.push(spell);
    }
    this.closeSpellEditor();
  }

  deleteEmbeddedSpell(index: number) {
    if (this.editItem.embeddedSpells) {
      this.editItem.embeddedSpells.splice(index, 1);
    }
  }

  // === Library Import Methods ===
  importSkillFromLibrary(librarySkill: SkillBlock) {
    if (!this.editItem.embeddedSkills) {
      this.editItem.embeddedSkills = [];
    }
    // Deep clone to avoid reference issues
    const imported = JSON.parse(JSON.stringify(librarySkill));
    // Mark as enlightened (always usable from item)
    imported.enlightened = true;
    this.editItem.embeddedSkills.push(imported);
  }

  importSpellFromLibrary(librarySpell: SpellBlock) {
    if (!this.editItem.embeddedSpells) {
      this.editItem.embeddedSpells = [];
    }
    // Deep clone to avoid reference issues
    const imported = JSON.parse(JSON.stringify(librarySpell));
    // Set binding to item
    imported.binding = { type: 'item', itemName: this.editItem.name };
    this.editItem.embeddedSpells.push(imported);
  }

  // === Stat Requirements Helpers ===
  hasRequirements(): boolean {
    if (!this.editItem.requirements) return false;
    const reqs = this.editItem.requirements;
    return !!(reqs.strength || reqs.dexterity || reqs.speed || 
              reqs.intelligence || reqs.constitution || reqs.chill);
  }

  // === Save/Cancel ===
  saveItem() {
    if (!this.editItem.name.trim()) {
      alert('Gegenstandsname ist erforderlich');
      return;
    }

    // Build stat modifiers from UI state
    const modifiers: StatModifier[] = [];
    for (const [stat, amount] of Object.entries(this.statModifiers)) {
      if (amount !== 0) {
        modifiers.push({
          stat: stat as StatModifier['stat'],
          amount
        });
      }
    }
    this.editItem.statModifiers = modifiers.length > 0 ? modifiers : undefined;

    // Clean up empty arrays
    if (this.editItem.counters?.length === 0) this.editItem.counters = undefined;
    if (this.editItem.diceBonuses?.length === 0) this.editItem.diceBonuses = undefined;
    if (this.editItem.attachedSkills?.length === 0) this.editItem.attachedSkills = undefined;
    if (this.editItem.attachedSpells?.length === 0) this.editItem.attachedSpells = undefined;

    // Clean up empty requirements
    const reqs = this.editItem.requirements;
    if (reqs && !reqs.strength && !reqs.dexterity && !reqs.speed && 
        !reqs.intelligence && !reqs.constitution && !reqs.chill) {
      this.editItem.requirements = {};
    }

    this.save.emit(this.editItem);
  }

  cancelEdit() {
    this.cancel.emit();
  }

  deleteItem() {
    if (confirm('Item wirklich löschen?')) {
      this.delete.emit();
    }
  }

  // === Helpers ===
  getDiceBonusClass(value: number): string {
    if (value < 0) return 'bonus-good'; // Negative = good (helps roll lower)
    if (value > 0) return 'bonus-bad';  // Positive = bad (makes roll higher)
    return '';
  }

  formatDiceBonusValue(value: number): string {
    if (value > 0) return '+' + value;
    return String(value);
  }
}
