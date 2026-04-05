# 22FailApp - Projekt-Architektur

## Überblick
Echtzeit-D&D-Kollaborationstool mit WebSocket-synchronisierter multiplayer-Funktionalität.

## Tech Stack
- **Backend**: NestJS, WebSocket Gateways
- **Frontend**: Angular (Standalone Components)
- **Kommunikation**: Socket.io (real-time bidirectional)
- **Datenspeicherung**: JSON-Dateien (worlds.json, races.json, data.json)

## Kern-Architektur

### Backend (`backend/src/`)
- **Gateways** (bidirektionale Kommunikation):
  - `battlemap.gateway.ts`: Karten-/Kampf-Events
  - `character.gateway.ts`: Charakterdaten-Sync
  - `world.gateway.ts`: Weltevents, CurrentEvents-Verwaltung
  
- **Services**:
  - `data.service.ts`: Daten-Persistierung (JSON read/write)
    - Entity-Collections (Items, Spells, Runes, Skills, LootBundles, StatusEffects) in eigene Unterverzeichnisse pro Welt
    - `readEntityCollection()` / `writeEntity()` für einzelne JSON-Dateien pro Entity
  - `asset-browser.service.ts`: Asset-Management (Items, Spells, Skills, Shops, Bundles)
    - `AssetType = 'item' | 'spell' | 'rune' | 'skill' | 'macro' | 'status-effect' | 'shop' | 'loot-bundle'`
    - `getTypeIcon()`: Emoji-Icons für Asset-Typen (🏪 shops, 🎁 bundles)
  - `map-storage.service.ts`: Karten-/Bild-Speicherung
  - `texture.service.ts`: Textur-Management
  - `image.service.ts`: Bildverarbeitung

### Frontend (`frontend/src/app/`)

#### Struktur
```
app/
  ├── lobby/          # Session-Erstellung, Raum-Auswahl
  ├── world/          # DM-Ansicht
  │   ├── asset-browser/              # Library-Assets (drag source)
  │   ├── current-events-manager/     # Event-Verwaltung (drop zone)
  │   ├── damage-calculator/          # Schadensrechner (DM-Tool, sendet DiceRollEvent)
  │   └── world.component.ts          # Haupt-DM-Controller
  ├── sheet/          # Spieler-Ansicht
  │   ├── character-tabs/             # Tab-Navigation (Stats, Inventar, Ereignisse)
  │   ├── current-events-view/        # Player event UI (portal-cards, not inline)
  │   ├── event-portal/               # Fullscreen portal modal für Shop/Bundle (NEW)
  │   ├── transaction-popup/          # Animated Transaction-Feedback (NEW)
  │   └── sheet.component.ts          # Haupt-Charakter-Controller
  ├── model/          # Datenmodelle (Character, Item, Shop, etc.)
  ├── services/       # WebSocket-Clients, State-Management
  └── shared/         # Reusable Components (Editoren, Chat, etc.)
```

## Datenfluss

### Event-System (Shops & Loot Bundles)
1. **Library Creation**: Shops/Bundles werden in Library-Editor erstellt
2. **Drag from Library**: Asset-Browser emittiert dragStart mit type + index
3. **Drop to World**: Current-Events-Manager empfängt drop, fügt zu `currentEvents[]` hinzu
4. **WebSocket Broadcast**: World-Gateway sendet `currentEventsUpdated` an Party
5. **Player Sync**: Alle Charaktere der aktiven Party empfangen Update
6. **UI Update**: Events-Tab in character-tabs zeigt neue Events
7. **Interaction**: Spieler klicken Event, sehen Shop/Bundle in current-events-view
8. **Transaction**: Kauf/Claim triggert WebSocket-Update, synchronisiert Stock/Availability

