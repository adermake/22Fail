---
title: Ausrüstung
tab: Ausrüstung
icon: equipment
order: 70
---
## Waffentypen

:::note{type=tip title="Immer aktuell"}
Diese Liste wird direkt aus den Spieldaten erzeugt. Waffentypen, die in einer **Bibliothek**
angelegt wurden, erscheinen hier automatisch und überschreiben gleichnamige Standardtypen.
:::

Jeder Typ hat **zwei unabhängige Einstufungen**, die gern verwechselt werden:

::::grid{cols=2}
:::card{title="Waffenart" color=tuerkis}
**Leicht · Schwer · Fernkampf** — wie mit der Waffe gekämpft wird. Danach richten sich
Kämpfen und Talente.
:::
:::card{title="Gewichtsklasse" color=orange}
**Leicht · Mittel · Schwer** — wie schwer die Waffe ist. Bestimmt nur die vorgeschlagene
Schmiedegröße.
:::
::::

Ein Wurfmesser ist :hl[Fernkampf]{color=tuerkis}, wiegt aber :hl[Leicht]{color=orange} — beides
muss nicht zusammenpassen.

:::data{source=weapons}
:::

### Nur eine Waffenart

:::data{source=weapons category=fernkampf}
:::

## Materialien

:::note{type=tip title="Direkt aus den Bibliotheken"}
Alle Werte stammen aus den Materialien, die im **Bibliotheks-Editor** gepflegt werden — also
genau die Zahlen, mit denen in der Schmiede gerechnet wird. Das orange :hl[(+X)]{color=orange}
ist die Steigerung **pro Schmiedung**. Als :hl[geheim]{color=rot} eingestufte Materialien
erscheinen hier nicht.
:::

### Waffenmaterialien

:::data{source=materials kind=weapon}
:::

### Rüstungsmaterialien

:::data{source=materials kind=armor}
:::

### Nur allgemein bekanntes Wissen

Beispiel für eine spoilerfreie Liste — nur `bekannt`, ohne Effektspalte:

:::data{source=materials kind=weapon tier=bekannt effects=no}
:::
