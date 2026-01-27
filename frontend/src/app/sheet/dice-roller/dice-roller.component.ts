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
  context?: string; // e.g., "auf Zauber mit voller Mana"
}

export interface DiceConfig {
  id: string;
  name: string;
  diceType: number;
  diceCount: number;
  bonusNames: string[];
  manualBonus: number;
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
  isAnimating = signal<boolean>(false);
  lastRoll = signal<DiceRoll | null>(null);
  
  // Received rolls from other players
  receivedRolls = signal<DiceRollEvent[]>([]);
  
  // Roll history (last 10 unique roll configurations)
  rollHistory = signal<RollHistory>({ rolls: [] });
  
  // Saved configurations
  savedConfigs = signal<DiceConfig[]>([]);
  showSavedList = signal<boolean>(true);
  newConfigName = '';
  
  // Expose Math for template
  Math = Math;
  
  // Audio for dice roll
  private rollSound: HTMLAudioElement | null = null;

  // Available options
  diceTypes = [4, 6, 8, 10, 12, 20, 100];

  // Computed dice formula string (e.g., "2d20+5")
  diceFormula = computed(() => {
    const count = this.diceCount();
    const type = this.selectedDiceType();
    const bonus = this.totalBonus();
    let formula = `${count}d${type}`;
    if (bonus !== 0) {
      formula += bonus > 0 ? `+${bonus}` : `${bonus}`;
    }
    return formula;
  });

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
          // Extract context from description (everything after the number)
          const contextMatch = definition.description.match(/\+\d+\s*(.+)/);
          bonuses.push({
            name: definition.name,
            value: parseInt(match[1]) * (skill.level || 1), // Multiply by skill level
            source: 'skill',
            context: contextMatch ? contextMatch[1] : undefined
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
  // Matches stat.component.ts: (base + bonus + effectBonus + level/gain) | 0
  private calculateStatCurrent(stat: any, statKey: string): number {
    if (!stat) return 0;
    const base = stat.base || 0;
    const bonus = stat.bonus || 0;
    const gain = stat.gain || 1;
    const effectBonus = this.calculateStatEffectBonus(statKey as any);
    // Level bonus = level / gain (how many times level fits into gain)
    const levelBonus = (this.sheet.level / gain) | 0;
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
    this.loadSavedConfigs();
    this.initRollSound();
    this.loadSyncedActionRolls();
    
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

  // Load synced roll results from action macros
  private loadSyncedActionRolls() {
    const stored = localStorage.getItem('action-roll-results');
    if (stored) {
      try {
        const results = JSON.parse(stored);
        if (results && results.length > 0) {
          // Convert action roll results to our history format
          results.forEach((result: any) => {
            const roll: DiceRoll = {
              id: result.id,
              characterName: this.sheet.name,
              diceType: parseInt(result.formula.split('d')[1]) || 20,
              diceCount: parseInt(result.formula.split('d')[0]) || 1,
              bonuses: [],
              result: result.total,
              rolls: result.rolls,
              timestamp: new Date()
            };
            this.rollHistory.update(h => ({
              rolls: [roll, ...h.rolls.slice(0, 9)]
            }));
          });
          // Clear after reading to avoid duplicates
          localStorage.removeItem('action-roll-results');
        }
      } catch (e) {
        console.error('Failed to load synced action rolls:', e);
      }
    }
  }

  ngOnDestroy() {
    this.diceRollSub?.unsubscribe();
  }

  // Initialize dice roll sound
  private initRollSound() {
    // Create a simple dice roll sound using Web Audio API
    this.rollSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVQIj6PLwZ14MQ+E1uvl0pZlAQBfnNPq7LqBT+7uubvV8ei/Nx1u0fbuqXkmAKzw//+rZTofrdnt/5Z3LyKWy+/+tX0vH4fG7f/Hi0osaMjq/7eYPyZYsuT/1aNREV657/z/l2wdB1qf2er9qnwyDl+XyvKvhT4UUInB7rKKRxVGbJ/Xx5dOICdOXoO2s2orCBYrVHOhsGszCgAJGEBniqhiOwobJy9EYoOUZEoqKjQaHSw+VGmBbkguNjwsGRQhNERZbmtSQUxNQy0eDRQjN05mZU5DSkI9Ly0hERUiMEhebVZAPz02Li8oIiMiLDZIVk1BP0E8NjM0Li4sJiorNEFMRDs+QDs3NDUyNDEvMjY8Q0M9PD8+Ozg3NjY2NzQ4PEA+Ozw+Pjo5ODg5ODk6Ozw8Ozs8PDw7Ozs7PDw8PD08PD09PT4+Pj4+Pz8/Pz9AQEBAQEBAQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB');
  }

  // Play the dice roll sound
  private playRollSound() {
    if (this.rollSound) {
      this.rollSound.currentTime = 0;
      this.rollSound.volume = 0.3;
      this.rollSound.play().catch(() => {}); // Ignore autoplay restrictions
    }
  }

  // Parse dice formula like "2d6+3" or "1d20-5"
  parseDiceFormula(formula: string) {
    const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
    if (match) {
      const count = match[1] ? parseInt(match[1]) : 1;
      const type = parseInt(match[2]);
      const bonus = match[3] ? parseInt(match[3]) : 0;
      
      if (this.diceTypes.includes(type) || type > 0) {
        this.diceCount.set(Math.min(20, Math.max(1, count)));
        this.selectedDiceType.set(type);
        this.manualBonus.set(bonus);
      }
    }
  }

  // Select a dice type
  selectDice(type: number) {
    this.selectedDiceType.set(type);
  }

  // Save/Load configurations
  saveConfiguration() {
    if (!this.newConfigName.trim()) return;
    
    const config: DiceConfig = {
      id: `config-${Date.now()}`,
      name: this.newConfigName.trim(),
      diceType: this.selectedDiceType(),
      diceCount: this.diceCount(),
      bonusNames: Array.from(this.selectedBonuses()),
      manualBonus: this.manualBonus()
    };
    
    this.savedConfigs.update(configs => [...configs, config]);
    this.saveSavedConfigs();
    this.newConfigName = '';
  }

  loadConfiguration(config: DiceConfig) {
    this.selectedDiceType.set(config.diceType);
    this.diceCount.set(config.diceCount);
    this.manualBonus.set(config.manualBonus);
    this.selectedBonuses.set(new Set(config.bonusNames));
  }

  deleteConfiguration(id: string) {
    this.savedConfigs.update(configs => configs.filter(c => c.id !== id));
    this.saveSavedConfigs();
  }

  private loadSavedConfigs() {
    try {
      const saved = localStorage.getItem(`dice-configs-${this.sheet.name}`);
      if (saved) {
        this.savedConfigs.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load saved configs', e);
    }
  }

  private saveSavedConfigs() {
    try {
      localStorage.setItem(`dice-configs-${this.sheet.name}`, JSON.stringify(this.savedConfigs()));
    } catch (e) {
      console.error('Failed to save configs', e);
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
    this.isAnimating.set(false);
    
    // Play sound
    this.playRollSound();
    
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
    
    // Trigger animation
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 600);
    
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
