import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet, createEmptySheet } from '../../model/character-sheet-model';
import { CLASS_DEFINITIONS, SKILL_DEFINITIONS, getSkillsForClass, getSkillById } from '../../data/skill-definitions';
import { SkillDefinition } from '../../model/skill-definition.model';
import { HttpClient } from '@angular/common/http';
import { FormulaType } from '../../model/formula-type.enum';

interface CompassDirection {
  name: string;
  angle: number;
  icon: string;
}

@Component({
  selector: 'app-character-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-generator.component.html',
  styleUrl: './character-generator.component.css'
})
export class CharacterGeneratorComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() characterGenerated = new EventEmitter<CharacterSheet>();

  private http = inject(HttpClient);

  // Generation parameters
  level: number = 1;
  richness: number = 50; // 0-100 scale
  selectedDirection: CompassDirection | null = null;
  
  // Available races from backend
  races: any[] = [];
  selectedRaceId: string = '';
  
  // Generated character
  generatedCharacter: CharacterSheet | null = null;
  
  // Stat distribution (6D hexagon) - points to distribute
  statPoints: number = 0;
  hexStats = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    chill: 0,
    constitution: 0
  };
  
  // Compass directions for talent tree traversal
  directions: CompassDirection[] = [
    { name: 'North', angle: 90, icon: '⬆️' },
    { name: 'Northeast', angle: 67, icon: '⬈' },
    { name: 'East', angle: 0, icon: '➡️' },
    { name: 'Southeast', angle: -30, icon: '⬊' },
    { name: 'South', angle: -90, icon: '⬇️' },
    { name: 'Southwest', angle: -147, icon: '⬋' },
    { name: 'West', angle: 180, icon: '⬅️' },
    { name: 'Northwest', angle: 135, icon: '⬉' }
  ];

  ngOnInit() {
    this.loadRaces();
    this.updateStatPoints();
  }

  loadRaces() {
    this.http.get<any[]>('/api/races').subscribe({
      next: (races) => {
        this.races = races;
      },
      error: (err) => {
        console.error('Failed to load races:', err);
        // Fallback to basic races if API fails
        this.races = [
          { id: 'human', name: 'Human' },
          { id: 'elf', name: 'Elf' },
          { id: 'dwarf', name: 'Dwarf' },
          { id: 'orc', name: 'Orc' }
        ];
      }
    });
  }

  updateStatPoints() {
    // Base stat points scale with level (e.g., 6 + level)
    this.statPoints = 6 + this.level;
  }

  onLevelChange() {
    this.updateStatPoints();
  }

  selectDirection(direction: CompassDirection) {
    this.selectedDirection = direction;
  }

  randomizeRace() {
    if (this.races.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.races.length);
      this.selectedRaceId = this.races[randomIndex].id;
    }
  }

  // Calculate remaining stat points
  get remainingStatPoints(): number {
    const spent = this.hexStats.strength + this.hexStats.dexterity + 
                  this.hexStats.speed + this.hexStats.intelligence + 
                  this.hexStats.chill + this.hexStats.constitution;
    return this.statPoints - spent;
  }

  // Hexagon stat adjustment
  incrementStat(stat: keyof typeof this.hexStats) {
    if (this.remainingStatPoints > 0) {
      this.hexStats[stat]++;
    }
  }

  decrementStat(stat: keyof typeof this.hexStats) {
    if (this.hexStats[stat] > 0) {
      this.hexStats[stat]--;
    }
  }

  // Main generation function
  generateCharacter() {
    const character = createEmptySheet();
    
    // Generate name
    character.name = this.generateName();
    
    // Set race
    const selectedRace = this.races.find(r => r.id === this.selectedRaceId);
    if (selectedRace) {
      character.race = selectedRace.name;
      character.raceId = selectedRace.id;
    } else {
      character.race = 'Human';
      character.raceId = 'human';
    }
    
    // Randomize age, height, alignment
    character.age = this.generateAge();
    character.size = this.generateHeight().toString() + 'cm';
    character.alignment = this.generateAlignment();
    
    // Set level
    character.level = this.level;
    
    // Apply stat distribution
    character.strength.base = 10 + this.hexStats.strength;
    character.dexterity.base = 10 + this.hexStats.dexterity;
    character.speed.base = 10 + this.hexStats.speed;
    character.intelligence.base = 10 + this.hexStats.intelligence;
    character.chill.base = 10 + this.hexStats.chill;
    character.constitution.base = 10 + this.hexStats.constitution;
    
    // Calculate talent points based on level
    character.talentPoints = this.level - 1; // Level 1 = 0 points, Level 2 = 1 point, etc.
    
    // Traverse talent tree and learn skills
    const learnedSkills = this.traverseTalentTree(character.talentPoints);
    character.learnedSkillIds = learnedSkills;
    
    // Determine primary and secondary classes based on learned skills
    const topClasses = this.determineTopClasses(learnedSkills);
    character.primary_class = topClasses[0] || 'Magier';
    character.secondary_class = topClasses[1] || '';
    character.learned_classes = topClasses.join(', ');
    
    // Generate wealth based on richness
    this.generateWealth(character);
    
    // Set initial status values based on stats and level
    this.initializeStatuses(character);
    
    this.generatedCharacter = character;
  }

  // Talent tree traversal with directional preference
  private traverseTalentTree(talentPoints: number): string[] {
    const learnedSkillIds: string[] = [];
    
    if (talentPoints <= 0) {
      return learnedSkillIds;
    }
    
    // Start from tier 1 classes
    const tier1Classes = Object.entries(CLASS_DEFINITIONS)
      .filter(([_, info]) => info.tier === 1)
      .map(([name, _]) => name);
    
    // Choose starting class based on direction preference
    let currentClass = this.chooseClassByDirection(tier1Classes);
    
    // Traverse the tree, learning skills
    let remainingPoints = talentPoints;
    const visitedClasses = new Set<string>();
    
    while (remainingPoints > 0) {
      // Get skills for current class
      const classSkills = getSkillsForClass(currentClass);
      
      if (classSkills.length > 0 && remainingPoints > 0) {
        // Learn a random skill from this class
        const unlearnedSkills = classSkills.filter(s => !learnedSkillIds.includes(s.id));
        if (unlearnedSkills.length > 0) {
          const randomSkill = unlearnedSkills[Math.floor(Math.random() * unlearnedSkills.length)];
          learnedSkillIds.push(randomSkill.id);
          remainingPoints--;
        }
      }
      
      visitedClasses.add(currentClass);
      
      // Move to child class based on direction preference
      const classInfo = CLASS_DEFINITIONS[currentClass];
      if (classInfo && classInfo.children.length > 0) {
        const nextClass = this.chooseClassByDirection(
          classInfo.children.map(c => c.className)
        );
        
        // Avoid infinite loops
        if (visitedClasses.has(nextClass)) {
          // Pick a random unvisited class
          const unvisitedChildren = classInfo.children
            .map(c => c.className)
            .filter(c => !visitedClasses.has(c));
          
          if (unvisitedChildren.length > 0) {
            currentClass = unvisitedChildren[Math.floor(Math.random() * unvisitedChildren.length)];
          } else {
            // No more children, pick any class with skills
            const allClasses = Object.keys(CLASS_DEFINITIONS);
            const classesWithSkills = allClasses.filter(c => getSkillsForClass(c).length > 0);
            currentClass = classesWithSkills[Math.floor(Math.random() * classesWithSkills.length)];
          }
        } else {
          currentClass = nextClass;
        }
      } else {
        // No children, pick a random class with available skills
        const allClasses = Object.keys(CLASS_DEFINITIONS);
        const classesWithSkills = allClasses.filter(c => {
          const skills = getSkillsForClass(c);
          return skills.some(s => !learnedSkillIds.includes(s.id));
        });
        
        if (classesWithSkills.length > 0) {
          currentClass = classesWithSkills[Math.floor(Math.random() * classesWithSkills.length)];
        } else {
          // No more skills to learn
          break;
        }
      }
    }
    
    return learnedSkillIds;
  }

  // Choose class closest to preferred direction
  private chooseClassByDirection(classNames: string[]): string {
    if (!this.selectedDirection || classNames.length === 0) {
      return classNames[Math.floor(Math.random() * classNames.length)];
    }
    
    const targetAngle = this.selectedDirection.angle;
    
    // Find class with angle closest to target
    let bestClass = classNames[0];
    let bestDifference = 360;
    
    for (const className of classNames) {
      const classInfo = CLASS_DEFINITIONS[className];
      if (classInfo) {
        const angleDiff = Math.abs(this.normalizeAngle(classInfo.angle - targetAngle));
        if (angleDiff < bestDifference) {
          bestDifference = angleDiff;
          bestClass = className;
        }
      }
    }
    
    return bestClass;
  }

  // Normalize angle to -180 to 180 range
  private normalizeAngle(angle: number): number {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  }

  // Determine top 2 classes based on learned skills
  private determineTopClasses(learnedSkillIds: string[]): string[] {
    const classSkillCounts = new Map<string, number>();
    
    // Count skills per class
    for (const skillId of learnedSkillIds) {
      const skill = getSkillById(skillId);
      if (skill) {
        const count = classSkillCounts.get(skill.class) || 0;
        classSkillCounts.set(skill.class, count + 1);
      }
    }
    
    // Sort by count descending
    const sortedClasses = Array.from(classSkillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([className, _]) => className);
    
    return sortedClasses.slice(0, 2);
  }

  // Generate random name
  private generateName(): string {
    const prefixes = ['Ald', 'Bel', 'Cor', 'Dra', 'El', 'Fen', 'Gar', 'Hal', 'Ith', 'Jor', 'Kal', 'Lor', 'Mor', 'Nar', 'Oth', 'Pel', 'Qua', 'Ren', 'Sal', 'Tar', 'Ul', 'Val', 'Wen', 'Xan', 'Yor', 'Zel'];
    const suffixes = ['dor', 'wen', 'ric', 'ton', 'mar', 'lyn', 'wyn', 'dil', 'ran', 'mir', 'din', 'thor', 'win', 'gor', 'ros', 'lan', 'mon', 'dar', 'fin', 'kan'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return prefix + suffix;
  }

  // Generate random age (18-80)
  private generateAge(): number {
    return 18 + Math.floor(Math.random() * 63);
  }

  // Generate random height (140-200cm)
  private generateHeight(): number {
    return 140 + Math.floor(Math.random() * 61);
  }

  // Generate random alignment
  private generateAlignment(): string {
    const alignments = [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ];
    return alignments[Math.floor(Math.random() * alignments.length)];
  }

  // Generate wealth based on richness setting
  private generateWealth(character: CharacterSheet) {
    // Base wealth increases with level
    const baseWealth = this.level * 100;
    
    // Multiply by richness factor (0.1 to 2.0)
    const richnessFactor = 0.1 + (this.richness / 100) * 1.9;
    const totalCopper = Math.floor(baseWealth * richnessFactor);
    
    // Convert to different denominations (100 copper = 1 silver, 100 silver = 1 gold, 100 gold = 1 platinum)
    character.currency.platinum = Math.floor(totalCopper / 1000000);
    character.currency.gold = Math.floor((totalCopper % 1000000) / 10000);
    character.currency.silver = Math.floor((totalCopper % 10000) / 100);
    character.currency.copper = totalCopper % 100;
  }

  // Initialize status values (health, mana, energy)
  private initializeStatuses(character: CharacterSheet) {
    // Find status blocks by formulaType
    const lifeStatus = character.statuses.find(s => s.formulaType === FormulaType.LIFE);
    const manaStatus = character.statuses.find(s => s.formulaType === FormulaType.MANA);
    const energyStatus = character.statuses.find(s => s.formulaType === FormulaType.ENERGY);
    
    // Health based on constitution
    if (lifeStatus) {
      lifeStatus.statusBase = 100 + (character.constitution.base * 5);
      lifeStatus.statusCurrent = lifeStatus.statusBase;
    }
    
    // Mana based on intelligence
    if (manaStatus) {
      manaStatus.statusBase = 50 + (character.intelligence.base * 3);
      manaStatus.statusCurrent = manaStatus.statusBase;
    }
    
    // Energy based on level and average stats
    if (energyStatus) {
      const avgStat = (character.strength.base + character.dexterity.base + character.constitution.base) / 3;
      energyStatus.statusBase = 50 + Math.floor(avgStat * 2);
      energyStatus.statusCurrent = energyStatus.statusBase;
    }
  }

  // Reroll all (regenerate character)
  rerollAll() {
    this.generateCharacter();
  }

  // Save character
  saveCharacter() {
    if (this.generatedCharacter) {
      this.characterGenerated.emit(this.generatedCharacter);
    }
  }

  // Close modal
  closeModal() {
    this.close.emit();
  }

  // Helper methods for template
  getStatusValue(character: CharacterSheet, formulaType: FormulaType): number {
    const status = character.statuses.find(s => s.formulaType === formulaType);
    return status ? status.statusBase : 0;
  }

  // Export FormulaType for template use
  FormulaType = FormulaType;
}