### Asset-Typen
- **Items**: Waffen, Rüstung, Verbrauchsgüter (drag-drop fähig)
- **Spells**: Zauber mit Range/Duration/Cost
- **Runes**: Magische Runen — komplett überarbeitet:
  - `RuneDataLine` Model: `{ name, color, types[] }` — `types.length > 1` = Mixed-Port (akzeptiert einen der Typen)
  - `RuneBlock` Model: `name, description, drawing, tags, glowColor, fokus, fokusMult, mana, manaMult, effektivitaet, statRequirements, identified, learned, libraryOrigin, inputs[], outputs[]`
  - Datenlinien: Eingänge + Ausgänge, jede Linie hat Name, Farbe, Typ-Tags. Mixed-Port = ein Slot mit mehreren akzeptierten Typen.
  - `app-runes`: 2-Spalten-Layout (Grid links 50%, Detail rechts 50%) — kein app-card
  - Sparse Slots: `(RuneBlock | null)[]`, 5 Spalten, freie Platzierung
  - `app-rune-editor`: Vollbild-Overlay, 2 Spalten (Bild/Tags links, Kosten/Datenlinien rechts)
    - Canvas: transparent (kein schwarzer Hintergrund), `aspect-ratio: 1/1`, `max-width: min(calc(100vh-500px), 400px)` — passt immer ins Layout
    - Multi-Pass-Glow (4 Passes: 40/20/10/4px blur, Breite 9/7/6/6px) + weißer Innenkern (2.5px)
    - Standardfarbe: `#06b6d4` (Cyan)
    - Farbwähler: Preset-Dots + `<input type="color">` für benutzerdefinierte Farben
    - Kosten kompakt: Inline-Grid (4 Spalten: Label, Basis, ×, Multiplikator), keine großen Blöcke
    - Anforderungen kompakt: Flex-Wrap mit kleinen Inline-Inputs
  - `identified = false` → Nur Bild im Detail-Panel; `learned` = Goldener Rahmen in Grid
- **Skills**: Fähigkeiten/Talente — vollständig überarbeitet:
  - `SkillBlock` Model: `name, class, type, enlightened, description, cost?, actionType?, skillId?, statModifiers?, libraryOrigin?`
    - `cost`: `{ type: 'mana'|'energy'|'life'; amount; perRound? }` — Kosten für aktive Skills
    - `actionType`: `'Aktion'|'Bonusaktion'|'Keine Aktion'|'Reaktion'` — Aktionsverbrauch
  - `SkillDefinition` in `data/skill-definitions.ts`: kanonische Definitionen; 298 Skills, 42 Klassen; Beschreibungen 1:1 aus AlleKlassen.txt (UTF-8, verbatim); lookup by `skillId > name+class > name`
  - `fix-descriptions.js` (Workspace-Root): Wartungs-Script zum Neu-Einlesen aller Beschreibungen aus `AlleKlassen.txt` (bei source-Änderungen ausführen)
  - `CLASS_DEFINITIONS`: `ClassHierarchy` (string-index) → `{ tier:1-5, angle, children[] }` — bestimmt Rang-Badge
  - `app-skills` (`sheet/skills/`): 2-Spalten-Grid, Suchleiste + 5 Filter (Typ/Klasse/Aktion/Kosten/Rang), Vollbild-Editor-Overlay via `app-skill-editor`
  - `app-skill` (`sheet/skill/`): Kompakte Game-Karte, Rechtsklick → Kontextmenü (Bearbeiten/Löschen), Typ-Farbcodierung mit CSS `--tc`/`--tc-bg` Tokens
    - Typen-Farben: active=#f59e0b (amber), passive=#a78bfa (violett), dice_bonus=#34d399 (grün), stat_bonus=#38bdf8 (blau)
    - Action-Pills: Aktion=rot, Bonusaktion=blau, Keine Aktion=grau, Reaktion=orange
  - `app-skill-editor` (`shared/skill-editor/`): Vollbild-Modal, unterstützt cost+actionType+enlightened-Felder
- **Status Effects**: Buffs/Debuffs für Charaktere
  - `StatusEffect` Model: id, name, description, icon, color, diceBonuses, statModifiers, embeddedMacro/embeddedMacros, macroActionId, defaultDuration, maxStacks, isDebuff, public, tags
  - `ActiveStatusEffect`: statusEffectId, sourceLibraryId, appliedAt, duration, stacks, customEffect
  - `StatusStatModifier.stat`: 'strength'|'dexterity'|'speed'|'intelligence'|'constitution'|'chill'|'life'|'energy'|'mana'
  - **Integration**: Status-Effekt statModifiers und diceBonuses fließen in stat.component, currentstat.component, true-stats.service und dice-roller.component ein (via LibraryStoreService Resolution)
  - **Sheet-Komponente** (`sheet/sheet-status-effects/`):
    - 2/3 + 1/3 Layout: Karten-Bereich (links) + Ausführungs-Sidebar (rechts)
    - Karten: Icon, Name, Dauer-Badge, Stack-Badge, Drag-Handle (⠿) für Neuordnung
    - CDK DragDrop für Reihenfolge-Änderung
    - Expanded Panel: Stack +/- Buttons, Dauer +/- Buttons, Effekt-Auslösen, Bearbeiten, Entfernen
    - Ausführungs-Sidebar: Zeigt aktuellen Effekt in Kette mit Würfelergebnis, "Nächster ▸" Button
    - Kette: "Alle Ausführen" startet Kette, manuelle Weiter-Taste schreitet voran, nach letztem Effekt Aufräum-Phase
    - Picker Overlay: Suche + Effekt-Karten
  - **World-Dashboard**: Kontextmenü mit "Status verwalten" → Status-Manager-Overlay (Suche + Effekt-Grid + aktive Entfernung)
