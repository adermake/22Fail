#!/usr/bin/env node
/**
 * write-races.js — Foolproof race importer for 22FailApp
 *
 * USAGE:
 *   node write-races.js
 *
 * REQUIREMENTS:
 *   - Backend must be running on http://localhost:3000
 *
 * DESIGN:
 *   No text parsing. All race data is hardcoded as plain JS objects.
 *   This avoids encoding errors and ambiguity completely.
 *   POSTs each race to the /api/races endpoint (upsert — safe to re-run).
 *
 * TO ADD OR EDIT A RACE:
 *   Find the race in the RACES array below. Edit the values. Re-run the script.
 *
 * STAT MAPPING (from source text):
 *   Str → strength (Stärke)
 *   Int → intelligence (Intelligenz)
 *   Gsk → dexterity (Geschicklichkeit)
 *   Gsw → speed (Geschwindigkeit)
 *   Kon → constitution (Konstitution)
 *   Wil → chill (Willenskraft)
 *   HP  → health (Leben)
 *   MP  → mana (Mana)
 *   Asd → energy (Ausdauer)
 */

const http = require('http');

const API_URL = 'http://localhost:3000/api/races';

// ─────────────────────────────────────────────────────────────────────────────
// BUILDER API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a skill for a race.
 * @param {string} raceName   - Name of the owning race (used as skill.class)
 * @param {string} name       - Skill name
 * @param {'passive'|'active'} type
 * @param {string} description - Full description (include cost notation at end)
 */
function skill(raceName, name, type, description) {
  return {
    name,
    class: raceName,
    description,
    type,
    enlightened: false,
    skillSource: 'race',
  };
}

/**
 * Level group where player chooses ONE of the two skills.
 * Most racial skills work this way.
 */
function choice(levelRequired, skill1, skill2) {
  return { levelRequired, skills: [skill1, skill2], isChoice: true };
}

/**
 * Level group where ALL skills are granted automatically (no choice).
 */
function grant(levelRequired, ...skills) {
  return { levelRequired, skills, isChoice: false };
}

/**
 * Builds a complete Race object ready for the API.
 * @param {Object} d - Race data
 */
