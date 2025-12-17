import { StatBlock } from "./stat-block.model";
import { StatusBlock } from "./status-block.model";



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