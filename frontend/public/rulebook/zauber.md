---
title: Magie
tab: Magie
icon: spell
order: 60
---





## Magiesystem
Die Welt ist voller Magie, dennoch ist es nicht leicht, diese Energie zu verwenden. Das führt dazu, dass Mana für Magier hauptsächlich aus dem Inneren kommt.

Zauber bestehen hauptsächlich aus Runen. Diese können immer einer von drei Kategorien untergeordnet werden:
:::grid{min=200}
:::card{title="Element" accent=health}
:::
:::card{title="Formung" accent=mana}
:::
:::card{title="Seele" accent=energy}
:::
:::

## Runen

Runen sind Grundsteine der Magie. Durch präzise Zusammensetzung dieser Runen können Zauber mit einer zahllosen Anzahl an verschiedenen Effekten kreiert werden. Jede Rune besitzt folgende Stats:

:::grid{min=200}
:::card{title="Effektivität" color=#ef4444}
:::
:::card{title="Manakosten" color=#3b82f6}
:::
:::card{title="Fokuskosten" color=#8b5cf6}
:::
:::card{title="Voraussetzung" color=#22c55e}
:::
:::

:::note{type=info}
Zusätzlich können Runen besondere Effekte haben, die in der Beschreibung erklärt werden.
:::

Es gibt 3 Arten von Runen:

:::section{title="Elementarrunen"}
Elementarrunen können alles symbolisieren, was materiell ist. Damit können allgemeine Materialien gemeint sein, wie z. B. Wasser, Feuer, Eisen, Licht, Holz, Luft oder Stoff. Aber auch spezifischere Dinge wie Mensch, Elf, Drache, Stock, Schwert, Seil, ein 1980er Honda Civic usw.

Mit Elementarrunen allein kann man jedoch nicht viel machen. Man muss sie mit Formungsrunen oder Seelenrunen kombinieren, damit ein Zauber überhaupt etwas bewirkt.
:::data{source=runes type=elemental}
:::
:::
:::section{title="Formungsrunen"}
Formungsrunen  sind die Grundoperatoren der Zauberei. Man kann sie grob in drei Unterkategorien einteilen:

### Manipulation  
Darunter fallen Runen, die sich direkt auf ein Element auswirken, z. B.:
:::data{source=runes type=manipulation}
:::
### Selektoren  
Runen, die beim Auswählen oder Spezifizieren abstrakter Dinge helfen — etwa Selbst, Gegner,
Verbündete oder Ort:
:::data{source=runes type=selektor}
:::
### Ausführung  
Noch abstraktere Runen, die bei der Ausführung eines Zaubers eine Rolle spielen — etwa
Wiederhole, Stapel oder Zahlen:
:::data{source=runes type=ausfuehrung}
:::
:::
:::section{title="Seelenrunen"}
Seelenrunen werden vor allem für Beschwörungen verwendet.  
Im Allgemeinen sind sie wesentlich komplexer in ihrem Aussehen als Elementar- oder Formungsrunen.

Es gibt zwei Arten von Seelenrunen:

### Studierte Seelenrunen  
Studiert ein gelehrter Magier lange genug ein bestimmtes Lebewesen, lässt sich dessen Kernessenz auf eine Seelenrune herunterbrechen.  
Solange er fähig ist, die Rune akkurat nachzuzeichnen, lässt sie sich wie andere Runen benutzen. Der Magier kann diese imitierte Seelenrune dann so oft verwenden, wie er Fokus, Mana und Lust hat.

### Wahre Seelenrunen  
Wahre Seelenrunen sind so komplex, dass sie sich unter normalen Umständen nicht zeichnen lassen.  
Ein Magier schafft dies nur, wenn er im Besitz der Seele ist, die ihn beim Zeichnen leitet und nach dem Prozess in der Rune innewohnt.

Das bedeutet, dass ein Beschwörer nicht gleichzeitig zwei Beschwörungen mit derselben wahren Seelenrune aufrechterhalten kann.

### Die Seelenrune  
Im Zauber-Editor ist die Seelenrune fest eingebaut — sie wird nicht gezeichnet, sondern beim
Beschwören aus der Seele selbst geformt. Du erkennst sie an ihrer Form:
:::data{source=runes type=seele}
:::

:::

## Zauber

Mithilfe dieser Runen ist es nun möglich, einen vollwertigen Zauber zusammenzusetzen. Um einen Zauber nutzen zu können, braucht man aber zusätzlich noch ein Medium, durch den der Zauber benutzt werden kann. Schriftrollen oder magische Waffen sind dafür am besten geeignet, manche Situationen erfordern jedoch andere Unterlagen, die für einen Zauber herhalten müssen, oft mit reduzierter Kapazität. Jeder Zauber besitzt diese Attribute:

:::card{title="Effektivität" color=#ef4444}
Stärke des Zaubers, bestimmt wie bei Waffen den Angriffsschaden, kann aber auch für Dinge wie die Heilstärke stehen. Die Effektivität des Zaubers wird aus der Summe aller enthaltenen Runen bestimmt.
:::
:::card{title="Kosten" color=##3b82f6}
Sowohl Mana- als auch Fokuskosten werden aus der Summe aller enthaltenen Runen bestimmt. Ein Zauber kann nur gewirkt werden, wenn der Zaubernde ausreichend [Fokus](zauber#fokus) und Mana besitzt.
:::
:::card{title="Voraussetzung" color=#00ff00}
Bestimmt die Mindestanforderung für den gewählten Stat (meist Intelligenz), um den Zauber auszuführen. Die Voraussetzung wird ebenfalls aus der Summe aller enthaltenen Runen errechnet, die Rune mit der höchsten Voraussetzung zählt aber doppelt.
:::
:::card{title="Haltbarkeit" color=#ef9533}
Die Haltbarkeit bestimmt, wie oft ein Zauber benutzt werden kann. Einen Zauber zu wirken verbraucht Haltbarkeit mit folgender Formel:
:::formula
Voraussetzung*10
:::
:::
Die meisten magischen Zauberunterlagen sind allerdings spezifisch für Zauber gemacht und halten deutlich länger.
:::note{type=warning}
Sollte die Haltbarkeit eines Zaubers unter 100 fallen, muss beim Wirken von Zaubern gewürfelt werden, ob er zerstört wird. Je weiter die Haltbarkeit unter 100 fällt, desto höher ist der Würfelbonus für die Zerstörung der Rüstung.
:::formula
Würfelbonus: -5 + ⌊(100 - Rüstungshaltbarkeit)/10⌋
:::
:::

:::section{title="Wie mache ich einen neuen Zauber?"}
Damit dein Charakter einen neuen Zauber zusammenbauen benötigst du Kenntnis von Runen, die du für den Zauber verwenden willst.
Diese werden dann je nach gewünschtem Effekt angeordnet.

:::card{title="Ein Beispiel:"}
Start - Erzeuge - Feuer - Bewege 
:::

Runen alleine reichen aber nicht aus, um zu bestimmen, was ein Zauber machen kann und wieviel er kostet. Letztendlich schaut sich der Ersteller den Zauber zusammen mit dem Spielleiter an und definiert, was er genau macht und wieviel er kostet. Der Ersteller muss dem Spielleiter argumentieren können, warum die arrangierten Runen das tun würden, was die Beschreibung sagt. Auch wenn der Prozess viel Interpretationsspielraum bietet, haben Runen immernoch eine Stärke und Kosten, die als Grundrahmen dienen. Es wird z.B. durchaus Feuerrunen geben, die stärker als andere Feuerrunen sind.
:::runeflow{title="Beispiel: einfacher Angriffszauber"}
Erzeuge -> Feuer -> Bewege 
:::

:::

### Zauber zeichnen
Normalerweise werden Zauber außerhalb des Kampfes vorberereitet. Manchmal erfordert die Lage allerdings die Kreation eines spontanen Zaubers. Solange dieser irgendwie in eine Oberfläche (z.B. in die Erde oder in eine Wand geritzt) gezeichnet werden kann, ist er auch als Zauber verwendbar, ist aber in den meisten Fällen nach einer Verwendung unbrauchbar. Jeden Zug kann man 4 Runen mit einer Aktion und 2 als Bonusaktion zeichnen. Je nach [Skalierung](zauber#skalierung) können Runen auch mehr oder weniger Aktionen benötigen. Eine viermal größere Rune verbraucht zum Beispiel gleichermaßen die selbe Zeit, die 4 normalgroße Runen beanspruchen würden.

:::section{title="Allgemeines"}
Damit Zauber etwas bewirken können, müssen die Runen in deiner Nähe sein. Für Magie-Einsteiger bedeutet das, dass sie Hilfsmittel benötigen, auf denen die Runen angebracht sind, wenn sie unterwegs zaubern möchten.

Beliebte Optionen sind Schriftrollen oder Zauberstäbe mit gezeichneten oder eingravierten Runen.

Es gibt Wege eine gewisse Anzahl an Zaubern „verinnerlichen“. Das bedeutet, dass man in der Lage ist, den Zauber ohne Hilfsmittel zu wirken, indem man die Runen einfach in der Luft um sich herum formt.
Man kann das z.B über den Talentbaum im Magier Baum Richtung Runenkünstler erreichen.

Ein verinnerlichter Zauber lässt sich durch einen anderen ersetzen, allerdings dauert der Prozess des Verinnerlichens mehrere Stunden.
:::

:::section{title="Fokus" id=fokus}

Fokus ist ein Stat, der darüber aussagt, auf wie viele Dinge sich ein Charakter gleichzeitig konzentrieren kann. Er ist ein limitierender Faktor dafür, wie viele anhaltende Zauber ein Magier gleichzeitig aufrechterhalten kann.

Fokus erhält man aus Intelligenz mit folgender Formel:  
:::formula
5 + Intelligenz / 2
:::

Da Zauber sehr unterschiedlich aufgebaut sein können, wirkt sich Fokus auch unterschiedlich aus.  
Es kann sein, dass ein Zauber nur beim Wirken Fokus benötigt und dieser danach sofort wieder frei wird.  
Es kann aber auch sein, dass ein Zauber dauerhaft kontrolliert werden muss und während seiner aktiven Phase kontinuierlich Fokus verbraucht.
Fokusverbrauch kann sich über den Verlauf eines Spells ändern.
:::

:::section{title="Zauberradius"}

Zauber benötigen Nähe zum Zaubernden, damit sie geformt werden können. 
Der Zauberradius ist ein Stat, der angibt, wie weit vom Caster entfernt ein Zauber entstehen kann.  
Dieser Stat kann man beispielsweise durch Talente im Talentbaum erhöhen.

Zauber im Zauberradius einer anderen Person zu erzeugen ist deutlich schwieriger, weshalb der Zauber mit Nachteil ausgeführt wird.
Zauber direkt in Lebewesen oder festen Objekten zu erzeugen ist jedoch noch schwieriger bis nahezu unmöglich.
:::


:::section{title="Skalierung", id="skalierung"}

Runen haben eine Größe und können skaliert werden. Macht man eine Rune doppelt so groß, ist ihr Effekt doppelt so stark – allerdings verdoppeln sich auch die Manakosten und der Verbrauch der Haltbarkeit.

Dieser Effekt gilt ebenso in die andere Richtung: Skaliert man eine Rune herunter, wird der Effekt schwächer und die Kosten sinken entsprechend.
:::

:::section{title="Casten"}

Da manche Zauber zu komplex sind, um sie sofort auszulösen, lässt sich ihre Aktivierung zeitlich verzögern.  
Dazu wählt man einen beliebigen **Cast-Wert**.

Die Manakosten und Zaubervoraussetzungen werden dann mit dem Ergebnis folgender Formel multipliziert:
:::formula
100 / (Cast + 100)
:::
Um den Cast erfolgreich abzuschließen, würfelt man jede Runde einen D20, dessen Ergebnis fortlaufend addiert wird.  
Erreicht oder überschreitet man den festgelegten Cast-Wert, wird der Zauber aktiviert.

Ein Cast kann jederzeit freiwillig abgebrochen oder pausiert werden. Der bis dahin angesammelte Fortschritt des Zaubercasts bleibt bestehen, sinkt aber jede Runde um 10, wenn er nicht als *Aktion* gecastet wird.
:::



:::actions
:jump[Weiter zur Ausrüstung]{to=gear}

:jump[Zurück zu den Rassen]{to=klassen}
:::