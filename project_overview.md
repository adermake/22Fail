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
- **Loot Bundles**: Beutepakete mit claimable Items

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
- **Player View**: current-events-view.component (Sheet-Ansicht - zeigt Portal-Karten)
- **Portal UI**: event-portal.component (Fullscreen-Modal, animiert)
  - Shop-Theme: Braun/Gold Gradient mit Kerzenlicht-Feeling
  - Loot-Theme: Dunkelblau/Lila Gradient mit Goldpartikel
  - CSS Animations: `portalOpen` (scale + rotate), `float`, `sparkle`
  - Schließen via ✕ Button
- **Transaction Popup**: transaction-popup.component 
  - Slide-In von rechts, fade-out nach 2.5s+0.5s
  - Typ-Icons: 🛒 Kaufen (rot), 💰 Verkaufen (grün), 🎁 Beanspruchen (blau)
  - Zeigt Item-Name, Menge, Geldbetrag
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

## Bekannte Limitierungen
- Keine Datenbank: JSON-Files für Persistierung
- Keine User-Auth: Session-basiertes system
- File-basierte Assets: Alle Libraries/Characters als JSON-Files

## Konventionen
- **Sprache**: UI vollständig auf Deutsch
- **Icons**: Emoji-basiert (🏪 shop, 🎁 bundle, 🎪 events, etc.)
- **Type Safety**: Strict TypeScript mit expliziten unions
- **Component Architektur**: Standalone Angular Components (kein NgModule)