- **Shops**: Verkaufsveranstaltungen mit Deals (normal/reverse)
  - `isReverseDeal: true` → Shop kauft Items von Spielern
  - `identified?: boolean` → `false` = Spieler sehen "Unbekannter Effekt" statt Item-Details
  - Library Editor: Einzelne identified-Checkbox pro Deal + "Alle identifiziert" Bulk-Toggle
- **Loot Bundles**: Beutepakete mit claimable Items

## Währungs-System
- **10:1 Ratios**: 10 Kupfer = 1 Silber, 10 Silber = 1 Gold, 10 Gold = 1 Platin
- `convertToCopper(Currency): number` / `copperToCurrency(number): Currency`
- `formatCurrency(Currency): string` → "3g 2s 5c"
- `formatCurrencyAsGold(Currency): string` → "0.32g"
- `formatCurrencyAsUnits(Currency): string` → "3 Silber 2 Kupfer"
- `getCoinParts(Currency): CoinPart[]` → farbige Coin-Darstellung

## Sync-Mechanismen

### JsonPatch-System
- **Path Format**: Slash-basiert (`/inventory/-`, `/currency`) wird zu Dot-basiert (`inventory.-`, `currency`) normalisiert
- **Array-Append**: `-` als finaler Key appendet zu Array (z.B. `/inventory/-` fügt Item hinzu)
- **Optimistic Updates**: Frontend wendet Patches lokal an, dann WebSocket-Broadcast
- **Konsistenz**: Alle applyJsonPatch-Implementierungen (character-store, world-store, lobby-store, components) müssen:
  1. Path normalisieren (Slashes → Dots)
  2. `-` für Array-Append unterstützen
  3. Array-Indices korrekt behandeln

### Current Events (Shop/Bundle State)
- **Zentraler State**: `world.currentEvents[]` im Backend
- **Persistierung**: Wird in `world.json` gespeichert (data.service.ts saveWorld)
- **Echtzeit-Sync**: Änderungen (Kauf, Claim) triggern sofortige broadcasts
- **Party-Scope**: Nur aktive Party-Mitglieder sehen Events
- **Inventory Mechanics**: 
  - Shop: Deducts gold, adds item to inventory, increments `deal.sold`
  - Bundle: Adds item to inventory, marks as claimed per character
  - Stock Updates: Sofortige Synchronisation über WebSocket

