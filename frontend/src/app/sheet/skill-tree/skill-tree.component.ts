import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillDefinition, getSkillsForClass } from '../../model/skill-definition.model';
import { SKILL_DEFINITIONS, getSkillById } from '../../data/skill-definitions';
import { ClassNodeComponent } from './class-node/class-node.component';
import { SkillDetailComponent } from './skill-detail/skill-detail.component';
import { SkillBlock } from '../../model/skill-block.model';

interface ClassPosition {
  name: string;
  x: number;
  y: number;
  tier: number;
  parents: string[];
}

interface Connection {
  from: ClassPosition;
  to: ClassPosition;
}

@Component({
  selector: 'app-skill-tree',
  standalone: true,
  imports: [CommonModule, ClassNodeComponent, SkillDetailComponent],
  templateUrl: './skill-tree.component.html',
  styleUrl: './skill-tree.component.css'
})
export class SkillTreeComponent implements OnInit {
  @Input() sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() close = new EventEmitter<void>();

  selectedClass: string | null = null;
  classPositions: ClassPosition[] = [];
  connections: Connection[] = [];

  // Center of the tree
  centerX = 400;
  centerY = 400;

  // Ring radii for each tier
  tierRadii = [0, 100, 180, 260, 340, 420];

  // Class hierarchy parsed from class-definitions
  classHierarchy: Map<string, string[]> = new Map();
  classParents: Map<string, string[]> = new Map();

  ngOnInit() {
    this.parseClassHierarchy();
    this.calculateLayout();
  }

  parseClassHierarchy() {
    // Define the class tree based on class-definitions.txt
    const definitions = `
Magier: Kampfzauberer, Heiler
Kämpfer: Krieger, Barbar
Techniker: Schütze, Dieb
Kampfzauberer: Arkanist, Hämomant
Heiler: Seelenformer
Arkanist: Formationsmagier
Formationsmagier: Runenkünstler
Runenkünstler: Manalord
Hämomant: Nekromant
Seelenformer: Gestaltenwandler
Gestaltenwandler: Mentalist
Mentalist: Orakel
Schütze: Jäger, Schnellschütze
Jäger: Attentäter
Attentäter: Assassine
Dieb: Kampfakrobat
Kampfakrobat: Klingentänzer
Klingentänzer: Waffenmeister
Waffenmeister: Duellant
Krieger: Ritter, Mönch
Barbar: Berserker
Ritter: Erzritter
Erzritter: Wächter
Berserker: Plünderer
Plünderer: General
General: Kriegsherr
Ritter + Heiler: Paladin
Paladin: Dunkler Ritter
Mönch + Barbar: Templer
Templer: Koloss
Berserker + Templer: Omen
`;

    definitions.trim().split('\n').forEach(line => {
      const match = line.match(/^(.+?):\s*(.+)$/);
      if (match) {
        const parentPart = match[1].trim();
        const children = match[2].split(',').map(c => c.trim());

        // Handle multi-parent classes (e.g., "Ritter + Heiler")
        const parents = parentPart.split('+').map(p => p.trim());

        children.forEach(child => {
          // Store children for each parent
          parents.forEach(parent => {
            if (!this.classHierarchy.has(parent)) {
              this.classHierarchy.set(parent, []);
            }
            const existing = this.classHierarchy.get(parent)!;
            if (!existing.includes(child)) {
              existing.push(child);
            }
          });

          // Store parents for each child
          if (!this.classParents.has(child)) {
            this.classParents.set(child, []);
          }
          this.classParents.get(child)!.push(...parents);
        });
      }
    });
  }

