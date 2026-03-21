import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillBlock } from '../../model/skill-block.model';
import { StatusBlock } from '../../model/status-block.model';
import { FormulaType } from '../../model/formula-type.enum';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ClassTree } from '../class-tree-model';
import { KeywordEnhancer } from '../keyword-enhancer';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SKILL_DEFINITIONS, CLASS_DEFINITIONS } from '../../data/skill-definitions';
import { SkillDefinition } from '../../model/skill-definition.model';

@Component({
  selector: 'app-skill',
  imports: [CommonModule],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.css',
})
export class SkillComponent {
  @Input({ required: true }) skill!: SkillBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) index!: number;
  @Input() isEditing = false;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();
  @Output() openEditor = new EventEmitter<void>();

  showContextMenu = false;
  menuX = 0;
  menuY = 0;

  showPayPopup = false;
  payFeedback: { active: boolean; amount: number; label: string } = {
    active: false, amount: 0, label: '',
  };

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  @HostListener('document:click')
  closeMenu() { this.showContextMenu = false; }

  @HostListener('document:contextmenu')
  closeMenuOnCtx() { this.showContextMenu = false; }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.showContextMenu = true;
  }

  onCardClick() {
    if (this.cost && this.effectiveType === 'active') {
      this.showPayPopup = true;
    }
  }

  closePayPopup() {
    this.showPayPopup = false;
    this.payFeedback = { active: false, amount: 0, label: '' };
  }

  editSkill() {
    this.showContextMenu = false;
    this.openEditor.emit();
  }

  deleteSkill() {
    this.showContextMenu = false;
    this.delete.emit();
  }

  // --- Pay logic ---

  private getStatusForCostType(type: string): StatusBlock | undefined {
    const formulaMap: Record<string, FormulaType> = {
      energy: FormulaType.ENERGY,
      mana:   FormulaType.MANA,
      life:   FormulaType.LIFE,
    };
    const ft = formulaMap[type];
    if (!ft) return undefined;
    return this.sheet.statuses?.find(s => s.formulaType === ft);
  }

  get resourceStatus(): StatusBlock | undefined {
    if (!this.cost) return undefined;
    return this.getStatusForCostType(this.cost.type);
  }

  get resourceLabel(): string {
    const labels: Record<string, string> = { energy: 'Ausdauer', mana: 'Mana', life: 'Leben' };
    return this.cost ? (labels[this.cost.type] ?? this.cost.type) : '';
  }

  get resourceColor(): string {
    const colors: Record<string, string> = { energy: '#22c55e', mana: '#60a5fa', life: '#f87171' };
    return this.cost ? (colors[this.cost.type] ?? '#a78bfa') : '#a78bfa';
  }

  get canAfford(): boolean {
    const status = this.resourceStatus;
    if (!status || !this.cost) return false;
    return (status.statusCurrent ?? 0) >= this.cost.amount;
  }

  payAndUse() {
    const status = this.resourceStatus;
    if (!status || !this.cost || !this.canAfford) return;
    const amount = this.cost.amount;
    const label = this.resourceLabel;
    const statuses = this.sheet.statuses.map(s =>
      s === status
        ? { ...s, statusCurrent: Math.max(0, (s.statusCurrent ?? 0) - amount) }
        : s
    );
    this.sheet.statuses = statuses;
    this.patch.emit({ path: 'statuses', value: statuses });

    // Show ✓ feedback in button briefly, popup stays open
    this.payFeedback = { active: true, amount, label };
    this.cdr.markForCheck();
    setTimeout(() => {
      this.payFeedback = { active: false, amount: 0, label: '' };
      this.cdr.markForCheck();
    }, 1400);
  }

  // --- Definition lookups ---

  get definition(): SkillDefinition | undefined {
    if (this.skill.skillId) return SKILL_DEFINITIONS.find(s => s.id === this.skill.skillId);
    return SKILL_DEFINITIONS.find(s => s.name === this.skill.name && s.class === this.skill.class)
      ?? SKILL_DEFINITIONS.find(s => s.name === this.skill.name);
  }

  get effectiveType(): 'active' | 'passive' | 'dice_bonus' | 'stat_bonus' {
    return this.definition?.type ?? this.skill.type;
  }

  get cost(): { type: string; amount: number; perRound?: boolean } | undefined {
    return this.definition?.cost ?? this.skill.cost;
  }

  get actionType(): string | undefined {
    return this.definition?.actionType ?? this.skill.actionType;
  }

  get rankTier(): number | undefined {
    return CLASS_DEFINITIONS[this.skill.class]?.tier;
  }

  get rankRoman(): string {
    const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    const t = this.rankTier;
    return t ? (map[t] ?? String(t)) : '';
  }

  get isDisabled(): boolean {
    if (this.skill.enlightened) return false;
    return !ClassTree.isClassEnabled(this.skill.class, this.sheet.primary_class, this.sheet.secondary_class);
  }

  get typeIcon(): string {
    // Using Unicode escapes to avoid file-encoding issues with multi-byte emoji
    const icons: Record<string, string> = {
      active:     '\u26A1',           // lightning bolt
      passive:    '\uD83D\uDD2E',     // crystal ball
      dice_bonus: '\uD83C\uDFB2',     // dice
      stat_bonus: '\uD83D\uDCC8',     // chart
    };
    return icons[this.effectiveType] ?? '\u2726';
  }

  get typeLabel(): string {
    const labels: Record<string, string> = {
      active: 'Aktiv',
      passive: 'Passiv',
      dice_bonus: 'W\u00FCrfelbonus',
      stat_bonus: 'Stat-Bonus',
    };
    return labels[this.effectiveType] ?? this.effectiveType;
  }

  get costIcon(): string {
    const icons: Record<string, string> = {
      mana:   '\uD83D\uDCA7',  // water drop
      energy: '\u26A1',        // lightning bolt
      life:   '\u2764',        // heart
    };
    return this.cost ? (icons[this.cost.type] ?? '\u25C6') : '';
  }

  get actionIcon(): string {
    const icons: Record<string, string> = {
      'Aktion':        '\u2694',  // crossed swords
      'Bonusaktion':   '\u2726',  // star
      'Keine Aktion':  '\u25CE',  // bullseye
      'Reaktion':      '\u21A9',  // curved arrow
    };
    return this.actionType ? (icons[this.actionType] ?? '') : '';
  }

  get enhancedDescription(): SafeHtml {
    const enhanced = KeywordEnhancer.enhance(this.skill.description || '');
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  get statSummary(): string {
    const def = this.definition;
    if (!def) return '';
    const parts: string[] = [];
    if (def.statBonus) parts.push(`+${def.statBonus.amount} ${this.shortStat(def.statBonus.stat)}`);
    if (def.statBonuses) def.statBonuses.forEach(b => parts.push(`+${b.amount} ${this.shortStat(b.stat)}`));
    return parts.join(', ');
  }

  private shortStat(stat: string): string {
    const map: Record<string, string> = {
      intelligence: 'INT', strength: 'STR', dexterity: 'GES', speed: 'GES',
      constitution: 'KON', chill: 'WIL', mana: 'MANA', life: 'LP', energy: 'EP', focus: 'FO',
    };
    return map[stat] ?? stat.toUpperCase().slice(0, 3);
  }
}