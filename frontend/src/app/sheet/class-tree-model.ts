export interface ClassNode {
  name: string;
  parents: string[];
}

export class ClassTree {
  private static classes: Map<string, ClassNode> = new Map();
  private static initialized = false;

  /**
   * Initialize the class tree from a text definition
   * Format: "ParentClass: Child1, Child2" or "Parent1 + Parent2: Child"
   */
  static async initialize(classDefinitions: string) {
    this.classes.clear();
    
    const lines = classDefinitions.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue; // Skip empty lines and comments
      
      const [parents, children] = trimmed.split(':').map(s => s.trim());
      if (!parents || !children) continue;
      
      // Parse parents (could be "Warrior" or "Warrior + Mage")
      const parentClasses = parents.split('+').map(p => this.normalize(p));
      
      // Parse children
      const childClasses = children.split(',').map(c => this.normalize(c));
      
      // Register each parent as a class if not exists
      for (const parent of parentClasses) {
        if (!this.classes.has(parent)) {
          this.classes.set(parent, { name: this.toDisplayName(parent), parents: [] });
        }
      }
      
      // Register each child with its parents
      for (const child of childClasses) {
        if (this.classes.has(child)) {
          // Add parents to existing class
          const existing = this.classes.get(child)!;
          existing.parents.push(...parentClasses);
        } else {
          this.classes.set(child, {
            name: this.toDisplayName(child),
            parents: parentClasses,
          });
        }
      }
    }
    
    this.initialized = true;
  }

  private static normalize(className: string): string {
    return className.toLowerCase().trim();
  }

  private static toDisplayName(normalized: string): string {
    return normalized
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if a skill's class is enabled based on character's classes
   */
  static isClassEnabled(
    skillClass: string,
    primaryClass: string,
    secondaryClass: string
  ): boolean {
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