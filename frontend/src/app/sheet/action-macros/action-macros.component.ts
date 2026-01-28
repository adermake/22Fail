import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CharacterSheet } from '../../model/character-sheet-model';
import { 
  ActionMacro, 
  ActionCondition, 
  ActionConsequence,
  createEmptyActionMacro,
  createEmptyCondition,
  createEmptyConsequence,
  validateActionMacro
} from '../../model/action-macro.model';
import { FormulaType } from '../../model/formula-type.enum';
import { StatusBlock } from '../../model/status-block.model';

export interface RollResult {
  id: string;
  formula: string;
  rolls: number[];
  total: number;
  isNew: boolean;
  name?: string;
  color?: string;
}

export interface ResourceChange {
  resource: string;
  amount: number;
  isNew: boolean;
}

export interface SavedDiceConfig {
  id: string;
  name: string;
  diceType: number;
  diceCount: number;
  bonusNames: string[];
  manualBonus: number;
}

// Helper function to generate UUID (fallback for browsers without crypto.randomUUID)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers or insecure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Component({
  selector: 'app-action-macros',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './action-macros.component.html',
  styleUrls: ['./action-macros.component.css']
})
export class ActionMacrosComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() close = new EventEmitter<void>();
  @Output() executeMacro = new EventEmitter<ActionMacro>();
  @Output() rollPerformed = new EventEmitter<RollResult[]>(); // Sync with dice roller
  @Output() resourceChanged = new EventEmitter<{resource: string, amount: number}>(); // For applying changes

  // State
  macros = signal<ActionMacro[]>([]);
  showEditor = signal<boolean>(false);
  editingMacro = signal<ActionMacro | null>(null);
  isNewMacro = signal<boolean>(false);
  lastRollResults = signal<RollResult[]>([]);
  resourceChanges = signal<ResourceChange[]>([]);
  
  // Saved dice configs from dice roller (synced)
  savedDiceConfigs = signal<SavedDiceConfig[]>([]);

  // Available options
  resourceTypes = ['health', 'energy', 'mana', 'fokus'] as const;
  statTypes = ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'] as const;
  operators = ['>', '<', '>=', '<=', '==', '!='] as const;
  valueTypes = ['fixed', 'currentResource', 'maxResource', 'stat'] as const;
  diceTypes = [4, 6, 8, 10, 12, 20, 100];
  
  // FormulaType enum values for template
  formulaTypeLife = FormulaType.LIFE;
  formulaTypeEnergy = FormulaType.ENERGY;
  formulaTypeMana = FormulaType.MANA;
  
  // Available icons for actions
  availableIcons = ['⚡', '⚔️', '🛡️', '🔥', '❄️', '💫', '🌟', '💥', '🎯', '🗡️', '🏹', '✨', '💀', '❤️', '🔮', '📖'];

  // Computed: character skill names for validation
  characterSkillNames = computed(() => {
    if (!this.sheet?.skills) return [];
    return this.sheet.skills.map(s => s.name);
  });

  ngOnInit() {
    this.loadMacros();
    this.loadSavedDiceConfigs();
  }

  loadSavedDiceConfigs() {
    // Load saved dice configs from localStorage (same key as dice roller)
    const key = `dice-configs-${this.sheet.name}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.savedDiceConfigs.set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load dice configs:', e);
      }
    }
  }

  loadMacros() {
    // Load from localStorage for now (can be moved to backend later)
    const key = `actionMacros-${this.sheet.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const macros = JSON.parse(stored) as ActionMacro[];
        // Validate all macros
        this.macros.set(macros.map(m => ({
          ...m,
          isValid: validateActionMacro(m, this.characterSkillNames()).length === 0
        })));
      } catch (e) {
        console.error('Failed to load macros:', e);
        this.macros.set([]);
      }
    }
  }

  saveMacros() {
    const key = `actionMacros-${this.sheet.id}`;
    localStorage.setItem(key, JSON.stringify(this.macros()));
  }

  // Check if conditions are met
  areConditionsMet(macro: ActionMacro): boolean {
    if (!macro.isValid) return false;
    
    for (const condition of macro.conditions) {
      if (!this.evaluateCondition(condition)) {
        return false;
      }
    }
    return true;
  }

  evaluateCondition(condition: ActionCondition): boolean {
    let currentValue = 0;
    let comparisonValue = condition.value;

    // Get the left side value (what we're checking)
    if (condition.type === 'resource' && condition.resource) {
      currentValue = this.getResourceValue(condition.resource);
    } else if (condition.type === 'stat' && condition.stat) {
      currentValue = this.getStatValue(condition.stat);
    } else if (condition.type === 'skill' && condition.skillName) {
      // Check if skill exists
      const hasSkill = this.sheet.skills?.some(s => s.name === condition.skillName);
      return hasSkill ? true : false;
    }

    // Get the right side value (what we're comparing to)
    if (condition.valueType === 'fixed') {
      comparisonValue = condition.value;
    } else if (condition.valueType === 'currentResource' && condition.compareToResource) {
      comparisonValue = this.getResourceValue(condition.compareToResource);
    } else if (condition.valueType === 'maxResource' && condition.compareToResource) {
      comparisonValue = this.getResourceMax(condition.compareToResource);
    } else if (condition.valueType === 'stat' && condition.compareToStat) {
      comparisonValue = this.getStatValue(condition.compareToStat);
    }

    switch (condition.operator) {
      case '>': return currentValue > comparisonValue;
      case '<': return currentValue < comparisonValue;
      case '>=': return currentValue >= comparisonValue;
      case '<=': return currentValue <= comparisonValue;
      case '==': return currentValue === comparisonValue;
      case '!=': return currentValue !== comparisonValue;
      default: return false;
    }
  }

  getResourceValue(resource: string): number {
    if (!this.sheet?.statuses) return 0;
    
    const formulaTypeMap: Record<string, FormulaType> = {
      'health': FormulaType.LIFE,
      'energy': FormulaType.ENERGY,
      'mana': FormulaType.MANA
    };
    
    const formulaType = formulaTypeMap[resource];
    if (formulaType !== undefined) {
      const status = this.sheet.statuses.find(s => s.formulaType === formulaType);
      return status?.statusCurrent || 0;
    }
    
    return 0;
  }

  getResourceMax(resource: string): number {
    if (!this.sheet?.statuses) return 0;
    
    const formulaTypeMap: Record<string, FormulaType> = {
      'health': FormulaType.LIFE,
      'energy': FormulaType.ENERGY,
      'mana': FormulaType.MANA
    };
    
    const formulaType = formulaTypeMap[resource];
    if (formulaType !== undefined) {
      const status = this.sheet.statuses.find(s => s.formulaType === formulaType);
      if (status) {
        return (status.statusBase || 0) + (status.statusBonus || 0) + (status.statusEffectBonus || 0);
      }
    }
    
    return 0;
  }

  getStatValue(stat: string): number {
    const statObj = (this.sheet as any)[stat];
    return statObj?.current || 0;
  }

  // CRUD Operations
  createNewMacro() {
    const newMacro = createEmptyActionMacro();
    this.editingMacro.set(newMacro);
    this.isNewMacro.set(true);
    this.showEditor.set(true);
  }

  editMacro(macro: ActionMacro) {
    // Deep copy
    this.editingMacro.set(JSON.parse(JSON.stringify(macro)));
    this.isNewMacro.set(false);
    this.showEditor.set(true);
  }

  saveMacro() {
    const macro = this.editingMacro();
    if (!macro) return;

    macro.modifiedAt = new Date();
    
    // Update referenced skill names
    macro.referencedSkillNames = this.extractReferencedSkills(macro);
    
    // Validate
    macro.isValid = validateActionMacro(macro, this.characterSkillNames()).length === 0;

    if (this.isNewMacro()) {
      macro.order = this.macros().length;
      this.macros.update(m => [...m, macro]);
    } else {
      this.macros.update(m => m.map(existing => 
        existing.id === macro.id ? macro : existing
      ));
    }

    this.saveMacros();
    this.closeEditor();
  }

  deleteMacro(macroId: string) {
    if (confirm('Diese Aktion wirklich löschen?')) {
      this.macros.update(m => m.filter(macro => macro.id !== macroId));
      this.saveMacros();
    }
  }

  closeEditor() {
    this.showEditor.set(false);
    this.editingMacro.set(null);
    this.isNewMacro.set(false);
  }

  // Condition management
  addCondition() {
    const macro = this.editingMacro();
    if (!macro) return;
    
    macro.conditions.push(createEmptyCondition());
    this.editingMacro.set({ ...macro });
  }

  removeCondition(index: number) {
    const macro = this.editingMacro();
    if (!macro) return;
    
    macro.conditions.splice(index, 1);
    this.editingMacro.set({ ...macro });
  }

  // Consequence management  
  addConsequence() {
    const macro = this.editingMacro();
    if (!macro) return;
    
    macro.consequences.push(createEmptyConsequence());
    this.editingMacro.set({ ...macro });
  }

  removeConsequence(index: number) {
    const macro = this.editingMacro();
    if (!macro) return;
    
    macro.consequences.splice(index, 1);
    this.editingMacro.set({ ...macro });
  }

  // Execute macro
  runMacro(macro: ActionMacro) {
    if (!this.areConditionsMet(macro)) return;
    this.executeMacro.emit(macro);
  }

  // Helper
  extractReferencedSkills(macro: ActionMacro): string[] {
    const skills = new Set<string>();
    
    // Check conditions
    for (const condition of macro.conditions) {
      if (condition.type === 'skill' && condition.skillName) {
        skills.add(condition.skillName);
      }
    }
    
    // Check consequences for skill references in bonuses
    for (const consequence of macro.consequences) {
      if (consequence.bonuses) {
        for (const bonus of consequence.bonuses) {
          // If the bonus matches a skill name, add it
          const skill = this.sheet.skills?.find(s => s.name === bonus);
          if (skill) {
            skills.add(skill.name);
          }
        }
      }
    }
    
    return Array.from(skills);
  }

  getMissingSkills(macro: ActionMacro): string[] {
    return validateActionMacro(macro, this.characterSkillNames());
  }

  getConditionLabel(condition: ActionCondition): string {
    if (condition.type === 'skill') {
      return `Skill "${condition.skillName}" vorhanden`;
    }
    
    const target = condition.resource || condition.stat || '';
    let comparisonValue = '';
    
    if (condition.valueType === 'fixed') {
      comparisonValue = condition.value.toString();
    } else if (condition.valueType === 'currentResource') {
      comparisonValue = `aktuelle ${condition.compareToResource}`;
    } else if (condition.valueType === 'maxResource') {
      comparisonValue = `max ${condition.compareToResource}`;
    } else if (condition.valueType === 'stat') {
      comparisonValue = condition.compareToStat || '';
    }
    
    return `${target} ${condition.operator} ${comparisonValue}`;
  }

  getConsequenceLabel(consequence: ActionConsequence): string {
    switch (consequence.type) {
      case 'dice_roll':
        return `Würfle ${consequence.diceCount}d${consequence.diceType}`;
      case 'spend_resource':
        return `Ausgeben: ${consequence.amount} ${consequence.resource}`;
      case 'gain_resource':
        return `Erhalten: ${consequence.amount} ${consequence.resource}`;
      case 'apply_bonus':
        return `+${consequence.bonusValue} ${consequence.bonusName}`;
      default:
        return 'Unbekannt';
    }
  }

  // Resource bar methods for the UI
  getStatuses(): StatusBlock[] {
    return this.sheet?.statuses || [];
  }

  getResourceIcon(formulaType: FormulaType): string {
    switch (formulaType) {
      case FormulaType.LIFE: return '❤️';
      case FormulaType.ENERGY: return '⚡';
      case FormulaType.MANA: return '🔮';
      default: return '📊';
    }
  }

  getResourcePercent(status: StatusBlock): number {
    const max = this.getStatusMax(status);
    if (max === 0) return 0;
    return Math.min(100, Math.max(0, (status.statusCurrent / max) * 100));
  }

  getStatusMax(status: StatusBlock): number {
    return (status.statusBase || 0) + (status.statusBonus || 0) + (status.statusEffectBonus || 0);
  }

  getResourceName(status: StatusBlock): string {
    switch (status.formulaType) {
      case FormulaType.LIFE: return 'Leben';
      case FormulaType.ENERGY: return 'Energie';
      case FormulaType.MANA: return 'Mana';
      default: return 'Ressource';
    }
  }

  // Drag and drop for macro reordering
  dropMacro(event: CdkDragDrop<ActionMacro[]>) {
    const currentMacros = [...this.macros()];
    moveItemInArray(currentMacros, event.previousIndex, event.currentIndex);
    // Update order property
    currentMacros.forEach((m, i) => m.order = i);
    this.macros.set(currentMacros);
    this.saveMacros();
  }

  // Execute macro with roll results
  runMacroWithResults(macro: ActionMacro) {
    if (!this.areConditionsMet(macro)) return;
    
    // Collect dice roll results
    const results: RollResult[] = [];
    const changes: ResourceChange[] = [];
    
    for (const consequence of macro.consequences) {
      if (consequence.type === 'dice_roll') {
        let rolls: number[] = [];
        let count = consequence.diceCount || 1;
        let type = consequence.diceType || 6;
        
        // Check if using a saved dice config
        if (consequence.savedDiceConfigId) {
          const config = this.savedDiceConfigs().find(c => c.id === consequence.savedDiceConfigId);
          if (config) {
            count = config.diceCount;
            type = config.diceType;
          }
        }
        
        for (let i = 0; i < count; i++) {
          rolls.push(Math.floor(Math.random() * type) + 1);
        }
        
        const total = rolls.reduce((a, b) => a + b, 0);
        
        results.push({
          id: generateUUID(),
          formula: `${count}d${type}`,
          rolls,
          total,
          isNew: true,
          name: consequence.rollName,
          color: consequence.rollColor
        });
      } else if (consequence.type === 'spend_resource') {
        // Calculate amount - could be from a dice roll or fixed
        let amount = consequence.amount || 0;
        
        // If using a saved dice config for the amount
        if (consequence.savedDiceConfigId) {
          const config = this.savedDiceConfigs().find(c => c.id === consequence.savedDiceConfigId);
          if (config) {
            // Roll the dice to determine how much to spend
            let total = 0;
            const rolls: number[] = [];
            for (let i = 0; i < config.diceCount; i++) {
              const roll = Math.floor(Math.random() * config.diceType) + 1;
              rolls.push(roll);
              total += roll;
            }
            amount = total;
            
            // Also add this roll to results
            results.push({
              id: generateUUID(),
              formula: `${config.diceCount}d${config.diceType} (${consequence.resource})`,
              rolls,
              total,
              isNew: true,
              name: consequence.rollName,
              color: consequence.rollColor
            });
          }
        }
        
        changes.push({
          resource: consequence.resource || '',
          amount: -amount,
          isNew: true
        });
        
      } else if (consequence.type === 'gain_resource') {
        const amount = consequence.amount || 0;
        changes.push({
          resource: consequence.resource || '',
          amount: amount,
          isNew: true
        });
      }
    }
    
    // Update last roll results
    this.lastRollResults.set(results);
    this.resourceChanges.set(changes);
    
    // Emit resource changes ONCE for all consequences
    for (const change of changes) {
      this.resourceChanged.emit({ resource: change.resource, amount: change.amount });
    }
    
    // Emit roll results for syncing with dice roller
    if (results.length > 0) {
      this.rollPerformed.emit(results);
    }
    
    // Mark as not new after animation
    setTimeout(() => {
      this.lastRollResults.update(r => r.map(roll => ({ ...roll, isNew: false })));
      this.resourceChanges.update(r => r.map(change => ({ ...change, isNew: false })));
    }, 500);
    
    // Emit for other processing
    this.executeMacro.emit(macro);
  }

  onClose() {
    this.close.emit();
  }
}
