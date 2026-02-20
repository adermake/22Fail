# Comprehensive Stat Usage Audit Report

## Executive Summary

This audit identifies **critical issues** with how character stats (speed, strength, dexterity, intelligence, constitution, chill) are calculated and accessed across the project. The main problem is **inconsistent stat calculation** - some code uses the correct formula while other code uses only partial values.

---

## The Correct Stat Calculation Formula

Found in `frontend/src/app/sheet/stat/stat.component.ts` (line 122):

```typescript
this.stat.current = (this.stat.base + this.stat.bonus + effectBonus + this.stat.gain * this.sheet.level) | 0;
```

Where:
- **base**: The character's base stat value
- **bonus**: Manual bonus added by user
- **gain**: Per-level stat increase (from race)
- **level**: Character's current level
- **effectBonus**: Sum of bonuses from skills (multiplied by skill level) and equipped items

---

## Files With CORRECT Stat Calculations

### ✅ `frontend/src/app/sheet/stat/stat.component.ts`
- **Lines 46-76**: `effectBonus` getter correctly calculates bonuses from skills and equipment
- **Line 122**: Correct full formula: `base + bonus + effectBonus + (gain * level)`
- **Status**: This is the canonical correct implementation

### ✅ `frontend/src/app/services/battle.service.ts`
- **Lines 34-38**: `calculateSpeed()` method
  ```typescript
  calculateSpeed(character: CharacterSheet): number {
    const speedStat = character.speed;
    if (!speedStat) return 10;
    const calculated = speedStat.base + speedStat.bonus + (speedStat.gain * character.level);
    return Math.floor(calculated) || 10;
  }
  ```
- **Status**: ⚠️ **PARTIALLY CORRECT** - Missing `effectBonus` from skills/equipment!
- **Lines Used By**: 57, 68, 123, 151, 171, 295

### ✅ `frontend/src/app/sheet/dice-roller/dice-roller.component.ts`
- **Lines 158-188**: `calculateStatEffectBonus()` - correctly mirrors stat.component logic
- **Lines 193-200**: `calculateStatCurrent()` - uses the full formula
  ```typescript
  return (base + bonus + effectBonus + gain * this.sheet.level) | 0;
  ```
- **Status**: Correctly duplicated stat calculation

### ✅ `frontend/src/app/sheet/currentstat/currentstat.component.ts`
- **Lines 114-126**: `statusMax` getter correctly uses `.current` for stats
  ```typescript
  return value + this.sheet.constitution.current * 5;
  return value + this.sheet.dexterity.current * 5;
  return value + this.sheet.intelligence.current * 5;
  ```
- **Status**: ⚠️ **RELIES ON .current being pre-calculated** - may have stale values

### ✅ `frontend/src/app/sheet/equipment/equipment.component.ts`
- **Line 39**: `effectiveSpeed` uses `sheet.speed?.current`
- **Status**: ⚠️ **RELIES ON .current being pre-calculated** - may have stale values

### ✅ `frontend/src/app/sheet/item/item.component.ts`
- **Lines 43-48**: `canUseItem` getter uses `.current` for all stats
- **Status**: ⚠️ **RELIES ON .current being pre-calculated** - works in sheet context

### ✅ `frontend/src/app/sheet/spells/spells.component.ts`
- **Line 42**: `fokusValue` uses `this.sheet.intelligence?.current || 10`
- **Status**: ⚠️ **RELIES ON .current being pre-calculated** - may have stale values

---

## Files With INCORRECT Stat Calculations

### ❌ `frontend/src/app/lobby/lobby.component.ts`
- **Line 484**: 
  ```typescript
  const movementSpeed = speedStat ? (speedStat.base + (speedStat.bonus || 0)) : 6;
  ```
- **Missing**: `gain * level` AND `effectBonus`
- **Impact**: Tokens move with wrong speed on the battle map
- **Severity**: HIGH

