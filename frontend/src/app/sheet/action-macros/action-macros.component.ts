import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-action-macros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-macros.component.html',
  styleUrls: ['./action-macros.component.css']
})
export class ActionMacrosComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() close = new EventEmitter<void>();
  @Output() executeMacro = new EventEmitter<ActionMacro>();

  // State
  macros = signal<ActionMacro[]>([]);
  showEditor = signal<boolean>(false);
  editingMacro = signal<ActionMacro | null>(null);
  isNewMacro = signal<boolean>(false);

  // Available options
  resourceTypes = ['health', 'energy', 'mana', 'fokus'] as const;
  statTypes = ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'] as const;
  operators = ['>', '<', '>=', '<=', '==', '!='] as const;
  diceTypes = [4, 6, 8, 10, 12, 20, 100];

  // Computed: character skill names for validation
  characterSkillNames = computed(() => {
    if (!this.sheet?.skills) return [];
    return this.sheet.skills.map(s => s.name);
  });

  ngOnInit() {
    this.loadMacros();
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

    if (condition.type === 'resource' && condition.resource) {
      currentValue = this.getResourceValue(condition.resource);
    } else if (condition.type === 'stat' && condition.stat) {
      currentValue = this.getStatValue(condition.stat);
    } else if (condition.type === 'skill' && condition.skillName) {
      // Check if skill exists
      const hasSkill = this.sheet.skills?.some(s => s.name === condition.skillName);
      return hasSkill ? true : false;
    }

    switch (condition.operator) {
      case '>': return currentValue > condition.value;
      case '<': return currentValue < condition.value;
      case '>=': return currentValue >= condition.value;
      case '<=': return currentValue <= condition.value;
      case '==': return currentValue === condition.value;
      case '!=': return currentValue !== condition.value;
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
    return `${target} ${condition.operator} ${condition.value}`;
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

  onClose() {
    this.close.emit();
  }
}
