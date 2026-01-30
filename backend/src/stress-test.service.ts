import { Injectable } from '@nestjs/common';
import { ImageService } from './image.service';

@Injectable()
export class StressTestService {
  constructor(private imageService: ImageService) {}

  // Sample base64 images (1x1 pixel PNGs in different colors)
  private sampleImages = [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', // Red
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==', // Green
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==', // Blue
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Yellow
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwnwAFBAIAn5KkkAAAAABJRU5ErkJggg==', // Purple
  ];

  private names = ['Thorin', 'Aria', 'Garrick', 'Luna', 'Drakon', 'Sylvia', 'Magnus', 'Freya', 'Ragnar', 'Elara', 'Brock', 'Zara', 'Viktor', 'Seraphina', 'Kael'];
  private races = ['Human', 'Elf', 'Dwarf', 'Orc', 'Halfling', 'Gnome', 'Dragonborn', 'Tiefling'];
  private classes = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Barbarian', 'Druid', 'Monk', 'Warlock'];
  private alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
  private itemNames = ['Sword', 'Shield', 'Potion', 'Scroll', 'Ring', 'Amulet', 'Boots', 'Cloak', 'Helmet', 'Armor'];
  private spellNames = ['Fireball', 'Lightning Bolt', 'Heal', 'Shield', 'Teleport', 'Summon', 'Freeze', 'Burn', 'Levitate', 'Charm'];
  private runeNames = ['Power', 'Speed', 'Defense', 'Magic', 'Luck', 'Wisdom', 'Strength', 'Agility', 'Vitality', 'Spirit'];
  private skillNames = ['Stealth', 'Perception', 'Athletics', 'Acrobatics', 'Persuasion', 'Intimidation', 'Investigation', 'Medicine', 'Survival', 'Arcana'];

  // Description templates
  private itemDescriptions = [
    'Forged in the depths of Mount Doom, this {item} radiates ancient power.',
    'A legendary {item} once wielded by the great hero {name}.',
    'This {item} was discovered in the ruins of an ancient civilization.',
    'Crafted by master artisans, this {item} is both beautiful and deadly.',
    'A cursed {item} that whispers secrets to those who dare wield it.',
    'This enchanted {item} glows with an ethereal light in darkness.',
    'Found in a dragon\'s hoard, this {item} has seen countless battles.',
    'A sacred {item} blessed by the gods themselves.',
  ];

  private spellDescriptions = [
    'Harness the raw power of {element} to devastate your enemies. Deals {damage}d6 {element} damage in a {area} area.',
    'Channel arcane energy to create a protective barrier. Reduces incoming damage by {value}% for {duration}.',
    'Summon forth {creature} to aid you in battle. Lasts for {duration} or until defeated.',
    'Bend the fabric of reality to {effect}. Requires intense concentration.',
    'Ancient incantation that {effect} all targets within {area}. Costs {cost} mana.',
    'Weave threads of magic to {effect}. The spell\'s power grows with your level.',
    'Forbidden magic that {effect} at the cost of {sacrifice}.',
    'Divine intervention that {effect} chosen allies within {area}.',
  ];

  private runeDescriptions = [
    'An ancient symbol of {aspect} carved into mystical stone. Grants the bearer enhanced {attribute}.',
    'This glowing rune pulses with {element} energy. When activated, it {effect}.',
    'Discovered in the tomb of {name} the {title}, this rune holds immense power.',
    'A Nordic rune that channels the fury of {deity}. Increases {attribute} by {value}.',
    'Etched with blood magic, this rune {effect} at the cost of {sacrifice}.',
    'A protective rune that wards against {threat}. Provides {value}% resistance.',
    'When carved into equipment, this rune {effect} and grants {bonus}.',
    'A rune of binding that {effect} and cannot be removed once applied.',
  ];

  private skillDescriptions = [
    'Years of training have honed your ability to {action}. Grants +{bonus} to {attribute} checks.',
    'Natural talent combined with practice allows you to {action} with exceptional skill.',
    'Through rigorous discipline, you have mastered the art of {action}.',
    'Your experience in {field} gives you an edge when attempting to {action}.',
    'A lifetime of study has granted you deep understanding of {field}.',
    'Your instincts guide you when {situation}, providing +{bonus} to related checks.',
    'Specialized training in {field} allows you to {action} where others fail.',
    'Raw talent for {action} sets you apart from common adventurers.',
  ];

