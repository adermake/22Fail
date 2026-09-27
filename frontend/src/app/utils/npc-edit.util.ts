import {
  NpcDerivedAdjust, NpcStatKey, NpcStatblock, createEmptyNpcBody,
} from '../model/npc-statblock.model';
import { NpcDerivedCalc, applyDerivedNpcStats } from './npc-roll.util';

/**
 * The GM's lobby edit mode for an NSC token: one field at a time, written into the token's own
 * snapshot. Every value is what the GM typed as the *result* — this file works out what to store
 * so the panel then shows exactly that number.
 */
export interface NpcEdit {
  name?: string;
  /** A base stat (before skills and effects). */
  stat?: { key: NpcStatKey; value: number };
  /** The Effektivität the panel should show. */
  effizienz?: number;
  /** The Stabilität the panel should show. */
  stabilitaet?: number;
  /** New deltas for Reaktion / Grundbonus / Bewegung (merged over the existing ones). */
  adjust?: NpcDerivedAdjust;
}

/** What the gear currently gives, for NSCs that read Effektivität / Stabilität from it. */
export interface NpcGearValues {
  weapon: number;
  armor: number;
}

/** Applies one edit in place and returns the statblock. */
export function applyNpcEdit(
  sb: NpcStatblock, edit: NpcEdit, calc: NpcDerivedCalc, gear: NpcGearValues,
): NpcStatblock {
  if (edit.name !== undefined && edit.name.trim()) sb.name = edit.name.trim();

  if (edit.stat) {
    const { key } = edit.stat;
    const value = Math.max(1, Math.round(edit.stat.value) || 1);
    if (sb.soul) {
      // The base stat is soul + body mods. An override pins the value outright, so edit that;
      // otherwise take the body's additions back off before writing the soul.
      const mods = sb.body?.mods ?? [];
      const override = mods.find(m => m.stat === key && m.mode === 'override');
      if (override) {
        override.value = value;
      } else {
        const added = mods.filter(m => m.stat === key).reduce((sum, m) => sum + m.value, 0);
        sb.soul.stats[key] = Math.max(1, value - added);
      }
      applyDerivedNpcStats(sb, calc);
    } else {
      sb[key] = value;
      const pools = calc.npcResourceMax(sb);
      sb.maxHealth = pools.life;
      sb.maxEnergy = pools.energy;
      sb.maxMana = pools.mana;
    }
  }

  if (edit.effizienz !== undefined || edit.stabilitaet !== undefined) {
    const body = (sb.body ??= createEmptyNpcBody());
    // Geared: keep the gear and store the difference as a bonus, so swapping the weapon later
    // still counts. Ungeared: the typed number simply is the value.
    if (edit.effizienz !== undefined) {
      const v = Math.round(edit.effizienz) || 0;
      if (body.useWeaponEffizienz) body.effizienzBonus = v - gear.weapon;
      else body.effizienz = Math.max(0, v);
    }
    if (edit.stabilitaet !== undefined) {
      const v = Math.round(edit.stabilitaet) || 0;
      if (body.useArmorStabilitaet) body.stabilitaetBonus = v - gear.armor;
      else body.stabilitaet = Math.max(0, v);
    }
  }

  if (edit.adjust) {
    const adjust = { ...sb.adjust, ...edit.adjust };
    for (const k of Object.keys(adjust) as (keyof NpcDerivedAdjust)[]) {
      if (!adjust[k]) delete adjust[k];
    }
    sb.adjust = Object.keys(adjust).length ? adjust : undefined;
  }
  return sb;
}
