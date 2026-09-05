# 22FailApp - Projekt-Architektur

## Überblick
Echtzeit-D&D-Kollaborationstool mit WebSocket-synchronisierter multiplayer-Funktionalität.

## Tech Stack
- **Backend**: NestJS, WebSocket Gateways
- **Frontend**: Angular (Standalone Components)
- **Kommunikation**: Socket.io (real-time bidirectional)
- **Datenspeicherung**: JSON-Dateien pro Entity in `C:\Users\adermake\Documents\data\`
  - `data/races/race_*.json` — Rassen (16 Stück, per API gespeichert)
  - `data/characters/`, `data/worlds/` — weitere Entitäten
  - WICHTIG: `dataDir = path.join(__dirname, '../../../data')` → dist liegt in `backend/dist/`, nicht `backend/dist/src/`, deshalb löst `__dirname=backend/dist` → `../../../data = Documents/data`

## Kern-Architektur

### Backend (`backend/src/`)
- **Gateways** (bidirektionale Kommunikation):
  - `battlemap.gateway.ts`: Karten-/Kampf-Events
  - `character.gateway.ts`: Charakterdaten-Sync
  - `world.gateway.ts`: Weltevents, CurrentEvents-Verwaltung
  
- **Services**:
  - `data.service.ts`: Daten-Persistierung (JSON read/write)
    - Entity-Collections (Items, Spells, Runes, Skills, StatusEffects) in eigene Unterverzeichnisse pro Welt
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

### Event-System (Shops)
1. **Library Creation**: Shops werden im Library-Editor erstellt
2. **Aus der Bibliothek**: Current-Events-Manager listet die Shops der verknüpften Bibliotheken
3. **In die Welt**: fügt eine Kopie zu `currentEvents[]` hinzu
4. **WebSocket Broadcast**: World-Gateway sendet den `currentEvents`-Patch an die Party
5. **UI Update**: Events-Tab in character-tabs zeigt neue Events
6. **Interaction**: Spieler öffnen den Shop im Event-Portal
7. **Transaction**: Kauf triggert WebSocket-Update, synchronisiert Stock/Availability

Loot-Bündel gibt es nicht mehr — vorbereitete Beute ist der GM-Schreibtisch (siehe unten).

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
  - `CLASS_DEFINITIONS`: `ClassHierarchy` (string-index) → `{ tier:1-5, angle, children[] }` — bestimmt Rang-Badge
  - **Fähigkeitenbaum** (renamed from Talentbaum): Skill-Tree für class-based Fähigkeiten
    - `CharacterSheet.talentPoints/talentPointsBonus/learnedSkillIds` — intern unverändert, UI-Labels "Fähigkeitspunkte (FP)"
  - `app-skills` (`sheet/skills/`): 2-Spalten-Grid, Suchleiste + 5 Filter (Typ/Klasse/Aktion/Kosten/Rang)
  - `app-skill` (`sheet/skill/`): Kompakte Game-Karte mit Typ-Farbcodierung CSS `--tc`/`--tc-bg`
    - Typen-Farben: active=#f59e0b, passive=#a78bfa, dice_bonus=#34d399, stat_bonus=#38bdf8
- **Status Effects**: Buffs/Debuffs für Charaktere
  - `StatusEffect` Model: id, name, description, icon, color, diceBonuses, statModifiers, embeddedMacro/embeddedMacros, macroActionId, defaultDuration, maxStacks, isDebuff, public, tags
  - `ActiveStatusEffect`: statusEffectId, sourceLibraryId, appliedAt, duration, stacks, customEffect
  - `StatusStatModifier.stat`: 'strength'|'dexterity'|'speed'|'intelligence'|'constitution'|'chill'|'life'|'energy'|'mana'
  - **Single Source of Truth**: `CharacterSheet.activeStatusEffects` (ActiveStatusEffect[]) ist die einzige kanonische Quelle für Charakter-Tokens. `Token.activeStatusEffects` wird nur für NSC/NPC-Tokens ohne CharacterId verwendet.
  - **Lobby Sync-Architektur**:
    - `lobby-character-panel` + `lobby-bottom-panel`: lesen aus `character.activeStatusEffects`, schreiben via `charSocket.sendPatch` + `@Output() sheetPatched`
    - `lobby.component.ts` `onPanelSheetPatched()`: aktualisiert `worldCharacters` Signal lokal → beide Panels re-rendern sofort
    - `characterSocket.patches$.subscribe`: empfängt Patches von anderen Tabs/Clients → aktualisiert `worldCharacters`
    - Konvertierung: `activeToTokenEffect(ae: ActiveStatusEffect): TokenStatusEffect` (Display), `tokenToActiveEffect(fx): ActiveStatusEffect` (Persistierung)
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

## GM-Schreibtisch (world/gm-desk)
Ersetzt die alte "Bibliothek" der World-View. Drei Spalten: **Porträts ⟂ Vorbereitung ⟂ Bibliothek**.
- **Model**: `model/gm-desk.model.ts` — `DeskTab { tabId, name, revealed, entries }`,
  `DeskEntry { entryId, type, knowledgeKind?, name, data, hidden?, claimedBy? }`.
  `GrantType` deckt Gegenstand, Rune, Zauber, Fähigkeit, Material (`resources`), Wissen,
  Statuseffekt, Währung und Seele ab.
- **Speicherort**: `WorldData.gmDesk`, Sync über normale `patchWorld`-Patches.
- **Spalte 1**: Porträts der Party. Auswahl leuchtet; solange eine besteht, geht jedes ＋ direkt an
  diesen Spieler statt in den Reiter. Porträts sind CDK-Drop-Ziele.
- **Spalte 2**: GM-Reiter (anlegen/umbenennen/löschen/aufdecken) plus je ein Reiter pro NSC der
  **aktiven Lobby-Karte** (`WorldLobbyBridgeService`). Ein aufgedeckter Reiter pulsiert grün.
- **Spalte 3**: Ordner-gruppierte, durchsuchbare Bibliothek über alle Kategorien inklusive der
  fünf Wissensarten und der Materialien. Ein einziger Eingang `catalog: Record<KategorieId,
  BrowseEntry[]>`; jeder `BrowseEntry` trägt `libraryId` + `libraryName`.
- **Zurück in die Bibliothek**: Jede Zeile zeigt ihre Herkunfts-Bibliothek und hat ein ✎, das nach
  `/library/:libraryId?q=<Name>` springt — der Library-Editor liest `q`, füllt die Suche und führt
  sie aus, sodass man direkt auf dem Eintrag landet. Darüber Chips für jede verknüpfte Bibliothek,
  falls eine Kategorie leer ist.
- **Aufgedeckte Reiter** erscheinen unter Aktive Events als gemeinsamer Loot-Pool. Das Nehmen läuft
  server-autoritativ über `gmDeskClaim` (Muster wie der Party-Beutel) — genau einer bekommt den
  Eintrag, alle anderen sehen "Jemand war schneller".

## Vergabe an Charaktere (GrantService)
- **Ein einziger Pfad**: `services/grant.service.ts`. Der GM schreibt nie direkt in einen Bogen,
  er hängt ein Angebot an `CharacterSheet.pendingGrants`.
- **Spielerseite**: `sheet/grant-popup` zeigt Annehmen/Ablehnen. Erst beim Annehmen legt der
  Client des Spielers das Ding ab (`acceptPatches`) — freies Inventarfach, Stapel-Merge über
  `item-stack.util`, richtiges `known*Ids`-Array, `resources`, `currency`, `souls`,
  `activeStatusEffects` + `seenStatusEffectIds`.
- Ein Angebot überlebt Offline-Spieler, weil es am Bogen hängt.
- Tests: `services/grant.service.spec.ts` (komplettes Typ→Feld-Mapping).

## Wissen-System (Knowledge System)
- **Model**: fünf Arrays auf dem Bogen — `knownMaterialIds`, `knownForgeTraitIds`,
  `knownIngredientIds`, `knownExtractorIds`, `knownBrewTraitIds`.
- **Verwaltung**: Kontextmenü im World-Dashboard → ein Eintrag je Wissensart; das Overlay schaltet
  zwischen den Arten um (`knowledgeManagerType: KnowledgeKind`).
- **Laden**: `assetBrowserApi.searchFiles(lib.id, '', [kind])` über alle Bibliotheken.
- **Filter**: nach `knowledgeTierOf()` (nicht `bekannt`), NICHT nach dem Legacy-Flag `isPublic`.
- **IDs**: immer über `assetEntryId(file)` = `data.id || file.id` — ohne diesen Fallback wird
  Wissen vergeben, das der Bogen nicht wiederfindet.
- **Speichern**: `characterSocket.sendPatch(charId, { path: '/known…Ids', value: ids })`.

## Stapelbare Items (Stackable Items)
- `ItemBlock.stackable?: boolean` — ob das Item stapelbar ist
- `ItemBlock.amount?: number` — Anzahl im Stapel (Default: 1)
- **Anzeige**: `displayName` in item.component = "Name ×Anzahl" wenn stackable && amount > 1
- **Gewicht**: `totalWeight` in item.component = weight × amount (bei stackable); sonst weight
- **Editor**: Checkbox "Stapelbar" + Zahlenfeld "Anzahl" (sichtbar wenn stackable)

## World-View Layout
- **Reihenfolge** (oben → unten): Party-Dashboard → Battle-Tracker → Content-Grid (Aktive Events
  inkl. Beutel der Gruppe + GM-Schreibtisch). Der Schadenrechner ist hier entfernt — die anderen
  Ansichten decken ihn ab.
- **Bibliothek-Header**: `.library-header` + `.header-btn` CSS-Klassen (keine Inline-Styles)
- **Resource-Max Formel**: `world.component.getResourceMax()` delegiert an `trueStats.calculateResourceMax()` (verhindert Abweichung von Charakter-Sheet-Werten)


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

### Lineal-Sync (Lobby Measurement)
- **Frontend**: `lobby-grid.component.ts` sendet bei `handleMeasureMove` via `LobbySocketService.sendMeasurement()` mit `{id: socketId, start, end, createdBy: socketId}`. Auf `handleMeasureUp` wird `null` gesendet (löscht Messung).
- **Backend**: `battlemap.gateway.ts` hält `activeMeasurements: Map<mapId, Map<socketId, MeasurementLine>>`. Auf `updateMeasurement` Event: speichern/löschen + broadcast aller aktuellen Messungen (`measurementUpdate`) an den Map-Raum. Bei Client-Disconnect: Messung entfernen + neu-broadcasten.
- **Empfang**: `LobbySocketService.measurements$` Observable → `remoteMeasurements` Signal in lobby-grid → `renderRemoteMeasurements()` overlay-Pass (blau `#60a5fa` statt gelb)
- **Eigene Messung**: Lokal gerendert (gelb), remote Messungen anderer Nutzer gefiltert nach `socketId ≠ eigenem`

