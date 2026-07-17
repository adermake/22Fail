import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillBlock, StatModifier } from '../../model/skill-block.model';
import { ScriptEditorComponent } from '../../scripting/script-editor/script-editor.component';
import { actionMacroToScript, macroActionToScript } from '../../scripting/decompiler';

@Component({
  selector: 'app-skill-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ScriptEditorComponent],
  templateUrl: './skill-editor.component.html',
  styleUrl: './skill-editor.component.css',
})
export class SkillEditorComponent implements OnInit {
  @Input() skill: SkillBlock | null = null;
  @Output() save = new EventEmitter<SkillBlock>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  editSkill!: SkillBlock;
  isNewSkill = true;

  // Cost editing state
  editCostType = '';
  editCostAmount = 0;
  editCostPerRound = false;

  // Script mode (active skills): the "Aktionsmakro" toggle now edits a FailScript.
  macroMode = false;

  statModifiers: { [key: string]: number } = {
    strength: 0, dexterity: 0, speed: 0, intelligence: 0,
    constitution: 0, chill: 0, mana: 0, life: 0, energy: 0
  };

  readonly skillTypes: { value: SkillBlock['type']; label: string; icon: string }[] = [
    { value: 'active',     label: 'Aktiv',       icon: '\u26A1' },
    { value: 'passive',    label: 'Passiv',      icon: '\uD83D\uDD2E' },
    { value: 'dice_bonus', label: 'W\u00FCrfelbonus', icon: '\uD83C\uDFB2' },
    { value: 'stat_bonus', label: 'Stat-Bonus',  icon: '\uD83D\uDCC8' },
  ];

  readonly sourceOptions: { value: 'class' | 'race' | 'custom'; label: string; icon: string }[] = [
    { value: 'class',  label: 'Klasse',           icon: '\u2694\uFE0F' },
    { value: 'race',   label: 'Rasse',            icon: '\uD83E\uDDEC' },
    { value: 'custom', label: 'Benutzerdefiniert', icon: '\u2728' },
  ];

  ngOnInit() {
    if (this.skill) {
      this.editSkill = JSON.parse(JSON.stringify(this.skill));
      this.isNewSkill = false;
      // Derive skillSource from legacy sourceRaceId if not set
      if (!this.editSkill.skillSource) {
        this.editSkill.skillSource = this.editSkill.sourceRaceId ? 'race' : 'class';
      }
      if (this.editSkill.statModifiers) {
        for (const mod of this.editSkill.statModifiers) {
          this.statModifiers[mod.stat] = mod.amount;
        }
      }
      if (this.editSkill.cost) {
        this.editCostType = this.editSkill.cost.type;
        this.editCostAmount = this.editSkill.cost.amount;
        this.editCostPerRound = this.editSkill.cost.perRound ?? false;
      }
      // Migrate legacy macros to a FailScript so the user edits/executes the new system.
      if (this.editSkill.script || this.editSkill.embeddedMacroAction || this.editSkill.embeddedMacro) {
        this.macroMode = true;
        if (!this.editSkill.script) {
          this.editSkill.script = this.editSkill.embeddedMacroAction
            ? macroActionToScript(this.editSkill.embeddedMacroAction)
            : this.editSkill.embeddedMacro
              ? actionMacroToScript(this.editSkill.embeddedMacro)
              : '';
        }
      }
    } else {
      this.editSkill = {
        name: '',
        class: 'Allgemein',
        description: '',
        type: 'passive',
        enlightened: false,
        skillSource: 'class',
      };
    }
  }

  get skillSource(): 'class' | 'race' | 'custom' {
    return this.editSkill.skillSource ?? 'class';
  }

  setSource(src: 'class' | 'race' | 'custom') {
    this.editSkill.skillSource = src;
    if (src !== 'class') {
      this.editSkill.enlightened = false;
    }
  }

  setType(type: SkillBlock['type']) {
    this.editSkill.type = type;
    if (type !== 'active') {
      this.macroMode = false;
    }
  }

  enableMacroMode() {
    this.macroMode = true;
    if (!this.editSkill.script) this.editSkill.script = '';
  }

  disableMacroMode() {
    this.macroMode = false;
  }

  saveSkill() {
    const modifiers: StatModifier[] = [];
    for (const [stat, amount] of Object.entries(this.statModifiers)) {
      if (amount !== 0) {
        modifiers.push({ stat: stat as StatModifier['stat'], amount });
      }
    }

    if (this.editSkill.type === 'stat_bonus') {
      this.editSkill.statModifiers = modifiers.length > 0 ? modifiers : undefined;
    } else {
      // Non-stat_bonus: only keep stat modifiers (no resource boni)
      const statOnly = modifiers.filter(m => !['mana', 'life', 'energy'].includes(m.stat));
      this.editSkill.statModifiers = statOnly.length > 0 ? statOnly : undefined;
    }

    if (this.editSkill.type === 'active') {
      if (this.macroMode) {
        // Script mode — clear legacy macros (migrated) and the simple cost.
        this.editSkill.embeddedMacroAction = undefined;
        this.editSkill.embeddedMacro = undefined;
        this.editSkill.cost = undefined;
      } else if (this.editCostType) {
        this.editSkill.cost = {
          type: this.editCostType as 'mana' | 'energy' | 'life',
          amount: this.editCostAmount,
          perRound: this.editCostPerRound || undefined,
        };
        this.editSkill.script = undefined;
        this.editSkill.embeddedMacroAction = undefined;
        this.editSkill.embeddedMacro = undefined;
      } else {
        this.editSkill.cost = undefined;
        this.editSkill.script = undefined;
        this.editSkill.embeddedMacroAction = undefined;
        this.editSkill.embeddedMacro = undefined;
      }
    } else {
      this.editSkill.cost = undefined;
      this.editSkill.actionType = undefined;
      this.editSkill.script = undefined;
      this.editSkill.embeddedMacroAction = undefined;
      this.editSkill.embeddedMacro = undefined;
    }

    this.save.emit(this.editSkill);
  }

  cancelEdit() { this.cancel.emit(); }

  deleteSkill() {
    if (confirm('F\u00E4higkeit wirklich l\u00F6schen?')) {
      this.delete.emit();
    }
  }

  incrementStat(stat: string) { this.statModifiers[stat]++; }
  decrementStat(stat: string) { this.statModifiers[stat]--; }

  getStatLabel(stat: string): string {
    const labels: Record<string, string> = {
      strength: 'St\u00E4rke', dexterity: 'Geschick', speed: 'Tempo',
      intelligence: 'Intelligenz', constitution: 'Konstitution',
      chill: 'Wille', mana: 'Mana', life: 'Leben', energy: 'Ausdauer'
    };
    return labels[stat] || stat;
  }
}
