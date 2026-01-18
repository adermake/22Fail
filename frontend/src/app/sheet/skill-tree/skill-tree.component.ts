import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
export const TIER_COLORS: Record<number, string> = {
  1: '#22c55e',  // Green
  2: '#eab308',  // Yellow
  3: '#ef4444',  // Red
  4: '#a855f7',  // Purple
  5: '#3b82f6',  // Blue
};

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

  // Ring radii for each tier (5 tiers)
  tierRadii = [0, 100, 200, 320, 440, 560];

  // Class hierarchy parsed from class-definitions
  classHierarchy: Map<string, string[]> = new Map();
  classParents: Map<string, string[]> = new Map();
  classTiers: Map<string, number> = new Map();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadClassDefinitions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.centerView();
    }, 100);
  }

  loadClassDefinitions() {
    this.http.get('class-definitions.txt', { responseType: 'text' }).subscribe({
      next: (content) => {
        this.parseClassDefinitions(content);
        this.buildLayout();
        setTimeout(() => this.centerView(), 0);
      },
      error: (err) => {
        console.error('Failed to load class-definitions.txt', err);
        // Fallback to hardcoded definitions
        this.parseClassDefinitions(this.getFallbackDefinitions());
        this.buildLayout();
      }
    });
  }

  getFallbackDefinitions(): string {
    return `# Tier 1
Magier: Kampfzauberer, Heiler
Kämpfer: Krieger, Barbar
Techniker: Schütze, Dieb

# Tier 2
Kampfzauberer: Arkanist, Hämonant
Heiler: Seelenmagier, Paladin
Schütze: Jäger, Schnellschütze
Dieb: Kampfakrobat, Assassine
Krieger: Ritter, Mönch
Barbar: Berserker, Plünderer

# Tier 3
Arkanist: Formationsmagier, Phantom, Runenkünstler
Hämonant: Nekromant
Seelenmagier: Gestaltenwandler, Mentalist
Jäger: Attentäter
Kampfakrobat: Klingentänzer, Duellant
Ritter: Erzritter, Paladin, Wächter
Berserker: Kriegsherr, Omen
Plünderer: General
Mönch: Templer

# Tier 4
Formationsmagier: Manalord, Artificer
Runenkünstler: Manalord, Dunkler Ritter
Mentalist: Orakel, Nekromant
Assassine: Attentäter
Klingentänzer: Waffenmeister
Erzritter: Wächter
General: Kriegsherr
Paladin: Dunkler Ritter
Templer: Koloss, Omen

# Tier 5
Manalord:
Artificer:
Attentäter:
Duellant:
Waffenmeister:
Kriegsherr:
Omen:
Koloss:
Wächter:
Dunkler Ritter:
Orakel:
Nekromant:`;
  }

  parseClassDefinitions(content: string) {
    this.classHierarchy.clear();
    this.classParents.clear();
    this.classTiers.clear();

    let currentTier = 0;
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) continue;

      // Check for tier marker
      const tierMatch = trimmed.match(/^#\s*Tier\s*(\d+)/i);
      if (tierMatch) {
        currentTier = parseInt(tierMatch[1], 10);
        continue;
      }

      // Skip other comments
      if (trimmed.startsWith('#')) continue;

      // Parse class definition: "Parent: Child1, Child2" or "Parent1 + Parent2: Child"
      const match = trimmed.match(/^(.+?):\s*(.*)$/);
      if (match) {
        const parentPart = match[1].trim();
        const childrenPart = match[2].trim();

        // Handle multi-parent classes (e.g., "Ritter + Heiler")
        const parents = parentPart.split('+').map(p => p.trim());

        // Register parent classes at current tier if not already set
        parents.forEach(parent => {
          if (!this.classTiers.has(parent)) {
            this.classTiers.set(parent, currentTier);
          }
        });

        // Parse children (may be empty for leaf nodes)
        if (childrenPart) {
          const children = childrenPart.split(',').map(c => c.trim()).filter(c => c);

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

            // Child is one tier below parent
            if (!this.classTiers.has(child)) {
              this.classTiers.set(child, currentTier + 1);
            }
          });
        }
      }
    }
  }

  buildLayout() {
    this.classPositions = [];
    this.connections = [];

    // Group classes by tier
    const tierClasses: Map<number, string[]> = new Map();
    this.classTiers.forEach((tier, className) => {
      if (!tierClasses.has(tier)) {
        tierClasses.set(tier, []);
      }
      tierClasses.get(tier)!.push(className);
    });

    // Define angle sectors for the three main branches
    // Magier: top (60° to 150°), Kämpfer: bottom-right (-60° to 30°), Techniker: bottom-left (180° to 270°)
    const branchAngles: Record<string, { start: number; end: number }> = {
      'Magier': { start: 50, end: 140 },
      'Kämpfer': { start: -70, end: 20 },
      'Techniker': { start: 160, end: 280 },
    };

    // Track which branch each class belongs to
    const classBranch: Map<string, string> = new Map();
    const baseClasses = ['Magier', 'Kämpfer', 'Techniker'];
    baseClasses.forEach(bc => classBranch.set(bc, bc));

    // Propagate branch assignment through hierarchy
    const assignBranches = () => {
      let changed = true;
      while (changed) {
        changed = false;
        this.classHierarchy.forEach((children, parent) => {
          const parentBranch = classBranch.get(parent);
          if (parentBranch) {
            children.forEach(child => {
              if (!classBranch.has(child)) {
                classBranch.set(child, parentBranch);
                changed = true;
              }
            });
          }
        });
      }
    };
    assignBranches();

    // Place classes tier by tier
    const placedClasses = new Set<string>();

    // Place base classes first (Tier 1)
    baseClasses.forEach((cls, index) => {
      const angles = branchAngles[cls];
      const centerAngle = (angles.start + angles.end) / 2;
      const angleRad = centerAngle * (Math.PI / 180);
      const radius = this.tierRadii[1];

      this.classPositions.push({
        name: cls,
        x: this.centerX + Math.cos(angleRad) * radius,
        y: this.centerY - Math.sin(angleRad) * radius,
        tier: 1,
        parents: []
      });
      placedClasses.add(cls);
    });

    // Place remaining tiers
    for (let tier = 2; tier <= 5; tier++) {
      const classesInTier = tierClasses.get(tier) || [];

      // Group by branch
      const branchClasses: Map<string, string[]> = new Map();
      classesInTier.forEach(cls => {
        if (placedClasses.has(cls)) return;
        const branch = classBranch.get(cls) || 'Magier';
        if (!branchClasses.has(branch)) {
          branchClasses.set(branch, []);
        }
        branchClasses.get(branch)!.push(cls);
      });

      // Place classes in each branch
      branchClasses.forEach((classes, branch) => {
        const angles = branchAngles[branch] || branchAngles['Magier'];
        const angleRange = angles.end - angles.start;
        const count = classes.length;

        classes.forEach((cls, index) => {
          // Distribute evenly within the branch's angle range
          const angle = count === 1
            ? (angles.start + angles.end) / 2
            : angles.start + (angleRange * (index + 0.5)) / count;

          const angleRad = angle * (Math.PI / 180);
          const radius = this.tierRadii[tier] || this.tierRadii[this.tierRadii.length - 1];

          this.classPositions.push({
            name: cls,
            x: this.centerX + Math.cos(angleRad) * radius,
            y: this.centerY - Math.sin(angleRad) * radius,
            tier: tier,
            parents: this.classParents.get(cls) || []
          });
          placedClasses.add(cls);
        });
      });
    }

    // Build connections based on class hierarchy
    this.classHierarchy.forEach((children, parent) => {
      children.forEach(child => {
        const parentExists = this.classPositions.some(p => p.name === parent);
        const childExists = this.classPositions.some(p => p.name === child);
        if (parentExists && childExists) {
          // Avoid duplicate connections
          const exists = this.connections.some(c => c.from === parent && c.to === child);
          if (!exists) {
            this.connections.push({ from: parent, to: child });
          }
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
    return TIER_COLORS[tier] || TIER_COLORS[5];
  }

  onClose() {
    this.close.emit();
  }
}
