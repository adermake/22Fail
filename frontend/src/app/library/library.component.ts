import { Component, OnInit, OnDestroy, ViewChild, inject, signal, computed } from '@angular/core';
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
import { formatCurrency } from '../model/current-events.model';
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
import { ContextMenuComponent, ContextMenuItem } from '../shared/context-menu/context-menu.component';
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
    SkillEditorComponent,
    ContextMenuComponent
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  store = inject(LibraryStoreService);

  @ViewChild(ContextMenuComponent) contextMenu?: ContextMenuComponent;

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
  
  // Context menu state
  private contextMenuType: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'macro' | 'shop' | 'loot-bundle' | null = null;
  private contextMenuIndex: number = -1;
  
  // Dummy sheet for item rendering
  dummySheet: CharacterSheet = createEmptySheet();
  
  // Utility functions
  formatCurrency = formatCurrency;
  
  private subscription?: Subscription;

  // Computed filtered arrays
  filteredItems = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge items from current library and dependencies
    const items = [...lib.items];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      items.push(...depLib.items);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  });

  filteredRunes = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge runes from current library and dependencies
    const runes = [...lib.runes];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      runes.push(...depLib.runes);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return runes;
    return runes.filter(rune => 
      rune.name.toLowerCase().includes(term) ||
      rune.description?.toLowerCase().includes(term)
    );
  });

  filteredSpells = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge spells from current library and dependencies
    const spells = [...lib.spells];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      spells.push(...depLib.spells);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return spells;
    return spells.filter(spell => 
      spell.name.toLowerCase().includes(term) ||
      spell.description?.toLowerCase().includes(term)
    );
  });

  filteredSkills = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge skills from current library and dependencies
    const skills = [...lib.skills];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      skills.push(...depLib.skills);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return skills;
    return skills.filter(skill => 
      skill.name.toLowerCase().includes(term) ||
      skill.description?.toLowerCase().includes(term)
    );
  });

  filteredStatusEffects = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge status effects from current library and dependencies
    const effects = [...lib.statusEffects];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      effects.push(...depLib.statusEffects);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return effects;
    return effects.filter(effect => 
      effect.name.toLowerCase().includes(term) ||
      effect.description?.toLowerCase().includes(term)
    );
  });

  filteredMacros = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge macros from current library and dependencies
    const macros = [...lib.macroActions];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      macros.push(...depLib.macroActions);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return macros;
    return macros.filter(macro => 
      macro.name.toLowerCase().includes(term) ||
      macro.description?.toLowerCase().includes(term)
    );
  });
  filteredShops = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge shops from current library and dependencies
    const shops = [...lib.shops];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      shops.push(...depLib.shops);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return shops;
    return shops.filter(shop => 
      shop.name.toLowerCase().includes(term) ||
      shop.description?.toLowerCase().includes(term)
    );
  });

  filteredLootBundles = computed(() => {
    const lib = this.library();
    if (!lib) return [];
    
    // Merge loot bundles from current library and dependencies
    const bundles = [...lib.lootBundles];
    const deps = this.dependencyLibraries();
    deps.forEach(depLib => {
      bundles.push(...depLib.lootBundles);
    });
    
    const term = this.searchTerm().toLowerCase();
    if (!term) return bundles;
    return bundles.filter(bundle => 
      bundle.name.toLowerCase().includes(term) ||
      bundle.description?.toLowerCase().includes(term)
    );
  });

  availableLibrariesForDependencies = computed(() => {
    const currentLib = this.library();
    const allLibs = this.store.allLibraries;
    if (!currentLib) return allLibs;
    // Filter out the current library (can't depend on itself)
    return allLibs.filter(lib => lib.id !== currentLib.id);
  });

  /**
   * Recursively resolve all dependencies for a given library
   * Returns an array of library IDs in dependency order (deepest first)
   * Includes circular dependency detection
   */
  private resolveDependencies(libraryId: string, visited = new Set<string>()): string[] {
    if (visited.has(libraryId)) {
      console.warn('[LIBRARY] Circular dependency detected:', libraryId);
      return [];
    }
    
    visited.add(libraryId);
    const allLibs = this.store.allLibraries;
    const lib = allLibs.find(l => l.id === libraryId);
    
    if (!lib || !lib.dependencies || lib.dependencies.length === 0) {
      return [];
    }
    
    const resolved: string[] = [];
    for (const depId of lib.dependencies) {
      // Recursively resolve transitive dependencies first
      const transitive = this.resolveDependencies(depId, new Set(visited));
      transitive.forEach(id => {
        if (!resolved.includes(id)) {
          resolved.push(id);
        }
      });
      
      // Then add this dependency
      if (!resolved.includes(depId)) {
        resolved.push(depId);
      }
    }
    
    return resolved;
  }

  /**
   * Get all dependency libraries for the current library (flattened, with circular detection)
   */
  dependencyLibraries = computed(() => {
    const currentLib = this.library();
    if (!currentLib) return [];
    
    const depIds = this.resolveDependencies(currentLib.id);
    const allLibs = this.store.allLibraries;
    
    return depIds.map(id => allLibs.find(l => l.id === id)).filter(lib => lib !== undefined) as Library[];
  });

  ngOnInit() {
    // Load all libraries for dependency selection
    this.store.loadAllLibraries();
    
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

  // Shop editing
  editingShopId: string | null = null;
  addingDealToShop: string | null = null;
  selectedDealItemType: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' = 'item';
  editingDealData: any = null;

  updateShop(shopId: string, field: string, value: any) {
    this.store.updateShop(shopId, field, value);
    this.saveLibrary();
  }

  startAddingDealToShop(shopId: string) {
    this.addingDealToShop = shopId;
    this.selectedDealItemType = 'item';
    this.editingDealData = null;
  }

  cancelAddingDeal() {
    this.addingDealToShop = null;
    this.editingDealData = null;
  }

  selectItemForDeal(type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect', index: number) {
    const lib = this.library();
    if (!lib) return;

    // Get merged items from library + dependencies
    let sourceData: any;
    let sourceItems: any[] = [];
    
    switch (type) {
      case 'item':
        sourceItems = this.filteredItems();
        sourceData = sourceItems[index];
        break;
      case 'rune':
        sourceItems = this.filteredRunes();
        sourceData = sourceItems[index];
        break;
      case 'spell':
        sourceItems = this.filteredSpells();
        sourceData = sourceItems[index];
        break;
      case 'skill':
        sourceItems = this.filteredSkills();
        sourceData = sourceItems[index];
        break;
      case 'status-effect':
        sourceItems = this.filteredStatusEffects();
        sourceData = sourceItems[index];
        break;
    }

    if (!sourceData) return;

    // Create deal with item data
    this.editingDealData = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: sourceData.name,
      description: sourceData.description,
      [type]: { ...sourceData },
      price: { copper: 0, silver: 0, gold: 1, platinum: 0 },
      isNegotiable: false,
      isReverseDeal: false,
      quantity: undefined,
      sold: 0
    };
  }

  saveDealToShop() {
    if (!this.addingDealToShop || !this.editingDealData) return;
    this.store.addDealToShop(this.addingDealToShop, this.editingDealData);
    this.saveLibrary();
    this.addingDealToShop = null;
    this.editingDealData = null;
  }

  removeDealFromShop(shopId: string, dealId: string) {
    this.store.removeDealFromShop(shopId, dealId);
    this.saveLibrary();
  }

  getDealItemName(deal: any): string {
    if (deal.item) return deal.item.name;
    if (deal.rune) return deal.rune.name;
    if (deal.spell) return deal.spell.name;
    if (deal.skill) return deal.skill.name;
    if (deal.statusEffect) return deal.statusEffect.name;
    return deal.name || 'Unknown';
  }

  getDealItemIcon(deal: any): string {
    if (deal.item) return '📦';
    if (deal.rune) return '🔮';
    if (deal.spell) return '✨';
    if (deal.skill) return '⚔️';
    if (deal.statusEffect) return '💫';
    return '❓';
  }

  // Loot Bundle editing
  editingBundleId: string | null = null;
  addingLootToBundle: string | null = null;
  selectedLootType: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'currency' = 'item';
  tempCurrency: any = { copper: 0, silver: 0, gold: 0, platinum: 0 };

  updateLootBundle(bundleId: string, field: string, value: any) {
    this.store.updateLootBundle(bundleId, field, value);
    this.saveLibrary();
  }

  startAddingLootToBundle(bundleId: string) {
    this.addingLootToBundle = bundleId;
    this.selectedLootType = 'item';
    this.tempCurrency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  }

  cancelAddingLootToBundle() {
    this.addingLootToBundle = null;
  }

  addLootItemToBundle(bundleId: string, type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'currency', index?: number) {
    const lootItem: any = {
      id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type
    };

    if (type === 'currency') {
      lootItem.data = { ...this.tempCurrency };
    } else if (index !== undefined) {
      // Get the actual data from the library
      let sourceData: any;
      const lib = this.library();
      if (!lib) return;

      switch (type) {
        case 'item':
          sourceData = lib.items[index];
          break;
        case 'rune':
          sourceData = lib.runes[index];
          break;
        case 'spell':
          sourceData = lib.spells[index];
          break;
        case 'skill':
          sourceData = lib.skills[index];
          break;
        case 'status-effect':
          sourceData = lib.statusEffects[index];
          break;
      }

      if (sourceData) {
        lootItem.data = { ...sourceData };
      }
    }

    this.store.addLootItemToBundle(bundleId, lootItem);
    this.saveLibrary();
    this.addingLootToBundle = null;
  }

  removeLootItemFromBundle(bundleId: string, itemId: string) {
    this.store.removeLootItemFromBundle(bundleId, itemId);
    this.saveLibrary();
  }

  getLootTypeIcon(type: string): string {
    switch (type) {
      case 'item': return '📦';
      case 'rune': return '🔮';
      case 'spell': return '✨';
      case 'skill': return '⚔️';
      case 'status-effect': return '💫';
      case 'currency': return '💰';
      default: return '❓';
    }
  }

  getLootItemName(lootItem: any): string {
    if (lootItem.type === 'currency') {
      return this.formatCurrency(lootItem.data);
    }
    return lootItem.data?.name || 'Unknown Item';
  }

  // Context Menu
  onContextMenu(event: MouseEvent, type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'macro' | 'shop' | 'loot-bundle', index: number) {
    event.preventDefault();
    this.contextMenuType = type;
    this.contextMenuIndex = index;

    const menuItems: ContextMenuItem[] = [];

    // Edit option
    menuItems.push({
      icon: '✏️',
      label: 'Edit',
      action: 'edit'
    });

    // Duplicate option
    menuItems.push({
      icon: '📋',
      label: 'Duplicate',
      action: 'duplicate'
    });

    // Divider
    menuItems.push({ label: '', action: '', divider: true });

    // Delete option
    menuItems.push({
      icon: '🗑️',
      label: 'Delete',
      action: 'delete'
    });

    this.contextMenu?.show(event.clientX, event.clientY, menuItems);
  }

  handleContextMenuAction(action: string) {
    if (!this.contextMenuType || this.contextMenuIndex < 0) return;

    const lib = this.library();
    if (!lib) return;

    const type = this.contextMenuType;
    const index = this.contextMenuIndex;

    switch (action) {
      case 'edit':
        this.editItem(type, index);
        break;
      case 'duplicate':
        this.duplicateItem(type, index);
        break;
      case 'delete':
        this.deleteItem(type, index);
        break;
    }
  }

  private editItem(type: string, index: number) {
    switch (type) {
      case 'item':
        this.editingItemIndex.set(index);
        break;
      case 'rune':
        this.editingRuneIndex.set(index);
        break;
      case 'spell':
        this.editingSpellIndex.set(index);
        break;
      case 'skill':
        this.editingSkillIndex.set(index);
        break;
      case 'status-effect':
        this.editingStatusEffectIndex.set(index);
        break;
      case 'macro':
        this.editingMacroIndex.set(index);
        break;
      case 'shop':
        // For shops, set the editing index (you may need to add editingShopIndex if not present)
        // Shops have inline editors already
        break;
      case 'loot-bundle':
        // Similar for loot bundles
        break;
    }
  }

  private duplicateItem(type: string, index: number) {
    const lib = this.library();
    if (!lib) return;

    switch (type) {
      case 'item': {
        const original = lib.items[index];
        if (!original) return;
        const copy: ItemBlock = JSON.parse(JSON.stringify(original));
        copy.id = `item_${Date.now()}`;
        copy.name = `${copy.name} (Copy)`;
        this.store.addItem(copy);
        break;
      }
      case 'rune': {
        const original = lib.runes[index];
        if (!original) return;
        const copy: RuneBlock = JSON.parse(JSON.stringify(original));
        copy.name = `${copy.name} (Copy)`;
        this.store.addRune(copy);
        break;
      }
      case 'spell': {
        const original = lib.spells[index];
        if (!original) return;
        const copy: SpellBlock = JSON.parse(JSON.stringify(original));
        copy.name = `${copy.name} (Copy)`;
        this.store.addSpell(copy);
        break;
      }
      case 'skill': {
        const original = lib.skills[index];
        if (!original) return;
        const copy: SkillBlock = JSON.parse(JSON.stringify(original));
        copy.name = `${copy.name} (Copy)`;
        this.store.addSkill(copy);
        break;
      }
      case 'status-effect': {
        const original = lib.statusEffects[index];
        if (!original) return;
        const copy: StatusEffect = JSON.parse(JSON.stringify(original));
        copy.id = `status_${Date.now()}`;
        copy.name = `${copy.name} (Copy)`;
        this.store.addStatusEffect(copy);
        break;
      }
      case 'macro': {
        const original = lib.macroActions[index];
        if (!original) return;
        const copy: MacroAction = JSON.parse(JSON.stringify(original));
        copy.id = `macro_${Date.now()}`;
        copy.name = `${copy.name} (Copy)`;
        this.store.addMacroAction(copy);
        break;
      }
      case 'shop': {
        const original = lib.shops[index];
        if (!original) return;
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = `shop_${Date.now()}`;
        copy.name = `${copy.name} (Copy)`;
        lib.shops.push(copy);
        lib.updatedAt = Date.now();
        this.library.set({ ...lib });
        break;
      }
      case 'loot-bundle': {
        const original = lib.lootBundles[index];
        if (!original) return;
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = `loot_${Date.now()}`;
        copy.name = `${copy.name} (Copy)`;
        lib.lootBundles.push(copy);
        lib.updatedAt = Date.now();
        this.library.set({ ...lib });
        break;
      }
    }
    this.saveLibrary();
  }

  private deleteItem(type: string, index: number) {
    const lib = this.library();
    if (!lib) return;

    switch (type) {
      case 'item': {
        const item = lib.items[index];
        if (item?.id) {
          this.store.removeItem(item.id);
        }
        break;
      }
      case 'rune': {
        const rune = lib.runes[index];
        if (rune) {
          this.store.removeRune(rune.name);
        }
        break;
      }
      case 'spell': {
        const spell = lib.spells[index];
        if (spell) {
          this.store.removeSpell(spell.name);
        }
        break;
      }
      case 'skill': {
        const skill = lib.skills[index];
        if (skill) {
          this.store.removeSkill(skill.name);
        }
        break;
      }
      case 'status-effect': {
        const statusEffect = lib.statusEffects[index];
        if (statusEffect?.id) {
          this.store.removeStatusEffect(statusEffect.id);
        }
        break;
      }
      case 'macro': {
        const macro = lib.macroActions[index];
        if (macro?.id) {
          this.store.removeMacroAction(macro.id);
        }
        break;
      }
      case 'shop': {
        const shop = lib.shops[index];
        if (shop?.id) {
          this.store.removeShop(shop.id);
        }
        break;
      }
      case 'loot-bundle': {
        const bundle = lib.lootBundles[index];
        if (bundle?.id) {
          this.store.removeLootBundle(bundle.id);
        }
        break;
      }
    }
    this.saveLibrary();
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
