import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { StatusEffect } from '../../model/status-effect.model';
import { ShopEvent, LootBundleEvent, Currency, LootItem } from '../../model/current-events.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { MaterialBlock, ForgeTrait } from '../../model/forging.model';
import { ItemComponent } from '../../sheet/item/item.component';
import { SpellComponent } from '../../sheet/spell/spell.component';
import { SkillComponent } from '../../sheet/skill/skill.component';

/**
 * Asset Browser Component (World View)
 * 
 * This is the READ-ONLY tabbed view in World that shows aggregated content from all linked libraries.
 * Players/DM can drag items from here to send to characters.
 * 
 * To EDIT a library, click the ✏️ button in Library Selector → opens Library Editor (LibraryEditorComponent)
 */
@Component({
  selector: 'app-asset-browser',
  imports: [CommonModule, FormsModule, ItemComponent, SpellComponent, SkillComponent],
  templateUrl: './asset-browser.component.html',
  styleUrl: './asset-browser.component.css'
})
export class AssetBrowserComponent implements OnChanges {
  @Input({ required: true }) items: ItemBlock[] = [];
  @Input({ required: true }) runes: RuneBlock[] = [];
  @Input({ required: true }) spells: SpellBlock[] = [];
  @Input({ required: true }) skills: SkillBlock[] = [];
  @Input() statusEffects: StatusEffect[] = [];
  @Input() shops: ShopEvent[] = [];
  @Input() lootBundles: LootBundleEvent[] = [];
  @Input() materials: MaterialBlock[] = [];
  @Input() forgeTraits: ForgeTrait[] = [];
  @Input({ required: true }) dummySheet!: CharacterSheet;
  @Input({ required: true }) editingItems!: Set<number>;
  @Input({ required: true }) editingRunes!: Set<number>;
  @Input({ required: true }) editingSpells!: Set<number>;
  @Input({ required: true }) editingSkills!: Set<number>;
  @Input() editingStatusEffects: Set<number> = new Set();
  @Input() readonly: boolean = false; // When true, hides add/delete buttons

