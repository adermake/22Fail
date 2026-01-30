import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnDestroy } from '@angular/core';
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

export interface ActionExecution {
  id: string;
  actionName: string;
  actionIcon: string;
  actionColor: string;
  timestamp: Date;
  rolls: RollResult[];
  resourceChanges: ResourceChange[];
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

/**
 * Parsed dice formula structure
 */
interface ParsedDiceFormula {
  isValid: boolean;
  diceCount?: number;
  diceType?: number;
  operations: Array<{type: 'add' | 'subtract' | 'multiply' | 'divide', value: number}>;
  displayFormula: string;
  error?: string;
}

/**
 * Parse and validate dice formulas
 * Supports: XdY, XdY+Z, XdY-Z, XdY*Z, XdY/Z, plain numbers, complex: 2d6+3*2
 */
function parseDiceFormula(formula: string): ParsedDiceFormula {
  if (!formula || !formula.trim()) {
    return { isValid: false, operations: [], displayFormula: '', error: 'Empty formula' };
  }

  const cleaned = formula.trim().replace(/\s+/g, '');
  
  // Check for simple fixed number first
  const simpleNum = parseFloat(cleaned);
  if (!isNaN(simpleNum) && /^-?\d+(\.\d+)?$/.test(cleaned)) {
    return {
      isValid: true,
      operations: [{type: 'add', value: simpleNum}],
      displayFormula: simpleNum.toString()
    };
  }
  
  // Parse dice notation with operations: XdY[operations]
  // Supports: 2d6+3, 3d10*2, 1d20+5-2, etc.
  const diceMatch = cleaned.match(/^(\d+)d(\d+)(.*)$/i);
  
  if (!diceMatch) {
    return { isValid: false, operations: [], displayFormula: cleaned, error: 'Invalid dice format. Use format: XdY or XdY+Z' };
  }
  
  const diceCount = parseInt(diceMatch[1]);
  const diceType = parseInt(diceMatch[2]);
  const operationsStr = diceMatch[3] || '';
  
  // Validate dice values
  if (diceCount < 1 || diceCount > 100) {
    return { isValid: false, operations: [], displayFormula: cleaned, error: 'Dice count must be 1-100' };
  }
  if (diceType < 2 || diceType > 1000) {
    return { isValid: false, operations: [], displayFormula: cleaned, error: 'Dice type must be 2-1000' };
  }
  
  // Parse operations
  const operations: Array<{type: 'add' | 'subtract' | 'multiply' | 'divide', value: number}> = [];
  
  if (operationsStr) {
    // Match all operations: +5, -3, *2, /2
    const opMatches = operationsStr.matchAll(/([+\-*/])(\d+(\.\d+)?)/g);
    
    for (const match of opMatches) {
      const op = match[1];
      const value = parseFloat(match[2]);
      
      if (isNaN(value)) {
        return { isValid: false, operations: [], displayFormula: cleaned, error: 'Invalid operation value' };
      }
      
      switch (op) {
        case '+':
          operations.push({ type: 'add', value });
          break;
        case '-':
          operations.push({ type: 'subtract', value });
          break;
        case '*':
          operations.push({ type: 'multiply', value });
          break;
        case '/':
          if (value === 0) {
            return { isValid: false, operations: [], displayFormula: cleaned, error: 'Cannot divide by zero' };
          }
          operations.push({ type: 'divide', value });
          break;
      }
    }
    
    // Verify we parsed the entire operations string
    const reconstructed = operations.map(op => {
      const symbol = op.type === 'add' ? '+' : op.type === 'subtract' ? '-' : op.type === 'multiply' ? '*' : '/';
      return symbol + op.value;
    }).join('');
    
    if (reconstructed !== operationsStr) {
      return { isValid: false, operations: [], displayFormula: cleaned, error: 'Invalid formula syntax' };
    }
  }
  
  return {
    isValid: true,
    diceCount,
    diceType,
    operations,
    displayFormula: cleaned
  };
}

/**
 * Roll dice based on parsed formula
 */
function rollDiceFromParsedFormula(parsed: ParsedDiceFormula): { rolls: number[], total: number, formula: string } {
  if (!parsed.isValid) {
    return { rolls: [], total: 0, formula: '' };
  }
  
  let rolls: number[] = [];
  let total = 0;
  
  // Roll dice if applicable
  if (parsed.diceCount && parsed.diceType) {
    for (let i = 0; i < parsed.diceCount; i++) {
      const roll = Math.floor(Math.random() * parsed.diceType) + 1;
      rolls.push(roll);
      total += roll;
    }
  }
  
  // Apply operations in order
  for (const op of parsed.operations) {
    switch (op.type) {
      case 'add':
        total += op.value;
        break;
      case 'subtract':
        total -= op.value;
        break;
      case 'multiply':
        total *= op.value;
        break;
      case 'divide':
        total /= op.value;
        break;
    }
  }
  
  // Round to 2 decimal places if needed
  total = Math.round(total * 100) / 100;
  
  return { rolls, total, formula: parsed.displayFormula };
}

@Component({
  selector: 'app-action-macros',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './action-macros.component.html',
  styleUrls: ['./action-macros.component.css']
})
export class ActionMacrosComponent implements OnInit, OnDestroy {
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
  actionHistory = signal<ActionExecution[]>([]);
  
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
  
