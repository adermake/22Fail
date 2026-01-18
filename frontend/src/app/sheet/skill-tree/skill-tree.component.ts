import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillDefinition } from '../../model/skill-definition.model';
import { SKILL_DEFINITIONS, getSkillById, getSkillsForClass } from '../../data/skill-definitions';
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

// Tier color definitions
export const TIER_COLORS = {
  1: '#22c55e',  // Green
  2: '#eab308',  // Yellow
  3: '#ef4444',  // Red
  4: '#a855f7',  // Purple
  5: '#3b82f6',  // Blue
} as const;

@Component({
  selector: 'app-skill-tree',
  standalone: true,
  imports: [CommonModule, ClassNodeComponent, SkillDetailComponent],
  templateUrl: './skill-tree.component.html',
  styleUrl: './skill-tree.component.css'
})
export class SkillTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('treeContainer') treeContainer!: ElementRef<HTMLDivElement>;

  @Input() sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() close = new EventEmitter<void>();

  selectedClass: string | null = null;
  classPositions: ClassPosition[] = [];
  connections: Connection[] = [];

  // Pan and zoom state
  scale = 1;
  panX = 0;
  panY = 0;
  isPanning = false;
  lastMouseX = 0;
  lastMouseY = 0;

  // Center of the tree
  centerX = 600;
  centerY = 600;

  // Ring radii for each tier - larger spacing to avoid overlap
  tierRadii = [0, 120, 240, 360, 480, 600];

  // Class hierarchy parsed from class-definitions
  classHierarchy: Map<string, string[]> = new Map();
  classParents: Map<string, string[]> = new Map();

  // Track angle allocations per tier to avoid overlaps
  tierAngleAllocations: Map<number, number[]> = new Map();

  ngOnInit() {
    this.parseClassHierarchy();
    this.calculateLayout();
  }

  ngAfterViewInit() {
    // Center the view on init
    setTimeout(() => {
      this.centerView();
    }, 0);
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
          const existingParents = this.classParents.get(child)!;
          parents.forEach(p => {
            if (!existingParents.includes(p)) {
              existingParents.push(p);
            }
          });
        });
      }
    });
  }

  // Find a non-overlapping angle for a given tier
  findAvailableAngle(tier: number, preferredAngle: number, minSeparation: number = 25): number {
    if (!this.tierAngleAllocations.has(tier)) {
      this.tierAngleAllocations.set(tier, []);
    }
    const allocations = this.tierAngleAllocations.get(tier)!;

    // Normalize angle to 0-360
    let angle = ((preferredAngle * 180 / Math.PI) % 360 + 360) % 360;

    // Check if angle is available
    const isAvailable = (testAngle: number) => {
      for (const allocated of allocations) {
        const diff = Math.abs(testAngle - allocated);
        const wrapDiff = Math.min(diff, 360 - diff);
        if (wrapDiff < minSeparation) {
          return false;
        }
      }
      return true;
    };

    // Try preferred angle first
    if (isAvailable(angle)) {
      allocations.push(angle);
      return angle * Math.PI / 180;
    }

    // Search for nearest available angle
    for (let offset = minSeparation; offset < 180; offset += 5) {
      if (isAvailable((angle + offset) % 360)) {
        const newAngle = (angle + offset) % 360;
        allocations.push(newAngle);
        return newAngle * Math.PI / 180;
      }
      if (isAvailable((angle - offset + 360) % 360)) {
        const newAngle = (angle - offset + 360) % 360;
        allocations.push(newAngle);
        return newAngle * Math.PI / 180;
      }
    }

    // Fallback: just use the preferred angle
    allocations.push(angle);
    return angle * Math.PI / 180;
  }

  calculateLayout() {
    const baseClasses = ['Magier', 'Kämpfer', 'Techniker'];
    const placed = new Set<string>();
    const classAngles = new Map<string, number>(); // Track angle for each class
    this.classPositions = [];
    this.connections = [];
    this.tierAngleAllocations.clear();

    // Place base classes in inner ring at 120° apart
    baseClasses.forEach((cls, index) => {
      const angle = (index * 120 - 90) * (Math.PI / 180); // Start from top
      const radius = this.tierRadii[1];

      this.tierAngleAllocations.set(1, this.tierAngleAllocations.get(1) || []);
      this.tierAngleAllocations.get(1)!.push((angle * 180 / Math.PI + 360) % 360);

      this.classPositions.push({
        name: cls,
        x: this.centerX + Math.cos(angle) * radius,
        y: this.centerY + Math.sin(angle) * radius,
        tier: 1,
        parents: []
      });
      placed.add(cls);
      classAngles.set(cls, angle);
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

        const parentAngle = classAngles.get(parentName) || 0;
        const unplacedChildren = children.filter(c => !placed.has(c));

        unplacedChildren.forEach((child, childIndex) => {
          // Calculate preferred angle based on parent
          const spreadAngle = 25 * (Math.PI / 180);
          const childCount = unplacedChildren.length;
          const startOffset = -(childCount - 1) / 2;
          const angleOffset = (startOffset + childIndex) * spreadAngle;
          const preferredAngle = parentAngle + angleOffset;

          // Find non-overlapping angle
          const actualAngle = this.findAvailableAngle(currentTier, preferredAngle);
          const radius = this.tierRadii[Math.min(currentTier, this.tierRadii.length - 1)];

          const childPos: ClassPosition = {
            name: child,
            x: this.centerX + Math.cos(actualAngle) * radius,
            y: this.centerY + Math.sin(actualAngle) * radius,
            tier: currentTier,
            parents: this.classParents.get(child) || []
          };

          this.classPositions.push(childPos);
          this.connections.push({ from: parentPos, to: childPos });
          placed.add(child);
          classAngles.set(child, actualAngle);
          nextToProcess.push(child);
        });

        // Add connections to already-placed children (multi-parent classes)
        children.filter(c => placed.has(c) && !unplacedChildren.includes(c)).forEach(child => {
          const childPos = this.classPositions.find(p => p.name === child);
          if (childPos) {
            // Check if connection already exists
            const exists = this.connections.some(
              c => c.from.name === parentName && c.to.name === child
            );
            if (!exists) {
              this.connections.push({ from: parentPos, to: childPos });
            }
          }
        });
      });

      toProcess = nextToProcess;
    }
  }

  // Pan and zoom methods
  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, this.scale * delta));

    // Zoom towards mouse position
    const rect = this.treeContainer?.nativeElement.getBoundingClientRect();
    if (rect) {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Adjust pan to zoom towards mouse
      this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    }

    this.scale = newScale;
  }

  onMouseDown(event: MouseEvent) {
    // Only pan with middle mouse or when not clicking on a node
    if (event.button === 1 || (event.target as HTMLElement).classList.contains('tree-inner')) {
      this.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;
      this.panX += deltaX;
      this.panY += deltaY;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  onMouseUp() {
    this.isPanning = false;
  }

  onMouseLeave() {
    this.isPanning = false;
  }

  centerView() {
    const container = this.treeContainer?.nativeElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      this.panX = rect.width / 2 - this.centerX * this.scale;
      this.panY = rect.height / 2 - this.centerY * this.scale;
    }
  }

  resetView() {
    this.scale = 1;
    this.centerView();
  }

  zoomIn() {
    this.scale = Math.min(3, this.scale * 1.2);
  }

  zoomOut() {
    this.scale = Math.max(0.3, this.scale / 1.2);
  }

  get transformStyle(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  selectClass(className: string) {
    this.selectedClass = this.selectedClass === className ? null : className;
  }

  getSkillsForSelectedClass(): SkillDefinition[] {
    if (!this.selectedClass) return [];
    return getSkillsForClass(this.selectedClass);
  }

  isSkillLearned(skillId: string): boolean {
    return (this.sheet.learnedSkillIds || []).includes(skillId);
  }

  getLearnedCountForClass(className: string): number {
    const classSkills = getSkillsForClass(className);
    return classSkills.filter(s => this.isSkillLearned(s.id)).length;
  }

  getTotalSkillsForClass(className: string): number {
    return getSkillsForClass(className).length;
  }

  getAvailableTalentPoints(): number {
    // Base points = level, plus any bonus points, minus spent points
    const basePoints = this.sheet.level || 1;
    const bonusPoints = this.sheet.talentPointsBonus || 0;
    const spentPoints = (this.sheet.learnedSkillIds || []).length;
    return basePoints + bonusPoints - spentPoints;
  }

  // Check if a class can have skills learned (needs 3 skills from at least one parent)
  canLearnFromClass(className: string): boolean {
    // Base classes (Tier 1) can always learn
    const classPos = this.classPositions.find(p => p.name === className);
    if (!classPos || classPos.tier === 1) return true;

    // For higher tiers, need 3 skills from at least one parent
    const parents = this.classParents.get(className) || [];
    for (const parent of parents) {
      const parentLearnedCount = this.getLearnedCountForClass(parent);
      if (parentLearnedCount >= 3) {
        return true;
      }
    }
    return false;
  }

  canLearnSkill(skill: SkillDefinition): boolean {
    if (this.isSkillLearned(skill.id)) return false;
    if (this.getAvailableTalentPoints() <= 0) return false;

    // Check if required skill is learned
    if (skill.requiresSkill && !this.isSkillLearned(skill.requiresSkill)) {
      return false;
    }

    // Check 3-skill prerequisite from parent class
    if (!this.canLearnFromClass(skill.class)) {
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
    // Use the skill's enlightened value from the definition
    const newSkillBlock: SkillBlock = {
      name: skill.name,
      class: skill.class,
      description: skill.description,
      type: skill.type === 'active' ? 'active' : 'passive',
      enlightened: skill.enlightened ?? false  // Use skill definition's enlightened value
    };

    const newSkills = [...(this.sheet.skills || []), newSkillBlock];
    this.patch.emit({
      path: 'skills',
      value: newSkills
    });
  }

  unlearnSkill(skill: SkillDefinition) {
    if (!this.isSkillLearned(skill.id)) return;

    // Remove from learned skill IDs
    const newLearnedIds = (this.sheet.learnedSkillIds || []).filter(id => id !== skill.id);
    this.patch.emit({
      path: 'learnedSkillIds',
      value: newLearnedIds
    });

    // Remove the skill from character's skills array
    // Match by name and class since we don't have a unique id on SkillBlock
    const newSkills = (this.sheet.skills || []).filter(
      s => !(s.name === skill.name && s.class === skill.class)
    );
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

  getTierColor(tier: number): string {
    return TIER_COLORS[tier as keyof typeof TIER_COLORS] || TIER_COLORS[5];
  }

  onClose() {
    this.close.emit();
  }
}
