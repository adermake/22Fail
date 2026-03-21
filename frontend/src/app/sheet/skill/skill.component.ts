import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillBlock } from '../../model/skill-block.model';
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

  constructor(private sanitizer: DomSanitizer) {}

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

  editSkill() {
    this.showContextMenu = false;
    this.openEditor.emit();
  }

  deleteSkill() {
    this.showContextMenu = false;
    this.delete.emit();
  }

  get definition(): SkillDefinition | undefined {
    if (this.skill.skillId) {
      return SKILL_DEFINITIONS.find(s => s.id === this.skill.skillId);
    }
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
    return !ClassTree.isClassEnabled(
      this.skill.class,
      this.sheet.primary_class,
      this.sheet.secondary_class
    );
  }

  get typeIcon(): string {
    const icons: Record<string, string> = {
      active: '⚡', passive: '🔮', dice_bonus: '🎲', stat_bonus: '📈'
    };
    return icons[this.effectiveType] ?? '✦';
  }

  get typeLabel(): string {
    const labels: Record<string, string> = {
      active: 'Aktiv', passive: 'Passiv', dice_bonus: 'Würfelbonus', stat_bonus: 'Stat-Bonus'
    };
    return labels[this.effectiveType] ?? this.effectiveType;
  }

  get costIcon(): string {
    const icons: Record<string, string> = { mana: '💧', energy: '⚡', life: '❤️' };
    return this.cost ? (icons[this.cost.type] ?? '◆') : '';
  }

  get actionIcon(): string {
    const icons: Record<string, string> = {
      'Aktion': '⚔', 'Bonusaktion': '✦', 'Keine Aktion': '◎', 'Reaktion': '↩'
    };
    return this.actionType ? (icons[this.actionType] ?? '') : '';
  }

  get enhancedDescription(): SafeHtml {
    const enhanced = KeywordEnhancer.enhance(this.skill.description || '');
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  // for stat_bonus: build compact summary e.g. "+1 INT"
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
      constitution: 'KON', chill: 'WIL', mana: 'MANA', life: 'LP', energy: 'EP', focus: 'FO'
    };
    return map[stat] ?? stat.toUpperCase().slice(0, 3);
  }
}