  // Grid configuration
  gridColumns = 4;
  gridRows = 6;
  draggedMacro: ActionMacro | null = null;

  // Computed: character skill names for validation
  characterSkillNames = computed(() => {
    if (!this.sheet?.skills) return [];
    return this.sheet.skills.map(s => s.name);
  });

  ngOnInit() {
    this.loadMacros();
    this.loadSavedDiceConfigs();
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    // Restore background scrolling
    document.body.style.overflow = '';
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

  // Formula parsing with validation - supports complex formulas
  parseAndValidateFormula(consequence: ActionConsequence): ParsedDiceFormula {
    const formula = consequence.diceFormula?.trim() || '';
    return parseDiceFormula(formula);
  }
  
  // Check if a formula is valid (for visual feedback)
  isFormulaValid(formula: string | undefined): boolean {
    if (!formula || !formula.trim()) return false;
    const parsed = parseDiceFormula(formula);
    return parsed.isValid;
  }
  
  // Get formula error message
  getFormulaError(formula: string | undefined): string {
    if (!formula || !formula.trim()) return '';
    const parsed = parseDiceFormula(formula);
    return parsed.error || '';
  }

  clearFormula(consequence: ActionConsequence) {
    if (consequence.savedDiceConfigId) {
      consequence.diceFormula = '';
    }
  }
  
  // Handle formula change event
  onFormulaChange(consequence: ActionConsequence) {
    // Clear saved config if user is typing a formula
    if (consequence.diceFormula && consequence.savedDiceConfigId) {
      consequence.savedDiceConfigId = '';
    }
  }
  
  // Handle saved config selection
  onSavedConfigSelected(consequence: ActionConsequence) {
    // Clear formula if user selected a saved config
    if (consequence.savedDiceConfigId) {
      consequence.diceFormula = '';
    }
  }

  // Roll dice from formula - uses new parser
  rollDiceFromFormula(consequence: ActionConsequence): { rolls: number[], total: number, formula: string } {
    // Use formula if available
    if (consequence.diceFormula) {
      const parsed = parseDiceFormula(consequence.diceFormula);
      if (parsed.isValid) {
        return rollDiceFromParsedFormula(parsed);
      }
    }
    
    // Fallback to empty result
    return { rolls: [], total: 0, formula: '' };
  }

  // Execute macro with roll results - grouped by action
  runMacroWithResults(macro: ActionMacro) {
    if (!this.areConditionsMet(macro)) return;
    
    const results: RollResult[] = [];
    const changes: ResourceChange[] = [];
    
    for (const consequence of macro.consequences) {
      let rollResult: { rolls: number[], total: number, formula: string } | null = null;
      
      // Determine how to get the value (formula or saved config)
      if (consequence.diceFormula) {
        // Use formula
        const parsed = parseDiceFormula(consequence.diceFormula);
        if (parsed.isValid) {
          rollResult = rollDiceFromParsedFormula(parsed);
        }
      } else if (consequence.savedDiceConfigId) {
        // Use saved config
        const config = this.savedDiceConfigs().find(c => c.id === consequence.savedDiceConfigId);
        if (config) {
          const rolls: number[] = [];
          for (let i = 0; i < config.diceCount; i++) {
            rolls.push(Math.floor(Math.random() * config.diceType) + 1);
          }
          const total = rolls.reduce((a, b) => a + b, 0) + config.manualBonus;
          rollResult = {
            rolls,
            total,
            formula: `${config.diceCount}d${config.diceType}${config.manualBonus > 0 ? '+' + config.manualBonus : ''}`
          };
        }
      }
      
      // Process based on consequence type
      if (consequence.type === 'dice_roll') {
        // Pure dice roll - just show the result
        if (rollResult) {
          results.push({
            id: generateUUID(),
            formula: rollResult.formula,
            rolls: rollResult.rolls,
            total: rollResult.total,
            isNew: true,
            name: consequence.rollName || 'Wurf',
            color: consequence.rollColor || '#f59e0b'
          });
        }
      } else if (consequence.type === 'spend_resource' || consequence.type === 'gain_resource') {
        // Resource change - can be dice-based or fixed
        const amount = rollResult ? rollResult.total : 0;
        const finalAmount = consequence.type === 'spend_resource' ? -amount : amount;
        
        // Add to resource changes
        changes.push({
          resource: consequence.resource || 'unknown',
          amount: finalAmount,
          isNew: true
        });
        
        // If it was a dice roll, also show the roll result
        if (rollResult && rollResult.rolls.length > 0) {
          results.push({
            id: generateUUID(),
            formula: rollResult.formula,
            rolls: rollResult.rolls,
            total: rollResult.total,
            isNew: true,
            name: consequence.rollName || (consequence.type === 'spend_resource' ? 'Kosten' : 'Gewinn'),
            color: consequence.rollColor || (consequence.type === 'spend_resource' ? '#ef4444' : '#22c55e')
          });
        }
      }
    }
    
    // Create action execution record
    const execution: ActionExecution = {
      id: generateUUID(),
      actionName: macro.name,
      actionIcon: macro.icon || '⚡',
      actionColor: macro.color || '#f59e0b',
      timestamp: new Date(),
      rolls: results,
      resourceChanges: changes,
      isNew: true
    };
    
    // Add to history (keep last 10 executions)
    this.actionHistory.update(history => {
      const updated = [execution, ...history];
      return updated.slice(0, 10);
    });
    
    // Apply resource changes to character
    for (const change of changes) {
      this.resourceChanged.emit({ resource: change.resource, amount: change.amount });
    }
    
    // Emit roll results for syncing with dice roller
    if (results.length > 0) {
      this.rollPerformed.emit(results);
    }
    
    // Animate out after delay
    setTimeout(() => {
      this.actionHistory.update(history => 
        history.map(exec => exec.id === execution.id ? { ...exec, isNew: false } : exec)
      );
    }, 600);
    
    // Emit macro execution
    this.executeMacro.emit(macro);
  }

  // Grid system methods
  getGridPosition(macro: ActionMacro): { x: number, y: number } {
    if (macro.gridX !== undefined && macro.gridY !== undefined) {
      return { x: macro.gridX, y: macro.gridY };
    }
    // Auto-assign position if not set
    const position = this.findNextEmptyGridCell();
    macro.gridX = position.x;
    macro.gridY = position.y;
    return position;
  }
  
  findNextEmptyGridCell(): { x: number, y: number } {
    const occupied = new Set<string>();
    for (const macro of this.macros()) {
      if (macro.gridX !== undefined && macro.gridY !== undefined) {
        occupied.add(`${macro.gridX},${macro.gridY}`);
      }
    }
    
    for (let y = 0; y < this.gridRows; y++) {
      for (let x = 0; x < this.gridColumns; x++) {
        if (!occupied.has(`${x},${y}`)) {
          return { x, y };
        }
      }
    }
    // If grid is full, place at end
    return { x: 0, y: this.gridRows };
  }
  
  isGridCellOccupied(x: number, y: number): boolean {
    return this.macros().some(m => m.gridX === x && m.gridY === y);
  }
  
  onDragStart(macro: ActionMacro) {
    this.draggedMacro = macro;
  }
  
  onDragEnd() {
    this.draggedMacro = null;
  }
  
  onCellClick(x: number, y: number) {
    if (!this.draggedMacro) return;
    
    // Check if cell is occupied
    if (this.isGridCellOccupied(x, y)) return;
    
    // Move macro to this cell
    this.macros.update(macros => {
      return macros.map(m => {
        if (m.id === this.draggedMacro!.id) {
          return { ...m, gridX: x, gridY: y };
        }
        return m;
      });
    });
    
    this.saveMacros();
    this.draggedMacro = null;
  }
  
  dropMacro(event: CdkDragDrop<ActionMacro[]>) {
    // Get mouse position relative to grid
    const gridElement = event.container.element.nativeElement;
    const rect = gridElement.getBoundingClientRect();
    const cellWidth = rect.width / this.gridColumns;
    const cellHeight = 120; // Approximate card height + gap
    
    const x = Math.floor((event.dropPoint.x - rect.left) / cellWidth);
    const y = Math.floor((event.dropPoint.y - rect.top + gridElement.scrollTop) / cellHeight);
    
    // Clamp to grid bounds
    const gridX = Math.max(0, Math.min(x, this.gridColumns - 1));
    const gridY = Math.max(0, Math.min(y, this.gridRows + 2)); // Allow extending grid
    
    // Check if target cell is occupied
    const targetOccupied = this.macros().find(m => m.gridX === gridX && m.gridY === gridY && m.id !== event.item.data.id);
    
    if (targetOccupied) {
      // Swap positions
      this.macros.update(macros => {
        return macros.map(m => {
          if (m.id === event.item.data.id) {
            return { ...m, gridX, gridY };
          } else if (m.id === targetOccupied.id) {
            return { ...m, gridX: event.item.data.gridX, gridY: event.item.data.gridY };
          }
          return m;
        });
      });
    } else {
      // Move to empty cell
      this.macros.update(macros => {
        return macros.map(m => {
          if (m.id === event.item.data.id) {
            return { ...m, gridX, gridY };
          }
          return m;
        });
      });
    }
    
    this.saveMacros();
  }

  onClose() {
    this.close.emit();
  }
}
