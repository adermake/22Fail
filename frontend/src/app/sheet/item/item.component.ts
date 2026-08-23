import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ItemBlock, ItemCounter } from '../../model/item-block.model';
import { getEquipSlot } from '../../utils/equip-slot.utils';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { KeywordEnhancer } from '../keyword-enhancer';
import { isConsumable } from '../../services/consumption.service';
import { hasRestBlock, listTriggers } from '../../scripting/interpreter';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { HeldStackService } from '../../services/held-stack.service';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './item.component.html',
  styleUrl: './item.component.css',
})
export class ItemComponent implements OnChanges {
  private heldStack = inject(HeldStackService);
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
  /** True inside the inventory grid, where left/right click move stacks around. */
  @Input() stackMode = false;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();
  @Output() openEditor = new EventEmitter<void>();
  /** Copy this item; the host inserts the copy and opens its editor. */
  @Output() duplicate = new EventEmitter<void>();
  /** Verbrauchsgegenstand used up: runs its action and moves it into the Verbraucht queue. */
  @Output() consume = new EventEmitter<void>();
  @Output() breakTest = new EventEmitter<void>();
  /** Potion: request parent to apply effects and consume. */
  @Output() useOnSelf = new EventEmitter<void>();
  /** Fire one named `onTrigger` block of this item's script by hand. */
  @Output() runTrigger = new EventEmitter<string>();

  isFolded = true; // Start items as folded to save space
  readonly Math = Math;

  /** Kept so the old menu's handlers can still close "the menu" from one place. */
  showContextMenu = false;
  /** True while W is held over this item and the menu is charging up. */
  charging = false;
  /** The full action menu, opened by holding W over the item. */
  showActionMenu = false;
  private hovered = false;
  private chargeTimer: ReturnType<typeof setTimeout> | null = null;
  /** Using something up is irreversible — ask first, in our own dialog. */
  askingConsume = false;

  @Output() foldChange = new EventEmitter<boolean>();
  /** Emits the weapon's efficiency when the roll-damage button is clicked */
  @Output() rollDamage = new EventEmitter<number>();

  /** Maps armorType/itemType to short slot label */
  get slotLabel(): string | null {
    const slot = getEquipSlot(this.item);
    const map: Record<string, string> = {
      helmet: 'HELM', chestplate: 'BRUST', armschienen: 'ARME',
      leggings: 'BEINE', boots: 'STIEFEL', weapon: 'WAFFE', extra: 'EXTRA',
    };
    return map[slot] ?? null;
  }

  /** How long W must be held before the menu pops. Long enough not to fire by accident. */
  private static readonly CHARGE_MS = 420;