### Linked Tokens (Lobby)
- `LinkedTokenType`: `free | keepOffset | keepDistance`
- `LobbyStoreService.moveToken()` verarbeitet verlinkte Tokens rekursiv entlang der Parent-Child-Kette (nicht nur 1 Ebene)
- `keepOffset`: behält festen axialen Offset zum Parent, rotiert bei Parent-Rotation in 60°-Schritten mit und aktualisiert den gespeicherten Offset auch bei direktem Drag des Child-Tokens
- `keepDistance`: hält nur den gespeicherten Hex-Abstand, versucht Position zu behalten und bewegt nur bei Constraint-Verletzung auf den nächstliegenden gültigen Ring-Hex (Tie-Break Richtung alter Parent-Position für "Ketten-/Tail"-Verhalten)

### Battle Tracker Sync (World + Lobby)
- `BattleTrackerEngine.getCharacters()` liefert die Vereinigungsmenge aus `allCharacters` + aktiven `participants` (wichtig für NPC/NSC-Tokens, die nicht in der Party-Liste sind)
- `world.component.ts` synchronisiert den Engine-Zustand bei jedem `world$` Update via `battleEngine.syncFromWorldStore()` nach `loadPartyCharacters()`
- `lobby.component.ts` synchronisiert nach Character-Refresh erneut via `battleEngine.syncFromWorldStore()`, damit Team-Gruppierungen/Turn-Tiles im Lobby-Tracker konsistent mit der Welt bleiben
- Lobby Token-Kontextmenü unterstützt Team-Join direkt beim Kampfbeitritt (`Feind=red`, `Neutral=yellow`, `Verbündet=blue`)

### Weltuhr (synchronisiert)
- Persistente Felder: `WorldData.worldClock` (`year/day/hour/minute`) und `WorldData.encounterTimer` (`enabled/intervalHours/nextTriggerAtHour`)
- Migration in `world-store.service.ts`: fehlende Clock-/Timer-Felder werden beim Laden ergänzt und gespeichert
- Lobby-Topbar zeigt lesbare Fantasy-Zeit (`Jahr`, `Tag`, `Uhrzeit`) für alle; nur GM darf setzen und fortschreiten (`+10 Min`, `+1 Stunde`)
- Encounter-Timer: GM stellt Intervall in Stunden ein und aktiviert/deaktiviert den Timer; bei clean hour Trigger erscheint Reminder für Begegnungswurf
- Änderungen laufen über `WorldStoreService.applyPatch('worldClock')` und `WorldStoreService.applyPatch('encounterTimer')` und sind dadurch synchron

### Talent System (DnD-style Proficiencies)
- **Model**: `CharacterSheet.talentRanks: { [talentId: string]: number }`, `talentRankBonus: number`
- **Definitionen**: `data/talent-definitions.ts` → `TALENT_DEFINITIONS` (15 Talente: Athletik, Akrobatik, Heimlichkeit, etc.)
- **Punkte-Formel**: `5 + Math.floor((level - 1) / 3)` (Level 1=5, Level 4=6, etc.)
- **Modifier-Formel**: `(-5 + stat / 2) | 0` via `TrueStatsService.calculateStatModifier()` (DnD-Standard)
- **Würfel-Bonus**: `calculateStatDiceBonus - ranks` (inverted, lower=better in this game)
- **Komponente**: `sheet/talents/talents.component` — Tabelle mit Stat-Mod, Ränge-Regler, Gesamt-Bonus
- **Tab**: In `character-tabs` als "Talente"-Tab
- **Dice Roller**: `talentBonuses` computed signal in `dice-roller.component` → selektierbare Talent-Chips

### Race Skills System
- **Model**: `SkillBlock.sourceRaceId?: string` — optionales Feld, markiert Skills als Rassen-Skills
- **Race Editor** (`sheet/race-selector/`):
  - `race-selector.component`: Vollbild-Overlay (z:1000, flex column). Enthält direkt (ohne Container) `app-race-form` wenn in 'create'/'edit' Modus.
  - `race-form.component`: `:host` ist flex column, füllt den Selector-Overlay vollständig. KEIN `position:fixed` (verursacht Event-Probleme in gestapelten Stacking Contexts). 2-Spalten-Layout mit rf-* CSS-Klassen.
  - `race-card.component`: Karte für Rassen-Auswahl (Klick = select, Doppelklick = edit)
  - **Delete-Flow**: `race-form.onDelete()` emittet `delete`, `race-selector.deleteRace()` zeigt deutschen Bestätigungsdialog
  - **Skill-Autofill**: `race-form.onSkillEditorSave()` setzt `skill.class = race.name` wenn kein class gesetzt
- **Zuweisung**: `race-selector.selectRace()` entfernt alle Skills mit altem `sourceRaceId`, fügt `race.skills` (filtered by `levelRequired <= sheet.level`) mit `sourceRaceId = race.id` hinzu
- **Entfernung**: `clearRace()` entfernt alle Skills mit `sourceRaceId === raceId`
- **Kompatibilität**: Skills ohne `sourceRaceId` bleiben unberührt → Alte Sheets brechen nicht

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
- **Chain Execute**: Kette mit manuellem "Nächster ▸" Schritt, Ergebnis-Sidebar rechts, "Fertig ✓" abschließen

## Lobby Bottom Panel (`lobby/lobby-bottom-panel/`)
- **Tabs**: Status + Aktiv (Zauber/Fähigkeiten)
- **Status Tab Layout**: Toolbar (28px) + Body (flex row: Karten-Bereich + Exec-Sidebar 200px)
- **`TokenStatusEffect`**: id, statusEffectId?, customEffect?, name, icon, color, stacks, duration, isDebuff
  - `statusEffectId`: Verknüpft mit Library-StatusEffect für Macro-Lookup
  - `customEffect`: Überschreibt Bibliotheks-Definition (nach Bearbeitung)
- **Library-Loading**: `LibraryStoreService.allLibraries$` (Observable) + `allLibraries` (sync getter). Laden via `loadAllLibraries()`. Fix: Subscribe zu `allLibraries$` statt `.then()` für First-Load-Bug.
- **Karten**: Keine Inline-Controls mehr. Klick öffnet Expanded Panel (fixed overlay). Rechtsklick auf Bereich → Kontextmenü.
- **Expanded Panel**: Dauer +/-, Stapel +/-, Modifikatoren-Anzeige, Macro-Ausführung, Bearbeiten/Entfernen
- **Chain Execute**: `startExecuteAllChain()` → `executeCurrentChainStep()` → `executeNextInChain()` → `finalizeChain()`. Sidebar zeigt aktuellen Effekt + Würfelergebnis.
- **Macro-Ausführung**: `UnifiedMacroExecutorService.executeActionMacro(macro, sheet)`. Für NPCs: minimales `sheetForMacros` aus NPC-Werten. Ressourcen-Änderungen via `applyMacroResourceChanges()`.
- **Picker**: `availableToAdd` getter aus allen Library-StatusEffects. `applyEffect()` checkt ob bereits vorhanden (→ Stapel+1) oder neu hinzufügt.
- **Editor**: `StatusEffectEditorComponent` in Modal-Overlay; Änderungen speichern `customEffect` im TokenStatusEffect (löst Bibliotheks-Verknüpfung).

## World Dashboard (Partei-Übersicht)
- **Char-Card Stil**: Skill-Card-inspiriert (`#0f1829` bg, 3px accent left-border, rounded corners)
- **Resource Bars**: Gradient-Fill mit Glow-Schatten (Health=rot, Energy=grün, Mana=blau)
- **Währung**: Coin-Pills via `getCoinParts()` (nicht raw text)
- **Level + Klasse**: `.cc-meta` unter dem Namen zeigt `cc-level-badge` (accent-Farbe) + `cc-class-badge` für primary/secondary Klasse
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

## Schmieden-System (`sheet/forging/`, `shared/material-editor/`, `shared/forge-trait-editor/`)
- **Models** (`model/forging.model.ts`):
  - `MaterialBlock`: id, name, description, icon, color, isPublic, canBeWeaponMaterial, canBeArmorMaterial, weaponStats?, armorStats?, cost?, **rarity?** ('COMMON'|'RARE'|'LEGENDARY'), **stackable?**, **stackLevels?** (string[] per-stack descriptions), libraryOrigin
  - `MaterialStats`: haltbarkeit, haltbarkeitSkalierung, effektivitaet, effektivitaetSkalierung, weight, ruestungsmalus?, extraEffect?, reqBase?, reqScaling?
  - `ForgeTrait`: id, name, description, effect, schmiedepunktKosten, maxLevel, scalable, isPublic, libraryOrigin — **kein discount** (discount ist session-level UI)
- **Waffengröße**: LIGHT×0.8 / MEDIUM×1.0 / HEAVY×1.2 — multipliziert finalHaltbarkeit, finalEffektivitaet, finalWeight
- **Rabatt**: Session-Feld `traitDiscount` (0-100%) in forging.component.ts — nicht in ForgeTrait-Daten gespeichert. Effektivkosten = `max(1, round(baseCost * (1 - discount/100)))`
- **Stapelbare Materialien**: `stackable: true` erlaubt dasselbe Material mehrfach in einem Slot; `stackLevels[]` enthält Beschreibung pro Stapelstufe (Index 0 = Stufe 1)
- **Rarität-Farbcodierung**: COMMON = Standard, RARE = Blauer Glow, LEGENDARY = Goldener Glow (in wissen + forging + material-editor)
- **Material-Editor** (`shared/material-editor/`): Kompaktes me-* CSS-Klassen-Schema — eine Zeile für Name/Rarität/Kosten, Checkboxen-Reihe, Stats in 4-Spalten-Grid (`26px 1fr 34px 1fr`)
- **Blaue Icon-Box**: `.sr-icon.sr-icon-eff` — `background: #1e1b4b; border: 1px solid #6366f1; color: #a5b4fc` — für ⚔/⛊ Effektivitäts-Icons in forging + wissen

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

