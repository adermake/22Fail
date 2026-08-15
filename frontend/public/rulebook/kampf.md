---
title: Kampf
tab: Kampf
icon: effektivity
order: 30
---

# Kampf

In dieser von Konflikten gezeichneten Welt sind Kämpfe unvermeidbar. Dennoch muss nicht jeder Konflikt mit Gewalt gelöst werden.
Kreative Konfliktlösungen und Tricks können oft effektiver sein als eine direkte Konfrontation.
Falls ein Kampf jedoch nicht zu vermeiden ist, gibt es einige Dinge zu beachten.

## Kampfablauf

Wie auch außerhalb vom Kampf wird der Würfel zum entscheiden eines Kampfes verwendet. Bei einem Angriff muss sowohl der Angreifer
als auch der Verteidiger würfeln, um die Stärke des Angriffs, sowie weitere Umstände, die sich durch einen Angriff 
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
Die Reaktion kann nur **außerhalb des eigenen Zuges** verwendet werden, wenn man von gegnerischen Aktionen beeinflusst wird.
Bei Reaktionen würfelt der Gegner zuerst. Wenn sein Angriff den [Reaktionswert](stats#reaktion) des Gegners unterschreitet,
muss dieser ohne Statboni seine Reaktion würfeln und kriegt stattdessen den [Grundbonus](stats#reaktion)
und kann zusätzlich keine Fähigkeiten oder Zauber als defensive Aktion benutzen. (Panikreaktion)
Ansonsten kann er bei seiner Reaktion den Statmodifier und die Aktion frei wählen. (Volle Reaktion)
:::


## Schadensberechnung

Der Schaden berechnet sich aus vielen Faktoren, unter anderem der Würfelzahl des Angreifers und des Verteidigers, sowie
die Qualität derer Waffen und Rüstung.

:::section{title="Schadenswürfe" icon=dice id=schadenswuerfe}
Wenn der Angreifer und der Verteidiger würfeln, bestimmt die Differenz der beiden Würfe die Stärke des Angriffs. 
Bei Treffern wird diese in folgende Gruppen unterteilt:
- Schwacher Treffer
- Normaler Treffer
- Starker Treffer
- Kritischer Treffer
- Tödlicher Treffer
:::
Fernkampfangriffe landen immer in der jeweils schwächeren Schadenskategorie

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

Opportunity Attack
Sync Attack
Überraschungangriffe
Fernkampf
Flair

:::section{title="Rüstungsmalus" icon=equipment id=ruestungsmalus}
*Noch zu schreiben.*
:::

:::section{title="Rüstungsnegation" icon=equipment id=ruestungsnegation}
*Noch zu schreiben.*
:::

Beim Schleichen im Kampf wird die Bewegungsdistanz halbiert und ohne gutes Versteck wird man leicht entdeckt.