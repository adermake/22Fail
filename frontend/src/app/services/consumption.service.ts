import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { MacroExecutorService } from './macro-executor.service';
import { hasRestBlock } from '../scripting/interpreter';

/**
 * ONE path for using something up — potions and Verbrauchsgegenstände are the same thing with
 * different authoring: brewing writes the script, the item editor writes it by hand.
 *
 * Using an item:
 *  1. runs its `script` (immediate effects — that is what a potion is),
 *  2. takes one unit off the stack (or removes the item),
 *  3. parks the used unit in `sheet.consumedItems` — but ONLY when its script actually has an
 *     `onRest { … }` block. A potion that is done the moment it is drunk has nothing left for the
 *     Rast to resolve, so it never shows up under Verbraucht.
 */
export interface ConsumeResult {
  ok: boolean;
  /** What the script reported, for the toast/feedback line. */
  message: string;
  /** The item was recognised as consumable at all. */
  consumed: boolean;
  /** The used unit was parked under Verbraucht (it has an onRest block). */
  queued: boolean;
}

/**
 * What can be used up on the spot. Potions and Verbrauchsgegenstände only.
 *
 * Deliberately NOT "anything with a script": a Kochzutat and an amulet both carry an `onRest`
 * block, and neither is something you eat. Being scriptable says nothing about being edible.
 */
export function isConsumable(item: ItemBlock | null | undefined): boolean {
  if (!item) return false;
  return item.itemType === 'consumable' || item.itemType === 'potion';
}

@Injectable({ providedIn: 'root' })
export class ConsumptionService {
  private macros = inject(MacroExecutorService);

  /**
   * Apply an item's effects to the sheet and queue the used unit. Mutates `sheet`; the caller
   * persists (inventory, statuses, activeStatusEffects, consumedItems).
   */
  consume(sheet: CharacterSheet, item: ItemBlock, index: number): ConsumeResult {
    if (!isConsumable(item)) {
      return { ok: false, message: 'Nicht verbrauchbar', consumed: false, queued: false };
    }

    let message = 'Verbraucht';
    if (item.script) {
      message = this.macros.runScriptOnSheet(item.script, sheet).message;
    }

    const queued = this.takeOneUnit(sheet, item, index);
    return { ok: true, message, consumed: true, queued };
  }

  /** Does anything of this item survive being used — i.e. is there an onRest block to resolve? */
  outlastsUse(item: ItemBlock | null | undefined): boolean {
    return hasRestBlock(item?.script ?? '');
  }

  /** Remove one unit from the inventory; remember it under Verbraucht only if it has an onRest. */
  private takeOneUnit(sheet: CharacterSheet, item: ItemBlock, index: number): boolean {
    const inventory = [...(sheet.inventory ?? [])];
    const usedUnit: ItemBlock = { ...item, amount: 1 };

    if (item.stackable && (item.amount ?? 1) > 1) {
      inventory[index] = { ...item, amount: (item.amount ?? 1) - 1 };
    } else {
      inventory[index] = null;
      while (inventory.length > 0 && inventory[inventory.length - 1] === null) inventory.pop();
    }
    sheet.inventory = inventory as typeof sheet.inventory;

    if (!this.outlastsUse(item)) return false;
    sheet.consumedItems = [...(sheet.consumedItems ?? []), { item: usedUnit, consumedAt: Date.now() }];
    return true;
  }
}
