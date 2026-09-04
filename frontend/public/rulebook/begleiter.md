---
title: Begleiter
tab: Begleiter
icon: companion
order: 90
---

# Begleiter

Begleiter sind verbündete Einheiten unter der Kontrolle eines Spielers, die sich jedoch unabhängig von ihm bewegen können. Die Unabhängigkeit des Begleiters und der Einfluss des Charakters auf ihn hängt aber von dessen Art ab.

## Stats

Wie auch die Spieler haben Begleiter [Stats](stats). Stats, die für beide gelten und gleich funktionieren sind:

:::grid{min=100}
:::card{title="Stärke" color="#ef4444"}
:::
:::card{title="Konstitution" color="#a76957"}
:::
:::card{title="Geschicklichkeit" color="#22c55e"}
:::
:::card{title="Intelligenz" color="#3b82f6"}
:::
:::card{title="Geschwindigkeit" color="#ef9533"}
:::
:::card{title="Wille"}
:::
:::
:::grid{min=200}
:::card{title="Leben" color="#ef4444"}
:::
:::card{title="Ausdauer" color="#22c55e"}
:::
:::card{title="Mana" color="#3b82f6"}
:::
:::
:::grid{min=150}
:::card{title="Fokus"}
:::
:::card{title="Reaktion" color="#a76957"}
:::
:::card{title="Grundbonus" color="#dddddd"}
:::
:::card{title="Bewegung" color="#ef9533"}
:::
:::

:::note{type=tip}
Außerdem besitzen Begleiter im Gegensatz zu menschlichen Charakteren einen eigenen *Effektivitäts- und Stabilitätswert*, der nicht von einer Waffe oder Rüstung abgeleitet wird. Sollte der Begleiter in der Lage sein, Ausrüstung zu tragen, können diese Werte allerdings mit denen der Ausrüstung überschrieben werden.
:::

Begleiter sind auch in der Lage, eigene Fähigkeiten, Zauber, Ausrüstung und weitere Items zu besitzen. Diese sind meistens auf den spezifischen Begleiter zugeschnitten.

:::card{title="Begleiter im Kampf" icon=attack}
Im Kampf verhalten sich Begleiter größtenteils wie reguläre Charaktere. Sie besitzen ihren eigenen Zug abhängig von ihrer Geschwindigkeit und besitzen ebenfalls eine Aktion, eine Bonusaktion und eine Bewegungsaktion und unterliegen in allen weiteren Bereichen den [Kampfregeln](kampf). Es gibt allerdings einige Effekte, die spezifisch Spieler betreffen und Begleiter ignorieren.
:::

:::note{type=tip title="Regeneration"}
Begleiter regenerieren so wie Spieler ihre Stats beim [Schlafen](stats#schlaf).
:::

## Beschwörungen

Eine besondere Untergruppe der Begleiter. Die meist durch Zauber beschworenen Beschwörungen unterscheiden sich von regulären Begleitern in einigen Aspekten. Sie werden vom Spieler beschworen und besetzen für die Dauer ihrer Beschwörung den Fokus des Beschwörers, anhängig von ihren [Fokuskosten](magie#fokus). Wenn ihre Leben auf 0 fallen, wird die Beschwörung sofort abgebrochen und fällt nicht in den kritischen Zustand. Außerdem können Beschwörungen keine Konditionsstats beim Schlafen wiederherstellen, Heilung durch Items, Fähigkeiten oder Zauber sind aber noch möglich.

:::card{title="Beschwörungsstats" icon=stat_icon}
Die finalen Stats einer Beschwörung sind identisch zu denen eines normalen Begleiters, allerdings setzen sie sich auf eine andere Weise zusammen. Da jede Beschwörung aus der Kombination einer Seele und eines Körpers besteht, werden auch ihre Stats aus einer Kombination dieser beiden Hälften berechnet. 
### Seele 
Eine Seele besitzt nur die 6 Grundstats[stats#grundstats], die aus der Effektivität der Seelenrune berechnet werden. Fähigkeiten und Zauber sind meist auch Teil der Seele, müssen aber auch mit dem Körper kompatibel sein, um benutzt werden zu können. 
### Körper
Um die Beschwörung zu vollenden, wird ein Körper benötigt, der entweder Teil des Beschwörungszaubers oder ein seperates Objekt, das die Seele beherbergt, sein kann. Der Körper liefert die Effektivität und Stabilität der Beschwörung, kann aber auch zusätzliche Stats besitzen, die die Seele entweder überschreiben oder auf sie addieren. Zusätzliche Rüstung, Waffen oder Inventare sind zudem auch meist Teil des Körpers.
:::note{type=warning}
Lebewesen als Körper für eine Beschwörung zu verwenden ist zwar theoretisch möglich, aber extrem schwierig und moralisch verwerflich.
:::formula
Nachteil und +5 Würfelmalus
:::
:::
:::

:::card{title="Beschwörungen beenden"}
Beschwörungen können jederzeit vom Beschwörer während seines Zuges beendet werden, was keine Aktion verbraucht.
:::
:::card{title="Skalierung"}
Beschwörungen können wie andere Zauber [skaliert](zauber#skalierung) werden, allerdings steigt die Effektivität der Seelenrune mit reduzierter Wirkung.
:::formula
Effektivität = Basis-Effektivität * (Skalierung + 3)/4
:::
:::
:::card{title="Rekursive Beschwörung}
Obwohl eine Beschwörung selbst Magie - inklusive Beschwörungsmagie - nutzen kann, kosten Beschwörungen doppelt so viel Fokus wie für den Beschwörer.

:::note {type=tip}
Das heißt, wenn die Beschwörung einer Beschwörung etwas beschwört, muss sie das **vierfache** and Fokuskosten zahlen. Diese neue Beschwörung wäre dann bereits bei den **achtfachen** Fokuskosten, sollte sie ebenfalls etwas beschwören.
:::
:::

:::actions
:jump[Zurück zur Herstellung]{to=craft}
:::