  calculateLayout() {
    const baseClasses = ['Magier', 'Kämpfer', 'Techniker'];
    const placed = new Set<string>();
    this.classPositions = [];
    this.connections = [];

    // Place base classes in inner ring at 120° apart
    baseClasses.forEach((cls, index) => {
      const angle = (index * 120 - 90) * (Math.PI / 180); // Start from top
      const radius = this.tierRadii[1];
      this.classPositions.push({
        name: cls,
        x: this.centerX + Math.cos(angle) * radius,
        y: this.centerY + Math.sin(angle) * radius,
        tier: 1,
        parents: []
      });
      placed.add(cls);
    });

    // BFS to place children in subsequent tiers
    let currentTier = 1;
    let toProcess = [...baseClasses];

    while (toProcess.length > 0 && currentTier < 6) {
      const nextToProcess: string[] = [];
      currentTier++;

      toProcess.forEach(parentName => {
        const children = this.classHierarchy.get(parentName) || [];
        const parentPos = this.classPositions.find(p => p.name === parentName);
        if (!parentPos) return;

        children.forEach((child, childIndex) => {
          if (placed.has(child)) {
            // Already placed, just add connection
            const childPos = this.classPositions.find(p => p.name === child);
            if (childPos) {
              this.connections.push({ from: parentPos, to: childPos });
            }
            return;
          }

          // Calculate position for this child
          const parentAngle = Math.atan2(parentPos.y - this.centerY, parentPos.x - this.centerX);
          const spreadAngle = 25 * (Math.PI / 180); // Spread children by 25 degrees
          const childCount = children.filter(c => !placed.has(c)).length;
          const startOffset = -(childCount - 1) / 2;
          const angleOffset = (startOffset + childIndex) * spreadAngle;
          const childAngle = parentAngle + angleOffset;

          const radius = this.tierRadii[Math.min(currentTier, this.tierRadii.length - 1)];

          const childPos: ClassPosition = {
            name: child,
            x: this.centerX + Math.cos(childAngle) * radius,
            y: this.centerY + Math.sin(childAngle) * radius,
            tier: currentTier,
            parents: this.classParents.get(child) || []
          };

          this.classPositions.push(childPos);
          this.connections.push({ from: parentPos, to: childPos });
          placed.add(child);
          nextToProcess.push(child);
        });
      });

      toProcess = nextToProcess;
    }
  }

  selectClass(className: string) {
    this.selectedClass = this.selectedClass === className ? null : className;
  }

  getSkillsForSelectedClass(): SkillDefinition[] {
    if (!this.selectedClass) return [];
    return getSkillsForClass(SKILL_DEFINITIONS, this.selectedClass);
  }

  isSkillLearned(skillId: string): boolean {
    return (this.sheet.learnedSkillIds || []).includes(skillId);
  }

  getLearnedCountForClass(className: string): number {
    const classSkills = getSkillsForClass(SKILL_DEFINITIONS, className);
    return classSkills.filter(s => this.isSkillLearned(s.id)).length;
  }

  getTotalSkillsForClass(className: string): number {
    return getSkillsForClass(SKILL_DEFINITIONS, className).length;
  }

  getAvailableTalentPoints(): number {
    // Base points = level, plus any bonus points, minus spent points
    const basePoints = this.sheet.level || 1;
    const bonusPoints = this.sheet.talentPointsBonus || 0;
    const spentPoints = (this.sheet.learnedSkillIds || []).length;
    return basePoints + bonusPoints - spentPoints;
  }

  canLearnSkill(skill: SkillDefinition): boolean {
    if (this.isSkillLearned(skill.id)) return false;
    if (this.getAvailableTalentPoints() <= 0) return false;

    // Check if required skill is learned
    if (skill.requiresSkill && !this.isSkillLearned(skill.requiresSkill)) {
      return false;
    }

    return true;
  }

  learnSkill(skill: SkillDefinition) {
    if (!this.canLearnSkill(skill)) return;

    // Add to learned skill IDs
    const newLearnedIds = [...(this.sheet.learnedSkillIds || []), skill.id];
    this.patch.emit({
      path: 'learnedSkillIds',
      value: newLearnedIds
    });

    // Create a SkillBlock and add to character's skills
    const newSkillBlock: SkillBlock = {
      name: skill.name,
      class: skill.class,
      description: skill.description,
      type: skill.type === 'active' ? 'active' : 'passive',
      enlightened: true // Tree skills are always available
    };

    const newSkills = [...(this.sheet.skills || []), newSkillBlock];
    this.patch.emit({
      path: 'skills',
      value: newSkills
    });
  }

  isClassAccessible(className: string): boolean {
    // A class is accessible if the character has it as primary/secondary
    // or if one of their classes inherits from it
    const charClasses = [
      this.sheet.primary_class?.toLowerCase(),
      this.sheet.secondary_class?.toLowerCase()
    ].filter(Boolean);

    const targetLower = className.toLowerCase();

    // Direct match
    if (charClasses.includes(targetLower)) return true;

    // Check inheritance (simplified - you might want to use ClassTree here)
    // For now, just check direct parent relationship
    for (const charClass of charClasses) {
      const parents = this.classParents.get(className) || [];
      if (parents.some(p => p.toLowerCase() === charClass)) return true;
    }

    return false;
  }

  onClose() {
    this.close.emit();
  }
}
