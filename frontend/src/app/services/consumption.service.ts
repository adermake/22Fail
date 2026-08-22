import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { PotionEffectInstance } from '../model/brewing.model';
import { ActiveStatusEffect } from '../model/status-effect.model';
import { applyStacking } from '../utils/status-stacking.utils';
import { MacroExecutorService } from './macro-executor.service';

/**
 * ONE path for using something up — potions and Verbrauchsgegenstände are the same thing with
 * different authoring: brewing writes the script, the item editor writes it by hand.
 *
 * Using an item:
 *  1. runs its `script` (immediate effects — that is what a potion is),
 *  2. or, for potions brewed before the merge, applies their stored `potionEffects`,
 *  3. takes one unit off the stack (or removes the item),
 *  4. parks the used unit in `sheet.consumedItems` so the next Rast can resolve its `onRest`.
 */
export interface ConsumeResult {
  ok: boolean;
  /** What the script reported, for the toast/feedback line. */
  message: string;
  /** The item was recognised as consumable at all. */
  consumed: boolean;
}

/** Both item types are consumed the same way; 'potion' is kept as its own type for icons/brewing. */
export function isConsumable(item: ItemBlock | null | undefined): boolean {
  if (!item) return false;
  return item.itemType === 'consumable'
    || item.itemType === 'potion'
    || !!item.script
    || !!item.potionEffects?.length;
}

@Injectable({ providedIn: 'root' })
export class ConsumptionService {
  private macros = inject(MacroExecutorService);

  /**
   * Apply an item's effects to the sheet and queue the used unit. Mutates `sheet`; the caller
   * persists (inventory, statuses, activeStatusEffects, consumedItems).
   */
  consume(sheet: CharacterSheet, item: ItemBlock, index: number): ConsumeResult {
    if (!isConsumable(item)) return { ok: false, message: 'Nicht verbrauchbar', consumed: false };

    let message = 'Verbraucht';
    if (item.script) {
      const result = this.macros.runScriptOnSheet(item.script, sheet);
      message = result.message;
    } else if (item.potionEffects?.length) {
      // Legacy: potions brewed before brewing started emitting a script.
      this.applyPotionEffects(sheet, item.potionEffects);
      message = item.potionEffects.map(e => e.statusEffectName || e.statusEffectId).join(', ');
    }

    this.takeOneUnit(sheet, item, index);
    return { ok: true, message, consumed: true };
  }

  /** Remove one unit from the inventory and remember it under Verbraucht. */
  private takeOneUnit(sheet: CharacterSheet, item: ItemBlock, index: number): void {
    const inventory = [...(sheet.inventory ?? [])];
    const usedUnit: ItemBlock = { ...item, amount: 1 };

    if (item.stackable && (item.amount ?? 1) > 1) {
      inventory[index] = { ...item, amount: (item.amount ?? 1) - 1 };
    } else {
      inventory[index] = null;
      while (inventory.length > 0 && inventory[inventory.length - 1] === null) inventory.pop();
    }
    sheet.inventory = inventory as typeof sheet.inventory;
    sheet.consumedItems = [...(sheet.consumedItems ?? []), { item: usedUnit, consumedAt: Date.now() }];
  }

  /**
   * Pre-merge potions: STACK adds stacks, DURATION extends the timer, both merging onto an
   * existing instance of the same effect.
   */
  private applyPotionEffects(sheet: CharacterSheet, effects: readonly PotionEffectInstance[]): void {
    let list = [...(sheet.activeStatusEffects ?? [])];
    const seen = new Set(sheet.seenStatusEffectIds ?? []);

    for (const effect of effects) {
      if (!effect.statusEffectId) continue;
      seen.add(effect.statusEffectId);
      const incoming: ActiveStatusEffect = {
        statusEffectId: effect.statusEffectId,
        sourceLibraryId: effect.sourceLibraryId ?? '',
        appliedAt: Date.now(),
        stacks: effect.mode === 'STACK' ? effect.amount : 1,
        duration: effect.mode === 'DURATION' ? effect.amount : undefined,
        customName: effect.statusEffectName,
      };
      // STACK mode is stackable by definition; DURATION merges by extending the timer.
      const cap = effect.mode === 'STACK' ? Number.MAX_SAFE_INTEGER : 1;
      list = applyStacking<ActiveStatusEffect>(list, incoming, cap).list;
    }

    sheet.activeStatusEffects = list;
    sheet.seenStatusEffectIds = [...seen];
  }
}