  @Output() addItem = new EventEmitter<void>();
  @Output() addRune = new EventEmitter<void>();
  @Output() addSpell = new EventEmitter<void>();
  @Output() addSkill = new EventEmitter<void>();
  @Output() addStatusEffect = new EventEmitter<void>();
  @Output() openItemEditor = new EventEmitter<number>();
  @Output() openRuneEditor = new EventEmitter<number>();
  @Output() openSpellEditor = new EventEmitter<number>();
  @Output() openSkillEditor = new EventEmitter<number>();
  @Output() openStatusEffectEditor = new EventEmitter<number>();
  @Output() updateItem = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateRune = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateSpell = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateSkill = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() updateStatusEffect = new EventEmitter<{ index: number; patch: JsonPatch }>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() removeRune = new EventEmitter<number>();
  @Output() removeSpell = new EventEmitter<number>();
  @Output() removeSkill = new EventEmitter<number>();
  @Output() removeStatusEffect = new EventEmitter<number>();
  @Output() itemEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() runeEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() spellEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() skillEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() statusEffectEditingChange = new EventEmitter<{ index: number; isEditing: boolean }>();
  @Output() dragStart = new EventEmitter<{ event: DragEvent; type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'shop' | 'loot-bundle'; index: number }>();
  @Output() contextMenuRequest = new EventEmitter<{ event: MouseEvent; type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect'; index: number }>();

  activeTab: 'items' | 'runes' | 'spells' | 'skills' | 'status-effects' | 'shops' | 'loot-bundles' | 'knowledge' = 'items';
  activeKnowledgeTab: 'material' | 'forge-trait' = 'material';
  private _searchTerm: string = '';

  // Per-tab filters
  itemTypeFilter: string = '';
  skillTypeFilter: string = '';
  runeTagFilter: string = '';

  filteredItems: any[] = [];
  filteredRunes: any[] = [];
  filteredSpells: any[] = [];
  filteredSkills: any[] = [];
  filteredStatusEffects: any[] = [];
  filteredShops: any[] = [];
  filteredBundles: any[] = [];
  filteredMaterials: MaterialBlock[] = [];
  filteredForgeTraits: ForgeTrait[] = [];

  // Track previous array lengths to detect add/remove vs patch
  private prevItemsLength = 0;
  private prevRunesLength = 0;
  private prevSpellsLength = 0;
  private prevSkillsLength = 0;
  private prevStatusEffectsLength = 0;
  private prevShopsLength = 0;
  private prevBundlesLength = 0;

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
    this.updateFilteredArrays();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only update filtered arrays if array lengths changed (add/remove)
    // Don't update on content patches (which would recreate DOM and lose focus)
    let shouldUpdate = false;

    if (changes['items'] && this.items.length !== this.prevItemsLength) {
      this.prevItemsLength = this.items.length;
      shouldUpdate = true;
    }
    if (changes['runes'] && this.runes.length !== this.prevRunesLength) {
      this.prevRunesLength = this.runes.length;
      shouldUpdate = true;
    }
    if (changes['spells'] && this.spells.length !== this.prevSpellsLength) {
      this.prevSpellsLength = this.spells.length;
      shouldUpdate = true;
    }
    if (changes['skills'] && this.skills.length !== this.prevSkillsLength) {
      this.prevSkillsLength = this.skills.length;
      shouldUpdate = true;
    }
    if (changes['statusEffects'] && this.statusEffects.length !== this.prevStatusEffectsLength) {
      this.prevStatusEffectsLength = this.statusEffects.length;
      shouldUpdate = true;
    }
    if (changes['shops'] && this.shops.length !== this.prevShopsLength) {
      this.prevShopsLength = this.shops.length;
      shouldUpdate = true;
    }
    if (changes['lootBundles'] && this.lootBundles.length !== this.prevBundlesLength) {
      this.prevBundlesLength = this.lootBundles.length;
      shouldUpdate = true;
    }
    if (changes['materials'] || changes['forgeTraits']) {
      shouldUpdate = true;
    }

    // Always update on first change
    if (changes['items']?.firstChange || changes['runes']?.firstChange ||
        changes['spells']?.firstChange || changes['skills']?.firstChange ||
        changes['statusEffects']?.firstChange || changes['shops']?.firstChange ||
        changes['lootBundles']?.firstChange || changes['materials']?.firstChange ||
        changes['forgeTraits']?.firstChange) {
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      this.updateFilteredArrays();
    }
  }

  private updateFilteredArrays() {
    const term = this._searchTerm;
    this.filteredItems = this.filterItems(this.items, term);
    this.filteredRunes = this.filterRunes(this.runes, term);
    this.filteredSpells = this.filterAndSort(this.spells, term);
    this.filteredSkills = this.filterSkills(this.skills, term);
    this.filteredStatusEffects = this.filterAndSort(this.statusEffects || [], term);
    this.filteredShops = this.filterAndSort(this.shops || [], term);
    this.filteredBundles = this.filterAndSort(this.lootBundles || [], term);
    this.filteredMaterials = this.filterKnowledge(this.materials || [], term);
    this.filteredForgeTraits = this.filterKnowledge(this.forgeTraits || [], term);
  }