  async generateStressTestData(config: {
    characters?: number;
    worlds?: number;
    items?: number;
    spells?: number;
    runes?: number;
    skills?: number;
    battlemaps?: number;
    imageIds?: string[];
  }) {
    const result = {
      characters: [] as any[],
      worlds: [] as any[],
      imageIds: [] as string[],
    };

    // Use provided image IDs or generate sample images
    const availableImages = (config.imageIds && config.imageIds.length > 0) 
      ? config.imageIds 
      : await this.storeSampleImages();

    result.imageIds = availableImages;

    // Generate characters
    const characterCount = config.characters || 0;
    for (let i = 0; i < characterCount; i++) {
      const characterId = `stress_char_${Date.now()}_${i}`;
      const character = this.generateCharacter(characterId, availableImages);
      result.characters.push({ id: characterId, data: character });
    }

    // Generate worlds
    const worldCount = config.worlds || 0;
    for (let i = 0; i < worldCount; i++) {
      const world = this.generateWorld(
        `StressWorld_${i}`,
        result.characters.map(c => c.id),
        config.items || 0,
        config.spells || 0,
        config.runes || 0,
        config.skills || 0,
        config.battlemaps || 0,
        availableImages
      );
      result.worlds.push(world);
    }

    return result;
  }

  private async storeSampleImages(): Promise<string[]> {
    const imageIds: string[] = [];
    for (const base64Image of this.sampleImages) {
      try {
        const imageId = this.imageService.storeImage(base64Image);
        imageIds.push(imageId);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`[STRESS TEST] Failed to store sample image: ${errorMsg}`);
        // Continue with other images
      }
    }
    
    // If no images were stored successfully, return empty array
    // The generateCharacter method will handle missing images
    if (imageIds.length === 0) {
      console.warn('[STRESS TEST] No sample images could be stored. Characters will be created without portraits.');
    }
    