  @HostListener('mouseenter')
  onMouseEnter(): void { this.hovered = true; }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hovered = false;
    this.cancelCharge();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.showActionMenu && event.key === 'Escape') { this.closeActionMenu(); return; }
    if (event.key !== 'w' && event.key !== 'W') return;
    if (!this.hovered || this.showActionMenu || this.chargeTimer) return;
    // Never steal the key from someone typing.
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

    event.preventDefault();
    this.charging = true;
    this.chargeTimer = setTimeout(() => {
      this.chargeTimer = null;
      this.charging = false;
      this.openActionMenu();
    }, ItemComponent.CHARGE_MS);
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'w' || event.key === 'W') this.cancelCharge();
  }

  private cancelCharge(): void {
    if (this.chargeTimer) clearTimeout(this.chargeTimer);
    this.chargeTimer = null;
    this.charging = false;
  }

  private openActionMenu(): void {
    if (ItemComponent.activeContextMenu && ItemComponent.activeContextMenu !== this) {
      ItemComponent.activeContextMenu.showActionMenu = false;
    }
    ItemComponent.activeContextMenu = this;
    this.showActionMenu = true;
    this.cd.markForCheck();
  }

  closeActionMenu(): void {
    this.showActionMenu = false;
    this.cancelCharge();
    this.cd.markForCheck();
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
      case 'weapon': return 'i-effektivity';
      case 'armor': return 'i-stability';
      case 'potion': return 'i-brewing';
      case 'consumable': return 'i-brewing';
      case 'raw-material': return 'i-item';
      case 'ingredient': return 'i-item';
      case 'extractor': return 'i-brewing';
      default: return 'i-item';
    }
  }

  get itemTypeLabel(): string {
    switch (this.item.itemType) {
      case 'weapon': return 'Waffe';
      case 'armor': return 'Rüstung';
      case 'potion': return 'Trank';
      case 'consumable': return 'Verbrauchsgegenstand';
      case 'raw-material': return 'Rohmaterial';
      case 'ingredient': return 'Wirkstoff';
      case 'extractor': return 'Extraktor';
      default: return 'Gegenstand';
    }
  }

  toggleEdit() {
    // Open full-screen editor instead of inline editing
    this.openEditor.emit();
  }

  /**
   * Right-click belongs to the stack cursor now (split a pile / put one down); the item's own
   * actions live in the hold-W menu. Nothing to do here but stay out of the way.
   */
  onRightClick(_event: MouseEvent): void { /* handled by the surrounding slot */ }

  openEditorFromMenu() {
    this.closeActionMenu();
    this.openEditor.emit();
  }

  /** Anything with effects to spend: potion, Verbrauchsgegenstand or a scripted item. */
  get isConsumable(): boolean {
    return isConsumable(this.item);
  }

  duplicateFromMenu() {
    this.closeActionMenu();
    this.duplicate.emit();
  }

  consumeFromMenu() {
    this.closeActionMenu();
    this.askingConsume = true;
  }

  /** The confirm dialog said yes. */
  confirmConsume(): void {
    this.askingConsume = false;
    this.consume.emit();
  }

  cancelConsume(): void { this.askingConsume = false; }

  /** What happens to the item once it is used — shown as small print in the confirm dialog. */
  get consumeDetail(): string {
    const left = this.item.stackable ? (this.item.amount ?? 1) : 1;
    const stackNote = this.item.stackable && left > 1
      ? `Eine von ${left} Einheiten wird verbraucht.`
      : 'Der Gegenstand wird dabei aufgebraucht.';
    return this.hasRestEffect
      ? `${stackNote} Er wandert in die Verbraucht-Liste und wirkt bei der nächsten Rast nach.`
      : stackNote;
  }

  /** True when the item keeps working after it is used (it has an onRest block). */
  get hasRestEffect(): boolean {
    try { return hasRestBlock(this.item.script ?? ''); } catch { return false; }
  }

  /** Named onTrigger blocks in this item's script — offered in the right-click menu. */
  get itemTriggers(): string[] {
    const script = this.item.script;
    if (!script || !script.trim()) return [];
    try { return listTriggers(script).map(t => t.name); } catch { return []; }
  }

  triggerFromMenu(name: string): void {
    this.closeActionMenu();
    this.runTrigger.emit(name);
  }

  usePotionFromMenu() {
    this.closeActionMenu();
    this.useOnSelf.emit();
  }

  toggleLostFromMenu() {
    this.closeActionMenu();
    this.patch.emit({ path: 'lost', value: !this.item.lost });
  }

  deleteFromContextMenu() {
    this.closeActionMenu();
    this.delete.emit();
  }

  identifyFromMenu() {
    this.closeActionMenu();
    this.patch.emit({ path: 'identified', value: true });
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
      'chill': 'WIL',
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
    if (this.item.isIdentified === false) return 'Unidentifiziertes Item';
    const baseName = this.item.name;
    if (this.item.stackable && (this.item.amount ?? 1) > 1) {
      return `${baseName} ×${this.item.amount}`;
    }
    return baseName;
  }

  get totalWeight(): number {
    if (this.item.stackable && (this.item.amount ?? 1) > 1) {
      return (this.item.weight || 0) * (this.item.amount ?? 1);
    }
    return this.item.weight || 0;
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