import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SKILL_DEFINITIONS } from '../../data/skill-definitions';
import { WorldSocketService } from '../../services/world-socket.service';

export interface DiceRoll {
  id: string;
  characterName: string;
  diceType: number;
  diceCount: number;
  bonuses: DiceBonus[];
  result: number;
  rolls: number[];
  timestamp: Date;
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
export class DiceRollerComponent implements OnInit {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() close = new EventEmitter<void>();

  private worldSocket = inject(WorldSocketService);

  // Dice rolling state
  selectedDiceType = signal<number>(20);
  diceCount = signal<number>(1);
  selectedBonuses = signal<Set<string>>(new Set());
  manualBonus = signal<number>(0);
  
  // Animation state
  isRolling = signal<boolean>(false);
  lastRoll = signal<DiceRoll | null>(null);
  
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
      const definition = SKILL_DEFINITIONS.find(s => s.id === skill.skillId);
      if (definition && definition.type === 'dice_bonus' && (skill.level || 0) > 0) {
        // Extract bonus value from description (e.g., "+2 beim Würfeln")
        const match = definition.description.match(/\+(\d+)/);
        if (match) {
          bonuses.push({
            name: definition.name,
            value: parseInt(match[1]),
            source: 'skill'
          });
        }
      }
    });
    
    return bonuses;
  });

  statBonuses = computed(() => {
    if (!this.sheet) return [];
    
    const bonuses: DiceBonus[] = [
      { name: 'Stärke', value: this.sheet.strength?.effectBonus || 0, source: 'stat' },
      { name: 'Geschicklichkeit', value: this.sheet.dexterity?.effectBonus || 0, source: 'stat' },
      { name: 'Konstitution', value: this.sheet.constitution?.effectBonus || 0, source: 'stat' },
      { name: 'Intelligenz', value: this.sheet.intelligence?.effectBonus || 0, source: 'stat' },
      { name: 'Charisma', value: this.sheet.chill?.effectBonus || 0, source: 'stat' },
      { name: 'Geschwindigkeit', value: this.sheet.speed?.effectBonus || 0, source: 'stat' }
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
      // Using direct socket listener since WorldSocketService doesn't have generic on() method
      // We'll need to add this to the backend socket handling
      // For now, this will be set up when the backend adds diceRoll event support
    }
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
      timestamp: new Date()
    };
    
    this.lastRoll.set(roll);
    this.isRolling.set(false);
    
    // Add to history
    this.addToHistory(roll);
    
    // Broadcast to world (will need backend support for diceRoll event)
    // TODO: Add diceRoll event to WorldSocketService and backend
    // if (this.sheet.worldName) {
    //   this.worldSocket.emit('diceRoll', roll);
    // }
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