### ❌ `frontend/src/app/world/battle-tracker/battle-tracker-engine.ts`
- **Line 136**: `speed: char.speed ?? 10`
- **Line 146**: `participant.speed = char.speed`
- **Line 183**: `speed: char?.speed || bp.speed`
- **Line 219**: `speed: bp.speed || char?.speed || 10`
- **Line 449**: `speed: char.speed`
- **Line 505**: `speed: char.speed`
- **Problem**: Uses raw `char.speed` which is a `StatBlock` object, not a number!
- **Should Be**: Calculated speed value
- **Impact**: Battle turn order completely broken
- **Severity**: CRITICAL

### ❌ `frontend/src/app/world/character-generator/character-generator.component.ts`
- **Line 399**: `lifeStatus.statusBase = 100 + (character.constitution.base * 5)`
- **Line 405**: `manaStatus.statusBase = 50 + (character.intelligence.base * 3)`
- **Line 411**: `const avgStat = (character.strength.base + character.dexterity.base + character.constitution.base) / 3`
- **Problem**: Uses `.base` instead of calculated values
- **Impact**: Generated characters have incorrect starting HP/Mana/Energy
- **Status**: ⚠️ Acceptable for initial character generation (no level bonuses yet), but should be noted

### ❌ `frontend/src/app/services/battle.service.ts`
- **Problem**: `calculateSpeed()` is missing `effectBonus` calculation
- **Impact**: Equipment/skill speed bonuses are ignored in battle
- **Severity**: MEDIUM-HIGH

---

## The `.current` Property Problem

The `StatBlock.current` property is **only updated when `stat.component.ts` renders**. This means:

1. When the character sheet is displayed, `.current` is correct
2. When accessing sheets programmatically (battle tracker, lobby), `.current` may be:
   - `1` (default from constructor)
   - Stale from last sheet render
   - Never calculated

**File**: `frontend/src/app/model/stat-block.model.ts`
```typescript
constructor(name: string, base: number, gain: number = 0, bonus: number = 0) {
  this.base = base;
  this.gain = gain;
  this.bonus = bonus;
  this.name = name;
  this.current = 1;  // <-- Default value, never auto-updated!
  this.effectBonus = 0;
}
```

---

## Proposed Solution: TrueStatsService

Create a centralized service that correctly calculates all stats:

### File: `frontend/src/app/services/true-stats.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { StatBlock } from '../model/stat-block.model';

export interface CalculatedStats {
  strength: number;
  dexterity: number;
  speed: number;
  intelligence: number;
  constitution: number;
  chill: number;
}

