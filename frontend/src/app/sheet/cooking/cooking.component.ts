import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import {
  COOKED_MARK, CookingRoll, cookingMultiplier, dividePortions, isCookable, mergeConsumableScripts,
  rollCookingQuality, scaleRestValues,
} from '../../utils/cooking.util';

/** One ingredient picked for the pot, with the inventory slot it came from. */
interface CookEntry {
  index: number;
  item: ItemBlock;
}

/**
 * Kochen — the third crafting station next to Schmiede and Braukessel, and the simplest one:
 * throw consumables in the pot, say how many portions come out, and the combined effect is split
 * across them. The ingredients are used up; the meal lands in the inventory as a stackable
 * Verbrauchsgegenstand.
 */
@Component({
  selector: 'app-cooking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cooking.component.html',
  styleUrl: './cooking.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookingComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() closeOverlay = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);

  mealName = '';
  portions = 1;
  /** Result of the Kochprobe for the meal just cooked, shown until the pot is used again. */
  lastRoll: CookingRoll | null = null;
  /** Inventory slots currently in the pot. */
  picked: number[] = [];

  // ── Reading the inventory ──────────────────────────────────────────────────

  /** Everything edible: potions and Verbrauchsgegenstände carry the effects we can merge. */
  get availableItems(): CookEntry[] {
    return (this.sheet.inventory ?? [])
      .map((item, index) => ({ item: item as ItemBlock, index }))
      .filter(entry => isCookable(entry.item));
  }

  get pot(): CookEntry[] {
    return this.picked
      .map(index => ({ index, item: this.sheet.inventory?.[index] as ItemBlock }))
      .filter(entry => !!entry.item);
  }

  isPicked(index: number): boolean { return this.picked.includes(index); }

  toggle(index: number): void {
    this.picked = this.isPicked(index)
      ? this.picked.filter(i => i !== index)
      : [...this.picked, index];
    this.cdr.markForCheck();
  }

  // ── The meal ───────────────────────────────────────────────────────────────

  /** Combined script of everything in the pot, divided by the portion count. */
  get resultScript(): string {
    return dividePortions(mergeConsumableScripts(this.pot.map(e => e.item)), this.portions);
  }

  // ── Kochprobe ──────────────────────────────────────────────────────────────

  /** The character's kitchen bonus, persisted on the sheet. */
  get cookingBonus(): number { return this.sheet.cookingBonus ?? 0; }

  setCookingBonus(value: number): void {
    const bonus = Math.floor(Number(value) || 0);
    this.sheet.cookingBonus = bonus;
    this.patch.emit({ path: 'cookingBonus', value: bonus });
    this.cdr.markForCheck();
  }

  /** What the worst and best possible rolls would multiply by, for the hint line. */
  get rollRange(): { min: number; max: number } {
    return {
      min: cookingMultiplier(1, this.cookingBonus).multiplier,
      max: cookingMultiplier(20, this.cookingBonus).multiplier,
    };
  }

  get canCook(): boolean {
    return this.pot.length > 0 && this.portions >= 1 && !!this.mealName.trim();
  }

  setPortions(value: number): void {
    this.portions = Math.max(1, Math.floor(Number(value) || 1));
    this.cdr.markForCheck();
  }

  /** Use up the ingredients and put the finished meal in the inventory. */
  cook(): void {
    if (!this.canCook) return;

    const ingredients = this.pot;
    const meal = new ItemBlock();
    meal.id = `meal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    meal.name = this.mealName.trim();
    meal.itemType = 'consumable';
    meal.description = `Gekocht aus: ${ingredients.map(e => e.item.name).join(', ')}\n`
      + `${this.portions} Portion(en) — Wirkung je Portion geteilt.`;
    // How well it turned out: (1d20 + 5 + X) / 10 scales everything the meal restores.
    const roll = rollCookingQuality(this.cookingBonus);
    this.lastRoll = roll;
    meal.script = scaleRestValues(this.resultScript, roll.multiplier);
    meal.stackable = true;
    meal.amount = this.portions;
    meal.weight = Math.round(
      ingredients.reduce((sum, e) => sum + (e.item.weight ?? 0), 0) * 10) / 10;
    meal.isIdentified = true;
    // Marks the meal as pot output — isCookable() refuses it as an ingredient, closing the
    // "cook the stew again into more portions" loop.
    (meal as unknown as { origin: string }).origin = COOKED_MARK;
    meal.lost = false;
    meal.broken = false;

    // Ingredients are used up: one unit each, stacks lose a single portion.
    const inventory = [...(this.sheet.inventory ?? [])];
    for (const entry of ingredients) {
      const item = inventory[entry.index];
      if (!item) continue;
      if (item.stackable && (item.amount ?? 1) > 1) {
        inventory[entry.index] = { ...item, amount: (item.amount ?? 1) - 1 };
      } else {
        inventory[entry.index] = null;
      }
    }

    const free = inventory.findIndex(slot => slot === null);
    if (free === -1) inventory.push(meal);
    else inventory[free] = meal;
    while (inventory.length > 0 && inventory[inventory.length - 1] === null) inventory.pop();

    this.sheet.inventory = inventory as typeof this.sheet.inventory;
    this.patch.emit({ path: 'inventory', value: this.sheet.inventory });

    this.picked = [];
    this.mealName = '';
    this.portions = 1;
    this.closeOverlay.emit();
  }

  onClose(): void { this.closeOverlay.emit(); }
}
