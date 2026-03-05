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
- **Runes**: Magische Runen für Equipment
- **Skills**: Fähigkeiten/Talente
- **Status Effects**: Buffs/Debuffs für Charaktere
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