export interface CalculatedStatDetails {
  base: number;
  bonus: number;
  gain: number;
  level: number;
  levelBonus: number;
  effectBonus: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrueStatsService {
  
  /**
   * Calculate the effect bonus for a specific stat from skills and equipment.
   * Matches the logic in stat.component.ts
   */
  calculateEffectBonus(
    sheet: CharacterSheet, 
    statKey: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill'
  ): number {
    let total = 0;

    // Add bonuses from skills
    if (sheet.skills) {
      for (const skill of sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
              const multiplier = skill.level || 1;
              total += modifier.amount * multiplier;
            }
          }
        }
      }
    }

    // Add bonuses from equipped items
    if (sheet.equipment) {
      for (const item of sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statKey) {
              total += modifier.amount;
            }
          }
        }
      }
    }

    return total;
  }

  /**
   * Calculate a single stat's true value.
   * Formula: (base + bonus + effectBonus + (gain * level)) | 0
   */
  calculateStat(
    sheet: CharacterSheet,
    stat: StatBlock,
    statKey: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill'
  ): number {
    if (!stat) return 10; // Default fallback
    
    const base = stat.base || 0;
    const bonus = stat.bonus || 0;
    const gain = stat.gain || 0;
    const level = sheet.level || 1;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);
    
    return (base + bonus + effectBonus + (gain * level)) | 0;
  }

  /**
   * Calculate a stat with full breakdown details.
   */
  calculateStatDetails(
    sheet: CharacterSheet,
    stat: StatBlock,
    statKey: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill'
  ): CalculatedStatDetails {
    const base = stat?.base || 0;
    const bonus = stat?.bonus || 0;
    const gain = stat?.gain || 0;
    const level = sheet.level || 1;
    const levelBonus = gain * level;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);
    const total = (base + bonus + effectBonus + levelBonus) | 0;
    
    return { base, bonus, gain, level, levelBonus, effectBonus, total };
  }

  /**
   * Get all calculated stats for a character.
   */
  getAllStats(sheet: CharacterSheet): CalculatedStats {
    return {
      strength: this.calculateStat(sheet, sheet.strength, 'strength'),
      dexterity: this.calculateStat(sheet, sheet.dexterity, 'dexterity'),
      speed: this.calculateStat(sheet, sheet.speed, 'speed'),
      intelligence: this.calculateStat(sheet, sheet.intelligence, 'intelligence'),
      constitution: this.calculateStat(sheet, sheet.constitution, 'constitution'),
      chill: this.calculateStat(sheet, sheet.chill, 'chill'),
    };
  }

  /**
   * Calculate speed for battle/movement purposes.
   * This is the commonly needed stat.
   */
  calculateSpeed(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.speed, 'speed');
  }

  /**
   * Calculate the D&D-style modifier for a stat.
   * Formula: (-5 + total / 2) | 0
   */
  calculateStatModifier(sheet: CharacterSheet, statKey: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill'): number {
    const statBlock = sheet[statKey];
    const total = this.calculateStat(sheet, statBlock, statKey);
    return (-5 + total / 2) | 0;
  }
}
```

---

## Required Changes Summary

| File | Line(s) | Current Code | Required Change |
|------|---------|--------------|-----------------|
| `lobby.component.ts` | 484 | `speedStat.base + speedStat.bonus` | Use `TrueStatsService.calculateSpeed()` |
| `battle-tracker-engine.ts` | 136, 146, 183, 219, 449, 505 | `char.speed` (raw StatBlock) | Accept pre-calculated speed OR use service |
| `battle.service.ts` | 34-38 | Missing effectBonus | Add effectBonus calculation |
| `world.component.ts` | 180 | Uses `battleService.calculateSpeed()` | OK if battle.service is fixed |
| `stat.component.ts` | - | Local calculation | Consider delegating to TrueStatsService |
| `dice-roller.component.ts` | - | Duplicated calculation | Consider delegating to TrueStatsService |
| `currentstat.component.ts` | 118-126 | Uses `.current` | Recalculate or ensure `.current` is fresh |
| `spells.component.ts` | 42 | Uses `.current` | Use TrueStatsService |
| `equipment.component.ts` | 39 | Uses `.current` | Use TrueStatsService |

---

## Implementation Priority

1. **CRITICAL**: Fix `battle-tracker-engine.ts` - completely broken (uses StatBlock object as number)
2. **HIGH**: Fix `lobby.component.ts` - wrong movement speed
3. **HIGH**: Fix `battle.service.ts` - add effectBonus to calculateSpeed()
4. **MEDIUM**: Create `TrueStatsService` and refactor all usages
5. **LOW**: Refactor `stat.component.ts` and `dice-roller.component.ts` to use shared service

---

## Additional Notes

### Why `.current` Exists
The `.current` property was intended to cache the calculated value, but it's only updated when `stat.component.ts` renders in the DOM. This creates inconsistency when code accesses stats without rendering the character sheet.

### Equipment Speed Debuff
`equipment.component.ts` correctly subtracts armor debuff from speed:
```typescript
get effectiveSpeed(): number {
  const baseSpeed = this.sheet.speed?.current || 0;
  return Math.max(0, baseSpeed - this.totalArmorDebuff);
}
```
The TrueStatsService could optionally include this calculation.

### Stat Modifier Formula
The D&D-style modifier used for dice rolls:
```typescript
(-5 + total / 2) | 0
```
Should be included in TrueStatsService for consistency.

---

## Conclusion

The project has **critical inconsistencies** in stat calculation that affect:
- Battle turn order (completely broken)
- Token movement speed (wrong values)
- Combat calculations (missing equipment/skill bonuses)

Creating a centralized `TrueStatsService` will:
1. Establish a single source of truth
2. Eliminate code duplication
3. Ensure consistency across all features
4. Make future stat-related changes easier
