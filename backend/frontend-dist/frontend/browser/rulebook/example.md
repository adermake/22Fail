---
title: Syntax-Beispiel
tab: Beispiel
icon: spell
order: 99
---

# Syntax-Beispiel

Diese Seite zeigt **jede** Funktion der Regelwerk-Syntax. Sie ist als Nachschlagewerk für
Autoren gedacht — schau dir `public/rulebook/example.md` an, um zu sehen, wie etwas gemacht wurde.

:::note{type=info title="Zwei Grundregeln"}
1. Alles Normale ist ganz normales **Markdown**.
2. Alles Besondere ist ein Block `:::name{optionen}` … `:::` oder inline `:name[text]`.
:::

## 1. Front-Matter

Jede Seite beginnt mit einem Kopf. Er bestimmt Tab-Name, Icon und Reihenfolge:

```
---
title: Syntax-Beispiel
tab: Beispiel
icon: spell
order: 99
---
```

| Feld | Bedeutung |
| --- | --- |
| `title` | Überschrift / Name der Seite |
| `tab` | Beschriftung im Tab-Balken (Standard: `title`) |
| `icon` | Icon-Name aus `public/icons` ohne `.svg` |
| `order` | Sortierung der Tabs (kleiner = weiter links) |

## 2. Normales Markdown

**Fett**, *kursiv*, ***beides***, ~~durchgestrichen~~ und `Code im Text`.

- Aufzählung
- Zweiter Punkt
  - Eingerückt
  - Noch einer
- Dritter Punkt

1. Nummeriert
2. Zweitens
3. Drittens

> Ein Zitat. Nützlich für Regeltexte, die wörtlich zitiert werden.

| Waffe | Schaden | Reichweite |
| --- | --- | --- |
| Messer | Schnitt | 0,5 m |
| Stab | Wucht | 1 m |

Ein Trennstrich:

---

```
Ein Codeblock.
Hier wird nichts interpretiert — auch ::: nicht.
```

## 3. Überschriften und Sprungmarken

Jede Überschrift wird automatisch zu einer Sprungmarke. Umlaute werden umgeschrieben:
`## Stärke` wird zu `#staerke`, `## Würfelsystem` zu `#wuerfelsystem`.

Eine eigene ID vergibst du mit `{#eigene-id}`:

### Beispielüberschrift mit eigener ID {#meine-id}

Diese Überschrift erreichst du über `example#meine-id`.

## 4. Abschnitte (Sections)

Abschnitte sind die großen Kästen. Sie lassen sich **auf- und zuklappen** — klicke auf den Titel.

:::section{title="Ein normaler Abschnitt" icon=dice}
Standardmäßig ist ein Abschnitt **offen**.

Er kann alles enthalten: Text, Listen, Notizen, Karten …
:::

:::section{title="Ein Abschnitt, der zugeklappt startet" icon=folder collapsed}
Mit `collapsed` startet der Abschnitt geschlossen. Praktisch für Details, die nicht
jeden interessieren.

Wenn jemand per Sprungmarke hierher springt, klappt der Abschnitt automatisch auf.
:::

## 5. Hinweis-Kästen

Vier Sorten, alle nach demselben Muster:

:::note{type=info title="Info"}
`:::note{type=info}` — der Standard. Für Erklärungen und Hintergrund.
:::

:::formula
`:::formula` — für Formeln. Nutzt Schreibmaschinenschrift.

Leben: Basis + 5 × Konstitution
Bewegung: 8 + Geschwindigkeit / 4
:::

:::warning{title="Achtung"}
`:::warning` — für Fallstricke und harte Grenzen.
:::

:::tip{title="Tipp"}
`:::tip` — für Empfehlungen und Kniffe.
:::

### Eigene Farben für Kästen

Jeder Kasten (und jeder Abschnitt) nimmt `color=` — Name oder Hex:

