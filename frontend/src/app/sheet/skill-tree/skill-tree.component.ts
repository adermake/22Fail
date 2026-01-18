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
  from: string;
  to: string;
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
  scale = 0.8;
  panX = 0;
  panY = 0;
  isPanning = false;
  lastMouseX = 0;
  lastMouseY = 0;

  // Center of the tree
  centerX = 600;
  centerY = 600;

  // Ring radii for each tier
  tierRadii = [0, 120, 220, 320, 420, 520];

  // Class hierarchy parsed from class-definitions
  classHierarchy: Map<string, string[]> = new Map();
  classParents: Map<string, string[]> = new Map();

  ngOnInit() {
    this.parseClassHierarchy();
    this.buildFixedLayout();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.centerView();
    }, 0);
  }

  parseClassHierarchy() {
    // Parse from class-definitions.txt format
    const definitions = `
Magier: Kampfzauberer, Heiler
Kämpfer: Krieger, Barbar
Techniker: Schütze, Dieb
Kampfzauberer: Arkanist, Hämonant
Heiler: Seelenmagier
Arkanist: Formationsmagier
Formationsmagier: Runenkünstler
Runenkünstler: Manalord
Hämonant: Nekromant
Seelenmagier: Gestaltenwandler
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
Arkanist: Phantom
Schnellschütze: Artificer
`;

    definitions.trim().split('\n').forEach(line => {
      const match = line.match(/^(.+?):\s*(.+)$/);
      if (match) {
        const parentPart = match[1].trim();
        const children = match[2].split(',').map(c => c.trim());
        const parents = parentPart.split('+').map(p => p.trim());

        children.forEach(child => {
          parents.forEach(parent => {
            if (!this.classHierarchy.has(parent)) {
              this.classHierarchy.set(parent, []);
            }
            const existing = this.classHierarchy.get(parent)!;
            if (!existing.includes(child)) {
              existing.push(child);
            }
          });

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

  // Build layout matching the reference image
  buildFixedLayout() {
    this.classPositions = [];
    this.connections = [];

    // Define positions based on reference image angles (0° = right, going counter-clockwise)
    // The image shows: Magier at top, Kämpfer at bottom-right, Techniker at bottom-left

    const positions: { name: string; angle: number; tier: number }[] = [
      // Tier 1 - Base classes (inner ring)
      { name: 'Magier', angle: 90, tier: 1 },
      { name: 'Kämpfer', angle: -30, tier: 1 },
      { name: 'Techniker', angle: 210, tier: 1 },

      // Tier 2 - Magier branch
      { name: 'Kampfzauberer', angle: 115, tier: 2 },
      { name: 'Heiler', angle: 65, tier: 2 },

      // Tier 2 - Kämpfer branch
      { name: 'Krieger', angle: -10, tier: 2 },
      { name: 'Barbar', angle: -50, tier: 2 },

      // Tier 2 - Techniker branch
      { name: 'Schütze', angle: 185, tier: 2 },
      { name: 'Dieb', angle: 235, tier: 2 },

      // Tier 3 - Magier sub-branches
      { name: 'Arkanist', angle: 130, tier: 3 },
      { name: 'Hämonant', angle: 105, tier: 3 },
      { name: 'Seelenmagier', angle: 60, tier: 3 },

      // Tier 3 - Kämpfer sub-branches
      { name: 'Ritter', angle: 0, tier: 3 },
      { name: 'Mönch', angle: -20, tier: 3 },
      { name: 'Berserker', angle: -55, tier: 3 },

      // Tier 3 - Techniker sub-branches
      { name: 'Jäger', angle: 175, tier: 3 },
      { name: 'Schnellschütze', angle: 195, tier: 3 },
      { name: 'Kampfakrobat', angle: 240, tier: 3 },

      // Tier 4 - Magier deep branches
      { name: 'Formationsmagier', angle: 140, tier: 4 },
      { name: 'Phantom', angle: 125, tier: 4 },
      { name: 'Nekromant', angle: 95, tier: 4 },
      { name: 'Gestaltenwandler', angle: 55, tier: 4 },
      { name: 'Paladin', angle: 35, tier: 4 },

      // Tier 4 - Kämpfer deep branches
      { name: 'Erzritter', angle: 5, tier: 4 },
      { name: 'Templer', angle: -35, tier: 4 },
      { name: 'Plünderer', angle: -60, tier: 4 },

      // Tier 4 - Techniker deep branches
      { name: 'Attentäter', angle: 165, tier: 4 },
      { name: 'Artificer', angle: 200, tier: 4 },
      { name: 'Klingentänzer', angle: 250, tier: 4 },

      // Tier 5 - Deepest branches
      { name: 'Runenkünstler', angle: 145, tier: 5 },
      { name: 'Mentalist', angle: 50, tier: 5 },
      { name: 'Dunkler Ritter', angle: 40, tier: 5 },
      { name: 'Wächter', angle: 10, tier: 5 },
      { name: 'Koloss', angle: -30, tier: 5 },
      { name: 'Omen', angle: -45, tier: 5 },
      { name: 'General', angle: -65, tier: 5 },
      { name: 'Assassine', angle: 160, tier: 5 },
      { name: 'Waffenmeister', angle: 260, tier: 5 },

      // Tier 6 - Outermost
      { name: 'Manalord', angle: 150, tier: 6 },
      { name: 'Orakel', angle: 45, tier: 6 },
      { name: 'Kriegsherr', angle: -70, tier: 6 },
      { name: 'Duellant', angle: 270, tier: 6 },
    ];

    // Add extra tier radius for tier 6
    if (this.tierRadii.length < 7) {
      this.tierRadii.push(620);
    }

    // Create class positions
    positions.forEach(pos => {
      const angleRad = pos.angle * (Math.PI / 180);
      const radius = this.tierRadii[pos.tier] || this.tierRadii[this.tierRadii.length - 1];

      this.classPositions.push({
        name: pos.name,
        x: this.centerX + Math.cos(angleRad) * radius,
        y: this.centerY - Math.sin(angleRad) * radius, // Negative because Y is inverted
        tier: pos.tier,
        parents: this.classParents.get(pos.name) || []
      });
    });

    // Build connections based on class hierarchy
    this.classHierarchy.forEach((children, parent) => {
      children.forEach(child => {
        // Only add connection if both classes exist in our positions
        const parentExists = this.classPositions.some(p => p.name === parent);
        const childExists = this.classPositions.some(p => p.name === child);
        if (parentExists && childExists) {
          this.connections.push({ from: parent, to: child });
        }
      });
    });
  }

  getConnectionLine(conn: Connection): { x1: number; y1: number; x2: number; y2: number } | null {
    const from = this.classPositions.find(p => p.name === conn.from);
    const to = this.classPositions.find(p => p.name === conn.to);
    if (!from || !to) return null;
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  }

  // Pan and zoom methods
  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, this.scale * delta));

    const rect = this.treeContainer?.nativeElement.getBoundingClientRect();
    if (rect) {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    }

    this.scale = newScale;
  }

  onMouseDown(event: MouseEvent) {
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
    this.scale = 0.8;
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
    const basePoints = this.sheet.level || 1;
    const bonusPoints = this.sheet.talentPointsBonus || 0;
    const spentPoints = (this.sheet.learnedSkillIds || []).length;
    return basePoints + bonusPoints - spentPoints;
  }

  canLearnFromClass(className: string): boolean {
    const classPos = this.classPositions.find(p => p.name === className);
    if (!classPos || classPos.tier === 1) return true;

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

    if (skill.requiresSkill && !this.isSkillLearned(skill.requiresSkill)) {
      return false;
    }

    if (!this.canLearnFromClass(skill.class)) {
      return false;
    }

    return true;
  }

  learnSkill(skill: SkillDefinition) {
    if (!this.canLearnSkill(skill)) return;

    const newLearnedIds = [...(this.sheet.learnedSkillIds || []), skill.id];
    this.patch.emit({
      path: 'learnedSkillIds',
      value: newLearnedIds
    });

    const newSkillBlock: SkillBlock = {
      name: skill.name,
      class: skill.class,
      description: skill.description,
      type: skill.type === 'active' ? 'active' : 'passive',
      enlightened: skill.enlightened ?? false
    };

    const newSkills = [...(this.sheet.skills || []), newSkillBlock];
    this.patch.emit({
      path: 'skills',
      value: newSkills
    });
  }

  unlearnSkill(skill: SkillDefinition) {
    if (!this.isSkillLearned(skill.id)) return;

    const newLearnedIds = (this.sheet.learnedSkillIds || []).filter(id => id !== skill.id);
    this.patch.emit({
      path: 'learnedSkillIds',
      value: newLearnedIds
    });

    const newSkills = (this.sheet.skills || []).filter(
      s => !(s.name === skill.name && s.class === skill.class)
    );
    this.patch.emit({
      path: 'skills',
      value: newSkills
    });
  }

  isClassAccessible(className: string): boolean {
    const charClasses = [
      this.sheet.primary_class?.toLowerCase(),
      this.sheet.secondary_class?.toLowerCase()
    ].filter(Boolean);

    const targetLower = className.toLowerCase();

    if (charClasses.includes(targetLower)) return true;

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
