import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillDefinition } from '../../model/skill-definition.model';
import { SKILL_DEFINITIONS, getSkillById, getSkillsForClass, CLASS_DEFINITIONS } from '../../data/skill-definitions';
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
    // Use CLASS_DEFINITIONS from skill-definitions.ts
    this.parseClassDefinitions();
    this.loadSavedAngles(); // Load saved angles from localStorage
    this.buildLayout();
    setTimeout(() => this.centerView(), 0);
  }

  // Load saved angles from localStorage
  private loadSavedAngles() {
    try {
      const saved = localStorage.getItem('skill-tree-layout');
      if (saved) {
        const angles = JSON.parse(saved) as Record<string, number>;
        const count = Object.keys(angles).length;
        if (count > 0) {
          console.log(`Loading ${count} saved class positions from localStorage`);
          Object.entries(angles).forEach(([name, angle]) => {
            this.classManualAngles.set(name, angle);
          });
        }
      }
    } catch (e) {
      console.error('Failed to load saved layout', e);
    }
  }

  // Save angles to localStorage
  private saveAngles() {
    try {
      const angles: Record<string, number> = {};
      this.classManualAngles.forEach((angle, name) => {
        angles[name] = angle;
      });
      const json = JSON.stringify(angles);
      localStorage.setItem('skill-tree-layout', json);
      console.log(`Saved ${Object.keys(angles).length} class positions to localStorage`);
    } catch (e) {
      console.error('Failed to save layout', e);
    }
  }

  parseClassDefinitions() {
    this.classHierarchy.clear();
    this.classParents.clear();
    this.classTiers.clear();
    this.classManualAngles.clear();

    // Build from CLASS_DEFINITIONS
    for (const [className, classInfo] of Object.entries(CLASS_DEFINITIONS)) {
      // Set tier
      this.classTiers.set(className, classInfo.tier);
      
      // Set angle
      this.classManualAngles.set(className, classInfo.angle);
      
      // Store children
      const childNames = classInfo.children.map(child => child.className);
      this.classHierarchy.set(className, childNames);
      
      // Store child angles
      classInfo.children.forEach(child => {
        this.classManualAngles.set(child.className, child.angle);
        
        // Register parent relationship
        let parents = this.classParents.get(child.className) || [];
        parents.push(className);
        this.classParents.set(child.className, parents);
      });
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
    this.saveAngles(); // Persist to localStorage
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  // Reset layout to default (reload from class-definitions.txt, ignore localStorage)
  resetLayout() {
    localStorage.removeItem('skill-tree-layout'); // Clear saved layout
    // Reload class definitions to get angles from file
    // Use CLASS_DEFINITIONS from skill-definitions.ts
    this.parseClassDefinitions();
    // Don't call loadSavedAngles() - we want file defaults only
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
    return `translate3d(${this.panX}px, ${this.panY}px, 0) scale(${this.scale})`;
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

  /**
   * Calculate total talent points earned at current level.
   * Formula: 1 TP per level + 1 additional per 10 levels
   * Level 1-10: 1 per level, Level 11-20: 2 per level, etc.
   */
  getTotalTalentPointsEarned(): number {
    const level = this.sheet.level || 1;
    // 1 TP per level, plus fractional bonus for every 10 levels
    // At level 1: 1 + floor(1/10) = 1
    // At level 10: 10 + floor(10/10) = 11
    // At level 11: 11 + floor(11/10) = 12, but we want different scaling
    // Correct: level + floor((level - 1) / 10) for the bonus
    // Level 1-10: earn 1/level = 10 points by level 10
    // Level 11-20: earn 2/level = 20 more points by level 20
    // Total at level 20 = 10 + 20 = 30
    let total = 0;
    for (let l = 1; l <= level; l++) {
      total += 1 + Math.floor((l - 1) / 10);
    }
    return total;
  }

  /**
   * Get the talent point cost to learn a skill based on its class tier.
   * Tier 1-2: 1 TP, Tier 3-4: 2 TP, Tier 5: 3 TP
   */
  getSkillTPCost(skill: SkillDefinition): number {
    const classInfo = CLASS_DEFINITIONS[skill.class];
    if (!classInfo) return 1;
    
    const tier = classInfo.tier;
    if (tier <= 2) return 1;
    if (tier <= 4) return 2;
    return 3; // Tier 5
  }

  /**
   * Calculate total spent talent points accounting for tier-based costs.
   */
  getSpentTalentPoints(): number {
    let spent = 0;
    const learnedIds = this.sheet.learnedSkillIds || [];
    
    for (const skillId of learnedIds) {
      const skill = getSkillById(skillId);
      if (skill) {
        spent += this.getSkillTPCost(skill);
      } else {
        spent += 1; // Fallback
      }
    }
    
    return spent;
  }

  getAvailableTalentPoints(): number {
    const earned = this.getTotalTalentPointsEarned();
    const bonusPoints = this.sheet.talentPointsBonus || 0;
    const spent = this.getSpentTalentPoints();
    return earned + bonusPoints - spent;
  }

  canLearnFromClass(className: string): boolean {
    const classPos = this.classPositions.find(p => p.name === className);
    if (!classPos || classPos.tier === 1) return true;

    const parents = this.classParents.get(className) || [];
    for (const parent of parents) {
      const parentLearnedCount = this.getLearnedCountForClass(parent);
      const parentTotalSkills = this.getTotalSkillsForClass(parent);
      const required = Math.ceil(parentTotalSkills / 2);
      if (parentLearnedCount >= required) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the player has enough TP to learn a skill
   */
  hasEnoughTPForSkill(skill: SkillDefinition): boolean {
    const cost = this.getSkillTPCost(skill);
    return this.getAvailableTalentPoints() >= cost;
  }

  canLearnSkill(skill: SkillDefinition): boolean {
    // For infinite level skills, check if we have enough TP
    if (skill.infiniteLevel) {
      if (!this.hasEnoughTPForSkill(skill)) return false;
    } else {
      // For normal skills, can't learn if already learned
      if (this.isSkillLearned(skill.id)) return false;
      if (!this.hasEnoughTPForSkill(skill)) return false;
    }

    // Check requiresSkill (can be string or array)
    if (skill.requiresSkill) {
      const requiredSkills = Array.isArray(skill.requiresSkill) ? skill.requiresSkill : [skill.requiresSkill];
      for (const requiredSkillId of requiredSkills) {
        if (!this.isSkillLearned(requiredSkillId)) {
          return false;
        }
      }
    }

    if (!this.canLearnFromClass(skill.class)) {
      return false;
    }

    return true;
  }

  learnSkill(skill: SkillDefinition) {
    if (!this.canLearnSkill(skill)) return;

    // Handle infinite level skills differently
    if (skill.infiniteLevel) {
      // Find existing skill block for this skill
      const existingSkillIndex = (this.sheet.skills || []).findIndex(
        s => s.skillId === skill.id
      );

      if (existingSkillIndex >= 0) {
        // Increment level of existing skill
        const existingSkill = this.sheet.skills![existingSkillIndex];
        const newLevel = (existingSkill.level || 1) + 1;
        
        this.patch.emit({
          path: `skills.${existingSkillIndex}.level`,
          value: newLevel
        });

        // Update description to show level
        const updatedDescription = this.getInfiniteLevelDescription(skill, newLevel);
        this.patch.emit({
          path: `skills.${existingSkillIndex}.description`,
          value: updatedDescription
        });

        // Update stat modifiers if this is a stat bonus skill
        if (skill.statBonus) {
          const statModifiers = [{
            stat: skill.statBonus.stat as any,
            amount: skill.statBonus.amount * newLevel
          }];
          this.patch.emit({
            path: `skills.${existingSkillIndex}.statModifiers`,
            value: statModifiers
          });
        }
      } else {
        // First time learning this skill
        const statModifiers = skill.statBonus ? [{
          stat: skill.statBonus.stat as any,
          amount: skill.statBonus.amount
        }] : undefined;

        const newSkillBlock: SkillBlock = {
          name: skill.name,
          class: skill.class,
          description: this.getInfiniteLevelDescription(skill, 1),
          type: skill.type,  // Preserve the actual type: active, passive, dice_bonus, stat_bonus
          enlightened: skill.enlightened ?? false,
          level: 1,
          skillId: skill.id,
          statModifiers
        };

        const newSkills = [...(this.sheet.skills || []), newSkillBlock];
        this.patch.emit({
          path: 'skills',
          value: newSkills
        });
      }

      // Add to learned IDs (can be multiple times for infinite skills)
      const newLearnedIds = [...(this.sheet.learnedSkillIds || []), skill.id];
      this.patch.emit({
        path: 'learnedSkillIds',
        value: newLearnedIds
      });
    } else {
      // Normal skill learning
      const newLearnedIds = [...(this.sheet.learnedSkillIds || []), skill.id];
      this.patch.emit({
        path: 'learnedSkillIds',
        value: newLearnedIds
      });

      const statModifiers = skill.statBonus ? [{
        stat: skill.statBonus.stat as any,
        amount: skill.statBonus.amount
      }] : undefined;

      const newSkillBlock: SkillBlock = {
        name: skill.name,
        class: skill.class,
        description: skill.description,
        type: skill.type,  // Preserve the actual type: active, passive, dice_bonus, stat_bonus
        enlightened: skill.enlightened ?? false,
        skillId: skill.id,
        statModifiers
      };

      const newSkills = [...(this.sheet.skills || []), newSkillBlock];
      this.patch.emit({
        path: 'skills',
        value: newSkills
      });
    }
  }

  getInfiniteLevelDescription(skill: SkillDefinition, level: number): string {
    return `${skill.description} [Stufe ${level}]`;
  }

  unlearnSkill(skill: SkillDefinition) {
    if (!this.isSkillLearned(skill.id)) return;

    if (skill.infiniteLevel) {
      // Find existing skill block
      const existingSkillIndex = (this.sheet.skills || []).findIndex(
        s => s.skillId === skill.id
      );

      if (existingSkillIndex >= 0) {
        const existingSkill = this.sheet.skills![existingSkillIndex];
        const currentLevel = existingSkill.level || 1;

        if (currentLevel > 1) {
          // Decrease level
          const newLevel = currentLevel - 1;
          this.patch.emit({
            path: `skills.${existingSkillIndex}.level`,
            value: newLevel
          });

          // Update description
          const updatedDescription = this.getInfiniteLevelDescription(skill, newLevel);
          this.patch.emit({
            path: `skills.${existingSkillIndex}.description`,
            value: updatedDescription
          });

          // Update stat modifiers if this is a stat bonus skill
          if (skill.statBonus) {
            const statModifiers = [{
              stat: skill.statBonus.stat as any,
              amount: skill.statBonus.amount * newLevel
            }];
            this.patch.emit({
              path: `skills.${existingSkillIndex}.statModifiers`,
              value: statModifiers
            });
          }
        } else {
          // Remove skill completely if at level 1
          const newSkills = (this.sheet.skills || []).filter((_, i) => i !== existingSkillIndex);
          this.patch.emit({
            path: 'skills',
            value: newSkills
          });
        }
      }

      // Remove one instance from learned IDs
      const learnedIds = [...(this.sheet.learnedSkillIds || [])];
      const lastIndex = learnedIds.lastIndexOf(skill.id);
      if (lastIndex >= 0) {
        learnedIds.splice(lastIndex, 1);
        this.patch.emit({
          path: 'learnedSkillIds',
          value: learnedIds
        });
      }
    } else {
      // Normal skill unlearning
      const newLearnedIds = (this.sheet.learnedSkillIds || []).filter(id => id !== skill.id);
      this.patch.emit({
        path: 'learnedSkillIds',
        value: newLearnedIds
      });

      const newSkills = (this.sheet.skills || []).filter(
        s => s.skillId !== skill.id
      );
      this.patch.emit({
        path: 'skills',
        value: newSkills
      });
    }
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

  // Check if a class is the primary or secondary class
  isPrimaryClass(className: string): boolean {
    return this.sheet.primary_class?.toLowerCase() === className.toLowerCase();
  }

  isSecondaryClass(className: string): boolean {
    return this.sheet.secondary_class?.toLowerCase() === className.toLowerCase();
  }

  // Set class as primary or secondary
  setPrimaryClass(className: string) {
    this.patch.emit({ path: 'primary_class', value: className });
  }

  setSecondaryClass(className: string) {
    this.patch.emit({ path: 'secondary_class', value: className });
  }

  // Find path from selected class DOWN to base tier 1 classes
  getPathToClass(targetClass: string): Set<string> {
    const path = new Set<string>();
    const visited = new Set<string>();

    // Start from target class and walk UP to parents until we reach tier 1
    const walkToTier1 = (className: string) => {
      if (visited.has(className)) return;
      visited.add(className);
      path.add(className);

      // Get parents of this class (reverse lookup in hierarchy)
      const parents = this.classParents.get(className) || [];
      for (const parent of parents) {
        walkToTier1(parent);
      }
    };

    walkToTier1(targetClass);
    return path;
  }

  // Check if a connection is on the path to primary or secondary class
  isConnectionOnClassPath(conn: Connection): boolean {
    const primaryPath = this.sheet.primary_class ? this.getPathToClass(this.sheet.primary_class) : new Set<string>();
    const secondaryPath = this.sheet.secondary_class ? this.getPathToClass(this.sheet.secondary_class) : new Set<string>();

    // Check if both ends of the connection are on the same class path
    const fromOnPrimary = primaryPath.has(conn.from);
    const toOnPrimary = primaryPath.has(conn.to);
    const fromOnSecondary = secondaryPath.has(conn.from);
    const toOnSecondary = secondaryPath.has(conn.to);

    return (fromOnPrimary && toOnPrimary) || (fromOnSecondary && toOnSecondary);
  }

  // Check if connection is a "next class" line (from selected class to unselected children)
  isNextClassLine(conn: Connection): boolean {
    // Check if 'from' is the primary or secondary class
    const fromIsPrimary = this.sheet.primary_class?.toLowerCase() === conn.from.toLowerCase();
    const fromIsSecondary = this.sheet.secondary_class?.toLowerCase() === conn.from.toLowerCase();
    
    // Check if 'to' is NOT selected as primary or secondary
    const toIsPrimary = this.sheet.primary_class?.toLowerCase() === conn.to.toLowerCase();
    const toIsSecondary = this.sheet.secondary_class?.toLowerCase() === conn.to.toLowerCase();
    
    return (fromIsPrimary || fromIsSecondary) && !toIsPrimary && !toIsSecondary;
  }

  // Check if connection is on primary path
  isConnectionOnPrimaryPath(conn: Connection): boolean {
    const primaryPath = this.sheet.primary_class ? this.getPathToClass(this.sheet.primary_class) : new Set<string>();
    return primaryPath.has(conn.from) && primaryPath.has(conn.to);
  }

  // Check if connection is on secondary path
  isConnectionOnSecondaryPath(conn: Connection): boolean {
    const secondaryPath = this.sheet.secondary_class ? this.getPathToClass(this.sheet.secondary_class) : new Set<string>();
    return secondaryPath.has(conn.from) && secondaryPath.has(conn.to);
  }

  // Get the color for a connection if it's on a class path
  getConnectionPathColor(conn: Connection): string | null {
    const primaryPath = this.sheet.primary_class ? this.getPathToClass(this.sheet.primary_class) : new Set<string>();
    const secondaryPath = this.sheet.secondary_class ? this.getPathToClass(this.sheet.secondary_class) : new Set<string>();

    const fromOnPrimary = primaryPath.has(conn.from);
    const toOnPrimary = primaryPath.has(conn.to);
    const fromOnSecondary = secondaryPath.has(conn.from);
    const toOnSecondary = secondaryPath.has(conn.to);

    if (fromOnPrimary && toOnPrimary) return '#eab308'; // Yellow for primary
    if (fromOnSecondary && toOnSecondary) return '#60a5fa'; // Blue for secondary
    return null;
  }

  // Check if class is on path to primary or secondary
  isClassOnPath(className: string): 'primary' | 'secondary' | null {
    const primaryPath = this.sheet.primary_class ? this.getPathToClass(this.sheet.primary_class) : new Set<string>();
    const secondaryPath = this.sheet.secondary_class ? this.getPathToClass(this.sheet.secondary_class) : new Set<string>();

    if (primaryPath.has(className)) return 'primary';
    if (secondaryPath.has(className)) return 'secondary';
    return null;
  }

  // Check if a class is tier 1 (base class)
  isClassTier1(className: string): boolean {
    return this.classTiers.get(className) === 1;
  }

  // Get the tier number for a class
  getClassTier(className: string): number {
    return this.classTiers.get(className) || 1;
  }

  getTierColor(tier: number): string {
    return TIER_COLORS[tier] || TIER_COLORS[5];
  }

  onClose() {
    this.close.emit();
  }
}
