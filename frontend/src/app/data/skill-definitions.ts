import { SkillDefinition } from '../model/skill-definition.model';

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // ==================== MAGIER ====================
  // Based on original: Intelligenz+1, Mana+15, Fokus+1, (p) Exzellenz, (p) Zauberlehrling
  // None marked with ! so all are NOT enlightened
  {
    id: 'magier_int_1',
    name: 'Intelligenz+1',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+1 Intelligenz',
    enlightened: false,
    statBonus: { stat: 'intelligence', amount: 1 }
  },
  {
    id: 'magier_mana_15',
    name: 'Mana+15',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+15 Mana',
    enlightened: false,
    statBonus: { stat: 'mana', amount: 15 }
  },
  {
    id: 'magier_fokus_1',
    name: 'Fokus+1',
    class: 'Magier',
    type: 'stat_bonus',
    description: '+1 Fokus',
    enlightened: false,
    statBonus: { stat: 'focus', amount: 1 }
  },
  {
    id: 'magier_exzellenz',
    name: 'Exzellenz',
    class: 'Magier',
    type: 'passive',
    description: '+1 auf Zauber mit voller Mana',
    enlightened: false
  },
  {
    id: 'magier_zauberlehrling',
    name: 'Zauberlehrling',
    class: 'Magier',
    type: 'passive',
    description: '+2 Effektivität auf Zauber',
    enlightened: false
  },

  // ==================== KAMPFZAUBERER ====================
  // Based on original: Intelligenz+2, (p) Zauberladung, (p) Verinnerlichen, !(p) Freies Wirken, (a) Manatransfer, (a) Manadisruption (Bonusaktion)
  // Only "Freies Wirken" is enlightened (has !)
  {
    id: 'kampfzauberer_int_2',
    name: 'Intelligenz+2',
    class: 'Kampfzauberer',
    type: 'stat_bonus',
    description: '+2 Intelligenz',
    enlightened: false,
    statBonus: { stat: 'intelligence', amount: 2 }
  },
  {
    id: 'kampfzauberer_zauberladung',
    name: 'Zauberladung',
    class: 'Kampfzauberer',
    type: 'passive',
    description: '+2 beim Würfeln für Zaubercasts',
    enlightened: false
  },
  {
    id: 'kampfzauberer_verinnerlichen',
    name: 'Verinnerlichen',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Lerne einen Zauber auswendig, damit du ihn ohne Medium benutzen kannst. Zauber können jederzeit gewechselt werden, brauchen aber mehrere Stunden.',
    enlightened: false
  },
  {
    id: 'kampfzauberer_freies_wirken',
    name: 'Freies Wirken',
    class: 'Kampfzauberer',
    type: 'passive',
    description: 'Kann sich während eines Zaubercasts bewegen',
    enlightened: true  // Marked with ! in original
  },
  {
    id: 'kampfzauberer_manatransfer',
    name: 'Manatransfer',
    class: 'Kampfzauberer',
    type: 'active',
    description: 'Konvertiert 1x Ausdauer zu 0,8x Mana (wird gerundet)',
    enlightened: false,
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'kampfzauberer_manadisruption',
    name: 'Manadisruption',
    class: 'Kampfzauberer',
    type: 'active',
    description: 'Reduziere den Castwert des Spells eines Gegners in 20m Umfeld um eine gewürfelte Anzahl. Boni für Zaubercasts werden hier auch angewandt.',
    enlightened: false,
    cost: { type: 'mana', amount: 5 },
    bonusAction: true
  },

  // ==================== HEILER ====================
  // Based on original: Mana+30, (p) Gesundheitscheck, (p) Notarzt, (p) Alchemist, !(p) Regenbogen, !(p) Einfachheit, (a) Gruppencast
  // "Regenbogen" and "Einfachheit" are enlightened
  {
    id: 'heiler_mana_30',
    name: 'Mana+30',
    class: 'Heiler',
    type: 'stat_bonus',
    description: '+30 Mana',
    enlightened: false,
    statBonus: { stat: 'mana', amount: 30 }
  },
  {
    id: 'heiler_gesundheitscheck',
    name: 'Gesundheitscheck',
    class: 'Heiler',
    type: 'passive',
    description: '+4 auf Untersuchung von Gesundheit',
    enlightened: false
  },
  {
    id: 'heiler_notarzt',
    name: 'Notarzt',
    class: 'Heiler',
    type: 'passive',
    description: '+3 auf alle Heilungswürfe, wenn Ziel im kritischen Zustand ist',
    enlightened: false
  },
  {
    id: 'heiler_alchemist',
    name: 'Alchemist',
    class: 'Heiler',
    type: 'passive',
    description: '+2 beim Brauen von Tränken mit positivem Effekt',
    enlightened: false
  },
  {
    id: 'heiler_regenbogen',
    name: 'Regenbogen',
    class: 'Heiler',
    type: 'passive',
    description: 'Manakosten -20% auf pure Heilzauber',
    enlightened: true  // Marked with ! in original
  },
  {
    id: 'heiler_einfachheit',
    name: 'Einfachheit',
    class: 'Heiler',
    type: 'passive',
    description: '-2 Voraussetzung auf Heilzauber',
    enlightened: true  // Marked with ! in original
  },
  {
    id: 'heiler_gruppencast',
    name: 'Gruppencast',
    class: 'Heiler',
    type: 'active',
    description: 'Helfe einem Verbündeten beim Zaubercast, indem du für seinen Castwert würfelst. Boni für Zaubercasts werden hier auch angewandt.',
    enlightened: false,
    cost: { type: 'mana', amount: 0 }
  },

  // ==================== ARKANIST ====================
  // Based on original: Mana+40, Zauberradius+1m, (p) Managespür, (p) +Verinnerlichen, !(p) Schmagied, (a) Zauberbrecher, (a) Überladen
  // "Schmagied" is enlightened
  {
    id: 'arkanist_mana_40',
    name: 'Mana+40',
    class: 'Arkanist',
    type: 'stat_bonus',
    description: '+40 Mana',
    enlightened: false,
    statBonus: { stat: 'mana', amount: 40 }
  },
  {
    id: 'arkanist_zauberradius',
    name: 'Zauberradius+1m',
    class: 'Arkanist',
    type: 'stat_bonus',
    description: '+1m Zauberradius',
    enlightened: false,
    statBonus: { stat: 'spellRadius', amount: 1 }
  },
  {
    id: 'arkanist_managespuer',
    name: 'Managespür',
    class: 'Arkanist',
    type: 'passive',
    description: 'Kann pures Mana spüren',
    enlightened: false
  },
  {
    id: 'arkanist_verinnerlichen_plus',
    name: '+Verinnerlichen',
    class: 'Arkanist',
    type: 'passive',
    description: 'Besetze je 5 Fokus, um einen zusätzlichen Zauber auswendig zu lernen.',
    enlightened: false,
    requiresSkill: 'kampfzauberer_verinnerlichen'
  },
  {
    id: 'arkanist_schmagied',
    name: 'Schmagied',
    class: 'Arkanist',
    type: 'passive',
    description: 'Halbiert Voraussetzungen von selbst gebauten Zaubern.',
    enlightened: true  // Marked with ! in original
  },
  {
    id: 'arkanist_zauberbrecher',
    name: 'Zauberbrecher',
    class: 'Arkanist',
    type: 'active',
    description: 'Annulliert einen Zauber im Zauberradius, Ausdauerkosten entsprechen den halben Manakosten des Zaubers und kann Ausdauer ins Negative bringen',
    enlightened: false,
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'arkanist_ueberladen',
    name: 'Überladen',
    class: 'Arkanist',
    type: 'active',
    description: 'Nutze einen Zauber mit verdoppelter Voraussetzung und Effektivität.',
    enlightened: false,
    cost: { type: 'mana', amount: 10 }
  },

  // ==================== HÄMONANT ====================
  // Based on original: Leben+40, (p) Magisches Blut, (p) Kaltblütig, (a) Transfusion (Bonusaktion), (a) Blutecho, !(a) Hypertonie, !(a) Aderlass
  // "Hypertonie" and "Aderlass" are enlightened
  {
    id: 'haemonant_leben_40',
    name: 'Leben+40',
    class: 'Hämonant',
    type: 'stat_bonus',
    description: '+40 Leben',
    enlightened: false,
    statBonus: { stat: 'life', amount: 40 }
  },
  {
    id: 'haemonant_magisches_blut',
    name: 'Magisches Blut',
    class: 'Hämonant',
    type: 'passive',
    description: 'Kann eigenes Blut als Startpunkt für Zauber benutzen',
    enlightened: false
  },
  {
    id: 'haemonant_kaltbluetig',
    name: 'Kaltblütig',
    class: 'Hämonant',
    type: 'passive',
    description: '+1 im Kampf gegen Gegner mit offenen Wunden',
    enlightened: false
  },
  {
    id: 'haemonant_transfusion',
    name: 'Transfusion',
    class: 'Hämonant',
    type: 'active',
    description: 'Absorbiere umliegendes Blut und heile dich um den gewürfelten Betrag (D8).',
    enlightened: false,
    cost: { type: 'mana', amount: 5 },
    bonusAction: true
  },
  {
    id: 'haemonant_blutecho',
    name: 'Blutecho',
    class: 'Hämonant',
    type: 'active',
    description: 'Absorbiert einen genannten Skill aus gegnerischem Blut und verwende ihn direkt ohne Kosten. Sollte der genannte Skill nicht existieren, wird ein zufälliger Skill ausgewählt. Nur einmal pro Person möglich.',
    enlightened: false,
    cost: { type: 'mana', amount: 20 }
  },
  {
    id: 'haemonant_hypertonie',
    name: 'Hypertonie',
    class: 'Hämonant',
    type: 'active',
    description: '+2 im Kampf',
    enlightened: true,  // Marked with ! in original
    cost: { type: 'life', amount: 20, perRound: true }
  },
  {
    id: 'haemonant_aderlass',
    name: 'Aderlass',
    class: 'Hämonant',
    type: 'active',
    description: 'Konvertiert 1x Leben zu 0,8x Mana (wird abgerundet)',
    enlightened: true,  // Marked with ! in original
    cost: { type: 'life', amount: 0 }
  },

  // ==================== SEELENMAGIER ====================
  // Based on original: Fokus+4, (p) Runenkonvergenz, !(p) Hausgemacht, (a) Seelenwacht, (a) Erweitertes Bewusstsein (Bonusaktion), (a) Adlerauge, !(a) Sanktum (Bonusaktion)
  // "Hausgemacht" and "Sanktum" are enlightened
  {
    id: 'seelenmagier_fokus_4',
    name: 'Fokus+4',
    class: 'Seelenmagier',
    type: 'stat_bonus',
    description: '+4 Fokus',
    enlightened: false,
    statBonus: { stat: 'focus', amount: 4 }
  },
  {
    id: 'seelenmagier_runenkonvergenz',
    name: 'Runenkonvergenz',
    class: 'Seelenmagier',
    type: 'passive',
    description: '+1 auf Nutzung von Zaubern die eine Elementarrune beinhalten, die für eine aktive Beschwörung benutzt wurde.',
    enlightened: false
  },
  {
    id: 'seelenmagier_hausgemacht',
    name: 'Hausgemacht',
    class: 'Seelenmagier',
    type: 'passive',
    description: 'Senkt Fokuskosten für selbst kreierte Seelenrunen in Beschwörungszaubern um 20%.',
    enlightened: true  // Marked with ! in original
  },
  {
    id: 'seelenmagier_seelenwacht',
    name: 'Seelenwacht',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Kann Seelen von Tieren analysieren, um sie als Rune zu speichern. Benötigt mehrere Tage intensiver Inspektion.',
    enlightened: false,
    cost: { type: 'mana', amount: 0 }
  },
  {
    id: 'seelenmagier_erweitertes_bewusstsein',
    name: 'Erweitertes Bewusstsein',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Reduziert Ausdauer auf 0, um den maximalen Fokus zu verdreifachen. Muss deaktiviert werden, um Ausdauer zu regenerieren.',
    enlightened: false,
    cost: { type: 'energy', amount: 30 },
    bonusAction: true
  },
  {
    id: 'seelenmagier_adlerauge',
    name: 'Adlerauge',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Nutze die Wahrnehmung einer deiner Beschwörungen als deine eigene',
    enlightened: false,
    cost: { type: 'mana', amount: 10, perRound: true }
  },
  {
    id: 'seelenmagier_sanktum',
    name: 'Sanktum',
    class: 'Seelenmagier',
    type: 'active',
    description: 'Festige die Seele eines Verbündeten, was ihn immun gegen psychische Angriffe macht.',
    enlightened: true,  // Marked with ! in original
    cost: { type: 'mana', amount: 10, perRound: true },
    bonusAction: true
  },

  // ==================== FORMATIONSMAGIER ====================
  // Based on original: Fokus+5, Maximaler Castwert+200, (p) Zauberarchitekt, !(p) Magische Rückkopplung, !(p) Arkane Resonanz, (p) Vorbereiten, (a) Dunkles Siegel
  // "Magische Rückkopplung" and "Arkane Resonanz" are enlightened
  {
    id: 'formationsmagier_fokus_5',
    name: 'Fokus+5',
    class: 'Formationsmagier',
    type: 'stat_bonus',
    description: '+5 Fokus',
    enlightened: false,
    statBonus: { stat: 'focus', amount: 5 }
  },
  {
    id: 'formationsmagier_max_castwert',
    name: 'Maximaler Castwert+200',
    class: 'Formationsmagier',
    type: 'stat_bonus',
    description: '+200 Maximaler Castwert',
    enlightened: false,
    statBonus: { stat: 'maxCastValue', amount: 200 }
  },
  {
    id: 'formationsmagier_zauberarchitekt',
    name: 'Zauberarchitekt',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Halbiert Fokuskosten von Zaubern mit einer Voraussetzung von über 100.',
    enlightened: false
  },
  {
    id: 'formationsmagier_magische_rueckkopplung',
    name: 'Magische Rückkopplung',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Kann objektgebundene Zauber als Bonusaktion verwenden, verbraucht aber x10 Haltbarkeit.',
    enlightened: true  // Marked with ! in original
  },
  {
    id: 'formationsmagier_arkane_resonanz',
    name: 'Arkane Resonanz',
    class: 'Formationsmagier',
    type: 'passive',
    description: 'Muss bei Formationen (großen Spells) keine zusätzlichen Manakosten zahlen.',
    enlightened: true  // Marked with ! in original
  },
  {
    id: 'formationsmagier_vorbereiten',
    name: 'Vorbereiten',
    class: 'Formationsmagier',
    type: 'passive',
    description: '+5 beim Würfeln für Zaubercasts, deren Maximum bei 50 oder höher liegt',
    enlightened: false
  },
  {
    id: 'formationsmagier_dunkles_siegel',
    name: 'Dunkles Siegel',
    class: 'Formationsmagier',
    type: 'active',
    description: '+10 auf den nächsten Zauber, danach kann einen Tag keine Magie mehr benutzt werden, ignoriert Würfelbonuslimit',
    enlightened: false,
    cost: { type: 'mana', amount: 10 }
  },

  // ==================== KÄMPFER ====================
  {
    id: 'kaempfer_staerke_1',
    name: 'Stärke+1',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: '+1 Stärke',
    enlightened: false,
    statBonus: { stat: 'strength', amount: 1 }
  },
  {
    id: 'kaempfer_konstitution_1',
    name: 'Konstitution+1',
    class: 'Kämpfer',
    type: 'stat_bonus',
    description: '+1 Konstitution',
    enlightened: false,
    statBonus: { stat: 'constitution', amount: 1 }
  },
  {
    id: 'kaempfer_schwere_waffen_werfen',
    name: 'Schwere Waffen werfen+1',
    class: 'Kämpfer',
    type: 'passive',
    description: '+1 auf Schwere Waffen werfen',
    enlightened: false
  },
  {
    id: 'kaempfer_backpacker',
    name: 'Backpacker',
    class: 'Kämpfer',
    type: 'passive',
    description: '+30 Inventarkapazität',
    enlightened: false
  },
  {
    id: 'kaempfer_fester_stand',
    name: 'Fester Stand',
    class: 'Kämpfer',
    type: 'passive',
    description: '+1 gegen Rückstoß',
    enlightened: false
  },

  // ==================== TECHNIKER ====================
  {
    id: 'techniker_geschick_1',
    name: 'Geschicklichkeit+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+1 Geschicklichkeit',
    enlightened: false,
    statBonus: { stat: 'dexterity', amount: 1 }
  },
  {
    id: 'techniker_tempo_1',
    name: 'Geschwindigkeit+1',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+1 Geschwindigkeit',
    enlightened: false,
    statBonus: { stat: 'speed', amount: 1 }
  },
  {
    id: 'techniker_ausdauer_15',
    name: 'Ausdauer+15',
    class: 'Techniker',
    type: 'stat_bonus',
    description: '+15 Ausdauer',
    enlightened: false,
    statBonus: { stat: 'energy', amount: 15 }
  },
  {
    id: 'techniker_springen',
    name: 'Springen+2',
    class: 'Techniker',
    type: 'passive',
    description: '+2 auf Springen',
    enlightened: false
  },
  {
    id: 'techniker_leichte_waffen_werfen',
    name: 'Leichte Waffen werfen+1',
    class: 'Techniker',
    type: 'passive',
    description: '+1 auf Leichte Waffen werfen',
    enlightened: false
  },

  // ==================== KRIEGER ====================
  {
    id: 'krieger_konstitution_2',
    name: 'Konstitution+2',
    class: 'Krieger',
    type: 'stat_bonus',
    description: '+2 Konstitution',
    enlightened: false,
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
    description: '+1, um aus Bewusstlosigkeit zu erwachen',
    enlightened: false
  },
  {
    id: 'krieger_aetherkraft',
    name: 'Ätherkraft',
    class: 'Krieger',
    type: 'active',
    description: 'Halbiert Schaden. 10 Mana pro Runde',
    enlightened: false,
    cost: { type: 'mana', amount: 10, perRound: true }
  },
  {
    id: 'krieger_schwerer_schlag',
    name: 'Schwerer Schlag',
    class: 'Krieger',
    type: 'active',
    description: 'Schlag mit hoher Stärke, muss eine Runde ausholen',
    enlightened: true,
    cost: { type: 'energy', amount: 20 }
  },
  {
    id: 'krieger_defensive_haltung',
    name: 'Defensive Haltung',
    class: 'Krieger',
    type: 'active',
    description: 'Reduziert erlittenen Schaden von Fernkampfwaffen stark, kann aber nicht angreifen, 20 pro Runde',
    enlightened: false,
    cost: { type: 'energy', amount: 20, perRound: true }
  },

  // ==================== BARBAR ====================
  {
    id: 'barbar_staerke_2',
    name: 'Stärke+2',
    class: 'Barbar',
    type: 'stat_bonus',
    description: '+2 Stärke',
    enlightened: false,
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'barbar_ruecksichtslos',
    name: 'Rücksichtslos',
    class: 'Barbar',
    type: 'passive',
    description: 'Stärke+4 bei weniger als 5 Rüstungsmalus',
    enlightened: false
  },
  {
    id: 'barbar_blutlust',
    name: 'Blutlust',
    class: 'Barbar',
    type: 'passive',
    description: '+1 auf Angriffe für jeden getöten Gegner, hält für den Rest des Kampfes, maximal +3',
    enlightened: false
  },
  {
    id: 'barbar_muskelprotz',
    name: 'Muskelprotz',
    class: 'Barbar',
    type: 'passive',
    description: '+1 auf Angriffe mit schweren Waffen',
    enlightened: true
  },
  {
    id: 'barbar_waffenweitwurf',
    name: 'Waffenweitwurf',
    class: 'Barbar',
    type: 'active',
    description: 'Wirft schwere Waffe mit hoher Genauigkeit auf weit entfernte Gegner, maximal 50m',
    enlightened: true,
    cost: { type: 'energy', amount: 25 }
  },
  {
    id: 'barbar_kampfschrei',
    name: 'Kampfschrei',
    class: 'Barbar',
    type: 'active',
    description: 'Erhöht Bewegung aller Verbündeter um 3 in der Nähe für einen Zug. Bonusaktion',
    enlightened: false,
    cost: { type: 'energy', amount: 10 },
    bonusAction: true
  },

  // ==================== DIEB ====================
  {
    id: 'dieb_tempo_2',
    name: 'Geschwindigkeit+2',
    class: 'Dieb',
    type: 'stat_bonus',
    description: '+2 Geschwindigkeit',
    enlightened: false,
    statBonus: { stat: 'speed', amount: 2 }
  },
  {
    id: 'dieb_stehlen',
    name: 'Stehlen+2',
    class: 'Dieb',
    type: 'passive',
    description: '+2 auf Stehlen',
    enlightened: false
  },
  {
    id: 'dieb_fliehen',
    name: 'Fliehen+2',
    class: 'Dieb',
    type: 'passive',
    description: '+2 auf Fliehen',
    enlightened: false
  },
  {
    id: 'dieb_schloesser_knacken',
    name: 'Schlösser knacken+2',
    class: 'Dieb',
    type: 'passive',
    description: '+2 auf Schlösser knacken',
    enlightened: false
  },
  {
    id: 'dieb_feinmotoriker',
    name: 'Feinmotoriker',
    class: 'Dieb',
    type: 'passive',
    description: '+1 auf Angriffe mit leichten Waffen',
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
    type: 'passive',
    description: '+2 auf Wert abschätzen',
    enlightened: true
  },
  {
    id: 'dieb_schleichen',
    name: 'Schleichen',
    class: 'Dieb',
    type: 'active',
    description: 'Bewegung, die von Gegnern schwer entdeckt werden kann, 10 pro Runde',
    enlightened: true,
    cost: { type: 'energy', amount: 10, perRound: true }
  },

  // ==================== SCHÜTZE ====================
  {
    id: 'schuetze_geschick_2',
    name: 'Geschicklichkeit+2',
    class: 'Schütze',
    type: 'stat_bonus',
    description: '+2 Geschicklichkeit',
    enlightened: false,
    statBonus: { stat: 'dexterity', amount: 2 }
  },
  {
    id: 'schuetze_reichweite',
    name: 'Reichweite+10m',
    class: 'Schütze',
    type: 'passive',
    description: '+10m Reichweite für Fernkampfwaffen',
    enlightened: false
  },
  {
    id: 'schuetze_waffenwissen',
    name: 'Waffenwissen',
    class: 'Schütze',
    type: 'passive',
    description: 'Waffenvorraussetzung-4 für Fernkampfwaffen',
    enlightened: true
  },
  {
    id: 'schuetze_adlerauge',
    name: 'Adlerauge',
    class: 'Schütze',
    type: 'passive',
    description: '+1 im Fernkampf',
    enlightened: false
  },
  {
    id: 'schuetze_geschaerfte_sinne',
    name: 'Geschärfte Sinne',
    class: 'Schütze',
    type: 'passive',
    description: '+2 auf alle Aktionen außerhalb von Kämpfen, die gute Sehkraft vorraussetzen',
    enlightened: true
  },
  {
    id: 'schuetze_aetherfeuer',
    name: 'Ätherfeuer',
    class: 'Schütze',
    type: 'active',
    description: 'Führe eine weitere Aktion aus. Bonusaktion',
    enlightened: false,
    cost: { type: 'mana', amount: 20 },
    bonusAction: true
  },
  {
    id: 'schuetze_zielschuss',
    name: 'Zielschuss',
    class: 'Schütze',
    type: 'active',
    description: 'Schuss mit doppelter Reichweite und Schaden',
    enlightened: false,
    cost: { type: 'energy', amount: 25 }
  },

  // ==================== RITTER ====================
  {
    id: 'ritter_leben_20',
    name: 'Leben+20',
    class: 'Ritter',
    type: 'stat_bonus',
    description: '+20 Leben',
    enlightened: false,
    statBonus: { stat: 'life', amount: 20 }
  },
  {
    id: 'ritter_reiten',
    name: 'Reiten+2',
    class: 'Ritter',
    type: 'passive',
    description: '+2 auf Reiten',
    enlightened: false
  },
  {
    id: 'ritter_parieren',
    name: 'Parieren+1',
    class: 'Ritter',
    type: 'passive',
    description: '+1 auf Parieren',
    enlightened: false
  },
  {
    id: 'ritter_ruestungsnegation',
    name: 'Rüstungsnegation+5',
    class: 'Ritter',
    type: 'passive',
    description: '+5 Rüstungsnegation',
    enlightened: false
  },
  {
    id: 'ritter_tierfreund',
    name: 'Tierfreund',
    class: 'Ritter',
    type: 'passive',
    description: '+2 im Umgang mit Tieren',
    enlightened: true
  },
  {
    id: 'ritter_ritterschwur',
    name: 'Ritterschwur',
    class: 'Ritter',
    type: 'passive',
    description: '+2 auf Reaktionen, die gegnerische Angriffe auf Verbündete blocken',
    enlightened: true
  },
  {
    id: 'ritter_schwere_ruestung',
    name: 'Schwere Rüstung',
    class: 'Ritter',
    type: 'active',
    description: 'Negiert Schaden und wandelt ihn zu doppeltem Rüstungsschaden um',
    enlightened: false,
    cost: { type: 'energy', amount: 10, perRound: true }
  },
  {
    id: 'ritter_schildstoss',
    name: 'Schildstoß',
    class: 'Ritter',
    type: 'active',
    description: 'Angriff mit Schild, hoher Rückstoß',
    enlightened: true,
    cost: { type: 'energy', amount: 10 }
  },
  {
    id: 'ritter_reitstoss',
    name: 'Reitstoß',
    class: 'Ritter',
    type: 'active',
    description: 'Durchbohrender Angriff auf dem Pferd, +5 auf Zerstörung einer brüchigen Waffe',
    enlightened: false,
    cost: { type: 'energy', amount: 20 }
  },

  // ==================== MÖNCH ====================
  {
    id: 'moench_konstitution_3',
    name: 'Konstitution+3',
    class: 'Mönch',
    type: 'stat_bonus',
    description: '+3 Konstitution',
    enlightened: false,
    statBonus: { stat: 'constitution', amount: 3 }
  },
  {
    id: 'moench_goettlicher_segen',
    name: 'Göttlicher Segen',
    class: 'Mönch',
    type: 'passive',
    description: 'Pechresistenz',
    enlightened: false
  },
  {
    id: 'moench_fokussierte_schlaege',
    name: 'Fokussierte Schläge',
    class: 'Mönch',
    type: 'passive',
    description: '+3 bei Angriffen auf Gegenstände',
    enlightened: false
  },
  {
    id: 'moench_waffenloser_kampf',
    name: 'Waffenloser Kampf',
    class: 'Mönch',
    type: 'passive',
    description: '+2 im Kampf ohne Waffen (außer Handschuhe)',
    enlightened: false
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
    enlightened: false,
    cost: { type: 'energy', amount: 20 }
  },
  {
    id: 'moench_meditation',
    name: 'Meditation',
    class: 'Mönch',
    type: 'active',
    description: 'Stellt pro Zug 5 Mana her',
    enlightened: true,
    cost: { type: 'energy', amount: 0 }
  },

  // ==================== BERSERKER ====================
  {
    id: 'berserker_staerke_2',
    name: 'Stärke+2',
    class: 'Berserker',
    type: 'stat_bonus',
    description: '+2 Stärke',
    enlightened: false,
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'berserker_notfallstaerke',
    name: 'Notfallstärke',
    class: 'Berserker',
    type: 'passive',
    description: '+1 im Kampf je 40 fehlende Leben, maximal +5',
    enlightened: true
  },
  {
    id: 'berserker_kriegsschrei',
    name: 'Kriegsschrei',
    class: 'Berserker',
    type: 'passive',
    description: 'Mit jedem getöten Gegner wird "Kampfschrei" ausgelöst',
    enlightened: false
  },
  {
    id: 'berserker_unsterblicher_krieger',
    name: 'Unsterblicher Krieger',
    class: 'Berserker',
    type: 'passive',
    description: 'Heilt Leben um 3 D20, wenn Gegner getötet wird',
    enlightened: false
  },
  {
    id: 'berserker_adrenalin',
    name: 'Adrenalin',
    class: 'Berserker',
    type: 'passive',
    description: 'Immun gegen negative Statuseffekte im Ragemodus',
    enlightened: false
  },
  {
    id: 'berserker_rage',
    name: 'Rage',
    class: 'Berserker',
    type: 'active',
    description: 'Wird in den Ragemodus versetzt. Bonusaktion',
    enlightened: false,
    cost: { type: 'energy', amount: 5 },
    bonusAction: true
  },
  {
    id: 'berserker_wuetender_wurf',
    name: 'Wütender Wurf',
    class: 'Berserker',
    type: 'active',
    description: 'Wirft einen Gegner bis zu 50m weit',
    enlightened: true,
    cost: { type: 'energy', amount: 30 }
  },
  {
    id: 'berserker_erbarmungslosigkeit',
    name: 'Erbarmunglosigkeit',
    class: 'Berserker',
    type: 'passive',
    description: 'Für Züge in denen angegriffen wurde bleibt Rage bestehen',
    enlightened: true
  },

  // ==================== PLÜNDERER ====================
  {
    id: 'pluenderer_charisma_2',
    name: 'Charisma+2',
    class: 'Plünderer',
    type: 'stat_bonus',
    description: '+2 Charisma',
    enlightened: false,
    statBonus: { stat: 'chill', amount: 2 }
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
    description: 'Erhält 50% mehr Geld durch Loot und Verkäufe',
    enlightened: false
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
    id: 'pluenderer_raeuerbande',
    name: 'Räuberbande',
    class: 'Plünderer',
    type: 'passive',
    description: '+1 im Kampf, wenn deine Gruppe in Überzahl ist',
    enlightened: true
  },
  {
    id: 'pluenderer_pluendern',
    name: 'Plündern',
    class: 'Plünderer',
    type: 'active',
    description: 'Schlag, der dem Gegner Geld stiehlt (D20)',
    enlightened: false,
    cost: { type: 'energy', amount: 10 }
  },

  // ==================== JÄGER ====================
  {
    id: 'jaeger_geschick_3',
    name: 'Geschicklichkeit+3',
    class: 'Jäger',
    type: 'stat_bonus',
    description: '+3 Geschicklichkeit',
    enlightened: false,
    statBonus: { stat: 'dexterity', amount: 3 }
  },
  {
    id: 'jaeger_klettern',
    name: 'Klettern+2',
    class: 'Jäger',
    type: 'passive',
    description: '+2 auf Klettern',
    enlightened: false
  },
  {
    id: 'jaeger_verstecken',
    name: 'Verstecken+2',
    class: 'Jäger',
    type: 'passive',
    description: '+2 auf Verstecken',
    enlightened: false
  },
  {
    id: 'jaeger_fallen_stellen',
    name: 'Fallen stellen+2',
    class: 'Jäger',
    type: 'passive',
    description: '+2 auf Fallen stellen',
    enlightened: false
  },
  {
    id: 'jaeger_dynamisches_schiessen',
    name: 'Dynamisches Schießen',
    class: 'Jäger',
    type: 'passive',
    description: 'Kann während dem Laufen ohne Malus schießen',
    enlightened: false
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
    description: 'Fernkampfprojektile können in der Luft die Richtung ändern',
    enlightened: false
  },

  // ==================== ERZRITTER ====================
  {
    id: 'erzritter_konstitution_4',
    name: 'Konstitution+4',
    class: 'Erzritter',
    type: 'stat_bonus',
    description: '+4 Konstitution',
    enlightened: false,
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
    description: '+2 auf Angriffe wenn auf einem Reittier',
    enlightened: false
  },
  {
    id: 'erzritter_unzerbrechliche_ruestung',
    name: 'Unzerbrechliche Rüstung',
    class: 'Erzritter',
    type: 'passive',
    description: 'Halbiert Rüstungsschaden',
    enlightened: false
  },
  {
    id: 'erzritter_volle_wucht',
    name: 'Volle Wucht',
    class: 'Erzritter',
    type: 'active',
    description: 'Rammangriff, der mit Rüstungsgewicht skaliert',
    enlightened: true,
    cost: { type: 'energy', amount: 15 }
  },
  {
    id: 'erzritter_schwerer_panzer',
    name: 'Schwerer Panzer',
    class: 'Erzritter',
    type: 'passive',
    description: '"Schwere Rüstung" ist dauerhaft aktiv und kostet keine Ausdauer. Kann deaktiviert werden.',
    enlightened: false,
    requiresSkill: 'ritter_schwere_ruestung'
  },
  {
    id: 'erzritter_ruestungsschmied',
    name: 'Rüstungsschmied',
    class: 'Erzritter',
    type: 'passive',
    description: 'Verdreifacht erwürfelte Schmiedepunkte beim Schmieden von Rüstung',
    enlightened: false
  },
  {
    id: 'erzritter_magische_ausruestung',
    name: 'Magische Ausrüstung',
    class: 'Erzritter',
    type: 'active',
    description: 'Rüstung wird magisch an- und ausgerüstet',
    enlightened: false,
    cost: { type: 'mana', amount: 5 }
  },

  // ==================== TEMPLER ====================
  {
    id: 'templer_tempo_4',
    name: 'Geschwindigkeit+4',
    class: 'Templer',
    type: 'stat_bonus',
    description: '+4 Geschwindigkeit',
    enlightened: false,
    statBonus: { stat: 'speed', amount: 4 }
  },
  {
    id: 'templer_verlaengerter_arm',
    name: 'Verlängerter Arm',
    class: 'Templer',
    type: 'passive',
    description: 'Stäbe zählen für "Waffenloser Kampf"',
    enlightened: false,
    requiresSkill: 'moench_waffenloser_kampf'
  },
  {
    id: 'templer_chakrawissen',
    name: 'Chakrawissen',
    class: 'Templer',
    type: 'passive',
    description: '"Chakra-Blockade" kann für jeden Angriff ohne Kosten aktiviert werden',
    enlightened: false,
    requiresSkill: 'moench_chakra_blockade'
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
    description: 'Kann bei Schaden anstatt Leben 150% des Schadens als Ausdauer verlieren',
    enlightened: true
  },
  {
    id: 'templer_laehmung',
    name: 'Lähmung',
    class: 'Templer',
    type: 'active',
    description: 'Angriff, der Gegner komplett lähmt',
    enlightened: false,
    cost: { type: 'energy', amount: 30 }
  },
  {
    id: 'templer_absolute_kontrolle',
    name: 'Absolute Kontrolle',
    class: 'Templer',
    type: 'active',
    description: 'Kann jeden Gegner in Reichweite mit Nahkampfwaffe einmal pro Runde angreifen, -1 je Angriff nach dem Ersten',
    enlightened: true,
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'templer_kraft_aus_inneren',
    name: 'Kraft aus dem Inneren',
    class: 'Templer',
    type: 'active',
    description: 'Nach Kanalisierung 10 HP Heilung pro Zug und Bewegung+5, Buffdauer entspricht Kanalisierungsdauer',
    enlightened: true,
    cost: { type: 'energy', amount: 10 }
  },

  // ==================== KLINGENTÄNZER ====================
  {
    id: 'klingentaenzer_tempo_4',
    name: 'Geschwindigkeit+4',
    class: 'Klingentänzer',
    type: 'stat_bonus',
    description: '+4 Geschwindigkeit',
    enlightened: false,
    statBonus: { stat: 'speed', amount: 4 }
  },
  {
    id: 'klingentaenzer_waffen_werfen',
    name: 'Waffen werfen+2',
    class: 'Klingentänzer',
    type: 'passive',
    description: '+2 auf Waffen werfen',
    enlightened: false
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
    description: '+1 auf den ersten Angriff mit einer Waffe. Erneuert sich, wenn Waffe min. 1m von dir entfernt ist oder in dieser Runde aufgehoben wurde',
    enlightened: false
  },
  {
    id: 'klingentaenzer_akrobat',
    name: 'Akrobat',
    class: 'Klingentänzer',
    type: 'passive',
    description: '+3 Bewegung auf Waffen zu, die momentan niemand hält',
    enlightened: false
  },
  {
    id: 'klingentaenzer_unantastbar',
    name: 'Unantastbar',
    class: 'Klingentänzer',
    type: 'passive',
    description: 'Nach einer Killbeteiligung kann in der nächsten Runde einem Angriff ausgewichen werden',
    enlightened: true
  },
  {
    id: 'klingentaenzer_fliegender_kick',
    name: 'Fliegender Kick',
    class: 'Klingentänzer',
    type: 'active',
    description: 'Leichte Waffen, die sich in der Luft befinden, können auf Gegner gekickt werden. Kann auch als Reaktion genutzt werden',
    enlightened: false,
    cost: { type: 'energy', amount: 10 }
  },
  {
    id: 'klingentaenzer_klingenwirbel',
    name: 'Klingenwirbel',
    class: 'Klingentänzer',
    type: 'active',
    description: 'Wirf eine leichte Waffe mit so viel Drall, dass sie nächste Runde zurückkehrt, 5 pro Runde',
    enlightened: true,
    cost: { type: 'energy', amount: 5, perRound: true }
  },

  // ==================== ASSASSINE ====================
  {
    id: 'assassine_ausdauer_40',
    name: 'Ausdauer+40',
    class: 'Assassine',
    type: 'stat_bonus',
    description: '+40 Ausdauer',
    enlightened: false,
    statBonus: { stat: 'energy', amount: 40 }
  },
  {
    id: 'assassine_gnadenstoss',
    name: 'Gnadenstoß',
    class: 'Assassine',
    type: 'passive',
    description: '+2 auf Angriffe gegen vergiftete Gegner',
    enlightened: true
  },
  {
    id: 'assassine_exitus',
    name: 'Exitus',
    class: 'Assassine',
    type: 'passive',
    description: '+1 auf Angriffe mit Absicht zu töten',
    enlightened: false
  },
  {
    id: 'assassine_hinterhalt',
    name: 'Hinterhalt',
    class: 'Assassine',
    type: 'passive',
    description: '+2, wenn Gegner von hinten angegriffen wird',
    enlightened: false
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
    description: '+2 beim Brauen auf Tränke mit schädlichem Effekt',
    enlightened: true
  },
  {
    id: 'assassine_phantomschnitt',
    name: 'Phantomschnitt',
    class: 'Assassine',
    type: 'active',
    description: 'Greift Gegner an, der erst nach bis zu einer Minute Schaden nimmt',
    enlightened: false,
    cost: { type: 'energy', amount: 30 }
  },

  // ==================== KOLOSS ====================
  {
    id: 'koloss_konstitution_staerke_2',
    name: 'Konstitution & Stärke+2∞',
    class: 'Koloss',
    type: 'passive',
    description: '+2 Konstitution & +2 Stärke (kann mehrfach gewählt werden)',
    enlightened: false,
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
    description: 'Reduziert Schaden aus allen Quellen um 10',
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
    description: 'Erzeugt Beben im Umkreis, Kosten entsprechen der Hälfte des Radius',
    enlightened: false,
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'koloss_wahre_groesse',
    name: 'Wahre Größe',
    class: 'Koloss',
    type: 'active',
    description: 'Wird für kurze Zeit viel größer, Kosten entsprechen Größenskalierung*10 pro Runde',
    enlightened: false,
    cost: { type: 'energy', amount: 0, perRound: true }
  },
  {
    id: 'koloss_kolossaler_schlag',
    name: 'Kolossaler Schlag',
    class: 'Koloss',
    type: 'active',
    description: 'Holt für Schlag aus, der mehr Reichweite und Schaden besitzt, je länger ausgeholt wird',
    enlightened: true,
    cost: { type: 'energy', amount: 20 }
  },

  // ==================== WAFFENMEISTER ====================
  {
    id: 'waffenmeister_geschick_staerke_2',
    name: 'Geschicklichkeit & Stärke+2∞',
    class: 'Waffenmeister',
    type: 'passive',
    description: '+2 Geschicklichkeit & +2 Stärke (kann mehrfach gewählt werden)',
    enlightened: false,
    infiniteLevel: true
  },
  {
    id: 'waffenmeister_waffenmeister',
    name: 'Waffenmeister',
    class: 'Waffenmeister',
    type: 'passive',
    description: 'Waffenvorraussetzungen werden aufgehoben, benötigt "Waffenwissen", "Waffenkenner" und "Waffengelehrter"',
    enlightened: true,
    requiresSkill: ['schuetze_waffenwissen', 'erzritter_waffenkenner', 'klingentaenzer_waffengelehrter']
  },
  {
    id: 'waffenmeister_wandelndes_arsenal',
    name: 'Wandelndes Arsenal',
    class: 'Waffenmeister',
    type: 'passive',
    description: '+2 auf jeden Angriff nach Waffenwechsel',
    enlightened: true
  },
  {
    id: 'waffenmeister_waffenschmied',
    name: 'Waffenschmied',
    class: 'Waffenmeister',
    type: 'passive',
    description: 'Verdreifacht erwürfelte Schmiedepunkte beim Schmieden von Waffen',
    enlightened: false
  },
  {
    id: 'waffenmeister_ultimativer_stoss',
    name: 'Ultimativer Stoß',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Getroffener Gegner wird zurückgeworfen, maximal 200m, nur für Wuchtwaffen',
    enlightened: false,
    cost: { type: 'energy', amount: 30 }
  },
  {
    id: 'waffenmeister_sturmschnitt',
    name: 'Sturmschnitt',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Erzeugt Schockwelle, die getroffenen Gegnern Schnittwunden zufügt, maximal 50m, nur für Schnittwaffen',
    enlightened: false,
    cost: { type: 'energy', amount: 30 }
  },
  {
    id: 'waffenmeister_panzerbrecher',
    name: 'Panzerbrecher',
    class: 'Waffenmeister',
    type: 'active',
    description: 'Stich, der gegnerische Verteidigung durchbricht, nur für Stichwaffen',
    enlightened: false,
    cost: { type: 'energy', amount: 30 }
  },

  // ==================== DUELLANT ====================
  {
    id: 'duellant_geschick_4',
    name: 'Geschicklichkeit+4∞',
    class: 'Duellant',
    type: 'passive',
    description: '+4 Geschicklichkeit (kann mehrfach gewählt werden)',
    enlightened: false,
    infiniteLevel: true
  },
  {
    id: 'duellant_duell',
    name: 'Duell',
    class: 'Duellant',
    type: 'passive',
    description: '+2 in einem Duell',
    enlightened: false
  },
  {
    id: 'duellant_perfektion',
    name: 'Perfektion',
    class: 'Duellant',
    type: 'passive',
    description: 'Wenn Leben voll, +2 im Kampf',
    enlightened: false
  },
  {
    id: 'duellant_furie',
    name: 'Furie',
    class: 'Duellant',
    type: 'passive',
    description: '+1 auf diesen Gegner mit jedem kontinuierlichen Treffer, maximal +5',
    enlightened: true
  },
  {
    id: 'duellant_uebertakten',
    name: 'Übertakten',
    class: 'Duellant',
    type: 'active',
    description: 'Greift Gegner an, kann nach einem Treffer eine weitere Aktion ausführen, 15 (x2 mit jeder weiteren Benutzung in dieser Runde)',
    enlightened: true,
    cost: { type: 'energy', amount: 15 }
  },
  {
    id: 'duellant_konter',
    name: 'Konter',
    class: 'Duellant',
    type: 'active',
    description: 'Blockt und reflektiert physischen Angriff mit doppelter Stärke. Reaktion',
    enlightened: false,
    cost: { type: 'energy', amount: 20 }
  },
  {
    id: 'duellant_schwachstellen_aufdecken',
    name: 'Schwachstellen aufdecken',
    class: 'Duellant',
    type: 'active',
    description: 'Kann Rüstung mit nächstem Angriff ignorieren. Bonusaktion',
    enlightened: true,
    cost: { type: 'energy', amount: 15 },
    bonusAction: true
  },

  // ==================== ATTENTÄTER ====================
  {
    id: 'attentaeter_geschick_tempo_2',
    name: 'Geschicklichkeit & Geschwindigkeit+2∞',
    class: 'Attentäter',
    type: 'passive',
    description: '+2 Geschicklichkeit & +2 Geschwindigkeit (kann mehrfach gewählt werden)',
    enlightened: false,
    infiniteLevel: true
  },
  {
    id: 'attentaeter_reichweite_50',
    name: 'Reichweite+50m',
    class: 'Attentäter',
    type: 'passive',
    description: '+50m Reichweite für Fernkampfwaffen',
    enlightened: false
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
    id: 'attentaeter_federfall',
    name: 'Federfall',
    class: 'Attentäter',
    type: 'passive',
    description: 'Fallschaden um 90% reduziert',
    enlightened: true
  },
  {
    id: 'attentaeter_erfrischender_mord',
    name: 'Erfrischender Mord',
    class: 'Attentäter',
    type: 'passive',
    description: 'Stellt 3 D20 Ausdauer her, wenn Gegner getötet wird',
    enlightened: false
  },
  {
    id: 'attentaeter_ueberwachung',
    name: 'Überwachung',
    class: 'Attentäter',
    type: 'active',
    description: 'Kann bei Körperkontakt andere Person markieren. Der Anwender kann die Markierung orten, solange sie aktiv ist. Die Markierung kann leicht zerstört werden',
    enlightened: false,
    cost: { type: 'energy', amount: 5, perRound: true }
  },
  {
    id: 'attentaeter_blitzschritt',
    name: 'Blitzschritt',
    class: 'Attentäter',
    type: 'active',
    description: 'Verdoppelt Bewegung. Bonusaktion, 45 pro Runde',
    enlightened: false,
    cost: { type: 'energy', amount: 45, perRound: true },
    bonusAction: true
  },
  {
    id: 'attentaeter_tragisches_schicksal',
    name: 'Tragisches Schicksal',
    class: 'Attentäter',
    type: 'active',
    description: 'Markiere vor dem Kampf einen Gegner in Sichtweite. +5 auf ersten Angriff gegen ihn als einzelnes Ziel',
    enlightened: false,
    cost: { type: 'energy', amount: 50 }
  },

  // ==================== SCHNELLSCHÜTZE ====================
  {
    id: 'schnellschuetze_movement',
    name: '+ Movement',
    class: 'Schnellschütze',
    type: 'stat_bonus',
    description: '+2 Geschwindigkeit',
    enlightened: false,
    statBonus: { stat: 'speed', amount: 2 }
  },
  {
    id: 'schnellschuetze_instant_reload',
    name: 'Instant reload',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Sofortiges Nachladen',
    enlightened: false
  },
  {
    id: 'schnellschuetze_multishot',
    name: 'Multishot',
    class: 'Schnellschütze',
    type: 'active',
    description: 'Mehrfachschuss',
    enlightened: false,
    cost: { type: 'energy', amount: 15 }
  },
  {
    id: 'schnellschuetze_follow_up_attack',
    name: 'Follow up attack',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Kann immer angreifen, wenn ein Gegner handlungsunfähig wird (Reaktion)',
    enlightened: false
  },
  {
    id: 'schnellschuetze_runde_2',
    name: 'Runde 2',
    class: 'Schnellschütze',
    type: 'passive',
    description: 'Erhält eine weitere Aktion pro Runde, wenn er diese Runde einen Gegner tötet',
    enlightened: false
  },
  {
    id: 'schnellschuetze_unberuehrt',
    name: 'Unberührt',
    class: 'Schnellschütze',
    type: 'passive',
    description: '25% Movement, wenn er diese und letzte Runde keinen Schaden genommen hat',
    enlightened: false
  },

  // ==================== KAMPFAKROBAT ====================
  {
    id: 'kampfakrobat_sprungdistanz',
    name: '+ Sprungdistanz',
    class: 'Kampfakrobat',
    type: 'passive',
    description: '+2 auf Sprungdistanz',
    enlightened: false
  },
  {
    id: 'kampfakrobat_bonusaktion',
    name: '+ 1 Bonusaktion',
    class: 'Kampfakrobat',
    type: 'passive',
    description: '+1 Bonusaktion pro Runde',
    enlightened: false
  },
  {
    id: 'kampfakrobat_sprungangriff',
    name: 'Sprungangriff',
    class: 'Kampfakrobat',
    type: 'passive',
    description: '+2 auf Angriffe in der Luft',
    enlightened: false
  },
  {
    id: 'kampfakrobat_sicherer_fall',
    name: 'Sicherer Fall',
    class: 'Kampfakrobat',
    type: 'active',
    description: 'Landet auf unsicherem Boden und erhält +1 auf nächsten Angriff. Bonusaktion',
    enlightened: false,
    cost: { type: 'energy', amount: 5 },
    bonusAction: true
  },
  {
    id: 'kampfakrobat_opportunist',
    name: 'Opportunist',
    class: 'Kampfakrobat',
    type: 'passive',
    description: 'Wenn du einem Angriff ausweichst, kontere mit einem simplen Waffenangriff (Reaktion)',
    enlightened: false
  },
  {
    id: 'kampfakrobat_bonusangriff',
    name: 'Bonusangriff',
    class: 'Kampfakrobat',
    type: 'active',
    description: 'Angriff als Bonusaktion',
    enlightened: false,
    cost: { type: 'energy', amount: 10 },
    bonusAction: true
  },

  // ==================== GENERAL ====================
  {
    id: 'general_charisma',
    name: '+ Chill',
    class: 'General',
    type: 'stat_bonus',
    description: '+2 Charisma',
    enlightened: false,
    statBonus: { stat: 'chill', amount: 2 }
  },
  {
    id: 'general_meisterstratege',
    name: 'Meisterstratege',
    class: 'General',
    type: 'passive',
    description: 'Kann die Strategie des Gegners mit Blick auf das Schlachtfeld erkennen',
    enlightened: false
  },
  {
    id: 'general_angriffsbefehl',
    name: 'Angriffsbefehl',
    class: 'General',
    type: 'active',
    description: 'Schenkt einem Verbündeten einen Extrazug (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 30 }
  },
  {
    id: 'general_schutzbefehl',
    name: 'Schutzbefehl',
    class: 'General',
    type: 'active',
    description: 'Ein Vebündeter erhält +5 auf die Reaktion des nächsten Angriffs (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 20 }
  },
  {
    id: 'general_standbefehl',
    name: 'Standbefehl',
    class: 'General',
    type: 'active',
    description: 'Zieht eine Linie, auf der alle Verbündeten im Kampf +1 erhalten (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 25 }
  },
  {
    id: 'general_leibwaechter',
    name: 'Leibwächter',
    class: 'General',
    type: 'passive',
    description: '+2 auf Reaktionen von Verbündeten, um dich zu schützen',
    enlightened: false
  },
  {
    id: 'general_befehlskette',
    name: 'Befehlskette',
    class: 'General',
    type: 'active',
    description: 'Kann diese Runde unendlich viele Befehle ausgeben für doppelte Ausdauerkosten (Bonus)',
    enlightened: false,
    cost: { type: 'energy', amount: 0 },
    bonusAction: true
  },

  // ==================== KRIEGSHERR ====================
  {
    id: 'kriegsherr_staerke',
    name: '+ Stärke',
    class: 'Kriegsherr',
    type: 'stat_bonus',
    description: '+2 Stärke',
    enlightened: false,
    statBonus: { stat: 'strength', amount: 2 }
  },
  {
    id: 'kriegsherr_blutrausch',
    name: 'Blutrausch',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Bei Kill weitere Aktion',
    enlightened: false
  },
  {
    id: 'kriegsherr_lebensmuede',
    name: 'Lebensmüde',
    class: 'Kriegsherr',
    type: 'active',
    description: '+3 auf Nahkampfangriffe, -2 gegen Angriffe (Bonus)',
    enlightened: false,
    cost: { type: 'energy', amount: 10 },
    bonusAction: true
  },
  {
    id: 'kriegsherr_todeswirbel',
    name: 'Todeswirbel',
    class: 'Kriegsherr',
    type: 'active',
    description: '360° Schwung, stärker mit jedem getroffenen Gegner (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 30 }
  },
  {
    id: 'kriegsherr_wutbewaeltigung',
    name: 'Wutbewältigung',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Negative Effekte von Rage werden aufgehoben',
    enlightened: false
  },
  {
    id: 'kriegsherr_leben_opfern',
    name: 'Leben opfern',
    class: 'Kriegsherr',
    type: 'active',
    description: 'Setzt Leben auf 1, erhält eine Aktion pro 30 geopferten Leben (Aktion)',
    enlightened: false,
    cost: { type: 'life', amount: 0 }
  },
  {
    id: 'kriegsherr_maechtiger_stoss',
    name: 'Mächtiger Stoß',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Gegner, die von Nahkampfangriffen getroffen werden, fliegen bis zu 20m weg. Kann deaktiviert werden',
    enlightened: false
  },
  {
    id: 'kriegsherr_vorreiter',
    name: 'Vorreiter',
    class: 'Kriegsherr',
    type: 'passive',
    description: 'Wenn du den ersten Treffer austeilst oder einsteckst, erhalten alle Verbündeten eine! Aktion für ihren nächsten Zug',
    enlightened: false
  },

  // ==================== WÄCHTER ====================
  {
    id: 'waechter_konstitution',
    name: '+ Konstitution',
    class: 'Wächter',
    type: 'stat_bonus',
    description: '+2 Konstitution',
    enlightened: false,
    statBonus: { stat: 'constitution', amount: 2 }
  },
  {
    id: 'waechter_leibwache',
    name: 'Leibwache',
    class: 'Wächter',
    type: 'passive',
    description: 'Erhält 2 Reaktionen für Angriffe auf Verbündete in der Nähe',
    enlightened: false
  },
  {
    id: 'waechter_beschuetzerinstinkt',
    name: 'Beschützerinstinkt',
    class: 'Wächter',
    type: 'active',
    description: 'Spürt alle Gefahren in der Umgebung auf, Kosten skalieren mit Reichweite (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'waechter_kenne_deinen_feind',
    name: 'Kenne deinen Feind',
    class: 'Wächter',
    type: 'passive',
    description: 'Nach jedem erfolgreichen Block erhälst du +1 auf alle Angriffe und Blocks gegen diesen Gegner, maximal +3',
    enlightened: false
  },
  {
    id: 'waechter_vergeltungsschlag',
    name: 'Vergeltungsschlag',
    class: 'Wächter',
    type: 'active',
    description: 'Geht in eine defensive Position für die Dauer des Skills, was Bewegung halbiert und nur defensive Aktionen erlaubt. Wird der Skill beendet, wird ein Schlag ausgeführt, dessen Stärke mit dem eingesteckten Schaden skaliert (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 20 }
  },
  {
    id: 'waechter_schildmeister',
    name: 'Schildmeister',
    class: 'Wächter',
    type: 'passive',
    description: '+2 auf Angriffe und Blocks mit Schild',
    enlightened: false
  },
  {
    id: 'waechter_edles_opfer',
    name: 'Edles Opfer',
    class: 'Wächter',
    type: 'passive',
    description: 'Wenn du kampfunfähig wirst, erhalten alle Verbündeten in der Nähe einmal pro Kampf eine Heilung, die der Hälfte deiner Leben entspricht',
    enlightened: false
  },

  // ==================== OMEN ====================
  {
    id: 'omen_hp',
    name: '+ HP',
    class: 'Omen',
    type: 'stat_bonus',
    description: '+30 Leben',
    enlightened: false,
    statBonus: { stat: 'life', amount: 30 }
  },
  {
    id: 'omen_bedroher',
    name: 'Bedroher',
    class: 'Omen',
    type: 'passive',
    description: 'Vorteil auf Bedrohung',
    enlightened: false
  },
  {
    id: 'omen_vorwarnung',
    name: 'Vorwarnung',
    class: 'Omen',
    type: 'active',
    description: 'Kann eine bereits bekannte Person verfluchen, nach einem Tag wird diese Person von Pech verfolgt. Dieser Effekt wird stärker, je näher der Nutzer zum verfluchten Ziel ist. Kostet 1/4 der gegn. HP (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 0 }
  },
  {
    id: 'omen_kraftraub',
    name: 'Kraftraub',
    class: 'Omen',
    type: 'active',
    description: 'Stiehlt die Ausdauer einer anderen Person und regeneriert den selben Betrag beim Nutzer (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 20 }
  },
  {
    id: 'omen_schlachtschwur',
    name: 'Schlachtschwur',
    class: 'Omen',
    type: 'active',
    description: 'Solange die Fähigkeit aktiv ist, wird der Schaden gegen den Anwender gespeichert. Wenn er einen Gegner tötet, wird der gespeicherte Schaden wieder geheilt (Aktion)',
    enlightened: false,
    cost: { type: 'energy', amount: 15, perRound: true }
  },
  {
    id: 'omen_unheilvoller_auftritt',
    name: 'Unheilvoller Auftritt',
    class: 'Omen',
    type: 'active',
    description: 'Bereitet für 3 Runden ein finsteres Ritual an einem Ort in seinem Sichtfeld vor, während denen der Nutzer nichts anderes tun kann. Danach hüllt er diesen Ort in Finsternis und fliegt in sein Zentrum. Alle Gegner im Umkreis werden entweder gelähmt, verängstigt, oder verstummt (Aktion)',
    enlightened: false,
    cost: { type: 'mana', amount: 50 }
  },
  {
    id: 'omen_fluchruestung',
    name: 'Fluchrüstung',
    class: 'Omen',
    type: 'active',
    description: 'Absorbiert alle negativen Effekte aller Personen im Umkreis. Erhält Rüstung abhängig von der Anzahl und Stärke der absorbierten Effekte für 3 Runden',
    enlightened: false,
    cost: { type: 'mana', amount: 30 }
  },
  {
    id: 'omen_finstere_aura',
    name: 'Finstere Aura',
    class: 'Omen',
    type: 'passive',
    description: 'Gegner, die ihm Schaden zufügen, werden mit geringer Wahrscheinlichkeit verängstigt',
    enlightened: false
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
