const fs = require('fs');
const path = require('path');

// Map German stat names to frontend property names
const races = [
  {
    id: "race_menschen",
    name: "Menschen",
    ageRange: "60-80",
    lore: "Menschen leben zusammen in großen Gruppen, meistens in Wassernähe in mildem Klima, wo sie große Städte bauen mit ausgeprägter Infrastruktur, wo sie mit vielen anderen Rassen Handel treiben. Menschen sind Feen und Naturgeistern abgeneigt, da diese im Bezug auf Natur widersprüchliche Ansichten haben. Die Menschen leben in steilen Hierarchien, in denen Menschen je nach sozialem Stand sehr unterschiedliche Lebenskonditionen besitzen. Der Drang nach Fortschritt zeichnet den Menschen aus, was ihn manchmal jedoch den Respekt vor allem Lebenden vergessen lässt.",
    baseHealth: 50, baseEnergy: 60, baseMana: 40,
    baseStrength: 10, baseDexterity: 9, baseSpeed: 9, baseIntelligence: 10, baseConstitution: 9, baseChill: 10,
    strengthPerLevel: 0.3, dexterityPerLevel: 0.4, speedPerLevel: 0.2, intelligencePerLevel: 0.4, constitutionPerLevel: 0.3, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 0, skill: { name: "Naturtalent", class: "", description: "Erhält anstatt alle 3 alle 2 Level einen freien Stat", type: "passive", enlightened: false } },
      { levelRequired: 10, skill: { name: "Daumen drücken", class: "", description: "Gibt Verbündeten +1-3 auf nächste Aktion, 10 (1-7, 8-14, 15+)", type: "active", enlightened: false } },
      { levelRequired: 25, skill: { name: "Déjà-vu", class: "", description: "+2 auf Aktionen gegen/für Personen mit denen diese Aktion schon einmal ausgeführt wurde", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_elfen",
    name: "Elfen",
    ageRange: "200-250",
    lore: "Elfen leben in kleinen Gemeinden in Wäldern, wo sie ihr Leben in Harmonie mit der Natur verbringen. Obwohl Elfen aus Respekt vor allen Lebewesen selten Tiere jagen und sich hautsächlich pflanzlich ernähren, besitzen sie ein feines Gespür und können sich gegen Eindringlinge aller Art verteidigen. Sie fühlen sich als Rasse überlegen, verhalten sich aber freundlich anderen Rassen gegenüber, solange diese ihre Freundlichkeit erwidern. Die Elfen sind allgemein eine sehr friedfertige Rasse, da sie sich nicht auf das Niveau der anderen \"barbarischen\" Rassen herablassen wollen, wenn ihnen aber Unrecht getan wird, kennen sie keine Gnade.",
    baseHealth: 40, baseEnergy: 70, baseMana: 40,
    baseStrength: 7, baseDexterity: 12, baseSpeed: 12, baseIntelligence: 11, baseConstitution: 8, baseChill: 11,
    strengthPerLevel: 0.2, dexterityPerLevel: 0.4, speedPerLevel: 0.3, intelligencePerLevel: 0.4, constitutionPerLevel: 0.2, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 5, skill: { name: "Fernkampf+1", class: "", description: "Fernkampf+1", type: "passive", enlightened: false } },
      { levelRequired: 15, skill: { name: "Agilität", class: "", description: "+2 auf nächste Mobilitätsaktion, 10", type: "active", enlightened: false } },
      { levelRequired: 20, skill: { name: "Schnelllader", class: "", description: "+2 beim Würfeln für Zaubercasts", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_zwerge",
    name: "Zwerge",
    ageRange: "100-120",
    lore: "Zwerge leben in Höhlen mit hunderten oder sogar tausenden von Einwohnern. Zwerge sind Meisterschmiede und haben oft komplexe Minensysteme um ihre Städte konstruiert, in denen sie wertvolle Erze und Steine bergen, die sie zum Waffenschmieden verwenden. Sie sind sehr stolz auf ihre Schmiedekunst, weshalb sie bei vielen Rassen beliebt sind, allerdings weigern sie sich, ihre Waffen Kriegstreibern zu liefern, da ihre Kunst nicht für den Krieg gemacht ist. Deshalb geraten sie auch oft in Konflikte mit kriegerischen Rassen, was sie oft zur Zielscheibe von großen Stämmen und Königreichen macht. Da sie allerdings auch sehr kompetente Architekten sind, sind ihre Städte vor allen Angriffen sicher.",
    baseHealth: 60, baseEnergy: 50, baseMana: 40,
    baseStrength: 12, baseDexterity: 9, baseSpeed: 9, baseIntelligence: 10, baseConstitution: 12, baseChill: 9,
    strengthPerLevel: 0.4, dexterityPerLevel: 0.2, speedPerLevel: 0.2, intelligencePerLevel: 0.2, constitutionPerLevel: 0.4, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 0, skill: { name: "Schmiedekunst", class: "", description: "+20 Schmiedepunkte", type: "active", enlightened: false } },
      { levelRequired: 10, skill: { name: "Geschäftspartner", class: "", description: "50% mehr Gold durch Verkäufe", type: "passive", enlightened: false } },
      { levelRequired: 20, skill: { name: "Zwergenstärke", class: "", description: "+2 auf Waffenangriffe mit selbstgemachten Waffen", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_orks",
    name: "Orks",
    ageRange: "100-120",
    lore: "Orks leben zusammen in Kleingruppen, die ohne festen Wohnort durch das Land ziehen, generell aber feuchte und dreckige Orte als Unterkunft bevorzugen. Sie besitzen eine unnatürliche Ausdauer und können mehrere Wochen ohne Pausen laufen. Sie halten sich meistens von anderen Rassen fern und ernähren sich hauptsächlich von der Jagd, handeln aber oft mit ihrer Beute gegen komplexere Jagdwaffen, zu denen sie sonst keinen Zugang haben. Der Umgang mit anderen Rassen kann endet oft in gewalttätigten Auseinandersetzungen, da Orks sich nicht gerne für dumm verkaufen lassen und schnell aggressiv werden, wenn sie sich nicht durchsetzen können.",
    baseHealth: 60, baseEnergy: 60, baseMana: 30,
    baseStrength: 13, baseDexterity: 9, baseSpeed: 12, baseIntelligence: 9, baseConstitution: 11, baseChill: 7,
    strengthPerLevel: 0.4, dexterityPerLevel: 0.2, speedPerLevel: 0.3, intelligencePerLevel: 0.2, constitutionPerLevel: 0.3, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 0, skill: { name: "Unerschöpflich", class: "", description: "Bleibt bei 0 Ausdauer bei Bewusstsein, kann aber keine weitere Ausdauer verbrauchen", type: "passive", enlightened: false } },
      { levelRequired: 5, skill: { name: "Einschüchtern+2", class: "", description: "Einschüchtern+2", type: "passive", enlightened: false } },
      { levelRequired: 20, skill: { name: "Zähigkeit", class: "", description: "Konvertiert 1 Mana zu 0,8 Ausdauer (wird gerundet), 0", type: "active", enlightened: false } }
    ]
  },
  {
    id: "race_halbdrachen",
    name: "Halbdrachen",
    ageRange: "~500",
    lore: "Halbdrachen leben in zurückgezogenen Orten, wo sie von niemandem gestört werden, in kleinen Gemeinden mit bis zu 100 Einwohnern. Sie zeigen sich selten der Außenwelt, junge Halbdrachen reisen jedoch oft durch die Welt, um ihre wilde Natur auszuleben. Im Alter setzen sich die Drachen aber zur Ruhe und wollen in Frieden mit ihrer Familie leben. Da sie wochenlang ohne Essen auskommen können, zeigen sie sich nur sehr selten der Außenwelt, um Beute zu jagen, verhalten sich aber ansonsten friedlich anderen Kreaturen gegenüber, die nicht auf ihrem Speiseplan stehen. Sollte allerdings jemand in ihr Territorium eindringen, schützen sie ihre Familie um alle Kosten.",
    baseHealth: 50, baseEnergy: 50, baseMana: 50,
    baseStrength: 12, baseDexterity: 8, baseSpeed: 11, baseIntelligence: 12, baseConstitution: 12, baseChill: 8,
    strengthPerLevel: 0.4, dexterityPerLevel: 0.2, speedPerLevel: 0.3, intelligencePerLevel: 0.4, constitutionPerLevel: 0.4, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 0, skill: { name: "Fliegen", class: "", description: "Kann mit 1,5-facher Geschwindigkeit fliegen, 20 pro Runde", type: "active", enlightened: false } },
      { levelRequired: 15, skill: { name: "Erhabene Flamme", class: "", description: "Reduziert Manakosten von Feuermagie um 50%", type: "passive", enlightened: false } },
      { levelRequired: 30, skill: { name: "Drachenhaut", class: "", description: "50% Schadensresistenz gegen Magie, Immun gegen eigene Magie", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_zentauren",
    name: "Zentauren",
    ageRange: "60-80",
    lore: "Zentauren leben in kleinen Herden und reisen durch das Land und verweilen dabei nie lange am selben Ort. Zentauren sind Allesfresser, sind jedoch mit ihrer hohen Geschwindigkeit und Zielgenauigkeit gefährliche Jäger. Da Zentauren allgemein aber ein äußerst friedfertiges Volk sind, machen sie davon nur sehr selten Gebrauch. Sie verstehen sich mit allen Rassen und sind allseits anerkannt, werden aber oft als Feiglinge bezeichnet, da sie Gewalt verabscheuen und nur im absoluten Notfall handgreiflich werden, selbst wenn ihnen das langfristig noch mehr Probleme bereitet.",
    baseHealth: 45, baseEnergy: 70, baseMana: 35,
    baseStrength: 9, baseDexterity: 11, baseSpeed: 13, baseIntelligence: 10, baseConstitution: 10, baseChill: 8,
    strengthPerLevel: 0.3, dexterityPerLevel: 0.3, speedPerLevel: 0.4, intelligencePerLevel: 0.2, constitutionPerLevel: 0.2, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 0, skill: { name: "Vorreiter", class: "", description: "Benötigte Skills zur Klassenmeisterung-1", type: "passive", enlightened: false } },
      { levelRequired: 10, skill: { name: "Symbiose", class: "", description: "Wenn eine Person auf dir reitet, erhalten beide +1", type: "passive", enlightened: false } },
      { levelRequired: 20, skill: { name: "Ansturm", class: "", description: "Greift Gegner mit doppelter Geschwindigkeit an, 30", type: "active", enlightened: false } }
    ]
  },
  {
    id: "race_echsenmenschen",
    name: "Echsenmenschen",
    ageRange: "50-60",
    lore: "Echsenmenschen leben in kleinen Dörfern in feuchten Gebieten und ernähren sich hauptsächlich vom Fischfang. Sie interagieren ungern mit anderen Spezies und gelten deshalb allgemein als aggressiv und rücksichtslos. Trotz diesen Vorurteilen sind Echsenmenschen jedoch meistens friedlich gesinnt, verlieren aber schnell die Beherrschung und werden deshalb hauptsächlich von anderen Rassen gemieden. Wenn sich jemand nämlich einen Echsenmenschen zum Feind macht, verfolgen diese ihre Opfer gnadenlos durch jedes Terrain und nutzen jede Schwachstelle des Gegners aus, um diese schnell und effizient niederzustrecken. Den Echsenmenschen ist das nur recht, denn sie leben am liebsten unter sich.",
    baseHealth: 60, baseEnergy: 50, baseMana: 40,
    baseStrength: 12, baseDexterity: 12, baseSpeed: 11, baseIntelligence: 8, baseConstitution: 12, baseChill: 8,
    strengthPerLevel: 0.4, dexterityPerLevel: 0.3, speedPerLevel: 0.3, intelligencePerLevel: 0.2, constitutionPerLevel: 0.4, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 5, skill: { name: "VdW-Kräfte", class: "", description: "Kann an Wänden und Decken entlangklettern, 10 pro Runde", type: "active", enlightened: false } },
      { levelRequired: 15, skill: { name: "Echsenhaut", class: "", description: "50% Schadensresistenz gegen Wuchtangriffe", type: "passive", enlightened: false } },
      { levelRequired: 20, skill: { name: "Häutung", class: "", description: "Regeneriert 50% der maximalen Leben, 60", type: "active", enlightened: false } }
    ]
  },
  {
    id: "race_goblins",
    name: "Goblins",
    ageRange: "20-30",
    lore: "Goblins leben in kleinen Stämmen in Höhlen, versteckt vor dem Rest der Welt. Sie werden von anderen Rassen als Ungeziefer betrachtet und dementsprechend behandelt. Da sie aber äußerst flink und geschickt sind, stehlen sie oft von größeren Städten und bauen ihre Zivilisation auf ihrem Diebesgut auf. Dementsprechend können verschiedene Goblinstämme sehr unterschiedliche Kulturen haben. Doch während sie sehr problematische Beziehungen zu anderen Rassen haben, halten Goblins verschiedener Stämme immer zusammen und tauschen ihre Erfolge und Fortschritte untereinander aus.",
    baseHealth: 45, baseEnergy: 65, baseMana: 40,
    baseStrength: 11, baseDexterity: 10, baseSpeed: 13, baseIntelligence: 9, baseConstitution: 10, baseChill: 8,
    strengthPerLevel: 0.3, dexterityPerLevel: 0.3, speedPerLevel: 0.4, intelligencePerLevel: 0.2, constitutionPerLevel: 0.2, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 5, skill: { name: "Stehlen+2", class: "", description: "Stehlen+2", type: "passive", enlightened: false } },
      { levelRequired: 15, skill: { name: "Kidnapper", class: "", description: "Inventarkapazität+100", type: "passive", enlightened: false } },
      { levelRequired: 20, skill: { name: "Proliferation", class: "", description: "Erhält einmalig 10 freie Stats", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_trolle",
    name: "Trolle",
    ageRange: "~100",
    lore: "Trolle leben meist vereinzelt oder in Kleingruppen, die ein sehr enges, brüderliches Bündnis haben. Die Stärke von Trollen bestimmt über ihren sozialen Status, sodass die stärksten Trolle oft auf den schwächeren herumhacken und sie manchmal komplett aus ihrer Gruppe verbannen. Sollte man vereinzelten Trollen in der Wildnis begegnen, ist höchste Vorsicht geboten, da diese sehr reizbar sein können. Normalerweise sind Trolle nicht gefährlich, verabscheuen aber \"schwache\" Rassen wie Elfen und Feen, und verstehen sich viel besser mit Orks, die ihre Stärke zu schätzen wissen. Manchmal verbünden sich Trollstämme unter einem starken Anführer, um naheliegende Städte einzunehmen und ihr Gebiet zu erweitern. Diese Bündnisse halten jedoch selten lange, da ihre Hierarchie mit dem Tod ihres Anführeres sofort auseinanderfällt.",
    baseHealth: 75, baseEnergy: 65, baseMana: 10,
    baseStrength: 15, baseDexterity: 9, baseSpeed: 8, baseIntelligence: 7, baseConstitution: 15, baseChill: 7,
    strengthPerLevel: 0.5, dexterityPerLevel: 0.2, speedPerLevel: 0.2, intelligencePerLevel: 0.2, constitutionPerLevel: 0.4, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 5, skill: { name: "Blinde Wut", class: "", description: "+1, wenn im Ragemodus", type: "passive", enlightened: false } },
      { levelRequired: 10, skill: { name: "Massive Stärke", class: "", description: "Erhöhter Schaden und Rückstoß von Wuchtwaffen", type: "passive", enlightened: false } },
      { levelRequired: 25, skill: { name: "Trollstärke", class: "", description: "Verdoppelt Stärkemodifikator bei 0 Mana, kann Obergrenze von 4 überschreiten", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_gnolle",
    name: "Gnolle",
    ageRange: "~100",
    lore: "Gnolle sind geborene Jäger. Sie jagen in Kleingruppen, leben jedoch meist in größeren Stämmen in Steppengebieten. In diesen Gruppen gehen sie regelmäßig auf lange Reisen, um ihr Territorium zu erweitern, Feinde zu vertreiben, und Nahrung für ihren Stamm zu finden. Ihr Zusammenhalt im Stamm ist stark, jedoch stehen sie mit anderen Gnollstämmen oft auf Kriegsfuß, da sich diese oft ihr Territorium streitig machen. Andere Rassen wissen, wie brutal es in diesen Stammeskriegen zugehen kann, weshalb sie sich aus ihren Streitigkeiten raushalten und pflegen dadurch meistens freundliche Beziehungen zu ihnen. Sie handeln oft mit anderen Rassen, wo ihre Waffen besonders beliebt sind, da diese trotz ihrer Einfachheit sehr effektiv sind und mit regulären Waffen mithalten können.",
    baseHealth: 45, baseEnergy: 65, baseMana: 40,
    baseStrength: 10, baseDexterity: 13, baseSpeed: 12, baseIntelligence: 9, baseConstitution: 9, baseChill: 8,
    strengthPerLevel: 0.2, dexterityPerLevel: 0.4, speedPerLevel: 0.4, intelligencePerLevel: 0.2, constitutionPerLevel: 0.2, chillPerLevel: 0.2,
    skills: [
      { levelRequired: 0, skill: { name: "Urform", class: "", description: "Erhöht Bewegung um 50% bei Fortbewegung auf allen Vieren", type: "passive", enlightened: false } },
      { levelRequired: 10, skill: { name: "Spürnase", class: "", description: "Kann Geruchsspuren bis zu eine Woche später aufspüren, benötigt Geruchsprobe, 0", type: "active", enlightened: false } },
      { levelRequired: 20, skill: { name: "Wilde Jagd", class: "", description: "Nach einem Kill +5 auf nächsten Angriff in diesem Kampf", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_feen",
    name: "Feen",
    ageRange: "150-180",
    lore: "Feen leben in Wald- und Seegebieten mit starkem Bezug zur Natur. Sie leben im Moment und kümmern sich nicht um die Konsequenzen ihrer Taten, weshalb sie vom Rest der Welt meistens gemieden werden. Ihre Sorglosigkeit kann ihnen aber auch zum Verhängnis werden, da sie oft entführt und auf dem Schwarzmarkt verkauft werden, wo ihre Flügel als Trankzutat hohen Wert besitzen. Den Rest der Feen interessiert das jedoch wenig, sie haben besseres zu tun als ihr Leben für andere aufs Spiel zu setzen. Da Feen nicht essen müssen, verbringen die meisten ihr gesamtes Leben in Sicherheit, ohne aus ihrer Komfortzone ausbrechen zu müssen.",
    baseHealth: 30, baseEnergy: 40, baseMana: 80,
    baseStrength: 7, baseDexterity: 10, baseSpeed: 11, baseIntelligence: 13, baseConstitution: 7, baseChill: 13,
    strengthPerLevel: 0.2, dexterityPerLevel: 0.3, speedPerLevel: 0.3, intelligencePerLevel: 0.4, constitutionPerLevel: 0.2, chillPerLevel: 0.4,
    skills: [
      { levelRequired: 0, skill: { name: "Fliegen", class: "", description: "Kann fliegen, 10 pro Runde", type: "active", enlightened: false } },
      { levelRequired: 10, skill: { name: "Fata Morgana", class: "", description: "Kann sich unsichtbar machen, 10 pro Runde", type: "active", enlightened: false } },
      { levelRequired: 20, skill: { name: "Schicksalswende", class: "", description: "+2 auf nächsten Wurf, falls der letzte Wurf 15 oder mehr war", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_vampire",
    name: "Vampire",
    ageRange: ">1000",
    lore: "Vampire werden auch als Hüter des Wissens bezeichnet, da sie durch ihre hohe Lebensspanne und Intelligenz eine große Ansammlung an Informationen und Dokumenten aus aller Welt besitzen und diese in ihrem Unterschlupf aufbewahren. Sie hüten dieses Wissen wie einen Schatz und lassen nur selten andere an diesem Wissen teilhaben. Da sie in diesem Sinne sehr egoistische Wesen sind, leben sie meist isoliert von anderen, selbst anderen Vampiren, um ihr Wissen zu beschützen. Trotz dessen sind die Vampirunterschlüpfe sehr groß, elegant und modern, da in ihren Augen die Präsentation fast so wichtig ist wie der Inhalt selbst. Vampire leben an Orten, wo sie von der Sonne unversehrt bleiben, weshalb man sie meistens in dichten Wäldern, Höhlen und in der Unterwelt findet. Reisende, die ihre Behausung betreten wollen, werden festlich empfangen, kehren jedoch selten lebend zurück.",
    baseHealth: 50, baseEnergy: 40, baseMana: 60,
    baseStrength: 10, baseDexterity: 11, baseSpeed: 10, baseIntelligence: 12, baseConstitution: 10, baseChill: 11,
    strengthPerLevel: 0.2, dexterityPerLevel: 0.3, speedPerLevel: 0.3, intelligencePerLevel: 0.4, constitutionPerLevel: 0.2, chillPerLevel: 0.3,
    skills: [
      { levelRequired: 0, skill: { name: "Dunkle Seele", class: "", description: "Erhält Fledermausseele, Zauber mit Fledermausseele kosten 50% weniger Mana", type: "passive", enlightened: false } },
      { levelRequired: 10, skill: { name: "Blut saugen", class: "", description: "Saugt lebendigen Gegner Blut aus, heilt 2xD20, fügt ihm Schaden zu, 20", type: "active", enlightened: false } },
      { levelRequired: 25, skill: { name: "Opfergabe", class: "", description: "Kann Fähigkeiten mit Leben anstatt Ausdauer auslösen, kostet 50% weniger", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_meervolk",
    name: "Meervolk",
    ageRange: "70-90",
    lore: "Meerwesen leben in hochentwickelten Wasserstädten, die mit den größten Menschen- und Zwergenstädten mithalten können, da im Wasser keine Gefahr vor anderen Zivilisationen besteht. Dadurch pflegen sie friedliche Kontakte zu den meisten anderen Rassen und treiben Handel, wo vor allem ihre magischen Artefakte heiß begehrt sind. Neben ihrer technischen Affinität ist das Meervolk nämlich ein Meister im Umgang mit Magie, was in ihrer magischen Architektur besonders deutlich wird. Obwohl sich Meerwesen auch an Land problemlos fortbewegen können, bevorzugen sie das Wasser als Lebensraum, wo sie niemand stören kann. Da sie ihr Leben dadurch größtenteils in Sicherheit verbringen, sind sie oft naiv und werden von anderen oft hinters Licht geführt.",
    baseHealth: 40, baseEnergy: 50, baseMana: 60,
    baseStrength: 8, baseDexterity: 10, baseSpeed: 12, baseIntelligence: 13, baseConstitution: 8, baseChill: 12,
    strengthPerLevel: 0.2, dexterityPerLevel: 0.3, speedPerLevel: 0.3, intelligencePerLevel: 0.4, constitutionPerLevel: 0.2, chillPerLevel: 0.4,
    skills: [
      { levelRequired: 0, skill: { name: "Metamorphose", class: "", description: "Kann zwischen Wasser- und Landform wechseln, Wasserform kann unter Wasser atmen und verdoppelt Geschwindigkeit", type: "passive", enlightened: false } },
      { levelRequired: 15, skill: { name: "Wellenrufer", class: "", description: "Reduziert Manakosten von Wassermagie um 50%", type: "passive", enlightened: false } },
      { levelRequired: 20, skill: { name: "Aqua-Affinität", class: "", description: "+3 im Wasser", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_naturgeister",
    name: "Naturgeister",
    ageRange: "700-800",
    lore: "Naturgeister leben in der Natur, mit der Natur, für die Natur. Sie werden von der Erde selbst geboren und beschützen ihren Geburtsort gegen alle, die in ihrem Gebiet Unruhe stiften. Normalerweise verbringen sie ihr ganzes Leben an ihrem Geburtsort, eilen aber oft anderen Naturgeistern in Not zu Hilfe, wenn ihr Gebiet in Gefahr ist. Dementsprechend geraten sie oft in Konflikte mit anderen Rassen, die die Natur nicht zu schätzen wissen, denn obwohl für Naturgeister das Leben aller Tiere und Pflanzen heilig ist, verteidigen sie ihr Gebiet um jeden Preis. Sollte die Natur jedoch von anderen respektiert werden, beschenken die Naturgeister diese mit allen Gaben, die die Natur zu bieten hat.",
    baseHealth: 40, baseEnergy: 40, baseMana: 70,
    baseStrength: 8, baseDexterity: 10, baseSpeed: 9, baseIntelligence: 14, baseConstitution: 8, baseChill: 12,
    strengthPerLevel: 0.2, dexterityPerLevel: 0.3, speedPerLevel: 0.2, intelligencePerLevel: 0.4, constitutionPerLevel: 0.2, chillPerLevel: 0.4,
    skills: [
      { levelRequired: 0, skill: { name: "Elementargeist", class: "", description: "+1 auf Elementarmagie, wenn das Element mit dem Gebiet übereinstimmt", type: "passive", enlightened: false } },
      { levelRequired: 10, skill: { name: "Naturflüsterer", class: "", description: "Kann mit der Natur in Kontakt treten, um Informationen über das Gebiet zu erhalten", type: "passive", enlightened: false } },
      { levelRequired: 20, skill: { name: "Naturgewalt", class: "", description: "Halbiert Manakosten von Zaubern mit über 30 Castzeit", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_engel",
    name: "Engel",
    ageRange: "~300",
    lore: "Engel leben in der Überwelt, weit oben in den Wolken, abgelegen von allen anderen Zivilisationen. Da sie ohne Kontakt zum Sonnenlicht ihre Kraft verlieren, können sie nur bei Sonnenschein auf die Erde kommen. Da das der einzige Weg für sie ist, mit anderen Spezies Kontakt aufzunehmen, werden sie allerdings sehr selten gesichtet. Ihre Anwesenheit wird dafür allseits genossen und von manchen sogar als gutes Omen gesehen. In der Vergangenheit waren sie jedoch nicht an den Himmel gebunden. Vor vielen Generationen waren Engel auf der ganzen Welt vertreten und waren allen Rassen technologisch überlegen. Nach dem Großen Krieg machten die Dämonen die Erde für die Engel unbewohnbar, was ihren technologischen Fortschritt abrupt stoppte. Obwohl Engel heutzutage nur noch ein Schatten ihrer vergangenen Tage sind, sehnen sie sich danach, wieder zu ihrem früheren Glanz zurückzukehren.",
    baseHealth: 35, baseEnergy: 45, baseMana: 80,
    baseStrength: 10, baseDexterity: 10, baseSpeed: 12, baseIntelligence: 13, baseConstitution: 8, baseChill: 12,
    strengthPerLevel: 0.3, dexterityPerLevel: 0.3, speedPerLevel: 0.3, intelligencePerLevel: 0.4, constitutionPerLevel: 0.2, chillPerLevel: 0.3,
    skills: [
      { levelRequired: 0, skill: { name: "Fliegen", class: "", description: "Kann mit 1,5-facher Geschwindigkeit fliegen, 20 pro Runde", type: "active", enlightened: false } },
      { levelRequired: 15, skill: { name: "Segen", class: "", description: "+2 auf Heilzauber", type: "passive", enlightened: false } },
      { levelRequired: 25, skill: { name: "Deus ex machina", class: "", description: "Kosten von Dauerfähigkeiten und -zaubern, werden halbiert", type: "passive", enlightened: false } }
    ]
  },
  {
    id: "race_daemonen",
    name: "Dämonen",
    ageRange: "~300",
    lore: "Dämonen lebten in der Unterwelt versteckt, nachdem sie im Großen Krieg von den Engeln geschlagen und verbannt wurden. Seitdem ist allerdings einige Zeit vergangen und viele Dämonen haben angefangen, sich unter andere Zivilisationen zu mischen. Trotzdem sind viele Rassen den Dämonen immer noch misstrauisch gegenüber, ihre klugen Köpfe und Gerissenheit machen sie jedoch zu beliebten Arbeitskräften für reiche Händler und Adlige, um sich vor politischen Feinden zu schützen oder diese loszuwerden. Sie verstehen sich mit anderen Rassen allgemein recht gut, selbst mit den einst verfeindeten Engeln, haben jedoch die Tendenz, sehr obsessiv in ihren Beziehungen zu werden.",
    baseHealth: 50, baseEnergy: 50, baseMana: 50,
    baseStrength: 13, baseDexterity: 10, baseSpeed: 11, baseIntelligence: 11, baseConstitution: 9, baseChill: 11,
    strengthPerLevel: 0.4, dexterityPerLevel: 0.2, speedPerLevel: 0.3, intelligencePerLevel: 0.4, constitutionPerLevel: 0.2, chillPerLevel: 0.3,
    skills: [
      { levelRequired: 0, skill: { name: "Fliegen", class: "", description: "Kann mit 1,5-facher Geschwindigkeit fliegen, 20 pro Runde", type: "active", enlightened: false } },
      { levelRequired: 10, skill: { name: "Pakt", class: "", description: "Geht eine Bindung mit einer anderen Person ein, welche alle Fähigkeiten kopiert, dadurch aber jeglichen Schaden des Dämonen abfängt, 5 pro Runde für beide", type: "active", enlightened: false } },
      { levelRequired: 25, skill: { name: "Descende caelo", class: "", description: "Erhält doppelte Geschwindigkeit, solange Dauerfähigkeiten aktiv sind", type: "passive", enlightened: false } }
    ]
  }
];

// Add missing properties with defaults
const formattedRaces = races.map(race => ({
  id: race.id,
  name: race.name,
  ageRange: race.ageRange,
  lore: race.lore,
  baseHealth: race.baseHealth,
  baseEnergy: race.baseEnergy,
  baseMana: race.baseMana,
  baseStrength: race.baseStrength,
  baseDexterity: race.baseDexterity,
  baseSpeed: race.baseSpeed,
  baseIntelligence: race.baseIntelligence,
  baseConstitution: race.baseConstitution,
  baseChill: race.baseChill,
  healthPerLevel: 0,
  energyPerLevel: 0,
  manaPerLevel: 0,
  strengthPerLevel: race.strengthPerLevel,
  dexterityPerLevel: race.dexterityPerLevel,
  speedPerLevel: race.speedPerLevel,
  intelligencePerLevel: race.intelligencePerLevel,
  constitutionPerLevel: race.constitutionPerLevel,
  chillPerLevel: race.chillPerLevel,
  skills: race.skills
}));

// Write each race to its own file
const outputDir = './temp-races-fixed';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

formattedRaces.forEach(race => {
  const filePath = path.join(outputDir, `${race.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(race, null, 2), 'utf-8');
  console.log(`✓ Created ${race.id}.json`);
});

console.log(`\n✅ Generated ${formattedRaces.length} race files in ${outputDir}/`);
console.log('\nCopy these files to your server\'s data/races/ folder!');
