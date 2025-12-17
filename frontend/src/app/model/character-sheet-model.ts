import { FormulaType } from './formula-type.enum';
import { StatBlock } from './stat-block.model';
import { StatusBlock } from './status-block.model';

export interface CharacterSheet {
  // Character
  name: string;
  race: string;
  age: number;
  alignment: string;
  size: string;
  extrainfo: string;

  // Klassen
  primary_class: string;
  secondary_class: string;
  level: number;
  learned_classes: string;

  strength: StatBlock;
  dexterity: StatBlock;
  speed: StatBlock;
  intelligence: StatBlock;
  chill: StatBlock;
  constitution: StatBlock;

  statuses: StatusBlock[];
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
    statuses: createBasicStatuses(),
  };
}

function createEmptyStatBlock(name: string): StatBlock {
  return new StatBlock(name, 10, 5, 0);
}

export function createBasicStatuses(): StatusBlock[] {
  return [
    {
      statusName: 'Life',
      statusColor: 'red',
      statusBase: 80,
      statusBonus: 0,
      statusCurrent: 80,
      formulaType: FormulaType.LIFE,
    },
    {
      statusName: 'Mana',
      statusColor: 'blue',
      statusBase: 40,
      statusBonus: 0,
      statusCurrent: 40,
      formulaType: FormulaType.MANA,
    },
    {
      statusName: 'Energy',
      statusColor: 'green',
      statusBase: 50,
      statusBonus: 0,
      statusCurrent: 50,
      formulaType: FormulaType.ENERGY,
    },
  ];
}
