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

  // Drag node state
  isDraggingNode = false;
  draggedClassName: string | null = null;
  editMode = false; // Toggle for edit mode

  // Center of the tree
  centerX = 600;
  centerY = 600;

  // Ring radii for each tier (5 tiers)
  tierRadii = [0, 100, 200, 320, 440, 560];

  // Class hierarchy parsed from class-definitions
  classHierarchy: Map<string, string[]> = new Map();
  classParents: Map<string, string[]> = new Map();
  classTiers: Map<string, number> = new Map();
  classManualAngles: Map<string, number> = new Map(); // Manual angle overrides

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
    this.classManualAngles.clear();

    let currentTier = 0;
    const lines = content.split('\n');

    // Helper to parse class name with optional angle: "ClassName@45" or "ClassName"
    const parseClassWithAngle = (str: string): { name: string; angle?: number } => {
      const angleMatch = str.match(/^(.+?)@(-?\d+(?:\.\d+)?)$/);
      if (angleMatch) {
        return { name: angleMatch[1].trim(), angle: parseFloat(angleMatch[2]) };
      }
      return { name: str.trim() };
    };

    // Track explicitly defined tiers (from # Tier X sections)
    const explicitTiers: Map<string, number> = new Map();

    // First pass: collect all explicitly defined tiers (classes that appear as parents under # Tier X)
    let firstPassTier = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const tierMatch = trimmed.match(/^#\s*Tier\s*(\d+)/i);
      if (tierMatch) {
        firstPassTier = parseInt(tierMatch[1], 10);
        continue;
      }

      if (trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^(.+?):\s*(.*)$/);
      if (match) {
        const parentPart = match[1].trim();
        const parentStrings = parentPart.split('+').map(p => p.trim());

        parentStrings.forEach(pStr => {
          const parsed = parseClassWithAngle(pStr);
          // This class is explicitly defined at this tier
          explicitTiers.set(parsed.name, firstPassTier);
        });
      }
    }

    // Second pass: build hierarchy and assign tiers
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

      // Parse class definition: "Parent@angle: Child1@angle, Child2"
      const match = trimmed.match(/^(.+?):\s*(.*)$/);
      if (match) {
        const parentPart = match[1].trim();
        const childrenPart = match[2].trim();

        // Handle multi-parent classes (e.g., "Ritter + Heiler")
        const parentStrings = parentPart.split('+').map(p => p.trim());
        const parents: string[] = [];

        parentStrings.forEach(pStr => {
          const parsed = parseClassWithAngle(pStr);
          parents.push(parsed.name);

          // Store manual angle if provided
          if (parsed.angle !== undefined) {
            this.classManualAngles.set(parsed.name, parsed.angle);
          }

          // Use explicit tier (already set in first pass)
          this.classTiers.set(parsed.name, currentTier);
        });

        // Parse children (may be empty for leaf nodes)
        if (childrenPart) {
          const childStrings = childrenPart.split(',').map(c => c.trim()).filter(c => c);

          childStrings.forEach(cStr => {
            const parsed = parseClassWithAngle(cStr);
            const child = parsed.name;

            // Store manual angle if provided
            if (parsed.angle !== undefined) {
              this.classManualAngles.set(child, parsed.angle);
            }

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

            // Only set child tier if it doesn't have an explicit tier defined
            // (i.e., the child doesn't appear as a parent under any # Tier X section)
            if (!explicitTiers.has(child) && !this.classTiers.has(child)) {
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

    // Track placed classes and their angles
    const classAngles: Map<string, number> = new Map();
    const placedClasses = new Set<string>();

    // Helper: normalize angle to -180 to 180
    const normalizeAngle = (angle: number): number => {
      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
      return angle;
    };

    // Helper: get average angle of parents (fallback for classes without manual angle)
    const getParentAvgAngle = (cls: string): number => {
      const parents = this.classParents.get(cls) || [];
      if (parents.length === 0) return 0;

      let sumSin = 0, sumCos = 0;
      parents.forEach(parent => {
        const angle = classAngles.get(parent);
        if (angle !== undefined) {
          const rad = angle * (Math.PI / 180);
          sumSin += Math.sin(rad);
          sumCos += Math.cos(rad);
        }
      });
      return Math.atan2(sumSin, sumCos) * (180 / Math.PI);
    };

    // Place all tiers
    for (let tier = 1; tier <= 5; tier++) {
      const classesInTier = (tierClasses.get(tier) || []).filter(c => !placedClasses.has(c));
      if (classesInTier.length === 0) continue;

      const radius = this.tierRadii[tier] || this.tierRadii[this.tierRadii.length - 1];

      // Separate classes with manual angles from those without
      const withManualAngle: { cls: string; angle: number }[] = [];
      const withoutManualAngle: string[] = [];

      classesInTier.forEach(cls => {
        const manualAngle = this.classManualAngles.get(cls);
        if (manualAngle !== undefined) {
          withManualAngle.push({ cls, angle: manualAngle });
        } else {
          withoutManualAngle.push(cls);
        }
      });

      // Place classes with manual angles first
      withManualAngle.forEach(({ cls, angle }) => {
        classAngles.set(cls, normalizeAngle(angle));
        const angleRad = angle * (Math.PI / 180);
        this.classPositions.push({
          name: cls,
          x: this.centerX + Math.cos(angleRad) * radius,
          y: this.centerY - Math.sin(angleRad) * radius,
          tier: tier,
          parents: this.classParents.get(cls) || []
        });
        placedClasses.add(cls);
      });

      // For classes without manual angles, distribute evenly in remaining space
      if (withoutManualAngle.length > 0) {
        // Sort by parent angle
        const sorted = withoutManualAngle.map(cls => ({
          cls,
          targetAngle: getParentAvgAngle(cls)
        })).sort((a, b) => normalizeAngle(a.targetAngle) - normalizeAngle(b.targetAngle));

        // Find gaps between manually placed classes
        const usedAngles = withManualAngle.map(w => normalizeAngle(w.angle)).sort((a, b) => a - b);

        if (usedAngles.length === 0) {
          // No manual angles, distribute evenly
          const angleStep = 360 / sorted.length;
          sorted.forEach((item, index) => {
            const angle = -180 + (index * angleStep) + (angleStep / 2);
            classAngles.set(item.cls, normalizeAngle(angle));
            const angleRad = angle * (Math.PI / 180);
            this.classPositions.push({
              name: item.cls,
              x: this.centerX + Math.cos(angleRad) * radius,
              y: this.centerY - Math.sin(angleRad) * radius,
              tier: tier,
              parents: this.classParents.get(item.cls) || []
            });
            placedClasses.add(item.cls);
          });
        } else {
          // Distribute in gaps between manual angles
          const angleStep = 360 / (sorted.length + usedAngles.length);
          let autoIndex = 0;

          for (let i = 0; i < sorted.length; i++) {
            // Find a slot that doesn't collide with manual angles
            let angle: number;
            let attempts = 0;
            do {
              angle = -180 + (autoIndex * angleStep) + (angleStep / 2);
              autoIndex++;
              attempts++;
            } while (usedAngles.some(ua => Math.abs(normalizeAngle(angle - ua)) < 15) && attempts < 360);

            classAngles.set(sorted[i].cls, normalizeAngle(angle));
            const angleRad = angle * (Math.PI / 180);
            this.classPositions.push({
              name: sorted[i].cls,
              x: this.centerX + Math.cos(angleRad) * radius,
              y: this.centerY - Math.sin(angleRad) * radius,
              tier: tier,
              parents: this.classParents.get(sorted[i].cls) || []
            });
            placedClasses.add(sorted[i].cls);
          }
        }
      }
    }

    // Build connections based on class hierarchy
    this.classHierarchy.forEach((children, parent) => {
      children.forEach(child => {
        const parentExists = this.classPositions.some(p => p.name === parent);
        const childExists = this.classPositions.some(p => p.name === child);
        if (parentExists && childExists) {
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

  // Get path for connection - straight line since layout minimizes crossings
  getConnectionPath(conn: Connection): string | null {
    const from = this.classPositions.find(p => p.name === conn.from);
    const to = this.classPositions.find(p => p.name === conn.to);
    if (!from || !to) return null;
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
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
    if (this.isDraggingNode) return; // Don't pan while dragging node
    if (event.button === 1 || (event.target as HTMLElement).classList.contains('tree-inner')) {
      this.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDraggingNode && this.draggedClassName) {
      this.handleNodeDrag(event);
      return;
    }
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
    if (this.isDraggingNode) {
      this.isDraggingNode = false;
      this.draggedClassName = null;
    }
  }

  onMouseLeave() {
    this.isPanning = false;
    if (this.isDraggingNode) {
      this.isDraggingNode = false;
      this.draggedClassName = null;
    }
  }

  // Node dragging methods
  startNodeDrag(className: string, event: MouseEvent) {
    if (!this.editMode) return;
    event.stopPropagation();
    event.preventDefault();
    this.isDraggingNode = true;
    this.draggedClassName = className;
  }

  handleNodeDrag(event: MouseEvent) {
    if (!this.draggedClassName) return;

    const classPos = this.classPositions.find(p => p.name === this.draggedClassName);
    if (!classPos) return;

    const rect = this.treeContainer?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    // Convert screen coordinates to tree coordinates
    const treeX = (event.clientX - rect.left - this.panX) / this.scale;
    const treeY = (event.clientY - rect.top - this.panY) / this.scale;

    // Calculate angle from center
    const dx = treeX - this.centerX;
    const dy = this.centerY - treeY; // Flip Y for standard math coordinates
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Get the tier radius
    const radius = this.tierRadii[classPos.tier] || this.tierRadii[this.tierRadii.length - 1];

    // Update position (constrained to tier circle)
    const angleRad = angle * (Math.PI / 180);
    classPos.x = this.centerX + Math.cos(angleRad) * radius;
    classPos.y = this.centerY - Math.sin(angleRad) * radius;

    // Save the angle
    this.classManualAngles.set(this.draggedClassName, angle);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  // Reset layout to default (clear all manual angles and rebuild)
  resetLayout() {
    this.classManualAngles.clear();
    this.buildLayout();
  }

  // Export layout as class-definitions.txt format
  exportLayout() {
    const lines: string[] = [];

    // Group by tier
    for (let tier = 1; tier <= 5; tier++) {
      lines.push(`# Tier ${tier}`);

      // Get all classes in this tier that have children or are parents
      const classesInTier = Array.from(this.classTiers.entries())
        .filter(([_, t]) => t === tier)
        .map(([name, _]) => name);

      classesInTier.forEach(className => {
        const angle = this.classManualAngles.get(className);
        const children = this.classHierarchy.get(className) || [];

        // Format: ClassName@angle: Child1@angle, Child2@angle
        let line = className;
        if (angle !== undefined) {
          line += `@${Math.round(angle)}`;
        }
        line += ':';

        if (children.length > 0) {
          const childParts = children.map(child => {
            const childAngle = this.classManualAngles.get(child);
            return childAngle !== undefined ? `${child}@${Math.round(childAngle)}` : child;
          });
          line += ' ' + childParts.join(', ');
        }

        lines.push(line);
      });

      lines.push('');
    }

    // Create and download file
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class-definitions.txt';
    a.click();
    URL.revokeObjectURL(url);
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
