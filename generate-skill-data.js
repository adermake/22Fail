const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/app/data/skill-definitions.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Find the start and end of SKILL_DEFINITIONS array
const arrayStart = content.indexOf('export const SKILL_DEFINITIONS: SkillDefinition[] = [');
const arrayStartEnd = arrayStart + 'export const SKILL_DEFINITIONS: SkillDefinition[] = ['.length;

// Find the closing bracket - it's the last "];" before the helper functions or end
// Helper functions start with "// Helper to get skills"
const helperStart = content.indexOf('\n// Helper to get skills');
// Find the last "];" before helperStart
const beforeHelper = content.substring(0, helperStart);
const lastClosingBracket = beforeHelper.lastIndexOf('];');

const keepBefore = content.substring(0, arrayStartEnd);
const keepAfter = content.substring(lastClosingBracket + 2); // after "];"

const newSkills = `
  // ==================== TIER 1 ====================

  // ==================== KÄMPFER ====================
  {
    id: 'kaempfer_staerke_1',
    name: 'Stärke+1',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: 'Stärke+1',
    statBonus: { stat: 'strength', amount: 1 }
  },
  {
    id: 'kaempfer_konstitution_1',
    name: 'Konstitution+1',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: 'Konstitution+1',
    statBonus: { stat: 'constitution', amount: 1 }
  },
  {
    id: 'kaempfer_schwere_waffen_werfen',
    name: 'Schwere Waffen werfen+1',
    class: 'Kämpfer',
    type: 'dice_bonus',
    description: 'Schwere Waffen werfen+1'
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
    description: '+2 Effektivität auf Zauber'
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
    name: 'Ätherkraft',
    class: 'Krieger',
    type: 'passive',
    description: 'Kann erlittenen Schaden halbieren und die andere Hälfte als Mana zahlen.'
  },
  {
    id: 'krieger_schwerer_schlag',
    name: 'Schwerer Schlag',
    class: 'Krieger',
    type: 'active',
    description: 'Schlag mit hoher Stärke, muss eine Runde ausholen',
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
    name: 'Stärke+2',
    class: 'Barbar',
    type: 'stat_bonus',
    description: 'Stärke+2',
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'barbar_ruecksichtslos',
    name: 'Rücksichtslos',
    class: 'Barbar',
    type: 'passive',
    description: 'Stärke+4 bei weniger als 5 Rüstungsmalus'
  },
  {
    id: 'barbar_blutlust',
    name: 'Blutlust',
    class: 'Barbar',
    type: 'passive',
    description: '-1 auf Angriffe für jeden getöten Gegner, hält für den Rest des Kampfes, maximal -3'
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
    description: 'Erhöht Bewegung aller Verbündeter um 3 in der Nähe für einen Zug',
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
    name: 'Schlösser knacken-2',
    class: 'Dieb',
    type: 'dice_bonus',
    description: 'Schlösser knacken-2'
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
    name: 'Leichtfüßigkeit',
    class: 'Dieb',
    type: 'passive',
    description: 'Bewegung+2 bei weniger als 5 Rüstungsmalus',
    enlightened: true
  },
  {
    id: 'dieb_auge_der_gier',
    name: 'Auge der Gier',
    class: 'Dieb',
    type: 'dice_bonus',
    description: '-2 auf Wert abschätzen',
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

  // ==================== SCHÜTZE ====================
  {
    id: 'schutze_geschicklichkeit_2',
    name: 'Geschicklichkeit+2',
    class: 'Schütze',
    type: 'stat_bonus',
    description: 'Geschicklichkeit+2',
    statBonus: { stat: 'dexterity', amount: 2 }
  },
  {
    id: 'schutze_reichweite_10',
    name: 'Reichweite+10m',
    class: 'Schütze',
    type: 'stat_bonus',
    description: 'Reichweite+10m für Fernkampfwaffen'
  },
  {
    id: 'schutze_waffenwissen',
    name: 'Waffenwissen',
    class: 'Schütze',
    type: 'passive',
    description: 'Waffenvorraussetzung-4 für Fernkampfwaffen',
    enlightened: true
  },
  {
    id: 'schutze_adlerauge',
    name: 'Adlerauge',
    class: 'Schütze',
    type: 'passive',
    description: '-1 im Fernkampf'
  },
  {
    id: 'schutze_geschaerfte_sinne',
    name: 'Geschärfte Sinne',
    class: 'Schütze',
    type: 'passive',
    description: '-2 auf alle Aktionen außerhalb von Kämpfen, die gute Sehkraft vorraussetzen',
    enlightened: true
  },
  {
    id: 'schutze_aetherfeuer',
    name: 'Ätherfeuer',
    class: 'Schütze',
    type: 'active',
    description: 'Führe eine weitere Aktion aus',
    cost: { type: 'mana', amount: 20 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'schutze_zielschuss',
    name: 'Zielschuss',
    class: 'Schütze',
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
    description: '+2 beim Würfeln für Zaubercasts'
  },
  {
    id: 'kampfzauberer_verinnerlichen',
    name: 'Verinnerlichen',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Lerne einen Zauber auswendig, damit du ihn ohne Medium benutzen kannst. Zauber können jederzeit gewechselt werden, brauchen aber mehrere Stunden.',
    enlightened: true
  },
  {
    id: 'kampfzauberer_freies_wirken',
    name: 'Freies Wirken',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Kann sich während eines Zaubercasts bewegen'
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
    description: 'Reduziere den Castwert des Spells eines Gegners in 20m Umfeld um eine gewürfelte Anzahl. Boni für Zaubercasts werden hier auch angewandt.',
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
    description: '-3 auf alle Heilungswürfe, wenn Ziel im kritischen Zustand ist',
    enlightened: true
  },
  {
    id: 'heiler_alchemist',
    name: 'Alchemist',
    class: 'Heiler',
    type: 'passive',
    description: '-2 beim Brauen von Tränken mit positivem Effekt',
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
    description: 'Helfe einem Verbündeten beim Zaubercast, indem du für seinen Castwert würfelst. Boni für Zaubercasts werden hier auch angewandt.',
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
    name: 'Rüstungsnegation+5',
    class: 'Ritter',
    type: 'stat_bonus',
    description: 'Rüstungsnegation+5'
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
    description: '-2 auf Reaktionen, die gegnerische Angriffe auf Verbündete blocken',
    enlightened: true
  },
  {
    id: 'ritter_schwere_ruestung',
    name: 'Schwere Rüstung',
    class: 'Ritter',
    type: 'active',
    description: 'Negiert Schaden und wandelt ihn zu doppeltem Rüstungsschaden um',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'ritter_schildstoss',
    name: 'Schildstoß',
    class: 'Ritter',
    type: 'active',
    description: 'Angriff mit Schild, hoher Rückstoß',
    enlightened: true,
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },
  {
    id: 'ritter_reitstoss',
    name: 'Reitstoß',
    class: 'Ritter',
    type: 'active',
    description: 'Durchbohrender Angriff auf dem Pferd, -5 auf Zerstörung einer brüchigen Waffe',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== MÖNCH ====================
  {
    id: 'moench_konstitution_3',
    name: 'Konstitution+3',
    class: 'Mönch',
    type: 'stat_bonus',
    description: 'Konstitution+3',
    statBonus: { stat: 'constitution', amount: 3 }
  },
  {
    id: 'moench_goettlicher_segen',
    name: 'Göttlicher Segen',
    class: 'Mönch',
    type: 'passive',
    description: 'Pechresistenz'
  },
  {
    id: 'moench_fokussierte_schlaege',
    name: 'Fokussierte Schläge',
    class: 'Mönch',
    type: 'passive',
    description: '-3 bei Angriffen auf Gegenstände'
  },
  {
    id: 'moench_waffenloser_kampf',
    name: 'Waffenloser Kampf',
    class: 'Mönch',
    type: 'passive',
    description: '-2 im Kampf ohne Waffen(außer Handschuhen)'
  },
  {
    id: 'moench_hartes_training',
    name: 'Hartes Training',
    class: 'Mönch',
    type: 'passive',
    description: 'Geschicklichkeit+4 bei weniger als 5 Rüstungsmalus',
    enlightened: true
  },
  {
    id: 'moench_chakra_blockade',
    name: 'Chakra-Blockade',
    class: 'Mönch',
    type: 'active',
    description: 'Angriff, der gegnerische Extremitäten lähmt',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'moench_meditation',
    name: 'Meditation',
    class: 'Mönch',
    type: 'active',
    description: 'Stellt 5 Mana her',
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
    description: 'Stärke+2',
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'berserker_notfallstaerke',
    name: 'Notfallstärke',
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
    description: 'Mit jedem getöten Gegner wird "Kampfschrei" ausgelöst',
    requiresSkill: 'barbar_kampfschrei'
  },
  {
    id: 'berserker_unsterblicher_krieger',
    name: 'Unsterblicher Krieger',
    class: 'Berserker',
    type: 'passive',
    description: 'Heilt Leben um 3 D20, wenn Gegner getötet wird'
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
    description: 'Für Züge in denen angegriffen wurde bleibt Rage bestehen.',
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
    name: 'Wütender Wurf',
    class: 'Berserker',
    type: 'active',
    description: 'Wirft einen Gegner bis zu 50m weit',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== PLÜNDERER ====================
  {
    id: 'pluenderer_charisma_3',
    name: 'Charisma+3',
    class: 'Plünderer',
    type: 'stat_bonus',
    description: 'Charisma+3',
    statBonus: { stat: 'chill', amount: 3 }
  },
  {
    id: 'pluenderer_horter',
    name: 'Horter',
    class: 'Plünderer',
    type: 'passive',
    description: 'Erhöht Inventarkapazität um 50%',
    enlightened: true
  },
  {
    id: 'pluenderer_reichtum',
    name: 'Reichtum',
    class: 'Plünderer',
    type: 'passive',
    description: 'Erhält 50% mehr Geld durch Loot und Verkäufe'
  },
  {
    id: 'pluenderer_brandstifter',
    name: 'Brandstifter',
    class: 'Plünderer',
    type: 'passive',
    description: 'Reduziert Schaden von normalem Feuer um 80%',
    enlightened: true
  },
  {
    id: 'pluenderer_raeuberbande',
    name: 'Räuberbande',
    class: 'Plünderer',
    type: 'passive',
    description: '-1 im Kampf, wenn deine Gruppe in Überzahl ist',
    enlightened: true
  },
  {
    id: 'pluenderer_pluendern',
    name: 'Plündern',
    class: 'Plünderer',
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
    description: 'Erhalte eine zusätzliche Bonusaktion pro Zug'
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
    description: 'Landet garantiert auf instabilem Boden und erhält -1 auf den folgenden Angriff',
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

  // ==================== JÄGER ====================
  {
    id: 'jaeger_geschicklichkeit_3',
    name: 'Geschicklichkeit+3',
    class: 'Jäger',
    type: 'stat_bonus',
    description: 'Geschicklichkeit+3',
    statBonus: { stat: 'dexterity', amount: 3 }
  },
  {
    id: 'jaeger_klettern',
    name: 'Klettern-2',
    class: 'Jäger',
    type: 'dice_bonus',
    description: 'Klettern-2'
  },
  {
    id: 'jaeger_verstecken',
    name: 'Verstecken-2',
    class: 'Jäger',
    type: 'dice_bonus',
    description: 'Verstecken-2'
  },
  {
    id: 'jaeger_fallen_stellen',
    name: 'Fallen stellen-2',
    class: 'Jäger',
    type: 'dice_bonus',
    description: 'Fallen stellen-2'
  },
  {
    id: 'jaeger_basteln',
    name: 'Basteln',
    class: 'Jäger',
    type: 'passive',
    description: 'Die Qualität hergestellter Munition erhöht sich um einen Rang',
    enlightened: true
  },
  {
    id: 'jaeger_spuren_lesen',
    name: 'Spuren lesen',
    class: 'Jäger',
    type: 'passive',
    description: 'Kann Spuren von Tieren und Gegnern lesen und verfolgen',
    enlightened: true
  },
  {
    id: 'jaeger_angedrehte_schuesse',
    name: 'Angedrehte Schüsse',
    class: 'Jäger',
    type: 'passive',
    description: 'Fernkampfprojektile können in der Luft die Richtung ändern'
  },

  // ==================== SCHNELLSCHÜTZE ====================
  {
    id: 'schnellschuetze_bewegung_3',
    name: 'Bewegung+3',
    class: 'Schnellschütze',
    type: 'stat_bonus',
    description: 'Bewegung+3',
    statBonus: { stat: 'speed', amount: 3 }
  },
  {
    id: 'schnellschuetze_dynamisches_schiessen',
    name: 'Dynamisches Schießen',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Kann während dem Laufen ohne Malus schießen',
    enlightened: true
  },
  {
    id: 'schnellschuetze_sofortladung',
    name: 'Sofortladung',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Verbraucht keine Aktion, um Waffen nachzuladen'
  },
  {
    id: 'schnellschuetze_unberuehrt',
    name: 'Unberührt',
    class: 'Schnellschütze',
    type: 'passive',
    description: '+5 Bewegung, wenn du diese und letzte Runde keinen Schaden genommen hast',
    enlightened: true
  },
  {
    id: 'schnellschuetze_folgeangriff',
    name: 'Folgeangriff',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Erhält sofort eine Extra-Aktion, wenn ein Gegner handlungsunfähig wird, egal wer am Zug ist'
  },
  {
    id: 'schnellschuetze_multischuss',
    name: 'Multischuss',
    class: 'Schnellschütze',
    type: 'active',
    description: 'Kann bis zu 3 Projektile auf unterschiedliche Gegner auf einmal schießen',
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'schnellschuetze_runde_2',
    name: 'Runde 2',
    class: 'Schnellschütze',
    type: 'active',
    description: 'Erhalte eine Extra-Aktion, wenn du das nächste mal am Zug bist',
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
    name: 'Managespür',
    class: 'Arkanist',
    type: 'passive',
    description: 'Kann pures Mana spüren',
    enlightened: true
  },
  {
    id: 'arkanist_verinnerlichen',
    name: '+Verinnerlichen',
    class: 'Arkanist',
    type: 'passive',
    description: 'Besetze je 5 Fokus, um einen zusätzlichen Zauber auswendig zu lernen.',
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
    description: 'Annulliert einen Zauber im Zauberradius, Ausdauerkosten entsprechen den halben Manakosten des Zaubers und kann Ausdauer ins Negative bringen. Erhält Möglichkeit, diese Fähigkeit zu nutzen, wenn ein Zauber den Zauberradius betritt.',
    actionType: 'Aktion'
  },
  {
    id: 'arkanist_ueberladen',
    name: 'Überladen',
    class: 'Arkanist',
    type: 'active',
    description: 'Nutze den nächsten Zauber mit verdoppelter Vorraussetzung und Effektivität',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== HÄMOMANT ====================
  {
    id: 'haemomant_leben_30',
    name: 'Leben+30',
    class: 'Hämomant',
    type: 'stat_bonus',
    description: 'Leben+30',
    statBonus: { stat: 'life', amount: 30 }
  },
  {
    id: 'haemomant_magisches_blut',
    name: 'Magisches Blut',
    class: 'Hämomant',
    type: 'passive',
    description: 'Kann eigenes Blut als Startpunkt für Zauber benutzen'
  },
  {
    id: 'haemomant_kaltbluetig',
    name: 'Kaltblütig',
    class: 'Hämomant',
    type: 'passive',
    description: '-1 im Kampf gegen Gegner mit offenen Wunden',
    enlightened: true
  },
  {
    id: 'haemomant_transfusion',
    name: 'Transfusion',
    class: 'Hämomant',
    type: 'active',
    description: 'Absorbiere umliegendes Blut und heile dich um den gewürfelten Betrag (D8)',
    cost: { type: 'energy', amount: 5 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'haemomant_blutecho',
    name: 'Blutecho',
    class: 'Hämomant',
    type: 'active',
    description: 'Absorbiert einen genannten Skill aus gegnerischem Blut und verwende ihn direkt ohne Kosten. Sollte der genannte Skill nicht existieren, wird ein zufälliger Skill ausgewählt. Nur einmal pro Person möglich',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'haemomant_hypertonie',
    name: 'Hypertonie',
    class: 'Hämomant',
    type: 'active',
    description: '-2 im Kampf',
    cost: { type: 'life', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'haemomant_aderlass',
    name: 'Aderlass',
    class: 'Hämomant',
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
    description: '-1 auf Nutzung von Zaubern die eine Elementarrune beinhalten, die für eine aktive Beschwörung benutzt wurde.'
  },
  {
    id: 'seelenformer_hausgemacht',
    name: 'Hausgemacht',
    class: 'Seelenformer',
    type: 'passive',
    description: 'Senkt Fokuskosten für selbst kreierte Seelenrunen in Beschwörungszaubern um 20% und ermöglicht es, diese Seelenrunen in diesen Zaubern frei auszutauschen.'
  },
  {
    id: 'seelenformer_seelenwacht',
    name: 'Seelenwacht',
    class: 'Seelenformer',
    type: 'active',
    description: 'Kann Seelen von Tieren analysieren, um sie als Rune zu speichern. Benötigt mehrere Tage intensiver Inspektion',
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
    description: 'Nutze die Wahrnehmung einer deiner Beschwörungen als deine eigene',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'seelenformer_sanktum',
    name: 'Sanktum',
    class: 'Seelenformer',
    type: 'active',
    description: 'Festige die Seele eines Verbündeten, was ihn immun gegen psychische Angriffe macht',
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
    description: 'Waffenvorraussetzung-8 für schwere Waffen',
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
    name: 'Unzerbrechliche Rüstung',
    class: 'Erzritter',
    type: 'passive',
    description: 'Halbiert Rüstungsschaden'
  },
  {
    id: 'erzritter_ruestungsschmied',
    name: 'Rüstungsschmied',
    class: 'Erzritter',
    type: 'passive',
    description: 'Verdreifacht erwürfelte Schmiedepunkte beim Schmieden von Rüstung'
  },
  {
    id: 'erzritter_volle_wucht',
    name: 'Volle Wucht',
    class: 'Erzritter',
    type: 'active',
    description: 'Rammangriff, der mit Rüstungsgewicht skaliert',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'erzritter_schwerer_panzer',
    name: '+Schwerer Panzer',
    class: 'Erzritter',
    type: 'active',
    description: '"Schwere Rüstung" kostet keine Ausdauer.',
    requiresSkill: 'ritter_schwere_ruestung',
    actionType: 'Aktion'
  },
  {
    id: 'erzritter_magische_ausruestung',
    name: 'Magische Ausrüstung',
    class: 'Erzritter',
    type: 'active',
    description: 'Rüstung wird magisch an- und ausgerüstet',
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
    name: '+Verlängerter Arm',
    class: 'Templer',
    type: 'passive',
    description: 'Stäbe zählen für "Waffenloser Kampf".',
    requiresSkill: 'moench_waffenloser_kampf'
  },
  {
    id: 'templer_staehlerne_haut',
    name: 'Stählerne Haut',
    class: 'Templer',
    type: 'passive',
    description: 'Halbiert Schaden gegen Wuchtangriffe',
    enlightened: true
  },
  {
    id: 'templer_mentale_ruestung',
    name: 'Mentale Rüstung',
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
    description: '"Chakra-Blockade" kann für jeden Angriff ohne Kosten aktiviert werden.',
    requiresSkill: 'moench_chakra_blockade',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Keine Aktion'
  },
  {
    id: 'templer_laehmung',
    name: 'Lähmung',
    class: 'Templer',
    type: 'active',
    description: 'Angriff, der Gegner komplett lähmt',
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
    name: 'Stärke+4',
    class: 'General',
    type: 'stat_bonus',
    description: 'Stärke+4',
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
    name: 'Leibwächter',
    class: 'General',
    type: 'passive',
    description: '-2 auf Reaktionen von Verbündeten, um dich zu schützen',
    enlightened: true
  },
  {
    id: 'general_angriffsbefehl',
    name: 'Angriffsbefehl',
    class: 'General',
    type: 'active',
    description: 'Schenkt einem Verbündeten einen Extrazug',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_schutzbefehl',
    name: 'Schutzbefehl',
    class: 'General',
    type: 'active',
    description: 'Ein Vebündeter erhält -5 auf die Reaktion des nächsten Angriffs',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_standbefehl',
    name: 'Standbefehl',
    class: 'General',
    type: 'active',
    description: 'Zieht eine Linie, auf der alle Verbündeten im Kampf -1 erhalten',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'general_befehlskette',
    name: 'Befehlskette',
    class: 'General',
    type: 'active',
    description: 'Kann diese Runde unendlich viele Befehle ausgeben für doppelte Ausdauerkosten',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== KLINGENTÄNZER ====================
  {
    id: 'klingentaenzer_geschwindigkeit_4',
    name: 'Geschwindigkeit+4',
    class: 'Klingentänzer',
    type: 'stat_bonus',
    description: 'Geschwindigkeit+4',
    statBonus: { stat: 'speed', amount: 4 }
  },
  {
    id: 'klingentaenzer_waffen_werfen',
    name: 'Waffen werfen-2',
    class: 'Klingentänzer',
    type: 'dice_bonus',
    description: 'Waffen werfen-2'
  },
  {
    id: 'klingentaenzer_waffengelehrter',
    name: 'Waffengelehrter',
    class: 'Klingentänzer',
    type: 'passive',
    description: 'Waffenvorraussetzung-8 für leichte Waffen',
    enlightened: true
  },
  {
    id: 'klingentaenzer_waffentanz',
    name: 'Waffentanz',
    class: 'Klingentänzer',
    type: 'passive',
    description: '-1 auf den ersten Angriff mit einer Waffe. Erneuert sich, wenn Waffe min. 1m von dir entfernt ist oder in dieser Runde aufgehoben wurde'
  },
  {
    id: 'klingentaenzer_akrobat',
    name: 'Akrobat',
    class: 'Klingentänzer',
    type: 'passive',
    description: '+3 Bewegung auf Waffen zu, die momentan niemand hält'
  },
  {
    id: 'klingentaenzer_unantastbar',
    name: 'Unantastbar',
    class: 'Klingentänzer',
    type: 'passive',
    description: 'Nach einer Killbeteiligung kann in der nächsten Runde einem Angriff garantiert ausgewichen werden',
    enlightened: true
  },
  {
    id: 'klingentaenzer_fliegender_kick',
    name: 'Fliegender Kick',
    class: 'Klingentänzer',
    type: 'active',
    description: 'Leichte Waffen, die sich in der Luft befinden, können auf Gegner gekickt werden. Kann auch als Reaktion genutzt werden',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },
  {
    id: 'klingentaenzer_klingenwirbel',
    name: 'Klingenwirbel',
    class: 'Klingentänzer',
    type: 'active',
    description: 'Wirf eine leichte Waffe mit so viel Drall, dass sie nächste Runde zurückkehrt',
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
    name: 'Gnadenstoß',
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
    description: '-1 auf Angriffe mit Absicht zu töten'
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
    description: '-2 beim Brauen auf Tränke mit schädlichem Effekt',
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
    description: 'Stellt 2 D20 Mana her, wenn Gegner getötet wird'
  },
  {
    id: 'phantom_hoehenvorteil',
    name: 'Höhenvorteil',
    class: 'Phantom',
    type: 'passive',
    description: '-2 auf Angriffe, die aus mindestens 10m Höhe über dem Gegner ausgeführt werden',
    enlightened: true
  },
  {
    id: 'phantom_spiegelversteck',
    name: 'Spiegelversteck',
    class: 'Phantom',
    type: 'passive',
    description: 'Kann sich in der Reflektion eines Spiegels verbergen. Kann von Spiegel zu Spiegel in Sichtfeld springen. Wird beendet, wenn dieser zerstört oder unklar wird. 5 pro Runde',
    enlightened: true
  },
  {
    id: 'phantom_schattenform',
    name: 'Schattenform',
    class: 'Phantom',
    type: 'active',
    description: 'Mache deinen Körper durchlässig und schwebend, wodurch du dich durch Objekte bewegen kannst und nicht von nichtmagischen Angriffen getroffen werden kannst, aber auch nur mit Magie angreifen kannst',
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'phantom_schrei_todesfee',
    name: 'Schrei der Todesfee',
    class: 'Phantom',
    type: 'active',
    description: 'Wähle einen Skill aus, der für alle Gegner in Hörreichweite blockiert wird. Kostet 10x die Rundendauer',
    actionType: 'Aktion'
  },
  {
    id: 'phantom_dunkler_begleiter',
    name: 'Dunkler Begleiter',
    class: 'Phantom',
    type: 'active',
    description: 'Verschwinde im Körper eines Verbündeten. In diesem Zustand können alle Skills des Verbündeten verwendet werden (auf eigene Kosten). Bei Angriffen erhalten beide Schaden',
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
    description: 'Halbiert Fokuskosten von Zaubern mit einer Effizienz von über 100.'
  },
  {
    id: 'formationsmagier_magische_rueckkopplung',
    name: 'Magische Rückkopplung',
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
    description: 'Muss bei Formationen(großen Spells) nur 10% der zusätzlichen Manakosten zahlen.'
  },
  {
    id: 'formationsmagier_vorbereiten',
    name: 'Vorbereiten',
    class: 'Formationsmagier',
    type: 'passive',
    description: '+5 beim Würfeln für Zaubercasts, deren Maximum bei 50 oder höher liegt'
  },
  {
    id: 'formationsmagier_dunkles_siegel',
    name: 'Dunkles Siegel',
    class: 'Formationsmagier',
    type: 'active',
    description: '-10 auf den nächsten Zauber, danach kann einen Tag keine Magie mehr benutzt werden',
    cost: { type: 'energy', amount: 10 },
    actionType: 'Bonusaktion'
  },

  // ==================== RUNENKÜNSTLER ====================
  {
    id: 'runenkuenstler_mana_40',
    name: 'Mana+40',
    class: 'Runenkünstler',
    type: 'stat_bonus',
    description: 'Mana+40',
    statBonus: { stat: 'mana', amount: 40 }
  },
  {
    id: 'runenkuenstler_verinnerlichen',
    name: '+Verinnerlichen',
    class: 'Runenkünstler',
    type: 'passive',
    description: 'Kann unendlich viele Zauber sofort auswendig lernen.',
    enlightened: true,
    requiresSkill: 'kampfzauberer_verinnerlichen'
  },
  {
    id: 'runenkuenstler_zauberecho',
    name: 'Zauberecho',
    class: 'Runenkünstler',
    type: 'passive',
    description: 'Kann den in dieser Aktion genutzten Zauber nochmal benutzen. Bonusaktion, 20'
  },
  {
    id: 'runenkuenstler_runenmeister',
    name: 'Runenmeister',
    class: 'Runenkünstler',
    type: 'passive',
    description: 'Vorteil auf Analyse von unbekannten Runen',
    enlightened: true
  },
  {
    id: 'runenkuenstler_zauberhast',
    name: 'Zauberhast',
    class: 'Runenkünstler',
    type: 'passive',
    description: '+10m Bewegung, wenn du in dieser Runde einen Gegner kampfunfähig gemacht hast. Pro Gegner einmal möglich.'
  },
  {
    id: 'runenkuenstler_runenblick',
    name: 'Runenblick',
    class: 'Runenkünstler',
    type: 'active',
    description: 'Analysiert die Struktur eines unbekannten Spells im Sichtfeld und lernt dessen Struktur auswendig. Manakosten des Zaubers/4',
    actionType: 'Aktion'
  },
  {
    id: 'runenkuenstler_brennender_fokus',
    name: 'Brennender Fokus',
    class: 'Runenkünstler',
    type: 'active',
    description: 'Halbiert Fokus solange aktiv und erhöht Effektivität von allen Zaubern um 50%',
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
    description: 'Kann mit Verbündeten in [Intelligenz*5]m Entfernung telepathisch kommunizieren (mit deren Einverständnis)',
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
    description: 'Übernimmt Kontrolle über Kreatur. Gegnerintelligenz*2 pro Runde, min. 10',
    actionType: 'Aktion'
  },
  {
    id: 'mentalist_abbild',
    name: 'Abbild',
    class: 'Mentalist',
    type: 'active',
    description: 'Kopiere den aktiven Skill einer Person und übertrage ihn zu einer anderen Person, der Skill kann einmalig verwendet werden und ist auf 1 pro Person limitiert',
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
    description: 'Kann bei Körperkontakt Objekte in Beschwörungen verwandeln, das Objekt bleibt in der Beschwörung, solange diese besteht',
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
    description: 'Verwandelt sich in ein anderes Lebewesen, wenn Körperkontakt besteht. Übernimmt keine Skills oder Stats',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'gestaltenwandler_doppelgaenger',
    name: 'Doppelgänger',
    class: 'Gestaltenwandler',
    type: 'active',
    description: 'Beschwört einen Doppelgänger mit identischem Aussehen und teilt Leben, Mana, Ausdauer und Fokus zwischen beiden auf. Stirbt das Original, lebt der Doppelgänger mit halbierten Stats weiter, auf einen gleichzeitig begrenzt',
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
    description: 'Kann pure Unterstützungszauber als Bonusaktion verwenden'
  },
  {
    id: 'paladin_schnelle_hilfe',
    name: 'Schnelle Hilfe',
    class: 'Paladin',
    type: 'passive',
    description: 'Verbündete, die von einem puren Unterstützungszauber getroffen werden, erhalten in ihrem nächsten Zug eine zusätzliche Bonusaktion'
  },
  {
    id: 'paladin_inspiration',
    name: 'Inspiration',
    class: 'Paladin',
    type: 'passive',
    description: 'Nach einem guten Wurf (1-8nat) kann ein Verbündeter ausgewählt werden, der -1 auf seinen nächsten Wurf erhält',
    enlightened: true
  },
  {
    id: 'paladin_gleissendes_licht',
    name: 'Gleißendes Licht',
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
    description: 'Wenn ein Verbündeter in kritischem Zustand ist, erhalte Vorteil auf alle Aktionen, um diesen Verbündeten zu beschützen oder zu heilen.'
  },
  {
    id: 'paladin_erneuerung',
    name: 'Erneuerung',
    class: 'Paladin',
    type: 'active',
    description: 'Repariert einen ausgewählten Gegenstand in der Nähe um 3 D20 Haltbarkeit',
    enlightened: true,
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'paladin_heiliger_sprint',
    name: 'Heiliger Sprint',
    class: 'Paladin',
    type: 'active',
    description: 'Erhalte x4 Bewegung auf Verbündete im kritischen Zustand',
    enlightened: true,
    cost: { type: 'energy', amount: 10 },
    actionType: 'Aktion'
  },

  // ==================== TIER 5 ====================

  // ==================== WÄCHTER ====================
  {
    id: 'waechter_konstitution_4',
    name: 'Konstitution+4',
    class: 'Wächter',
    type: 'stat_bonus',
    description: 'Konstitution+4',
    statBonus: { stat: 'constitution', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'waechter_leibwache',
    name: 'Leibwache',
    class: 'Wächter',
    type: 'passive',
    description: 'Erhalte 2 Reaktionen für Angriffe auf Verbündete in der Nähe'
  },
  {
    id: 'waechter_kenne_deinen_feind',
    name: 'Kenne deinen Feind',
    class: 'Wächter',
    type: 'passive',
    description: 'Nach jedem erfolgreichen Block erhälst du -1 auf alle Angriffe und Blocks gegen diesen Gegner, maximal -3',
    enlightened: true
  },
  {
    id: 'waechter_schildmeister',
    name: 'Schildmeister',
    class: 'Wächter',
    type: 'passive',
    description: '-2 auf Angriffe und Blocks mit Schild',
    enlightened: true
  },
  {
    id: 'waechter_edles_opfer',
    name: 'Edles Opfer',
    class: 'Wächter',
    type: 'passive',
    description: 'Wenn du in den kritischen Zustand fällst, erhalten alle Verbündeten in der Nähe einmal pro Kampf eine Heilung, die der Hälfte deiner Leben entspricht'
  },
  {
    id: 'waechter_beschuetzerinstinkt',
    name: 'Beschützerinstinkt',
    class: 'Wächter',
    type: 'active',
    description: 'Spürt alle Gefahren in der Umgebung auf. Kosten entsprechen dem Aufspürradius in m',
    enlightened: true,
    actionType: 'Aktion'
  },
  {
    id: 'waechter_vergeltungsschlag',
    name: 'Vergeltungsschlag',
    class: 'Wächter',
    type: 'active',
    description: 'Geht in eine defensive Position für die Dauer des Skills, was Bewegung halbiert und nur defensive Aktionen erlaubt. Wird der Skill beendet, wird ein Schlag ausgeführt, dessen Stärke mit dem eingesteckten Schaden skaliert',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },

  // ==================== KOLOSS ====================
  {
    id: 'koloss_konstitution_staerke_2',
    name: 'Konstitution&Stärke+2',
    class: 'Koloss',
    type: 'stat_bonus',
    description: 'Konstitution&Stärke+2',
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
    name: 'Provokante Präsenz',
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
    description: 'Erzeugt Beben im Umkreis. Kosten entsprechen der Hälfte des Radius',
    actionType: 'Aktion'
  },
  {
    id: 'koloss_wahre_groesse',
    name: 'Wahre Größe',
    class: 'Koloss',
    type: 'active',
    description: 'Wird für kurze Zeit viel größer. Kosten entsprechen Größenskalierung*10 pro Runde',
    actionType: 'Bonusaktion'
  },
  {
    id: 'koloss_kolossaler_schlag',
    name: 'Kolossaler Schlag',
    class: 'Koloss',
    type: 'active',
    description: 'Holt für Schlag aus, der mehr Reichweite und Schaden besitzt, je länger ausgeholt wird',
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
    description: 'Gegner, die ihm Schaden zufügen, werden mit geringer Wahrscheinlichkeit verängstigt.',
    enlightened: true
  },
  {
    id: 'omen_vorwarnung',
    name: 'Vorwarnung',
    class: 'Omen',
    type: 'active',
    description: 'Kann eine bereits bekannte Person verfluchen, nach einem Tag wird diese Person von Pech verfolgt. Dieser Effekt wird stärker, je näher der Nutzer zum verfluchten Ziel ist. Kostet 1/4 der gegn. HP',
    actionType: 'Aktion'
  },
  {
    id: 'omen_kraftraub',
    name: 'Kraftraub',
    class: 'Omen',
    type: 'active',
    description: 'Stiehlt die Ausdauer (D20) einer anderen Person in unmittelbarer Nähe und regeneriert den selben Betrag beim Nutzer',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Bonusaktion'
  },
  {
    id: 'omen_schlachtschwur',
    name: 'Schlachtschwur',
    class: 'Omen',
    type: 'active',
    description: 'Solange die Fähigkeit aktiv ist, wird der Schaden gegen den Anwender gespeichert. Wenn er einen Gegner tötet, wird der gespeicherte Schaden wieder geheilt',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'omen_unheilvoller_auftritt',
    name: 'Unheilvoller Auftritt',
    class: 'Omen',
    type: 'active',
    description: 'Bereitet für 3 Runden ein finsteres Ritual an einem Ort in seinem Sichtfeld vor, während denen der Nutzer nichts anderes tun kann. Danach hüllt er diesen Ort in Finsternis und fliegt in sein Zentrum. Alle Gegner im Umkreis werden entweder gelähmt, verängstigt, oder verstummt',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'omen_fluchruestung',
    name: 'Fluchrüstung',
    class: 'Omen',
    type: 'active',
    description: 'Absorbiert alle negativen Effekte aller Personen im Umkreis. Erhält Rüstung mit Stabilität abhängig von der Anzahl und Stärke der absorbierten Effekte für 3 Runden',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },

  // ==================== KRIEGSHERR ====================
  {
    id: 'kriegsherr_staerke_4',
    name: 'Stärke+4',
    class: 'Kriegsherr',
    type: 'stat_bonus',
    description: 'Stärke+4',
    statBonus: { stat: 'strength', amount: 4 },
    infiniteLevel: true
  },
  {
    id: 'kriegsherr_blutrausch',
    name: 'Blutrausch',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Erhalte eine Extra-Aktion, wenn du diese Runde einen Gegner tötest'
  },
  {
    id: 'kriegsherr_wutbewaeltigung',
    name: 'Wutbewältigung',
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
    description: 'Wenn du den ersten Treffer austeilst oder einsteckst, erhalten alle Verbündeten eine Extra-Aktion für ihren nächsten Zug'
  },
  {
    id: 'kriegsherr_lebensmuede',
    name: 'Lebensmüde',
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
    description: 'Greife jeden Gegner um dich herum an, -1 für jeden Gegner in Reichweite',
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
    name: 'Mächtiger Stoß',
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
    name: 'Übertakten',
    class: 'Duellant',
    type: 'active',
    description: 'Greift Gegner an, kann nach einem Treffer eine Extra-Aktion ausführen. (+15 mit jeder weiteren Benutzung in dieser Runde)',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Aktion'
  },
  {
    id: 'duellant_konter',
    name: 'Konter',
    class: 'Duellant',
    type: 'active',
    description: 'Blockt und reflektiert physischen Angriff mit doppelter Stärke',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Reaktion'
  },
  {
    id: 'duellant_schwachstellen_aufdecken',
    name: 'Schwachstellen aufdecken',
    class: 'Duellant',
    type: 'active',
    description: 'Kann Rüstung mit nächstem Angriff ignorieren',
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
    description: 'Geschicklichkeit&Stärke+2',
    statBonuses: [{ stat: 'dexterity', amount: 2 }, { stat: 'strength', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'waffenmeister_waffenmeister',
    name: '+Waffenmeister',
    class: 'Waffenmeister',
    type: 'passive',
    description: 'Waffenvorraussetzungen werden aufgehoben, benötigt "Waffenwissen","Waffenkenner" und "Waffengelehter"',
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
    description: 'Verdreifacht erwürfelte Schmiedepunkte beim Schmieden von Waffen'
  },
  {
    id: 'waffenmeister_ultimativer_stoss',
    name: 'Ultimativer Stoß',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Getroffener Gegner wird zurückgeworfen, maximal 200m, nur für Wuchtwaffen',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'waffenmeister_sturmschnitt',
    name: 'Sturmschnitt',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Erzeugt Schockwelle, die getroffenen Gegnern Schnittwunden zufügt, maximal 50m, nur für Schnittwaffen',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },
  {
    id: 'waffenmeister_panzerbrecher',
    name: 'Panzerbrecher',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Stich, der gegnerische Verteidigung durchbricht, nur für Stichwaffen',
    cost: { type: 'energy', amount: 30 },
    actionType: 'Aktion'
  },

  // ==================== ATTENTÄTER ====================
  {
    id: 'attentaeter_geschicklichkeit_geschwindigkeit_2',
    name: 'Geschicklichkeit&Geschwindigkeit+2',
    class: 'Attentäter',
    type: 'stat_bonus',
    description: 'Geschicklichkeit&Geschwindigkeit+2',
    statBonuses: [{ stat: 'dexterity', amount: 2 }, { stat: 'speed', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'attentaeter_reichweite_50',
    name: 'Reichweite+50m',
    class: 'Attentäter',
    type: 'stat_bonus',
    description: 'Reichweite+50m für Fernkampfwaffen'
  },
  {
    id: 'attentaeter_schattenlaeufer',
    name: 'Schattenläufer',
    class: 'Attentäter',
    type: 'passive',
    description: 'Kann "Schleichen" ohne Ausdauerkosten benutzen',
    enlightened: true,
    requiresSkill: 'dieb_schleichen'
  },
  {
    id: 'attentaeter_verstuemmeln',
    name: 'Verstümmeln',
    class: 'Attentäter',
    type: 'passive',
    description: 'Wird ein Kampf mit einem Überraschungsangriff gestartet, erhält das Ziel des Angriffs +1 auf alle Aktionen bis zum Ende des Kampfes'
  },
  {
    id: 'attentaeter_erfrischender_mord',
    name: 'Erfrischender Mord',
    class: 'Attentäter',
    type: 'passive',
    description: 'Stellt 3 D20 Ausdauer her, wenn Gegner getötet wird'
  },
  {
    id: 'attentaeter_ueberwachung',
    name: 'Überwachung',
    class: 'Attentäter',
    type: 'active',
    description: 'Kann bei Körperkontakt andere Person markieren. Der Anwender kann die Markierung orten, solange sie aktiv ist. Die Markierung kann leicht zerstört werden',
    cost: { type: 'energy', amount: 5, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'attentaeter_blitzschritt',
    name: 'Blitzschritt',
    class: 'Attentäter',
    type: 'active',
    description: 'Verdoppelt Bewegung',
    cost: { type: 'energy', amount: 45, perRound: true },
    actionType: 'Keine Aktion'
  },
  {
    id: 'attentaeter_tragisches_schicksal',
    name: 'Tragisches Schicksal',
    class: 'Attentäter',
    type: 'active',
    description: 'Markiere vor dem Kampf einen Gegner in Sichtweite. +5 auf ersten Angriff gegen ihn als einzelnes Ziel',
    cost: { type: 'energy', amount: 50 },
    actionType: 'Aktion'
  },

  // ==================== TÜFTLER ====================
  {
    id: 'tueftler_intelligenz_geschicklichkeit_2',
    name: 'Intelligenz+Geschicklichkeit+2',
    class: 'Tüftler',
    type: 'stat_bonus',
    description: 'Intelligenz+Geschicklichkeit+2',
    statBonuses: [{ stat: 'intelligence', amount: 2 }, { stat: 'dexterity', amount: 2 }],
    infiniteLevel: true
  },
  {
    id: 'tueftler_mechaniker',
    name: 'Mechaniker',
    class: 'Tüftler',
    type: 'passive',
    description: '-3 auf Bauen & Verständnis von Mechanik',
    enlightened: true
  },
  {
    id: 'tueftler_kalibrierte_geschosse',
    name: 'Kalibrierte Geschosse',
    class: 'Tüftler',
    type: 'passive',
    description: 'Verdoppelt Effizienz von selbst hergestellter Munition, inklusive Zauber'
  },
  {
    id: 'tueftler_runenchirurg',
    name: 'Runenchirurg',
    class: 'Tüftler',
    type: 'passive',
    description: 'Verkleinerte Zauber verlieren nur halb so viel Effizienz'
  },
  {
    id: 'tueftler_raffiniert',
    name: 'Raffiniert',
    class: 'Tüftler',
    type: 'passive',
    description: 'Vorteil auf Zerstörungswurf von eigener Ausrüstung und Zauber und setzt Haltbarkeit nach Kämpfen auf 100 (Ausrüstung) und 10 (Zauber) zurück, wenn es im Kampf unter diesen Wert gefallen ist',
    enlightened: true
  },
  {
    id: 'tueftler_zweiter_atem',
    name: 'Zweiter Atem',
    class: 'Tüftler',
    type: 'active',
    description: 'Erhält eine zusätzliche Bonusaktion für diese Runde. (+15 mit jeder weiteren Benutzung in dieser Runde)',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    actionType: 'Keine Aktion'
  },
  {
    id: 'tueftler_zauberschmiede',
    name: 'Zauberschmiede',
    class: 'Tüftler',
    type: 'active',
    description: 'Verarbeite Materialien in eine gewünschte Form',
    cost: { type: 'energy', amount: 10, perRound: true },
    actionType: 'Aktion'
  },

  // ==================== MANAFÜRST ====================
  {
    id: 'manafuerst_mana_40',
    name: 'Mana+40',
    class: 'Manafürst',
    type: 'stat_bonus',
    description: 'Mana+40',
    statBonus: { stat: 'mana', amount: 40 },
    infiniteLevel: true
  },
  {
    id: 'manafuerst_zauberradius_5',
    name: 'Zauberradius+5m',
    class: 'Manafürst',
    type: 'stat_bonus',
    description: 'Zauberradius+5m',
    enlightened: true,
    statBonus: { stat: 'spellRadius', amount: 5 }
  },
  {
    id: 'manafuerst_runenschmied',
    name: 'Runenschmied',
    class: 'Manafürst',
    type: 'passive',
    description: 'Verwende einen Talentpunkt, um die Effizienz einer Rune in deinem Besitz dauerhaft um 1 D10 zu erhöhen',
    enlightened: true
  },
  {
    id: 'manafuerst_energiewandler',
    name: 'Energiewandler',
    class: 'Manafürst',
    type: 'passive',
    description: '10% der verwendeten Mana werden in latente Energie umgewandelt, die entweder zu Leben, Ausdauer oder Mana für einen Verbündeten konvertiert werden kann',
    enlightened: true
  },
  {
    id: 'manafuerst_arkaner_speicher',
    name: 'Arkaner Speicher',
    class: 'Manafürst',
    type: 'passive',
    description: 'Kann einen Zaubercast speichern, um ihn später zu benutzen, solange das Medium für die Benutzung in der Nähe ist'
  },
  {
    id: 'manafuerst_magieherrschaft',
    name: 'Magieherrschaft',
    class: 'Manafürst',
    type: 'passive',
    description: 'Gegner im Zauberradius erhalten den Malus für Zauber zusätzlich auf ihre Fähigkeiten'
  },
  {
    id: 'manafuerst_zauberautoritaet',
    name: '+Zauberauthorität',
    class: 'Manafürst',
    type: 'active',
    description: 'Erweitert "Zauberbrecher", sodass schwache Zauber absorbiert werden und deine Mana um die Hälfte der Manakosten aufgefüllt wird. Halbiert zusätzlich Ausdauerkosten',
    requiresSkill: 'arkanist_zauberbrecher',
    actionType: 'Aktion'
  },
  {
    id: 'manafuerst_herrschaftsgebiet',
    name: 'Herrschaftsgebiet',
    class: 'Manafürst',
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
    name: 'Totenbeschwörer',
    class: 'Nekromant',
    type: 'passive',
    description: 'Tote Gegner hinterlassen Seelenrunen, die einmalig beschworen werden können. Fähigkeiten, Zauber und 50% der Leben, Ausdauer und Mana der Seele entsprechen denen des Opfers'
  },
  {
    id: 'nekromant_seelenverbindung',
    name: 'Seelenverbindung',
    class: 'Nekromant',
    type: 'passive',
    description: 'Kann beschworene Kreaturen in 50m Radius als Startpunkt für Zauber benutzen, kann über mehrere beschworene Kreaturen verkettet werden, um Reichweite zu erhöhen',
    enlightened: true
  },
  {
    id: 'nekromant_seelenfusion',
    name: 'Seelenfusion',
    class: 'Nekromant',
    type: 'passive',
    description: 'Entfernt Nachteil und -5 bei Infusion einer Seele in einen lebendigen Körper.'
  },
  {
    id: 'nekromant_gestohlene_macht',
    name: 'Gestohlene Macht',
    class: 'Nekromant',
    type: 'passive',
    description: 'Solange eine Leiche beschworen ist, wird die Hälfte ihres Fokus dem Anwender gutgeschrieben (kann maximal den Fokuskosten der Seelenrune entsprechen)'
  },
  {
    id: 'nekromant_unheiliges_ritual',
    name: 'Unheiliges Ritual',
    class: 'Nekromant',
    type: 'active',
    description: 'Zerstöre Seelenrune für Mana, kann Rune danach nicht mehr benutzen. Stellt Mana in Höhe der Effizienz der Rune her',
    enlightened: true,
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },
  {
    id: 'nekromant_maertyrer',
    name: 'Märtyrer',
    class: 'Nekromant',
    type: 'active',
    description: 'Solange die Fähigkeit aktiv ist, werden Verletzungen auf beschworene Leichenseelen in bis zu 10m Entfernung transferiert',
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
    description: 'Kann Fähigkeiten mit Mana anstatt Ausdauer auslösen, kostet 20% mehr',
    enlightened: true
  },
  {
    id: 'orakel_ueberreaktion',
    name: 'Überreaktion',
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
    description: 'Kann Zauber mit Castzeit sofort ausführen, muss den Cast aber nach Abschluss des Zaubers abarbeiten und kann bis dahin keine weiteren Zauber verwenden'
  },
  {
    id: 'orakel_identifizieren',
    name: 'Identifizieren',
    class: 'Orakel',
    type: 'passive',
    description: 'Kann alle Stats von Items sofort erkennen und erhält manchmal Visionen aus deren Vergangenheit',
    enlightened: true
  },
  {
    id: 'orakel_glueckstraehne',
    name: 'Glückssträhne',
    class: 'Orakel',
    type: 'active',
    description: 'Wähle eine Zahl zwischen 1 und 20. Wenn du im Verlauf diesen Kampfes diese Zahl würfelst(ohne Boni), erhalte Vorteil für die nächsten Runden, abhängig davon wie viel du gesetzt hast',
    cost: { type: 'energy', amount: 20, perRound: true },
    actionType: 'Aktion'
  },
  {
    id: 'orakel_schicksal',
    name: 'Schicksal',
    class: 'Orakel',
    type: 'active',
    description: 'Kann ein Würfelergebnis für Verbündete zurücksetzen und neu würfeln lassen oder das eigene Würfelergebnis zurücksetzen und den Zug neu starten',
    cost: { type: 'energy', amount: 20 },
    actionType: 'Aktion'
  },
  {
    id: 'orakel_prophezeiung',
    name: 'Prophezeiung',
    class: 'Orakel',
    type: 'active',
    description: 'Sieh einen zufälligen Moment in bis zu einem Tag in der Zukunft. Nur einmal pro Tag',
    cost: { type: 'energy', amount: 0 },
    actionType: 'Aktion'
  },

  // ==================== DUNKLER RITTER ====================
  {
    id: 'dunkler_ritter_staerke_intelligenz_2',
    name: 'Stärke&Intelligenz+2',
    class: 'Dunkler Ritter',
    type: 'stat_bonus',
    description: 'Stärke&Intelligenz+2',
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
    description: 'Effizienz x2 auf Zauber, die über Ausrüstung oder Waffen als Medium genutzt werden'
  },
  {
    id: 'dunkler_ritter_schattenruestung',
    name: 'Schattenrüstung',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Alle Geschwindgkeitsmali von Rüstungen werden aufgehoben, addiert die Hälfte des Geschwindigkeitsmalus auf den Geschwindigkeitswert',
    cost: { type: 'energy', amount: 15, perRound: true },
    actionType: 'Bonusaktion'
  },
  {
    id: 'dunkler_ritter_dunkler_schnitt',
    name: 'Dunkler Schnitt',
    class: 'Dunkler Ritter',
    type: 'active',
    description: 'Schnitt, der fast alle Waffen und Rüstungen ignoriert, verbraucht 50 Waffenhaltbarkeit',
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
`;

const newContent = keepBefore + newSkills + '];\n' + keepAfter;
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Successfully updated skill-definitions.ts');
console.log('Total length:', newContent.length, 'chars');

// Count skills
const matches = newSkills.match(/id: '/g);
console.log('Total skills:', matches ? matches.length : 0);
