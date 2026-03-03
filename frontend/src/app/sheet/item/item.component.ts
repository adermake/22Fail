import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ItemBlock, ItemCounter } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { KeywordEnhancer } from '../keyword-enhancer';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item.component.html',
  styleUrl: './item.component.css',
})
export class ItemComponent implements OnChanges {
  /** Tracks the last opened context menu instance so others can close themselves */
  private static activeContextMenu: ItemComponent | null = null;

  @Input({ required: true }) item!: ItemBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) index!: number;
  @Input() isEditing = false;
  /** When true, forces item to folded compact state (e.g. during drag) */
  @Input() compact: boolean = false;
  /** When true, item starts in unfolded state (used for expansion row in inventory grid) */
  @Input() set startUnfolded(v: boolean) {
    if (v) this.isFolded = false;
  }
  /** When true, hides the fold button and disables dblclick-to-fold (expansion row) */
  @Input() hideFoldControls = false;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();
  @Output() openEditor = new EventEmitter<void>();
  @Output() breakTest = new EventEmitter<void>();

  isFolded = true; // Start items as folded to save space

  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;

  @Output() foldChange = new EventEmitter<boolean>();

  /** Maps armorType/itemType to short slot label */
  get slotLabel(): string | null {
    if (this.item.itemType === 'weapon') return 'WAFFE';
    if (this.item.itemType === 'armor' && this.item.armorType) {
      const map: Record<string, string> = {
        helmet: 'HELM', chestplate: 'BRUST', armschienen: 'ARME',
        leggings: 'BEINE', boots: 'STIEFEL', extra: 'EXTRA',
      };
      return map[this.item.armorType] ?? null;
    }
    return null;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showContextMenu = false;
    if (ItemComponent.activeContextMenu === this) ItemComponent.activeContextMenu = null;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.showContextMenu = false;
    if (ItemComponent.activeContextMenu === this) ItemComponent.activeContextMenu = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['compact'] && changes['compact'].currentValue === true) {
      this.isFolded = true;
    }
  }

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  get enhancedDescription(): SafeHtml {
    const original = this.item.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  get canUseItem(): boolean {
    if (!this.item.requirements) return true;

    const reqs = this.item.requirements;
    const stats = this.sheet;

    if (reqs.strength && stats.strength.current < reqs.strength) return false;
    if (reqs.dexterity && stats.dexterity.current < reqs.dexterity) return false;
    if (reqs.speed && stats.speed.current < reqs.speed) return false;
    if (reqs.intelligence && stats.intelligence.current < reqs.intelligence) return false;
    if (reqs.constitution && stats.constitution.current < reqs.constitution) return false;
    if (reqs.chill && stats.chill.current < reqs.chill) return false;
    if (this.item.lost) return false;
    if (this.item.broken) return false;
    return true;
  }

  get durabilityPercent(): number {
    if (!this.item.hasDurability || !this.item.maxDurability) return 100;
    return Math.round((this.item.durability || 0) / this.item.maxDurability * 100);
  }

  get durabilityClass(): string {
    const pct = this.durabilityPercent;
    if (pct > 66) return 'durability-high';
    if (pct > 33) return 'durability-medium';
    return 'durability-low';
  }

  get itemTypeIcon(): string {
    switch (this.item.itemType) {
      case 'weapon': return '⚔';
      case 'armor': return '🛡';
      default: return '📦';
    }
  }

  get itemTypeLabel(): string {
    switch (this.item.itemType) {
      case 'weapon': return 'Waffe';
      case 'armor': return 'Rüstung';
      default: return 'Gegenstand';
    }
  }

  toggleEdit() {
    // Open full-screen editor instead of inline editing
    this.openEditor.emit();
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Close any other open context menu
    if (ItemComponent.activeContextMenu && ItemComponent.activeContextMenu !== this) {
      ItemComponent.activeContextMenu.showContextMenu = false;
    }
    ItemComponent.activeContextMenu = this;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.showContextMenu = true;
  }

  openEditorFromMenu() {
    this.showContextMenu = false;
    this.openEditor.emit();
  }

  toggleLostFromMenu() {
    this.showContextMenu = false;
    this.patch.emit({ path: 'lost', value: !this.item.lost });
  }

  deleteFromContextMenu() {
    this.showContextMenu = false;
    this.delete.emit();
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }

  updateCounter(counter: ItemCounter, value: number) {
    // Clamp value to min/max
    const newValue = Math.max(counter.min, Math.min(counter.max, value));
    const counterIndex = this.item.counters?.indexOf(counter) ?? -1;
    if (counterIndex >= 0) {
      this.patch.emit({ path: `counters.${counterIndex}.current`, value: newValue });
    }
  }

  getCounterPercent(counter: ItemCounter): number {
    const range = counter.max - counter.min;
    if (range === 0) return 100;
    const current = counter.current - counter.min;
    return Math.round((current / range) * 100);
  }

  updateDurability(value: number) {
    if (!this.item.hasDurability) return;
    const newDurability = Math.max(0, Math.min(this.item.maxDurability || 100, value));
    this.patch.emit({ path: 'durability', value: newDurability });
    
    // If durability reaches 0, trigger break test
    if (newDurability === 0 && !this.item.broken) {
      this.breakTest.emit();
    }
  }

  reduceDurability(amount: number) {
    if (!this.item.hasDurability) return;
    const newDurability = Math.max(0, (this.item.durability || 0) - amount);
    this.patch.emit({ path: 'durability', value: newDurability });
    
    // If durability reaches 0, trigger break test
    if (newDurability === 0 && !this.item.broken) {
      this.breakTest.emit();
    }
  }

  getStatLabel(stat: string): string {
    const labels: { [key: string]: string } = {
      'strength': 'STR',
      'dexterity': 'DEX',
      'speed': 'SPD',
      'intelligence': 'INT',
      'constitution': 'CON',
      'chill': 'CHL',
      'mana': 'Mana',
      'life': 'Leben',
      'energy': 'Energie'
    };
    return labels[stat] || stat;
  }

  requestBreakTest() {
    this.breakTest.emit();
  }

  toggleLost() {
    this.patch.emit({ path: 'lost', value: !this.item.lost });
  }

  toggleFold() {
    this.isFolded = !this.isFolded;
    this.foldChange.emit(this.isFolded);
  }

  onCardDblClick(e: Event) {
    if (!this.hideFoldControls) {
      this.toggleFold();
    }
    e.stopPropagation();
  }

  deleteItem() {
    this.delete.emit();
  }

  get displayName(): string {
    return this.item.isIdentified === false ? 'Unidentifiziertes Item' : this.item.name;
  }

  get showDetails(): boolean {
    return this.item.isIdentified !== false;
  }

  requestIdentify() {
    // Show confirmation dialog
    if (confirm('Möchtest du dieses Item identifizieren?')) {
      this.patch.emit({ path: 'isIdentified', value: true });
    }
  }
}