## Zauber-System (`sheet/spells/`, `sheet/spell/`, `sheet/spell-editor-overlay/`)
- **SpellBlock Model**: `id?, name, description, drawing?, tags[], binding, strokeColor?, libraryOrigin?, graph?, costMana?, costFokus?, statRequirements?, costSchedule?, embeddedMacro?`
  - `id`: Stabile ID (`spell_<random>_<timestamp36>`) — verhindert Duplizier-Bug beim Speichern
  - `costSchedule?: StoredCostSchedule` — detaillierter Kosten-Plan (manuell oder aus Estimator)
  - `embeddedMacro?: ActionMacro` — optionales Makro, das bei Wirken ausgeführt wird
- **CastingSpellEntry**: `{ spellId, spellName, castLevel }` — gezielt wirkende Zauber auf dem Sheet (cast-level-Tracking)
- **Spell-Karte** (`sheet/spell/`): Rechtsklick → Kontextmenü (Wirken / Bearbeiten / Löschen); Linksklick → emittiert `cast` Output
- **Spell-Editor-Overlay** (`sheet/spell-editor-overlay/`): Vollbild-Overlay im Stil des Item-Editors
  - CSS-Variablen: `--bg, --card, --border, --accent, --accentdark, --text, --text-muted`
  - Dynamischer Titel gebunden an `spellName`; Spar-Feedback-Flash (1.5s)
  - Beschreibungsfeld: `rows="10"` (3× größer als früher)
  - `<app-embedded-macro-editor>` eingebettet mit `max-height: 60vh; overflow-y: auto`
  - Runen-Editor öffnet `<app-spell-node-editor>` **außerhalb** des Panels (korrekter z-index)
  - Manuelle cost-schedule Bearbeitung (Fälle + Runden hinzufügen/entfernen)
- **Aktive Skills & Zauber Panel** (`sheet/sheet-active-skills-spells/`): Direkt unter Status-Effekten im `grid-currentstats`
  - Zeigt: andauernde Fähigkeiten (Skills mit `cost.perRound = true`) als Toggle-Chips
  - Zeigt: Wirkende Zauber (`sheet.castingSpells`) mit Cast-Level +/- und Reduktions-Badge
  - `CharacterSheet.activeSkillNames?: string[]` — Names aktiver Toggle-Skills
  - `CharacterSheet.castingSpells?: CastingSpellEntry[]` — aktive Cast-Einträge
  - Cast-Level-Reduktion: `Math.min(90, floor(castLevel/10)*10)`%

## Zauberwirken-Fenster (`sheet/spellcast-window/`)
- **Zweck**: Vollbild-Overlay für Zauberwirker im Kampf; immer präsentes Werkzeug während der Runde
- **Selektor**: `app-spellcast-window`; Inputs: `[sheet]!: CharacterSheet`; Outputs: `(patch)`, `(close)`
- **Öffnen**: ✦-Button in `.sticky-actions.horizontal` (oben-rechts) oder Tastenkürzel `C`; Escape schließt
- **Layout**: Vollbild-Overlay (`position:fixed; inset:0; z-index:2000`) mit Runen-Hintergrund-Animation
  - Header: Titel + Charname + Mana-Bar + Fokus-Bar + Schließen-Button
  - Body: Zauber-Grid (links, verfügbare Zauber) | Divider | Aktive-Wirk-Liste (rechts)
- **Runen-Feld**: 18+ `.scw-rune-glyph` Spans mit `@keyframes runeFloat` (free-floating Unicode Runen ᚠ–ᛟ)
- **Spell-Karten**: 120px Breite, linker Border `--sc` (Zauberfarbe), Klick → `castSpell(spell)`; `is-casting`-Klasse mit `pulseGlow`-Animation wenn bereits aktiv
- **Cast-Level**: +/- Buttons in Aktiv-Liste; Reduktion: `Math.min(90, floor(cl/10)*10)`%
- **Fokus-Formel (korrekt)**: `Math.floor((Math.floor(int/2) + 5 + bonus) * mult)` (aus `sheet.statuses` Intelligenz lesen)
- **Patch-Pattern**: `(patch)="store.applyPatch($any($event))"` in sheet.component.html

## Lobby-Architektur (lobby/)

### Layout (Stand: Mai 2025)
`
lobby-container
  +-- lobby-toolbar              (oben)
  +-- kampfrunde-bar             (oben, nur wenn kampfrundeMode=true) – Compact Battle-Tracker + "Beenden"-Button
  +-- lobby-main                 (flex row)
  ¦   +-- lobby-sidebar          (links, 280px) – Tabs: Charaktere | Bilder | Texturen | Schichten | Würfel
  ¦   +-- lobby-grid             (Mitte, flex:1) – Hex-Karte mit Tokens und Drawing-Layer
  ¦   +-- lobby-character-panel  (rechts, 300px, IMMER präsent, kein Layout-Shift)
  +-- lobby-bottom-panel         (unten, collapsible, 290px) – Status + Aktiv-Tabs für ausgewähltes Token
`

### lobby-bottom-panel (lobby/lobby-bottom-panel/)
- Immer sichtbar (collapsible per ▼/▲ Button), Höhe 290px / 33px collapsed
- Tab 1 "✨ Status": Liste aktiver TokenStatusEffects (icon, name, stacks×, Dauer Rd)
- Tab 2 "✦ Aktiv": 2-Spalten-Layout:
  - LINKS (210px): Browse-Liste aller Fähigkeiten (click=toggle) + Zauber (click=cast-dialog)
    - Fähigkeiten zeigen effectiveCost(skill) (SKILL_DEFINITIONS lookup)
    - Cast-Dialog: inline, Wirkstufe + Skalierung, dann Wirken
  - RECHTS (flex:1, scrollable): Aktive Zauber-Karten + aktive Skill-Karten
    - Volle spellcast-window-Funktionalität: cast progress, W20 würfeln, Rundentracker, ⚡ Zahlen, Zähler
- State:
  - Charaktere: Liest character.castingSpells / character.activeSkillNames, sendet Patches via CharacterSocketService.sendPatch()
  - NSCs: Liest token.castingSpells / token.activeSkillNames, emittiert via tokenUpdate
- Token model: jetzt auch activeSkillNames?: string[] und castingSpells?: CastingSpellEntry[]

### Kein Flash-Problem
- lobby-character-panel ist IMMER 300px breit, egal ob Token ausgew�hlt.
- Kein @if-Wrapper um das Panel ? kein Layout-Shift ? kein Canvas-Resize ? kein Zeichnungs-Flash.

### Komponenten
- **lobby-character-panel** (lobby/lobby-character-panel/):
  - Kein Token: zeigt Würfelroller + Roll-History
  - Token ausgewählt: 5 Icon-Tabs: ⚔️ Aktionen | 🎲 Würfe | ✨ Status | 🎨 Aussehen | 🔗 Verknüpfung
  - Aktionen-Tab: LP/Mana/Energie-Bars (editierbar), Stats als Würfel-Buttons, Skills, Zauber
  - Würfe-Tab: Roll-History
  - Status-Tab: Token-Status-Effekte hinzufügen/entfernen (lokal, per-token)
  - Aussehen-Tab: Name umbenennen, Skalierung (X/Y unabhängig oder uniform), Rotation (Quick ±90°), Bildmodus (Fill/Stretch), Custom-Portrait löschen, Token zeichnen (aktiviert Draw-Tool)
  - Verknüpfung-Tab: Zeigt Parent-Info wenn verknüpft; Kinder-Liste; neues verlinktes Token erstellen
  - @Output() tokenUpdate → Lobby ruft store.updateToken(tokenId, updates)
  - @Output() deselect → selectedTokenId.set(null)
  - @Output() requestTokenDraw → setzt currentTool auf 'draw'
  - @Output() requestLinkedTokenPlacement → pending feature
  - @Output() tokenChildDetach → store.updateToken(childId, { parentTokenId: undefined, ... })
  - @Input() allTokens: Token[] → benötigt für linkedChildren Getter
- **lobby-sidebar**: Tabs: Charaktere (Spieler/NSC), Bilder, Texturen, Schichten (nur GM), Würfelverlauf
- **lobby-side-panel**: NICHT MEHR VERWENDET (Inhalte in sidebar + character-panel migriert)

### Token-Modell (Token Interface)
- Basis: position, characterId, name, portrait, team, isQuickToken, statblockId
- Ressourcen: currentHealth?, currentMana?, currentEnergy?
- Kosmetik: scaleX?, scaleY?, rotation?, imageMode? ('fill'|'stretch'), customPortraitData? (Base64)
- Status: activeStatusEffects?: TokenStatusEffect[] (id, name, icon, stacks, duration, isDebuff)
- Kampfzustand: activeSkillNames?: string[] (aktive Fähigkeiten für NSC-Tokens), castingSpells?: CastingSpellEntry[] (Casting-State für NSC-Tokens)
- Verknüpfung: parentTokenId?, linkedTokenType? ('free'|'keepDistance'|'keepOffset'), linkedOffset?, linkedDistance?

### Token-Ressourcen
- Token.currentHealth?, currentMana?, currentEnergy? → optionale Felder auf dem Token
- Falls undefined: Wert wird aus CharacterSheet.statuses (FormulaType.LIFE/MANA/ENERGY) gelesen
- Beim Bearbeiten über Panel: via store.updateToken() auf Token gespeichert

### Battle-Tracker Integration
- `BattleTrackerEngine.registerCharacter(id, {name, portrait, speed})` muss vor `addCharacter(id)` aufgerufen werden für NSC-Tokens (deren IDs nicht in setAvailableCharacters() enthalten sind)
- NSC-Token CharacterIds: `'npc-' + statblockId + '-' + Date.now()`
- `lobby.onTokenCombatAdd()`: registriert NSC-Tokens vor dem Hinzufügen

