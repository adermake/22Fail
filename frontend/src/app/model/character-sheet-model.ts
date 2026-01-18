import { Currency } from './currency-model';
import { FormulaType } from './formula-type.enum';
import { ItemBlock } from './item-block.model';
import { SkillBlock } from './skill-block.model';
import { SpellBlock } from './spell-block-model';
import { StatBlock } from './stat-block.model';
import { StatusBlock } from './status-block.model';
import { RuneBlock } from './rune-block.model';

export interface SheetTrashItem {
  type: 'item' | 'equipment' | 'rune' | 'spell' | 'skill';
  data: ItemBlock | RuneBlock | SpellBlock | SkillBlock;
  deletedAt: number; // Timestamp
}

export interface CharacterSheet {
  id?: string; // Optional because it's not stored in the JSON file itself
  runes: RuneBlock[];
  // Character
  name: string;
  race: string;
  age: number;
  alignment: string;
  size: string;
  extrainfo: string;
  portrait?: string;
  worldName?: string; // The world this character belongs to
  // Klassen
  primary_class: string;
  secondary_class: string;
  level: number;
  learned_classes: string;
  fokusMultiplier: number;
  fokusBonus: number;
  strength: StatBlock;
  dexterity: StatBlock;
  speed: StatBlock;
  intelligence: StatBlock;
  chill: StatBlock;
  constitution: StatBlock;
  skills: SkillBlock[];
  statuses: StatusBlock[];
  inventory: ItemBlock[];
  equipment: ItemBlock[];
  carryCapacityMultiplier: number;
  carryCapacityBonus: number;
  spells: SpellBlock[];
  currency: Currency;
  trash: SheetTrashItem[]; // Recycle bin for deleted items
  // Talent System
  talentPoints: number;           // Available talent points to spend
  talentPointsBonus: number;      // GM-assigned bonus talent points
  learnedSkillIds: string[];      // IDs of skills learned from the skill tree
}

export function createEmptySheet(): CharacterSheet {
  return {
    name: '',
    race: '',
    age: 0,
    alignment: '',
    size: '',
    extrainfo: '',
    primary_class: '',
    secondary_class: '',
    level: 1,
    learned_classes: '',
    strength: createEmptyStatBlock('Stärke'),
    dexterity: createEmptyStatBlock('Geschicklichkeit'),
    speed: createEmptyStatBlock('Geschwindigkeit'),
    intelligence: createEmptyStatBlock('Intelligenz'),
    chill: createEmptyStatBlock('Chill'),
    constitution: createEmptyStatBlock('Konstitution'),
    skills: [],
    inventory: [],
    equipment: [],
    carryCapacityMultiplier: 1,
    carryCapacityBonus: 0,
    statuses: createBasicStatuses(),
    runes: [],
    spells: [],
    fokusMultiplier: 1,
    fokusBonus: 0,
    currency: {
      copper: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    },
    trash: [],
    talentPoints: 0,
    talentPointsBonus: 0,
    learnedSkillIds: [],
  };
}

function createEmptyStatBlock(name: string): StatBlock {
  return new StatBlock(name, 10, 5, 0);
}

export function createBasicStatuses(): StatusBlock[] {
  return [
    {
      statusName: 'Leben',
      statusColor: 'red',
      statusBase: 80,
      statusBonus: 0,
      statusCurrent: 80,
      formulaType: FormulaType.LIFE,
    },
    {
      statusName: 'Ausdauer',
      statusColor: 'green',
      statusBase: 50,
      statusBonus: 0,
      statusCurrent: 50,
      formulaType: FormulaType.ENERGY,
    },
    {
      statusName: 'Mana',
      statusColor: 'blue',
      statusBase: 40,
      statusBonus: 0,
      statusCurrent: 40,
      formulaType: FormulaType.MANA,
    },
  ];
}
