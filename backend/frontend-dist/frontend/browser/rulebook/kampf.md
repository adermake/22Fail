---
title: Kampf
tab: Kampf
icon: effektivity
order: 30
---

# Kampf

In dieser von Konflikten gezeichneten Welt sind Kämpfe unvermeidbar. Dennoch muss nicht jeder Konflikt mit Gewalt gelöst werden. Kreative Konfliktlösungen und Tricks können oft effektiver sein als eine direkte Konfrontation.
Falls ein Kampf jedoch nicht zu vermeiden ist, gibt es einige Dinge zu beachten.

## Kampfablauf

Wie auch außerhalb vom Kampf wird der Würfel zum entscheiden eines Kampfes verwendet. Bei einem Angriff muss sowohl der Angreifer als auch der Verteidiger würfeln, um die Stärke des Angriffs, sowie weitere Umstände, die sich durch einen Angriff 
ergeben können, zu ermitteln. Die genaue Reihenfolge lautet:
1. Der Angreifer bestimmt seine Angriffsaktion
2. Der Angreifer würfelt
3. Der Verteidiger bestimmt seine Reaktion
4. Der Verteidiger würfelt

:::section{title="Zugreihenfolge" icon=turnspeed id=zugreihenfolge}
Sobald ein Kampf beginnt, werden die Aktionen der Kämpfer eingeschränkt und folgen für den Rest des Kampfes bestimmten Regeln.
Jeder Kämpfer darf nur während seines Zuges agieren. Die Reihenfolge, in der jeder zum Zug kommt, wird folgendermaßen berechnet:
:::formula
Initiative: Geschwindigkeit + 15
:::
Charaktere mit hoher Geschwindigkeit sind also tendenziell häufiger am Zug. Bestimmte [Statuseffekte](status) und [Fähigkeiten](skills)
oder [Zauber](spells) können diesen Wert ebenfalls beeinflussen. Zusätzlich kann unter bestimmten Bedingungen unabhängig dieser Logik
die Zugreihenfolge verändert werden, z.B. durch bestimmte Fähigkeiten oder Story-Ereignisse.

Wenn zwei Charaktere im selben Team nacheinander am Zug sind, können sie diesen [synchron](sync) ausführen.
:::

:::section{title="Aktionsarten" icon=ability id=aktionen}
Während einem Zug hat man jeweils eine der 3 Aktionsarten zur Verfügung, sowie eine weitere während man nicht am Zug ist.

:::card{title="Aktion" accent=health id=aktion}
Die Hauptaktion, mit der alles Wichtige in einem Zug gemacht werden kann.
Eine Aktion kann außerdem verwendet werden, um entweder eine zusätzliche Bonusaktion oder Bewegungsaktion auszuführen.
Z.B. Angriffe, Zauber, Fähigkeiten
:::

:::card{title="Bonusaktion" accent=mana}
Die Bonusaktion ist für kleinere und meist schnelle Manöver verantwortlich.
Z.B. Items benutzen, Ausrüstung wechseln, bestimmte Fähigkeiten
Komplexere Bewegungen wie Springen, Schleichen oder Klettern sind ebenfalls Bonusaktionen.
:::

