const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/app/data/skill-definitions.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Keep the part up to and including the opening of SKILL_DEFINITIONS
const keepStart = content.substring(0, content.indexOf('export const SKILL_DEFINITIONS: SkillDefinition[] = [') + 'export const SKILL_DEFINITIONS: SkillDefinition[] = ['.length);

// Keep the helper functions at the end
const helperStart = content.indexOf('\n// Get all unique class names');
const keepEnd = content.substring(helperStart);

const newSkillDefinitions = `
  // ==================== MAGIER ====================
  {
    id: 'magier_intelligenz_1',
    name: 'Intelligenz+1',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+1 Intelligenz',
    statBonus: { stat: 'intelligence', amount: 1 }
  },
  {
    id: 'magier_mana_10',
    name: 'Mana+10',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+10 Mana',
    statBonus: { stat: 'mana', amount: 10 }
  },
  {
    id: 'magier_fokus_1',
    name: 'Fokus+1',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+1 Fokus',
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
    description: '+2 Effektivität auf Zauber'
  },

  // ==================== KÄMPFER ====================
  {
    id: 'kaempfer_staerke_1',
    name: 'Stärke+1',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: '+1 Stärke',
    statBonus: { stat: 'strength', amount: 1 }
  },
  {
    id: 'kaempfer_konstitution_1',
    name: 'Konstitution+1',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: '+1 Konstitution',
    statBonus: { stat: 'constitution', amount: 1 }
  },
  {
    id: 'kaempfer_schwere_waffen_werfen',
    name: 'Schwere Waffen werfen+1',
    class: 'Kämpfer',
    type: 'dice_bonus',
    description: '+1 auf Würfe mit schweren Waffen'
  },
  {
    id: 'kaempfer_backpacker',
    name: 'Backpacker',
    class: 'Kämpfer',
    type: 'passive',
    description: '+30 Inventarkapazität'
  },
  {
    id: 'kaempfer_fester_stand',
    name: 'Fester Stand',
    class: 'Kämpfer',
    type: 'passive',
    description: '-1 gegen Rückstoß'
  },

  // ==================== TECHNIKER ====================
  {
    id: 'techniker_geschicklichkeit_1',
    name: 'Geschicklichkeit+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+1 Geschicklichkeit',
    statBonus: { stat: 'dexterity', amount: 1 }
  },
  {
    id: 'techniker_geschwindigkeit_1',
    name: 'Geschwindigkeit+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+1 Geschwindigkeit',
    statBonus: { stat: 'speed', amount: 1 }
  },
  {
    id: 'techniker_ausdauer_15',
    name: 'Ausdauer+15',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+15 Ausdauer',
    statBonus: { stat: 'energy', amount: 15 }
  },
  {
    id: 'techniker_springen',
    name: 'Springen-2',
    class: 'Techniker',
    type: 'dice_bonus',
    description: '-2 auf Sprung-Würfe (Vorteil)'
  },
  {
    id: 'techniker_leichte_waffen_werfen',
    name: 'Leichte Waffen werfen-1',
    class: 'Techniker',
    type: 'dice_bonus',
    description: '-1 auf Würfe mit leichten Waffen (Vorteil)'
  },

  // ==================== KRIEGER ====================
  {
    id: 'krieger_konstitution_2',
    name: 'Konstitution+2',
    class: 'Krieger',
    type: 'stat_bonus',
    description: '+2 Konstitution',
    statBonus: { stat: 'constitution', amount: 2 }
  },
  {
    id: 'krieger_statusresistenz',
    name: 'Statusresistenz',
    class: 'Krieger',
    type: 'passive',
    description: 'Schaden von negativen Statuseffekten wird halbiert',
    enlightened: true
  },
  {
    id: 'krieger_harter_bursche',
    name: 'Harter Bursche',
    class: 'Krieger',
    type: 'passive',
    description: '+1 auf Würfe, um aus der Bewusstlosigkeit aufzustehen'
  },
  {
    id: 'krieger_aetherkraft',
    name: 'Ätherkraft',
    class: 'Krieger',
    type: 'passive',
    description: 'Kann erlittenen Schaden halbieren und den Betrag als Mana regenerieren'
  },
  {
    id: 'krieger_schwerer_schlag',
    name: 'Schwerer Schlag',
    class: 'Krieger',
    type: 'active',
    description: 'Führt einen besonders schweren Schlag aus, der den Gegner zurückschleudert',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'krieger_defensive_haltung',
    name: 'Defensive Haltung',
    class: 'Krieger',
    type: 'active',
    description: 'Nimmt eine defensive Haltung ein, die eingehenden Schaden reduziert',
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== BARBAR ====================
  {
    id: 'barbar_staerke_2',
    name: 'Stärke+2',
    class: 'Barbar',
    type: 'stat_bonus',
    description: '+2 Stärke',
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'barbar_ruecksichtslos',
    name: 'Rücksichtslos',
    class: 'Barbar',
    type: 'passive',
    description: '+4 Stärke, solange Rüstungsmalus unter 5 liegt'
  },
  {
    id: 'barbar_blutlust',
    name: 'Blutlust',
    class: 'Barbar',
    type: 'passive',
    description: '-1 auf Angriffe pro getötetem Gegner (max. -3)'
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
    description: 'Schleudert eine Waffe mit enormer Kraft über weite Distanzen',
    enlightened: true,
    cost: { type: 'energy', amount: 25 },
    actionType: 'Aktion'
  },
  {
    id: 'barbar_kampfschrei',
    name: 'Kampfschrei',
    class: 'Barbar',
    type: 'active',
    description: 'Stößt einen Kampfschrei aus, der Verbündete stärkt und Gegner einschüchtert',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== DIEB ====================
  {
    id: 'dieb_geschwindigkeit_2',
    name: 'Geschwindigkeit+2',
    class: 'Dieb',
    type: 'stat_bonus',
    description: '+2 Geschwindigkeit',
    statBonus: { stat: 'speed', amount: 2 }
  },
  {
    id: 'dieb_stehlen',
    name: 'Stehlen-2',
    class: 'Dieb',
    type: 'dice_bonus',
    description: '-2 auf Stehlen-Würfe (Vorteil)'
  },
  {
    id: 'dieb_fliehen',
    name: 'Fliehen-2',
    class: 'Dieb',
    type: 'dice_bonus',
    description: '-2 auf Fliehen-Würfe (Vorteil)'
  },
  {
    id: 'dieb_schloesser_knacken',
    name: 'Schlösser knacken-2',
    class: 'Dieb',
    type: 'dice_bonus',
    description: '-2 auf Schlösser-knacken-Würfe (Vorteil)'
  },
  {
    id: 'dieb_feinmotoriker',
    name: 'Feinmotoriker',
    class: 'Dieb',
    type: 'passive',
    description: '-1 auf Angriffe mit leichten Waffen (Vorteil)',
    enlightened: true
  },
  {
    id: 'dieb_leichtfuessigkeit',
    name: 'Leichtfüßigkeit',
    class: 'Dieb',
    type: 'passive',
    description: '+2 Bewegung, solange Rüstungsmalus unter 5 liegt',
    enlightened: true
  },
  {
    id: 'dieb_auge_der_gier',
    name: 'Auge der Gier',
    class: 'Dieb',
    type: 'dice_bonus',
    description: '-2 auf Wert-abschätzen-Würfe (Vorteil)',
    enlightened: true
  },
  {
    id: 'dieb_schleichen',
    name: 'Schleichen',
    class: 'Dieb',
    type: 'active',
    description: 'Bewegt sich lautlos und unsichtbar für die Dauer der Fähigkeit',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== SCHÜTZE ====================
  {
    id: 'schutze_geschicklichkeit_2',
    name: 'Geschicklichkeit+2',
    class: 'Schütze',
    type: 'stat_bonus',
    description: '+2 Geschicklichkeit',
    statBonus: { stat: 'dexterity', amount: 2 }
  },
  {
    id: 'schutze_reichweite_10',
    name: 'Reichweite+10m',
    class: 'Schütze',
    type: 'stat_bonus',
    description: '+10m Reichweite',
    statBonus: { stat: 'spellRadius', amount: 10 }
  },
  {
    id: 'schutze_waffenwissen',
    name: 'Waffenwissen',
    class: 'Schütze',
    type: 'passive',
    description: '-4 auf Voraussetzungen für Fernkampfwaffen',
    enlightened: true
  },
  {
    id: 'schutze_adlerauge',
    name: 'Adlerauge',
    class: 'Schütze',
    type: 'passive',
    description: '-1 auf Fernkampf-Würfe (Vorteil)'
  },
  {
    id: 'schutze_geschaerfte_sinne',
    name: 'Geschärfte Sinne',
    class: 'Schütze',
    type: 'passive',
    description: '-2 auf Wahrnehmungs-Würfe außerhalb des Kampfes (Vorteil)',
    enlightened: true
  },
  {
    id: 'schutze_aetherfeuer',
    name: 'Ätherfeuer',
    class: 'Schütze',
    type: 'active',
    description: 'Schießt einen Pfeil aus reiner Ätherkraft, der magischen Schaden verursacht',
    cost: { type: 'mana', amount: 20 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'schutze_zielschuss',
    name: 'Zielschuss',
    class: 'Schütze',
    type: 'active',
    description: 'Zielt sorgfältig auf eine Schwachstelle des Gegners und führt einen präzisen Schuss aus',
    cost: { type: 'energy', amount: 25 },
    actionType: 'Aktion'
  },

  // ==================== KAMPFZAUBERER ====================
  {
    id: 'kampfzauberer_intelligenz_2',
    name: 'Intelligenz+2',
    class: 'Kampfzauberer',
    type: 'stat_bonus',
    description: '+2 Intelligenz',
    statBonus: { stat: 'intelligence', amount: 2 }
  },
  {
    id: 'kampfzauberer_runenlehre',
    name: 'Runenlehre',
    class: 'Kampfzauberer',
    type: 'dice_bonus',
    description: '-3 auf Runen-Analyse-Würfe (Vorteil)'
  },
  {
    id: 'kampfzauberer_zauberladung',
    name: 'Zauberladung',
    class: 'Kampfzauberer',
    type: 'dice_bonus',
    description: '+2 Zaubercasts pro Runde'
  },
  {
    id: 'kampfzauberer_verinnerlichen',
    name: 'Verinnerlichen',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Kann Zauber auswendig lernen und ohne Runenstein wirken',
    enlightened: true
  },
  {
    id: 'kampfzauberer_freies_wirken',
    name: 'Freies Wirken',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Kann sich während des Zauberwirkens bewegen'
  },
  {
    id: 'kampfzauberer_manatransfer',
    name: 'Manatransfer',
    class: 'Kampfzauberer',
    type: 'active',
    description: 'Konvertiert Ausdauer in Mana',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'kampfzauberer_manadisruption',
    name: 'Manadisruption',
    class: 'Kampfzauberer',
    type: 'active',
    description: 'Stört die Manastruktur eines Gegners und unterbricht dessen Zauberwirkung',
    enlightened: true,
    cost: { type: 'mana', amount: 5 },
    actionType: 'Bonusaktion'
  },

  // ==================== HEILER ====================
  {
    id: 'heiler_mana_20',
    name: 'Mana+20',
    class: 'Heiler',
    type: 'stat_bonus',
    description: '+20 Mana',
    statBonus: { stat: 'mana', amount: 20 }
  },
  {
    id: 'heiler_gesundheitscheck',
    name: 'Gesundheitscheck',
    class: 'Heiler',
    type: 'dice_bonus',
    description: '-4 auf Gesundheitsuntersuchungs-Würfe (Vorteil)'
  },
  {
    id: 'heiler_notarzt',
    name: 'Notarzt',
    class: 'Heiler',
    type: 'dice_bonus',
    description: '-3 auf Heilwürfe bei kritisch verletzten Personen (Vorteil)',
    enlightened: true
  },
  {
    id: 'heiler_alchemist',
    name: 'Alchemist',
    class: 'Heiler',
    type: 'dice_bonus',
    description: '-2 auf Würfe zum Brauen positiver Tränke (Vorteil)',
    enlightened: true
  },
  {
    id: 'heiler_regenbogen',
    name: 'Regenbogen',
    class: 'Heiler',
    type: 'passive',
    description: '-20% Manakosten für Heilzauber'
  },
  {
    id: 'heiler_einfachheit',
    name: 'Einfachheit',
    class: 'Heiler',
    type: 'passive',
    description: '-2 auf Voraussetzungen für Heilzauber'
  },
  {
    id: 'heiler_gruppencast',
    name: 'Gruppencast',
    class: 'Heiler',
    type: 'active',
    description: 'Wirkt einen Zauber gleichzeitig auf mehrere Verbündete',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== RITTER ====================
  {
    id: 'ritter_leben_30',
    name: 'Leben+30',
    class: 'Ritter',
    type: 'stat_bonus',
    description: '+30 Leben',
    statBonus: { stat: 'life', amount: 30 }
  },
  {
    id: 'ritter_reiten',
    name: 'Reiten-2',
    class: 'Ritter',
    type: 'dice_bonus',
    description: '-2 auf Reiten-Würfe (Vorteil)'
  },
  {
    id: 'ritter_parieren',
    name: 'Parieren-1',
    class: 'Ritter',
    type: 'dice_bonus',
    description: '-1 auf Parieren-Würfe (Vorteil)'
  },
  {
    id: 'ritter_ruestungsnegation_5',
    name: 'Rüstungsnegation+5',
    class: 'Ritter',
    type: 'stat_bonus',
    description: '+5 Rüstungsnegation',
    statBonus: { stat: 'constitution', amount: 5 }
  },
  {
    id: 'ritter_tierfreund',
    name: 'Tierfreund',
    class: 'Ritter',
    type: 'dice_bonus',
    description: '-2 auf Würfe mit Tieren (Vorteil)',
    enlightened: true
  },
  {
    id: 'ritter_ritterschwur',
    name: 'Ritterschwur',
    class: 'Ritter',
    type: 'dice_bonus',
    description: '-2 auf Reaktionswürfe für Verbündete (Vorteil)',
    enlightened: true
  },
  {
    id: 'ritter_schwere_ruestung',
    name: 'Schwere Rüstung',
    class: 'Ritter',
    type: 'active',
    description: 'Aktiviert schwere Rüstungsmodifikationen für erhöhten Schutz',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'ritter_schildstoss',
    name: 'Schildstoß',
    class: 'Ritter',
    type: 'active',
    description: 'Rammt den Schild in einen Gegner, um diesen zurückzustoßen',
    enlightened: true,
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },
  {
    id: 'ritter_reitstoss',
    name: 'Reitstoß',
    class: 'Ritter',
    type: 'active',
    description: 'Führt einen Angriff aus dem Sattel aus, der enormen Schaden verursacht',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== MÖNCH ====================
  {
    id: 'moench_konstitution_3',
    name: 'Konstitution+3',
    class: 'Mönch',
    type: 'stat_bonus',
    description: '+3 Konstitution',
    statBonus: { stat: 'constitution', amount: 3 }
  },
  {
    id: 'moench_goettlicher_segen',
    name: 'Göttlicher Segen',
    class: 'Mönch',
    type: 'passive',
    description: 'Resistent gegen Pecheffekte'
  },
  {
    id: 'moench_fokussierte_schlaege',
    name: 'Fokussierte Schläge',
    class: 'Mönch',
    type: 'dice_bonus',
    description: '-3 auf Angriffswürfe gegen Gegenstände (Vorteil)'
  },
  {
    id: 'moench_waffenloser_kampf',
    name: 'Waffenloser Kampf',
    class: 'Mönch',
    type: 'dice_bonus',
    description: '-2 auf Angriffswürfe ohne Waffe (Vorteil)'
  },
  {
    id: 'moench_hartes_training',
    name: 'Hartes Training',
    class: 'Mönch',
    type: 'passive',
    description: '+4 Geschicklichkeit, solange Rüstungsmalus unter 5 liegt',
    enlightened: true
  },
  {
    id: 'moench_chakra_blockade',
    name: 'Chakra-Blockade',
    class: 'Mönch',
    type: 'active',
    description: 'Blockiert den Chakra-Fluss eines Gegners und lähmt ihn teilweise',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'moench_meditation',
    name: 'Meditation',
    class: 'Mönch',
    type: 'active',
    description: 'Meditiert und regeneriert Mana sowie Ausdauer',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== BERSERKER ====================
  {
    id: 'berserker_staerke_2',
    name: 'Stärke+2',
    class: 'Berserker',
    type: 'stat_bonus',
    description: '+2 Stärke',
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'berserker_notfallstaerke',
    name: 'Notfallstärke',
    class: 'Berserker',
    type: 'dice_bonus',
    description: '-1 auf Würfe pro 40 fehlenden HP (max. -5)',
    enlightened: true
  },
  {
    id: 'berserker_kriegsschrei',
    name: '+Kriegsschrei',
    class: 'Berserker',
    type: 'passive',
    description: 'Erweitert Kampfschrei: Verbündete erhalten Stärke-Bonus für die Dauer des Kampfes',
    requiresSkill: 'barbar_kampfschrei'
  },
  {
    id: 'berserker_unsterblicher_krieger',
    name: 'Unsterblicher Krieger',
    class: 'Berserker',
    type: 'passive',
    description: 'Heilt 3W20 Leben, wenn ein Gegner getötet wird'
  },
  {
    id: 'berserker_adrenalin',
    name: 'Adrenalin',
    class: 'Berserker',
    type: 'passive',
    description: 'Immun gegen Statuseffekte, während Rage aktiv ist'
  },
  {
    id: 'berserker_erbarmungslosigkeit',
    name: 'Erbarmungslosigkeit',
    class: 'Berserker',
    type: 'passive',
    description: 'Rage wird nach einem Angriff nicht beendet',
    enlightened: true
  },
  {
    id: 'berserker_rage',
    name: 'Rage',
    class: 'Berserker',
    type: 'active',
    description: 'Verfällt in einen Blutrausch und erhält massive Kampfboni',
    cost: { type: 'energy', amount: 5 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'berserker_wuetender_wurf',
    name: 'Wütender Wurf',
    class: 'Berserker',
    type: 'active',
    description: 'Schleudert eine Waffe mit unkontrollierter Wut auf einen Gegner',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== PLÜNDERER ====================
  {
    id: 'pluenderer_wille_3',
    name: 'Wille+3',
    class: 'Plünderer',
    type: 'stat_bonus',
    description: '+3 Wille',
    statBonus: { stat: 'chill', amount: 3 }
  },
  {
    id: 'pluenderer_horter',
    name: 'Horter',
    class: 'Plünderer',
    type: 'passive',
    description: '+50% Inventarkapazität',
    enlightened: true
  },
  {
    id: 'pluenderer_reichtum',
    name: 'Reichtum',
    class: 'Plünderer',
    type: 'passive',
    description: '+50% gefundenes Geld'
  },
  {
    id: 'pluenderer_brandstifter',
    name: 'Brandstifter',
    class: 'Plünderer',
    type: 'passive',
    description: '-80% erlittener Feuerschaden',
    enlightened: true
  },
  {
    id: 'pluenderer_raeuberbande',
    name: 'Räuberbande',
    class: 'Plünderer',
    type: 'dice_bonus',
    description: '-1 auf Würfe, wenn in der Überzahl (Vorteil)',
    enlightened: true
  },
  {
    id: 'pluenderer_pluendern',
    name: 'Plündern',
    class: 'Plünderer',
    type: 'active',
    description: 'Plündert einen Gegner oder eine Umgebung und sammelt Beute ein',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },

  // ==================== KAMPFAKROBAT ====================
  {
    id: 'kampfakrobat_bewegung_3',
    name: 'Bewegung+3',
    class: 'Kampfakrobat',
    type: 'stat_bonus',
    description: '+3 Bewegung',
    statBonus: { stat: 'speed', amount: 3 }
  },
  {
    id: 'kampfakrobat_bonusaktion',
    name: 'Bonusaktion',
    class: 'Kampfakrobat',
    type: 'passive',
    description: '+1 Bonusaktion pro Zug'
  },
  {
    id: 'kampfakrobat_sprungangriff',
    name: 'Sprungangriff',
    class: 'Kampfakrobat',
    type: 'dice_bonus',
    description: '-2 auf Angriffswürfe aus der Luft (Vorteil)'
  },
  {
    id: 'kampfakrobat_sicherer_fall',
    name: 'Sicherer Fall',
    class: 'Kampfakrobat',
    type: 'passive',
    description: 'Landet garantiert auf instabilem Boden; -1 auf den folgenden Angriff',
    enlightened: true
  },
  {
    id: 'kampfakrobat_federfall',
    name: 'Federfall',
    class: 'Kampfakrobat',
    type: 'passive',
    description: '-75% Fallschaden',
    enlightened: true
  },
  {
    id: 'kampfakrobat_opportunist',
    name: 'Opportunist',
    class: 'Kampfakrobat',
    type: 'passive',
    description: 'Kann als Reaktion einen Gelegenheitsangriff ausführen'
  },
  {
    id: 'kampfakrobat_bonusangriff',
    name: 'Bonusangriff',
    class: 'Kampfakrobat',
    type: 'active',
    description: 'Führt einen zusätzlichen Angriff als Bonusaktion aus',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },

  // ==================== JÄGER ====================
  {
    id: 'jaeger_geschicklichkeit_3',
    name: 'Geschicklichkeit+3',
    class: 'Jäger',
    type: 'stat_bonus',
    description: '+3 Geschicklichkeit',
    statBonus: { stat: 'dexterity', amount: 3 }
  },
  {
    id: 'jaeger_klettern',
    name: 'Klettern-2',
    class: 'Jäger',
    type: 'dice_bonus',
    description: '-2 auf Klettern-Würfe (Vorteil)'
  },
  {
    id: 'jaeger_verstecken',
    name: 'Verstecken-2',
    class: 'Jäger',
    type: 'dice_bonus',
    description: '-2 auf Verstecken-Würfe (Vorteil)'
  },
  {
    id: 'jaeger_fallen_stellen',
    name: 'Fallen stellen-2',
    class: 'Jäger',
    type: 'dice_bonus',
    description: '-2 auf Fallen-stellen-Würfe (Vorteil)'
  },
  {
    id: 'jaeger_basteln',
    name: 'Basteln',
    class: 'Jäger',
    type: 'passive',
    description: 'Munitionsqualität wird um +1 Rang verbessert',
    enlightened: true
  },
  {
    id: 'jaeger_spuren_lesen',
    name: 'Spuren lesen',
    class: 'Jäger',
    type: 'passive',
    description: 'Kann Spuren und Hinweise in der Umgebung lesen',
    enlightened: true
  },
  {
    id: 'jaeger_angedrehte_schuesse',
    name: 'Angedrehte Schüsse',
    class: 'Jäger',
    type: 'passive',
    description: 'Kann Pfeile mit Effekten ausstatten, die bei Treffern eintreten'
  },

  // ==================== SCHNELLSCHÜTZE ====================
  {
    id: 'schnellschuetze_bewegung_3',
    name: 'Bewegung+3',
    class: 'Schnellschütze',
    type: 'stat_bonus',
    description: '+3 Bewegung',
    statBonus: { stat: 'speed', amount: 3 }
  },
  {
    id: 'schnellschuetze_dynamisches_schiessen',
    name: 'Dynamisches Schießen',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Kann während der Bewegung schießen ohne Malus',
    enlightened: true
  },
  {
    id: 'schnellschuetze_sofortladung',
    name: 'Sofortladung',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Kann Fernkampfwaffen ohne Nachladezeit verwenden'
  },
  {
    id: 'schnellschuetze_unberuehrt',
    name: 'Unberührt',
    class: 'Schnellschütze',
    type: 'passive',
    description: '+5 Bewegung, solange kein Schaden erlitten wurde',
    enlightened: true
  },
  {
    id: 'schnellschuetze_folgeangriff',
    name: 'Folgeangriff',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Erhält eine zusätzliche Aktion, wenn ein Gegner getötet wird'
  },
  {
    id: 'schnellschuetze_multischuss',
    name: 'Multischuss',
    class: 'Schnellschütze',
    type: 'active',
    description: 'Schießt mehrere Pfeile gleichzeitig auf ein Ziel oder mehrere Ziele',
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'schnellschuetze_runde_2',
    name: 'Runde 2',
    class: 'Schnellschütze',
    type: 'active',
    description: 'Löst eine zusätzliche Salve aus, die Gegner in einer Linie trifft',
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
    description: '+30 Mana',
    statBonus: { stat: 'mana', amount: 30 }
  },
  {
    id: 'arkanist_zauberradius_1',
    name: 'Zauberradius+1m',
    class: 'Arkanist',
    type: 'stat_bonus',
    description: '+1m Zauberradius',
    enlightened: true,
    statBonus: { stat: 'spellRadius', amount: 1 }
  },
  {
    id: 'arkanist_managespuer',
    name: 'Managespür',
    class: 'Arkanist',
    type: 'passive',
    description: 'Kann Manaquellen und Zauberwirkungen in der Umgebung wahrnehmen',
    enlightened: true
  },
  {
    id: 'arkanist_verinnerlichen',
    name: '+Verinnerlichen',
    class: 'Arkanist',
    type: 'passive',
    description: 'Erweiterte Version: Kann mehr Zauber verinnerlichen',
    enlightened: true,
    requiresSkill: 'kampfzauberer_verinnerlichen'
  },
  {
    id: 'arkanist_schmagied',
    name: 'Schmagied',
    class: 'Arkanist',
    type: 'passive',
    description: 'Kann Schilde mit arkaner Energie anstelle von Mana wirken'
  },
  {
    id: 'arkanist_zauberbrecher',
    name: 'Zauberbrecher',
    class: 'Arkanist',
    type: 'active',
    description: 'Bricht einen Zauber, wenn er in den Wirkradius eintritt',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Reaktion'
  },
  {
    id: 'arkanist_ueberladen',
    name: 'Überladen',
    class: 'Arkanist',
    type: 'active',
    description: 'Lädt einen Zauber mit überschüssiger Energie auf, um seine Wirkung zu verstärken',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== HÄMONANT ====================
  {
    id: 'haenonant_leben_30',
    name: 'Leben+30',
    class: 'Hämonant',
    type: 'stat_bonus',
    description: '+30 Leben',
    statBonus: { stat: 'life', amount: 30 }
  },
  {
    id: 'haenonant_magisches_blut',
    name: 'Magisches Blut',
    class: 'Hämonant',
    type: 'passive',
    description: 'Blut hat magische Eigenschaften und kann für Zauberwirkungen verwendet werden'
  },
  {
    id: 'haenonant_kaltbluetig',
    name: 'Kaltblütig',
    class: 'Hämonant',
    type: 'dice_bonus',
    description: '-1 auf Würfe, wenn offene Wunden vorhanden sind (Vorteil)',
    enlightened: true
  },
  {
    id: 'haenonant_transfusion',
    name: 'Transfusion',
    class: 'Hämonant',
    type: 'active',
    description: 'Überträgt Lebensenergie auf einen Verbündeten',
    cost: { type: 'energy', amount: 5 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'haenonant_blutecho',
    name: 'Blutecho',
    class: 'Hämonant',
    type: 'active',
    description: 'Sendet eine blutmagische Welle aus, die Gegner in der Nähe schädigt',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'haenonant_hypertonie',
    name: 'Hypertonie',
    class: 'Hämonant',
    type: 'active',
    description: 'Erhöht den Blutdruck drastisch, was die Angriffskraft steigert aber kontinuierlich Leben kostet',
    cost: { type: 'life', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'haenonant_aderlass',
    name: 'Aderlass',
    class: 'Hämonant',
    type: 'active',
    description: 'Öffnet die Adern eines Gegners und verursacht anhaltenden Blutungsschaden',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },

  // ==================== SEELENMAGIER ====================
  {
    id: 'seelenmagier_fokus_4',
    name: 'Fokus+4',
    class: 'Seelenmagier',
    type: 'stat_bonus',
    description: '+4 Fokus',
    statBonus: { stat: 'focus', amount: 4 }
  },
  {
    id: 'seelenmagier_runenkonvergenz',
    name: 'Runenkonvergenz',
    class: 'Seelenmagier',
    type: 'dice_bonus',
    description: '-1 auf Runen-Kombinations-Würfe (Vorteil)'
  },
  {
    id: 'seelenmagier_hausgemacht',
    name: 'Hausgemacht',
    class: 'Seelenmagier',
    type: 'passive',
    description: 'Kann eigene Runen und Zaubersteine herstellen'
  },
  {
    id: 'seelenmagier_seelenwacht',
    name: 'Seelenwacht',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Erschafft eine Seelenwache, die den Nutzer schützt und Magiequellen filtert',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'seelenmagier_erweitertes_bewusstsein',
    name: 'Erweitertes Bewusstsein',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Erweitert das Bewusstsein für mindestens 30 Minuten und ermöglicht übernatürliche Wahrnehmung',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'seelenmagier_adlerauge',
    name: 'Adlerauge',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Schärft die Sinne und ermöglicht das Wahrnehmen verborgener Details',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'seelenmagier_sanktum',
    name: 'Sanktum',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Erschafft ein magisches Schutzfeld, das Magie in seinem Inneren blockiert oder filtert',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== ERZRITTER ====================
  {
    id: 'erzritter_konstitution_4',
    name: 'Konstitution+4',
    class: 'Erzritter',
    type: 'stat_bonus',
    description: '+4 Konstitution',
    statBonus: { stat: 'constitution', amount: 4 }
  },
  {
    id: 'erzritter_waffenkenner',
    name: 'Waffenkenner',
    class: 'Erzritter',
    type: 'passive',
    description: '-8 auf Voraussetzungen für schwere Waffen',
    enlightened: true
  },
  {
    id: 'erzritter_rittmeister',
    name: 'Rittmeister',
    class: 'Erzritter',
    type: 'dice_bonus',
    description: '-2 auf Würfe mit dem Reittier (Vorteil)'
  },
  {
    id: 'erzritter_unzerbrechliche_ruestung',
    name: 'Unzerbrechliche Rüstung',
    class: 'Erzritter',
    type: 'passive',
    description: 'Rüstung kann nicht zerstört oder beschädigt werden'
  },
  {
    id: 'erzritter_ruestungsschmied',
    name: 'Rüstungsschmied',
    class: 'Erzritter',
    type: 'passive',
    description: 'Kann Rüstungen selbst herstellen und verbessern'
  },
  {
    id: 'erzritter_volle_wucht',
    name: 'Volle Wucht',
    class: 'Erzritter',
    type: 'active',
    description: 'Setzt die volle Körperkraft ein, um einen verheerenden Schlag auszuführen',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'erzritter_schwerer_panzer',
    name: '+Schwerer Panzer',
    class: 'Erzritter',
    type: 'active',
    description: 'Erweitert Schwere Rüstung mit zusätzlichem Schutz',
    requiresSkill: 'ritter_schwere_ruestung',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'erzritter_magische_ausruestung',
    name: 'Magische Ausrüstung',
    class: 'Erzritter',
    type: 'active',
    description: 'Lädt Rüstung und Waffe mit magischer Energie auf, erhöht deren Wirkung',
    cost: { type: 'mana', amount: 5 },
    actionType: 'Bonusaktion'
  },

  // ==================== TEMPLER ====================
  {
    id: 'templer_geschwindigkeit_4',
    name: 'Geschwindigkeit+4',
    class: 'Templer',
    type: 'stat_bonus',
    description: '+4 Geschwindigkeit',
    statBonus: { stat: 'speed', amount: 4 }
  },
  {
    id: 'templer_verlaengerter_arm',
    name: '+Verlängerter Arm',
    class: 'Templer',
    type: 'passive',
    description: 'Erweitert den Waffenlosen Kampf mit erhöhter Reichweite',
    requiresSkill: 'moench_waffenloser_kampf'
  },
  {
    id: 'templer_staehlerne_haut',
    name: 'Stählerne Haut',
    class: 'Templer',
    type: 'passive',
    description: '-50% Wuchtschaden',
    enlightened: true
  },
  {
    id: 'templer_mentale_ruestung',
    name: 'Mentale Rüstung',
    class: 'Templer',
    type: 'passive',
    description: 'Schützt den Geist vor mentalen Angriffen und Manipulationen',
    enlightened: true
  },
  {
    id: 'templer_chakrawissen',
    name: '+Chakrawissen',
    class: 'Templer',
    type: 'active',
    description: 'Chakra-Blockade kann für jeden Angriff ohne Kosten aktiviert werden',
    requiresSkill: 'moench_chakra_blockade',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Keine Aktion'
  },
  {
    id: 'templer_laehmung',
    name: 'Lähmung',
    class: 'Templer',
    type: 'active',
    description: 'Blockiert die Bewegung eines Gegners durch gezielten Chakra-Angriff',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'templer_absolute_kontrolle',
    name: 'Absolute Kontrolle',
    class: 'Templer',
    type: 'active',
    description: 'Übernimmt temporär die Kontrolle über alle Körperfunktionen eines Gegners',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'templer_kraft_aus_dem_inneren',
    name: 'Kraft aus dem Inneren',
    class: 'Templer',
    type: 'active',
    description: 'Schöpft innere Kraft aus dem Chakra-System für verstärkte Angriffe',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== GENERAL ====================
  {
    id: 'general_staerke_4',
    name: 'Stärke+4',
    class: 'General',
    type: 'stat_bonus',
    description: '+4 Stärke',
    statBonus: { stat: 'strength', amount: 4 }
  },
  {
    id: 'general_meisterstratege',
    name: 'Meisterstratege',
    class: 'General',
    type: 'passive',
    description: 'Kann taktische Situationen schneller analysieren und Vorteile nutzen',
    enlightened: true
  },
  {
    id: 'general_leibwaechter',
    name: 'Leibwächter',
    class: 'General',
    type: 'dice_bonus',
    description: '-2 auf Würfe, um Verbündete zu schützen (Vorteil)',
    enlightened: true
  },
  {
    id: 'general_angriffsbefehl',
    name: 'Angriffsbefehl',
    class: 'General',
    type: 'active',
    description: 'Befiehlt allen Verbündeten, sofort anzugreifen und gibt ihnen Angriffsboni',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_schutzbefehl',
    name: 'Schutzbefehl',
    class: 'General',
    type: 'active',
    description: 'Befiehlt Verbündeten, einen Bereich zu schützen; -5 auf die Reaktion des Gegners',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_standbefehl',
    name: 'Standbefehl',
    class: 'General',
    type: 'active',
    description: 'Befiehlt allen Verbündeten, standhaft zu bleiben; -1 auf alle Angriffe gegen Verbündete',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_befehlskette',
    name: 'Befehlskette',
    class: 'General',
    type: 'active',
    description: 'Gibt einen langen Befehl aus, der eine Kette von Aktionen bei Verbündeten auslöst',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== KLINGENTÄNZER ====================
  {
    id: 'klingentaenzer_geschwindigkeit_4',
    name: 'Geschwindigkeit+4',
    class: 'Klingentänzer',
    type: 'stat_bonus',
    description: '+4 Geschwindigkeit',
    statBonus: { stat: 'speed', amount: 4 }
  },
  {
    id: 'klingentaenzer_waffen_werfen',
    name: 'Waffen werfen-2',
    class: 'Klingentänzer',
    type: 'dice_bonus',
    description: '-2 auf Waffen-Werfen-Würfe (Vorteil)'
  },
  {
    id: 'klingentaenzer_waffengelehrter',
    name: 'Waffengelehrter',
    class: 'Klingentänzer',
    type: 'passive',
    description: '-8 auf Voraussetzungen für leichte Waffen',
    enlightened: true
  },
  {
    id: 'klingentaenzer_waffentanz',
    name: 'Waffentanz',
    class: 'Klingentänzer',
    type: 'dice_bonus',
    description: '-1 auf den ersten Angriff pro Runde (Vorteil)'
  },
  {
    id: 'klingentaenzer_akrobat',
    name: 'Akrobat',
    class: 'Klingentänzer',
    type: 'passive',
    description: '+3 Bewegung'
  },
  {
    id: 'klingentaenzer_unantastbar',
    name: 'Unantastbar',
    class: 'Klingentänzer',
    type: 'passive',
    description: 'Kann nicht von Fernkampfangriffen getroffen werden, solange in Bewegung',
    enlightened: true
  },
  {
    id: 'klingentaenzer_fliegender_kick',
    name: 'Fliegender Kick',
    class: 'Klingentänzer',
    type: 'active',
    description: 'Führt einen akrobatischen Tritt als Reaktion auf einen Angriff aus',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Reaktion'
  },
  {
    id: 'klingentaenzer_klingenwirbel',
    name: 'Klingenwirbel',
    class: 'Klingentänzer',
    type: 'active',
    description: 'Dreht sich in einem Wirbel und trifft alle Gegner in Reichweite',
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
    description: '+40 Ausdauer',
    statBonus: { stat: 'energy', amount: 40 }
  },
  {
    id: 'assassine_gnadenstoss',
    name: 'Gnadenstoß',
    class: 'Assassine',
    type: 'dice_bonus',
    description: '-2 auf Angriffe gegen vergiftete Ziele (Vorteil)',
    enlightened: true
  },
  {
    id: 'assassine_exitus',
    name: 'Exitus',
    class: 'Assassine',
    type: 'dice_bonus',
    description: '-1 auf Angriffswürfe mit Tötungsabsicht (Vorteil)'
  },
  {
    id: 'assassine_hinterhalt',
    name: 'Hinterhalt',
    class: 'Assassine',
    type: 'dice_bonus',
    description: '-2 auf Angriffswürfe von hinten (Vorteil)'
  },
  {
    id: 'assassine_infiltration',
    name: 'Infiltration',
    class: 'Assassine',
    type: 'passive',
    description: '+3 Bewegung beim Infiltrieren von Gebäuden',
    enlightened: true
  },
  {
    id: 'assassine_gift_mischen',
    name: 'Gift mischen',
    class: 'Assassine',
    type: 'dice_bonus',
    description: '-2 auf Würfe zum Mischen von Giften (Vorteil)',
    enlightened: true
  },
  {
    id: 'assassine_phantomschnitt',
    name: 'Phantomschnitt',
    class: 'Assassine',
    type: 'active',
    description: 'Führt einen unsichtbaren Schnitt aus, der den Gegner stark verwundet',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },

  // ==================== PHANTOM ====================
  {
    id: 'phantom_ausdauer_30',
    name: 'Ausdauer+30',
    class: 'Phantom',
    type: 'stat_bonus',
    description: '+30 Ausdauer',
    statBonus: { stat: 'energy', amount: 30 },
    infiniteLevel: true
  },
  {
    id: 'phantom_nachternte',
    name: 'Nachternte',
    class: 'Phantom',
    type: 'passive',
    description: 'Stellt 2 D20 Mana her, wenn Gegner getötet wird'
  },
  {
    id: 'phantom_hoehenvorteil',
    name: 'Höhenvorteil',
    class: 'Phantom',
    type: 'dice_bonus',
    description: '+2 auf Angriffe, die aus mindestens 10m Höhe über dem Gegner ausgeführt werden',
    enlightened: true
  },
  {
    id: 'phantom_spiegelversteck',
    name: 'Spiegelversteck',
    class: 'Phantom',
    type: 'active',
    description: 'Kann sich in der Reflektion eines Spiegels verbergen. Kann von Spiegel zu Spiegel in Sichtfeld springen. Wird beendet, wenn dieser zerstört oder unklar wird.',
    enlightened: true,
    cost: { type: 'mana', amount: 5, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'phantom_schattenform',
    name: 'Schattenform',
    class: 'Phantom',
    type: 'active',
    description: 'Mache deinen Körper durchlässig und schwebend, wodurch du dich durch Objekte bewegen kannst und nicht von nichtmagischen Angriffen getroffen werden kannst, aber auch nur mit Magie angreifen kannst',
    cost: { type: 'mana', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'phantom_schrei_todesfee',
    name: 'Schrei der Todesfee',
    class: 'Phantom',
    type: 'active',
    description: 'Wähle einen Skill aus, der für alle Gegner in Hörreichweite blockiert wird',
    cost: { type: 'mana', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'phantom_dunkler_begleiter',
    name: 'Dunkler Begleiter',
    class: 'Phantom',
    type: 'active',
    description: 'Verschwinde im Körper eines Verbündeten. In diesem Zustand können alle Skills des Verbündeten verwendet werden (auf eigene Kosten). Bei Angriffen erhalten beide Schaden',
    cost: { type: 'mana', amount: 10, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== FORMATIONSMAGIER ====================
  {
    id: 'formationsmagier_fokus_5',
    name: 'Fokus+5',
    class: 'Formationsmagier',
    type: 'stat_bonus',
    description: '+5 Fokus',
    statBonus: { stat: 'focus', amount: 5 }
  },
  {
    id: 'formationsmagier_max_castwert',
    name: 'Maximaler Castwert+200',
    class: 'Formationsmagier',
    type: 'stat_bonus',
    description: '+200 maximaler Castwert',
    enlightened: true,
    statBonus: { stat: 'maxCastValue', amount: 200 }
  },
  {
    id: 'formationsmagier_zauberarchitekt',
    name: 'Zauberarchitekt',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Kann Zauber mit mehreren Segmenten kombinieren und deren Effekte verstärken'
  },
  {
    id: 'formationsmagier_magische_rueckkopplung',
    name: 'Magische Rückkopplung',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Wenn ein Zauber vollständig reflektiert wird, erhält der Nutzer einen Teil der Energie zurück',
    enlightened: true
  },
  {
    id: 'formationsmagier_arkane_resonanz',
    name: 'Arkane Resonanz',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Verstärkt Zauber, die in Resonanz mit dem eigenen Manafeld stehen'
  },
  {
    id: 'formationsmagier_vorbereiten',
    name: 'Vorbereiten',
    class: 'Formationsmagier',
    type: 'dice_bonus',
    description: '+5 auf vorbereitete Zauber-Würfe (Vorteil)'
  },
  {
    id: 'formationsmagier_dunkles_siegel',
    name: 'Dunkles Siegel',
    class: 'Formationsmagier',
    type: 'active',
    description: 'Versiegelt einen Bereich mit dunkler Magie, die Feinde schwächt und Verbündete stärkt',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== RUNENKÜNSTLER ====================
  {
    id: 'runenkuenstler_mana_40',
    name: 'Mana+40',
    class: 'Runenkünstler',
    type: 'stat_bonus',
    description: '+40 Mana',
    statBonus: { stat: 'mana', amount: 40 }
  },
  {
    id: 'runenkuenstler_verinnerlichen',
    name: '+Verinnerlichen',
    class: 'Runenkünstler',
    type: 'passive',
    description: 'Unbegrenzte Version: Kann beliebig viele Zauber verinnerlichen',
    enlightened: true,
    requiresSkill: 'kampfzauberer_verinnerlichen'
  },
  {
    id: 'runenkuenstler_zauberecho',
    name: 'Zauberecho',
    class: 'Runenkünstler',
    type: 'passive',
    description: 'Nach Wirkung eines Zaubers: Bonusaktion für 20 Mana wird freigeschaltet'
  },
  {
    id: 'runenkuenstler_runenmeister',
    name: 'Runenmeister',
    class: 'Runenkünstler',
    type: 'dice_bonus',
    description: 'Verbesserte Runen-Handhabung, Vorteil auf alle Runenwürfe',
    enlightened: true
  },
  {
    id: 'runenkuenstler_zauberhast',
    name: 'Zauberhast',
    class: 'Runenkünstler',
    type: 'passive',
    description: '+10m Bewegung nach dem Wirken einen Zaubers'
  },
  {
    id: 'runenkuenstler_runenblick',
    name: 'Runenblick',
    class: 'Runenkünstler',
    type: 'active',
    description: 'Analysiert und aktiviert Runen in der Umgebung; Kosten entsprechen den Manakosten der Rune geteilt durch 4',
    cost: { type: 'mana', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'runenkuenstler_brennender_fokus',
    name: 'Brennender Fokus',
    class: 'Runenkünstler',
    type: 'active',
    description: 'Fokussiert alle Maná in einem einzigen vernichtenden Angriff',
    cost: { type: 'energy', amount: 5, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== MENTALIST ====================
  {
    id: 'mentalist_intelligenz_4',
    name: 'Intelligenz+4',
    class: 'Mentalist',
    type: 'stat_bonus',
    description: '+4 Intelligenz',
    statBonus: { stat: 'intelligence', amount: 4 }
  },
  {
    id: 'mentalist_traumcaster',
    name: 'Traumcaster',
    class: 'Mentalist',
    type: 'passive',
    description: 'Kann Zauber im Traumzustand wirken und Träume anderer beeinflussen'
  },
  {
    id: 'mentalist_aluhut',
    name: 'Aluhut',
    class: 'Mentalist',
    type: 'passive',
    description: 'Immun gegen mentale Angriffe und Manipulation',
    enlightened: true
  },
  {
    id: 'mentalist_telepathie',
    name: 'Telepathie',
    class: 'Mentalist',
    type: 'passive',
    description: 'Kann Gedanken von Personen in der Nähe lesen',
    enlightened: true
  },
  {
    id: 'mentalist_manipulator',
    name: 'Manipulator',
    class: 'Mentalist',
    type: 'passive',
    description: 'Kann die Emotionen und Entscheidungen anderer subtil beeinflussen'
  },
  {
    id: 'mentalist_invasion',
    name: 'Invasion',
    class: 'Mentalist',
    type: 'active',
    description: 'Dringt in den Geist eines Gegners ein; Kosten entsprechen der Intelligenz des Gegners x2 (min. 10) pro Runde',
    cost: { type: 'mana', amount: 10, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'mentalist_abbild',
    name: 'Abbild',
    class: 'Mentalist',
    type: 'active',
    description: 'Erschafft eine mentale Illusion einer anderen Person oder eines Objekts',
    cost: { type: 'mana', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== GESTALTENWANDLER ====================
  {
    id: 'gestaltenwandler_wille_3',
    name: 'Wille+3',
    class: 'Gestaltenwandler',
    type: 'stat_bonus',
    description: '+3 Wille',
    statBonus: { stat: 'chill', amount: 3 },
    infiniteLevel: true
  },
  {
    id: 'gestaltenwandler_botschafter',
    name: 'Botschafter',
    class: 'Gestaltenwandler',
    type: 'passive',
    description: 'Wille+2 auf Kommunikations- und Überzeugungsversuche',
    enlightened: true
  },
  {
    id: 'gestaltenwandler_formwechsel',
    name: 'Formwechsel',
    class: 'Gestaltenwandler',
    type: 'passive',
    description: 'Kann körperliche Merkmale wie Körpergröße und -form anpassen',
    enlightened: true
  },
  {
    id: 'gestaltenwandler_transformieren',
    name: 'Transformieren',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Verwandelt sich vollständig in ein anderes Wesen oder eine andere Person',
    cost: { type: 'mana', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'gestaltenwandler_imitation',
    name: 'Imitation',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Imitiert einen beobachteten Skill oder eine Fähigkeit eines Gegners',
    enlightened: true,
    cost: { type: 'mana', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'gestaltenwandler_doppelgaenger',
    name: 'Doppelgänger',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Erschafft eine perfekte Kopie einer anderen Person und übernimmt deren Identität',
    cost: { type: 'mana', amount: 50 },
    actionType: 'Aktion'
  },
  {
    id: 'gestaltenwandler_seelenmeister',
    name: '+Seelenmeister',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Erweitert Seelenwacht: Kann die Seele eines Ziels formen und beeinflussen',
    requiresSkill: 'seelenmagier_seelenwacht',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== PALADIN ====================
  {
    id: 'paladin_konstitution_wille_2',
    name: 'Konstitution&Wille+2',
    class: 'Paladin',
    type: 'stat_bonus',
    description: '+2 Konstitution und +2 Wille',
    statBonuses: [{ stat: 'constitution', amount: 2 }, { stat: 'chill', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'paladin_fixer_fixer',
    name: 'Fixer Fixer',
    class: 'Paladin',
    type: 'passive',
    description: 'Kann pure Unterstützungszauber als Bonusaktion verwenden'
  },
  {
    id: 'paladin_schnelle_hilfe',
    name: 'Schnelle Hilfe',
    class: 'Paladin',
    type: 'passive',
    description: 'Kann Erste Hilfe als Bonusaktion leisten'
  },
  {
    id: 'paladin_inspiration',
    name: 'Inspiration',
    class: 'Paladin',
    type: 'passive',
    description: 'Verbündete in der Nähe erhalten Boni auf ihre nächste Aktion',
    enlightened: true
  },
  {
    id: 'paladin_gleissendes_licht',
    name: 'Gleißendes Licht',
    class: 'Paladin',
    type: 'passive',
    description: 'Umgibt sich mit strahlendem Licht, das Untote und Dämonen schwächt',
    enlightened: true
  },
  {
    id: 'paladin_heroischer_auftritt',
    name: 'Heroischer Auftritt',
    class: 'Paladin',
    type: 'passive',
    description: 'Beim Betreten des Kampfes erhalten alle Verbündeten einen Bonus auf ihre nächste Aktion'
  },
  {
    id: 'paladin_erneuerung',
    name: 'Erneuerung',
    class: 'Paladin',
    type: 'active',
    description: 'Heilt einen Verbündeten und entfernt negative Statuseffekte',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'paladin_heiliger_sprint',
    name: 'Heiliger Sprint',
    class: 'Paladin',
    type: 'active',
    description: 'Rennt mit übernatürlicher Geschwindigkeit zu einem Verbündeten und schützt ihn',
    enlightened: true,
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },

  // ==================== WÄCHTER ====================
  {
    id: 'waechter_konstitution_4',
    name: 'Konstitution+4',
    class: 'Wächter',
    type: 'stat_bonus',
    description: '+4 Konstitution',
    statBonus: { stat: 'constitution', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'waechter_leibwache',
    name: 'Leibwache',
    class: 'Wächter',
    type: 'passive',
    description: 'Kann Angriffe auf Verbündete in Reichweite abfangen'
  },
  {
    id: 'waechter_kenne_deinen_feind',
    name: 'Kenne deinen Feind',
    class: 'Wächter',
    type: 'dice_bonus',
    description: '-1 auf Würfe pro blockiertem Angriff (max. -3)',
    enlightened: true
  },
  {
    id: 'waechter_schildmeister',
    name: 'Schildmeister',
    class: 'Wächter',
    type: 'dice_bonus',
    description: '-2 auf Schild-Würfe (Vorteil)',
    enlightened: true
  },
  {
    id: 'waechter_edles_opfer',
    name: 'Edles Opfer',
    class: 'Wächter',
    type: 'passive',
    description: 'Kann den Todesschlag für einen Verbündeten auf sich nehmen'
  },
  {
    id: 'waechter_beschuetzerinstinkt',
    name: 'Beschützerinstinkt',
    class: 'Wächter',
    type: 'active',
    description: 'Reagiert sofort auf Bedrohungen gegen Verbündete; Kosten entsprechen dem Radius',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'waechter_vergeltungsschlag',
    name: 'Vergeltungsschlag',
    class: 'Wächter',
    type: 'active',
    description: 'Schlägt als Vergeltung für jeden erhaltenen Schaden zurück',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== KOLOSS ====================
  {
    id: 'koloss_konstitution_staerke_2',
    name: 'Konstitution&Stärke+2',
    class: 'Koloss',
    type: 'stat_bonus',
    description: '+2 Konstitution und +2 Stärke',
    statBonuses: [{ stat: 'constitution', amount: 2 }, { stat: 'strength', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'koloss_weg_des_eroberers',
    name: 'Weg des Eroberers',
    class: 'Koloss',
    type: 'passive',
    description: 'Kann Hindernisse und Gegner einfach beiseite schieben',
    enlightened: true
  },
  {
    id: 'koloss_unaufhaltsam',
    name: 'Unaufhaltsam',
    class: 'Koloss',
    type: 'passive',
    description: 'Kann nicht durch Effekte gestoppt oder verlangsamt werden',
    enlightened: true
  },
  {
    id: 'koloss_provokante_praesenz',
    name: 'Provokante Präsenz',
    class: 'Koloss',
    type: 'passive',
    description: 'Zieht automatisch die Aufmerksamkeit von Gegnern auf sich',
    enlightened: true
  },
  {
    id: 'koloss_erdbeben',
    name: 'Erdbeben',
    class: 'Koloss',
    type: 'active',
    description: 'Stampft mit voller Kraft auf den Boden und verursacht ein kleines Erdbeben; Kosten entsprechen dem Radius',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'koloss_wahre_groesse',
    name: 'Wahre Größe',
    class: 'Koloss',
    type: 'active',
    description: 'Wächst auf enorme Größe; Kosten entsprechen Größe x10 pro Runde',
    cost: { type: 'energy', amount: 0, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'koloss_kolossaler_schlag',
    name: 'Kolossaler Schlag',
    class: 'Koloss',
    type: 'active',
    description: 'Führt einen Schlag von gewaltiger Kraft aus, der alles in Reichweite trifft',
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
    description: '+40 Leben',
    statBonus: { stat: 'life', amount: 40 },
    infiniteLevel: true
  },
  {
    id: 'omen_bedroher',
    name: 'Bedroher',
    class: 'Omen',
    type: 'passive',
    description: 'Vorteil auf Bedrohungs-Würfe',
    enlightened: true
  },
  {
    id: 'omen_finstere_aura',
    name: 'Finstere Aura',
    class: 'Omen',
    type: 'passive',
    description: 'Gegner, die Schaden zufügen, werden mit geringer Wahrscheinlichkeit verängstigt',
    enlightened: true
  },
  {
    id: 'omen_vorwarnung',
    name: 'Vorwarnung',
    class: 'Omen',
    type: 'active',
    description: 'Verflucht eine bekannte Person; nach einem Tag wird diese von Pech verfolgt. Kosten entsprechen 1/4 der HP des Ziels',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'omen_kraftraub',
    name: 'Kraftraub',
    class: 'Omen',
    type: 'active',
    description: 'Stiehlt die Ausdauer einer anderen Person und regeneriert denselben Betrag beim Nutzer',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'omen_schlachtschwur',
    name: 'Schlachtschwur',
    class: 'Omen',
    type: 'active',
    description: 'Solange aktiv, wird erlittener Schaden gespeichert. Beim Töten eines Gegners wird der gespeicherte Schaden geheilt',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'omen_unheilvoller_auftritt',
    name: 'Unheilvoller Auftritt',
    class: 'Omen',
    type: 'active',
    description: 'Tritt mit bedrohlicher Aura auf und verbreitet Angst unter Feinden',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'omen_fluchruestung',
    name: 'Fluchrüstung',
    class: 'Omen',
    type: 'active',
    description: 'Belegt die eigene Rüstung mit einem Fluch, der Angreifer schädigt',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== KRIEGSHERR ====================
  {
    id: 'kriegsherr_staerke_4',
    name: 'Stärke+4',
    class: 'Kriegsherr',
    type: 'stat_bonus',
    description: '+4 Stärke',
    statBonus: { stat: 'strength', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'kriegsherr_blutrausch',
    name: 'Blutrausch',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Erhält Boni, wenn Blut vergossen wird'
  },
  {
    id: 'kriegsherr_wutbewaeltigung',
    name: 'Wutbewältigung',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Kann die eigene Rage besser kontrollieren und gezielt einsetzen',
    enlightened: true
  },
  {
    id: 'kriegsherr_vorreiter',
    name: 'Vorreiter',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Erhält Boni, wenn als erster in den Kampf zieht'
  },
  {
    id: 'kriegsherr_lebensmuede',
    name: 'Lebensmüde',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Tauscht Leben gegen Kampfkraft, je weniger Leben desto stärker',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'kriegsherr_todeswirbel',
    name: 'Todeswirbel',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Dreht sich in einem Wirbel und trifft alle Gegner ringsum mit tödlicher Kraft',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'kriegsherr_masochist',
    name: 'Masochist',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Verursacht sich selbst Schaden, um Kampfkraft zu gewinnen',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'kriegsherr_maechtiger_stoss',
    name: 'Mächtiger Stoß',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Führt einen überwältigenden Stoß aus, der den Gegner zu Boden schickt',
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
    description: '+4 Geschicklichkeit',
    statBonus: { stat: 'dexterity', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'duellant_duell',
    name: 'Duell',
    class: 'Duellant',
    type: 'dice_bonus',
    description: '-2 auf Würfe im Einzelkampf (Vorteil)'
  },
  {
    id: 'duellant_perfektion',
    name: 'Perfektion',
    class: 'Duellant',
    type: 'dice_bonus',
    description: '-2 auf Würfe, wenn auf vollem Leben (Vorteil)'
  },
  {
    id: 'duellant_furie',
    name: 'Furie',
    class: 'Duellant',
    type: 'dice_bonus',
    description: '-1 auf Würfe pro erhaltenem Treffer (max. -5)',
    enlightened: true
  },
  {
    id: 'duellant_uebertakten',
    name: 'Übertakten',
    class: 'Duellant',
    type: 'active',
    description: 'Übertaktet die Kampffähigkeiten; kostet 15 (+15 pro weiterer Runde)',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'duellant_konter',
    name: 'Konter',
    class: 'Duellant',
    type: 'active',
    description: 'Kontert einen gegnerischen Angriff sofort',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Reaktion'
  },
  {
    id: 'duellant_schwachstellen_aufdecken',
    name: 'Schwachstellen aufdecken',
    class: 'Duellant',
    type: 'active',
    description: 'Analysiert den Gegner und deckt Schwachstellen auf, die anschließend ausgenutzt werden können',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Bonusaktion'
  },

  // ==================== WAFFENMEISTER ====================
  {
    id: 'waffenmeister_geschicklichkeit_staerke_2',
    name: 'Geschicklichkeit&Stärke+2',
    class: 'Waffenmeister',
    type: 'stat_bonus',
    description: '+2 Geschicklichkeit und +2 Stärke',
    statBonuses: [{ stat: 'dexterity', amount: 2 }, { stat: 'strength', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'waffenmeister_waffenmeister',
    name: '+Waffenmeister',
    class: 'Waffenmeister',
    type: 'passive',
    description: 'Meisterschaft mit allen Waffentypen; eliminiert alle Waffenvoraussetzungen',
    enlightened: true,
    requiresSkill: ['schutze_waffenwissen', 'erzritter_waffenkenner', 'klingentaenzer_waffengelehrter']
  },
  {
    id: 'waffenmeister_wandelndes_arsenal',
    name: 'Wandelndes Arsenal',
    class: 'Waffenmeister',
    type: 'dice_bonus',
    description: '-2 auf Würfe beim Waffenwechsel (Vorteil)',
    enlightened: true
  },
  {
    id: 'waffenmeister_waffenschmied',
    name: 'Waffenschmied',
    class: 'Waffenmeister',
    type: 'passive',
    description: 'Kann Waffen selbst herstellen und verbessern'
  },
  {
    id: 'waffenmeister_ultimativer_stoss',
    name: 'Ultimativer Stoß',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Führt den ultimativen Waffenstoß aus, der alle Verteidigungen durchbricht',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'waffenmeister_sturmschnitt',
    name: 'Sturmschnitt',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Führt einen Schnitt aus, der alle Gegner in einem Kegel trifft',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'waffenmeister_panzerbrecher',
    name: 'Panzerbrecher',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Durchbricht jede Rüstung und jeden Schutz mit einem gezielten Angriff',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },

  // ==================== ATTENTÄTER ====================
  {
    id: 'attentaeter_geschicklichkeit_geschwindigkeit_2',
    name: 'Geschicklichkeit&Geschwindigkeit+2',
    class: 'Attentäter',
    type: 'stat_bonus',
    description: '+2 Geschicklichkeit und +2 Geschwindigkeit',
    statBonuses: [{ stat: 'dexterity', amount: 2 }, { stat: 'speed', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'attentaeter_reichweite_50',
    name: 'Reichweite+50m',
    class: 'Attentäter',
    type: 'stat_bonus',
    description: '+50m Reichweite',
    statBonus: { stat: 'spellRadius', amount: 50 }
  },
  {
    id: 'attentaeter_schattenlaeuser',
    name: 'Schattenläufer',
    class: 'Attentäter',
    type: 'passive',
    description: 'Bewegt sich lautlos und unsichtbar in Schatten',
    enlightened: true,
    requiresSkill: 'dieb_schleichen'
  },
  {
    id: 'attentaeter_verstuemmeln',
    name: 'Verstümmeln',
    class: 'Attentäter',
    type: 'passive',
    description: 'Angriffe haben die Chance, Körperteile dauerhaft zu schädigen'
  },
  {
    id: 'attentaeter_erfrischender_mord',
    name: 'Erfrischender Mord',
    class: 'Attentäter',
    type: 'passive',
    description: 'Regeneriert Ausdauer und Mana, wenn ein Ziel getötet wird'
  },
  {
    id: 'attentaeter_ueberwachung',
    name: 'Überwachung',
    class: 'Attentäter',
    type: 'active',
    description: 'Markiert ein Ziel und überwacht dessen Bewegungen',
    cost: { type: 'energy', amount: 5, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'attentaeter_blitzschritt',
    name: 'Blitzschritt',
    class: 'Attentäter',
    type: 'active',
    description: 'Teleportiert sich blitzschnell zu einem Ziel oder in eine Richtung',
    cost: { type: 'energy', amount: 45, perRound: true },
    actionType: 'Keine Aktion'
  },
  {
    id: 'attentaeter_tragisches_schicksal',
    name: 'Tragisches Schicksal',
    class: 'Attentäter',
    type: 'active',
    description: 'Markiert einen Gegner zum Tod; innerhalb einer Stunde ist der Gegner dem Tode geweiht',
    cost: { type: 'energy', amount: 50 },
    actionType: 'Aktion'
  },

  // ==================== ARTIFICER ====================
  {
    id: 'artificer_intelligenz_geschicklichkeit_2',
    name: 'Intelligenz&Geschicklichkeit+2',
    class: 'Artificer',
    type: 'stat_bonus',
    description: '+2 Intelligenz und +2 Geschicklichkeit',
    statBonuses: [{ stat: 'intelligence', amount: 2 }, { stat: 'dexterity', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'artificer_mechaniker',
    name: 'Mechaniker',
    class: 'Artificer',
    type: 'dice_bonus',
    description: '-3 auf mechanische Würfe (Vorteil)',
    enlightened: true
  },
  {
    id: 'artificer_kalibrierte_geschosse',
    name: 'Kalibrierte Geschosse',
    class: 'Artificer',
    type: 'passive',
    description: 'Selbst hergestellte Geschosse haben verbesserte Genauigkeit und Reichweite'
  },
  {
    id: 'artificer_runenchirurg',
    name: 'Runenchirurg',
    class: 'Artificer',
    type: 'passive',
    description: 'Kann Runen präzise in Ausrüstung einbetten und modifizieren'
  },
  {
    id: 'artificer_raffiniert',
    name: 'Raffiniert',
    class: 'Artificer',
    type: 'passive',
    description: 'Findet immer einen Ausweg in schwierigen Situationen',
    enlightened: true
  },
  {
    id: 'artificer_zweiter_atem',
    name: 'Zweiter Atem',
    class: 'Artificer',
    type: 'active',
    description: 'Aktiviert ein Notfallsystem, das sofort heilt; kostet 15 (+15 pro weiterer Runde)',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Keine Aktion'
  },
  {
    id: 'artificer_zauberschmiede',
    name: 'Zauberschmiede',
    class: 'Artificer',
    type: 'active',
    description: 'Schmiedet Runen in Echtzeit in Ausrüstungsgegenstände',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== MANALORD ====================
  {
    id: 'manalord_mana_40',
    name: 'Mana+40',
    class: 'Manalord',
    type: 'stat_bonus',
    description: '+40 Mana',
    statBonus: { stat: 'mana', amount: 40 },
    infiniteLevel: true
  },
  {
    id: 'manalord_zauberradius_5',
    name: 'Zauberradius+5m',
    class: 'Manalord',
    type: 'stat_bonus',
    description: '+5m Zauberradius',
    enlightened: true,
    statBonus: { stat: 'spellRadius', amount: 5 }
  },
  {
    id: 'manalord_runenschmied',
    name: 'Runenschmied',
    class: 'Manalord',
    type: 'passive',
    description: 'Kann mächtige Runen herstellen, die über normale Grenzen hinaus gehen',
    enlightened: true
  },
  {
    id: 'manalord_energiewandler',
    name: 'Energiewandler',
    class: 'Manalord',
    type: 'passive',
    description: 'Kann jede Art von Energie in Mana umwandeln',
    enlightened: true
  },
  {
    id: 'manalord_arkaner_speicher',
    name: 'Arkaner Speicher',
    class: 'Manalord',
    type: 'passive',
    description: 'Speichert überschüssige Maná in internen Reservoirs für spätere Nutzung'
  },
  {
    id: 'manalord_magieherrschaft',
    name: 'Magieherrschaft',
    class: 'Manalord',
    type: 'passive',
    description: 'Beherrscht alle Arten von Magie und kann ihre Kosten reduzieren'
  },
  {
    id: 'manalord_zauberautoritaet',
    name: '+Zauberauthorität',
    class: 'Manalord',
    type: 'active',
    description: 'Erweitert Zauberbrecher: Kann jeden Zauber in Reichweite nach Belieben kontrollieren',
    requiresSkill: 'arkanist_zauberbrecher',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'manalord_herrschaftsgebiet',
    name: 'Herrschaftsgebiet',
    class: 'Manalord',
    type: 'active',
    description: 'Erschafft ein Gebiet absoluter Magiekontrolle, in dem der Nutzer alle Maná beherrscht',
    cost: { type: 'energy', amount: 30, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== NEKROMANT ====================
  {
    id: 'nekromant_fokus_5',
    name: 'Fokus+5',
    class: 'Nekromant',
    type: 'stat_bonus',
    description: '+5 Fokus',
    statBonus: { stat: 'focus', amount: 5 },
    infiniteLevel: true
  },
  {
    id: 'nekromant_totenbeschworer',
    name: 'Totenbeschwörer',
    class: 'Nekromant',
    type: 'passive',
    description: 'Kann Tote beschwören und als Untote kontrollieren'
  },
  {
    id: 'nekromant_seelenverbindung',
    name: 'Seelenverbindung',
    class: 'Nekromant',
    type: 'passive',
    description: 'Verbindet die eigene Seele mit der eines anderen und teilt so Wahrnehmungen',
    enlightened: true
  },
  {
    id: 'nekromant_seelenfusion',
    name: 'Seelenfusion',
    class: 'Nekromant',
    type: 'passive',
    description: 'Verschmilzt mit einer anderen Seele und erhält deren Fähigkeiten'
  },
  {
    id: 'nekromant_gestohlene_macht',
    name: 'Gestohlene Macht',
    class: 'Nekromant',
    type: 'passive',
    description: 'Absorbiert die Kraft getöteter Gegner'
  },
  {
    id: 'nekromant_unheiliges_ritual',
    name: 'Unheiliges Ritual',
    class: 'Nekromant',
    type: 'active',
    description: 'Führt ein unheiliges Ritual durch, das mächtige nekromantische Effekte erzeugt',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'nekromant_maertyrer',
    name: 'Märtyrer',
    class: 'Nekromant',
    type: 'active',
    description: 'Opfert das eigene Leben für mächtige nekromantische Magie',
    cost: { type: 'energy', amount: 30, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== ORAKEL ====================
  {
    id: 'orakel_intelligenz_4',
    name: 'Intelligenz+4',
    class: 'Orakel',
    type: 'stat_bonus',
    description: '+4 Intelligenz',
    statBonus: { stat: 'intelligence', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'orakel_adaptiver_geist',
    name: 'Adaptiver Geist',
    class: 'Orakel',
    type: 'passive',
    description: 'Passt sich schnell an neue Situationen und Bedrohungen an',
    enlightened: true
  },
  {
    id: 'orakel_ueberreaktion',
    name: 'Überreaktion',
    class: 'Orakel',
    type: 'dice_bonus',
    description: '-2 auf Reaktionswürfe (Vorteil)',
    enlightened: true
  },
  {
    id: 'orakel_vorschuss',
    name: 'Vorschuss',
    class: 'Orakel',
    type: 'passive',
    description: 'Kann eine Aktion als Reaktion auf zukünftige Ereignisse vorbereiten'
  },
  {
    id: 'orakel_identifizieren',
    name: 'Identifizieren',
    class: 'Orakel',
    type: 'passive',
    description: 'Kann Gegenstände, Personen und Effekte sofort identifizieren',
    enlightened: true
  },
  {
    id: 'orakel_glueckstraehne',
    name: 'Glückssträhne',
    class: 'Orakel',
    type: 'active',
    description: 'Aktiviert eine Phase außergewöhnlichen Glücks, die alle Würfe verbessert',
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'orakel_schicksal',
    name: 'Schicksal',
    class: 'Orakel',
    type: 'active',
    description: 'Manipuliert das Schicksal eines Ziels zum Guten oder Schlechten',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'orakel_prophezeiung',
    name: 'Prophezeiung',
    class: 'Orakel',
    type: 'active',
    description: 'Prophezeit zukünftige Ereignisse und gibt wertvolle Hinweise',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== DUNKLER RITTER ====================
  {
    id: 'dunkler_ritter_staerke_intelligenz_2',
    name: 'Stärke&Intelligenz+2',
    class: 'Dunkler Ritter',
    type: 'stat_bonus',
    description: '+2 Stärke und +2 Intelligenz',
    statBonuses: [{ stat: 'strength', amount: 2 }, { stat: 'intelligence', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'dunkler_ritter_absolute_dunkelheit',
    name: 'Absolute Dunkelheit',
    class: 'Dunkler Ritter',
    type: 'passive',
    description: 'Kann Licht in einem Bereich vollständig auslöschen',
    enlightened: true
  },
  {
    id: 'dunkler_ritter_nachtaktiv',
    name: 'Nachtaktiv',
    class: 'Dunkler Ritter',
    type: 'dice_bonus',
    description: '-2 auf Würfe in Dunkelheit (Vorteil)',
    enlightened: true
  },
  {
    id: 'dunkler_ritter_arkane_ausstattung',
    name: 'Arkane Ausstattung',
    class: 'Dunkler Ritter',
    type: 'passive',
    description: 'Rüstung und Waffe sind mit dunkler Magie infiziert'
  },
  {
    id: 'dunkler_ritter_schattenruestung',
    name: 'Schattenrüstung',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Hüllt sich in eine Schattenrüstung, die Schaden absorbiert',
    cost: { type: 'energy', amount: 15, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'dunkler_ritter_dunkler_schnitt',
    name: 'Dunkler Schnitt',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Schnitt mit arkaner Dunkelheit, der Schaden und Fluch kombiniert',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'dunkler_ritter_tiefer_fokus',
    name: 'Tiefer Fokus',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Fokussiert dunkle Energie für einen überwältigenden Angriff, der eigenes Leben kostet',
    cost: { type: 'life', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
`;

const newContent = keepStart + newSkillDefinitions + '\n];' + keepEnd;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done! File written successfully.');
console.log('New file size:', newContent.length, 'chars');
