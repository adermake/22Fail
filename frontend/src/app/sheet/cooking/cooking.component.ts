import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit,
  Output, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import {
  COOKED_MARK, CookingRoll, MealEffects, MealEffectSummary, buildMealScript, cookingOutcome,
  describeMealEffects, isCookable, mergeConsumableScripts, rollCookingQuality, scaleSummary,
  summariseEffects,
} from '../../utils/cooking.util';
import { REST_TRIGGER, runScript } from '../../scripting/interpreter';
import { createPlayerContext } from '../../scripting/character-context';
import { TrueStatsService } from '../../services/true-stats.service';
import { LibraryStoreService } from '../../services/library-store.service';

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
export class CookingComponent implements OnInit, OnDestroy {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() closeOverlay = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);
  private trueStats = inject(TrueStatsService);
  private libraryStore = inject(LibraryStoreService);

  /** pot → choose and preview · rolling → the Kochprobe is running · done → the result */
  phase: 'pot' | 'rolling' | 'done' = 'pot';
  /** The die shown while it is still spinning. */
  spinningDie = 1;
  /** The finished dish, so the result screen can name it. */
  cookedName = '';
  /** The finished dish's effects, frozen — the ingredients are gone by the time it is shown. */
  cookedEffects: MealEffects | null = null;
  private spinTimer: ReturnType<typeof setInterval> | null = null;
  private prevBodyOverflow = '';

  mealName = '';
  portions = 1;
  /** Result of the Kochprobe for the meal just cooked. */
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

  /** What is in the pot, one entry per unit — the same ingredient may appear several times. */
  get pot(): CookEntry[] {
    return this.picked
      .map(index => ({ index, item: this.sheet.inventory?.[index] as ItemBlock }))
      .filter(entry => !!entry.item);
  }

  isPicked(index: number): boolean { return this.picked.includes(index); }

  /** How many units of this slot are in the pot. */
  pickedCount(index: number): number {
    return this.picked.filter(i => i === index).length;
  }

  /** Units of this slot the character actually owns. */
  availableCount(index: number): number {
    const item = this.sheet.inventory?.[index];
    if (!item) return 0;
    return item.stackable ? Math.max(1, item.amount ?? 1) : 1;
  }

  /** Left click: one more of this ingredient, up to what is owned. */
  addOne(index: number): void {
    if (this.phase !== 'pot') return;
    if (this.pickedCount(index) >= this.availableCount(index)) return;
    this.picked = [...this.picked, index];
    this.cdr.markForCheck();
  }

  /** Right click: one fewer. */
  removeOne(index: number, event?: Event): void {
    event?.preventDefault();
    if (this.phase !== 'pot') return;
    const at = this.picked.lastIndexOf(index);
    if (at < 0) return;
    this.picked = this.picked.filter((_, i) => i !== at);
    this.cdr.markForCheck();
  }

  // ── The meal ───────────────────────────────────────────────────────────────

  /** The ingredients' combined script, before portions or the Kochprobe touch it. */
  private get rawScript(): string {
    return mergeConsumableScripts(this.pot.map(e => e.item));
  }

  // ── Scroll lock ────────────────────────────────────────────────────────────
  // The overlay covers the sheet, but the sheet behind it still scrolled under the wheel.

  ngOnInit(): void {
    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.prevBodyOverflow;
    if (this.spinTimer) clearInterval(this.spinTimer);
  }

  // ── What the dish will do ──────────────────────────────────────────────────

  /**
   * What one portion of the dish does: the ingredients run once, added up, then divided by the
   * portions and scaled by the Kochprobe. Both adjustments happen on NUMBERS here rather than on
   * the ingredients' script text, which is why they now always take effect.
   */
  private effectsFor(factor: number): MealEffects {
    const script = this.rawScript;
    return {
      immediate: scaleSummary(this.summarise(script), factor),
      onRest: scaleSummary(this.summarise(script, REST_TRIGGER), factor),
    };
  }

  /** Everything portions and the roll do to the dish, as one factor. */
  private get portionFactor(): number {
    const perPortion = 1 / Math.max(1, this.portions);
    return this.lastRoll ? perPortion * this.lastRoll.multiplier : perPortion;
  }

  /** The forecast while the pot is still being filled. */
  get mealEffects(): MealEffects {
    return this.effectsFor(this.portionFactor);
  }

  /**
   * What the panel shows. After cooking this MUST be the frozen result: the ingredients have been
   * used up by then, so recomputing from the pot would show an empty dish.
   */
  get shownEffects(): MealEffects {
    return this.phase === 'done' && this.cookedEffects ? this.cookedEffects : this.mealEffects;
  }

  /** Effects that land the moment a portion is eaten. */
  get immediateEffects(): MealEffectSummary { return this.shownEffects.immediate; }

  /** Effects that land at the next Rast. */
  get restEffects(): MealEffectSummary { return this.shownEffects.onRest; }

  get hasAnyEffect(): boolean {
    return !this.immediateEffects.empty || !this.restEffects.empty;
  }

  /**
   * Run the dish against this character without applying anything — runScript only reports what
   * WOULD happen, so this is the honest sum of the effects rather than a re-implementation.
   */
  private summarise(script: string, trigger?: string): MealEffectSummary {
    if (!script.trim()) return summariseEffects({ resourceChanges: [], statusOps: [], displays: [] });
    const ctx = createPlayerContext(this.sheet, this.trueStats, {
      inCombat: false, stacks: 1, turn: 0, duration: 0, effectStrength: 0,
    });
    try {
      return summariseEffects(runScript(script, ctx, { trigger }));
    } catch {
      return summariseEffects({ resourceChanges: [], statusOps: [], displays: [] });
    }
  }

  /** A status effect's name, so the summary reads "Satt" rather than an id. */
  statusName(id: string): string {
    for (const lib of this.libraryStore.allLibraries ?? []) {
      const hit = (lib.statusEffects ?? []).find(fx => fx.id === id);
      if (hit) return hit.name || id;
    }
    return id;
  }

  /** The character's kitchen bonus, persisted on the sheet. */
  get cookingBonus(): number { return this.sheet.cookingBonus ?? 0; }

  setCookingBonus(value: number): void {
    const bonus = Math.floor(Number(value) || 0);
    this.sheet.cookingBonus = bonus;
    this.patch.emit({ path: 'cookingBonus', value: bonus });
    this.cdr.markForCheck();
  }

  /** Best and worst possible outcomes, for the hint line. Low rolls are good. */
  get rollRange(): { best: number; worst: number } {
    return {
      best: cookingOutcome(1, this.cookingBonus).percent,
      worst: cookingOutcome(20, this.cookingBonus).percent,
    };
  }

  get canCook(): boolean {
    return this.pot.length > 0 && this.portions >= 1 && !!this.mealName.trim();
  }

  setPortions(value: number): void {
    this.portions = Math.max(1, Math.floor(Number(value) || 1));
    this.cdr.markForCheck();
  }

  /**
   * Start cooking: spin the die for a moment so the Kochprobe is something you watch happen,
   * then resolve it and build the dish. The overlay stays open on the result — it used to close
   * in the same breath, which is why nobody ever saw the roll.
   */
  cook(): void {
    if (!this.canCook || this.phase !== 'pot') return;

    this.phase = 'rolling';
    this.cookedName = this.mealName.trim();
    this.spinTimer = setInterval(() => {
      this.spinningDie = Math.floor(Math.random() * 20) + 1;
      this.cdr.markForCheck();
    }, 60);

    setTimeout(() => {
      if (this.spinTimer) { clearInterval(this.spinTimer); this.spinTimer = null; }
      this.finishCooking();
      this.phase = 'done';
      this.cdr.markForCheck();
    }, 900);
  }

  /** Use up the ingredients and put the finished meal in the inventory. */
  private finishCooking(): void {
    const ingredients = this.pot;
    const meal = new ItemBlock();
    meal.id = `meal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    meal.name = this.mealName.trim();
    meal.itemType = 'consumable';
    // How well it turned out: 5 × (15 − W20) %, applied to the whole dish.
    const roll = rollCookingQuality(this.cookingBonus);
    this.lastRoll = roll;
    this.spinningDie = roll.die;

    // Build the meal from the SUMMED, scaled effects rather than by rewriting the ingredients'
    // script text — that is what makes portions and the roll actually land.
    const effects = this.effectsFor(this.portionFactor);
    this.cookedEffects = effects;
    meal.script = buildMealScript(effects);
    // Carried on the item so the inventory card can say what a portion does.
    meal.primaryEffect = describeMealEffects(effects, id => this.statusName(id));
    meal.description = `Gekocht aus: ${ingredients.map(e => e.item.name).join(', ')}`;
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

  }

  /** Back to an empty pot, ready to cook again. */
  cookAgain(): void {
    this.picked = [];
    this.mealName = '';
    this.portions = 1;
    this.lastRoll = null;
    this.cookedEffects = null;
    this.phase = 'pot';
    this.cdr.markForCheck();
  }

  onClose(): void { this.closeOverlay.emit(); }
}
