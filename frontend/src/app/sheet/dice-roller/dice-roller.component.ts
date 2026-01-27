import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SKILL_DEFINITIONS } from '../../data/skill-definitions';
import { WorldSocketService, DiceRollEvent } from '../../services/world-socket.service';
import { Subscription } from 'rxjs';

export interface DiceRoll {
  id: string;
  characterName: string;
  diceType: number;
  diceCount: number;
  bonuses: DiceBonus[];
  result: number;
  rolls: number[];
  timestamp: Date;
  isSecret?: boolean;
}

export interface DiceBonus {
  name: string;
  value: number;
  source: string; // 'skill', 'stat', 'manual'
}

export interface RollHistory {
  rolls: DiceRoll[];
}

@Component({
  selector: 'app-dice-roller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dice-roller.component.html',
  styleUrls: ['./dice-roller.component.css']
})
export class DiceRollerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() close = new EventEmitter<void>();

  private worldSocket = inject(WorldSocketService);
  private diceRollSub?: Subscription;

  // Dice rolling state
  selectedDiceType = signal<number>(20);
  diceCount = signal<number>(1);
  selectedBonuses = signal<Set<string>>(new Set());
  manualBonus = signal<number>(0);
  isSecretRoll = signal<boolean>(false); // Secret roll - only GM sees
  
  // Animation state
  isRolling = signal<boolean>(false);
  lastRoll = signal<DiceRoll | null>(null);
  
  // Received rolls from other players
  receivedRolls = signal<DiceRollEvent[]>([]);
  
  // Roll history (last 10 unique roll configurations)
  rollHistory = signal<RollHistory>({ rolls: [] });

  // Available options
  diceTypes = [4, 6, 8, 10, 12, 20, 100];

  // Computed values
  availableDiceBonuses = computed(() => {
    if (!this.sheet) return [];
    
    const bonuses: DiceBonus[] = [];
    
    // Get all dice_bonus skills that the character has
    const characterSkills = this.sheet.skills || [];
    
    characterSkills.forEach(skill => {
      // Match by skill name since skillId may not be set on character skills
      const definition = SKILL_DEFINITIONS.find(s => s.name === skill.name);
      if (definition && definition.type === 'dice_bonus' && (skill.level || 0) > 0) {
        // Extract bonus value from description (e.g., "+2 beim Würfeln")
        const match = definition.description.match(/\+(\d+)/);
        if (match) {
          bonuses.push({
            name: definition.name,
            value: parseInt(match[1]) * (skill.level || 1), // Multiply by skill level
            source: 'skill'
          });
        }
      }
    });
    
    return bonuses;
  });

  // Calculate stat effectBonus the same way as stat.component does
  private calculateStatEffectBonus(statKey: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill'): number {
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

  // Calculate stat total (base + bonus + level bonus + effect)
  private calculateStatCurrent(stat: any, statKey: string): number {
    if (!stat) return 0;
    const base = stat.base || 0;
    const bonus = stat.bonus || 0;
    const gain = stat.gain || 1;
    const effectBonus = this.calculateStatEffectBonus(statKey as any);
    const levelBonus = Math.floor(this.sheet.level / gain);
    return base + bonus + effectBonus + levelBonus;
  }

  // Calculate the dice modifier from stat (the purple/red number shown on sheet)
  // Uses the formula: (-5 + total / 2) | 0 (D&D-style modifier)
  private calculateStatDiceBonus(stat: any, statKey: string): number {
    const current = this.calculateStatCurrent(stat, statKey);
    // The dice bonus formula used in stat.component: (-5 + total / 2) | 0
    return (-5 + current / 2) | 0;
  }

  statBonuses = computed(() => {
    if (!this.sheet) return [];
    
    const bonuses: DiceBonus[] = [
      { name: 'Stärke', value: this.calculateStatDiceBonus(this.sheet.strength, 'strength'), source: 'stat' },
      { name: 'Geschicklichkeit', value: this.calculateStatDiceBonus(this.sheet.dexterity, 'dexterity'), source: 'stat' },
      { name: 'Konstitution', value: this.calculateStatDiceBonus(this.sheet.constitution, 'constitution'), source: 'stat' },
      { name: 'Intelligenz', value: this.calculateStatDiceBonus(this.sheet.intelligence, 'intelligence'), source: 'stat' },
      { name: 'Charisma', value: this.calculateStatDiceBonus(this.sheet.chill, 'chill'), source: 'stat' },
      { name: 'Geschwindigkeit', value: this.calculateStatDiceBonus(this.sheet.speed, 'speed'), source: 'stat' }
    ];
    
    return bonuses.filter(b => b.value !== 0);
  });

  totalBonus = computed(() => {
    let total = this.manualBonus();
    
    // Add selected bonuses
    const allBonuses = [...this.availableDiceBonuses(), ...this.statBonuses()];
    this.selectedBonuses().forEach(bonusName => {
      const bonus = allBonuses.find(b => b.name === bonusName);
      if (bonus) {
        total += bonus.value;
      }
    });
    
    return total;
  });

  ngOnInit() {
    this.loadRollHistory();
    
    // Listen for rolls from other players in the world
    if (this.sheet.worldName) {
      this.diceRollSub = this.worldSocket.diceRoll$.subscribe(roll => {
        // Don't add our own rolls (we already show them)
        if (roll.characterId !== this.sheet.id) {
          // For secret rolls, only show if we're a GM (checked by component using this)
          if (!roll.isSecret) {
            this.receivedRolls.update(rolls => [roll, ...rolls.slice(0, 4)]); // Keep last 5
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.diceRollSub?.unsubscribe();
  }

  toggleBonus(bonusName: string) {
    const current = new Set(this.selectedBonuses());
    if (current.has(bonusName)) {
      current.delete(bonusName);
    } else {
      current.add(bonusName);
    }
    this.selectedBonuses.set(current);
  }

  isBonusSelected(bonusName: string): boolean {
    return this.selectedBonuses().has(bonusName);
  }

  async roll() {
    if (this.isRolling()) return;
    
    this.isRolling.set(true);
    
    // Animate rolling
    await this.animateRoll();
    
    // Calculate actual roll
    const rolls: number[] = [];
    const diceType = this.selectedDiceType();
    const count = this.diceCount();
    
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * diceType) + 1);
    }
    
    const diceSum = rolls.reduce((a, b) => a + b, 0);
    const total = diceSum + this.totalBonus();
    
    // Get selected bonuses
    const allBonuses = [...this.availableDiceBonuses(), ...this.statBonuses()];
    const appliedBonuses: DiceBonus[] = [];
    
    this.selectedBonuses().forEach(bonusName => {
      const bonus = allBonuses.find(b => b.name === bonusName);
      if (bonus) {
        appliedBonuses.push(bonus);
      }
    });
    
    if (this.manualBonus() !== 0) {
      appliedBonuses.push({
        name: 'Manuell',
        value: this.manualBonus(),
        source: 'manual'
      });
    }
    
    const roll: DiceRoll = {
      id: `${Date.now()}-${Math.random()}`,
      characterName: this.sheet.name,
      diceType,
      diceCount: count,
      bonuses: appliedBonuses,
      result: total,
      rolls,
      timestamp: new Date(),
      isSecret: this.isSecretRoll()
    };
    
    this.lastRoll.set(roll);
    this.isRolling.set(false);
    
    // Add to history
    this.addToHistory(roll);
    
    // Broadcast to world via WebSocket
    if (this.sheet.worldName) {
      const rollEvent: DiceRollEvent = {
        id: roll.id,
        worldName: this.sheet.worldName,
        characterName: roll.characterName,
        characterId: this.sheet.id || '',
        diceType: roll.diceType,
        diceCount: roll.diceCount,
        bonuses: roll.bonuses,
        result: roll.result,
        rolls: roll.rolls,
        timestamp: roll.timestamp,
        isSecret: roll.isSecret || false
      };
      this.worldSocket.sendDiceRoll(rollEvent);
    }
  }

  async animateRoll() {
    // Simple animation - could be enhanced with CSS animations
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  repeatRoll(roll: DiceRoll) {
    // Set up the same configuration
    this.selectedDiceType.set(roll.diceType);
    this.diceCount.set(roll.diceCount);
    
    // Set bonuses
    const newBonuses = new Set<string>();
    let manualBonusValue = 0;
    
    roll.bonuses.forEach(bonus => {
      if (bonus.source === 'manual') {
        manualBonusValue = bonus.value;
      } else {
        newBonuses.add(bonus.name);
      }
    });
    
    this.selectedBonuses.set(newBonuses);
    this.manualBonus.set(manualBonusValue);
    
    // Roll immediately
    this.roll();
  }

  private addToHistory(roll: DiceRoll) {
    const history = this.rollHistory();
    
    // Check if this configuration already exists
    const existingIndex = history.rolls.findIndex(r => 
      r.diceType === roll.diceType &&
      r.diceCount === roll.diceCount &&
      JSON.stringify(r.bonuses) === JSON.stringify(roll.bonuses)
    );
    
    if (existingIndex >= 0) {
      // Update existing entry
      history.rolls[existingIndex] = roll;
    } else {
      // Add new entry
      history.rolls.unshift(roll);
      
      // Keep only last 10 unique configurations
      if (history.rolls.length > 10) {
        history.rolls = history.rolls.slice(0, 10);
      }
    }
    
    this.rollHistory.set({ rolls: [...history.rolls] });
    this.saveRollHistory();
  }

  private loadRollHistory() {
    try {
      const saved = localStorage.getItem(`dice-history-${this.sheet.name}`);
      if (saved) {
        const history = JSON.parse(saved) as RollHistory;
        // Convert timestamp strings back to Date objects
        history.rolls.forEach(r => r.timestamp = new Date(r.timestamp));
        this.rollHistory.set(history);
      }
    } catch (e) {
      console.error('Failed to load roll history', e);
    }
  }

  private saveRollHistory() {
    try {
      localStorage.setItem(`dice-history-${this.sheet.name}`, JSON.stringify(this.rollHistory()));
    } catch (e) {
      console.error('Failed to save roll history', e);
    }
  }

  getRollLabel(roll: DiceRoll): string {
    const bonusStr = roll.bonuses.length > 0 
      ? ` +${roll.bonuses.reduce((sum, b) => sum + b.value, 0)}`
      : '';
    return `${roll.diceCount}d${roll.diceType}${bonusStr}`;
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Gerade eben';
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)}h`;
    return `vor ${Math.floor(seconds / 86400)}d`;
  }

  onClose() {
    this.close.emit();
  }
}