:::card{title="Bewegung" accent=energy}
In jedem Zug kann man sich eine bestimmte Distanz fortbewegen, abhängig von der [Bewegung](stats#bewegung).
Die Bewegung kann ebenfalls für einen Zug aufgegeben werden, um eine zusätzliche Bonusaktion zu erhalten.
:::

:::card{title="Reaktion" accent=accent}
Die Reaktion kann nur **außerhalb des eigenen Zuges** verwendet werden, wenn man von gegnerischen Aktionen beeinflusst wird. Bei Reaktionen würfelt der Gegner zuerst. Wenn sein Angriff den [Reaktionswert](stats#reaktion) des Gegners unterschreitet,
muss dieser ohne Statboni seine Reaktion würfeln und kriegt stattdessen den [Grundbonus](stats#reaktion)
und kann zusätzlich keine Fähigkeiten oder Zauber als defensive Aktion benutzen. (Panikreaktion)
Ansonsten kann er bei seiner Reaktion den Statmodifier und die Aktion frei wählen. (Volle Reaktion)
:::
 ### Extra-Aktion 
Durch bestimmte Fähigkeiten können Spieler eine **Extra-Aktion** erhalten. Diese verhält sich identisch zu einer regulären Aktion, kann also auch als Bonusaktion oder Bewegungsaktion verwendet werden. Die Extra-Aktion ist nicht zu verwechseln mit einem Extrazug, der als ein voller Zug mit Aktion, Bonusaktion und Bewegung zählt.

:::

## Schadensberechnung

Der Schaden berechnet sich aus vielen Faktoren, unter anderem der Würfelzahl des Angreifers und des Verteidigers, sowie
die Qualität derer Waffen und Rüstung.

:::section{title="Schadenswürfe" icon=dice id=schadenswuerfe}
Wenn der Angreifer und der Verteidiger würfeln, bestimmt die Differenz der beiden Würfe die Stärke des Angriffs. 

Stats beeinflussen den Würfelbonus, den jeder Angriff und jede defensive Aktion erhalten. Welcher Stat dafür gewählt wird, bestimmt die Voraussetzung der Waffe oder des Zaubers. Sollte keine Voraussetzung gegeben sein, kann der Stat vom Spieler gewählt werden, solange er im Kontext Sinn ergibt. Defensive Aktionen verwenden ebenfalls unterschiedliche Stats je nach Situation, 
z.B. Geschwindigkeit zum Ausweichen, Konstitution zum Blocken, Angriffsstats wie oben beschrieben für Gegenangriffe. Manche Angriffe erzwingen allerdings bestimmte Reaktionswürfe und können nicht frei gewählt werden.

Bei Treffern wird diese in folgende Gruppen unterteilt:
- Schwacher Treffer
- Normaler Treffer
- Starker Treffer
- Kritischer Treffer
- Tödlicher Treffer
:::
[Fernkampfangriffe](kampf#fernkampf) landen immer in der jeweils schwächeren Schadenskategorie

Würfelt der Verteidiger höher als der Angreifer, kann er den Angriff garantiert blocken oder ausweichen. Allerdings kann
er auch mit einer offensiven Reaktion selbst Schaden zufügen, kann dadurch aber eventuell nicht dem Schaden entgehen.
Sollte der Verteidiger allerdings deutlich höher würfeln als der Angreifer, entgeht er jeglichem Schaden und erhält sofort eine
zusätzliche [Aktion](kampf#aktion).

:::section{title="Effektivität" icon=effektivity id=effektivitaet}
Die Grundstärke eines Angriffs o.Ä. Je Stärker der Treffer, desto mehr wirkt sich die Effektivität auf den Schaden aus.
Die Effektivität schwankt im Normalfall zwischen 1 und 50, mit 10 als Standard für eine gute Waffe/Zauber/etc.
:::

:::section{title="Stabilität" icon=stability id=stabilitaet}
Die Stabilität bestimmt, wie sehr der eingehende Schaden reduziert wird.
:::formula
Schadensreduktion: 100/(Stabilität+100)
:::
Die Stabilität errechnet sich aus der Stabilität aller getragenen Rüstungsteile, kann aber auch durch Fähigkeiten oder Zauber verändert werden.
:::

## Sonstige Regeln

:::section{title="Gelegenheitsangriffe" icon=reaction id="gelegenheit"}
Wenn sich ein Gegner innerhalb eines Zuges in den Nahkampfradius eines Spielers bewegt und ihn im selben Zug wieder verlässt, erhält dieser Spieler eine Extra-Aktion, in der er den Gegner angreifen kann.
:::
:::section{title="Synchronangriffe" icon=sync id="sync"}
Wenn zwei oder mehr Charaktere aus derselben Gruppe nacheinander am Zug sind, können sie ihre Züge synchron ausführen. Ein Angriff, der von diesen Charakteren auf den selben Gegner ausgeführt wird, nennt sich Synchronangriff. 
Der getroffene Gegner erhält für alle Angriffe nur eine Reaktion, kann aber Teile des Angriffs bewusst ignorieren, um sich auf bestimmte Angriffe zu fokussieren. Diese Angriffe werden behandelt, als hätte der Gegner eine 15 als Reaktionswurf gewürfelt.
:::
:::section{title="Besondere Bewegungsarten" icon=movement id="bewegungsarten"}
### Schleichen
Beim Schleichen im Kampf wird die Bewegungsdistanz halbiert und ohne gutes Versteck wird man leicht entdeckt.
Aufmerksamkeit der Gegner spielt ebenfalls eine Rolle dabei, wie leicht man erwischt wird. Sollte man sich erfolgreich an einen Gegner heranschleichen, kann man einen [Überraschungsangriff](kampf#ueberraschung) ausführen.
:::
:::section{title="Überraschungsangriffe" icon=problem id="ueberraschung"}
Einen Gegner anzugreifen, bevor er den Angreifer bemerkt, gilt als Überraschungsangriff. Überraschungsangriffe erhalten einen Vorteil, können aber nur einmal pro Person benutzt werden.
:::
:::section{title="Fernkampf" icon=range id="fernkampf"}
- Bei der Schadensberechnung landen Fernkampfangriffe immer in der jeweils schwächeren Schadenskategorie.
- Fernkampfwaffen und -magie können keine Gelegenheitsangriffe ausführen und erhalten Nachteil, wenn sie einen Nahkämpfer in deren Reichweite angreifen
- Geworfene Nahkampfwaffen fügen auf gleiche Weise reduzierten Schaden zu und erhalten einen +1 Malus, erhöht um 1 für alle 5 Meter, die die Waffe geworfen wird.	
- Werfbare Fernkampfwaffen erhalten auch die Schadenreduktion, aber keinen Würfelmalus
:::
:::section{title="Statuseffekte" icon=status_effect id="status-attacks"}
Bestimmte Waffen oder Angriffsweisen können [Statuseffekte](status) auslösen. Normale Angriffe können aber ebenfalls bestimmte Statuseffekte auslösen, wenn der Spieler seinen Angriff explizit dafür nutzt. Die Erfolgschance und der Schaden von solch einem Angriff wird aber reduziert, kann aber je nach Situation stark variieren.
:::
:::section{title="Flair" icon=flair id="flair"}
Kreative oder unterhaltsame Angriffe, die zum Charakter und zur Situation passen, können zusätzliche Boni oder Mali erhalten.
Je unkonventioneller, desto besser.
:::

:::section{title="Rüstungsmalus" icon=equipment id=ruestungsmalus}
Jedes Rüstungsteil besitzt einen Rüstungsmalus. Der Durchschnitt der Rüstungsmali aller Ausrüstungsslots (inkl. leerer Slots) wird als Rüstungsmalus der gesamten Rüstung gewertet und der Geschwindigkeit abgezogen.
:::

:::section{title="Rüstungsnegation" icon=weightless id=ruestungsnegation}
Rüstungsnegation reduziert den Rüstungsmalus. Sollte er den Rüstungsmalus überschreiten, bleibt dieser auf 0.
:::

:::actions
:jump[Weiter zu den Klassen]{to=klassen}
:jump[Zurück zu den Stats]{to=stats}
:::
