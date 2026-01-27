import { CLASS_DEFINITIONS, ClassHierarchy } from '../data/skill-definitions';

export interface ClassNode {
  name: string;
  parents: string[];
}

export class ClassTree {
  private static classes: Map<string, ClassNode> = new Map();
  private static initialized = false;

  /**
   * Initialize the class tree from CLASS_DEFINITIONS
   * Auto-initializes on first use if not already initialized
   */
  static initialize() {
    if (this.initialized) {
      return;
    }
    
    this.classes.clear();
    
    // Build parent-child relationships from CLASS_DEFINITIONS
    const parentMap = new Map<string, string[]>();
    
    // First pass: collect all parent-child relationships
    for (const [className, classInfo] of Object.entries(CLASS_DEFINITIONS)) {
      const normalized = this.normalize(className);
      
      // Register this class if not exists
      if (!this.classes.has(normalized)) {
        this.classes.set(normalized, { name: className, parents: [] });
      }
      
      // Register each child with this class as parent
      for (const child of classInfo.children) {
        const childNormalized = this.normalize(child.className);
        
        if (!parentMap.has(childNormalized)) {
          parentMap.set(childNormalized, []);
        }
        parentMap.get(childNormalized)!.push(normalized);
        
        // Register child class if not exists
        if (!this.classes.has(childNormalized)) {
          this.classes.set(childNormalized, { name: child.className, parents: [] });
        }
      }
    }
    
    // Second pass: assign parents to each class
    for (const [className, parents] of parentMap.entries()) {
      const classNode = this.classes.get(className);
      if (classNode) {
        classNode.parents = parents;
      }
    }
    
    this.initialized = true;
  }

  private static normalize(className: string): string {
    // Remove @angle notation if present
    return className.split('@')[0].toLowerCase().trim();
  }

  private static toDisplayName(normalized: string): string {
    return normalized
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if a skill's class is enabled based on character's classes
   * Auto-initializes if needed
   */
  static isClassEnabled(
    skillClass: string,
    primaryClass: string,
    secondaryClass: string
  ): boolean {
    // Auto-initialize on first use
    if (!this.initialized) {
      this.initialize();
    }
    
    if (!skillClass) return true;
    
    const normalizedSkillClass = this.normalize(skillClass);
    const normalizedPrimary = this.normalize(primaryClass || '');
    const normalizedSecondary = this.normalize(secondaryClass || '');

    // Direct match
    if (normalizedSkillClass === normalizedPrimary || 
        normalizedSkillClass === normalizedSecondary) {
      return true;
    }

    // Check if character's classes inherit from skill's class
    return this.inheritsFrom(normalizedPrimary, normalizedSkillClass) ||
           this.inheritsFrom(normalizedSecondary, normalizedSkillClass);
  }

  /**
   * Check if childClass inherits from parentClass (recursive)
   */
  private static inheritsFrom(childClass: string, parentClass: string): boolean {
    if (!childClass || !parentClass) return false;
    if (childClass === parentClass) return true;

    const classNode = this.classes.get(childClass);
    if (!classNode?.parents || classNode.parents.length === 0) return false;

    // Check all parents recursively
    for (const parent of classNode.parents) {
      if (parent === parentClass || this.inheritsFrom(parent, parentClass)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all classes that would enable a given skill class
   */
  static getValidClassesFor(skillClass: string): string[] {
    const normalized = this.normalize(skillClass);
    const validClasses: string[] = [normalized];

    for (const [className] of this.classes.entries()) {
      if (this.inheritsFrom(className, normalized)) {
        validClasses.push(className);
      }
    }

    return validClasses;
  }

  /**
   * Get display name for a class
   */
  static getDisplayName(className: string): string {
    const normalized = this.normalize(className);
    return this.classes.get(normalized)?.name || this.toDisplayName(normalized);
  }

  /**
   * Get all available classes
   */
  static getAllClasses(): string[] {
    return Array.from(this.classes.keys());
  }

  /**
   * Check if initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}