---
title: Stats
tab: Stats
icon: stat_icon
order: 20
---

# Stats

Jeder Charakter besitzt Stats, die über seine Stärken in allen möglichen Bereichen des Lebens entscheiden.

**Kategorien:** Grundstats, Konditionsstats, Modifikatoren, Extrastats

Stats wirken sich auf Würfelboni aus, auf [Talente](stats#talente), auf Voraussetzungen für Waffen und Zauber.
Zusätzlich wirken sich die Grundstats auch auf alle anderen Stats zu unterschiedlichen Graden aus.

:::section{title="Level System"}
Level sind ein wichtiger Indikator der Stärke. Das Startlevel ist in der Regel **1**.
Das Level der Spieler steigt durch den Verlauf des Spiels an.

#### Grundstat-Erhöhungen
Stats erhöhen sich unterschiedlich schnell (Level × Skalierung).
Alle **3 Level** erhält man einen frei verteilbaren Stat.

#### Leben
Jedes Level erhöht sich der Basiswert der Leben um 2.

#### Talentpunkte (TP)
:::formula
Start: 5
+1 alle drei Level
:::

#### Fähigkeitspunkte (FP)
:::formula
Start: +2 FP pro Level inklusive Level 1
Alle 10 Level: +1 FP für jedes weitere Level
(z.B. Level 23 → 24: 2+2 = 4 FP)
:::

#### Rassenfähigkeiten
Man erhält drei Mal die Wahl zwischen zwei Rassenfähigkeiten auf unterschiedlichen Leveln zwischen 1 und 30.

#### Grundbonus und Reaktion
:::formula
Grundbonus: Level/8 + Wille/8
Reaktion: 5 - Grundbonus
:::
:::

## Grundstats

:::grid{min=300}
:::card{title="Stärke" icon=attack color="#ef4444"}
:::formula
Würfelbonus: (Stärke - 10) / 4
Inventarkapazität: 50 + Stärke×2 + Konstitution×3
:::
Viele Waffen setzen einen bestimmten Stärkewert voraus.
Der Würfelbonus hilft bei allen Aktionen, die Stärke voraussetzen.
:::

:::card{title="Konstitution" icon=life color="#a76957"}
:::formula
Leben: Basis + 5 × Konstitution
Inventarkapazität: 50 + Stärke×2 + Konstitution×3
Würfelbonus: (Konstitution - 10) / 4
:::
Der Würfelbonus hilft bei allen Aktionen, die Konstitution voraussetzen.
:::

:::card{title="Geschicklichkeit" icon=energy color="#22c55e"}
:::formula
Ausdauer: Basis + 5 × Geschicklichkeit
Würfelbonus: (Geschicklichkeit - 10) / 4
:::
Viele Waffen setzen eine bestimmte Geschicklichkeit voraus.
Der Würfelbonus hilft bei allen Aktionen, die Geschicklichkeit voraussetzen.
:::

:::card{title="Intelligenz" icon=mana color="#3b82f6"}
:::formula
Mana: 50 + 5 × Intelligenz
Fokus: 5 + Intelligenz / 2
Würfelbonus: (Intelligenz - 10) / 4
:::
Viele magische Waffen und Zauber setzen Intelligenz voraus.
Der Würfelbonus hilft bei allen Aktionen, die Intelligenz voraussetzen.
:::

:::card{title="Geschwindigkeit" icon=movement color="#ef9533"}
:::formula
Bewegung: 8 + Geschwindigkeit / 4
Würfelbonus: (Geschwindigkeit - 10) / 4
:::
Geschwindigkeit erhöht die Anzahl der Züge im Kampf.
Der Würfelbonus hilft bei allen Aktionen, die Geschwindigkeit voraussetzen.
:::

:::card{title="Wille" icon=grundbonus}
:::formula
Grundbonus: Level/8 + Wille/8
Reaktion: 5 - Grundbonus
Würfelbonus: (Wille - 10) / 4
:::
Der Würfelbonus hilft bei allen Aktionen, die Wille voraussetzen.
:::
:::

## Konditionsstats

Konditionsstats messen die momentane Verfassung. Sie errechnen sich aus einem Basiswert, dem entsprechenden Grundstat und sonstigen Boni — z.B. Fähigkeiten, Waffen, Zauber, Statuseffekte etc.

:::section{title="Leben" icon=life}
Bestimmt die körperliche Gesundheit. Wird durch Verletzungen und negative Statuseffekte reduziert.

:::formula
Basis + 5 × Konstitution
:::

:::warning{title="Kritischer Zustand"}
Fallen die Leben auf **0**, ist der Charakter im kritischen Zustand und verliert das Bewusstsein. Im kritischen Zustand können die Leben unter 0 fallen, gegnerische Angriffe machen allerdings nur ein Viertel des normalen Schadens — inklusive dem Angriff, der die Leben unter 0 gebracht hat.

In diesem Zustand verliert er jede Runde Leben, angefangen mit :hl[D10] pro Runde. Jede Runde, in der ein Charakter in kritischem Zustand nicht geheilt wird, erhöht sich die Würfelzahl permanent um **2**, bis der kritische Zustand geheilt wurde.

Der Charakter muss auf über 0 Leben geheilt werden, bevor er unter :hl[-300] Leben fällt und damit permanent stirbt.
:::
:::

:::section{title="Ausdauer" icon=energy}
Bestimmt das Durchhaltevermögen. Wird durch körperlich anstrengende Aktionen reduziert.

:::formula
Basis + 5 × Geschicklichkeit
:::

Fällt die Ausdauer auf **0**, verliert der Charakter das Bewusstsein. Der Spieler kann dann jeden Zug würfeln (D20), um Ausdauer zu gewinnen. Sobald dieser Wert **20%** der maximalen Ausdauer übersteigt, kommt er wieder zu Bewusstsein.

Aktive Fähigkeiten und Zauber, die vom Charakter aktiviert wurden, bleiben aktiv, können aber nicht gesteuert werden und behalten ihr vorheriges Verhalten bei.
:::

:::section{title="Mana" icon=mana}
Bestimmt die Kapazität für Magie. Wird durch Zauber verbraucht.

:::formula
Basis + 5 × Intelligenz
:::
:::

### Schlaf

Konditionsstats werden hauptsächlich durch Schlaf wiederhergestellt. Vor dem Schlafen etwas zu essen erhöht den wiederhergestellten Wert abhängig vom Essen. 
:::formula
Regeneration durch Schlaf = 25% der maximalen Konditionsstats + Essen
:::
Schlaf kann zusätzlich bis zu 3 Ladungen an Erschöpfung heilen.
:::note{type=warning}
Jeden Tag muss ein Liter Wasser (oder eine vergleichbare Flüssigkeit) getrunken werden, sonst wird die Statregeneration halbiert und anstatt Erschöpfung zu heilen wird eine zusätzliche Ladung auf den Charakter gewirkt.
:::

## Sonstige Stats

:::section{title="Grundbonus" icon=grundbonus id=reaktion}
Bestimmt die Reaktionsfähigkeit gegen unerwartete Angriffe oder Situationen.
:::formula
Grundbonus: Level/8 + Wille/8
Reaktion: 5 - Grundbonus
:::
:::
:::section{title="Bewegung" icon=movement id=bewegung}
Bestimmt die Bewegungsdistanz, die ein Charakter in einem Zug zurücklegen kann.

:::formula
Bewegung: 8 + Geschwindigkeit / 4
:::
:::

:::section{title="Fokus" icon=focus}
Mentale Kapazität für Zauber. Bestimmt, wie viele Zauber man gleichzeitig aufrechterhalten kann.

:::formula
Fokus: 5 + Intelligenz / 2
:::
:::

:::section{title="Zauberradius" icon=spell}
Der Zauberradius bestimmt, von wo aus ein Zauber beginnen kann.

**Start:** 1 m um den Anwender herum

:::note{type=warning}
Wenn Zauber im gegnerischen Zauberradius erschaffen werden, erhalten sie einen **Nachteil**.
:::
:::

:::section{title="Inventarkapazität" icon=equipment}
Bestimmt das Maximalgewicht, das getragen werden kann.

:::formula
Inventarkapazität: 50 + Stärke×2 + Konstitution×3
:::

:::warning
Bei über **80%** Auslastung wird die Geschwindigkeit halbiert, bei **100%** wird sie auf 0 gesetzt.
:::
:::

:::section{title="Kampfwerte"}
Diese Werte werden im Kampf-Kapitel erklärt:

- **Effektivität** — [siehe Kampf](kampf#effektivitaet)
- **Stabilität** — [siehe Kampf](kampf#stabilitaet)
- **Rüstungsmalus** — [siehe Kampf](kampf#ruestungsmalus)
- **Rüstungsnegation** — [siehe Kampf](kampf#ruestungsnegation)

:::

# Talente

Talente sind Spezialisierungen der [Grundstats](stats#grundstats), die hauptsächlich außerhalb vom Kampf verwendet werden.

Der Würfelbonus der Talente entspricht dem Würfelbonus des dazugehörigen Grundstats.
Er lässt sich zusätzlich mit **Talentpunkten** und **Fähigkeiten** erhöhen.

:::note{type=info}
Es gibt zusätzliche Talente, die hier nicht aufgelistet sind — für besonderes Wissen oder Talent, was je nach Charakter variieren kann.
:::

## Talentliste

:::data{source=talents}
:::

:::actions
:jump[Zurück zu den Grundlagen]{to=grundlagen}

:jump[Weiter zu Kampf]{to=kampf}
:::