### UI-Komponenten-Interaktionen
- **Drag Source**: asset-browser.component (Library-Ansicht)
- **Drop Target**: current-events-manager.component (World-Ansicht)
- **Player View**: current-events-view.component (Sheet-Ansicht - kompakte Kacheln-Grid, 160px min-width)
- **Portal UI**: event-portal.component (Fullscreen-Modal, animiert)
  - Shop-Theme: Braun/Gold Gradient; Loot-Theme: Dunkelblau/Lila
  - Close-Button: `position: fixed`, außerhalb des `overflow: hidden` Portals → nie geclippt
  - Münzanzeige: farbige Coin-Pills (Kupfer=#b87333, Silber=#c0c0c0, Gold=#ffd700, Platin=#6ab2e5)
  - Preisanzeige-Toggle: `localStorage('priceDisplayMode')` = `'highest-units'` | `'total-gold'`
  - Spieler-Geldanzeige: Alle Münzwerte + Gesamt-Gold im Shop-Header
  - Item-Inspektion: Klick auf "Details ansehen" → Inspektions-Modal
    - `identified !== false`: zeigt Beschreibung/Stats; `identified === false`: "Unbekannter Effekt"
  - Kauf-Logik: `deductMoney()`, `addMoney()`, `addItemToInventory()` senden Patches via `@Output() patch`
  - `@Output() patch` → verdrahtet mit `store.applyPatch()` in sheet.component.html
- **Transaction Popup**: transaction-popup.component (Slide-In, fade-out)
- **Visual Feedback**: 
  - isDraggingOverList property
  - `.drag-over` CSS class (dashed border)
  - `cursor: grab/grabbing` für draggable Items
- **Drag-Chip Zentrierung** (Inventory + Runes):
  - `cdkDragStarted`: `event.event as MouseEvent` → `grabX/Y = clientX - rect.left/top`
  - Preview-Template: `.drag-preview-root` (width:0, height:0, overflow:visible) + `.drag-chip` (position:absolute, left=grabX-halfW, top=grabY-halfH)
  - Ergebnis: Drag-Chip ist immer zentriert auf den Cursor

## Styling-System
- **Variablen**: CSS custom properties (--bg, --border, --accent, --text)
- **Theme**: Dunkel/Lila-Akzente (rgba(107, 70, 193))
- **Animationen**: fadeIn, float, slideIn, shake
- **Hover-Effects**: translateY(-2px), box-shadow depth
- **Gradienten**: linear-gradient für Buttons, Karten-Hintergründe

## Item-Komponente (`sheet/item/`)
- **Default-Zustand**: Eingeklappt (`isFolded = true`) — zeigt Icon + Name + Tags-Reihe
- **Doppelklick**: Klappt Item ein/aus (`(dblclick)="toggleFold()"`)
- **Slot-Tag**: `.tag-slot` zeigt Rüstungsslot (HELM/BRUST/ARME/BEINE/STIEFEL/EXTRA) oder WAFFE — via `get slotLabel()` Getter, mit `armorType`-Mapping
- **Tag-Größe**: Gewicht/Effizienz/Stabilität-Tags mit `[class.tag-big]="!isFolded"` — größer wenn ausgeklappt
- **Fold-Button**: Kubisch (`aspect-ratio: 1`, min 34×34px), rechts in Item-Controls, kein Lost-Button mehr
- **Kontextmenü**: Rechtsklick → "Bearbeiten" / "Verloren markieren|↩ Nicht verloren" (via `toggleLostFromMenu()`) / "Löschen"
  - `showContextMenu`, `contextMenuX/Y`, `@HostListener('document:click')` zum Schließen
- **Fold-Output**: `@Output() foldChange = new EventEmitter<boolean>()` — Parent trackt Faltzustand
- **Bar-Layout** (Haltbarkeit + Custom Counter, identisch): `.bar-row` → label + `.bar-with-input` → `.bar-track` (overflow:hidden) + number-input
  - Fill-Element: `.bar-fill` mit `durabilityClass` resp. Inline-Farbe
  - Slider-Klasse: `.bar-slider` (einheitlich für beide)
  - Kein dunkler Wrapper-Hintergrund mehr
- **Drag Compact**: `[compact]="draggedIndex === i"` blendet Tags-Reihe während Drag aus
- **Ausgeklappte Reihenfolge**: Beschreibung → Effekte → Stat-Boni → Würfelboni → Counter → Haltbarkeit → Anforderungen → Fähigkeiten

## Inventar-Komponente (`sheet/inventory/`)
- **Grid-Layout**: CSS Grid, 4 Spalten. Dunkle Slot-Kacheln immer sichtbar — auch wenn ein Item drin liegt (Slot-Hintergrund zeigt durch).
- **Inventar-Panel**: Dunkles `rgba(0,0,0,0.28)` Hintergrund + `inset`-Schatten für tiefen Inventar-Look. Jede Slot-Kachel: `rgba(0,0,0,0.32)` + `inset`-Schatten (sunken-box-Effekt).
- **Vorgefülltes Slot-Raster**: `get paddedSlots()` gibt immer `max(8, ceil((N+4)/4)*4)` Slots zurück. Items stehen vorne, Leerstellen sind `null`. Neue Reihe erscheint wenn unterste Reihe voll.
- **Sparse Inventory**: `inventory: (ItemBlock | null)[]` — Items behalten ihre Position. Drag legt Items direkt auf Ziel-Slot ab ohne Kompaktierung. `deleteItem` nullt Slot aus statt zu filtern. Trailing nulls werden getrimmt.
- **Explizite Platzierung**: `[style.grid-column]="(i%4)+1"` + `[style.grid-row]="getItemGridRow(i)"`. `getItemGridRow(i)` zählt Expansion-Rows davor (pro Row max. 1).
- **Drag ohne Jitter**: `[cdkDropListSortingDisabled]="true"` — CDK verschiebt Items nie während Drag. Invisible placeholder hält Zelle stabil.
- **Snap-back Fix**: Gleiche-Container-Swaps werden über `(cdkDragEnded)="onDragEnded($event)"` verarbeitet, NICHT über `cdkDropListDropped`. `onDragEnded` tauscht direkt in `paddedSlots-Raum` (sparse), kein filter().
- **Cross-Container**: Equipment→Inventory läuft weiterhin via `onDrop`, setzt `crossContainerDropHandled=true` damit `onDragEnded` überspringt.
- **Pointer-Tracking**: `onDragMoved` nutzt `document.elementsFromPoint` + `[attr.data-slot-idx]` für visuellen Drag-Target-Highlight.
- **Tab-System für gleiche Reihe**: Chips sind die Tabs — Klick auf Origin-Chip (`(click)="setActiveTab(getVisualRow(i), i)"`) wechselt aktives Item. Keine extra Tab-Buttons. Dot-Indikatoren (`.exp-dot`) zeigen Anzahl unfolded Items. `activeTabPerRow: Map<number,number>`.
- **`get expansionRows()`**: Liefert `{row, activeIdx, unfolded[]}` pro Row mit mind. 1 unfolded Item. HTML iteriert dieses Getter für Expansion-Rows.
- **Verbundene Form**: `.item-slot.is-origin` hat Accent-Border oben/seitlich (Boden transparent), `z-index:1`. `.expansion-row` hat Accent-Border seitlich/unten (Oben none), `margin-top: calc(-0.35rem)` damit es direkt an den Chip-Slot anschließt. `::before` Pseudo-Element zeichnet eine Gradient-Linie quer über den Expansion-Row-Rand mit einem transparenten Loch bei `calc(var(--chip-col)*25%)` bis `calc((var(--chip-col)+1)*25%)`. Chip-Slot (z-index:1) sitzt darüber, schließt visuell als eine Form.
- **Fold-Button**: Kleiner `▲` Button oben-rechts im Chip (`.chip-fold-btn`), sehr unauffällig (`rgba(255,255,255,0.18)`).
- **cdkDragHandle auf Chip**: `cdkDragHandle` Direktive nur auf `.origin-chip` — wenn Item ausgeklappt ist, kann nur der Chip gezogen werden. Cursor `grab` nur auf dem Chip.  `.expansion-row ::ng-deep .item-card { cursor: default }` verhindert Grab-Cursor auf Expansion-Item.
- **Fold bei Drag-Start**: `onDragStarted` klappt ausgeklappte Items automatisch ein bevor der Drag beginnt.
- **Kein Snap-Back**: `::ng-deep .cdk-drag-animating { transition: none !important }` deaktiviert CDK-Slide-Back-Animation. Items wechseln direkt zur neuen Position.
- **Sichtbarer Placeholder**: `.drag-placeholder-wrapper` zeigt einen sichtbaren Slot (dashed border + leerer Hintergrund) statt unsichtbar zu sein. `.cdk-drag-placeholder { opacity: 0 }` Regel entfernt, damit custom Placeholder sichtbar bleibt.

## Equipment-Komponente (`sheet/equipment/`)
- **Layout**: Vertikales Flex-Stack. Slot-Labels als CSS-Pill-Badges (HELM, BRUST, ARME, BEINE, STIEFEL, EXTRA).
- **Drag-Placeholder**: `style="height:52px"` inline.

## Item-Komponente (`sheet/item/`)
- **Bars (Haltbarkeit + Counter)**: `.bar-track` → `.bar-fill` (absolut, z-index 1) + `.bar-slider` (range input, absolut, z-index 2, `background:transparent`). `bar-slider::-webkit-slider-runnable-track { background: transparent }` verhindert doppelten Browser-Track.
- **Fold via Doppelklick**: `onCardDblClick` → `toggleFold()` (wenn `!hideFoldControls`).
- **Slot-Tag**: `.tag-slot` für Rüstungsslot/Waffe.
- **Kontextmenü**: Rechtsklick → Bearbeiten / Verloren / Löschen. `ItemComponent.activeContextMenu` (static) tracked das offene Menü — beim Öffnen wird das vorherige automatisch geschlossen. `@HostListener('document:click')` + `@HostListener('document:keydown.escape')` schließen das Menü.
- **Lost-Styling**: `.item-card.lost { opacity: 0.4 }` — KEIN `filter: grayscale()` (würde `position:fixed` für Kontextmenü korrumpieren, da filter einen neuen Stacking-Context erzeugt).

## Equipment-Komponente (`sheet/equipment/`)
- **Layout**: Vertikales Flex-Stack (nicht 2-Spalten-Grid) — Items brauchen die volle Breite für Text
- **Slot-Labels**: Text-Abkürzungen als CSS-Pill-Badges (`.slot-abbr`): HELM, BRUST, ARME, BEINE, STIEFEL, EXTRA
  - Kein Emoji → professionelleres Aussehen
- **Drag-Placeholder**: `style="height:52px"` inline, immer kompakt

## Event-Portal Währungsanzeige
- **Position**: Fixierte Überlagerung unten-rechts (`position: fixed; bottom: 2rem; right: 2.5rem; z-index: 20500`)
- **Größe**: Groß und gut lesbar (`.coin-amount-lg` 1.3rem)
- **Münz-Icons**: CSS-gestylte Kreise (`.coin-icon`) mit `inset box-shadow` für 3D-Coin-Look
  - Farben: Kupfer #b87333, Silber #c0c0c0, Gold #ffd700, Platin #6ab2e5
- **Preistoggle**: Nur noch Umschalter im Header, kein Wallet dort mehr

## Bekannte Limitierungen
- Keine Datenbank: JSON-Files für Persistierung
- Keine User-Auth: Session-basiertes system
- File-basierte Assets: Alle Libraries/Characters als JSON-Files

## Status-Effekt-System (`sheet/sheet-status-effects/`)
- **Model**: `StatusEffect` (id, name, icon, color, diceBonuses, statModifiers, embeddedMacro, embeddedMacros[], macroActionId, defaultDuration, maxStacks, isDebuff, public, tags)
- **ActiveStatusEffect**: (statusEffectId, sourceLibraryId, appliedAt, duration, stacks, customName, customDescription, customDiceBonuses, customEffect)
- **Multi-Macro**: `embeddedMacros: ActionMacro[]` — alle Macros feuern bei Auslösung
- **Multi-Stack**: Bei n Stapeln wird jeder Macro n× ausgeführt
- **UI**: Karten-basiert (90×110px Cards), Klick → Overlay-Panel, Rechtsklick → Kontextmenü
- **Trigger-Animation**: `is-triggering` CSS-Klasse mit Pulse/Glow-Keyframes
- **Hover**: Zeigt letzte Wurfergebnisse als Tooltip (`lastRollResults: Map`)
- **Execution Popup**: Fixed-Overlay (8s auto-dismiss), zeigt Würfel/Ressourcen/Fehler, Stack-Badge
- **Picker**: Fixed-Overlay (zentriert), Suche, Grid-Layout
- **Duration Tick-Down**: Bei Ausführung wird duration-1, bei 0 → Effekt entfernt (mit Fade-Animation)
- **Execute All**: Sequentiell mit 2s Delay, tickt alle Dauern, entfernt abgelaufene

## World Dashboard (Partei-Übersicht)
- **Char-Card Stil**: Skill-Card-inspiriert (`#0f1829` bg, 3px accent left-border, rounded corners)
- **Resource Bars**: Gradient-Fill mit Glow-Schatten (Health=rot, Energy=grün, Mana=blau)
- **Währung**: Coin-Pills via `getCoinParts()` (nicht raw text)
- **Status-Effekte**: Icon-basierte Chips (ohne ✕-Button), zeigen Stacks + Duration
- **Picker**: Absolutpositioniert mit Backdrop-Click zum Schließen
- **Context Menu**: Rechtsklick auf Charakter → Sheet öffnen, Status-Effekte anwenden/entfernen
- **applyStatusEffectToCharacter()**: Respektiert maxStacks + defaultDuration

## Library-Editor (`library-editor/`)
- **Dependency-Items**: `loadDependencyItems()` lädt Items von eigener Library und allen Dependencies. Wird auf `ngOnInit` + nach `saveLibrarySettings()` aufgerufen.
- **Dependency-Reload-Button**: "↺ Abhängigkeiten neu laden" in Settings-Panel — erlaubt manuelles Reload. Zeigt Anzahl geladener Elemente.
- **Shop Deal Editor**: `availableItems/Runes/Spells/Skills/StatusEffects` Signals — gefüllt von `loadDependencyItems`. Select-Dropdown zeigt alle verfügbaren Items aus Dependencies.

## Page Titles
- `document.title` wird gesetzt in:
  - `sheet.component.ts`: `sheet.name` (Charaktername) bei sheet$ subscription
  - `world.component.ts`: `worldName` bei route params load  
  - `library-editor.component.ts`: `library.name` nach `loadLibrary()`

## Konventionen
- **Sprache**: UI vollständig auf Deutsch
- **Icons**: Emoji-basiert (🏪 shop, 🎁 bundle, 🎪 events, etc.)
- **Type Safety**: Strict TypeScript mit expliziten unions
- **Component Architektur**: Standalone Angular Components (kein NgModule)

## Spell Node Editor (`shared/spell-node-editor/`)
- **Purpose**: Visueller Flow-Graph-Editor für Zauber-Logik (Runen-Knoten + Verbindungen)
- **Tech**: Angular 21 zoneless, RAF-driven CD, SVG-Overlay für Verbindungen
- **Tab-System**: Topbar hat 2 Tabs — "Netzwerk" (Graph) und "Eigenschaften" (Name/Desc/Tags/Kosten). Canvas wird nur in `activeTab === 'netzwerk'` gerendert.
- **Kosten manuell**: `spellCostMana` + `spellCostFokus` — direkt editierbare Felder in Eigenschaften-Tab. Button "⚡ Schätzen" → `calculateEstimate()` überschreibt Felder mit Kalkulations-Ergebnis.
- **SpellBlock-Felder**: `costMana?: number`, `costFokus?: number`, `statRequirements?: SpellStatRequirements`
- **Drag-Ghost**: `onPaletteDragStart()` erstellt temporäres `ghost`-Div, `setDragImage()`, dann `setTimeout(() => ghost.remove(), 0)`
- **Models** (`spell-node.model.ts`):
  - `SpellGraph { startNode, nodes[], connections[] }`
  - `SpellNode { id, runeId, x, y }` — Runen-Knoten auf Canvas (world coords)
  - `SpellConnection { id, fromNodeId, fromPortId, toNodeId, toPortId, waypoints[], condition?, precastKnown?, exclusive?, passthroughEnabled?, maxPassthrough?, lineDelay? }`
    - `condition` — Branch-Label; Branch-Farbe: orange (unbekannt), lila (bekannt)
    - `precastKnown` — ob Bedingung vor dem Cast bekannt (bekannte Branches = benannte CostCases)
    - `exclusive` — (nur wenn precastKnown) true → nur eine Branch feuert; false → alle Kombinationen (2^N-1 Fälle)
    - `passthroughEnabled + maxPassthrough` — Rücklauf (Passthrough)
    - `lineDelay` — Verzögerung in Runden
  - `PendingConnection.isPickup?: boolean` — true beim Umleiten bestehender Verbindungen (Void-Drop = Abbruch, nicht QS)
- **Routing**: Queen-Movement (H/V/45°), `queenRoute()` + `buildQueenPath()`; Zyklen erhalten Auto-Waypoints
- **Waypoints**: Rechtsklick auf Linie = Wegpunkt ziehen/erstellen; Box-Select + Entf zum Löschen
  - Box-Selektion: 5px Screen-Pixel-Toleranz für Waypoints
- **Undo/Redo**: Ctrl+Z/Y (max 60 Schritte); Ctrl+C/X/V = Copy/Cut/Paste ausgewählter Knoten+Verbindungen (Waypoints werden mit Offset kopiert)
- **Inspektor**: Runen-Info (Klick auf Knoten) ODER Verbindungs-Inspektor (Linksklick auf Linie) — gegenseitig exklusiv
- **Canvas Badges**: `getBadgePositions(c)` garantiert ≥36px Screen-Abstand zwischen Badge-Centern. Badges skalieren mit zoom (`scale(zoom)` im SVG-Transform). Condition-Pill (Mitte), Passthrough-⟳ (t=0.15), Delay-⧗ (t=0.32+).
- **Linienselektion**: Grüner Glow (`#22c55e`, stroke-width 10), nicht mehr breiter weißer Block
- **Quick-Search Popup**: Connection in Void droppen (nur neue, nicht isPickup) → Popup mit Runen-Suche; inkompatible Runes werden ausgegraut. Platziert Rune an Welt-Position + verbindet sie.
- **Schließen-Dialog**: 3-Button-Modal (Speichern / Nicht speichern / Abbrechen) statt `confirm()` bei ungespeicherten Änderungen
- **Kein Schließen beim Speichern**: `world.component` hält `editingSpell` als stabile Referenz unabhängig von Library-Updates; Speichern schließt den Editor nicht mehr

## Rune Model (`model/rune-block.model.ts`)
- `RuneBlock.fokusVerlust?: number` — Fokus-Kosten pro ungenutztem Daten-Eingangsport (ersetzt altes `fokusMult`)
- `DATA_TYPE_PRESETS`: beinhaltet `Mana` (#f59e0b) — kein `MediumTyp` mehr
- `RUNE_TYPE_CONFIGS.medium`: inputs=[Fluss, Mana], outputs=[Fluss, Medium]

## Spell Cost Calculator (`shared/spell-node-editor/`)
- `spell-cost.model.ts`: Interfaces `TurnCostEntry`, `CostCase { entries, fullEntries?, trace, subcases?, isUnknownMerge? }`, `CaseTotals`, `SpellCostResult`
- `spell-cost-calculator.ts`: Pure function `calculateSpellCost(graph, availableRunes)`
  - DFS traversal der Flow-Verbindungen
  - Mana-Multiplikator-Kette: Rune mit Mana-Daten-Eingang erbt Multiplikator vom Provider
  - Fokus: `baseFokus + unusedDataInPorts × fokusVerlust`
  - Loops: `passthroughEnabled + maxPassthrough` (UNLIMITED_LOOP_CAP=5)
  - Delay: `lineDelay` → Turn-Buckets (Turn 0 = Wirkungsrunde)
  - Branches: `precastKnown=true` → benannte Fälle; `false` → Worst-Case-Merge
  - `exclusive=true` → N separate exklusive Cases (eine Branch feuert); `exclusive=false` → 2^N-1 Kombinations-Cases
  - `fullEntries` = geteilte-Pfad-Kosten + Branch-Kosten (gemergt); gleiche fullEntries → kollabieren zu "Gesamt"
- `spell-cost-display/`: Zeigt per-Turn-Breakdown; Multi-Turn → Rundenliste, Branches → scd-branch-case Blöcke

## Spell-Karte (sheet/spell/)
- Kompakte Ansicht: Thumbnail (52×52), Name, Kostenpillen (◆ Mana, ◇ Fokus), Stat-Chips (STR/GES/...), Beschreibung (3-zeilig geclampt), Tags, Binding-Info
- `statReqEntries` getter: Filtert SpellStatRequirements auf Werte > 0, mappt zu `{label, value}`-Array

## Skill-System (`data/skill-definitions.ts` + `model/skill-definition.model.ts`)

### Stat "Wille" (intern: `chill`)
- **Internes Property**: `chill` — in `character-sheet-model.ts` und `data.json` gespeichert
- **WICHTIG**: Der interne Key bleibt `chill` für JSON-Kompatibilität mit bestehenden Saves. Nur UI-Text zeigt "Wille".
- **Alle Anzeige-Texte** → "Wille" (nie "Charisma", "Chill", "Charm", "Charme"):
  - StatKey-Mapping in allen Komponenten: `chill → 'Wille'`
  - Abkürzung: `WIL` (nicht `CHR` oder `CHL`)
- `CalculatedStats.wille` (früher `chill`) in `true-stats.service.ts`
- `calculateWille()` (früher `calculateChill()`)

### SkillDefinition Interface
```typescript
interface SkillDefinition {
  id: string; name: string; class: string;
  type: 'stat_bonus' | 'passive' | 'active' | 'dice_bonus';
  description: string;
  enlightened?: boolean;  // true = ! prefix in source
  statBonus?: { stat: SkillStatType; amount: number };
  statBonuses?: Array<{ stat: SkillStatType; amount: number }>;  // für dual-stat skills
  cost?: { type: 'mana'|'energy'|'life'; amount: number; perRound?: boolean };
  actionType?: 'Aktion'|'Bonusaktion'|'Keine Aktion'|'Reaktion';  // alle active skills haben dieses Feld
  bonusAction?: boolean;  // deprecated, verwende actionType
  requiresSkill?: string | string[];
  infiniteLevel?: boolean;
  maxLevel?: number;
}
```

### Klassen-Hierarchie (CLASS_DEFINITIONS)
- Tier 1: Magier, Kämpfer, Techniker
- Tier 2: Kampfzauberer, Heiler, Schütze, Dieb, Krieger, Barbar
- Tier 3: Arkanist, Hämonant, Seelenmagier, Jäger, Kampfakrobat, Ritter, Berserker, Plünderer, Mönch, Schnellschütze
- Tier 4: Phantom, Gestaltenwandler, Formationsmagier, Runenkünstler, Mentalist, Assassine, Klingentänzer, Erzritter, General, Paladin, Templer
- Tier 5: Manalord, Artificer, Attentäter, Duellant, Waffenmeister, Kriegsherr, Omen, Koloss, Wächter, Dunkler Ritter, Orakel, Nekromant
- **Alias-Mapping** (Quelltext → Code): Seelenformer→Seelenmagier, Hämomant→Hämonant, Tüftler→Artificer, Manafürst→Manalord

### Skill Detail Anzeige (`skill-detail.component`)
- `getCostDisplay()`: Zeigt `"X Ausdauer/Mana · Aktion|Bonusaktion|..."` für alle `type: 'active'` Skills
- `getStatBonusDisplay()`: Übersetzt interno `chill` → "Wille" für Display

### Skill-Definitions Quellregeln (aus AlleKlassen.txt)
- Default Kosten: `energy` (Ausdauer) wenn keine Ressource angegeben
- Default actionType: `'Aktion'` wenn kein Schlüsselwort im Text
- `!` Prefix → `enlightened: true`; `∞` Suffix → `infiniteLevel: true`
- `+SkillName` Prefix → `requiresSkill: 'parent_skill_id'`
- Dual-Stat-Klassen (Konstitution&Wille, etc.) → `statBonuses[]` Array
- Phantom-Klasse ist NICHT in AlleKlassen.txt → wird separat beibehalten
