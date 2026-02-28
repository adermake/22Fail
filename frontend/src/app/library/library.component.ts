import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LibraryStoreService } from '../services/library-store.service';
import { Library } from '../model/library.model';
import { ItemBlock } from '../model/item-block.model';
import { RuneBlock } from '../model/rune-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { SkillBlock } from '../model/skill-block.model';
import { StatusEffect, createEmptyStatusEffect } from '../model/status-effect.model';
import { MacroAction, createEmptyMacroAction } from '../model/macro-action.model';
import { JsonPatch } from '../model/json-patch.model';
import { CardComponent } from '../shared/card/card.component';
import { ItemEditorComponent } from '../sheet/item-editor/item-editor.component';
import { ItemComponent } from '../sheet/item/item.component';
import { RuneComponent } from '../shared/rune/rune.component';
import { RuneEditorComponent } from '../shared/rune-editor/rune-editor.component';
import { SpellComponent } from '../sheet/spell/spell.component';
import { SpellEditorComponent } from '../shared/spell-editor/spell-editor.component';
import { SkillComponent } from '../sheet/skill/skill.component';
import { SkillEditorComponent } from '../shared/skill-editor/skill-editor.component';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ItemComponent,
    ItemEditorComponent,
    RuneComponent,
    RuneEditorComponent,
    SpellComponent,
    SpellEditorComponent,
    SkillComponent,
    SkillEditorComponent
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  store = inject(LibraryStoreService);

  libraryId = signal<string>('');
  library = signal<Library | null>(null);
  activeTab = signal<'items' | 'runes' | 'spells' | 'skills' | 'status-effects' | 'macros' | 'shops' | 'loot-bundles'>('items');
  searchTerm = signal<string>('');
  
  // Editing state - for modal editors
  editingItemIndex = signal<number | null>(null);
  editingRuneIndex = signal<number | null>(null);
  editingSpellIndex = signal<number | null>(null);
  editingSkillIndex = signal<number | null>(null);
  editingStatusEffectIndex = signal<number | null>(null);
  editingMacroIndex = signal<number | null>(null);
  
  // Editing sets - for inline editing with drawing
  editingItems = signal<Set<number>>(new Set());
  editingRunes = signal<Set<number>>(new Set());
  editingSpells = signal<Set<number>>(new Set());
  editingSkills = signal<Set<number>>(new Set());
  
  // Dummy sheet for item rendering
  dummySheet: CharacterSheet = createEmptySheet();
  
  private subscription?: Subscription;

  // Computed filtered arrays
  filteredItems = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.items;
    return lib.items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  });

  filteredRunes = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.runes;
    return lib.runes.filter(rune => 
      rune.name.toLowerCase().includes(term) ||
      rune.description?.toLowerCase().includes(term)
    );
  });

  filteredSpells = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.spells;
    return lib.spells.filter(spell => 
      spell.name.toLowerCase().includes(term) ||
      spell.description?.toLowerCase().includes(term)
    );
  });

  filteredSkills = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.skills;
    return lib.skills.filter(skill => 
      skill.name.toLowerCase().includes(term) ||
      skill.description?.toLowerCase().includes(term)
    );
  });

  filteredStatusEffects = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.statusEffects;
    return lib.statusEffects.filter(se => 
      se.name.toLowerCase().includes(term) ||
      se.description?.toLowerCase().includes(term)
    );
  });

  filteredMacros = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.macroActions;
    return lib.macroActions.filter(macro => 
      macro.name.toLowerCase().includes(term) ||
      macro.description?.toLowerCase().includes(term)
    );
  });
  filteredShops = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.shops;
    return lib.shops.filter(shop => 
      shop.name.toLowerCase().includes(term) ||
      shop.description?.toLowerCase().includes(term)
    );
  });

  filteredLootBundles = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return lib.lootBundles;
    return lib.lootBundles.filter(bundle => 
      bundle.name.toLowerCase().includes(term) ||
      bundle.description?.toLowerCase().includes(term)
    );
  });
  ngOnInit() {
    // Get library ID from route
    this.route.params.subscribe(params => {
      const id = params['libraryId'];
      if (id) {
        this.libraryId.set(id);
        this.loadLibrary(id);
      }
    });

    // Handle query parameters for tab and highlight
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab.set(params['tab'] as any);
      }
      if (params['highlightId']) {
        // TODO: Scroll to and highlight the item with this ID
        // This could be implemented with ViewChild and scrollIntoView
        console.log('Highlighting item:', params['highlightId']);
      }
    });

    // Subscribe to library changes
    this.subscription = this.store.library$.subscribe(lib => {
      this.library.set(lib);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  async loadLibrary(id: string) {
    await this.store.loadLibrary(id);
  }

  async saveLibrary() {
    await this.store.saveLibrary();
  }

  updateTags(value: string) {
    const lib = this.library();
    if (lib) {
      lib.tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
  }

  // Items
  addItem() {
    const newItem = new ItemBlock();
    newItem.id = `item_${Date.now()}`;
    newItem.name = 'Neues Item';
    newItem.description = '';
    newItem.weight = 1;
    newItem.requirements = {};
    newItem.lost = false;
    newItem.isIdentified = false; // New items default to unidentified
    this.store.addItem(newItem);
    this.saveLibrary();
  }

  openItemEditor(index: number) {
    this.editingItemIndex.set(index);
  }

  closeItemEditor() {
    this.editingItemIndex.set(null);
  }
  
  toggleItemEditing(index: number) {
    const editing = this.editingItems();
    if (editing.has(index)) {
      editing.delete(index);
    } else {
      editing.add(index);
    }
    this.editingItems.set(new Set(editing));
  }
  
  isItemEditing(index: number): boolean {
    return this.editingItems().has(index);
  }

  updateItem(index: number, updates: Partial<ItemBlock>) {
    const lib = this.library();
    if (!lib) return;
    const item = lib.items[index];
    if (item && item.id) {
      this.store.updateItem(item.id, updates);
      this.saveLibrary();
    }
  }

  handleItemPatch(index: number, patch: JsonPatch) {
    const lib = this.library();
    if (!lib) return;
    const item = lib.items[index];
    if (item) {
      this.applyPatch(item, patch);
      if (item.id) {
        this.store.updateItem(item.id, { [patch.path]: patch.value } as Partial<ItemBlock>);
      }
      this.saveLibrary();
    }
  }

  removeItem(index: number) {
    const lib = this.library();
    if (!lib) return;
    const item = lib.items[index];
    if (item && item.id) {
      this.store.removeItem(item.id);
      this.saveLibrary();
    }
  }

  // Runes
  addRune() {
    const newRune = new RuneBlock();
    newRune.name = 'New Rune';
    newRune.description = '';
    newRune.drawing = '';
    newRune.tags = [];
    this.store.addRune(newRune);
    this.saveLibrary();
  }

  openRuneEditor(index: number) {
    this.editingRuneIndex.set(index);
  }

  closeRuneEditor() {
    this.editingRuneIndex.set(null);
  }
  
  toggleRuneEditing(index: number) {
    const editing = this.editingRunes();
    if (editing.has(index)) {
      editing.delete(index);
    } else {
      editing.add(index);
    }
    this.editingRunes.set(new Set(editing));
  }
  
  isRuneEditing(index: number): boolean {
    return this.editingRunes().has(index);
  }

  updateRune(index: number, updates: Partial<RuneBlock>) {
    const lib = this.library();
    if (!lib) return;
    const rune = lib.runes[index];
    if (rune) {
      Object.assign(rune, updates);
      this.saveLibrary();
    }
  }

  handleRunePatch(index: number, patch: JsonPatch) {
    const lib = this.library();
    if (!lib) return;
    const rune = lib.runes[index];
    if (rune) {
      this.applyPatch(rune, patch);
      this.saveLibrary();
    }
  }

  removeRune(index: number) {
    const lib = this.library();
    if (!lib) return;
    const rune = lib.runes[index];
    if (rune) {
      this.store.removeRune(rune.name);
      this.saveLibrary();
    }
  }

  // Spells
  addSpell() {
    const newSpell = new SpellBlock();
    newSpell.name = 'New Spell';
    newSpell.description = '';
    newSpell.tags = [];
    newSpell.binding = { type: 'learned' };
    this.store.addSpell(newSpell);
    this.saveLibrary();
  }

  openSpellEditor(index: number) {
    this.editingSpellIndex.set(index);
  }

  closeSpellEditor() {
    this.editingSpellIndex.set(null);
  }
  
  toggleSpellEditing(index: number) {
    const editing = this.editingSpells();
    if (editing.has(index)) {
      editing.delete(index);
    } else {
      editing.add(index);
    }
    this.editingSpells.set(new Set(editing));
  }
  
  isSpellEditing(index: number): boolean {
    return this.editingSpells().has(index);
  }

  updateSpell(index: number, updates: Partial<SpellBlock>) {
    const lib = this.library();
    if (!lib) return;
    const spell = lib.spells[index];
    if (spell) {
      Object.assign(spell, updates);
      this.saveLibrary();
    }
  }

  handleSpellPatch(index: number, patch: JsonPatch) {
    const lib = this.library();
    if (!lib) return;
    const spell = lib.spells[index];
    if (spell) {
      this.applyPatch(spell, patch);
      this.saveLibrary();
    }
  }

  removeSpell(index: number) {
    const lib = this.library();
    if (!lib) return;
    const spell = lib.spells[index];
    if (spell) {
      this.store.removeSpell(spell.name);
      this.saveLibrary();
    }
  }

  // Skills
  addSkill() {
    const newSkill = new SkillBlock();
    newSkill.name = 'New Skill';
    newSkill.description = '';
    newSkill.class = 'General';
    newSkill.type = 'passive';
    newSkill.enlightened = false;
    this.store.addSkill(newSkill);
    this.saveLibrary();
  }

  openSkillEditor(index: number) {
    this.editingSkillIndex.set(index);
  }

  closeSkillEditor() {
    this.editingSkillIndex.set(null);
  }
  
  toggleSkillEditing(index: number) {
    const editing = this.editingSkills();
    if (editing.has(index)) {
      editing.delete(index);
    } else {
      editing.add(index);
    }
    this.editingSkills.set(new Set(editing));
  }
  
  isSkillEditing(index: number): boolean {
    return this.editingSkills().has(index);
  }

  updateSkill(index: number, updates: Partial<SkillBlock>) {
    const lib = this.library();
    if (!lib) return;
    const skill = lib.skills[index];
    if (skill) {
      Object.assign(skill, updates);
      this.saveLibrary();
    }
  }

  handleSkillPatch(index: number, patch: JsonPatch) {
    const lib = this.library();
    if (!lib) return;
    const skill = lib.skills[index];
    if (skill) {
      this.applyPatch(skill, patch);
      this.saveLibrary();
    }
  }

  removeSkill(index: number) {
    const lib = this.library();
    if (!lib) return;
    const skill = lib.skills[index];
    if (skill) {
      this.store.removeSkill(skill.name);
      this.saveLibrary();
    }
  }

  // Status Effects
  addStatusEffect() {
    const newStatusEffect = createEmptyStatusEffect();
    this.store.addStatusEffect(newStatusEffect);
    this.saveLibrary();
  }

  removeStatusEffect(index: number) {
    const lib = this.library();
    if (!lib) return;
    const se = lib.statusEffects[index];
    if (se) {
      this.store.removeStatusEffect(se.id);
      this.saveLibrary();
    }
  }

  // Macro Actions
  addMacroAction() {
    const newMacro = createEmptyMacroAction();
    this.store.addMacroAction(newMacro);
    this.saveLibrary();
  }

  removeMacroAction(index: number) {
    const lib = this.library();
    if (!lib) return;
    const macro = lib.macroActions[index];
    if (macro) {
      this.store.removeMacroAction(macro.id);
      this.saveLibrary();
    }
  }

  // Shops
  addShop() {
    const newShop: any = {
      id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'shop',
      name: 'New Shop',
      description: '',
      deals: []
    };
    this.store.addShop(newShop);
    this.saveLibrary();
  }

  removeShop(index: number) {
    const lib = this.library();
    if (!lib) return;
    const shop = lib.shops[index];
    if (shop) {
      this.store.removeShop(shop.id);
      this.saveLibrary();
    }
  }

  // Loot Bundles
  addLootBundle() {
    const newBundle: any = {
      id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'loot',
      name: 'New Loot Bundle',
      description: '',
      items: []
    };
    this.store.addLootBundle(newBundle);
    this.saveLibrary();
  }

  removeLootBundle(index: number) {
    const lib = this.library();
    if (!lib) return;
    const bundle = lib.lootBundles[index];
    if (bundle) {
      this.store.removeLootBundle(bundle.id);
      this.saveLibrary();
    }
  }

  // Navigation
  goToWorld(worldName: string) {
    this.router.navigate(['/world', worldName]);
  }

  back() {
    this.router.navigate(['/']);
  }

  // Helper method to apply JSON patches
  private applyPatch(target: any, patch: JsonPatch) {
    const pathParts = patch.path.split('.');
    let current = target;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    // Set the final property
    const finalKey = pathParts[pathParts.length - 1];
    current[finalKey] = patch.value;
  }
}
