import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { required } from '@angular/forms/signals';
import { CharacterSheet } from '../../model/character-sheet-model';
import { FormulaType } from '../../model/formula-type.enum';
import { JsonPatch } from '../../model/json-patch.model';

@Component({
  selector: 'app-currentstat',
  imports: [CommonModule, FormsModule],
  templateUrl: './currentstat.component.html',
  styleUrl: './currentstat.component.css',
})
export class CurrentstatComponent {
  @Input() sheet!: CharacterSheet;
  @Input() name!: string;
  @Input() current!: number;
  @Input() color!: string;
  @Input() base!: number;
  @Input() bonus!: number;
  @Input() formula!: FormulaType;
  constructor(private cd: ChangeDetectorRef) {}

  // Map formula types to stat keys for skill modifiers
  private getStatusKey(): 'mana' | 'life' | 'energy' | null {
    switch (this.formula) {
      case FormulaType.LIFE:
        return 'life';
      case FormulaType.ENERGY:
        return 'energy';
      case FormulaType.MANA:
        return 'mana';
      default:
        return null;
    }
  }

  get effectBonus(): number {
    const statusKey = this.getStatusKey();
    if (!statusKey) return 0;

    let total = 0;

    // Add bonuses from skills
    if (this.sheet.skills) {
      for (const skill of this.sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statusKey) {
              const multiplier = skill.level || 1;
              total += modifier.amount * multiplier;
            }
          }
        }
      }
    }

    // Add bonuses from equipped items
    if (this.sheet.equipment) {
      for (const item of this.sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statusKey) {
              total += modifier.amount;
            }
          }
        }
      }
    }

    return total;
  }

  get effectSources(): string[] {
    const statusKey = this.getStatusKey();
    if (!statusKey) return [];

    const sources: string[] = [];

    // Collect sources from skills
    if (this.sheet.skills) {
      for (const skill of this.sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statusKey) {
              const multiplier = skill.level || 1;
              const amount = modifier.amount * multiplier;
              const sign = amount >= 0 ? '+' : '';
              sources.push(`${skill.name}: ${sign}${amount}`);
            }
          }
        }
      }
    }

    // Collect sources from equipment
    if (this.sheet.equipment) {
      for (const item of this.sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statusKey) {
              const sign = modifier.amount >= 0 ? '+' : '';
              sources.push(`${item.name}: ${sign}${modifier.amount}`);
            }
          }
        }
      }
    }

    return sources;
  }

  get statusMax(): number {
    var value = this.base + this.bonus + this.effectBonus;
    switch (this.formula) {
      case FormulaType.LIFE:
        return value + this.sheet.constitution.current * 5;
      case FormulaType.ENERGY:
        return value + this.sheet.dexterity.current * 5;
      case FormulaType.MANA:
        return value + this.sheet.intelligence.current * 5;
      default:
        return value;
    }
  }

  get barClass(): string {
    switch (this.formula) {
      case FormulaType.LIFE:
        return 'health';
      case FormulaType.ENERGY:
        return 'energy';
      case FormulaType.MANA:
        return 'mana';
      default:
        return '';
    }
  }

  @Output() patch = new EventEmitter<JsonPatch>();
  updateBase(path: string, value: any) {
    this.base = value;
    this.patch.emit({ path: path, value });
    this.cd.detectChanges();
  }
  updateCurrent(path: string, value: any) {
    this.current = value;
    this.patch.emit({ path: path, value });
    this.cd.detectChanges();
  }
  updateBonus(path: string, value: any) {
    this.bonus= value;
    this.patch.emit({ path, value });
    this.cd.detectChanges();
  }
}