  private filterItems(array: ItemBlock[], searchTerm: string): ItemBlock[] {
    let filtered: ItemBlock[] = array;
    if (this.itemTypeFilter) {
      filtered = filtered.filter(item => item.itemType === this.itemTypeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }
    return [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  private filterRunes(array: RuneBlock[], searchTerm: string): RuneBlock[] {
    let filtered: RuneBlock[] = array;
    if (this.runeTagFilter) {
      filtered = filtered.filter(r => r.tags?.includes(this.runeTagFilter));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.tags?.some(t => t.toLowerCase().includes(term))
      );
    }
    return [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  private filterSkills(array: SkillBlock[], searchTerm: string): SkillBlock[] {
    let filtered: SkillBlock[] = array;
    if (this.skillTypeFilter) {
      filtered = filtered.filter(s => s.type === this.skillTypeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }
    const typeOrder: Record<string, number> = { 'dice_bonus': 0, 'active': 1, 'passive': 2, 'stat_bonus': 3 };
    return [...filtered].sort((a, b) => {
      const oA = typeOrder[a.type ?? ''] ?? 4;
      const oB = typeOrder[b.type ?? ''] ?? 4;
      if (oA !== oB) return oA - oB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  private filterKnowledge<T extends { name?: string; description?: string }>(array: T[], searchTerm: string): T[] {
    if (!searchTerm) return [...array].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const term = searchTerm.toLowerCase();
    return array
      .filter(item => item.name?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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

  getOriginalIndex(item: any, type: 'items' | 'runes' | 'spells' | 'skills' | 'status-effects'): number {
    const originalArray = type === 'items' ? this.items :
                          type === 'runes' ? this.runes :
                          type === 'spells' ? this.spells : 
                          type === 'skills' ? this.skills : this.statusEffects;
    return originalArray.indexOf(item);
  }


  setActiveTab(tab: 'items' | 'runes' | 'spells' | 'skills' | 'status-effects' | 'shops' | 'loot-bundles' | 'knowledge') {
    this.activeTab = tab;
  }

  setActiveKnowledgeTab(tab: 'material' | 'forge-trait') {
    this.activeKnowledgeTab = tab;
  }

  onItemTypeFilterChange() {
    this.filteredItems = this.filterItems(this.items, this._searchTerm);
  }

  onSkillTypeFilterChange() {
    this.filteredSkills = this.filterSkills(this.skills, this._searchTerm);
  }

  onRuneTagFilterChange() {
    this.filteredRunes = this.filterRunes(this.runes, this._searchTerm);
  }

  getRuneTypeLabel(runeType?: string): string {
    const labels: Record<string, string> = {
      medium: 'Medium',
      formung: 'Formung',
      selektor: 'Selektor',
      custom: 'Custom',
    };
    return runeType ? (labels[runeType] ?? runeType) : 'Legacy';
  }

  getMaterialCategoryLabel(m: MaterialBlock): string {
    const cats: string[] = [];
    if (m.canBeWeaponMaterial) cats.push('Waffe');
    if (m.canBeArmorMaterial) cats.push('Rüstung');
    return cats.join(' / ') || 'Allgemein';
  }

  getRarityLabel(rarity?: string): string {
    const map: Record<string, string> = { COMMON: 'Häufig', RARE: 'Selten', LEGENDARY: 'Legendär' };
    return rarity ? (map[rarity] ?? rarity) : '';
  }

  getUniqueRuneTags(): string[] {
    const tags = new Set<string>();
    this.runes.forEach(r => r.tags?.forEach(t => tags.add(t)));
    return [...tags].sort();
  }

  getSkillTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      active: 'Aktiv', passive: 'Passiv', dice_bonus: 'Würfelbonus', stat_bonus: 'Wertbonus'
    };
    return type ? (labels[type] ?? type) : '';
  }

  onDragStart(event: DragEvent, type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'shop' | 'loot-bundle', index: number) {
    this.dragStart.emit({ event, type, index });
  }

  onContextMenu(event: MouseEvent, type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect', index: number) {
    event.preventDefault();
    this.contextMenuRequest.emit({ event, type, index });
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

  isStatusEffectEditing(index: number): boolean {
    return this.editingStatusEffects.has(index);
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

  onStatusEffectUpdate(index: number, patch: JsonPatch) {
    this.updateStatusEffect.emit({ index, patch });
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

  onStatusEffectEditingChange(index: number, isEditing: boolean) {
    this.statusEffectEditingChange.emit({ index, isEditing });
  }

  // ==================== SHOP/BUNDLE HELPERS ====================

  formatCurrency(currency: Currency): string {
    const parts: string[] = [];
    if (currency.platinum > 0) parts.push(`${currency.platinum}p`);
    if (currency.gold > 0) parts.push(`${currency.gold}g`);
    if (currency.silver > 0) parts.push(`${currency.silver}s`);
    if (currency.copper > 0) parts.push(`${currency.copper}c`);
    return parts.length > 0 ? parts.join(' ') : '0c';
  }

  getLootTypeIcon(type: string): string {
    switch (type) {
      case 'item': return '⚔️';
      case 'rune': return '🔮';
      case 'spell': return '✨';
      case 'skill': return '🎯';
      case 'status-effect': return '💫';
      case 'currency': return '💰';
      default: return '❓';
    }
  }

  getLootItemName(lootItem: LootItem): string {
    if (lootItem.type === 'currency') {
      return this.formatCurrency(lootItem.data as Currency);
    }
    return (lootItem.data as any)?.name || 'Unnamed';
  }
}