    return imageIds;
  }

  private generateCharacter(id: string, availableImages: string[]): any {
    const name = this.randomFrom(this.names) + ' ' + this.randomFrom(['the Brave', 'the Wise', 'the Swift', 'the Strong', '']);
    const level = this.randomInt(1, 20);

    return {
      id,
      name,
      race: this.randomFrom(this.races),
      age: this.randomInt(18, 500),
      alignment: this.randomFrom(this.alignments),
      size: this.randomFrom(['Small', 'Medium', 'Large']),
      extrainfo: `Generated stress test character #${id}`,
      portrait: availableImages.length > 0 ? this.randomFrom(availableImages) : '',
      worldName: '',
      primary_class: this.randomFrom(this.classes),
      secondary_class: this.randomFrom(this.classes),
      level,
      learned_classes: '',
      fokusMultiplier: 1,
      fokusBonus: 0,
      strength: this.generateStatBlock('Stärke'),
      dexterity: this.generateStatBlock('Geschicklichkeit'),
      speed: this.generateStatBlock('Geschwindigkeit'),
      intelligence: this.generateStatBlock('Intelligenz'),
      chill: this.generateStatBlock('Chill'),
      constitution: this.generateStatBlock('Konstitution'),
      skills: this.generateSkills(this.randomInt(3, 10)),
      statuses: this.generateStatuses(),
      inventory: this.generateItems(this.randomInt(5, 20)),
      equipment: this.generateItems(this.randomInt(2, 8)),
      carryCapacityMultiplier: 1,
      carryCapacityBonus: 0,
      spells: this.generateSpells(this.randomInt(3, 15), availableImages),
      runes: this.generateRunes(this.randomInt(2, 8), availableImages),
      currency: {
        copper: this.randomInt(0, 100),
        silver: this.randomInt(0, 50),
        gold: this.randomInt(0, 20),
        platinum: this.randomInt(0, 5),
      },
      trash: [],
      talentPoints: this.randomInt(0, 10),
      talentPointsBonus: 0,
      learnedSkillIds: [],
      backstory: `A ${this.randomFrom(this.alignments)} ${this.randomFrom(this.races)} ${this.randomFrom(this.classes)} on a quest for glory.`,
    };
  }

  private generateWorld(
    name: string,
    characterIds: string[],
    itemCount: number,
    spellCount: number,
    runeCount: number,
    skillCount: number,
    battlemapCount: number,
    availableImages: string[]
  ): any {
    return {
      name,
      characterIds,
      partyIds: characterIds.slice(0, Math.min(characterIds.length, 6)), // First 6 as party
      itemLibrary: this.generateItems(itemCount),
      runeLibrary: this.generateRunes(runeCount, availableImages),
      spellLibrary: this.generateSpells(spellCount, availableImages),
      skillLibrary: this.generateSkills(skillCount),
      lootBundles: [],
      battleLoot: [],
      battleParticipants: [],
      currentTurnIndex: 0,
      trash: [],
      battleMaps: this.generateBattleMaps(battlemapCount, availableImages),
    };
  }

  private generateStatBlock(name: string): any {
    return {
      statName: name,
      statBase: this.randomInt(8, 18),
      statBonus: this.randomInt(0, 5),
      statMultiplier: 1,
    };
  }

  private generateStatuses(): any[] {
    return [
      {
        statusName: 'Leben',
        statusColor: 'red',
        statusBase: this.randomInt(50, 150),
        statusBonus: 0,
        statusCurrent: this.randomInt(30, 150),
        formulaType: 'life',
      },
      {
        statusName: 'Ausdauer',
        statusColor: 'green',
        statusBase: this.randomInt(30, 100),
        statusBonus: 0,
        statusCurrent: this.randomInt(20, 100),
        formulaType: 'energy',
      },
      {
        statusName: 'Mana',
        statusColor: 'blue',
        statusBase: this.randomInt(20, 80),
        statusBonus: 0,
        statusCurrent: this.randomInt(10, 80),
        formulaType: 'mana',
      },
    ];
  }

  private generateItems(count: number): any[] {
    const items: any[] = [];
    for (let i = 0; i < count; i++) {
      const itemName = this.randomFrom(this.itemNames);
      const bonus = this.randomInt(0, 3);
      const fullName = bonus > 0 ? `${itemName} +${bonus}` : itemName;
      
      const description = this.randomFrom(this.itemDescriptions)
        .replace('{item}', itemName.toLowerCase())
        .replace('{name}', this.randomFrom(this.names));

      items.push({
        itemName: fullName,
        itemDescription: description,
        itemWeight: this.randomInt(1, 20),
        itemValue: this.randomInt(10, 1000),
        itemType: this.randomFrom(['Weapon', 'Armor', 'Consumable', 'Quest', 'Misc']),
        itemRarity: this.randomFrom(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']),
        equipSlot: this.randomFrom(['', 'Head', 'Chest', 'Hands', 'Legs', 'Feet', 'Weapon', 'Shield']),
      });
    }
    return items;
  }

  private generateSpells(count: number, availableImages: string[]): any[] {
    const spells: any[] = [];
    for (let i = 0; i < count; i++) {
      const spellName = `${this.randomFrom(this.spellNames)} ${this.romanNumeral(this.randomInt(1, 5))}`;
      
      const description = this.randomFrom(this.spellDescriptions)
        .replace('{element}', this.randomFrom(['fire', 'ice', 'lightning', 'arcane', 'holy', 'shadow']))
        .replace('{damage}', this.randomInt(1, 10).toString())
        .replace('{area}', this.randomFrom(['5-foot', '10-foot', '20-foot', '30-foot']))
        .replace('{value}', this.randomInt(10, 50).toString())
        .replace('{duration}', this.randomFrom(['1 minute', '10 minutes', '1 hour', '8 hours']))
        .replace('{creature}', this.randomFrom(['elemental spirits', 'spectral warriors', 'shadow demons', 'celestial beings']))
        .replace('{effect}', this.randomFrom(['teleport allies', 'heal wounds', 'control minds', 'manipulate time', 'summon darkness', 'create illusions']))
        .replace('{cost}', this.randomInt(5, 50).toString())
        .replace('{sacrifice}', this.randomFrom(['health', 'sanity', 'life force']));

      spells.push({
        spellName,
        spellDescription: description,
        spellLevel: this.randomInt(1, 9),
        spellSchool: this.randomFrom(['Evocation', 'Conjuration', 'Abjuration', 'Transmutation', 'Divination', 'Necromancy', 'Enchantment', 'Illusion']),
        spellCastingTime: this.randomFrom(['1 action', '1 bonus action', '1 minute', '10 minutes']),
        spellRange: this.randomFrom(['Self', 'Touch', '30 feet', '60 feet', '120 feet', '1 mile']),
        spellDuration: this.randomFrom(['Instantaneous', '1 minute', '10 minutes', '1 hour', '24 hours', 'Concentration']),
        manaCost: this.randomInt(1, 50),
        drawing: this.randomFrom(availableImages), // Always assign image
      });
    }
    return spells;
  }

  private generateRunes(count: number, availableImages: string[]): any[] {
    const runes: any[] = [];
    for (let i = 0; i < count; i++) {
      const runeName = `Rune of ${this.randomFrom(this.runeNames)}`;
      
      const description = this.randomFrom(this.runeDescriptions)
        .replace('{aspect}', this.randomFrom(['power', 'wisdom', 'protection', 'destruction', 'creation']))
        .replace('{attribute}', this.randomFrom(['strength', 'dexterity', 'intelligence', 'constitution', 'speed']))
        .replace('{element}', this.randomFrom(['fire', 'ice', 'lightning', 'earth', 'wind']))
        .replace('{effect}', this.randomFrom(['doubles attack speed', 'reflects damage', 'grants invisibility', 'heals wounds', 'burns enemies']))
        .replace('{name}', this.randomFrom(this.names))
        .replace('{title}', this.randomFrom(['Ancient', 'Wise', 'Terrible', 'Merciful', 'Cruel']))
        .replace('{deity}', this.randomFrom(['Thor', 'Odin', 'Loki', 'Freya', 'Baldur']))
        .replace('{value}', this.randomInt(5, 50).toString())
        .replace('{sacrifice}', this.randomFrom(['health', 'mana', 'sanity']))
        .replace('{threat}', this.randomFrom(['fire', 'poison', 'curses', 'death magic', 'mind control']))
        .replace('{bonus}', this.randomFrom(['extra damage', 'critical strikes', 'life steal', 'mana regeneration']));

      runes.push({
        runeName,
        runeDescription: description,
        runeLevel: this.randomInt(1, 10),
        runeRarity: this.randomFrom(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']),
        runeEffect: `Bonus effect: ${this.randomInt(1, 20)}%`,
        drawing: this.randomFrom(availableImages), // Always assign image
      });
    }
    return runes;
  }

  private generateSkills(count: number): any[] {
    const skills: any[] = [];
    for (let i = 0; i < count; i++) {
      const skillName = this.randomFrom(this.skillNames);
      
      const description = this.randomFrom(this.skillDescriptions)
        .replace('{action}', this.randomFrom(['navigate treacherous terrain', 'deceive enemies', 'track prey', 'resist magic', 'perform acrobatics']))
        .replace('{bonus}', this.randomInt(1, 5).toString())
        .replace('{attribute}', skillName)
        .replace('{field}', this.randomFrom(['combat', 'magic', 'stealth', 'diplomacy', 'survival']))
        .replace('{situation}', this.randomFrom(['danger approaches', 'traps are nearby', 'enemies lurk', 'investigation is needed']));

      skills.push({
        skillName,
        skillDescription: description,
        skillBonus: this.randomInt(0, 10),
        skillProficiency: this.randomFrom(['None', 'Proficient', 'Expert', 'Master']),
      });
    }
    return skills;
  }

  private generateBattleMaps(count: number, availableImages: string[]): any[] {
    const maps: any[] = [];
    for (let i = 0; i < count; i++) {
      const tokenCount = this.randomInt(5, 20);
      const tokens: any[] = [];
      
      for (let t = 0; t < tokenCount; t++) {
        tokens.push({
          characterId: `token_${i}_${t}`,
          position: { q: this.randomInt(-10, 10), r: this.randomInt(-10, 10) },
          image: this.randomFrom(availableImages),
          name: this.randomFrom(this.names),
        });
      }

      maps.push({
        id: `battlemap_${i}`,
        name: `Battle Arena ${i + 1}`,
        drawings: this.generateDrawings(this.randomInt(10, 50)),
        tokens,
      });
    }
    return maps;
  }

  private generateDrawings(count: number): any[] {
    const drawings: any[] = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'];
    
    for (let i = 0; i < count; i++) {
      drawings.push({
        path: `M${this.randomInt(0, 1000)},${this.randomInt(0, 1000)} L${this.randomInt(0, 1000)},${this.randomInt(0, 1000)}`,
        color: this.randomFrom(colors),
        lineWidth: this.randomInt(1, 10),
      });
    }
    return drawings;
  }

  // Helper methods
  private randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private romanNumeral(num: number): string {
    const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (const key in lookup) {
      while (num >= lookup[key]) {
        roman += key;
        num -= lookup[key];
      }
    }
    return roman;
  }
}
