export type TalentStatKey = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';

export interface TalentDefinition {
  id: string;
  name: string;
  stat: TalentStatKey;
  statLabel: string;
  description: string;
}

export const TALENT_DEFINITIONS: TalentDefinition[] = [
  {
    id: 'athletik',
    name: 'Athletik',
    stat: 'strength',
    statLabel: 'STR',
    description: 'Klettern, Springen, Schwimmen und körperliche Kraftleistungen.',
  },
  {
    id: 'einschuechterung',
    name: 'Einschüchterung',
    stat: 'strength',
    statLabel: 'STR',
    description: 'Durch körperliche Präsenz und Drohgebärden einschüchtern.',
  },
  {
    id: 'akrobatik',
    name: 'Akrobatik',
    stat: 'dexterity',
    statLabel: 'GSK',
    description: 'Balance, Ausweichen und akrobatische Manöver.',
  },
  {
    id: 'heimlichkeit',
    name: 'Heimlichkeit',
    stat: 'dexterity',
    statLabel: 'GSK',
    description: 'Unbemerkt schleichen und sich verstecken.',
  },
  {
    id: 'handwerk',
    name: 'Handwerk',
    stat: 'dexterity',
    statLabel: 'GSK',
    description: 'Präzise handwerkliche Tätigkeiten, Schlösser knacken und Fallen entschärfen.',
  },
  {
    id: 'sprint',
    name: 'Sprint',
    stat: 'speed',
    statLabel: 'GSW',
    description: 'Rennen, verfolgen und schnelle Positionswechsel.',
  },
  {
    id: 'reaktion',
    name: 'Reaktion',
    stat: 'speed',
    statLabel: 'GSW',
    description: 'Auf unerwartete Ereignisse blitzschnell reagieren.',
  },
  {
    id: 'wissen',
    name: 'Allgemeinwissen',
    stat: 'intelligence',
    statLabel: 'INT',
    description: 'Allgemeines Wissen, Geschichte und Fakten aus dem Gedächtnis abrufen.',
  },
  {
    id: 'heilkunde',
    name: 'Heilkunde',
    stat: 'intelligence',
    statLabel: 'INT',
    description: 'Wunden versorgen, Krankheiten erkennen und behandeln.',
  },
  {
    id: 'magieverstaendnis',
    name: 'Magieverständnis',
    stat: 'intelligence',
    statLabel: 'INT',
    description: 'Magische Phänomene, Zauber und arkane Quellen identifizieren.',
  },
  {
    id: 'ausdauer',
    name: 'Ausdauer',
    stat: 'constitution',
    statLabel: 'KON',
    description: 'Körperliche Strapazen, Erschöpfung und Entbehrungen überstehen.',
  },
  {
    id: 'zaehligkeit',
    name: 'Zähigkeit',
    stat: 'constitution',
    statLabel: 'KON',
    description: 'Widerstand gegen Gifte, Krankheiten und körperliche Schmerzen.',
  },
  {
    id: 'wahrnehmung',
    name: 'Wahrnehmung',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aufmerksamkeit, Sinnesschärfe und verdächtige Dinge bemerken.',
  },
  {
    id: 'ueberzeugung',
    name: 'Überzeugung',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Menschen durch Verhandlungsgeschick und Rhetorik überzeugen.',
  },
  {
    id: 'willenskraft',
    name: 'Willenskraft',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Widerstand gegen Furcht, Manipulation und mentale Einflüsse.',
  },
];