### Würfelformel (invertiert)
- diceBonus = (5 - stat / 2) | 0 → hoher Stat = niedriger Bonus (besser im System, weil niedrig gut ist)

## Homepage (`home/`) & Nutzer-Zugang

Landing-Page unter `/`. Zwei Ebenen: oben die Spieler-Sicht (große Charakter-Kacheln mit
Portrait, Stufe, Klasse/Rasse + Welt-Kacheln), darunter ein eingeklappter **Admin-Bereich** mit
Tabs (Charaktere / Welten / Nutzer / Papierkorb).

- **Alle Tiles öffnen in einem neuen Tab** (`<a target="_blank">` auf `/characters/:id`,
  `/lobby/:world`, `/world-map/:world`, `/world/:world`) — die Homepage bleibt stehen.
- Portraits sind Image-IDs → immer über die `imageUrl`-Pipe rendern, nie roh als `src`.
- `CharacterSummary` (Backend `data.service.ts`) liefert zusätzlich `level`, `primaryClass`,
  `secondaryClass`, `race`, `updatedAt` (File-mtime, sortiert "zuletzt gespielt").

### Login / Konten (`services/identity.ts`, `services/auth.service.ts`)
- `app:current-user` = aktive Identität; `app:known-users` = Liste aller je benutzten Konten
  auf diesem Gerät. "Nutzer wechseln" löscht nur die aktive Identität, nie die Liste →
  Ein-Klick-Wechsel zwischen Konten.
- **Master-Passwort** (`ROOT_PASSWORD`, Default `rootroot`, `users.service.ts`): gilt anstelle
  jedes Join-Codes in `login()` und `resolve()` und damit auch für den `AdminGuard`.
  `POST /api/users/root/list` liefert damit alle Konten inkl. Join-Codes — Rettungsweg bei
  verlorenem Code und Debug-Login als beliebiger Spieler.

### Papierkorb (Soft Delete)
Charaktere und Welten werden nie direkt gelöscht, sondern nach `data/trash/` verschoben:
`trash/characters/<id>.json`, `trash/worlds/<name>/` (ganzes Verzeichnis inkl. Lobby, Karten,
Bibliothek), Index in `trash/index.json`.

- API (alle `AdminGuard`): `DELETE /api/characters/:id`, `DELETE /api/worlds/:name`,
  `GET /api/trash`, `POST /api/trash/:kind/:id/restore`, `DELETE /api/trash/:kind/:id` (purge).
- Restore bricht ab, statt zu überschreiben, wenn es den Namen wieder gibt.
- Die `characterIds` der Welt bleiben beim Löschen stehen (Lobby/World prüfen auf `null`),
  damit ein wiederhergestellter Charakter direkt wieder in der Party ist.

## Karteneditor v2 — Landmassen-Import (`map-editor/landmass-import.ts`)

Übernimmt eine in einem anderen Werkzeug fertig gezeichnete Karte: **transparent = Wasser,
farbig = Land**. Nur die Landmasse, nicht die Grafik — Symbole und Beschriftungen werden im
Editor neu gesetzt. Bedienung im Reiter *Karte*.