function race(d) {
  return {
    id:           d.id,
    name:         d.name,
    baseImage:    '',
    ageRange:     d.ageRange,
    size:         d.size,
    weight:       d.weight,
    lore:         d.lore || '',
    // Resources — base values
    baseHealth:   d.hp,
    baseEnergy:   d.asd,
    baseMana:     d.mp,
    // Per-level resource growth (not in source text → use sensible defaults)
    healthPerLevel:   d.hpGain  ?? 5,
    energyPerLevel:   d.asdGain ?? 3,
    manaPerLevel:     d.mpGain  ?? 2,
    // Base stats
    baseStrength:      d.str,
    baseDexterity:     d.gsk,
    baseSpeed:         d.gsw,
    baseIntelligence:  d.int,
    baseConstitution:  d.kon,
    baseChill:         d.wil,
    // Per-level stat growth (Stat+: values from source text)
    strengthPerLevel:      d.strGain,
    dexterityPerLevel:     d.gskGain,
    speedPerLevel:         d.gswGain,
    intelligencePerLevel:  d.intGain,
    constitutionPerLevel:  d.konGain,
    chillPerLevel:         d.wilGain,
    skills: d.skills || [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RACE DATA
// Source: Rassen.txt — all text transcribed verbatim, encoding: UTF-8
// Skill format: skill(raceName, name, type, description)
// ─────────────────────────────────────────────────────────────────────────────

const RACES = [

  // ── MENSCH ──────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Mensch';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_mensch', name: R,
      ageRange: '60-80', size: '1.70m', weight: 'mittel',
      hp: 20, mp: 10, asd: 20,
      str: 10, strGain: 0.25,
      int: 10, intGain: 0.3,
      gsk: 10, gskGain: 0.3,
      gsw: 9,  gswGain: 0.2,
      kon: 9,  konGain: 0.25,
      wil: 12, wilGain: 0.2,
      lore: 'Menschen leben zusammen in großen Gruppen, meistens in Wassernähe in mildem Klima, wo sie große Städte bauen mit ausgeprägter Infrastruktur, wo sie mit vielen anderen Rassen Handel treiben. Menschen sind Feen und Naturgeistern abgeneigt, da diese im Bezug auf Natur widersprüchliche Ansichten haben. Die Menschen leben in steilen Hierarchien, in denen Menschen je nach sozialem Stand sehr unterschiedliche Lebenskonditionen besitzen. Der Drang nach Fortschritt zeichnet den Menschen aus, was ihn manchmal jedoch den Respekt vor dem Leben vergessen lässt.',
      skills: [
        choice(0,
          s('Vorreiter',    'passive', 'Benötigte Skills zur Klassenmeisterung -1'),
          s('Naturtalent',  'passive', 'Erhält anstatt alle 3 alle 2 Level einen freien Stat'),
        ),
        choice(10,
          s('Daumen drücken', 'active', 'Gibt Verbündeten -1 bis -3 auf nächste Aktion. Kosten: 10'),
          s('Raffinesse',     'passive', 'Kann mit einer Bonusaktion bis zu 2 Items verwenden'),
        ),
        choice(25,
          s('Anpassung',  'passive', '-3 auf Aktionen gegen/für Personen, mit denen diese Aktion schon einmal ausgeführt wurde'),
          s('Kreativität', 'passive', 'Kann eine Fähigkeit unabhängig von Klassenlimitationen aus dem Talentbaum lernen'),
        ),
      ],
    });
  })(),

  // ── ELFEN ───────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Elfen';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_elfen', name: R,
      ageRange: '200-250', size: '1.80m', weight: 'mittel',
      hp: 10, mp: 15, asd: 25,
      str: 7,  strGain: 0.2,
      int: 11, intGain: 0.3,
      gsk: 12, gskGain: 0.35,
      gsw: 12, gswGain: 0.25,
      kon: 8,  konGain: 0.2,
      wil: 10, wilGain: 0.2,
      lore: 'Elfen leben vermehrt in kleinen Gemeinden in Wäldern, wo sie ihr Leben in Harmonie mit der Natur verbringen, allerdings treibt es viele Elfen auch in größere Städte, wo sie sich meist problemlos integrieren können. Obwohl Elfen aus Respekt vor allen Lebewesen selten Tiere jagen und sich hauptsächlich pflanzlich ernähren, besitzen sie ein feines Gespür und können sich gegen Eindringlinge aller Art verteidigen. Sie fühlen sich als Rasse überlegen, verhalten sich aber freundlich anderen Rassen gegenüber, solange diese ihre Freundlichkeit erwidern. Die Elfen sind allgemein eine sehr friedfertige Rasse, da sie sich nicht auf das Niveau der anderen "barbarischen" Rassen herablassen wollen, wenn ihnen aber Unrecht getan wird, kennen sie keine Gnade.',
      skills: [
        choice(5,
          s('Flinkfuß',  'passive', '-5 auf Ausweichen von Gelegenheitsangriffen'),
          s('Akrobatik', 'passive', 'Mobilitätsaktionen verbrauchen keine Aktion mehr'),
        ),
        choice(15,
          s('Agilität',     'passive', 'Erhält bei erfolgreichem Ausweichen eines Gelegenheitsangriffs bis zu eine zusätzliche Bonusaktion pro Runde'),
          s('Konzentration', 'active', '-3 auf Fernkampfangriffe, +3 auf Reaktionen bis zum nächsten Zug. Bonusaktion, Kosten: 10'),
        ),
        choice(20,
          s('Duale Disziplin',        'passive', '-2 auf nächste Fähigkeit nach einem Zauber, -2 auf nächsten Zauber nach einer Fähigkeit'),
          s('Koordinierter Angriff',  'active',  'Wenn Verbündete in Angriffsreichweite auf einen gegnerischen Angriff reagieren, erhalte ebenfalls eine Reaktion. Bonusaktion, Kosten: 20'),
        ),
      ],
    });
  })(),

  // ── ZWERG ───────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Zwerg';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_zwerg', name: R,
      ageRange: '100-120', size: '1m', weight: 'mittel',
      hp: 25, mp: 10, asd: 15,
      str: 12, strGain: 0.3,
      int: 9,  intGain: 0.2,
      gsk: 10, gskGain: 0.25,
      gsw: 8,  gswGain: 0.2,
      kon: 12, konGain: 0.35,
      wil: 9,  wilGain: 0.2,
      lore: 'Zwerge leben in Höhlen mit hunderten oder sogar tausenden von Einwohnern. Zwerge sind Meisterschmiede und haben oft komplexe Minensysteme um ihre Städte konstruiert, in denen sie wertvolle Erze und Steine bergen, die sie zum Waffenschmieden verwenden. Sie sind sehr stolz auf ihre Schmiedekunst, weshalb sie bei vielen Rassen beliebt sind, allerdings weigern sie sich, ihre Waffen Kriegstreibern zu liefern, da ihre Kunst nicht für den Krieg gemacht ist. Deshalb geraten sie auch oft in Konflikte mit kriegerischen Rassen, was sie oft zur Zielscheibe von großen Stämmen und Königreichen macht. Da sie allerdings auch sehr kompetente Architekten sind, sind ihre Städte vor allen Angriffen sicher.',
      skills: [
        choice(0,
          s('Schmiedekunst', 'passive', '+20 Schmiedepunkte'),
          s('Träger',        'passive', 'Kann die volle Inventarkapazität ausnutzen, ohne einen Geschwindigkeitsmalus zu erhalten'),
        ),
        choice(10,
          s('Geschäftspartner', 'passive', '50% mehr Gold durch Verkauf von selbstgemachten oder gefundenen Items'),
          s('Meisterhandwerk',  'passive', 'Kann beim Schmieden 2 Sekundärkomponenten verwenden'),
        ),
        choice(20,
          s('Zwergenstärke', 'passive', '-2 auf Waffenangriffe mit selbstgemachten Waffen'),
          s('Felsenfest',    'active',  'Verbraucht die volle Bewegung für diese Runde, um Vorteil bei allen Reaktionen zu erhalten. Freie Aktion, Kosten: 0'),
        ),
      ],
    });
  })(),

  // ── ORK ─────────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Ork';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_ork', name: R,
      ageRange: '40-50', size: '2m', weight: 'mittel',
      hp: 25, mp: 5, asd: 20,
      str: 13, strGain: 0.4,
      int: 9,  intGain: 0.2,
      gsk: 9,  gskGain: 0.2,
      gsw: 12, gswGain: 0.25,
      kon: 11, konGain: 0.25,
      wil: 7,  wilGain: 0.2,
      lore: 'Orks leben zusammen in Kleingruppen, die ohne festen Wohnort durch das Land ziehen, generell aber feuchte und dreckige Orte als Unterkunft bevorzugen. Sie besitzen eine unnatürliche Ausdauer und können mehrere Wochen ohne Pausen laufen. Sie halten sich meistens von anderen Rassen fern und ernähren sich hauptsächlich von der Jagd, handeln aber oft mit ihrer Beute gegen komplexere Jagdwaffen, zu denen sie sonst keinen Zugang haben. Der Umgang mit anderen Rassen endet oft in gewalttätigen Auseinandersetzungen, da Orks sich nicht gerne für dumm verkaufen lassen und schnell aggressiv werden, wenn sie sich nicht durchsetzen können.',
      skills: [
        choice(0,
          s('Unerschöpflich',  'passive', 'Bleibt bei 0 Ausdauer bei Bewusstsein, kann aber keine weitere Ausdauer verbrauchen'),
          s('Doppelschlag',    'passive', 'Kann waffenlose Angriffe als Bonusaktion ausführen'),
        ),
        choice(5,
          s('Angeber',      'active',  'Erhalte -5 auf deinen nächsten Einschüchterungswurf. Behalte diesen Effekt bei Erfolg. Kosten: 10'),
          s('Allesfresser', 'passive', 'Verdoppelt Statwiederherstellung von Essen'),
        ),
        choice(15,
          s('Zähigkeit',              'active',  'Konvertiert 1 Mana zu 0.8 Ausdauer (wird gerundet). Kosten: 0'),
          s('Urtümlicher Kampfstil',  'passive', 'Wähle eine Fähigkeit aus, die dauerhaft auch als Bonusaktion verwendet werden kann'),
        ),
      ],
    });
  })(),

  // ── HALBDRACHE ──────────────────────────────────────────────────────────────
  (() => {
    const R = 'Halbdrache';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_halbdrache', name: R,
      ageRange: '~500', size: '1.9m', weight: 'mittel',
      hp: 20, mp: 15, asd: 15,
      str: 12, strGain: 0.3,
      int: 12, intGain: 0.3,
      gsk: 8,  gskGain: 0.2,
      gsw: 11, gswGain: 0.25,
      kon: 12, konGain: 0.25,
      wil: 8,  wilGain: 0.2,
      lore: 'Wähle präferiertes und schwaches Element aus.\n\nHalbdrachen leben in zurückgezogenen Orten, wo sie von niemandem gestört werden, in kleinen Gemeinden mit bis zu 100 Einwohnern. Sie zeigen sich selten der Außenwelt, junge Halbdrachen reisen jedoch oft durch die Welt, um ihre wilde Natur auszuleben. Im Alter setzen sich die Drachen aber zur Ruhe und wollen in Frieden mit ihrer Familie leben. Da sie wochenlang ohne Essen auskommen können, zeigen sie sich nur sehr selten der Außenwelt, um Beute zu jagen, verhalten sich aber ansonsten friedlich anderen Kreaturen gegenüber, die nicht auf ihrem Speiseplan stehen. Sollte allerdings jemand in ihr Territorium eindringen, schützen sie ihre Familie um alle Kosten.\n\nSchwäche: Doppelter Schaden durch elementare Schwäche und doppelte Manakosten für Zauber von diesem Element.',
      skills: [
        choice(0,
          s('Fliegen',   'active', 'Kann mit 1.5-facher Geschwindigkeit fliegen. Keine Aktion, Kosten: 20 pro Runde'),
          s('Dominanz',  'active', 'Kann auf ein Feld im Bewegungsradius springen und erhält für diese Runde D10 Schadensreduktion. Der Sprung umgeht Gelegenheitsangriffe. Kosten: 40, reduziert um 5 pro Gegner im Umkreis'),
        ),
        choice(15,
          s('Inneres Element', 'passive', 'Erhalte die Drachenrune, mit der das präferierte Element im Körper des Anwenders generiert wird. Die Effizienz der Rune entspricht dem Level.'),
          s('Drachenhaut',     'active',  'Absorbiert präferiertes Element bei Kontakt und stellt Leben und Ausdauer abhängig von der Konzentration des Elements her. Kosten: 20'),
        ),
        choice(30,
          s('Wahre Form',       'active', 'Verdopple Leben, Basisstärke und die Effizienz aller Angriffe temporär, du kannst aber nur besondere auf Drachen zugeschnittene Waffen benutzen. Verlierst 10 Leben pro Runde, kehrt zum Normalzustand zurück wenn die Leben unter die Hälfte fallen.'),
          s('In deinem Element', 'active', 'Bewege dich durch dein präferiertes Element hindurch. Die genaue Funktionsweise hängt stark vom Individuum ab.'),
        ),
      ],
    });
  })(),

  // ── ZENTAUR ─────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Zentaur';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_zentaur', name: R,
      ageRange: '60-80', size: '2.5m', weight: 'schwer',
      hp: 15, mp: 5, asd: 30,
      str: 10, strGain: 0.25,
      int: 9,  intGain: 0.2,
      gsk: 12, gskGain: 0.35,
      gsw: 10, gswGain: 0.25,
      kon: 11, konGain: 0.25,
      wil: 8,  wilGain: 0.2,
      lore: 'Zentauren leben in kleinen Herden und reisen durch das Land und verweilen dabei nie lange am selben Ort. Zentauren sind Allesfresser, sind jedoch mit ihrer hohen Geschwindigkeit und Zielgenauigkeit gefährliche Jäger. Da Zentauren allgemein aber ein äußerst friedfertiges Volk sind, machen sie davon nur sehr selten Gebrauch. Sie verstehen sich mit allen Rassen und sind allseits anerkannt, werden aber oft als Feiglinge bezeichnet, da sie Gewalt verabscheuen und nur im absoluten Notfall handgreiflich werden, selbst wenn ihnen das langfristig noch mehr Probleme bereitet.',
      skills: [
        choice(0,
          s('Langläufer', 'passive', 'Kann das Bewegungslimit pro Runde überschreiten für 2 Ausdauer pro Extrafeld'),
          s('Packesel',   'passive', 'Inventarkapazität x2'),
        ),
        choice(15,
          s('Symbiose', 'active',  'Wenn eine Person auf dir reitet, erhält der Reiter eine zweite Aktion jede Runde und Reaktionswürfe für beide werden geteilt, wobei der bessere Wurf gewählt wird. Kosten: 20 pro Runde'),
          s('Anlauf',   'passive', '+1 auf alle Fernkampfangriffe pro 3 Felder, die du dich in diesem Zug auf das Ziel zubewegt hast'),
        ),
        choice(20,
          s('Ansturm',       'active',  'Rennt auf einer geraden Linie bis zum doppelten Bewegungsradius und erhält einen einfachen Angriff auf alle Gegner in Nahkampfreichweite und erhält Vorteil gegen Gelegenheitsangriffe. Kosten: 50'),
          s('Mehr Bewegung', 'passive', 'Wenn du deine volle Bewegung in diesem Zug verbrauchst, erhältst du nach deiner Aktion 50% deiner Bewegung zurück'),
        ),
      ],
    });
  })(),

  // ── ECHSENMENSCH ────────────────────────────────────────────────────────────
  (() => {
    const R = 'Echsenmensch';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_echsenmensch', name: R,
      ageRange: '50-60', size: '1.8m', weight: 'mittel',
      hp: 25, mp: 10, asd: 15,
      str: 10, strGain: 0.3,
      int: 8,  intGain: 0.15,
      gsk: 11, gskGain: 0.25,
      gsw: 11, gswGain: 0.3,
      kon: 12, konGain: 0.3,
      wil: 8,  wilGain: 0.2,
      lore: 'Echsenmenschen leben in kleinen Dörfern in feuchten Gebieten und ernähren sich hauptsächlich vom Fischfang. Sie interagieren ungern mit anderen Spezies und gelten deshalb allgemein als kaltblütig und rücksichtslos. Trotz diesen Vorurteilen sind Echsenmenschen jedoch meistens friedlich gesinnt, können durch kulturelle Differenzen aber schnell brutal und gewaltbereit wirken und werden deshalb hauptsächlich von anderen Rassen gemieden. Wenn sich jemand nämlich einen Echsenmenschen zum Feind macht, verfolgen diese ihre Opfer gnadenlos durch jedes Terrain und nutzen jede Schwachstelle des Gegners aus, um diese schnell und effizient niederzustrecken.\n\nSchwäche: -1 bei extremer Hitze oder Kälte.',
      skills: [
        choice(5,
          s('VdW-Kräfte',   'active',  'Kann an Wänden und Decken entlangklettern, muss aber Hände frei haben (kann mit einer Hand hängen bleiben, aber nicht bewegen). Keine Aktion, Kosten: 10 pro Runde'),
          s('Infrarotsicht', 'active', 'Kann einen Gegner analysieren, um seine Konditionsstats und potenziell weitere Informationen herauszufinden. Kosten: 5'),
        ),
        choice(15,
          s('Echsenhaut',  'passive', '50% Schadensresistenz gegen Wuchtangriffe'),
          s('Camouflage',  'active',  'Verändere dein Aussehen, um dich zu tarnen oder dein Aussehen zu verändern, wird bei Schaden beendet. Kosten: 20'),
        ),
        choice(20,
          s('Häutung',      'active', 'Regeneriert 50% der maximalen Leben. Nur einmal pro Tag möglich. Kosten: 60'),
          s('Scharfe Zunge', 'active', 'Greift den Gegner mit der Zunge an und kann bei Kontakt vergiften. Stärke und Effekt des Gifts können je nach Charakter und seiner Ernährung variieren.'),
        ),
      ],
    });
  })(),

  // ── GOBLIN ──────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Goblin';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_goblin', name: R,
      ageRange: '20-30', size: '0.9m', weight: 'leicht',
      hp: 15, mp: 10, asd: 25,
      str: 10, strGain: 0.25,
      int: 9,  intGain: 0.2,
      gsk: 11, gskGain: 0.25,
      gsw: 13, gswGain: 0.4,
      kon: 10, konGain: 0.25,
      wil: 7,  wilGain: 0.15,
      lore: 'Goblins leben in kleinen Stämmen in Höhlen, versteckt vor dem Rest der Welt. Sie werden von anderen Rassen als Ungeziefer betrachtet und dementsprechend behandelt. Da sie aber äußerst flink und geschickt sind, stehlen sie oft von größeren Städten und bauen ihre Zivilisation auf ihrem Diebesgut auf. Dementsprechend können verschiedene Goblinstämme sehr unterschiedliche Kulturen haben. Doch während sie sehr problematische Beziehungen zu anderen Rassen haben, halten Goblins verschiedener Stämme oft zusammen und tauschen ihre Erfolge und Fortschritte untereinander aus.',
      skills: [
        choice(5,
          s('Bastler',     'passive', 'Kann Ausrüstung mit einer Effizienz unter 10 auch ohne Schmiede herstellen. Verbraucht im Kampf einen vollen Zug.'),
          s('Hinterhältig', 'passive', '-5 auf Gelegenheitsangriffe'),
        ),
        choice(15,
          s('Lieferant',          'passive', 'Inventarkapazität +100 und das Übergeben von Items im Kampf kostet keine Bonusaktion'),
          s('Kritischer Rückzug', 'passive', 'Wenn du im Kampf zum ersten Mal in den kritischen Zustand fallen würdest, bleibst du stattdessen auf 1 Leben und kannst keine Aktionen ausführen, verdoppelst aber deine Bewegung. Endet wenn die Leben über 1 steigen.'),
        ),
        choice(20,
          s('Proliferation',    'passive', 'Erhält einmalig 10 freie Stats und kann bei 2 Stats das Statwachstum um 0.1 reduzieren und es einem anderen Stat hinzufügen'),
          s('Alle gegen einen', 'passive', 'Wenn ein Gegner von einem Verbündeten in seiner letzten Runde angegriffen wurde, erhalte -2 auf Angriffe und halbiere Fähigkeitskosten gegen ihn'),
        ),
      ],
    });
  })(),

  // ── TROLL ───────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Troll';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_troll', name: R,
      ageRange: '~100', size: '2.5m', weight: 'schwer',
      hp: 30, mp: 0, asd: 20,
      mpGain: 0,
      str: 15, strGain: 0.45,
      int: 7,  intGain: 0.15,
      gsk: 9,  gskGain: 0.25,
      gsw: 8,  gswGain: 0.2,
      kon: 14, konGain: 0.3,
      wil: 7,  wilGain: 0.15,
      lore: 'Trolle leben meist vereinzelt oder in Kleingruppen, die ein sehr enges, brüderliches Bündnis haben. Die Stärke von Trollen bestimmt über ihren sozialen Status, sodass die stärksten Trolle oft auf den schwächeren herumhacken und sie manchmal komplett aus ihrer Gruppe verbannen. Sollte man vereinzelten Trollen in der Wildnis begegnen, ist höchste Vorsicht geboten, da diese sehr reizbar sein können. Normalerweise sind Trolle nicht gefährlich, verabscheuen aber "schwache" Rassen wie Elfen und Feen, und verstehen sich viel besser mit Orks, die ihre Stärke zu schätzen wissen. Manchmal verbünden sich Trollstämme unter einem starken Anführer, um naheliegende Städte einzunehmen und ihr Gebiet zu erweitern. Diese Bündnisse halten jedoch selten lange, da ihre Hierarchie mit dem Tod ihres Anführers sofort auseinanderfällt.',
      skills: [
        choice(5,
          s('Blinde Wut', 'passive', '-2 auf Angriffe wenn im Ragemodus und kann sich von gegnerischen Angriffen bewusst treffen lassen, um in den Ragemodus versetzt zu werden'),
          s('Power Nap',  'passive', 'Verdoppelt die Statregeneration beim Schlafen'),
        ),
        choice(10,
          s('Massive Stärke', 'passive', 'Waffen mit Stärkevoraussetzung (inkl. Hand) erhalten zusätzliche Effizienz entsprechend des Stärkemodifikators'),
          s('Fiese Frage',    'active',  'Stellt einer anderen Person eine Frage, die von dieser entweder beantwortet oder ignoriert werden kann. Beantwortet er sie richtig, passiert nichts. Beantwortet er sie falsch oder ignoriert sie und verliert einen Willencheck, kannst du einen Stat der Person auswählen, ihn für 5 Runden halbieren und die Hälfte dieses Wertes als Effizienz auf Angriffe gegen diese Person erhalten. Kosten: 30'),
        ),
        choice(25,
          s('Vitalkraft', 'active',  'Solange die Fähigkeit aktiv ist, können die maximalen Leben bis zu einem Maximum von 300% der Leben überschritten werden. Keine Aktion, Kosten: 5 pro Runde'),
          s('Eroberer',   'active',  'Markiert einen Gegner mit höherem Level. Solange dieser markiert ist, erhält er Nachteil auf alle Angriffe gegen andere Gegner, bis diese ihn angreifen. -3 auf Angriffe gegen ihn. Kosten: 10 pro Runde'),
        ),
      ],
    });
  })(),

  // ── GNOLL ───────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Gnoll';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_gnoll', name: R,
      ageRange: '60-80', size: '1.5m', weight: 'mittel',
      hp: 10, mp: 10, asd: 30,
      str: 10, strGain: 0.25,
      int: 9,  intGain: 0.2,
      gsk: 13, gskGain: 0.35,
      gsw: 12, gswGain: 0.3,
      kon: 8,  konGain: 0.2,
      wil: 8,  wilGain: 0.2,
      lore: 'Gnolle sind geborene Jäger. Sie jagen in Kleingruppen, leben jedoch meist in größeren Stämmen in Steppengebieten. In diesen Gruppen gehen sie regelmäßig auf lange Reisen, um ihr Territorium zu erweitern, Feinde zu vertreiben, und Nahrung für ihren Stamm zu finden. Ihr Zusammenhalt im Stamm ist stark, jedoch stehen sie mit anderen Gnollstämmen oft auf Kriegsfuß, da sich diese oft ihr Territorium streitig machen. Andere Rassen wissen, wie brutal es in diesen Stammeskriegen zugehen kann, weshalb sie sich aus ihren Streitigkeiten raushalten und pflegen dadurch meistens freundliche Beziehungen zu ihnen. Sie handeln oft mit anderen Rassen, wo ihre Waffen besonders beliebt sind, da diese trotz ihrer Einfachheit sehr effektiv sind und mit regulären Waffen mithalten können.',
      skills: [
        choice(0,
          s('Urform',       'passive', 'Erhöht Bewegung um 50% bei Fortbewegung auf allen Vieren (nur möglich wenn Hände frei)'),
          s('Gefahrensinn', 'passive', 'Kann potenziell gefährliche Situationen im Voraus erspüren'),
        ),
        choice(10,
          s('Spürnase',       'active',  'Kann Geruchsspuren mithilfe einer Geruchsprobe bis zu eine Woche später aufspüren. Bonusaktion, Kosten: 0'),
          s('Kinetische Sicht', 'active', 'Erhalte -5 auf den Reaktionswert und -2 auf Reaktionen, solange die Fähigkeit aktiv ist. Bonusaktion, Kosten: 10 pro Runde'),
        ),
        choice(20,
          s('Wilde Jagd',   'passive', 'Nach einem Kill -5 auf nächsten Angriff'),
          s('Erstangriff',  'passive', 'Führe Gelegenheitsangriffe bereits aus, sobald der Gegner deine Nahkampfreichweite betritt'),
        ),
      ],
    });
  })(),

  // ── FEE ─────────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Fee';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_fee', name: R,
      ageRange: '150-180', size: '0.3m–1.6m', weight: 'leicht',
      hp: 5, mp: 35, asd: 10,
      str: 7,  strGain: 0.15,
      int: 13, intGain: 0.35,
      gsk: 10, gskGain: 0.25,
      gsw: 10, gswGain: 0.25,
      kon: 7,  konGain: 0.15,
      wil: 13, wilGain: 0.35,
      lore: 'Feen leben in Wald- und Seegebieten mit starkem Bezug zur Natur. Sie leben im Moment und kümmern sich nicht um die Konsequenzen ihrer Taten, weshalb sie vom Rest der Welt meistens gemieden werden. Ihre Sorglosigkeit kann ihnen aber auch zum Verhängnis werden, da sie oft entführt und auf dem Schwarzmarkt verkauft werden, wo ihre Flügel als Trankzutat hohen Wert besitzen. Den Rest der Feen interessiert das jedoch wenig, sie haben besseres zu tun als ihr Leben für andere aufs Spiel zu setzen.\n\nSchwäche: +3 im Kampf mit schweren Waffen.',
      skills: [
        choice(0,
          s('Magischer Flug',   'active', 'Kann auf sich selbst Feenstaub benutzen, um zu fliegen. Kosten: 10 pro Rundenanzahl. Zusätzlich können alle Feenfähigkeiten mit Mana bezahlt werden.'),
          s('Flugbestäubung',   'active', 'Fliegt eine Strecke die der Bewegungsdistanz entspricht und verteilt Feenstaub auf alle auf dem Weg für die doppelten Kosten des Feenstaubs. Feenstaub kann entweder Verbündete abhängig vom Intelligenzwert heilen oder Gegner für 3 Runden blenden. Kosten: 10'),
        ),
        choice(10,
          s('Schlafpuder',   'active', 'Kann Waffen oder Zauber mit Feenstaub verstärken, wodurch ihr nächster Angriff ihren Effekt auslöst. Außerdem kann Feenstaub Personen müde machen, was sie nach kurzer Zeit eventuell einschläfert. Kosten: 20'),
          s('Schneller Staub', 'active', 'Kann Feenfähigkeiten auch als Bonusaktion verwenden. Zusätzlich kann Feenstaub betroffenen Personen eine 50% Chance verleihen, dem nächsten Treffer auszuweichen. Kosten: 20'),
        ),
        choice(20,
          s('Schicksalswende', 'passive', 'Kann Feenstaub zwei Effekte gleichzeitig geben, Kosten von beiden Effekten werden addiert. Zusätzlich kann Feenstaub Personen Glück gewähren, was ihnen -5 auf ihre nächste Aktion gibt, wenn sie zuvor eine 15 oder höher (ohne Boni) gewürfelt haben. Kosten: 10 pro Effektanzahl'),
          s('Fata Morgana',    'active',  'Feenstaub kann auch auf eine Person oder ein Objekt im Umkreis verwendet werden. Zusätzlich kann Feenstaub Betroffene unsichtbar machen oder ihr Aussehen verändern. Kosten: 10 pro Rundenzahl'),
        ),
      ],
    });
  })(),

  // ── VAMPIR ──────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Vampir';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_vampir', name: R,
      ageRange: '1000+', size: '1.8m', weight: 'mittel',
      hp: 15, mp: 20, asd: 15,
      str: 9,  strGain: 0.2,
      int: 11, intGain: 0.3,
      gsk: 10, gskGain: 0.25,
      gsw: 9,  gswGain: 0.2,
      kon: 10, konGain: 0.25,
      wil: 11, wilGain: 0.3,
      lore: 'Vampire werden auch als Hüter des Wissens bezeichnet, da sie durch ihre hohe Lebensspanne und Intelligenz eine große Ansammlung an Informationen und Dokumenten aus aller Welt besitzen und diese in ihrem Unterschlupf aufbewahren. Sie hüten dieses Wissen wie einen Schatz und lassen nur selten andere an diesem Wissen teilhaben. Da sie in diesem Sinne sehr egoistische Wesen sind, leben sie meist isoliert von anderen, selbst anderen Vampiren, um ihr Wissen zu beschützen. Trotz dessen sind die Vampirunterschlüpfe sehr groß, elegant und modern, da in ihren Augen die Präsentation fast so wichtig ist wie der Inhalt selbst. Vampire leben an Orten, wo sie von der Sonne unversehrt bleiben, weshalb man sie meistens in dichten Wäldern, Höhlen und in der Unterwelt findet.\n\nSchwäche: +2 bei direktem Kontakt zum Sonnenlicht, erhält doppelten Schaden durch Silberwaffen.',
      skills: [
        choice(0,
          s('Dunkle Seele', 'passive', 'Erhalte eine spezielle Fledermausseele für Zauber und die Fähigkeit, dich in eine Fledermaus zu verwandeln. Kosten: 10 pro Runde'),
          s('Nebelform',    'active',  'Kann sich kurz in einen blutroten Nebel auflösen, der immun gegen jeglichen Schaden ist und zu einem Punkt in Bewegungsreichweite fliegt. Kosten: 30'),
        ),
        choice(15,
          s('Blut saugen',      'active', 'Saugt einem lebendigen Gegner Blut aus, heilt und fügt dem Gegner Schaden zu von bis zu 20% seiner maximalen Leben. Kosten: 20'),
          s('Bannender Blick',  'active', 'Bei Augenkontakt zu einer anderen Person kann dieser ein Befehl ins Unterbewusstsein eingeflößt werden. Damit können die Aktionen dieser Person leicht beeinflusst werden, solange es dem Gedankengang der Person nicht zu stark widerspricht. Klingt nach maximal einem Tag ab. Kosten: 20'),
        ),
        choice(25,
          s('Opfergabe',       'passive', 'Kann Fähigkeiten und Zauber mit Leben anstatt Ausdauer/Mana auslösen, kostet 50% weniger'),
          s('Wissenssammler',  'passive', 'Kann die Fähigkeiten des Ziels einsehen, indem er 3 Runden lang Körperkontakt aufrechterhält. Danach verliert das Ziel permanent eine ausgewählte Fähigkeit und du kannst sie verwenden. Maximale gestohlene Fähigkeiten: Level ÷ 10 (abgerundet). Kosten: 30'),
        ),
      ],
    });
  })(),

  // ── MEERVOLK ────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Meervolk';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_meervolk', name: R,
      ageRange: '70-90', size: '1.8m', weight: 'mittel',
      hp: 10, mp: 20, asd: 20,
      str: 8,  strGain: 0.2,
      int: 13, intGain: 0.35,
      gsk: 9,  gskGain: 0.2,
      gsw: 11, gswGain: 0.25,
      kon: 8,  konGain: 0.2,
      wil: 11, wilGain: 0.3,
      lore: 'Meerwesen leben in hochentwickelten Wasserstädten, die mit den größten Menschen- und Zwergenstädten mithalten können, da im Wasser keine Gefahr vor anderen Zivilisationen besteht. Dadurch pflegen sie friedliche Kontakte zu den meisten anderen Rassen und treiben Handel, wo vor allem ihre magischen Artefakte heiß begehrt sind. Neben ihrer technischen Affinität ist das Meervolk nämlich ein Meister im Umgang mit Magie, was in ihrer magischen Architektur besonders deutlich wird. Obwohl sich Meerwesen auch an Land problemlos fortbewegen können, bevorzugen sie das Wasser als Lebensraum, wo sie niemand stören kann.\n\nSchwäche: Doppelter Schaden durch Feuermagie.',
      skills: [
        choice(0,
          s('Metamorphose',   'passive', 'Kann unter Wasser atmen und zwischen Wasser- und Landform wechseln, Wasserform verdoppelt Bewegung im Wasser'),
          s('Führende Flut',  'passive', 'Wenn du dich in diesem Zug nicht bewegt hast, erspüre einen Knotenpunkt im Bewegungsradius, auf dem Fähigkeiten und Zauber einmalig nur die Hälfte kosten'),
        ),
        choice(15,
          s('Wellenrufer',   'passive', 'Reduziert Kosten und Voraussetzung von Wasserrunen um 50% und kann offen liegendes Wasser in der Nähe als Startpunkt für Zauber benutzen'),
          s('Sirenengesang', 'active',  'Singt ein Lied, das Gegner in Reichweite (entspricht Willen in m) bezaubert, wenn sie den Willenswurf gegen dich verlieren. Dreimal bezaubert = kontrollierbar. Erleidet das Ziel Schaden, wird der Effekt abgebrochen. Verbraucht einen vollen Zug. Kosten: 10 pro Runde'),
        ),
        choice(20,
          s('Heimvorteil',  'passive', 'Wenn du und der Gegner sich beide im Wasser befinden, erhält dieser garantiert eine Panikreaktion gegen deine Angriffe. Umgekehrt erhältst du eine volle Reaktion.'),
          s('Runengravur',  'active',  'Versieht ein Objekt bei Kontakt mit vorbestimmten Runen. Kann auch vorhandene Runen und Zauber überschreiben. Kosten: 10 pro eingesetzte/veränderte Rune'),
        ),
      ],
    });
  })(),

  // ── NATURGEIST ──────────────────────────────────────────────────────────────
  (() => {
    const R = 'Naturgeist';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_naturgeist', name: R,
      ageRange: '700+', size: 'variabel', weight: 'leicht',
      hp: 10, mp: 30, asd: 10,
      str: 8,  strGain: 0.15,
      int: 14, intGain: 0.4,
      gsk: 10, gskGain: 0.25,
      gsw: 9,  gswGain: 0.2,
      kon: 8,  konGain: 0.2,
      wil: 11, wilGain: 0.3,
      lore: 'Wähle präferiertes Element aus.\n\nNaturgeister leben in der Natur, mit der Natur, für die Natur. Sie werden von der Erde selbst geboren und beschützen ihren Geburtsort gegen alle, die in ihrem Gebiet Unruhe stiften. Normalerweise verbringen sie ihr ganzes Leben an ihrem Geburtsort, eilen aber oft anderen Naturgeistern in Not zu Hilfe, wenn ihr Gebiet in Gefahr ist. Dementsprechend geraten sie oft in Konflikte mit anderen Rassen, die die Natur nicht zu schützen wissen, denn obwohl für Naturgeister das Leben aller Tiere und Pflanzen heilig ist, verteidigen sie ihr Gebiet um jeden Preis. Sollte die Natur jedoch von anderen respektiert werden, teilen sie die Gaben der Natur gerne mit ihnen.',
      skills: [
        choice(0,
          s('Elementargeist',  'passive', 'Reduziert Fokuskosten von Elementarzaubern um 90%, wenn das Element mit dem Gebiet übereinstimmt'),
          s('Naturflüsterer',  'active',  'Kann mit der Natur in Kontakt treten, um Informationen über das Gebiet zu erhalten. Kosten: 0'),
        ),
        choice(10,
          s('Macht der Natur',   'passive', 'Pausierte Zaubercasts verlieren nicht ihr Castlevel, sondern erhöhen es automatisch um 5 pro Runde. Wenn der Zaubercast abgeschlossen ist, muss der Zauber direkt verwendet werden, sonst hat er keinen Effekt.'),
          s('Gewohntes Umfeld',  'passive', 'Stelle in Gebieten, deren Element mit deinem präferierten Element übereinstimmt, jede Runde Leben, Ausdauer und Mana abhängig von einem Würfel, der mit Konstitution skaliert'),
        ),
        choice(20,
          s('Weltenmagie',  'passive', 'Formationszauber können mit einem höheren maximalen Castwert gecastet werden und erhalten dafür einen festen Wurfbonus entsprechend der Skalierung der Formation'),
          s('Naturgewalt',  'active',  'Kreiere eine Zone, in der du die Natur zu deinem Willen biegen kannst abhängig von deinem präferierten Element. Die genaue Funktionsweise hängt stark vom Individuum ab.'),
        ),
      ],
    });
  })(),

  // ── ENGEL ───────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Engel';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_engel', name: R,
      ageRange: '~300', size: '1.9m', weight: 'mittel',
      hp: 10, mp: 25, asd: 15,
      str: 8,  strGain: 0.2,
      int: 12, intGain: 0.35,
      gsk: 9,  gskGain: 0.2,
      gsw: 11, gswGain: 0.3,
      kon: 8,  konGain: 0.15,
      wil: 12, wilGain: 0.3,
      lore: 'Engel leben in der Überwelt, weit oben in den Wolken, abgelegen von allen anderen Zivilisationen. Da sie ohne Kontakt zum Sonnenlicht ihre Kraft verlieren, können sie nur bei Sonnenschein auf die Erde kommen. Da das der einzige Weg für sie ist, mit anderen Spezies Kontakt aufzunehmen, werden sie allerdings sehr selten gesichtet. In der Vergangenheit waren sie jedoch nicht an den Himmel gebunden. Vor vielen Generationen waren Engel auf der ganzen Welt vertreten und waren allen Rassen technologisch überlegen. Nach dem Großen Krieg machten die Dämonen die Erde für die Engel unbewohnbar, was ihren technologischen Fortschritt abrupt stoppte.\n\nSchwäche: +1 ohne direkten Kontakt zum Sonnenlicht.',
      skills: [
        choice(0,
          s('Himmlischer Flug', 'active', 'Kann mit 1.5-facher Geschwindigkeit fliegen. Keine Aktion, Kosten: 20 Mana pro Runde'),
          s('Erlösung',         'active', 'Kann fliegen, auf Verbündete verdoppelt sich die Geschwindigkeit. Keine Aktion, Kosten: 20 pro Runde'),
        ),
        choice(15,
          s('Segen',         'active', 'Wähle einen Verbündeten aus, um ihn zu segnen. Gesegnete Verbündete strahlen Sonnenlicht aus, können als Startpunkt für Zauber verwendet werden und du erhältst einen Vorteil auf Buff- und Heilzauber auf ihn. Kosten: 10 pro Runde'),
          s('Heiliges Gebot', 'active', 'Wähle einen Gegner in Reichweite (entspricht Willen in m) aus und eine simple Regel, die er befolgen muss. Der Gegner muss einen Willenswurf gegen dich verlieren. Solange die Fähigkeit bestehen bleibt, muss das Ziel der Regel folgen. Kosten: 10 pro Runde'),
        ),
        choice(25,
          s('Deus ex machina', 'passive', 'Kosten von Dauerfähigkeiten und -zaubern werden ab der zweiten Runde halbiert'),
          s('Apotheose',       'active',  'Alle Verbündeten in Reichweite (entspricht Willen in m) erhalten sofort eine weitere Aktion. Alle Kosten, die mit dieser Aktion ausgegeben werden, muss der Engel bezahlen. Fallen seine Werte dabei unter 0, können keine weiteren Fähigkeiten benutzt werden, die diese Kosten verbrauchen. Kosten: 50'),
        ),
      ],
    });
  })(),

  // ── DÄMON ───────────────────────────────────────────────────────────────────
  (() => {
    const R = 'Dämon';
    const s = (name, type, desc) => skill(R, name, type, desc);
    return race({
      id: 'race_daemon', name: R,
      ageRange: '~300', size: '1.9m', weight: 'mittel',
      hp: 15, mp: 15, asd: 20,
      str: 12, strGain: 0.35,
      int: 9,  intGain: 0.2,
      gsk: 9,  gskGain: 0.2,
      gsw: 11, gswGain: 0.3,
      kon: 9,  konGain: 0.2,
      wil: 10, wilGain: 0.25,
      lore: 'Dämonen lebten in der Unterwelt versteckt, nachdem sie im Großen Krieg von den Engeln geschlagen und verbannt wurden. Seitdem ist allerdings einige Zeit vergangen und viele Dämonen haben angefangen, sich unter andere Zivilisationen zu mischen. Trotzdem sind viele Rassen den Dämonen immer noch misstrauisch gegenüber, ihre klugen Köpfe sind jedoch vor allem im Finanz- und Verwaltungsbereich großer Städte sehr angesehen. Sie verstehen sich mit anderen Rassen allgemein recht gut, selbst mit den einst verfeindeten Engeln, haben jedoch die Tendenz sehr obsessiv in ihren Beziehungen zu werden.\n\nSchwäche: Heilzauber auf Dämonen werden um 50% reduziert.',
      skills: [
        choice(0,
          s('Fliegen',       'active', 'Kann mit 1.5-facher Geschwindigkeit fliegen. Keine Aktion, Kosten: 20 pro Runde'),
          s('Beschwörung',   'active', 'Wenn jemand einen Beschwörungsruf vollführt, der für jeden Dämon einzigartig ist, erhältst du Informationen über die Person und den Beschwörungsort und kannst dich an den Ort der Beschwörung teleportieren. Kosten: 10 + Teleportdistanz in km'),
        ),
        choice(15,
          s('Pakt',                      'active', 'Schließt ein Geschäft mit einer anderen Person ab, bei dem beide Beteiligten alles zum Tausch anbieten können außer ihre Stats. Zusätzlich verliert die andere Person 10% ihrer maximalen Leben und du erhältst die Hälfte davon. Dauer kann festgelegt oder unbestimmt bleiben. Kosten: 20'),
          s('Teufel auf deiner Schulter', 'active', 'Nachdem du einer Person in den letzten 3 Runden Schaden zugefügt hast, kannst in ihr Unterbewusstsein eindringen, wenn ihr Willenswurf fehlschlägt. Solange der Effekt aktiv ist, kannst du bei jeder ihrer Reaktionen ebenfalls für sie reagieren, mit ihren Würfelmodifikatoren. Übertrifft dein Wurf den der Person, übernimmst du die Reaktion. Kosten: 15 pro Runde'),
        ),
        choice(25,
          s('Descende caelo', 'active', 'Du kannst in dieser Runde unendlich viele Dauerfähigkeiten und -zauber verwenden, ihre Kosten pro Runde kosten allerdings zusätzlich Fokus. Erhalte Bewegung entsprechend der auf diese Weise belegten Fokuspunkte. Kosten: 10'),
          s('Teufelstanz',    'active', 'Erhalte -2X auf Angriffe und Reaktionswürfe und -X auf Einschüchterungswürfe (kann auch für Angriffe verwendet werden). Kostet 5X Leben pro Runde'),
        ),
      ],
    });
  })(),

]; // END RACES

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT ENGINE — do not edit below this line
// ─────────────────────────────────────────────────────────────────────────────

function postRace(raceObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(raceObj);
    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, name: raceObj.name });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function importRaces() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(` 22FailApp — Rassen-Import (${RACES.length} Rassen)`);
  console.log(`${'═'.repeat(60)}\n`);

  let ok = 0;
  let fail = 0;

  for (const r of RACES) {
    try {
      await postRace(r);
      console.log(` ✓  ${r.name.padEnd(20)} (${r.skills.length} Levelgruppen)`);
      ok++;
    } catch (err) {
      console.error(` ✗  ${r.name.padEnd(20)} FEHLER: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(` Ergebnis: ${ok} erfolgreich, ${fail} fehlgeschlagen`);
  if (fail === 0) {
    console.log(' Alle Rassen erfolgreich importiert!');
  } else {
    console.log(' Stelle sicher, dass das Backend auf Port 3000 läuft.');
  }
  console.log(`${'═'.repeat(60)}\n`);
}

importRaces().catch(console.error);
