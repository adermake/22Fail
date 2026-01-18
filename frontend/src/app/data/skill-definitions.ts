import { SkillDefinition } from '../model/skill-definition.model';

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // ==================== MAGIER ====================
  {
    id: 'magier_int_1',
    name: 'Intelligenz+1',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+1 Intelligenz',
    statBonus: { stat: 'intelligence', amount: 1 }
  },
  {
    id: 'magier_mana_15',
    name: 'Mana+15',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+15 Mana',
    statBonus: { stat: 'mana', amount: 15 }
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
    description: '+1 auf Zauber mit voller Mana'
  },
  {
    id: 'magier_zauberlehrling',
    name: 'Zauberlehrling',
    class: 'Magier',
    type: 'passive',
    description: '+2 Effektivität auf Zauber'
  },

  // ==================== KAMPFZAUBERER ====================
  {
    id: 'kampfzauberer_int_2',
    name: 'Intelligenz+2',
    class: 'Kampfzauberer',
    type: 'stat_bonus',
    description: '+2 Intelligenz',
    statBonus: { stat: 'intelligence', amount: 2 }
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
    description: 'Lerne einen Zauber auswendig, damit du ihn ohne Medium benutzen kannst. Zauber können jederzeit gewechselt werden, brauchen aber mehrere Stunden.'
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
    description: 'Konvertiert 1x Ausdauer zu 0,8x Mana (wird gerundet)',
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'kampfzauberer_manadisruption',
    name: 'Manadisruption',
    class: 'Kampfzauberer',
    type: 'active',
    description: 'Reduziere den Castwert des Spells eines Gegners in 20m Umfeld um eine gewürfelte Anzahl. Boni für Zaubercasts werden hier auch angewandt.',
    cost: { type: 'mana', amount: 5 },
    bonusAction: true
  },

  // ==================== HEILER ====================
  {
    id: 'heiler_mana_30',
    name: 'Mana+30',
    class: 'Heiler',
    type: 'stat_bonus',
    description: '+30 Mana',
    statBonus: { stat: 'mana', amount: 30 }
  },
  {
    id: 'heiler_gesundheitscheck',
    name: 'Gesundheitscheck',
    class: 'Heiler',
    type: 'passive',
    description: '+4 auf Untersuchung von Gesundheit'
  },
  {
    id: 'heiler_notarzt',
    name: 'Notarzt',
    class: 'Heiler',
    type: 'passive',
    description: '+3 auf alle Heilungswürfe, wenn Ziel im kritischen Zustand ist'
  },
  {
    id: 'heiler_alchemist',
    name: 'Alchemist',
    class: 'Heiler',
    type: 'passive',
    description: '+2 beim Brauen von Tränken mit positivem Effekt'
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
    cost: { type: 'mana', amount: 0 }
  },

  // ==================== ARKANIST ====================
  {
    id: 'arkanist_mana_40',
    name: 'Mana+40',
    class: 'Arkanist',
    type: 'stat_bonus',
    description: '+40 Mana',
    statBonus: { stat: 'mana', amount: 40 }
  },
  {
    id: 'arkanist_zauberradius',
    name: 'Zauberradius+1m',
    class: 'Arkanist',
    type: 'stat_bonus',
    description: '+1m Zauberradius',
    statBonus: { stat: 'spellRadius', amount: 1 }
  },
  {
    id: 'arkanist_managespuer',
    name: 'Managespür',
    class: 'Arkanist',
    type: 'passive',
    description: 'Kann pures Mana spüren'
  },
  {
    id: 'arkanist_verinnerlichen_plus',
    name: '+Verinnerlichen',
    class: 'Arkanist',
    type: 'passive',
    description: 'Besetze je 5 Fokus, um einen zusätzlichen Zauber auswendig zu lernen.',
    requiresSkill: 'kampfzauberer_verinnerlichen'
  },
  {
    id: 'arkanist_schmagied',
    name: 'Schmagied',
    class: 'Arkanist',
    type: 'passive',
    description: 'Halbiert Voraussetzungen von selbst gebauten Zaubern.'
  },
  {
    id: 'arkanist_zauberbrecher',
    name: 'Zauberbrecher',
    class: 'Arkanist',
    type: 'active',
    description: 'Annulliert einen Zauber im Zauberradius, Ausdauerkosten entsprechen den halben Manakosten des Zaubers und kann Ausdauer ins Negative bringen',
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'arkanist_ueberladen',
    name: 'Überladen',
    class: 'Arkanist',
    type: 'active',
    description: 'Nutze einen Zauber mit verdoppelter Voraussetzung und Effektivität.',
    cost: { type: 'mana', amount: 10 }
  },

  // ==================== HÄMOMANT ====================
  {
    id: 'haemomant_leben_40',
    name: 'Leben+40',
    class: 'Hämomant',
    type: 'stat_bonus',
    description: '+40 Leben',
    statBonus: { stat: 'life', amount: 40 }
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
    description: '+1 im Kampf gegen Gegner mit offenen Wunden'
  },
  {
    id: 'haemomant_transfusion',
    name: 'Transfusion',
    class: 'Hämomant',
    type: 'active',
    description: 'Absorbiere umliegendes Blut und heile dich um den gewürfelten Betrag (D8).',
    cost: { type: 'mana', amount: 5 },
    bonusAction: true
  },
  {
    id: 'haemomant_blutecho',
    name: 'Blutecho',
    class: 'Hämomant',
    type: 'active',
    description: 'Absorbiert einen genannten Skill aus gegnerischem Blut und verwende ihn direkt ohne Kosten. Sollte der genannte Skill nicht existieren, wird ein zufälliger Skill ausgewählt. Nur einmal pro Person möglich.',
    cost: { type: 'mana', amount: 20 }
  },
  {
    id: 'haemomant_hypertonie',
    name: 'Hypertonie',
    class: 'Hämomant',
    type: 'active',
    description: '+2 im Kampf',
    cost: { type: 'life', amount: 20, perRound: true }
  },
  {
    id: 'haemomant_aderlass',
    name: 'Aderlass',
    class: 'Hämomant',
    type: 'active',
    description: 'Konvertiert 1x Leben zu 0,8x Mana (wird abgerundet)',
    cost: { type: 'life', amount: 0 }
  },

  // ==================== SEELENFORMER ====================
  {
    id: 'seelenformer_fokus_4',
    name: 'Fokus+4',
    class: 'Seelenformer',
    type: 'stat_bonus',
    description: '+4 Fokus',
    statBonus: { stat: 'focus', amount: 4 }
  },
  {
    id: 'seelenformer_runenkonvergenz',
    name: 'Runenkonvergenz',
    class: 'Seelenformer',
    type: 'passive',
    description: '+1 auf Nutzung von Zaubern die eine Elementarrune beinhalten, die für eine aktive Beschwörung benutzt wurde.'
  },
  {
    id: 'seelenformer_hausgemacht',
    name: 'Hausgemacht',
    class: 'Seelenformer',
    type: 'passive',
    description: 'Senkt Fokuskosten für selbst kreierte Seelenrunen in Beschwörungszaubern um 20%.'
  },
  {
    id: 'seelenformer_seelenwacht',
    name: 'Seelenwacht',
    class: 'Seelenformer',
    type: 'active',
    description: 'Kann Seelen von Tieren analysieren, um sie als Rune zu speichern. Benötigt mehrere Tage intensiver Inspektion.',
    cost: { type: 'mana', amount: 0 }
  },
  {
    id: 'seelenformer_erweitertes_bewusstsein',
    name: 'Erweitertes Bewusstsein',
    class: 'Seelenformer',
    type: 'active',
    description: 'Reduziert Ausdauer auf 0, um den maximalen Fokus zu verdreifachen. Muss deaktiviert werden, um Ausdauer zu regenerieren.',
    cost: { type: 'energy', amount: 30 },
    bonusAction: true
  },
  {
    id: 'seelenformer_adlerauge',
    name: 'Adlerauge',
    class: 'Seelenformer',
    type: 'active',
    description: 'Nutze die Wahrnehmung einer deiner Beschwörungen als deine eigene',
    cost: { type: 'mana', amount: 10, perRound: true }
  },
  {
    id: 'seelenformer_sanktum',
    name: 'Sanktum',
    class: 'Seelenformer',
    type: 'active',
    description: 'Festige die Seele eines Verbündeten, was ihn immun gegen psychische Angriffe macht.',
    cost: { type: 'mana', amount: 10, perRound: true },
    bonusAction: true
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
    description: '+200 Maximaler Castwert',
    statBonus: { stat: 'maxCastValue', amount: 200 }
  },
  {
    id: 'formationsmagier_zauberarchitekt',
    name: 'Zauberarchitekt',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Halbiert Fokuskosten von Zaubern mit einer Voraussetzung von über 100.'
  },
  {
    id: 'formationsmagier_magische_rueckkopplung',
    name: 'Magische Rückkopplung',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Kann objektgebundene Zauber als Bonusaktion verwenden, verbraucht aber x10 Haltbarkeit.'
  },
  {
    id: 'formationsmagier_arkane_resonanz',
    name: 'Arkane Resonanz',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Muss bei Formationen (großen Spells) keine zusätzlichen Manakosten zahlen.'
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
    description: '+10 auf den nächsten Zauber, danach kann einen Tag keine Magie mehr benutzt werden, ignoriert Würfelbonuslimit',
    cost: { type: 'mana', amount: 10 }
  },

  // ==================== KÄMPFER (placeholder) ====================
  {
    id: 'kaempfer_staerke_1',
    name: 'Stärke+1',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: '+1 Stärke',
    statBonus: { stat: 'strength', amount: 1 }
  },
  {
    id: 'kaempfer_leben_20',
    name: 'Leben+20',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: '+20 Leben',
    statBonus: { stat: 'life', amount: 20 }
  },
  {
    id: 'kaempfer_ausdauer_15',
    name: 'Ausdauer+15',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: '+15 Ausdauer',
    statBonus: { stat: 'energy', amount: 15 }
  },

  // ==================== TECHNIKER (placeholder) ====================
  {
    id: 'techniker_geschick_1',
    name: 'Geschicklichkeit+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+1 Geschicklichkeit',
    statBonus: { stat: 'dexterity', amount: 1 }
  },
  {
    id: 'techniker_tempo_1',
    name: 'Tempo+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+1 Tempo',
    statBonus: { stat: 'speed', amount: 1 }
  },
  {
    id: 'techniker_ausdauer_10',
    name: 'Ausdauer+10',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+10 Ausdauer',
    statBonus: { stat: 'energy', amount: 10 }
  },
];

// Get all unique class names from skill definitions
export function getAllClassesFromSkills(): string[] {
  const classes = new Set<string>();
  SKILL_DEFINITIONS.forEach(skill => classes.add(skill.class));
  return Array.from(classes);
}

// Get skills for a specific class
export function getSkillsForClass(className: string): SkillDefinition[] {
  return SKILL_DEFINITIONS.filter(s => s.class === className);
}

// Get skill by ID
export function getSkillById(skillId: string): SkillDefinition | undefined {
  return SKILL_DEFINITIONS.find(s => s.id === skillId);
}
