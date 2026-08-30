---
title: Ausrüstung
tab: Ausrüstung
icon: equipment
order: 70
---

# Ausrüstung

Eine gute Ausrüstung kann den Ausgang einer Schlacht entscheiden. Sowohl die Wahl einer Waffe als auch der Rüstung muss gut bedacht sein, denn sie bieten unterschiedliche Vor- und Nachteile. Ein Charakter kann pro Rüstungsslot jeweils ein Rüstungsteil ausrüsten (je nach spezifischer Rüstung und Charaktereigenschaften können in seltenen Fällen auch mehrere Rüstungsteile ausgerüstet werden).

:::grid{min=200}
:::card{title="Helm"}

:::
:::card{title="Brustpanzer"}
:::
:::card{title="Armschienen"}
:::
:::card{title="Beinschienen"}
:::
:::card{title="Stiefel"}
:::
:::
:::card{title="Waffe"}
Je nachdem, ob eine Waffe ein- oder beidhändig geführt wird, können 1-2 Waffen ausgerüstet werden.
:::
:::card{title="Extra"}
Zusätzlich existiert ein Extra-Slot für Accessoires und ähnliche Ausrüstungsgegenstände, die nicht in die anderen Felder passen.
:::

:::note{type=tip}
Ausrüstung an- oder abzulegen kostet eine Bonusaktion. Sie auszuwechseln kostet ebenfalls nur eine Bonusaktion.
:::

## Waffen

Waffen kommen in unterschiedlicher Form und Funktion, dennoch besitzen sie alle über diese grundlegenden Attribute:

:::card{title="Effektivität" color=#ef4444 id=w_eff}
Schadenspotenzial der Waffe. Je nach [Stärke des Treffers](kampf#schadenswuerfe) wird dieser Wert mit unterschiedlicher Stärke angewandt.
:::
:::card{title="Voraussetzung" color=#22c55e}
Mindestanforderung in genanntem Stat, um die Waffe führen zu können. Der geforderte Stat hängt meist von der Waffenart ab.
:::
:::card{title="Haltbarkeit" color=#ef9533}
Bestimmt, wie oft eine Waffe benutzt werden kann, bevor sie kaputtgeht. Ein Angriff verbraucht 1 Haltbarkeit. Wenn die Haltbarkeit beim Angriff unter 10 fällt, muss gewürfelt werden, ob die Waffe kaputtgeht. Der Würfelbonus für diesen Wurf lautet
:::formula
+5 - Haltbarkeit
:::
Eine kaputte Waffe ist nicht mehr verwendbar, kann aber bei einem Schmied mit Beigabe des Primärmaterials repariert werden.
:::
:::card{title="Reichweite" color=#dddddd}
Die Reichweite einer Waffe bestimmt, von wie weit entfernt man einen Gegner angreifen kann. Ein Meter entspricht hier einem Feld auf der Karte. Auch für Reaktionen (z.B. Gelegenheitsangriffe) muss der Gegner in dieser Reichweite sein, um angegriffen werden zu können.
:::
:::card{title="Schadensart"}
Es gibt 3 Schadensarten, die sich nicht direkt auf den Schaden auswirken, aber je nach Situation leicht unterschiedlich Wirken können.
:::grid{min=200}
:::card{title="Schnitt"}
:::
:::card{title="Stich"}
:::
:::card{title="Wucht"}
:::
:::
:::
:::card{title="Handhabung" color=#a76957}
Bestimmt, ob eine Waffe einhändig oder beidhändig benutzt werden kann. Beidhändige Waffen können in bestimmten Situationen auch einhändig geführt werden, sind aber deutlich schwerer zu handhaben.
:::
:::card{title="Nachladezeit" color="#291a1a"}
Die Nachladezeit legt fest, wie lange eine Waffe nach bzw. vor einem Angriff braucht, um angriffsbereit zu sein. Dies kann von einer Bonusaktion, zu mehreren Aktionen reichen.
:::

Alle Waffen können in 3 Waffenarten unterteilt werden:

:::card{title="Leichte Waffen" color=#ef9533}
Leichte Waffen sind die bevorzugten Waffen für Kämpfer, die auf viele schnelle Angriffe setzen. Wie der Name schon sagt sind sie meist leichter und sind einfacher zu nutzen, büßen dafür aber in ihrem Schaden und der Haltbarkeit ein.
:::data{source=weapons category=leicht tier=bekannt}
:::
:::
:::card{title="Schwere Waffen" color=#ef4444}
Schwere Waffen sind unschlagbar wenn es um pures destruktives Potenzial geht. Sie teilen den höchsten Schaden aus und haben mehr Haltbarkeit, aber wiegen mehr und haben höhere Statvoraussetzungen, um sie zu verwenden.
:::data{source=weapons category=schwer tier=bekannt}
:::
:::
:::card{title="Fernkampfwaffen" color=#22c55e}
Fernkampfwaffen sind eine spezielle Waffenart und kommen mit vielen eigenen [Regeln](kampf#fernkampf). Zusätzlich sind sie der Waffentyp, der am häufigsten eine Nachladezeit besitzt.
:::data{source=weapons category=fernkampf tier=bekannt}
:::
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
