import { SkillDefinition } from '../model/skill-definition.model';

// Class hierarchy definition (replaces class-definitions.txt)
export interface ClassHierarchy {
  [className: string]: {
    tier: number;
    angle: number;
    children: Array<{ className: string; angle: number }>;
  };
}

export const CLASS_DEFINITIONS: ClassHierarchy = {
  // Tier 1
  'Magier': { tier: 1, angle: 90, children: [{ className: 'Kampfzauberer', angle: 114 }, { className: 'Heiler', angle: 67 }] },
  'K�mpfer': { tier: 1, angle: -41, children: [{ className: 'Krieger', angle: -14 }, { className: 'Barbar', angle: -58 }] },
  'Techniker': { tier: 1, angle: -147, children: [{ className: 'Sch�tze', angle: -165 }, { className: 'Dieb', angle: -125 }] },
  
  // Tier 2
  'Kampfzauberer': { tier: 2, angle: 114, children: [{ className: 'Arkanist', angle: 123 }, { className: 'H�momant', angle: 90 }] },
  'Heiler': { tier: 2, angle: 67, children: [{ className: 'Seelenformer', angle: 65 }, { className: 'Paladin', angle: 26 }] },
  'Sch�tze': { tier: 2, angle: -165, children: [{ className: 'J�ger', angle: -160 }, { className: 'Schnellsch�tze', angle: -179 }] },
  'Dieb': { tier: 2, angle: -125, children: [{ className: 'Kampfakrobat', angle: -131 }, { className: 'Assassine', angle: -151 }] },
  'Krieger': { tier: 2, angle: -14, children: [{ className: 'Ritter', angle: -1 }, { className: 'M�nch', angle: -35 }] },
  'Barbar': { tier: 2, angle: -58, children: [{ className: 'Berserker', angle: -68 }, { className: 'Pl�nderer', angle: -96 }] },
  
  // Tier 3
  'Arkanist': { tier: 3, angle: 123, children: [{ className: 'Formationsmagier', angle: 127 }, { className: 'Phantom', angle: -174 }, { className: 'Runenk�nstler', angle: 104 }] },
  'H�momant': { tier: 3, angle: 90, children: [{ className: 'Nekromant', angle: 83 }] },
  'Seelenformer': { tier: 3, angle: 65, children: [{ className: 'Gestaltenwandler', angle: 55 }, { className: 'Mentalist', angle: 71 }] },
  'J�ger': { tier: 3, angle: -160, children: [{ className: 'Attent�ter', angle: -155 }] },
  'Kampfakrobat': { tier: 3, angle: -131, children: [{ className: 'Klingent�nzer', angle: -136 }, { className: 'Duellant', angle: -116 }, { className: 'Phantom', angle: -174 }] },
  'Ritter': { tier: 3, angle: -1, children: [{ className: 'Erzritter', angle: 14 }, { className: 'Paladin', angle: 26 }, { className: 'W�chter', angle: -1 }] },
  'Berserker': { tier: 3, angle: -68, children: [{ className: 'Kriegsherr', angle: -92 }, { className: 'Omen', angle: -51 }] },
  'Pl�nderer': { tier: 3, angle: -96, children: [{ className: 'General', angle: -94 }] },
  'M�nch': { tier: 3, angle: -35, children: [{ className: 'Templer', angle: -42 }] },
  'Schnellsch�tze': { tier: 3, angle: -179, children: [{ className: 'T�ftler', angle: 157 }] },
  
  // Tier 4
  'Phantom': { tier: 4, angle: -174, children: [] },
  'Gestaltenwandler': { tier: 4, angle: 55, children: [] },
  'Formationsmagier': { tier: 4, angle: 127, children: [{ className: 'Manaf�rst', angle: 118 }, { className: 'T�ftler', angle: 157 }] },
  'Runenk�nstler': { tier: 4, angle: 104, children: [{ className: 'Manaf�rst', angle: 118 }, { className: 'Dunkler Ritter', angle: 24 }] },
  'Mentalist': { tier: 4, angle: 71, children: [{ className: 'Orakel', angle: 67 }, { className: 'Nekromant', angle: 83 }] },
  'Assassine': { tier: 4, angle: -151, children: [{ className: 'Attent�ter', angle: -155 }] },
  'Klingent�nzer': { tier: 4, angle: -136, children: [{ className: 'Waffenmeister', angle: -138 }] },
  'Erzritter': { tier: 4, angle: 14, children: [{ className: 'W�chter', angle: -1 }, { className: 'Dunkler Ritter', angle: 24 }] },
  'General': { tier: 4, angle: -94, children: [{ className: 'Kriegsherr', angle: -92 }] },
  'Paladin': { tier: 4, angle: 26, children: [] },
  'Templer': { tier: 4, angle: -42, children: [{ className: 'Koloss', angle: -30 }, { className: 'Omen', angle: -51 }] },
  
  // Tier 5
  'Manaf�rst': { tier: 5, angle: 118, children: [] },
  'T�ftler': { tier: 5, angle: 157, children: [] },
  'Attent�ter': { tier: 5, angle: -155, children: [] },
  'Duellant': { tier: 5, angle: -116, children: [] },
  'Waffenmeister': { tier: 5, angle: -138, children: [] },
  'Kriegsherr': { tier: 5, angle: -92, children: [] },
  'Omen': { tier: 5, angle: -51, children: [] },
  'Koloss': { tier: 5, angle: -30, children: [] },
  'W�chter': { tier: 5, angle: -1, children: [] },
  'Dunkler Ritter': { tier: 5, angle: 24, children: [] },
  'Orakel': { tier: 5, angle: 67, children: [] },
  'Nekromant': { tier: 5, angle: 83, children: [] }
};

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // ==================== TIER 1 ====================

  // ==================== K�MPFER ====================
  {
    id: 'kaempfer_staerke_1',
    name: 'St�rke+1',
    class: 'K�mpfer',
    type: 'stat_bonus',
    description: 'St�rke+1',
    statBonus: { stat: 'strength', amount: 1 }
  },
  {
    id: 'kaempfer_konstitution_1',
    name: 'Konstitution+1',
    class: 'K�mpfer',
    type: 'stat_bonus',
    description: 'Konstitution+1',
    statBonus: { stat: 'constitution', amount: 1 }
  },
  {
    id: 'kaempfer_schwere_waffen_werfen',
    name: 'Schwere Waffen werfen+1',
    class: 'K�mpfer',
    type: 'dice_bonus',
    description: 'Schwere Waffen werfen+1'
  },
  {
    id: 'kaempfer_backpacker',
    name: 'Backpacker',
    class: 'K�mpfer',
    type: 'passive',
    description: '+30 Inventarkapazit�t'
  },
  {
    id: 'kaempfer_fester_stand',
    name: 'Fester Stand',
    class: 'K�mpfer',
    type: 'passive',
    description: '-1 gegen R�cksto�'
  },

  // ==================== TECHNIKER ====================
  {
    id: 'techniker_geschicklichkeit_1',
    name: 'Geschicklichkeit+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: 'Geschicklichkeit+1',
    statBonus: { stat: 'dexterity', amount: 1 }
  },
  {
    id: 'techniker_geschwindigkeit_1',
    name: 'Geschwindigkeit+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: 'Geschwindigkeit+1',
    statBonus: { stat: 'speed', amount: 1 }
  },
  {
    id: 'techniker_ausdauer_15',
    name: 'Ausdauer+15',
    class: 'Techniker',
    type: 'stat_bonus',
    description: 'Ausdauer+15',
    statBonus: { stat: 'energy', amount: 15 }
  },
  {
    id: 'techniker_springen',
    name: 'Springen-2',
    class: 'Techniker',
    type: 'dice_bonus',
    description: 'Springen-2'
  },
  {
    id: 'techniker_leichte_waffen_werfen',
    name: 'Leichte Waffen werfen-1',
    class: 'Techniker',
    type: 'dice_bonus',
    description: 'Leichte Waffen werfen-1'
  },

  // ==================== MAGIER ====================
  {
    id: 'magier_intelligenz_1',
    name: 'Intelligenz+1',
    class: 'Magier',
    type: 'stat_bonus',
    description: 'Intelligenz+1',
    statBonus: { stat: 'intelligence', amount: 1 }
  },
  {
    id: 'magier_mana_10',
    name: 'Mana+10',
    class: 'Magier',
    type: 'stat_bonus',
    description: 'Mana+10',
    statBonus: { stat: 'mana', amount: 10 }
  },
  {
    id: 'magier_fokus_1',
    name: 'Fokus+1',
    class: 'Magier',
    type: 'stat_bonus',
    description: 'Fokus+1',
    statBonus: { stat: 'focus', amount: 1 }
  },
  {
    id: 'magier_exzellenz',
    name: 'Exzellenz',
    class: 'Magier',
    type: 'passive',
    description: '-1 auf Zauber mit voller Mana'
  },
  {
    id: 'magier_zauberlehrling',
    name: 'Zauberlehrling',
    class: 'Magier',
    type: 'passive',
    description: '+2 Effektivit�t auf Zauber'
  },

  // ==================== TIER 2 ====================

  // ==================== KRIEGER ====================
  {
    id: 'krieger_konstitution_2',
    name: 'Konstitution+2',
    class: 'Krieger',
    type: 'stat_bonus',
    description: 'Konstitution+2',
    statBonus: { stat: 'constitution', amount: 2 }
  },
  {
    id: 'krieger_statusresistenz',
    name: 'Statusresistenz',
    class: 'Krieger',
    type: 'passive',
    description: 'Schaden von negativen Effekten gegen dich werden halbiert',
    enlightened: true
  },
  {
    id: 'krieger_harter_bursche',
    name: 'Harter Bursche',
    class: 'Krieger',
    type: 'passive',
    description: '+1, um aus Bewusstlosigkeit zu erwachen'
  },
  {
    id: 'krieger_aetherkraft',
    name: '�therkraft',
    class: 'Krieger',
    type: 'passive',
    description: 'Kann erlittenen Schaden halbieren und die andere H�lfte als Mana zahlen.'
  },
  {
    id: 'krieger_schwerer_schlag',
    name: 'Schwerer Schlag',
    class: 'Krieger',
    type: 'active',
    description: 'Schlag mit hoher St�rke, muss eine Runde ausholen',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'krieger_defensive_haltung',
    name: 'Defensive Haltung',
    class: 'Krieger',
    type: 'active',
    description: 'Reduziert erlittenen Schaden von Fernkampfwaffen stark, kann aber nicht angreifen',
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== BARBAR ====================
  {
    id: 'barbar_staerke_2',
    name: 'St�rke+2',
    class: 'Barbar',
    type: 'stat_bonus',
    description: 'St�rke+2',
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'barbar_ruecksichtslos',
    name: 'R�cksichtslos',
    class: 'Barbar',
    type: 'passive',
    description: 'St�rke+4 bei weniger als 5 R�stungsmalus'
  },
  {
    id: 'barbar_blutlust',
    name: 'Blutlust',
    class: 'Barbar',
    type: 'passive',
    description: '-1 auf Angriffe f�r jeden get�ten Gegner, h�lt f�r den Rest des Kampfes, maximal -3'
  },
  {
    id: 'barbar_muskelprotz',
    name: 'Muskelprotz',
    class: 'Barbar',
    type: 'passive',
    description: '-1 auf Angriffe mit schweren Waffen',
    enlightened: true
  },
  {
    id: 'barbar_waffenweitwurf',
    name: 'Waffenweitwurf',
    class: 'Barbar',
    type: 'active',
    description: 'Wirft schwere Waffe mit hoher Genauigkeit auf weit entfernte Gegner, maximal 50m',
    enlightened: true,
    cost: { type: 'energy', amount: 25 },
    actionType: 'Aktion'
  },
  {
    id: 'barbar_kampfschrei',
    name: 'Kampfschrei',
    class: 'Barbar',
    type: 'active',
    description: 'Erh�ht Bewegung aller Verb�ndeter um 3 in der N�he f�r einen Zug',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== DIEB ====================
  {
    id: 'dieb_geschwindigkeit_2',
    name: 'Geschwindigkeit+2',
    class: 'Dieb',
    type: 'stat_bonus',
    description: 'Geschwindigkeit+2',
    statBonus: { stat: 'speed', amount: 2 }
  },
  {
    id: 'dieb_stehlen',
    name: 'Stehlen-2',
    class: 'Dieb',
    type: 'dice_bonus',
    description: 'Stehlen-2'
  },
  {
    id: 'dieb_fliehen',
    name: 'Fliehen-2',
    class: 'Dieb',
    type: 'dice_bonus',
    description: 'Fliehen-2'
  },
  {
    id: 'dieb_schloesser_knacken',
    name: 'Schl�sser knacken-2',
    class: 'Dieb',
    type: 'dice_bonus',
    description: 'Schl�sser knacken-2'
  },
  {
    id: 'dieb_feinmotoriker',
    name: 'Feinmotoriker',
    class: 'Dieb',
    type: 'passive',
    description: '-1 auf Angriffe mit leichten Waffen',
    enlightened: true
  },
  {
    id: 'dieb_leichtfuessigkeit',
    name: 'Leichtf��igkeit',
    class: 'Dieb',
    type: 'passive',
    description: 'Bewegung+2 bei weniger als 5 R�stungsmalus',
    enlightened: true
  },
  {
    id: 'dieb_auge_der_gier',
    name: 'Auge der Gier',
    class: 'Dieb',
    type: 'dice_bonus',
    description: '-2 auf Wert absch�tzen',
    enlightened: true
  },
  {
    id: 'dieb_schleichen',
    name: 'Schleichen',
    class: 'Dieb',
    type: 'active',
    description: 'Bewegung, die von Gegnern schwer entdeckt werden kann',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== SCH�TZE ====================
  {
    id: 'schutze_geschicklichkeit_2',
    name: 'Geschicklichkeit+2',
    class: 'Sch�tze',
    type: 'stat_bonus',
    description: 'Geschicklichkeit+2',
    statBonus: { stat: 'dexterity', amount: 2 }
  },
  {
    id: 'schutze_reichweite_10',
    name: 'Reichweite+10m',
    class: 'Sch�tze',
    type: 'stat_bonus',
    description: 'Reichweite+10m f�r Fernkampfwaffen'
  },
  {
    id: 'schutze_waffenwissen',
    name: 'Waffenwissen',
    class: 'Sch�tze',
    type: 'passive',
    description: 'Waffenvorraussetzung-4 f�r Fernkampfwaffen',
    enlightened: true
  },
  {
    id: 'schutze_adlerauge',
    name: 'Adlerauge',
    class: 'Sch�tze',
    type: 'passive',
    description: '-1 im Fernkampf'
  },
  {
    id: 'schutze_geschaerfte_sinne',
    name: 'Gesch�rfte Sinne',
    class: 'Sch�tze',
    type: 'passive',
    description: '-2 auf alle Aktionen au�erhalb von K�mpfen, die gute Sehkraft vorraussetzen',
    enlightened: true
  },
  {
    id: 'schutze_aetherfeuer',
    name: '�therfeuer',
    class: 'Sch�tze',
    type: 'active',
    description: 'F�hre eine weitere Aktion aus',
    cost: { type: 'mana', amount: 20 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'schutze_zielschuss',
    name: 'Zielschuss',
    class: 'Sch�tze',
    type: 'active',
    description: 'Schuss mit doppelter Reichweite und Schaden',
    cost: { type: 'energy', amount: 25 },
    actionType: 'Aktion'
  },

  // ==================== KAMPFZAUBERER ====================
  {
    id: 'kampfzauberer_intelligenz_2',
    name: 'Intelligenz+2',
    class: 'Kampfzauberer',
    type: 'stat_bonus',
    description: 'Intelligenz+2',
    statBonus: { stat: 'intelligence', amount: 2 }
  },
  {
    id: 'kampfzauberer_runenlehre',
    name: 'Runenlehre',
    class: 'Kampfzauberer',
    type: 'passive',
    description: '-3 auf Analyse von unbekannten Runen'
  },
  {
    id: 'kampfzauberer_zauberladung',
    name: 'Zauberladung',
    class: 'Kampfzauberer',
    type: 'passive',
    description: '+2 beim W�rfeln f�r Zaubercasts'
  },
  {
    id: 'kampfzauberer_verinnerlichen',
    name: 'Verinnerlichen',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Lerne einen Zauber auswendig, damit du ihn ohne Medium benutzen kannst. Zauber k�nnen jederzeit gewechselt werden, brauchen aber mehrere Stunden.',
    enlightened: true
  },
  {
    id: 'kampfzauberer_freies_wirken',
    name: 'Freies Wirken',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Kann sich w�hrend eines Zaubercasts bewegen'
  },
  {
    id: 'kampfzauberer_manatransfer',
    name: 'Manatransfer',
    class: 'Kampfzauberer',
    type: 'active',
    description: 'Konvertiert 1x Ausdauer 0,8x Mana (wird gerundet)',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'kampfzauberer_manadisruption',
    name: 'Manadisruption',
    class: 'Kampfzauberer',
    type: 'active',
    description: 'Reduziere den Castwert des Spells eines Gegners in 20m Umfeld um eine gew�rfelte Anzahl. Boni f�r Zaubercasts werden hier auch angewandt.',
    enlightened: true,
    cost: { type: 'energy', amount: 5 },
    actionType: 'Bonusaktion'
  },

  // ==================== HEILER ====================
  {
    id: 'heiler_mana_20',
    name: 'Mana+20',
    class: 'Heiler',
    type: 'stat_bonus',
    description: 'Mana+20',
    statBonus: { stat: 'mana', amount: 20 }
  },
  {
    id: 'heiler_gesundheitscheck',
    name: 'Gesundheitscheck',
    class: 'Heiler',
    type: 'passive',
    description: '-4 auf Untersuchung von Gesundheit'
  },
  {
    id: 'heiler_notarzt',
    name: 'Notarzt',
    class: 'Heiler',
    type: 'passive',
    description: '-3 auf alle Heilungsw�rfe, wenn Ziel im kritischen Zustand ist',
    enlightened: true
  },
  {
    id: 'heiler_alchemist',
    name: 'Alchemist',
    class: 'Heiler',
    type: 'passive',
    description: '-2 beim Brauen von Tr�nken mit positivem Effekt',
    enlightened: true
  },
  {
    id: 'heiler_regenbogen',
    name: 'Regenbogen',
    class: 'Heiler',
    type: 'passive',
    description: 'Manakosten -20% auf pure Heilzauber'
  },
  {
    id: 'heiler_einfachheit',
    name: 'Einfachheit',
    class: 'Heiler',
    type: 'passive',
    description: '-2 Voraussetzung auf Heilzauber'
  },
  {
    id: 'heiler_gruppencast',
    name: 'Gruppencast',
    class: 'Heiler',
    type: 'active',
    description: 'Helfe einem Verb�ndeten beim Zaubercast, indem du f�r seinen Castwert w�rfelst. Boni f�r Zaubercasts werden hier auch angewandt.',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== TIER 3 ====================

  // ==================== RITTER ====================
  {
    id: 'ritter_leben_30',
    name: 'Leben+30',
    class: 'Ritter',
    type: 'stat_bonus',
    description: 'Leben+30',
    statBonus: { stat: 'life', amount: 30 }
  },
  {
    id: 'ritter_reiten',
    name: 'Reiten-2',
    class: 'Ritter',
    type: 'dice_bonus',
    description: 'Reiten-2'
  },
  {
    id: 'ritter_parieren',
    name: 'Parieren-1',
    class: 'Ritter',
    type: 'dice_bonus',
    description: 'Parieren-1'
  },
  {
    id: 'ritter_ruestungsnegation_5',
    name: 'R�stungsnegation+5',
    class: 'Ritter',
    type: 'stat_bonus',
    description: 'R�stungsnegation+5'
  },
  {
    id: 'ritter_tierfreund',
    name: 'Tierfreund',
    class: 'Ritter',
    type: 'passive',
    description: '-2 im Umgang mit Tieren',
    enlightened: true
  },
  {
    id: 'ritter_ritterschwur',
    name: 'Ritterschwur',
    class: 'Ritter',
    type: 'passive',
    description: '-2 auf Reaktionen, die gegnerische Angriffe auf Verb�ndete blocken',
    enlightened: true
  },
  {
    id: 'ritter_schwere_ruestung',
    name: 'Schwere R�stung',
    class: 'Ritter',
    type: 'active',
    description: 'Negiert Schaden und wandelt ihn zu doppeltem R�stungsschaden um',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'ritter_schildstoss',
    name: 'Schildsto�',
    class: 'Ritter',
    type: 'active',
    description: 'Angriff mit Schild, hoher R�cksto�',
    enlightened: true,
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },
  {
    id: 'ritter_reitstoss',
    name: 'Reitsto�',
    class: 'Ritter',
    type: 'active',
    description: 'Durchbohrender Angriff auf dem Pferd, -5 auf Zerst�rung einer br�chigen Waffe',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== M�NCH ====================
  {
    id: 'moench_konstitution_3',
    name: 'Konstitution+3',
    class: 'M�nch',
    type: 'stat_bonus',
    description: 'Konstitution+3',
    statBonus: { stat: 'constitution', amount: 3 }
  },
  {
    id: 'moench_goettlicher_segen',
    name: 'G�ttlicher Segen',
    class: 'M�nch',
    type: 'passive',
    description: 'Pechresistenz'
  },
  {
    id: 'moench_fokussierte_schlaege',
    name: 'Fokussierte Schl�ge',
    class: 'M�nch',
    type: 'passive',
    description: '-3 bei Angriffen auf Gegenst�nde'
  },
  {
    id: 'moench_waffenloser_kampf',
    name: 'Waffenloser Kampf',
    class: 'M�nch',
    type: 'passive',
    description: '-2 im Kampf ohne Waffen(au�er Handschuhen)'
  },
  {
    id: 'moench_hartes_training',
    name: 'Hartes Training',
    class: 'M�nch',
    type: 'passive',
    description: 'Geschicklichkeit+4 bei weniger als 5 R�stungsmalus',
    enlightened: true
  },
  {
    id: 'moench_chakra_blockade',
    name: 'Chakra-Blockade',
    class: 'M�nch',
    type: 'active',
    description: 'Angriff, der gegnerische Extremit�ten l�hmt',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'moench_meditation',
    name: 'Meditation',
    class: 'M�nch',
    type: 'active',
    description: 'Stellt 5 Mana her',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== BERSERKER ====================
  {
    id: 'berserker_staerke_2',
    name: 'St�rke+2',
    class: 'Berserker',
    type: 'stat_bonus',
    description: 'St�rke+2',
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'berserker_notfallstaerke',
    name: 'Notfallst�rke',
    class: 'Berserker',
    type: 'passive',
    description: '-1 im Kampf je 40 fehlende Leben, maximal -5',
    enlightened: true
  },
  {
    id: 'berserker_kriegsschrei',
    name: '+Kriegsschrei',
    class: 'Berserker',
    type: 'passive',
    description: 'Mit jedem get�ten Gegner wird "Kampfschrei" ausgel�st',
    requiresSkill: 'barbar_kampfschrei'
  },
  {
    id: 'berserker_unsterblicher_krieger',
    name: 'Unsterblicher Krieger',
    class: 'Berserker',
    type: 'passive',
    description: 'Heilt Leben um 3 D20, wenn Gegner get�tet wird'
  },
  {
    id: 'berserker_adrenalin',
    name: 'Adrenalin',
    class: 'Berserker',
    type: 'passive',
    description: 'Immun gegen negative Statuseffekte im Ragemodus'
  },
  {
    id: 'berserker_erbarmungslosigkeit',
    name: 'Erbarmunglosigkeit',
    class: 'Berserker',
    type: 'passive',
    description: 'F�r Z�ge in denen angegriffen wurde bleibt Rage bestehen.',
    enlightened: true
  },
  {
    id: 'berserker_rage',
    name: 'Rage',
    class: 'Berserker',
    type: 'active',
    description: 'Wird in den Ragemodus versetzt.',
    cost: { type: 'energy', amount: 5 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'berserker_wuetender_wurf',
    name: 'W�tender Wurf',
    class: 'Berserker',
    type: 'active',
    description: 'Wirft einen Gegner bis zu 50m weit',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== PL�NDERER ====================
  {
    id: 'pluenderer_charisma_3',
    name: 'Charisma+3',
    class: 'Pl�nderer',
    type: 'stat_bonus',
    description: 'Charisma+3',
    statBonus: { stat: 'chill', amount: 3 }
  },
  {
    id: 'pluenderer_horter',
    name: 'Horter',
    class: 'Pl�nderer',
    type: 'passive',
    description: 'Erh�ht Inventarkapazit�t um 50%',
    enlightened: true
  },
  {
    id: 'pluenderer_reichtum',
    name: 'Reichtum',
    class: 'Pl�nderer',
    type: 'passive',
    description: 'Erh�lt 50% mehr Geld durch Loot und Verk�ufe'
  },
  {
    id: 'pluenderer_brandstifter',
    name: 'Brandstifter',
    class: 'Pl�nderer',
    type: 'passive',
    description: 'Reduziert Schaden von normalem Feuer um 80%',
    enlightened: true
  },
  {
    id: 'pluenderer_raeuberbande',
    name: 'R�uberbande',
    class: 'Pl�nderer',
    type: 'passive',
    description: '-1 im Kampf, wenn deine Gruppe in �berzahl ist',
    enlightened: true
  },
  {
    id: 'pluenderer_pluendern',
    name: 'Pl�ndern',
    class: 'Pl�nderer',
    type: 'active',
    description: 'Schlag, der dem Gegner Geld stiehlt (D20)',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },

  // ==================== KAMPFAKROBAT ====================
  {
    id: 'kampfakrobat_bewegung_3',
    name: 'Bewegung+3',
    class: 'Kampfakrobat',
    type: 'stat_bonus',
    description: 'Bewegung+3',
    statBonus: { stat: 'speed', amount: 3 }
  },
  {
    id: 'kampfakrobat_bonusaktion',
    name: 'Bonusaktion',
    class: 'Kampfakrobat',
    type: 'passive',
    description: 'Erhalte eine zus�tzliche Bonusaktion pro Zug'
  },
  {
    id: 'kampfakrobat_sprungangriff',
    name: 'Sprungangriff',
    class: 'Kampfakrobat',
    type: 'passive',
    description: '-2 auf Angriffe in der Luft'
  },
  {
    id: 'kampfakrobat_sicherer_fall',
    name: 'Sicherer Fall',
    class: 'Kampfakrobat',
    type: 'passive',
    description: 'Landet garantiert auf instabilem Boden und erh�lt -1 auf den folgenden Angriff',
    enlightened: true
  },
  {
    id: 'kampfakrobat_federfall',
    name: 'Federfall',
    class: 'Kampfakrobat',
    type: 'passive',
    description: 'Fallschaden um 75% reduziert',
    enlightened: true
  },
  {
    id: 'kampfakrobat_opportunist',
    name: 'Opportunist',
    class: 'Kampfakrobat',
    type: 'passive',
    description: 'Wenn du einem Angriff ausweichst, kontere mit einem simplen Waffenangriff'
  },
  {
    id: 'kampfakrobat_bonusangriff',
    name: 'Bonusangriff',
    class: 'Kampfakrobat',
    type: 'active',
    description: 'Angriff als Bonusaktion',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },

  // ==================== J�GER ====================
  {
    id: 'jaeger_geschicklichkeit_3',
    name: 'Geschicklichkeit+3',
    class: 'J�ger',
    type: 'stat_bonus',
    description: 'Geschicklichkeit+3',
    statBonus: { stat: 'dexterity', amount: 3 }
  },
  {
    id: 'jaeger_klettern',
    name: 'Klettern-2',
    class: 'J�ger',
    type: 'dice_bonus',
    description: 'Klettern-2'
  },
  {
    id: 'jaeger_verstecken',
    name: 'Verstecken-2',
    class: 'J�ger',
    type: 'dice_bonus',
    description: 'Verstecken-2'
  },
  {
    id: 'jaeger_fallen_stellen',
    name: 'Fallen stellen-2',
    class: 'J�ger',
    type: 'dice_bonus',
    description: 'Fallen stellen-2'
  },
  {
    id: 'jaeger_basteln',
    name: 'Basteln',
    class: 'J�ger',
    type: 'passive',
    description: 'Die Qualit�t hergestellter Munition erh�ht sich um einen Rang',
    enlightened: true
  },
  {
    id: 'jaeger_spuren_lesen',
    name: 'Spuren lesen',
    class: 'J�ger',
    type: 'passive',
    description: 'Kann Spuren von Tieren und Gegnern lesen und verfolgen',
    enlightened: true
  },
  {
    id: 'jaeger_angedrehte_schuesse',
    name: 'Angedrehte Sch�sse',
    class: 'J�ger',
    type: 'passive',
    description: 'Fernkampfprojektile k�nnen in der Luft die Richtung �ndern'
  },

  // ==================== SCHNELLSCH�TZE ====================
  {
    id: 'schnellschuetze_bewegung_3',
    name: 'Bewegung+3',
    class: 'Schnellsch�tze',
    type: 'stat_bonus',
    description: 'Bewegung+3',
    statBonus: { stat: 'speed', amount: 3 }
  },
  {
    id: 'schnellschuetze_dynamisches_schiessen',
    name: 'Dynamisches Schie�en',
    class: 'Schnellsch�tze',
    type: 'passive',
    description: 'Kann w�hrend dem Laufen ohne Malus schie�en',
    enlightened: true
  },
  {
    id: 'schnellschuetze_sofortladung',
    name: 'Sofortladung',
    class: 'Schnellsch�tze',
    type: 'passive',
    description: 'Verbraucht keine Aktion, um Waffen nachzuladen'
  },
  {
    id: 'schnellschuetze_unberuehrt',
    name: 'Unber�hrt',
    class: 'Schnellsch�tze',
    type: 'passive',
    description: '+5 Bewegung, wenn du diese und letzte Runde keinen Schaden genommen hast',
    enlightened: true
  },
  {
    id: 'schnellschuetze_folgeangriff',
    name: 'Folgeangriff',
    class: 'Schnellsch�tze',
    type: 'passive',
    description: 'Erh�lt sofort eine Extra-Aktion, wenn ein Gegner handlungsunf�hig wird, egal wer am Zug ist'
  },
  {
    id: 'schnellschuetze_multischuss',
    name: 'Multischuss',
    class: 'Schnellsch�tze',
    type: 'active',
    description: 'Kann bis zu 3 Projektile auf unterschiedliche Gegner auf einmal schie�en',
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'schnellschuetze_runde_2',
    name: 'Runde 2',
    class: 'Schnellsch�tze',
    type: 'active',
    description: 'Erhalte eine Extra-Aktion, wenn du das n�chste mal am Zug bist',
    enlightened: true,
    cost: { type: 'energy', amount: 5 },
    actionType: 'Aktion'
  },

  // ==================== ARKANIST ====================
  {
    id: 'arkanist_mana_30',
    name: 'Mana+30',
    class: 'Arkanist',
    type: 'stat_bonus',
    description: 'Mana+30',
    statBonus: { stat: 'mana', amount: 30 }
  },
  {
    id: 'arkanist_zauberradius_1',
    name: 'Zauberradius+1m',
    class: 'Arkanist',
    type: 'stat_bonus',
    description: 'Zauberradius+1m',
    enlightened: true,
    statBonus: { stat: 'spellRadius', amount: 1 }
  },
  {
    id: 'arkanist_managespuer',
    name: 'Managesp�r',
    class: 'Arkanist',
    type: 'passive',
    description: 'Kann pures Mana sp�ren',
    enlightened: true
  },
  {
    id: 'arkanist_verinnerlichen',
    name: '+Verinnerlichen',
    class: 'Arkanist',
    type: 'passive',
    description: 'Besetze je 5 Fokus, um einen zus�tzlichen Zauber auswendig zu lernen.',
    enlightened: true,
    requiresSkill: 'kampfzauberer_verinnerlichen'
  },
  {
    id: 'arkanist_schmagied',
    name: 'Schmagied',
    class: 'Arkanist',
    type: 'passive',
    description: 'Halbiert Vorraussetzungen von selbst gebauten Zaubern.'
  },
  {
    id: 'arkanist_zauberbrecher',
    name: 'Zauberbrecher',
    class: 'Arkanist',
    type: 'active',
    description: 'Annulliert einen Zauber im Zauberradius, Ausdauerkosten entsprechen den halben Manakosten des Zaubers und kann Ausdauer ins Negative bringen. Erh�lt M�glichkeit, diese F�higkeit zu nutzen, wenn ein Zauber den Zauberradius betritt.',
    actionType: 'Aktion'
  },
  {
    id: 'arkanist_ueberladen',
    name: '�berladen',
    class: 'Arkanist',
    type: 'active',
    description: 'Nutze den n�chsten Zauber mit verdoppelter Vorraussetzung und Effektivit�t',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== H�MOMANT ====================
  {
    id: 'haemomant_leben_30',
    name: 'Leben+30',
    class: 'H�momant',
    type: 'stat_bonus',
    description: 'Leben+30',
    statBonus: { stat: 'life', amount: 30 }
  },
  {
    id: 'haemomant_magisches_blut',
    name: 'Magisches Blut',
    class: 'H�momant',
    type: 'passive',
    description: 'Kann eigenes Blut als Startpunkt f�r Zauber benutzen'
  },
  {
    id: 'haemomant_kaltbluetig',
    name: 'Kaltbl�tig',
    class: 'H�momant',
    type: 'passive',
    description: '-1 im Kampf gegen Gegner mit offenen Wunden',
    enlightened: true
  },
  {
    id: 'haemomant_transfusion',
    name: 'Transfusion',
    class: 'H�momant',
    type: 'active',
    description: 'Absorbiere umliegendes Blut und heile dich um den gew�rfelten Betrag (D8)',
    cost: { type: 'energy', amount: 5 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'haemomant_blutecho',
    name: 'Blutecho',
    class: 'H�momant',
    type: 'active',
    description: 'Absorbiert einen genannten Skill aus gegnerischem Blut und verwende ihn direkt ohne Kosten. Sollte der genannte Skill nicht existieren, wird ein zuf�lliger Skill ausgew�hlt. Nur einmal pro Person m�glich',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'haemomant_hypertonie',
    name: 'Hypertonie',
    class: 'H�momant',
    type: 'active',
    description: '-2 im Kampf',
    cost: { type: 'life', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'haemomant_aderlass',
    name: 'Aderlass',
    class: 'H�momant',
    type: 'active',
    description: 'Konvertiert 1x Leben zu 0,8x Mana (wird abgerundet)',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },

  // ==================== SEELENFORMER ====================
  {
    id: 'seelenformer_fokus_4',
    name: 'Fokus+4',
    class: 'Seelenformer',
    type: 'stat_bonus',
    description: 'Fokus+4',
    statBonus: { stat: 'focus', amount: 4 }
  },
  {
    id: 'seelenformer_runenkonvergenz',
    name: 'Runenkonvergenz',
    class: 'Seelenformer',
    type: 'passive',
    description: '-1 auf Nutzung von Zaubern die eine Elementarrune beinhalten, die f�r eine aktive Beschw�rung benutzt wurde.'
  },
  {
    id: 'seelenformer_hausgemacht',
    name: 'Hausgemacht',
    class: 'Seelenformer',
    type: 'passive',
    description: 'Senkt Fokuskosten f�r selbst kreierte Seelenrunen in Beschw�rungszaubern um 20% und erm�glicht es, diese Seelenrunen in diesen Zaubern frei auszutauschen.'
  },
  {
    id: 'seelenformer_seelenwacht',
    name: 'Seelenwacht',
    class: 'Seelenformer',
    type: 'active',
    description: 'Kann Seelen von Tieren analysieren, um sie als Rune zu speichern. Ben�tigt mehrere Tage intensiver Inspektion',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'seelenformer_erweitertes_bewusstsein',
    name: 'Erweitertes Bewusstsein',
    class: 'Seelenformer',
    type: 'active',
    description: 'Reduziert Ausdauer auf 0, um den maximalen Fokus zu verdreifachen. Muss deaktiviert werden, um Ausdauer zu regenerieren. (Minimum)',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'seelenformer_adlerauge',
    name: 'Adlerauge',
    class: 'Seelenformer',
    type: 'active',
    description: 'Nutze die Wahrnehmung einer deiner Beschw�rungen als deine eigene',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'seelenformer_sanktum',
    name: 'Sanktum',
    class: 'Seelenformer',
    type: 'active',
    description: 'Festige die Seele eines Verb�ndeten, was ihn immun gegen psychische Angriffe macht',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== TIER 4 ====================

  // ==================== ERZRITTER ====================
  {
    id: 'erzritter_konstitution_4',
    name: 'Konstitution+4',
    class: 'Erzritter',
    type: 'stat_bonus',
    description: 'Konstitution+4',
    statBonus: { stat: 'constitution', amount: 4 }
  },
  {
    id: 'erzritter_waffenkenner',
    name: 'Waffenkenner',
    class: 'Erzritter',
    type: 'passive',
    description: 'Waffenvorraussetzung-8 f�r schwere Waffen',
    enlightened: true
  },
  {
    id: 'erzritter_rittmeister',
    name: 'Rittmeister',
    class: 'Erzritter',
    type: 'passive',
    description: '-2 auf Angriffe wenn auf einem Reittier'
  },
  {
    id: 'erzritter_unzerbrechliche_ruestung',
    name: 'Unzerbrechliche R�stung',
    class: 'Erzritter',
    type: 'passive',
    description: 'Halbiert R�stungsschaden'
  },
  {
    id: 'erzritter_ruestungsschmied',
    name: 'R�stungsschmied',
    class: 'Erzritter',
    type: 'passive',
    description: 'Verdreifacht erw�rfelte Schmiedepunkte beim Schmieden von R�stung'
  },
  {
    id: 'erzritter_volle_wucht',
    name: 'Volle Wucht',
    class: 'Erzritter',
    type: 'active',
    description: 'Rammangriff, der mit R�stungsgewicht skaliert',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'erzritter_schwerer_panzer',
    name: '+Schwerer Panzer',
    class: 'Erzritter',
    type: 'active',
    description: '"Schwere R�stung" kostet keine Ausdauer.',
    requiresSkill: 'ritter_schwere_ruestung',
    actionType: 'Aktion'
  },
  {
    id: 'erzritter_magische_ausruestung',
    name: 'Magische Ausr�stung',
    class: 'Erzritter',
    type: 'active',
    description: 'R�stung wird magisch an- und ausger�stet',
    cost: { type: 'mana', amount: 5 },
    actionType: 'Bonusaktion'
  },

  // ==================== TEMPLER ====================
  {
    id: 'templer_geschwindigkeit_4',
    name: 'Geschwindigkeit+4',
    class: 'Templer',
    type: 'stat_bonus',
    description: 'Geschwindigkeit+4',
    statBonus: { stat: 'speed', amount: 4 }
  },
  {
    id: 'templer_verlaengerter_arm',
    name: '+Verl�ngerter Arm',
    class: 'Templer',
    type: 'passive',
    description: 'St�be z�hlen f�r "Waffenloser Kampf".',
    requiresSkill: 'moench_waffenloser_kampf'
  },
  {
    id: 'templer_staehlerne_haut',
    name: 'St�hlerne Haut',
    class: 'Templer',
    type: 'passive',
    description: 'Halbiert Schaden gegen Wuchtangriffe',
    enlightened: true
  },
  {
    id: 'templer_mentale_ruestung',
    name: 'Mentale R�stung',
    class: 'Templer',
    type: 'passive',
    description: 'Kann bei Schaden anstatt Leben 150% des Schadens als Ausdauer verlieren.',
    enlightened: true
  },
  {
    id: 'templer_chakrawissen',
    name: '+Chakrawissen',
    class: 'Templer',
    type: 'active',
    description: '"Chakra-Blockade" kann f�r jeden Angriff ohne Kosten aktiviert werden.',
    requiresSkill: 'moench_chakra_blockade',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Keine Aktion'
  },
  {
    id: 'templer_laehmung',
    name: 'L�hmung',
    class: 'Templer',
    type: 'active',
    description: 'Angriff, der Gegner komplett l�hmt',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'templer_absolute_kontrolle',
    name: 'Absolute Kontrolle',
    class: 'Templer',
    type: 'active',
    description: 'Kann jeden Gegner in Reichweite mit Nahkampfwaffe einmal pro Runde angreifen, +1 je Angriff nach dem Ersten',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'templer_kraft_aus_dem_inneren',
    name: 'Kraft aus dem Inneren',
    class: 'Templer',
    type: 'active',
    description: 'Nach Kanalisierung 10 HP Heilung pro Zug und Bewegung+5, Buffdauer entspricht Kanalisierungsdauer',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== GENERAL ====================
  {
    id: 'general_staerke_4',
    name: 'St�rke+4',
    class: 'General',
    type: 'stat_bonus',
    description: 'St�rke+4',
    statBonus: { stat: 'strength', amount: 4 }
  },
  {
    id: 'general_meisterstratege',
    name: 'Meisterstratege',
    class: 'General',
    type: 'passive',
    description: 'Kann die Strategie des Gegners mit Blick auf das Schlachtfeld erkennen',
    enlightened: true
  },
  {
    id: 'general_leibwaechter',
    name: 'Leibw�chter',
    class: 'General',
    type: 'passive',
    description: '-2 auf Reaktionen von Verb�ndeten, um dich zu sch�tzen',
    enlightened: true
  },
  {
    id: 'general_angriffsbefehl',
    name: 'Angriffsbefehl',
    class: 'General',
    type: 'active',
    description: 'Schenkt einem Verb�ndeten einen Extrazug',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_schutzbefehl',
    name: 'Schutzbefehl',
    class: 'General',
    type: 'active',
    description: 'Ein Veb�ndeter erh�lt -5 auf die Reaktion des n�chsten Angriffs',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_standbefehl',
    name: 'Standbefehl',
    class: 'General',
    type: 'active',
    description: 'Zieht eine Linie, auf der alle Verb�ndeten im Kampf -1 erhalten',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_befehlskette',
    name: 'Befehlskette',
    class: 'General',
    type: 'active',
    description: 'Kann diese Runde unendlich viele Befehle ausgeben f�r doppelte Ausdauerkosten',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== KLINGENT�NZER ====================
  {
    id: 'klingentaenzer_geschwindigkeit_4',
    name: 'Geschwindigkeit+4',
    class: 'Klingent�nzer',
    type: 'stat_bonus',
    description: 'Geschwindigkeit+4',
    statBonus: { stat: 'speed', amount: 4 }
  },
  {
    id: 'klingentaenzer_waffen_werfen',
    name: 'Waffen werfen-2',
    class: 'Klingent�nzer',
    type: 'dice_bonus',
    description: 'Waffen werfen-2'
  },
  {
    id: 'klingentaenzer_waffengelehrter',
    name: 'Waffengelehrter',
    class: 'Klingent�nzer',
    type: 'passive',
    description: 'Waffenvorraussetzung-8 f�r leichte Waffen',
    enlightened: true
  },
  {
    id: 'klingentaenzer_waffentanz',
    name: 'Waffentanz',
    class: 'Klingent�nzer',
    type: 'passive',
    description: '-1 auf den ersten Angriff mit einer Waffe. Erneuert sich, wenn Waffe min. 1m von dir entfernt ist oder in dieser Runde aufgehoben wurde'
  },
  {
    id: 'klingentaenzer_akrobat',
    name: 'Akrobat',
    class: 'Klingent�nzer',
    type: 'passive',
    description: '+3 Bewegung auf Waffen zu, die momentan niemand h�lt'
  },
  {
    id: 'klingentaenzer_unantastbar',
    name: 'Unantastbar',
    class: 'Klingent�nzer',
    type: 'passive',
    description: 'Nach einer Killbeteiligung kann in der n�chsten Runde einem Angriff garantiert ausgewichen werden',
    enlightened: true
  },
  {
    id: 'klingentaenzer_fliegender_kick',
    name: 'Fliegender Kick',
    class: 'Klingent�nzer',
    type: 'active',
    description: 'Leichte Waffen, die sich in der Luft befinden, k�nnen auf Gegner gekickt werden. Kann auch als Reaktion genutzt werden',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },
  {
    id: 'klingentaenzer_klingenwirbel',
    name: 'Klingenwirbel',
    class: 'Klingent�nzer',
    type: 'active',
    description: 'Wirf eine leichte Waffe mit so viel Drall, dass sie n�chste Runde zur�ckkehrt',
    enlightened: true,
    cost: { type: 'energy', amount: 5 },
    actionType: 'Aktion'
  },

  // ==================== ASSASSINE ====================
  {
    id: 'assassine_ausdauer_40',
    name: 'Ausdauer+40',
    class: 'Assassine',
    type: 'stat_bonus',
    description: 'Ausdauer+40',
    statBonus: { stat: 'energy', amount: 40 }
  },
  {
    id: 'assassine_gnadenstoss',
    name: 'Gnadensto�',
    class: 'Assassine',
    type: 'passive',
    description: '-2 auf Angriffe gegen vergiftete Gegner',
    enlightened: true
  },
  {
    id: 'assassine_exitus',
    name: 'Exitus',
    class: 'Assassine',
    type: 'passive',
    description: '-1 auf Angriffe mit Absicht zu t�ten'
  },
  {
    id: 'assassine_hinterhalt',
    name: 'Hinterhalt',
    class: 'Assassine',
    type: 'passive',
    description: '-2, wenn Gegner von hinten angegriffen wird'
  },
  {
    id: 'assassine_infiltration',
    name: 'Infiltration',
    class: 'Assassine',
    type: 'passive',
    description: 'Bewegung+3, wenn deine Gruppe in Unterzahl ist',
    enlightened: true
  },
  {
    id: 'assassine_gift_mischen',
    name: 'Gift mischen',
    class: 'Assassine',
    type: 'passive',
    description: '-2 beim Brauen auf Tr�nke mit sch�dlichem Effekt',
    enlightened: true
  },
  {
    id: 'assassine_phantomschnitt',
    name: 'Phantomschnitt',
    class: 'Assassine',
    type: 'active',
    description: 'Greift Gegner an, der erst nach bis zu einer Minute Schaden nimmt',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },

  // ==================== PHANTOM ====================
  {
    id: 'phantom_ausdauer_30',
    name: 'Ausdauer+30',
    class: 'Phantom',
    type: 'stat_bonus',
    description: 'Ausdauer+30',
    statBonus: { stat: 'energy', amount: 30 },
    infiniteLevel: true
  },
  {
    id: 'phantom_nachternte',
    name: 'Nachternte',
    class: 'Phantom',
    type: 'passive',
    description: 'Stellt 2 D20 Mana her, wenn Gegner get�tet wird'
  },
  {
    id: 'phantom_hoehenvorteil',
    name: 'H�henvorteil',
    class: 'Phantom',
    type: 'passive',
    description: '-2 auf Angriffe, die aus mindestens 10m H�he �ber dem Gegner ausgef�hrt werden',
    enlightened: true
  },
  {
    id: 'phantom_spiegelversteck',
    name: 'Spiegelversteck',
    class: 'Phantom',
    type: 'passive',
    description: 'Kann sich in der Reflektion eines Spiegels verbergen. Kann von Spiegel zu Spiegel in Sichtfeld springen. Wird beendet, wenn dieser zerst�rt oder unklar wird. 5 pro Runde',
    enlightened: true
  },
  {
    id: 'phantom_schattenform',
    name: 'Schattenform',
    class: 'Phantom',
    type: 'active',
    description: 'Mache deinen K�rper durchl�ssig und schwebend, wodurch du dich durch Objekte bewegen kannst und nicht von nichtmagischen Angriffen getroffen werden kannst, aber auch nur mit Magie angreifen kannst',
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'phantom_schrei_todesfee',
    name: 'Schrei der Todesfee',
    class: 'Phantom',
    type: 'active',
    description: 'W�hle einen Skill aus, der f�r alle Gegner in H�rreichweite blockiert wird. Kostet 10x die Rundendauer',
    actionType: 'Aktion'
  },
  {
    id: 'phantom_dunkler_begleiter',
    name: 'Dunkler Begleiter',
    class: 'Phantom',
    type: 'active',
    description: 'Verschwinde im K�rper eines Verb�ndeten. In diesem Zustand k�nnen alle Skills des Verb�ndeten verwendet werden (auf eigene Kosten). Bei Angriffen erhalten beide Schaden',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== FORMATIONSMAGIER ====================
  {
    id: 'formationsmagier_fokus_5',
    name: 'Fokus+5',
    class: 'Formationsmagier',
    type: 'stat_bonus',
    description: 'Fokus+5',
    statBonus: { stat: 'focus', amount: 5 }
  },
  {
    id: 'formationsmagier_max_castwert',
    name: 'Maximaler Castwert+200',
    class: 'Formationsmagier',
    type: 'stat_bonus',
    description: 'Maximaler Castwert+200',
    enlightened: true,
    statBonus: { stat: 'maxCastValue', amount: 200 }
  },
  {
    id: 'formationsmagier_zauberarchitekt',
    name: 'Zauberarchitekt',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Halbiert Fokuskosten von Zaubern mit einer Effizienz von �ber 100.'
  },
  {
    id: 'formationsmagier_magische_rueckkopplung',
    name: 'Magische R�ckkopplung',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Kann objektgebundene Zauber als Bonusaktion verwenden, verbraucht aber x10 Haltbarkeit.',
    enlightened: true
  },
  {
    id: 'formationsmagier_arkane_resonanz',
    name: 'Arkane Resonanz',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Muss bei Formationen(gro�en Spells) nur 10% der zus�tzlichen Manakosten zahlen.'
  },
  {
    id: 'formationsmagier_vorbereiten',
    name: 'Vorbereiten',
    class: 'Formationsmagier',
    type: 'passive',
    description: '+5 beim W�rfeln f�r Zaubercasts, deren Maximum bei 50 oder h�her liegt'
  },
  {
    id: 'formationsmagier_dunkles_siegel',
    name: 'Dunkles Siegel',
    class: 'Formationsmagier',
    type: 'active',
    description: '-10 auf den n�chsten Zauber, danach kann einen Tag keine Magie mehr benutzt werden',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== RUNENK�NSTLER ====================
  {
    id: 'runenkuenstler_mana_40',
    name: 'Mana+40',
    class: 'Runenk�nstler',
    type: 'stat_bonus',
    description: 'Mana+40',
    statBonus: { stat: 'mana', amount: 40 }
  },
  {
    id: 'runenkuenstler_verinnerlichen',
    name: '+Verinnerlichen',
    class: 'Runenk�nstler',
    type: 'passive',
    description: 'Kann unendlich viele Zauber sofort auswendig lernen.',
    enlightened: true,
    requiresSkill: 'kampfzauberer_verinnerlichen'
  },
  {
    id: 'runenkuenstler_zauberecho',
    name: 'Zauberecho',
    class: 'Runenk�nstler',
    type: 'passive',
    description: 'Kann den in dieser Aktion genutzten Zauber nochmal benutzen. Bonusaktion, 20'
  },
  {
    id: 'runenkuenstler_runenmeister',
    name: 'Runenmeister',
    class: 'Runenk�nstler',
    type: 'passive',
    description: 'Vorteil auf Analyse von unbekannten Runen',
    enlightened: true
  },
  {
    id: 'runenkuenstler_zauberhast',
    name: 'Zauberhast',
    class: 'Runenk�nstler',
    type: 'passive',
    description: '+10m Bewegung, wenn du in dieser Runde einen Gegner kampfunf�hig gemacht hast. Pro Gegner einmal m�glich.'
  },
  {
    id: 'runenkuenstler_runenblick',
    name: 'Runenblick',
    class: 'Runenk�nstler',
    type: 'active',
    description: 'Analysiert die Struktur eines unbekannten Spells im Sichtfeld und lernt dessen Struktur auswendig. Manakosten des Zaubers/4',
    actionType: 'Aktion'
  },
  {
    id: 'runenkuenstler_brennender_fokus',
    name: 'Brennender Fokus',
    class: 'Runenk�nstler',
    type: 'active',
    description: 'Halbiert Fokus solange aktiv und erh�ht Effektivit�t von allen Zaubern um 50%',
    cost: { type: 'energy', amount: 5, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== MENTALIST ====================
  {
    id: 'mentalist_intelligenz_4',
    name: 'Intelligenz+4',
    class: 'Mentalist',
    type: 'stat_bonus',
    description: 'Intelligenz+4',
    statBonus: { stat: 'intelligence', amount: 4 }
  },
  {
    id: 'mentalist_traumcaster',
    name: 'Traumcaster',
    class: 'Mentalist',
    type: 'passive',
    description: 'Kann Zauber bei Bewusstlosigkeit casten'
  },
  {
    id: 'mentalist_aluhut',
    name: 'Aluhut',
    class: 'Mentalist',
    type: 'passive',
    description: 'Gegner, die deine Gedanken beeinflussen wollen, erhalten einen Nachteil',
    enlightened: true
  },
  {
    id: 'mentalist_telepathie',
    name: 'Telepathie',
    class: 'Mentalist',
    type: 'passive',
    description: 'Kann mit Verb�ndeten in [Intelligenz*5]m Entfernung telepathisch kommunizieren (mit deren Einverst�ndnis)',
    enlightened: true
  },
  {
    id: 'mentalist_manipulator',
    name: 'Manipulator',
    class: 'Mentalist',
    type: 'passive',
    description: 'Verdoppelt Effizienz von Runen, die den Verstand des Ziels beeinflussen.'
  },
  {
    id: 'mentalist_invasion',
    name: 'Invasion',
    class: 'Mentalist',
    type: 'active',
    description: '�bernimmt Kontrolle �ber Kreatur. Gegnerintelligenz*2 pro Runde, min. 10',
    actionType: 'Aktion'
  },
  {
    id: 'mentalist_abbild',
    name: 'Abbild',
    class: 'Mentalist',
    type: 'active',
    description: 'Kopiere den aktiven Skill einer Person und �bertrage ihn zu einer anderen Person, der Skill kann einmalig verwendet werden und ist auf 1 pro Person limitiert',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== GESTALTENWANDLER ====================
  {
    id: 'gestaltenwandler_charisma_3',
    name: 'Charisma+3',
    class: 'Gestaltenwandler',
    type: 'stat_bonus',
    description: 'Charisma+3',
    statBonus: { stat: 'chill', amount: 3 },
    infiniteLevel: true
  },
  {
    id: 'gestaltenwandler_botschafter',
    name: 'Botschafter',
    class: 'Gestaltenwandler',
    type: 'passive',
    description: 'Charme+2 bei Kommunikation mit Personen derselben Rasse',
    enlightened: true
  },
  {
    id: 'gestaltenwandler_formwechsel',
    name: 'Formwechsel',
    class: 'Gestaltenwandler',
    type: 'passive',
    description: 'Kann bei K�rperkontakt Objekte in Beschw�rungen verwandeln, das Objekt bleibt in der Beschw�rung, solange diese besteht',
    enlightened: true
  },
  {
    id: 'gestaltenwandler_transformieren',
    name: 'Transformieren',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Verwandelt sich in ein Lebewesen, dessen Seelenrune sich im Besitz des Anwenders befindet. Jede Verwandlung hat einen eigenen Lebensbalken und verschwindet wenn dieser aufgebraucht ist',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'gestaltenwandler_imitation',
    name: 'Imitation',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Verwandelt sich in ein anderes Lebewesen, wenn K�rperkontakt besteht. �bernimmt keine Skills oder Stats',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'gestaltenwandler_doppelgaenger',
    name: 'Doppelg�nger',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Beschw�rt einen Doppelg�nger mit identischem Aussehen und teilt Leben, Mana, Ausdauer und Fokus zwischen beiden auf. Stirbt das Original, lebt der Doppelg�nger mit halbierten Stats weiter, auf einen gleichzeitig begrenzt',
    cost: { type: 'energy', amount: 50 },
    actionType: 'Aktion'
  },
  {
    id: 'gestaltenwandler_seelenmeister',
    name: '+Seelenmeister',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Erweitert Seelenwacht auf menschliche Ziele. Kopiert deren Skills.',
    requiresSkill: 'seelenformer_seelenwacht',
    actionType: 'Aktion'
  },

  // ==================== PALADIN ====================
  {
    id: 'paladin_konstitution_charisma_2',
    name: 'Konstitution&Charisma+2',
    class: 'Paladin',
    type: 'stat_bonus',
    description: 'Konstitution&Charisma+2',
    statBonuses: [{ stat: 'constitution', amount: 2 }, { stat: 'chill', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'paladin_fixer_fixer',
    name: 'Fixer Fixer',
    class: 'Paladin',
    type: 'passive',
    description: 'Kann pure Unterst�tzungszauber als Bonusaktion verwenden'
  },
  {
    id: 'paladin_schnelle_hilfe',
    name: 'Schnelle Hilfe',
    class: 'Paladin',
    type: 'passive',
    description: 'Verb�ndete, die von einem puren Unterst�tzungszauber getroffen werden, erhalten in ihrem n�chsten Zug eine zus�tzliche Bonusaktion'
  },
  {
    id: 'paladin_inspiration',
    name: 'Inspiration',
    class: 'Paladin',
    type: 'passive',
    description: 'Nach einem guten Wurf (1-8nat) kann ein Verb�ndeter ausgew�hlt werden, der -1 auf seinen n�chsten Wurf erh�lt',
    enlightened: true
  },
  {
    id: 'paladin_gleissendes_licht',
    name: 'Glei�endes Licht',
    class: 'Paladin',
    type: 'passive',
    description: 'Halbiert Manakosten von Lichtrunen',
    enlightened: true
  },
  {
    id: 'paladin_heroischer_auftritt',
    name: 'Heroischer Auftritt',
    class: 'Paladin',
    type: 'passive',
    description: 'Wenn ein Verb�ndeter in kritischem Zustand ist, erhalte Vorteil auf alle Aktionen, um diesen Verb�ndeten zu besch�tzen oder zu heilen.'
  },
  {
    id: 'paladin_erneuerung',
    name: 'Erneuerung',
    class: 'Paladin',
    type: 'active',
    description: 'Repariert einen ausgew�hlten Gegenstand in der N�he um 3 D20 Haltbarkeit',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'paladin_heiliger_sprint',
    name: 'Heiliger Sprint',
    class: 'Paladin',
    type: 'active',
    description: 'Erhalte x4 Bewegung auf Verb�ndete im kritischen Zustand',
    enlightened: true,
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },

  // ==================== TIER 5 ====================

  // ==================== W�CHTER ====================
  {
    id: 'waechter_konstitution_4',
    name: 'Konstitution+4',
    class: 'W�chter',
    type: 'stat_bonus',
    description: 'Konstitution+4',
    statBonus: { stat: 'constitution', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'waechter_leibwache',
    name: 'Leibwache',
    class: 'W�chter',
    type: 'passive',
    description: 'Erhalte 2 Reaktionen f�r Angriffe auf Verb�ndete in der N�he'
  },
  {
    id: 'waechter_kenne_deinen_feind',
    name: 'Kenne deinen Feind',
    class: 'W�chter',
    type: 'passive',
    description: 'Nach jedem erfolgreichen Block erh�lst du -1 auf alle Angriffe und Blocks gegen diesen Gegner, maximal -3',
    enlightened: true
  },
  {
    id: 'waechter_schildmeister',
    name: 'Schildmeister',
    class: 'W�chter',
    type: 'passive',
    description: '-2 auf Angriffe und Blocks mit Schild',
    enlightened: true
  },
  {
    id: 'waechter_edles_opfer',
    name: 'Edles Opfer',
    class: 'W�chter',
    type: 'passive',
    description: 'Wenn du in den kritischen Zustand f�llst, erhalten alle Verb�ndeten in der N�he einmal pro Kampf eine Heilung, die der H�lfte deiner Leben entspricht'
  },
  {
    id: 'waechter_beschuetzerinstinkt',
    name: 'Besch�tzerinstinkt',
    class: 'W�chter',
    type: 'active',
    description: 'Sp�rt alle Gefahren in der Umgebung auf. Kosten entsprechen dem Aufsp�rradius in m',
    enlightened: true,
    actionType: 'Aktion'
  },
  {
    id: 'waechter_vergeltungsschlag',
    name: 'Vergeltungsschlag',
    class: 'W�chter',
    type: 'active',
    description: 'Geht in eine defensive Position f�r die Dauer des Skills, was Bewegung halbiert und nur defensive Aktionen erlaubt. Wird der Skill beendet, wird ein Schlag ausgef�hrt, dessen St�rke mit dem eingesteckten Schaden skaliert',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== KOLOSS ====================
  {
    id: 'koloss_konstitution_staerke_2',
    name: 'Konstitution&St�rke+2',
    class: 'Koloss',
    type: 'stat_bonus',
    description: 'Konstitution&St�rke+2',
    statBonuses: [{ stat: 'constitution', amount: 2 }, { stat: 'strength', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'koloss_weg_des_eroberers',
    name: 'Weg des Eroberers',
    class: 'Koloss',
    type: 'passive',
    description: 'Kann nicht von gegnerischen Angriffen bewegt werden',
    enlightened: true
  },
  {
    id: 'koloss_unaufhaltsam',
    name: 'Unaufhaltsam',
    class: 'Koloss',
    type: 'passive',
    description: 'Reduziert Schaden aus allen Quellen um 10, kann nicht unter 1 fallen',
    enlightened: true
  },
  {
    id: 'koloss_provokante_praesenz',
    name: 'Provokante Pr�senz',
    class: 'Koloss',
    type: 'passive',
    description: 'Zieht Fokus der Gegner auf sich',
    enlightened: true
  },
  {
    id: 'koloss_erdbeben',
    name: 'Erdbeben',
    class: 'Koloss',
    type: 'active',
    description: 'Erzeugt Beben im Umkreis. Kosten entsprechen der H�lfte des Radius',
    actionType: 'Aktion'
  },
  {
    id: 'koloss_wahre_groesse',
    name: 'Wahre Gr��e',
    class: 'Koloss',
    type: 'active',
    description: 'Wird f�r kurze Zeit viel gr��er. Kosten entsprechen Gr��enskalierung*10 pro Runde',
    actionType: 'Bonusaktion'
  },
  {
    id: 'koloss_kolossaler_schlag',
    name: 'Kolossaler Schlag',
    class: 'Koloss',
    type: 'active',
    description: 'Holt f�r Schlag aus, der mehr Reichweite und Schaden besitzt, je l�nger ausgeholt wird',
    enlightened: true,
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== OMEN ====================
  {
    id: 'omen_leben_40',
    name: 'Leben+40',
    class: 'Omen',
    type: 'stat_bonus',
    description: 'Leben+40',
    statBonus: { stat: 'life', amount: 40 },
    infiniteLevel: true
  },
  {
    id: 'omen_bedroher',
    name: 'Bedroher',
    class: 'Omen',
    type: 'passive',
    description: 'Vorteil auf Bedrohung',
    enlightened: true
  },
  {
    id: 'omen_finstere_aura',
    name: 'Finstere Aura',
    class: 'Omen',
    type: 'passive',
    description: 'Gegner, die ihm Schaden zuf�gen, werden mit geringer Wahrscheinlichkeit ver�ngstigt.',
    enlightened: true
  },
  {
    id: 'omen_vorwarnung',
    name: 'Vorwarnung',
    class: 'Omen',
    type: 'active',
    description: 'Kann eine bereits bekannte Person verfluchen, nach einem Tag wird diese Person von Pech verfolgt. Dieser Effekt wird st�rker, je n�her der Nutzer zum verfluchten Ziel ist. Kostet 1/4 der gegn. HP',
    actionType: 'Aktion'
  },
  {
    id: 'omen_kraftraub',
    name: 'Kraftraub',
    class: 'Omen',
    type: 'active',
    description: 'Stiehlt die Ausdauer (D20) einer anderen Person in unmittelbarer N�he und regeneriert den selben Betrag beim Nutzer',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'omen_schlachtschwur',
    name: 'Schlachtschwur',
    class: 'Omen',
    type: 'active',
    description: 'Solange die F�higkeit aktiv ist, wird der Schaden gegen den Anwender gespeichert. Wenn er einen Gegner t�tet, wird der gespeicherte Schaden wieder geheilt',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'omen_unheilvoller_auftritt',
    name: 'Unheilvoller Auftritt',
    class: 'Omen',
    type: 'active',
    description: 'Bereitet f�r 3 Runden ein finsteres Ritual an einem Ort in seinem Sichtfeld vor, w�hrend denen der Nutzer nichts anderes tun kann. Danach h�llt er diesen Ort in Finsternis und fliegt in sein Zentrum. Alle Gegner im Umkreis werden entweder gel�hmt, ver�ngstigt, oder verstummt',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'omen_fluchruestung',
    name: 'Fluchr�stung',
    class: 'Omen',
    type: 'active',
    description: 'Absorbiert alle negativen Effekte aller Personen im Umkreis. Erh�lt R�stung mit Stabilit�t abh�ngig von der Anzahl und St�rke der absorbierten Effekte f�r 3 Runden',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== KRIEGSHERR ====================
  {
    id: 'kriegsherr_staerke_4',
    name: 'St�rke+4',
    class: 'Kriegsherr',
    type: 'stat_bonus',
    description: 'St�rke+4',
    statBonus: { stat: 'strength', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'kriegsherr_blutrausch',
    name: 'Blutrausch',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Erhalte eine Extra-Aktion, wenn du diese Runde einen Gegner t�test'
  },
  {
    id: 'kriegsherr_wutbewaeltigung',
    name: 'Wutbew�ltigung',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Negative Effekte von Rage werden aufgehoben',
    enlightened: true
  },
  {
    id: 'kriegsherr_vorreiter',
    name: 'Vorreiter',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Wenn du den ersten Treffer austeilst oder einsteckst, erhalten alle Verb�ndeten eine Extra-Aktion f�r ihren n�chsten Zug'
  },
  {
    id: 'kriegsherr_lebensmuede',
    name: 'Lebensm�de',
    class: 'Kriegsherr',
    type: 'active',
    description: '-3 auf Nahkampfangriffe, +2 gegen Angriffe',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'kriegsherr_todeswirbel',
    name: 'Todeswirbel',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Greife jeden Gegner um dich herum an, -1 f�r jeden Gegner in Reichweite',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'kriegsherr_masochist',
    name: 'Masochist',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Setzt Leben auf 1, erhalte eine Aktion und eine Bonusaktion pro 30 geopferten Leben',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'kriegsherr_maechtiger_stoss',
    name: 'M�chtiger Sto�',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Gegner, die von Nahkampfangriffen getroffen werden, fliegen bis zu 20m weg',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Keine Aktion'
  },

  // ==================== DUELLANT ====================
  {
    id: 'duellant_geschicklichkeit_4',
    name: 'Geschicklichkeit+4',
    class: 'Duellant',
    type: 'stat_bonus',
    description: 'Geschicklichkeit+4',
    statBonus: { stat: 'dexterity', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'duellant_duell',
    name: 'Duell',
    class: 'Duellant',
    type: 'passive',
    description: '-2 in einem Duell'
  },
  {
    id: 'duellant_perfektion',
    name: 'Perfektion',
    class: 'Duellant',
    type: 'passive',
    description: 'Wenn Leben voll, -2 im Kampf'
  },
  {
    id: 'duellant_furie',
    name: 'Furie',
    class: 'Duellant',
    type: 'passive',
    description: '-1 auf diesen Gegner mit jedem kontinuierlichen Treffer, maximal -5',
    enlightened: true
  },
  {
    id: 'duellant_uebertakten',
    name: '�bertakten',
    class: 'Duellant',
    type: 'active',
    description: 'Greift Gegner an, kann nach einem Treffer eine Extra-Aktion ausf�hren. (+15 mit jeder weiteren Benutzung in dieser Runde)',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'duellant_konter',
    name: 'Konter',
    class: 'Duellant',
    type: 'active',
    description: 'Blockt und reflektiert physischen Angriff mit doppelter St�rke',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Reaktion'
  },
  {
    id: 'duellant_schwachstellen_aufdecken',
    name: 'Schwachstellen aufdecken',
    class: 'Duellant',
    type: 'active',
    description: 'Kann R�stung mit n�chstem Angriff ignorieren',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Bonusaktion'
  },

  // ==================== WAFFENMEISTER ====================
  {
    id: 'waffenmeister_geschicklichkeit_staerke_2',
    name: 'Geschicklichkeit&St�rke+2',
    class: 'Waffenmeister',
    type: 'stat_bonus',
    description: 'Geschicklichkeit&St�rke+2',
    statBonuses: [{ stat: 'dexterity', amount: 2 }, { stat: 'strength', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'waffenmeister_waffenmeister',
    name: '+Waffenmeister',
    class: 'Waffenmeister',
    type: 'passive',
    description: 'Waffenvorraussetzungen werden aufgehoben, ben�tigt "Waffenwissen","Waffenkenner" und "Waffengelehter"',
    enlightened: true,
    requiresSkill: ['schutze_waffenwissen', 'erzritter_waffenkenner', 'klingentaenzer_waffengelehrter']
  },
  {
    id: 'waffenmeister_wandelndes_arsenal',
    name: 'Wandelndes Arsenal',
    class: 'Waffenmeister',
    type: 'passive',
    description: '-2 auf jeden Angriff nach Waffenwechsel',
    enlightened: true
  },
  {
    id: 'waffenmeister_waffenschmied',
    name: 'Waffenschmied',
    class: 'Waffenmeister',
    type: 'passive',
    description: 'Verdreifacht erw�rfelte Schmiedepunkte beim Schmieden von Waffen'
  },
  {
    id: 'waffenmeister_ultimativer_stoss',
    name: 'Ultimativer Sto�',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Getroffener Gegner wird zur�ckgeworfen, maximal 200m, nur f�r Wuchtwaffen',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'waffenmeister_sturmschnitt',
    name: 'Sturmschnitt',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Erzeugt Schockwelle, die getroffenen Gegnern Schnittwunden zuf�gt, maximal 50m, nur f�r Schnittwaffen',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'waffenmeister_panzerbrecher',
    name: 'Panzerbrecher',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Stich, der gegnerische Verteidigung durchbricht, nur f�r Stichwaffen',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },

  // ==================== ATTENT�TER ====================
  {
    id: 'attentaeter_geschicklichkeit_geschwindigkeit_2',
    name: 'Geschicklichkeit&Geschwindigkeit+2',
    class: 'Attent�ter',
    type: 'stat_bonus',
    description: 'Geschicklichkeit&Geschwindigkeit+2',
    statBonuses: [{ stat: 'dexterity', amount: 2 }, { stat: 'speed', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'attentaeter_reichweite_50',
    name: 'Reichweite+50m',
    class: 'Attent�ter',
    type: 'stat_bonus',
    description: 'Reichweite+50m f�r Fernkampfwaffen'
  },
  {
    id: 'attentaeter_schattenlaeufer',
    name: 'Schattenl�ufer',
    class: 'Attent�ter',
    type: 'passive',
    description: 'Kann "Schleichen" ohne Ausdauerkosten benutzen',
    enlightened: true,
    requiresSkill: 'dieb_schleichen'
  },
  {
    id: 'attentaeter_verstuemmeln',
    name: 'Verst�mmeln',
    class: 'Attent�ter',
    type: 'passive',
    description: 'Wird ein Kampf mit einem �berraschungsangriff gestartet, erh�lt das Ziel des Angriffs +1 auf alle Aktionen bis zum Ende des Kampfes'
  },
  {
    id: 'attentaeter_erfrischender_mord',
    name: 'Erfrischender Mord',
    class: 'Attent�ter',
    type: 'passive',
    description: 'Stellt 3 D20 Ausdauer her, wenn Gegner get�tet wird'
  },
  {
    id: 'attentaeter_ueberwachung',
    name: '�berwachung',
    class: 'Attent�ter',
    type: 'active',
    description: 'Kann bei K�rperkontakt andere Person markieren. Der Anwender kann die Markierung orten, solange sie aktiv ist. Die Markierung kann leicht zerst�rt werden',
    cost: { type: 'energy', amount: 5, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'attentaeter_blitzschritt',
    name: 'Blitzschritt',
    class: 'Attent�ter',
    type: 'active',
    description: 'Verdoppelt Bewegung',
    cost: { type: 'energy', amount: 45, perRound: true },
    actionType: 'Keine Aktion'
  },
  {
    id: 'attentaeter_tragisches_schicksal',
    name: 'Tragisches Schicksal',
    class: 'Attent�ter',
    type: 'active',
    description: 'Markiere vor dem Kampf einen Gegner in Sichtweite. +5 auf ersten Angriff gegen ihn als einzelnes Ziel',
    cost: { type: 'energy', amount: 50 },
    actionType: 'Aktion'
  },

  // ==================== T�FTLER ====================
  {
    id: 'tueftler_intelligenz_geschicklichkeit_2',
    name: 'Intelligenz+Geschicklichkeit+2',
    class: 'T�ftler',
    type: 'stat_bonus',
    description: 'Intelligenz+Geschicklichkeit+2',
    statBonuses: [{ stat: 'intelligence', amount: 2 }, { stat: 'dexterity', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'tueftler_mechaniker',
    name: 'Mechaniker',
    class: 'T�ftler',
    type: 'passive',
    description: '-3 auf Bauen & Verst�ndnis von Mechanik',
    enlightened: true
  },
  {
    id: 'tueftler_kalibrierte_geschosse',
    name: 'Kalibrierte Geschosse',
    class: 'T�ftler',
    type: 'passive',
    description: 'Verdoppelt Effizienz von selbst hergestellter Munition, inklusive Zauber'
  },
  {
    id: 'tueftler_runenchirurg',
    name: 'Runenchirurg',
    class: 'T�ftler',
    type: 'passive',
    description: 'Verkleinerte Zauber verlieren nur halb so viel Effizienz'
  },
  {
    id: 'tueftler_raffiniert',
    name: 'Raffiniert',
    class: 'T�ftler',
    type: 'passive',
    description: 'Vorteil auf Zerst�rungswurf von eigener Ausr�stung und Zauber und setzt Haltbarkeit nach K�mpfen auf 100 (Ausr�stung) und 10 (Zauber) zur�ck, wenn es im Kampf unter diesen Wert gefallen ist',
    enlightened: true
  },
  {
    id: 'tueftler_zweiter_atem',
    name: 'Zweiter Atem',
    class: 'T�ftler',
    type: 'active',
    description: 'Erh�lt eine zus�tzliche Bonusaktion f�r diese Runde. (+15 mit jeder weiteren Benutzung in dieser Runde)',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Keine Aktion'
  },
  {
    id: 'tueftler_zauberschmiede',
    name: 'Zauberschmiede',
    class: 'T�ftler',
    type: 'active',
    description: 'Verarbeite Materialien in eine gew�nschte Form',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== MANAF�RST ====================
  {
    id: 'manafuerst_mana_40',
    name: 'Mana+40',
    class: 'Manaf�rst',
    type: 'stat_bonus',
    description: 'Mana+40',
    statBonus: { stat: 'mana', amount: 40 },
    infiniteLevel: true
  },
  {
    id: 'manafuerst_zauberradius_5',
    name: 'Zauberradius+5m',
    class: 'Manaf�rst',
    type: 'stat_bonus',
    description: 'Zauberradius+5m',
    enlightened: true,
    statBonus: { stat: 'spellRadius', amount: 5 }
  },
  {
    id: 'manafuerst_runenschmied',
    name: 'Runenschmied',
    class: 'Manaf�rst',
    type: 'passive',
    description: 'Verwende einen Talentpunkt, um die Effizienz einer Rune in deinem Besitz dauerhaft um 1 D10 zu erh�hen',
    enlightened: true
  },
  {
    id: 'manafuerst_energiewandler',
    name: 'Energiewandler',
    class: 'Manaf�rst',
    type: 'passive',
    description: '10% der verwendeten Mana werden in latente Energie umgewandelt, die entweder zu Leben, Ausdauer oder Mana f�r einen Verb�ndeten konvertiert werden kann',
    enlightened: true
  },
  {
    id: 'manafuerst_arkaner_speicher',
    name: 'Arkaner Speicher',
    class: 'Manaf�rst',
    type: 'passive',
    description: 'Kann einen Zaubercast speichern, um ihn sp�ter zu benutzen, solange das Medium f�r die Benutzung in der N�he ist'
  },
  {
    id: 'manafuerst_magieherrschaft',
    name: 'Magieherrschaft',
    class: 'Manaf�rst',
    type: 'passive',
    description: 'Gegner im Zauberradius erhalten den Malus f�r Zauber zus�tzlich auf ihre F�higkeiten'
  },
  {
    id: 'manafuerst_zauberautoritaet',
    name: '+Zauberauthorit�t',
    class: 'Manaf�rst',
    type: 'active',
    description: 'Erweitert "Zauberbrecher", sodass schwache Zauber absorbiert werden und deine Mana um die H�lfte der Manakosten aufgef�llt wird. Halbiert zus�tzlich Ausdauerkosten',
    requiresSkill: 'arkanist_zauberbrecher',
    actionType: 'Aktion'
  },
  {
    id: 'manafuerst_herrschaftsgebiet',
    name: 'Herrschaftsgebiet',
    class: 'Manaf�rst',
    type: 'active',
    description: 'Verdreifacht Zauberradius',
    cost: { type: 'energy', amount: 30, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== NEKROMANT ====================
  {
    id: 'nekromant_fokus_5',
    name: 'Fokus+5',
    class: 'Nekromant',
    type: 'stat_bonus',
    description: 'Fokus+5',
    statBonus: { stat: 'focus', amount: 5 },
    infiniteLevel: true
  },
  {
    id: 'nekromant_totenbeschworer',
    name: 'Totenbeschw�rer',
    class: 'Nekromant',
    type: 'passive',
    description: 'Tote Gegner hinterlassen Seelenrunen, die einmalig beschworen werden k�nnen. F�higkeiten, Zauber und 50% der Leben, Ausdauer und Mana der Seele entsprechen denen des Opfers'
  },
  {
    id: 'nekromant_seelenverbindung',
    name: 'Seelenverbindung',
    class: 'Nekromant',
    type: 'passive',
    description: 'Kann beschworene Kreaturen in 50m Radius als Startpunkt f�r Zauber benutzen, kann �ber mehrere beschworene Kreaturen verkettet werden, um Reichweite zu erh�hen',
    enlightened: true
  },
  {
    id: 'nekromant_seelenfusion',
    name: 'Seelenfusion',
    class: 'Nekromant',
    type: 'passive',
    description: 'Entfernt Nachteil und -5 bei Infusion einer Seele in einen lebendigen K�rper.'
  },
  {
    id: 'nekromant_gestohlene_macht',
    name: 'Gestohlene Macht',
    class: 'Nekromant',
    type: 'passive',
    description: 'Solange eine Leiche beschworen ist, wird die H�lfte ihres Fokus dem Anwender gutgeschrieben (kann maximal den Fokuskosten der Seelenrune entsprechen)'
  },
  {
    id: 'nekromant_unheiliges_ritual',
    name: 'Unheiliges Ritual',
    class: 'Nekromant',
    type: 'active',
    description: 'Zerst�re Seelenrune f�r Mana, kann Rune danach nicht mehr benutzen. Stellt Mana in H�he der Effizienz der Rune her',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'nekromant_maertyrer',
    name: 'M�rtyrer',
    class: 'Nekromant',
    type: 'active',
    description: 'Solange die F�higkeit aktiv ist, werden Verletzungen auf beschworene Leichenseelen in bis zu 10m Entfernung transferiert',
    cost: { type: 'energy', amount: 30, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== ORAKEL ====================
  {
    id: 'orakel_intelligenz_4',
    name: 'Intelligenz+4',
    class: 'Orakel',
    type: 'stat_bonus',
    description: 'Intelligenz+4',
    statBonus: { stat: 'intelligence', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'orakel_adaptiver_geist',
    name: 'Adaptiver Geist',
    class: 'Orakel',
    type: 'passive',
    description: 'Kann F�higkeiten mit Mana anstatt Ausdauer ausl�sen, kostet 20% mehr',
    enlightened: true
  },
  {
    id: 'orakel_ueberreaktion',
    name: '�berreaktion',
    class: 'Orakel',
    type: 'passive',
    description: '-2 bei Reaktionen',
    enlightened: true
  },
  {
    id: 'orakel_vorschuss',
    name: 'Vorschuss',
    class: 'Orakel',
    type: 'passive',
    description: 'Kann Zauber mit Castzeit sofort ausf�hren, muss den Cast aber nach Abschluss des Zaubers abarbeiten und kann bis dahin keine weiteren Zauber verwenden'
  },
  {
    id: 'orakel_identifizieren',
    name: 'Identifizieren',
    class: 'Orakel',
    type: 'passive',
    description: 'Kann alle Stats von Items sofort erkennen und erh�lt manchmal Visionen aus deren Vergangenheit',
    enlightened: true
  },
  {
    id: 'orakel_glueckstraehne',
    name: 'Gl�cksstr�hne',
    class: 'Orakel',
    type: 'active',
    description: 'W�hle eine Zahl zwischen 1 und 20. Wenn du im Verlauf diesen Kampfes diese Zahl w�rfelst(ohne Boni), erhalte Vorteil f�r die n�chsten Runden, abh�ngig davon wie viel du gesetzt hast',
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'orakel_schicksal',
    name: 'Schicksal',
    class: 'Orakel',
    type: 'active',
    description: 'Kann ein W�rfelergebnis f�r Verb�ndete zur�cksetzen und neu w�rfeln lassen oder das eigene W�rfelergebnis zur�cksetzen und den Zug neu starten',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'orakel_prophezeiung',
    name: 'Prophezeiung',
    class: 'Orakel',
    type: 'active',
    description: 'Sieh einen zuf�lligen Moment in bis zu einem Tag in der Zukunft. Nur einmal pro Tag',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== DUNKLER RITTER ====================
  {
    id: 'dunkler_ritter_staerke_intelligenz_2',
    name: 'St�rke&Intelligenz+2',
    class: 'Dunkler Ritter',
    type: 'stat_bonus',
    description: 'St�rke&Intelligenz+2',
    statBonuses: [{ stat: 'strength', amount: 2 }, { stat: 'intelligence', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'dunkler_ritter_absolute_dunkelheit',
    name: 'Absolute Dunkelheit',
    class: 'Dunkler Ritter',
    type: 'passive',
    description: 'Halbiert Manakosten von Schattenrunen',
    enlightened: true
  },
  {
    id: 'dunkler_ritter_nachtaktiv',
    name: 'Nachtaktiv',
    class: 'Dunkler Ritter',
    type: 'passive',
    description: '-2, wenn es dunkel ist',
    enlightened: true
  },
  {
    id: 'dunkler_ritter_arkane_ausstattung',
    name: 'Arkane Ausstattung',
    class: 'Dunkler Ritter',
    type: 'passive',
    description: 'Effizienz x2 auf Zauber, die �ber Ausr�stung oder Waffen als Medium genutzt werden'
  },
  {
    id: 'dunkler_ritter_schattenruestung',
    name: 'Schattenr�stung',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Alle Geschwindgkeitsmali von R�stungen werden aufgehoben, addiert die H�lfte des Geschwindigkeitsmalus auf den Geschwindigkeitswert',
    cost: { type: 'energy', amount: 15, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'dunkler_ritter_dunkler_schnitt',
    name: 'Dunkler Schnitt',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Schnitt, der fast alle Waffen und R�stungen ignoriert, verbraucht 50 Waffenhaltbarkeit',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'dunkler_ritter_tiefer_fokus',
    name: 'Tiefer Fokus',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Verdoppelt Fokus',
    cost: { type: 'life', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
];

// Helper to get skills for a specific class
export function getSkillsForClass(className: string): SkillDefinition[];
export function getSkillsForClass(skills: SkillDefinition[], className: string): SkillDefinition[];
export function getSkillsForClass(skillsOrClassName: SkillDefinition[] | string, className?: string): SkillDefinition[] {
  if (typeof skillsOrClassName === 'string') {
    return SKILL_DEFINITIONS.filter(s => s.class === skillsOrClassName);
  }
  return skillsOrClassName.filter(s => s.class === className);
}

// Helper to get a skill by its ID
export function getSkillById(skillId: string): SkillDefinition | undefined {
  return SKILL_DEFINITIONS.find(s => s.id === skillId);
}

// Helper to check if a skill is learned
export function isSkillLearned(learnedIds: string[], skillId: string): boolean {
  return learnedIds.includes(skillId);
}