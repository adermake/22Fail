import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet, createEmptySheet } from '../../model/character-sheet-model';
import { CLASS_DEFINITIONS, SKILL_DEFINITIONS, getSkillsForClass, getSkillById } from '../../data/skill-definitions';
import { SkillDefinition } from '../../model/skill-definition.model';
import { HttpClient } from '@angular/common/http';
import { FormulaType } from '../../model/formula-type.enum';
import { CompassSelectorComponent } from './compass-selector.component';
import { SpiderChartComponent, StatDistribution } from './spider-chart.component';

@Component({
  selector: 'app-character-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, CompassSelectorComponent, SpiderChartComponent],
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
  compassAngle: number = 90; // For compass selector
  characterName: string = '';
  
  // Available races from backend
  races: any[] = [];
  selectedRaceId: string = '';
  
  // Generated character
  generatedCharacter: CharacterSheet | null = null;
  
  // Stat distribution (spider chart)
  statDistribution: StatDistribution = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    chill: 0,
    constitution: 0
  };

  ngOnInit() {
    this.loadRaces();
    this.generateRandomName();
  }

  get statPoints(): number {
    // 1 stat point per 3 levels
    return Math.floor(this.level / 3);
  }

  loadRaces() {
    this.http.get<any[]>('/api/races').subscribe({
      next: (races) => {
        this.races = races;
        // Select first race by default
        if (races.length > 0 && !this.selectedRaceId) {
          this.selectedRaceId = races[0].id;
        }
      },
      error: (err) => {
        console.error('Failed to load races:', err);
        // Fallback to basic races if API fails
        this.races = [
          { id: 'human', name: 'Human', stats: { strength: 10, dexterity: 10, speed: 10, intelligence: 10, chill: 10, constitution: 10 } }
        ];
        this.selectedRaceId = 'human';
      }
    });
  }

  onAngleChange(angle: number) {
    this.compassAngle = angle;
  }

  onDistributionChange(distribution: StatDistribution) {
    this.statDistribution = distribution;
  }

  onLevelChange() {
    // Regenerate if already generated
    if (this.generatedCharacter) {
      this.generateCharacter();
    }
  }

  randomizeRace() {
    if (this.races.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.races.length);
      this.selectedRaceId = this.races[randomIndex].id;
    }
  }

  generateRandomName() {
    this.characterName = this.generateName();
  }

  // Main generation function
  generateCharacter() {
    const character = createEmptySheet();
    
    // Use provided name or generate one
    character.name = this.characterName || this.generateName();
    
    // Set race and get base stats
    const selectedRace = this.races.find(r => r.id === this.selectedRaceId);
    if (selectedRace) {
      character.race = selectedRace.name;
      character.raceId = selectedRace.id;
      
      // Apply race base stats
      if (selectedRace.stats) {
        character.strength.base = selectedRace.stats.strength || 10;
        character.dexterity.base = selectedRace.stats.dexterity || 10;
        character.speed.base = selectedRace.stats.speed || 10;
        character.intelligence.base = selectedRace.stats.intelligence || 10;
        character.chill.base = selectedRace.stats.chill || 10;
        character.constitution.base = selectedRace.stats.constitution || 10;
      }
    } else {
      // Default to human with base 10 stats
      character.race = 'Human';
      character.raceId = 'human';
      character.strength.base = 10;
      character.dexterity.base = 10;
      character.speed.base = 10;
      character.intelligence.base = 10;
      character.chill.base = 10;
      character.constitution.base = 10;
    }
    
    // Apply stat distribution from spider chart (level-based points)
    const levelStatPoints = this.statPoints;
    if (levelStatPoints > 0) {
      const totalDistribution = Object.values(this.statDistribution).reduce((a, b) => a + b, 0);
      if (totalDistribution > 0) {
        // Distribute points proportionally
        const factor = levelStatPoints / totalDistribution;
        character.strength.base += Math.floor(this.statDistribution.strength * factor);
        character.dexterity.base += Math.floor(this.statDistribution.dexterity * factor);
        character.speed.base += Math.floor(this.statDistribution.speed * factor);
        character.intelligence.base += Math.floor(this.statDistribution.intelligence * factor);
        character.chill.base += Math.floor(this.statDistribution.chill * factor);
        character.constitution.base += Math.floor(this.statDistribution.constitution * factor);
      }
    }
    
    // Randomize age, height, alignment
    character.age = this.generateAge();
    character.size = this.generateHeight().toString() + 'cm';
    character.alignment = this.generateAlignment();
    
    // Set level
    character.level = this.level;
    
    // Calculate talent points based on level
    character.talentPoints = this.level - 1; // Level 1 = 0 points, Level 2 = 1 point, etc.
    
    // Traverse talent tree and learn skills (with 50% progression rule)
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

  // Talent tree traversal with directional preference and 50% progression rule
  private traverseTalentTree(talentPoints: number): string[] {
    const learnedSkillIds: string[] = [];
    
    if (talentPoints <= 0) {
      return learnedSkillIds;
    }
    
    // Start from tier 1 classes
    const tier1Classes = Object.entries(CLASS_DEFINITIONS)
      .filter(([_, info]) => info.tier === 1)
      .map(([name, _]) => name);
    
    // Choose starting class based on compass angle
    let currentClass = this.chooseClassByAngle(tier1Classes);
    
    // Track skills learned per class
    const classProgress = new Map<string, number>();
    
    // Traverse the tree, learning skills
    let remainingPoints = talentPoints;
    let lastClass = '';
    let stuckCount = 0;
    
    while (remainingPoints > 0 && stuckCount < 100) {
      // Get skills for current class
      const classSkills = getSkillsForClass(currentClass);
      const learnedInClass = classProgress.get(currentClass) || 0;
      
      if (classSkills.length > 0 && remainingPoints > 0) {
        // Learn a random skill from this class
        const unlearnedSkills = classSkills.filter(s => !learnedSkillIds.includes(s.id));
        if (unlearnedSkills.length > 0) {
          const randomSkill = unlearnedSkills[Math.floor(Math.random() * unlearnedSkills.length)];
          learnedSkillIds.push(randomSkill.id);
          classProgress.set(currentClass, learnedInClass + 1);
          remainingPoints--;
          stuckCount = 0; // Reset stuck counter on progress
          continue; // Continue learning from this class if possible
        }
      }
      
      // Check if we can progress to children (need 50% of skills learned)
      const classInfo = CLASS_DEFINITIONS[currentClass];
      const learned = classProgress.get(currentClass) || 0;
      const totalSkills = getSkillsForClass(currentClass).length;
      const progressionThreshold = Math.ceil(totalSkills / 2);
      
      if (learned >= progressionThreshold && classInfo && classInfo.children.length > 0) {
        // Can progress to child class
        const eligibleChildren = classInfo.children
          .map(c => c.className)
          .filter(childClass => {
            // Check if child has unlearned skills
            const childSkills = getSkillsForClass(childClass);
            return childSkills.some(s => !learnedSkillIds.includes(s.id));
          });
        
        if (eligibleChildren.length > 0) {
          currentClass = this.chooseClassByAngle(eligibleChildren);
          continue;
        }
      }
      
      // Can't progress or no children available, find another class with available skills
      const allClasses = Object.keys(CLASS_DEFINITIONS);
      const availableClasses = allClasses.filter(c => {
        const skills = getSkillsForClass(c);
        return skills.some(s => !learnedSkillIds.includes(s.id));
      });
      
      if (availableClasses.length > 0) {
        // Choose a class we haven't fully explored yet
        const unexploredClasses = availableClasses.filter(c => {
          const total = getSkillsForClass(c).length;
          const learned = classProgress.get(c) || 0;
          return learned < Math.ceil(total / 2);
        });
        
        if (unexploredClasses.length > 0) {
          currentClass = this.chooseClassByAngle(unexploredClasses);
        } else {
          currentClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
        }
      } else {
        // No more skills to learn
        break;
      }
      
      // Detect infinite loop
      if (currentClass === lastClass) {
        stuckCount++;
      } else {
        stuckCount = 0;
      }
      lastClass = currentClass;
    }
    
    return learnedSkillIds;
  }

  // Choose class closest to compass angle
  private chooseClassByAngle(classNames: string[]): string {
    if (classNames.length === 0) {
      return 'Magier'; // Fallback
    }
    
    if (classNames.length === 1) {
      return classNames[0];
    }
    
    const targetAngle = this.compassAngle;
    
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
