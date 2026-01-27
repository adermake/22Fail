import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
} from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { required } from '@angular/forms/signals';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatBlock } from '../../model/stat-block.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';

@Component({
  selector: 'app-stat',
  imports: [CardComponent, FormsModule, CommonModule],
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.css',
})
export class StatComponent {
  @Input({ required: true }) stat!: StatBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  isPopupVisible = false;

  constructor(private cd: ChangeDetectorRef) {}

  // Map stat names to StatModifier stat keys
  private getStatKey(): 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill' | 'mana' | 'life' | 'energy' | null {
    const nameMap: Record<string, 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill' | 'mana' | 'life' | 'energy'> = {
      'Stärke': 'strength',
      'Geschicklichkeit': 'dexterity',
      'Geschwindigkeit': 'speed',
      'Intelligenz': 'intelligence',
      'Konstitution': 'constitution',
      'Chill': 'chill'
    };
    return nameMap[this.stat.name] || null;
  }

  get effectBonus(): number {
    const statKey = this.getStatKey();
    if (!statKey) return 0;

    let total = 0;

    // Add bonuses from skills
    if (this.sheet.skills) {
      for (const skill of this.sheet.skills) {
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
    if (this.sheet.equipment) {
      for (const item of this.sheet.equipment) {
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

  get effectSources(): string[] {
    const statKey = this.getStatKey();
    if (!statKey) return [];

    const sources: string[] = [];

    // Collect sources from skills
    if (this.sheet.skills) {
      for (const skill of this.sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
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
            if (modifier.stat === statKey) {
              const sign = modifier.amount >= 0 ? '+' : '';
              sources.push(`${item.name}: ${sign}${modifier.amount}`);
            }
          }
        }
      }
    }

    return sources;
  }

  get total(): number {
    const effectBonus = this.effectBonus;
    this.stat.current = (this.stat.base + this.stat.bonus + effectBonus + this.sheet.level / this.stat.gain) | 0;
    return this.stat.current;
  }

  get bonusNumeric(): number {
    return (-5 + this.total / 2) | 0;
  }

  get bonusValue(): string {
    const value = this.bonusNumeric;
    if (value < 0) {
      return '' + value;
    } else if (value > 0) {
      return '+' + value;
    }
    return '0';
  }
  pressed() {
    this.isPopupVisible = true;
    setTimeout(() => {
      this.isPopupVisible = false;
      this.cd.detectChanges();
    }, 1000);
  }

  get bonusClass(): string {
    const value = this.bonusNumeric;
    if (value < 0) return 'negative';
    if (value > 0) return 'positive';
    return '';
  }

  get popupClass(): string {
    if (this.isPopupVisible) return 'show';
    if (!this.isPopupVisible) return '';
    return '';
  }
  ngOnChanges() {
    this.cd.markForCheck(); // Trigger detection when inputs change
  }
  @Output() patch = new EventEmitter<JsonPatch>();
  updateField(path: string, value: any) {
    (this.stat as any)[path] = Number(value);
    this.patch.emit({ path, value });
    this.cd.detectChanges();
  }
}