- Ablauf: Bild wählen → Overlay auf der Karte ziehen (Strg + Mausrad skaliert, "An Ansicht
  anpassen" setzt Startgröße) → *Stempeln*. Das Overlay liegt in `MapRenderer.overlayLayer`
  und bleibt beim Reiterwechsel sichtbar, taugt also auch zum reinen Nachzeichnen.
- Die Quell-Alpha wird an einer einstellbaren Schwelle **hart** zu einer Maske; ein weicher
  Verlauf landete sonst genau auf dem Cutoff des Küsten-Shaders und flackerte dort.
- Dieselbe Maske speist beide Raster, aber als **zwei Stempel auf zwei Stufen**: `height`
  (weiß, Alpha = Maske) auf *Form auf Stufe*, `landColor` (Quell-RGB, Alpha = Maske) auf
  *Farbe auf Stufe* (Default `low`). Form und Farbe können nicht auseinanderlaufen, weil beide
  aus derselben Schwelle kommen. Farbe ist abschaltbar → Land nimmt dann `settings.landBase`.
- **Warum Farbe auf Grob:** der Shader komponiert fein über grob, also überdeckt Farbe in einer
  Detailstufe jede gröbere dauerhaft. Ein Import, der Farbe nach `med`/`high` schrieb, machte
  die Grundfarbe unveränderbar — eine Korrektur bei Grob war herausgezoomt sichtbar und kippte
  beim Hineinzoomen zurück. Ein Landmassen-Export löst ~8 px/Hex auf, Grob ~4 Texel/Hex: der
  Verlust ist minimal, und die feinen Stufen bleiben für echtes Detail frei.
- Stufe für die Form wählbar; gestempelt wird sie **und jede gröbere** (gleiche Regel wie ein
  Pinselstrich). Kachelzahl je Stufe steht in der Auswahl, `recommendedTier` schlägt die
  feinste Stufe vor, die das Bild noch auflöst und unter `IMPORT_CELL_WARN` (400) bleibt.
- **"Bereich ersetzen" löscht auf allen Stufen**, auch feineren (`clearImportArea`) — sonst
  könnte ein Re-Import einen früheren nicht reparieren. Der Bereich zerfällt dabei in zwei
  Sorten Kacheln, und **beide** müssen behandelt werden:
  - *ganz innen*: Dateien löschen über `DELETE …/map-editor/chunks/:layer/:tier?minCx…` —
    ein paar Requests statt tausender Uploads, egal wie groß die Fläche.
  - *vom Rand angeschnitten* (`edgeCells`): echt ausradieren über
    `ChunkManager.stampCells`. Löschen geht hier nicht, weil die Kachel auch Karte
    *außerhalb* hält. **Welche Randkacheln überhaupt Inhalt haben, sagt der Server**
    (`GET …/chunks/:layer/:tier?minCx…`), nicht der lokale `chunkVersions`-Cache: der kann
    Einträge verlieren, das Radieren wurde dann übersprungen, die alten Pixel blieben liegen —
    und der nächste Stempel schrieb sein teils transparentes Bild darüber und veröffentlichte
    sie wieder. Ergebnis: ein **Quadrat vorher gelöschter Karte kam zurück**. Vereinigt wird
    die Serverliste mit `ChunkManager.hasUnsavedPaint`, das der Server nicht kennen kann.

  Die erste Fassung übersprang die Randkacheln und nannte das einen „kachelbreiten Rand“.
  **Das war falsch:** eine Kachel ist bei `med` 23 Hex (91 km) und bei `low` 182 Hex (728 km)
  breit — kein Artefakt, sondern ein Streifen alter Karte quer über die neue, der auf jeder
  Zoomstufe darüberliegt. Der Rand wächst mit dem *Umfang*, nicht mit der Fläche (bei `high`
  <10 % der Kacheln), und `skipEmpty` fasst nur an, wo überhaupt etwas liegt — sonst würde die
  Radierung leere Chunks *erzeugen*.
- **Der Stempel färbt anschließend die Symbole nach** (`resampleStampedTints`). Farbfähige
  Symbole nehmen die Farbe des Bodens unter sich — der Stempel ersetzt genau diesen Boden, also
  bleiben sonst die Tints der alten Karte über der neuen liegen. Läuft, wenn Landfarbe sich
  ändern konnte (Farbpass ODER „Bereich ersetzen"), und liest über
  `ChunkManager.sampleWorldStreaming` **nur die Stufen, in die der Import Farbe geschrieben
  hat**, grob zuerst. Streaming ist nötig, weil nach einem Import fast nichts davon resident
  ist — der normale `sampleWorldMany` liest bewusst nur Residentes und überspränge alles
  außerhalb des Bildes. **Nicht undo-fähig**, passend zum Import selbst: nur die Tints
  rückgängig zu machen sähe aus, als wäre der Import zurückgenommen.
- `ChunkManager.stampRegion()` ist der Bulk-Pfad: pro Zelle laden → malen → hochladen →
  freigeben, vier Zellen gleichzeitig. `paintWorld` ginge nicht — es hielte alle Kacheln
  resident, was bei ~3 MB/Zelle den GPU-Speicher sprengt. Deshalb **kein Undo** (ein
  Undo-Snapshot hielte den ganzen Import im VRAM) → Sicherheitsabfrage vor dem Stempeln.
- `fetching` im ChunkManager hält jetzt die Promise statt nur ein Flag: Ein Stempel deckt
  Randkacheln nur teilweise ab und muss deren gespeicherte Pixel abwarten, ein Pinsel nicht.
- Klicks im Reiter *Karte* malen nicht mehr (fielen vorher auf `beginPaint` durch).

## Karteneditor v2 — Skalierung bei vielen Symbolen

Symbole werden **nie** in die Raster gestempelt; nur der Landmassen-Import stempelt. Sie
bleiben dauerhaft Vektorobjekte — nur so lassen sie sich später verschieben, umfärben und
löschen, und nur so kann der Server geheime aus Spieler-Payloads streichen.

**Das Zeichnen skaliert von sich aus** (`SpatialIndex` 4096-px-Raster → nur sichtbare Buckets,
Cull unter 3 Bildschirm-px, Sprite-Pool + Atlas-Batching, Deckel `MAX_VISIBLE = 12000`). Die
Grenze lag woanders — beim einen JSON-Dokument. Gemessen (50k / 200k Symbole):

| | map.json | stringify | gzip |
| --- | --- | --- | --- |
| 50k | 12,7 MB → **8,4 MB** ohne Einrückung | 22 ms | **0,61 MB** |
| 200k | 51,2 MB → 34,0 MB | 89 ms | 2,44 MB |

- **Schreiben ist asynchron und atomar** (`writeDoc`: Temp-Datei + `rename`). Synchron blockierte
  es die gesamte Node-Event-Loop — nicht nur den Karteneditor, sondern jeden Socket-Client im
  Prozess (Lobby, Charakterbögen, Würfel), ~70 ms bei 50k Symbolen, jede Sekunde beim Setzen von
  Symbolen. Atomar, weil ein In-place-Schreiben die Datei zuerst kürzt: ein Absturz mittendrin
  hinterließe eine halbe `map.json` — also die ganze Welt.
- **`flushAsync` deckt alle noch geschuldeten Schreibvorgänge ab**, nicht nur das laufende
  (`do…while` über `writeAgain`). Eine frühere Fassung reihte den Folgeschreibvorgang als
  fire-and-forget ein, wodurch `onModuleDestroy` zurückkehrte, während der Schreibvorgang mit
  den neuesten Änderungen noch lief — genau der Verlust, den der Hook verhindern soll.
- **`onModuleDestroy` + `app.enableShutdownHooks()`**: die Speicherung ist um 1 s verzögert, ohne
  Hook ginge bei jedem Neustart bis zu eine Sekunde Arbeit verloren. `MapEditorService` ist der
  einzige Dienst mit einem solchen Hook.
- **Ohne Einrückung** serialisiert (`JSON.stringify(doc)`): ein Drittel der Datei war Padding.
  Zum Lesen formatiert jeder Editor oder `jq` sie.
- **`compression`-Middleware** in `main.ts`: Symbol-JSON ist extrem repetitiv, gzip schafft ~14×.
  Chunk-PNGs überspringt `compression` anhand des Content-Type von selbst.
- **Chunk-PNGs schreiben ebenfalls asynchron** — ein Import schickt hunderte PUTs hintereinander.
- **`SpatialIndex.get(id)`** ersetzt die `data.symbols.find(...)`-Scans. Beim Ziehen einer
  Auswahl kostete das Auswahl × Gesamtzahl pro Mausbewegung (300 Symbole auf 30k = 9 Mio.
  Vergleiche je Frame). Der Index hält dieselben Instanzen wie das Dokument-Array, Mutieren ist
  also identisch.
- `saveMap` (POST, Import/Recovery) **wartet** aufs Schreiben; der Op-Pfad bleibt verzögert.
- Regressionstests: `map-editor.service.spec.ts` (erster Backend-Spec überhaupt).

**Nicht gemacht, bewusst:** die O(n)-Dedupe in `applyMapOp` case `add` (`list.some`). Gemessen
0,22 ms bei 50k und einmal pro Klick — der saubere Fix (Id-Sets neben zwei getrennten
Switch-Implementierungen) kostet mehr Komplexität, als er einbringt.

**Echte Obergrenze**, falls je nötig: Objekte räumlich in Dateien pro Zelle aufteilen, genau wie
die Chunks schon (`objects/<cx>_<cy>.json`) — Speichern fasst eine Zelle an, Beitreten streamt
nur nahe Zellen. Bis ~100k Symbolen nicht erforderlich.

## Karteneditor v2 — Höhenfeld mit drei Zuständen

Das `height`-Raster kodiert **drei** Zustände, nicht zwei:

| `alpha` | `red` | Bedeutung |
| --- | --- | --- |
| 0 | 0 | **Hintergrundwasser** — hier ist nichts gezeichnet |
| > 0 | ≈ `alpha` | **Land** |
| > 0 | ≈ 0 | **Vordergrundwasser** — bewusst gezeichnet |

Die Küstenschwelle liest jetzt `red` (`float h = hc.r`), `alpha` sagt nur noch: *diese Stufe
hat hier eine Meinung*.

**Warum.** Wasser war die bloße Abwesenheit von Land, geschrieben durch Erase auf Alpha. Der
Stufen-Composite ist aber `over`, und darin heißt „transparent" = *keine Meinung*: die gröbere
Stufe scheint durch. Eine feine Stufe konnte deshalb nie einen Kanal durch das Land einer
gröberen schneiden. Erase funktionierte nur, weil ein Strich auch alle gröberen Stufen direkt
radiert — und ein dünner Schnitt, auf einen Bruchteil eines groben Texels verdünnt, riss die
Schwelle dort nie. Zahlen: ein Grob-Texel ist 128 Weltpixel ≈ 1,07 km, ein Schnitt muss >64
Weltpixel ≈ **533 m** breit sein, um ihn zu kippen. Ein Fluss war also auf *jeder* Zoomstufe
unsichtbar, weil Grob sein Land behielt und den Kanal wieder auffüllte.

**Gezeichnetes Wasser gewinnt dagegen den Composite**, weil es eine Meinung hat: das Land der
gröberen Stufe wird mit `1 − alpha` gewichtet.

**Kostet nichts und braucht keine Migration.** Das RGB des Höhen-Rasters war ungenutzt (der
Shader las nur Alpha), und *jeder* gespeicherte Höhen-Texel wurde weiß geschrieben (Pinsel
`tint: 0xffffff`, Import `hd[i] = 255`) — dort gilt also `red == alpha`, und bestehende Karten
lesen sich unverändert.

Werkzeug-Zuordnung:
- `landBrush` / `heighten` → weiß, add — Land
- `waterBrush` / `lakeStamp` → **schwarz, add** — Vordergrundwasser (nur diese beiden)
- `landEraser` → erase — Meinung zurückziehen, zurück zu Hintergrundwasser
- `lower` → erase — senkt Terrain Richtung Hintergrundwasser, zeichnet *kein* Wasser
- Die Palette darf nie ins Höhenfeld: dort ist der Tint Bedeutung, kein Schmuck.

Der Inspektor („Höhe") zeigt entsprechend drei Dinge: Schachbrett = keine Meinung, Blau =
gezeichnetes Wasser, Hell = Land. Algebra festgehalten in `terrain-composite.spec.ts`.

## Karteneditor v2 — Vormultipliziertes Alpha & Symbol-Tints

**Die Chunk-Texturen sind vormultipliziert.** Pixi rendert in eine RenderTexture mit
`normal = [ONE, ONE_MINUS_SRC_ALPHA]` (und `erase = [ZERO, ONE_MINUS_SRC_ALPHA]`) — das ist der
vormultiplizierte Operator, gespeichertes RGB ist also bereits Farbe x Deckung.

Der Shader nahm das Gegenteil an und wog RGB ein **zweites** Mal mit Alpha:
- `over()` rechnete `top.rgb * top.a`,
- die Grundfarbe kam über `mix(uLandDefault, lc.rgb, lc.a)`.

Ergebnis: alles mit Teildeckung wurde zu dunkel, um `paint·a·(1−a)` — also genau der weiche
Rand jedes Pinselstrichs, der als **dunkler Streifen statt als Verlauf** erschien, bei Land wie
bei Wasser. Richtig ist vormultipliziert durchzurechnen: `over()` ohne Division, und die
Grundfarbe als `uLandDefault * (1 − lc.a) + lc.rgb`. Algebra festgehalten in
`terrain-composite.spec.ts` (GLSL selbst ist nicht testbar).

**Symbol-Tints lesen dieselben vormultiplizierten Texel — und lagen am selben Fehler.** Pixis
`getPixels` hat sein `unpremultiplyAlpha` wegkompiliert (`if (false) unpremultiplyAlpha(...)`),
der Readback liefert also Farbe × Deckung. Roh als Tint verwendet ergab ein Texel am weichen
Pinselrand (3% Deckung) 3% Helligkeit — **schwarze Symbole entlang jedes Strichrands**. Die
Samples bleiben deshalb vormultipliziert *samt Alpha*, und `groundTintHex` löst sie genauso auf
wie der Shader: `Grundfarbe · (1 − a) + rgb`. Unvormultiplizieren wäre falsch herum — es teilte
einen 8-Bit-Wert durch 0,03 und verstärkte nur das Quantisierungsrauschen. Stufen werden dabei
grob→fein mit demselben `over` zusammengesetzt, statt die erste Stufe mit Inhalt zu nehmen.
Ohne lesbaren Chunk kommt `null` zurück, damit ein Symbol seinen Tint behält statt ihn zu
verlieren; ohne eigenen Tint folgt es `settings.landBase` (vorher hart `0xffffff`).

**Symbol-Tints werden gebündelt gelesen** (`ChunkManager.sampleWorldMany`). `sampleWorld` ist ein
GPU-Readback und laut eigenem Kommentar nur für Einzelaktionen gedacht — die Live-Vorschau rief
es aber alle 90 ms *pro Symbol* auf, mit bis zu drei Stufen je Aufruf. Ein Pinsel über einem Wald
löste damit hunderte Pipeline-Stalls pro Sekunde aus; das ist das Ruckeln beim Malen über
Symbolen. Kosten entstehen pro Readback, nicht pro Pixel, also werden die Punkte nach Chunk
gruppiert und je Chunk einmal das umschließende Rechteck gelesen — aus hunderten Stalls werden
ein bis zwei. Gilt für die Live-Vorschau und für `resampleSymbolTints` am Strichende.

## Karteneditor v2 — Wasser-Radierer & Seeform

**`waterEraser` („Wasser radieren", Reiter *Wasser*)** — radiert `height`, aber **nur die
aktive Stufe** (`toolIsTierLocal`). Der Unterschied zu `landEraser` ist die Reichweite, und er
ist der ganze Grund für zwei Werkzeuge:
- *„Hier ist kein Land"* muss es aus **jeder** Stufe entfernen, sonst liefert eine gröbere es
  wieder → `landEraser` kaskadiert.
- *„Dieses Wasser soll weg"* darf nur die Meinung **dieser** Stufe zurückziehen, damit das Land
  darunter zurückkommt → kaskadieren würde die Landmasse mitradieren.

**Seestempel: Federung mit steigender Deckkraft.** Vorher zehn flache 16%-Füllungen, die nur
durch Übereinanderblenden Wasser erreichten — damit hing der ganze See daran, wie der Renderer
identische Füllungen zusammenfasst; werden sie verschmolzen, bleibt eine einzige 16%-Lasur
übrig, die die Küstenschwelle nie reißt, und es entsteht **kein See**. Jetzt läuft die Deckkraft
von außen (0,12) nach innen (1,0), der Kern ist also unabhängig davon Wasser, und die Ringe
formen nur noch das Ufer.

**Seeform: vier Oktaven statt einer Sinuswelle.** Eine einzelne Welle ist ein *regelmäßiges*
Wackeln — jede Bucht gleich groß, gleichmäßig verteilt, also liest sich die Silhouette bei jeder
Amplitude als gestauchter Kreis. Vier Oktaven mit etwa verdoppelnder Frequenz geben große
Buchten mit kleineren Einschnitten darin. Frequenzen bleiben **ganzzahlig**, sonst klafft am
Rundum-Übergang eine Kerbe. Der vorhandene *Rauschen*-Regler steuert die Amplitude und wird
jetzt auch beim Seestempel angezeigt. Tests: `lake-shape.spec.ts`.

## Karteneditor v2 — Pinsel: Fluss, Spitzen, gemerkte Einstellungen

**`strength` ist jetzt die Deckung eines Zuges, nicht die Deckkraft eines Stempels.** Überlappende
Dabs summieren sich als `1 − (1 − a)ⁿ`; beim alten Abstand (25% des Radius, ~8 Überlappungen)
malte Stärke 0,25 real **90%** Deckung und 0,4 schon **98%**. Damit war alles oberhalb von ~0,1
schlicht deckend — deshalb fühlten sich sämtliche Profile gleich an, und Blenden ging nur ganz
unten am Regler, wo die einzelnen Stempel als Bögen sichtbar wurden. Der Fluss wird nun
invertiert: `flow = 1 − (1 − strength)^(1/Überlappungen)`. Abstand von 0,25 auf **0,08**, was den
Zug durchgehend macht. Die *erste* Berührung setzt die volle Stärke — ein Klick ist kein Zug, dort
summiert sich nichts.

**Pinselspitzen** (`BrushTexture`: glatt / körnig / kreide / spray). Vorher gab es genau eine
Form: konzentrische Kreise, bei denen die Weichheit nur den Abfall verschob. Die Spitzen werden
jetzt Pixel für Pixel auf einer Canvas erzeugt (Radialabfall × Rauschen), weil sich Körnung nicht
als gestapelte Kreisfüllungen ausdrücken lässt. Texturierte Stempel werden pro Dab **zufällig
rotiert**, sonst wiederholt sich dieselbe gebackene Körnung alle paar Pixel und liest sich als
Kachelmuster. Die Profile wählen zusätzlich eine Spitze, deshalb unterscheiden sie sich im Strich
und nicht nur in Zahlen.

**Einstellungen bleiben erhalten** (`localStorage`, `map-editor.brush.v1`): Größe, Weichheit,
Stärke, Rauschen, Spitze, Profil und Symbolfarbe. Bewusst nicht im Dokument — das ist
Arbeitsgefühl, kein Karteninhalt, und zwei GMs an derselben Welt sollen ihr eigenes behalten.
Beim Laden wird jeder Wert einzeln geprüft und geklemmt.

**Symbol-Thumbnails**: `tintable`-Sprites sind weiße Silhouetten und leuchteten im Picker grell.
Sie werden dort als CSS-Maske mit `background-color` gezeichnet — dieselbe Technik wie die
`app-icon`-Masken der App — und zwar in der Farbe, in der sie auch gesetzt werden.

**Mehrslot-Gebäude werden verworfen statt abgeflacht** (`BUILDING_SLOT_GROUPS`): Abflachen ist
nur für Artwork verlustfrei, das als *Silhouette* liest. Eine gezeichnete Burg tut das nicht —
Dach, Mauern und Fenster sind getrennte Farbslots, einfarbig bleibt ein unlesbarer Klumpen.

## Karteneditor v2 — Wonderdrafts Mehrfarb-Symbole (`custom_colors`)

40 Symbole in `custom_colors`, `custom_colored_town` und `compass_roses` wurden vom
Atlas-Tool **übersprungen**, weil sie roh gezeichnet grell und übersättigt aussehen. Das war
kein Extraktionsfehler: bei diesen Sprites sind die RGB-Kanäle **Slot-Gewichte**, keine Farben.
Gemessen über die Bibliothek gilt R+G+B = 255 auf Rundungsfehler genau — die Kanäle tragen also
gar keine Helligkeit, die Form steckt vollständig im (kantengeglätteten) Alpha. Wonderdraft
multipliziert sie mit den gewählten Slot-Farben; direkt angezeigt sieht man die nackte Maske.

**Jetzt:** `flattenSlotMask` setzt RGB auf Weiß und lässt Alpha stehen. Für eine einfarbige
Darstellung ist das verlustfrei — und einfarbig ist genau das, was Wonderdraft zeigt, wenn alle
Slots dieselbe Farbe haben. Die Sprites werden im Manifest als `tintable` markiert.

`tintable` ist bewusst **nicht** `colorable`: Letzteres heißt „nimm die Farbe des Bodens
darunter", was einen Stadtmarker auf Land in derselben Farbe malen und damit unsichtbar machen
würde. Tintable-Symbole bekommen eine **gewählte** Farbe (Default sepia `#4a3524`), die beim
Setzen auf dem Symbol gespeichert wird; der Farbwähler im Symbol-Reiter färbt zusätzlich eine
bestehende Auswahl um.

**Bewusst nicht umgesetzt:** echte *Mehrslot*-Färbung (Dächer anders als Mauern). Das bräuchte
einen zweiten Tint im Symbolmodell und einen Zweikanal-Shader. Eine Farbe schlägt kein Symbol.

## Karteneditor v2 — Chunk-Versionen dürfen sich nie wiederholen

Die Chunk-Route liefert `Cache-Control: public, max-age=31536000, immutable`, und der
Cache-Schlüssel ist allein die Version in `?v=`. Eine **wiederverwendete** Version heißt damit:
der Browser beantwortet einen *neuen* Chunk mit Bytes, die er für einen *alten* gespeichert hat.

Genau das passierte, gleich zweifach:
- `writeChunk` zählte `vorher + 1` — und beginnt wieder bei **1**, sobald der Eintrag fehlt.
  `clearChunks` löscht ihn absichtlich.
- `scanChunkVersions` vergab jeder auf der Platte gefundenen Datei pauschal die **1**.

Ergebnis: zwei Generationen desselben Chunks antworten beide auf `?v=1`. Wer die erste je
gecacht hatte, bekam sie **ein Jahr lang** weiter — immer dieselbe alte Insel, ohne Zutun, nach
jedem Reload, ohne dass auf dem Server irgendetwas passiert wäre. Serverseitig ist nichts zu
sehen, weil auch nichts geschieht: das ist kein Löschen, sondern ein Cache-Treffer.

**Jetzt:** `ver = max(Date.now(), vorher + 1, lastChunkVersion + 1)`. Drei Terme, weil die Uhr
allein nicht reicht — Löschen und Neuschreiben innerhalb derselben Millisekunde ist beim Import
normal und vergäbe dieselbe Zahl zweimal. Der Platten-Scan nimmt die **mtime** der Datei statt
einer 1, und `getMap` merged mit `Math.max` statt „Dokument gewinnt", damit alte Zähler-Versionen
beim Laden **einmal** auf die mtime angehoben werden — das ändert die URL und umgeht jeden
vergifteten Cache-Eintrag. Tests: `map-editor.service.spec.ts`.

## Karteneditor v2 — Undo über Massenoperationen

`UndoStack.clear()` wird vor jeder Operation gerufen, die Chunks **ohne** `onBeforePaint`
umschreibt: Landmassen-Stempel, Bereich-Löschen, Stufe leeren.

Diese Operationen sind bewusst nicht undo-fähig — das war aber nur die halbe Miete. Die
Snapshots *früherer* Striche beschreiben dieselben Chunks und sind danach veraltet, und
`ChunkManager.restore` blittet einen **ganzen 512²-Chunk mit `clear: true`**. Ein Strg+Z über
einen Import hinweg verlor also nicht bloß einen Strich, sondern setzte einen kompletten Chunk
Karte von *vor* dem Import zurück, markierte ihn dirty und lud ihn hoch.

Das war die Ursache des wiederkehrenden „quadratischen Artefakts": chunkförmig (weil ein ganzer
Chunk ersetzt wird), ohne neuen Stempel, Minuten später, mit Inhalt der „wie ein früherer
Stempelversuch aussieht" — es *ist* der Zustand vor dem Stempel. Und immer dieselben Chunks:
genau die, die vorher bemalt und damit erfasst worden waren.

Snapshots gezielt zu entfernen wäre schlechter: ein Eintrag umfasst alle Chunks eines Strichs,
und die übrigen wiederherzustellen baute den Strich aus zwei Epochen zusammen.
Regressionstests: `undo-stack-staleness.spec.ts`.

## Karteneditor v2 — Wartung: Stufe leeren (Reiter *Karte*)

Löscht ein Raster einer Stufe auf der **ganzen** Karte (`DELETE …/chunks/:layer/:tier` über
einen Bereich, der alles umfasst), mit „Zählen" davor.

**Warum es das braucht.** Import und Pinsel erreichen prinzipiell nur ihren eigenen *Bereich*
bzw. ihre eigene *Stufe*. Inhalt, der in einer anderen Stufe hängt, ist damit unerreichbar —
und weil der Composite fein über grob liest, überschreibt er jede gröbere Stufe überall.
Konkreter Fall: ein früherer Import schrieb seine Farbe nach `landColor/med` (damals ging
Farbe auf dieselbe Stufe wie die Form). Ein neuer Import legt Farbe auf Grob und räumt nur sein
eigenes Rechteck auf — die Mittel-Farbe bleibt und gewinnt weiter. Kein noch so häufiges
Neu-Stempeln entfernt sie; es braucht ein kartenweites Werkzeug.

Erkennungsmerkmal aus den Dateigrößen: `landColor/med` mit ~290 KB pro 512²-Chunk ist
Bildmaterial (schlecht komprimierbar), Pinselarbeit liegt eine Größenordnung darunter.

## Karteneditor v2 — Grundfarben & Detailstufen von Hand

**Grundfarben** (Reiter *Karte*): `settings.waterBase` und `settings.landBase` (Pergament
`#e4d5b7`). Der Shader rechnet `mix(uLandDefault, lc.rgb, lc.a)` — die Grundfarbe erscheint
**nur**, wo keine Farbdeckung liegt, kann also nie bewusst gemaltes Land übermalen. Genau
deshalb ist sie eine Einstellung: „die ganze Karte umfärben“ war vorher nur durch *Malen*
möglich, was die Grundfarbe in irgendeiner Detailstufe vergrub. Ein Uniform, kein Chunk wird
neu geschrieben.

**Arbeitsstufe** (Statusleiste, `Auto | Grob | Mittel | Hoch`): Die Stufe bestimmt nicht nur
die Ansicht, sondern worauf ein Strich *schreibt* — `beginPaint` liest `chunks.detailTier`.
Ohne Pin ist beides an den Zoom gekoppelt, und „grobe Basis korrigieren, während man nah genug
dran ist, um etwas zu erkennen“ war unmöglich.

- `ChunkManager.tierPin` wird **geklemmt**, nicht befolgt: übersteigt die Stufe
  `TARGET_CHUNKS_ON_SCREEN`, greift wieder die Automatik. Ein Pin kann nie mehr Kacheln kosten
  als die automatische Wahl (`tier-pin.spec.ts`).
- **Der Pin gilt auf jeder Zoomstufe.** Vorher wurde er gegen das Kachelbudget geklemmt und
  fiel still auf die Automatik zurück: „Mittel festnageln, herauszoomen" zeigte plötzlich Grob,
  „Hoch" zeigte Mittel bis man nah genug dran war. In einem Modus, der zum Aufräumen *einer*
  Stufe da ist, ist das stille Ersetzen durch eine andere das Schlimmste, was passieren kann.
- Das Budget ist nicht weg, es sitzt woanders: `TerrainView` zeichnet höchstens
  `MAX_TERRAIN_CELLS` Zellen um die Bildmitte. Ein Pin, der den Schirm nicht füllen kann, zeigt
  also *einen Teil seiner eigenen* Stufe statt alles einer fremden. Zwei Bedingungen dafür
  (`tier-pin.spec.ts`):
  - `MAX_TERRAIN_CELLS` (100) muss **unter** `MAX_RESIDENT_CELLS` (124) liegen — sonst ist im
    selben Frame jede Zelle sichtbar, also keine verdrängbar, und der VRAM läuft voll.
  - Der Kachel*bereich* wird vor dem Aufzählen geklemmt, nicht erst die Liste danach: „Hoch
    festnageln und ganz herauszoomen" umfasst Millionen Positionen, deren bloßes Auflisten und
    Sortieren pro Frame schon der Stall wäre.
- Beim Isolieren schreiben Pinsel **nur diese Stufe** (`paintWorld(..., onlyTier)`), inklusive
  Radierer. Bewusst an die Isolierung gekoppelt und nicht an den Pin: der Pin ist auch nur eine
  Art hinzusehen, und still das Verhalten jedes Pinsels zu ändern wäre eine Falle. Wird zusammen
  mit `strokeTier` beim Strichbeginn eingefroren.
- Neue Werkzeuge `landColorEraser` / `waterColorEraser` („Farbe radieren“, Icon
  `ground_color_eraser_normal`): nehmen Farbe weg, ohne das Land zu entfernen — der Weg, eine
  Fläche wieder der Grundfarbe oder einer gröberen Stufe zu überlassen.

**Sync:** `MapOp` `chunkDrop` (`{layer, tier, cells}`) meldet server-seitig gelöschte Chunks.
Bewusst **nicht** über `chunkInvalidations$` — eine Invalidierung heißt „neu holen“, und ein
leerer Fetch lässt die Textur absichtlich stehen (das schützt frische Farbe vor einem späten
404). Ein Drop muss den Record stattdessen freigeben: `chunkDrops$` → `ChunkManager.dropChunks`.
Die REST-Löschung läuft **vor** dem Broadcast, weil sie als einzige Mutation hier nicht
optimistisch anwendbar ist.

**Der Drop ist der einzige Op, der zu spät kommen kann** — und das ist keine Theorie, sondern
die Ursache abgeschnittener Import-Bereiche mit harter Kante mittendrin. Ein Import löscht den
Bereich (Socket) und stempelt ihn sofort neu (HTTP); zwischen beiden Kanälen gibt es keine
Reihenfolge, das Echo des eigenen Löschens trifft also mitten im Hochladen ein.

- **Server:** `applyOp` behandelt `chunkDrop` als **reinen Relay** und ändert nichts. Gelöscht
  hat schon `clearChunks` über REST; ein erneutes Anwenden würde die Version einer Kachel
  löschen, deren Datei aktuell auf der Platte liegt.
- **Client:** `applyRemoteOp` filtert den Drop **vor** `applyMapOp` gegen `ownChunkVersions`
  (`clearChunks` löscht dort jeden betroffenen Eintrag, ein wieder vorhandener bedeutet also
  „seither selbst hochgeladen“ → Drop überspringen). Sonst gäbe der Renderer Texturen frei, die
  er gerade bemalt hat. Regressionstest: `chunk-drop.spec.ts`.

**Symbole sind keine Kacheln.** `symbols`/`labels`/`regions`/`markers` sind Vektorobjekte in
einer flachen Liste ohne jede Stufe — Stempeln und Stufen-Löschen fassen sie nie an. Deshalb:
- optionales „Symbole im Bereich löschen“ beim Import (`clearImportObjects`, Default **aus**,
  weil Symbole Handarbeit sind, die Raster dagegen eine Kopie der Bildvorlage),
- in der Einzelstufen-Ansicht wird `objectLayer` **ausgeblendet**: Symbole über einer isolierten
  Stufe sagen nichts über deren Inhalt und lesen sich wie nicht geladenes Terrain.

**`tierEraser` („Stufe radieren“, in beiden Terrain-Reitern):** radiert `height` + `landColor` +
`waterColor` und schreibt **immer nur die aktive Stufe** (`toolIsTierLocal`, unabhängig von der
Isolierung — ein Kaskadieren würde genau die Stufen leeren, die es freilegen soll). Unterschied
zu `landEraser`: der bedeutet „hier ist kein Land“ und *schreibt* Meer ins Höhenfeld, dieser
macht die Stufe transparent, sodass die gröbere durchkommt.

## Karteneditor v2 — Geheimnis-Gruppen (Reiter *Geheimnisse*)

Ein Geheimnis am Tisch ist selten *ein* Objekt: „Das Räuberlager“ ist eine Beschriftung, drei
Zelte und ein Umriss, und sie müssen **gemeinsam** erscheinen — einzeln aufgedeckt sieht die
Gruppe ein Rätsel, das sich vor ihren Augen zusammensetzt. Das Häkchen „Als Geheimnis“ pro
Objekt gab es schon; was fehlte, war ein Griff für das Bündel.

**`vis` bleibt die Autorität.** Eine Gruppe ist eine *Beschriftung obendrauf*, kein zweiter
Sichtbarkeitsmechanismus: `MapObjectBase.secret` hält nur die Gruppen-Id, `vis` entscheidet
weiterhin, was der Server ausliefert. Damit erbt alles die vorhandene Mechanik unverändert —
`viewFor` filtert, und der `upd`-Zweig im Gateway verschickt ein `secret → public` als frisches
`add` an Spieler (und ein `public → secret` als `del`, weshalb *Verbergen* ohne Zusatzcode
funktioniert). Ließe man die Gruppe über Sichtbarkeit entscheiden, gäbe es zwei Quellen für
„darf ein Spieler das sehen“, und das erste Objekt, bei dem sie sich widersprechen, leckt.

**Mitgliedschaft ist einseitig.** Gruppen führen keine Mitgliederliste; die Objekte zeigen über
`secret` auf ihre Gruppe. Ein zweiseitiges Modell muss bei jedem Löschen, Verschieben und Undo
beide Hälften nachziehen und driftet beim ersten Versäumnis. `membersOf` scannt stattdessen —
das läuft auf Klick, nicht pro Frame.

**Gelöscht wird mit `''`, nie mit `undefined`.** `applyMapOp` wendet `upd` per `Object.assign`
an, lokal klappt `undefined` also. Über den Socket nicht: `JSON.stringify` wirft
undefined-wertige Schlüssel ersatzlos weg, der Sender sähe das Objekt die Gruppe verlassen,
alle anderen Clients und die Datei nicht. `map-secrets.spec.ts` schickt die Ops deshalb
absichtlich durch eine JSON-Runde.

**Auch die Namen sind Spoiler.** `viewFor` liefert Spielern `secrets: []`, und der `set`-Op auf
`secrets` geht im Gateway **nur an GMs** (`isOpPublic`). „Räuberlager“ in den Devtools verrät
den Hinterhalt so gut wie die Symbole selbst. Spieler brauchen die Liste nie: Mitgliedschaft
steht auf den Objekten, und ein aufgedecktes Objekt kommt als ganz gewöhnliches öffentliches an.

**Auflösen deckt nichts auf** (`dissolveOps`): es ist Aufräumen, kein Enthüllen. Andernfalls
könnte das Sortieren des Panels ein Geheimnis auf die Spielerschirme kippen.

**Kategorieübergreifende Auswahl:** `secretSelection` trägt `{c, id}` statt bloßer Ids und
speist die vorhandenen `setSelection`-Pfade der drei Views mit ihrem jeweiligen Anteil — keine
zweite Hervorhebungslogik. `RegionView.inRect` ist neu und trifft „berührt den Rahmen“, nicht
„liegt darin“: ein Territorium ist viel größer als das Gummiband über einer Symbolgruppe.
`markers` bleibt außen vor — die Sammlung existiert im Modell, hat aber **keine View**, es gibt
also nichts anzuklicken. Entf ist im Reiter bewusst wirkungslos (die Pro-Reiter-Auswahlen leben
weiter und würden sonst ein ganz anderes Objekt löschen); Esc leert die Auswahl.

**Getroffen wird das *engste*, nicht das oberste Objekt** (`pickTightest`). Eine feste
Rangfolge machte Symbole unanklickbar: die Reichweite einer Beschriftung ist ihr ganzer Kasten,
und da Beschriftungen zuerst geprüft wurden, lieferte der Klick auf eine Burg deren Namen. Jede
View gibt jetzt zurück, *wie tief* der Klick in ihrer Form sitzt (0 = Mitte, 1 = Rand); das
Kleinste gewinnt, bei Gleichstand das Obenliegende. Dazu ist `LabelView.hitTest` eine **Ellipse**
über dem gebackenen Kasten statt eines Kreises mit halber Längsseite — „Das Nördliche
Königreich“ beanspruchte vorher auch senkrecht einen Radius von seiner halben Breite und
verschluckte jedes Symbol ringsum. `halfExtents` ist die eine Quelle dieser Größe, aus der auch
Auswahlrahmen und Übersicht lesen.

**Übersicht (`secret-overview.ts`):** Prüfansicht statt Liste. Das Terrain liegt hinter einem
Schleier (`MapRenderer.setDim`, eigene Ebene *zwischen* Terrain und Objekten — über allem würde
sie das Geprüfte verdecken), jede Gruppe bekommt einen grünen Rahmen um alle Mitglieder, jedes
Mitglied zusätzlich einen Ring, und **öffentliche Beschriftungen einen roten Rahmen**: das sind
die Versäumnisse, und ein vergessener Burgname verrät den Ort so gut wie das Burgsymbol. Rot
markiert nur Beschriftungen — eine Karte ist überwiegend öffentlicher Wald, den alle zu umranden
die paar Namen begraben würde, auf die es ankommt. Auf das Sichtfeld beschnitten und in **einem**
`Graphics`; 300 Gruppen als je eigene Knoten wären tausende Display-Objekte pro Pan.
Strichbreiten werden durch den Zoom geteilt, damit sie beim Herauszoomen nicht verschwinden.

Es ist ein **Umschalter, kein Werkzeug** (`overviewOn`, in `map-editor.brush.v1` gemerkt). Als
eigenes Werkzeug erzwang es die Wahl zwischen Hinsehen und Beheben: kaum zeigte die Übersicht
eine Beschriftung ohne Geheimnis, musste man genau die Ansicht verlassen, die einen darauf
gestoßen hatte. Auswählen und Verschieben laufen darunter weiter.

**Auswahl wird gerahmt, nicht ausgegraut.** Ein zweiter `Graphics` im selben Container zeichnet
weiße Kästen um alles Ausgewählte — unabhängig davon, ob die Übersicht an ist. Deckkraft
allein reichte nicht: ausgewählt war 0.65, geheim 0.5, zwei kaum unterscheidbare Abstufungen auf
Bildmaterial jeder Farbe. Ein Kasten hängt nicht davon ab, was darunter liegt.

**Der Name kommt von der Beschriftung** (`secretNameFor`): ein Geheimnis heißt fast immer schon
so, wie es auf der Karte steht. Die erste Beschriftung der Auswahl gewinnt, Dopplungen sind
erlaubt (zwei Orte dürfen gleich heißen; stilles Umbenennen wäre schlimmer als die Kollision);
nur ohne Beschriftung greift die durchnummerierte Rückfallebene.

**Verschieben und Erweitern:** Ziehen bewegt die ganze Auswahl (`moveOps`); bei Regionen wandern
**alle Stützpunkte** mit, denn der Umriss *ist* die Region — nur den gepufferten Schwerpunkt zu
verschieben ließe die Form stehen und den Index still danebenzeigen. Die Deltas werden gegen die
beim Griff geklonten Startpositionen gerechnet, nicht gegen den laufenden Stand. Ein Klick auf
ein Mitglied öffnet dessen Gruppe, `addSelectionToSecret` hängt weitere Objekte an.

**Kein Aufdecken im Editor.** `revealOps`/`hideOps` bleiben in `map-secrets.ts` (samt Tests),
sind aber aus der Oberfläche verschwunden: aufgedeckt wird am Tisch, im Spielmodus. Im Editor
wäre es ein Knopf, dessen ganze Wirkung auf einem Bildschirm liegt, vor dem der Klickende nicht
sitzt.

**Keine Liste aller Geheimnisse.** Auf einer fertigen Karte sind mehrere hundert zu erwarten;
das rechte Panel zeigt darum nur Zähler (`secretStats`) und das **eine** gerade gewählte
Geheimnis (`activeSecret`). Die Karte ist das Verzeichnis.

**Arbeitsstufe startet auf *Mittel*** statt Auto (in `map-editor.brush.v1` mitgespeichert,
`tierIsolate` bleibt aus): Auto ändert still, worauf ein Strich schreibt, sodass derselbe Pinsel
an derselben Stelle je nach Zoom in einer anderen Stufe landet — und der Unterschied fällt erst
später auf, bei einem Zoom, der die nicht geschriebene Stufe abtastet.

Offen (Phase B): Spielmodus mit Nebel (`fog.revealed` steht ungenutzt im Dokument), Token,
Lineal, Pings und Skizzen-Overlay (Vektoren **über** der Karte, nie in die Terrain-Raster).

## Karteneditor v2 — Spielmodus

Umschalter **Bearbeiten / Spielen** in der Werkzeugleiste, nur für den GM; Spieler sind immer
im Spielmodus, der Schalter wird ihnen gar nicht gezeigt. Der Modus ist **lokal**
(`map-editor.brush.v1`), nicht synchronisiert: was der GM auf dem Schirm hat, gehört nicht zur
Karte, und ein zweiter GM soll dadurch nicht den Modus wechseln. Im Spielmodus liegt der Zeiger
vollständig bei den Spielwerkzeugen — kein Geländepinsel ist erreichbar, und Entf/Strg+Z sind
abgeschaltet (die Bearbeitungsauswahl überlebt den Wechsel und würde sonst mitten in der Sitzung
ein Symbol löschen).

**Werkzeuge:** Lineal, Ping, Skizze, Nebel, Figuren, Geheimnis aufdecken. `gameToolsFor(isGM)`
gibt Spielern nur Lineal, Ping und Skizze — die Liste ist aber nur Bequemlichkeit, jede
GM-Aktion prüft zusätzlich selbst.

**Nebel (`fog-view.ts`) ist ein Canvas, kein Haufen Hexe.** Ein dunkles Hex je unaufgedecktem
Hex zu zeichnen skaliert nicht: bei dem Zoom, bei dem ein Hex noch drei Bildschirmpixel breit
ist, liegen ~640 × 400 davon im Bild — eine Viertelmillion Pfade pro Pan, und eine
Kampagnenkarte ist überwiegend Nebel, das ist also der *Normalfall*. Umgedreht stimmt die
Skalierung: Nebel ist ein gefülltes Rechteck, aus dem die **aufgedeckten** Hexe ausgestanzt
werden (`destination-out` auf dem Canvas — Pixi 8 hat keine invertierte Maske, und
Erase-Blending bräuchte ein eigenes Rendertarget). Die Kosten folgen damit dem Erkundeten, nicht
dem Sichtfeld. Feste Texturgröße (1024×768, einmal angelegt und in place neu hochgeladen);
jenseits von `MAX_HOLES` aufgedeckten Hexen im Bild verschwindet der Nebel ganz, weil er dort
ohnehin nichts mehr verbirgt. Spieler bekommen ihn deckend, der GM bei 0,42 — wer den Nebel
nicht sieht, kann ihn nicht aufdecken.

**Nebel-Ops sind Deltas** (`{ t: 'fog', add?, remove? }`), nie das ganze Set: ein `set` auf
`fog.revealed` würde bei jedem Pinseltupfer zehntausende Schlüssel verschicken. Angewandt über
ein `Set`, erst `remove`, dann `add`, damit ein Tupfer, der beides berührt, nicht von der
Reihenfolge im Payload abhängt.

**Skizze (`sketch-view.ts`) liegt ÜBER der Karte, nie darin.** Vektoren in einem eigenen
Container; kein Chunk, keine Detailstufe, kein Raster wird angefasst. Eine Geste im Spiel darf
nicht dauerhaft und nicht von der Karte ununterscheidbar werden. Die laufende Linie hat ein
eigenes `Graphics`, damit ein Zug nicht alle bisherigen Linien neu zeichnet, und Punkte werden
beim Zeichnen ausgedünnt (Rohbewegungen liegen pixelweise vor — hundertfach mehr Geometrie als
die Linie braucht, und alles davon wird synchronisiert).

**Spieler dürfen genau eine Sache schreiben.** Bis hierher war jedes Op GM-Sache;
`isPlayerWritableOp` ist eine enge Whitelist, keine Lockerung: nur die Sammlung `sketch`, nur
`add`/`del`, die Linie muss öffentlich sein und die **eigene** Benutzerkennung als `author`
tragen, und beim Löschen prüft das Gateway den gespeicherten Urheber. Der Name kommt aus dem
Handshake, nie aus dem Payload — sonst könnte jeder eine Linie im Namen eines anderen zeichnen.

**Ping und Lineal sind Gesten, keine Bearbeitungen** (`play-aids.ts`): eigene Socket-Nachrichten,
nichts davon landet im Dokument — ein gespeicherter Ping hieße, die Karte merkt sich, wohin
jemand vor drei Sitzungen gezeigt hat. Linien sind nach Socket verschlüsselt (ein Client ersetzt
immer seine eigene) und werden bei `handleDisconnect` entfernt, sonst bliebe die Linie eines
geschlossenen Tabs für den Rest der Sitzung auf allen Karten stehen. Die eigene Linie wird lokal
gezeichnet, ohne auf das Echo zu warten.

**Figuren** rasten auf Hexmitten ein, weil Entfernungen daran gemessen werden; sie sind
gewöhnliche Objekte der Sammlung `tokens` und erben damit Ops, Persistenz und Filterung.
Verschoben wird mit **einem** Op beim Loslassen, nicht einem je überquertem Hex. Vorerst
GM-only.

**Maßstabsfehler nebenbei behoben:** `worldToKm` teilt durch `HEX_HEIGHT`, nicht durch
`HEX_X_SPACING`. Der Spaltenabstand ist nur 3/4 einer Hexbreite und damit *nicht* der Abstand
zwischen Nachbarn (der ist `√3·R`, in allen sechs Richtungen gleich — das macht ein Hexgitter
aus). Betraf auch die Größenangabe beim Landmassen-Import, die jede Karte ~15 % zu groß meldete.

**`/world-map` leitet noch nicht um.** Der Plan koppelt das an praktisch bestätigte Parität, und
die steht aus — der alte Betrachter bleibt bis dahin der Rückfallweg.