:::formula{color=#38bdf8}
`:::formula{color=#38bdf8}` — eine Formel in eigener Farbe.

Schaden = Effektivität × Trefferstärke
:::

:::note{color=orange title="Eigene Farbe"}
`:::note{color=orange title="…"}`
:::

:::formula{color=lila}
`:::formula{color=lila}` — Farbnamen funktionieren genauso.
:::

Auch Abschnitte: `:::section{title="…" color=tuerkis}`.

Und Karten — `color=` übersteuert dabei ein gesetztes `accent=`:

::::grid{cols=3}
:::card{title="Eigene Farbe" color=tuerkis}
`:::card{title="…" color=tuerkis}`
:::
:::card{title="Als Hex" color=#f97316}
`:::card{title="…" color=#f97316}`
:::
:::card{title="Akzent" accent=health}
`:::card{title="…" accent=health}` — die vier Theme-Farben gibt es weiterhin.
:::
::::

## 5b. Tabellen

Ganz normales Markdown — Spalten mit `|`, Trennzeile mit `---`:

| Stufe | Kosten | Effekt |
| --- | ---: | --- |
| 1 | 2 | Leicht |
| 2 | 4 | Mittel |
| 3 | 8 | Schwer |

`---:` richtet eine Spalte **rechts** aus, `:---:` **zentriert** — praktisch für Zahlen.
Breite Tabellen scrollen in ihrem eigenen Kasten, die Seite selbst verrutscht nie.

### Mit Rahmen — `:::table`

Optional bekommt eine Tabelle eine Überschrift, eine Farbe und ein Icon. Der Titel wird zur
Sprungmarke, ist also über die Suche und das Tab-Menü erreichbar.

:::table{title="Schmiedekosten" icon=forge color=orange}
| Stufe | Kosten | Effekt |
| --- | ---: | --- |
| 1 | 2 | Leicht |
| 2 | 4 | Mittel |
:::

Mit `{compact}` wird es enger — gut für lange Wertetabellen:

:::table{title="Kompakt" compact}
| Würfel | Ergebnis |
| --- | --- |
| 1–3 | Nichts |
| 4–5 | Trank |
| 6 | Waffe |
:::

## 6. Raster und Karten

:::grid{cols=3}
:::card{title="Standardkarte" icon=stat}
Karten liegen in einem `:::grid`. Das Raster bricht auf schmalen Bildschirmen automatisch um.
:::
:::card{title="Rote Karte" icon=life accent=health}
Mit `accent=health` wird die Karte rot.
:::
:::card{title="Blaue Karte" icon=mana accent=mana}
`accent` kennt: `accent` (lila), `health` (rot), `energy` (grün), `mana` (blau).
:::
:::

Karten dürfen alles enthalten — auch Formeln:

:::grid{cols=2}
:::card{title="Stärke" icon=attack accent=health}
:::formula
Würfelbonus: Stärke / 5
:::
Verschachtelung funktioniert ohne zusätzliche Doppelpunkte.
:::
:::card{title="Intelligenz" icon=mana accent=mana}
:::formula
Mana: 50 + 5 × Intelligenz
:::
Ein `:::` schließt immer den innersten offenen Block.
:::
:::

Mit `min=` steuerst du die Mindestbreite statt der Spaltenzahl: `:::grid{min=200}`.

## 7. Inline-Elemente

- Icon: `:icon[dice]` ergibt :icon[dice] — jeder Name aus `public/icons` ohne `.svg`.
- Hervorhebung: `:hl[+8/-8]` ergibt :hl[+8/-8].
- Taste: `:kbd[H]` ergibt :kbd[H].
- Eigene Farbe (fett): `:hl[Text]{color=rot}` ergibt :hl[Text]{color=rot}
- Eigene Farbe (normal): `:c[Text]{color=#38bdf8}` ergibt :c[Text]{color=#38bdf8}

Farben kannst du als **Name** oder als **Hex-Wert** angeben:

:::grid{cols=2}
:::card{title="Namen"}
`rot` :c[rot]{color=rot} ·
`gruen` :c[gruen]{color=gruen} ·
`blau` :c[blau]{color=blau} ·
`gelb` :c[gelb]{color=gelb} ·
`orange` :c[orange]{color=orange} ·
`lila` :c[lila]{color=lila} ·
`tuerkis` :c[tuerkis]{color=tuerkis} ·
`pink` :c[pink]{color=pink} ·
`grau` :c[grau]{color=grau} ·
`weiss` :c[weiss]{color=weiss}

Dazu passend zum App-Theme: `leben`, `ausdauer`, `mana`, `akzent`.
:::
:::card{title="Hex"}
Jeder Hex-Wert funktioniert:

`:c[Text]{color=#ff8800}` → :c[Text]{color=#ff8800}
`:hl[Wichtig]{color=#f43f5e}` → :hl[Wichtig]{color=#f43f5e}

Alles andere wird ignoriert (und beim Erzeugen des Manifests gemeldet), damit nichts
Unerwartetes ins Layout gelangt.
:::
:::

Beispiel im Fließtext: Drücke :kbd[H], um das Regelwerk zu öffnen. Ein :icon[dice] Wurf
von :hl[1] ist immer optimal.

## 8. Verlinkung und Sprünge

Normale Markdown-Links springen innerhalb des Regelwerks:

- Zu einer anderen Seite: `[Stats](stats)` → [Stats](stats)
- Zu einem Abschnitt: `[Stärke](stats#staerke)` → [Stärke](stats#staerke)
- Innerhalb dieser Seite: `[nach oben](#syntax-beispiel)` → [nach oben](#syntax-beispiel)
- Nach außen: `[Externer Link](https://example.com)` → [Externer Link](https://example.com)

Als Knopf — einzeln oder in einer Reihe:

:jump[Einzelner Sprungknopf]{to=stats#staerke}

:::actions
:jump[Zu den Grundlagen]{to=grundlagen}
:jump[Zu den Talenten]{to=talente}
:jump[Zum Kampf]{to=kampf#effektivitaet}
:::

## 9. Lebende Daten

Diese Tabellen kommen **direkt aus den Spieldaten** und können deshalb nie veralten.

:::note{type=tip title="Warum das wichtig ist"}
Ändert sich ein Talent oder eine Waffe im Spiel, ändert sich diese Seite automatisch mit.
Nichts muss von Hand nachgepflegt werden.
:::

### Talente — `:::data{source=talents}`

:::data{source=talents stat=STR}
:::

Mit `stat=STR` wurden hier nur die Stärke-Talente gezeigt. Ohne `stat` kommen alle.

### Waffen — `:::data{source=weapons}`

:::data{source=weapons category=leicht}
:::

Filter für Waffentypen — alle kombinierbar:

| Attribut | Wirkung |
| --- | --- |
| `category=` | **Waffenart**: `leicht`, `schwer`, `fernkampf` |
| `weight=` | **Gewichtsklasse**: `leicht`, `mittel`, `schwer` |
| `damage=` | `schnitt`, `stich`, `wucht` — trifft, wenn der Typ diese Art **auch** hat |
| `handed=` | `one` oder `two` |
| `tier=` | Wissensstufen. Standard blendet `geheim` aus; `tier=all` zeigt alles |
| `names="Messer, Speer"` | feste Auswahl, in dieser Reihenfolge |

`category` und `weight` sind **zwei verschiedene Achsen** — siehe Ausrüstung.

:::data{source=weapons weight=schwer names="Axt, Kriegsaxt, Hellebarde"}
:::

Ohne `category` werden alle Waffen nach Kategorie gruppiert.

### Materialien — `:::data{source=materials}`

:::data{source=materials kind=weapon names="Eisen, Holz, Silber"}
:::

Filter für Materialien — alle kombinierbar:

| Attribut | Wirkung |
| --- | --- |
| `kind=weapon\|armor` | Waffen- oder Rüstungswerte |
| `tier=bekannt,unbekannt` | Wissensstufen. Standard blendet `geheim` aus; `tier=all` zeigt alles |
| `rarity=common,rare,legendary` | nur diese Seltenheiten |
| `names="Eisen, Holz"` | feste Auswahl, in dieser Reihenfolge |
| `effects=no` | Effektspalte weglassen — dort stecken die meisten Spoiler |

`names="..."` behält die angegebene Reihenfolge; ohne `names=` wird nach Seltenheit sortiert.
Beide Schmiedewerte zeigen ihre Steigerung pro Schmiedung als oranges :hl[(+X)]{color=orange}.

:::data{source=materials kind=weapon}
:::

`kind=weapon` oder `kind=armor`.

### Runen — `:::data{source=runes}`

Runen kommen aus den **Bibliotheken** (nicht aus dem Code), werden aber genauso live geladen.
Ohne `type` werden sie nach Kategorie gruppiert; mit `type=` zeigst du genau eine Kategorie:

:::data{source=runes type=elemental}
:::

`type=` nimmt entweder eine **Oberkategorie** — `elemental`, `formung`, `seele`, `sonstiges` —
oder einen einzelnen **Untertyp**. `formung` ist die einzige Oberkategorie mit Untertypen:
`manipulation`, `selektor`, `ausfuehrung`. Ohne `type=` kommt alles, nach Kategorie gruppiert.

Die **Seelenrune** ist im Zauber-Editor fest eingebaut und liegt in keiner Bibliothek — sie wird
trotzdem mit angezeigt (`type=seele`), gezeichnet als der animierte Stapel aus dem Editor.

Filter für Runen — alle kombinierbar:

| Attribut | Wirkung |
| --- | --- |
| `type=` | Oberkategorie (`elemental`, `formung`, `seele`, `sonstiges`) **oder** Untertyp (`manipulation`, `selektor`, `ausfuehrung`) |
| `tier=` | Wissensstufen, wie bei Materialien. Standard blendet `geheim` aus; `tier=all` zeigt alles |
| `tags="Feuer, Eis"` | nur Runen mit **einem** dieser Tags |
| `names="Feuer, Kreis"` | feste Auswahl, in dieser Reihenfolge |

:::note{type=tip title="Wissensstufe"}
Runen werden im **Runeneditor** und in der **Runentabelle** der Bibliothek eingestuft:
:hl[geheim]{color=rot} (nie sichtbar), :hl[unbekannt]{color=gelb} oder
:hl[bekannt]{color=gruen}. Noch nicht eingestufte Runen gelten als **bekannt** — an
bestehenden Bibliotheken ändert sich also nichts, bis du sie einstufst.
:::

### Einzelne Rune — `:rune[Name]`

Mitten im Text: die Rune :rune[Feuer] verstaerkt den Zauber.
Der Name muss der Rune in der Bibliothek entsprechen (Gross-/Kleinschreibung egal).
Gibt es die Rune nicht, siehst du den Namen mit einem `?` — nie stillschweigend nichts.

### Runen verbinden — `:::runeflow`

Eine Kette pro Zeile. `->` verbindet, ein Label geht mit `-[Text]->`:

:::runeflow{title="Beispiel: einfacher Angriffszauber"}
Feuer -> Kreis -> Ziel
:::

Mehrere Zeilen ergeben mehrere Ketten untereinander:

:::runeflow
Feuer -[verstaerkt]-> Kreis
Wasser -> Kreis
:::

Der Inhalt wird **nicht** als Markdown gelesen — schreib die Namen einfach so hin.

## 10. Wenn etwas schiefgeht

Ein unbekannter Block wird sichtbar angemeckert, statt die Seite zu zerstören:

:::quatsch
Dieser Block existiert nicht.
:::

Genauso bei einer unbekannten Datenquelle — du siehst sofort, was erlaubt gewesen wäre.

:::section{title="Neue Seite anlegen" icon=folder collapsed}
1. Neue Datei in `frontend/public/rulebook/` anlegen, z.B. `zauberei.md`.
2. Front-Matter mit `title`, `tab`, `icon` und `order` setzen.
3. `npm run rulebook:manifest` ausführen (passiert bei `npm start` / `npm run build` automatisch).

Der Tab erscheint dann von selbst — es muss kein Code angefasst werden.
:::
