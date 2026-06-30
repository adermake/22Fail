export type TalentStatKey = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';

export interface TalentDefinition {
  id: string;
  name: string;
  stat: TalentStatKey;
  statLabel: string;
  description: string;
}

export const TALENT_DEFINITIONS: TalentDefinition[] = [
  // ── Stärke ────────────────────────────────────────────────────────────────
  {
    id: 'athletik',
    name: 'Athletik',
    stat: 'strength',
    statLabel: 'STR',
    description: 'Aktionen, die körperliche Fitness voraussetzen.',
  },
  {
    id: 'einschuechtern',
    name: 'Einschüchtern',
    stat: 'strength',
    statLabel: 'STR',
    description: 'Aktionen, die den Gegenüber einschüchtern.',
  },
  // ── Konstitution ──────────────────────────────────────────────────────────
  {
    id: 'ueberleben',
    name: 'Überleben',
    stat: 'constitution',
    statLabel: 'KON',
    description: 'Reaktionen, die die Belastbarkeit des Körpers fordern.',
  },
  // ── Geschwindigkeit ───────────────────────────────────────────────────────
  {
    id: 'verstecken',
    name: 'Verstecken',
    stat: 'speed',
    statLabel: 'GSW',
    description: 'Aktionen, um vor anderen Personen unentdeckt zu bleiben.',
  },
  // ── Geschicklichkeit ──────────────────────────────────────────────────────
  {
    id: 'akrobatik',
    name: 'Akrobatik',
    stat: 'dexterity',
    statLabel: 'GSK',
    description: 'Aktionen, die hohe Körperkontrolle und Balance voraussetzen.',
  },
  {
    id: 'fingerfertigkeit',
    name: 'Fingerfertigkeit',
    stat: 'dexterity',
    statLabel: 'GSK',
    description: 'Aktionen, die präzise und geschickte Fingerarbeit voraussetzen.',
  },
  // ── Intelligenz ───────────────────────────────────────────────────────────
  {
    id: 'runenkunde',
    name: 'Runenkunde',
    stat: 'intelligence',
    statLabel: 'INT',
    description: 'Wissen über Runen und Zauber.',
  },
  {
    id: 'geschichte',
    name: 'Geschichte',
    stat: 'intelligence',
    statLabel: 'INT',
    description: 'Wissen über die Vergangenheit.',
  },
  {
    id: 'untersuchen',
    name: 'Untersuchen',
    stat: 'intelligence',
    statLabel: 'INT',
    description: 'Aktionen, die Informationen aus bestimmten Objekten extrahieren.',
  },
  {
    id: 'naturwissen',
    name: 'Naturwissen',
    stat: 'intelligence',
    statLabel: 'INT',
    description: 'Wissen über Tiere, Pflanzen etc.',
  },
  // ── Wille ─────────────────────────────────────────────────────────────────
  {
    id: 'unterhaltung',
    name: 'Unterhaltung',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aktionen, die die Aufmerksamkeit von Leuten auf dich ziehen.',
  },
  {
    id: 'heilkunde',
    name: 'Heilkunde',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aktionen, die andere verarzten und diagnostizieren.',
  },
  {
    id: 'tiere',
    name: 'Mit Tieren umgehen',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aktionen, die mit Tieren agieren.',
  },
  {
    id: 'durchschauen',
    name: 'Durchschauen',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aktionen, die versteckte Absichten und Emotionen von anderen erkennen.',
  },
  {
    id: 'taeuschen',
    name: 'Täuschen',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aktionen, die die Wahrheit vor anderen verhüllen.',
  },
  {
    id: 'ueberzeugen',
    name: 'Überzeugen',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aktionen, um andere von der Wahrheit zu überzeugen und zu motivieren.',
  },
  {
    id: 'wahrnehmung',
    name: 'Wahrnehmung',
    stat: 'chill',
    statLabel: 'WIL',
    description: 'Aktionen, um schwer Erkennbares wahrzunehmen.',
  },
];

/** Talent id from TALENT_DEFINITIONS (e.g. 'akrobatik', 'athletik'). */
export type TalentId = (typeof TALENT_DEFINITIONS)[number]['id'];
