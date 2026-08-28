# Naming Conventions & Component Definitions

Last Updated: March 2, 2026

## Core Concepts

### 📚 LIBRARY (LibraryComponent)
**Route:** `/library/:libraryId`  
**File:** `frontend/src/app/library/library.component.ts`  
**Purpose:** Professional content editor where you DEFINE all library content with tabs and powerful editors

**Features:**
- Tab-based interface (Items, Runes, Spells, Skills, Status Effects, Macros, Shops)
- **Library Info Section** at the top with:
  - Description
  - Tags
  - **🔗 Library Dependencies** (multi-select dropdown with Ctrl/Cmd)
  - Public/Private toggle
- Professional editor for Shops:
  - Select items from dependency libraries
  - Add deals/loot items with detailed configuration
  - Full pricing, stock, and negotiation settings
- **Context Menu** (right-click any item, shop, or bundle):
  - ✏️ Edit
  - 📋 Duplicate
  - 🗑️ Delete
- Search bar to filter content
- Auto-save functionality

**Usage:**
1. Click on a library → Opens Library view (tabbed editor)
2. Use Library Info section at top to set dependencies
3. Right-click any content to edit/duplicate/delete
4. Use professional shop/bundle editors to create complex game content

---

### 📁 ASSETS (AssetBrowserComponent)
**Route:** `/assets/:libraryId`  
**File:** `frontend/src/app/asset-browser/asset-browser.component.ts`  
**Purpose:** File/folder organization system (Unity-like asset browser) for managing library files

**Features:**
- Folder tree navigation
- File/folder creation, rename, delete
- Drag-and-drop file organization
- Copy/paste operations
- Search functionality
- Grid/list view modes
- **Library Settings Panel** (⚙️ button in header):
  - Library dependencies
  - Description, tags
  - Public/private toggle

**Usage:**
- Optional advanced file organization view
- Currently accessible at `/assets/:libraryId`
- Provides folder-based organization if needed
- Has simpler editors focused on file metadata

**Note:** Most users will primarily use the LIBRARY view. Assets view is for advanced file organization if needed.

---

### 🗂 GM-SCHREIBTISCH (GmDeskComponent)
**Location:** Inside WorldComponent (the panel titled "Bibliothek")  
**File:** `frontend/src/app/world/gm-desk/gm-desk.component.ts`  
**Purpose:** The DM's desk — prepare things in named tabs, hand them to players, reveal a tab as
shared loot. Replaces the old read-only World Library list.

**Layout:** three columns — **Porträts ⟂ Vorbereitung ⟂ Bibliothek**

**Features:**
- **Left**: party portraits. Selecting one makes every ＋ go straight to that player; portraits are
  also drop targets.
- **Middle**: GM tabs (add / rename / delete / reveal) plus one tab per NPC on the **active lobby
  map**. A revealed tab glows; individual entries can be hidden from players.
- **Right**: folder-grouped, searchable browser over items, runes, spells, skills, status effects,
  materials and all five knowledge kinds.
- Revealed tabs show up under Aktive Events as a shared loot pool; claiming is server-arbitrated.
- Entries can be dropped into the party's shared bag.
- Every browser row shows which library it came from and has a ✎ that jumps to
  `/library/:libraryId?q=<name>` — editing still lives in the Library editor, this is the way back
  in. Chips above the categories open a linked library directly.

**Usage:**
- DM opens a world → sees the GM desk where the World Library used to be
- Not for editing content (edit in the Library view instead)

---

## Workflow Example

### Creating a Shop with Items from Multiple Libraries:

1. **Create Base Item Library:**
   - Navigate to `/library/base-items`
   - Add items (swords, potions, etc.)
   - Save

2. **Create Shop Library:**
   - Navigate to `/library/my-shop`
   - Click ⚙️ Library Settings or see Library Info section
   - In **🔗 Library Dependencies**, select "base-items" library
   - Click **🏪 Shops** tab
   - Click **+ Add Shop** button
   - Right-click shop to Edit/Duplicate/Delete
   - In shop editor:
     - Click "+ Add Deal"
     - Select item from dropdown (includes items from base-items library)
     - Set price, quantity, etc.
   - Save

3. **Use in World:**
   - Open world
   - Link "my-shop" library to world
   - System auto-includes "base-items" library (dependency resolution)
   - Go to Events tab
   - Shops from library available to add as events
   - Quick edit: set discount percentage in world

---

## Key Differences

| Feature | Library (Editor) | Assets (File Browser) | GM-Schreibtisch |
|---------|------------------|----------------------|-----------------|
| **Purpose** | Define & edit content | Organize files in folders | Prepare & hand out content |
| **Editable** | ✓ Full editors | ✓ File management | ✗ Browses, does not edit |
| **Dependencies** | ✓ Multi-select dropdown | ✓ Settings panel | ✗ Auto-resolved |
| **Shops** | ✓ Professional editor | ✓ Simple metadata only | ✗ Live under Aktive Events |
| **Hand to players** | ✗ | ✗ | ✓ ＋, drag, or reveal a tab |
| **Navigation** | Tabs | Folders | Three columns |

---

## Component File Locations

```
frontend/src/app/
├── library/                          ← 📚 LIBRARY (Professional Editor)
│   ├── library.component.ts
│   ├── library.component.html
│   └── library.component.css
│
├── asset-browser/                    ← 📁 ASSETS (File Browser)
│   ├── asset-browser.component.ts
│   ├── asset-browser.component.html
│   └── asset-browser.component.css
│
└── world/
    └── gm-desk/                      ← 🗂 GM-SCHREIBTISCH
        ├── gm-desk.component.ts
        ├── gm-desk.component.html
        └── gm-desk.component.css
```

---

## Routes

- `/library/:libraryId` → **Library** (Professional Editor) ← **PRIMARY VIEW**
- `/assets/:libraryId` → **Assets** (File Browser) ← Optional advanced organization
- `/world/:worldName` → **World** (includes the GM-Schreibtisch)

---

## Summary for Communication

When discussing features, use these terms:

- **"in the Library"** = The tabbed editor with professional shop/bundle editors
- **"in Assets"** = The folder tree file browser (rarely used)
- **"on the GM desk"** / **"im GM-Schreibtisch"** = The three-column panel inside the World view
  (portraits, prepared tabs, library browser). It replaced the read-only World Library.
- **"Library Info section"** = Top section in Library view with dependencies selector
- **"Library Settings"** = ⚙️ button in Assets view header

---

## Migration Notes

- **Old confusion:** `/library/:libraryId` used to route to AssetBrowserComponent
- **Fixed:** Now routes to LibraryComponent (the proper tabbed editor)
- **AssetBrowserComponent** moved to `/assets/:libraryId` for optional use
- All previous references to "library" meaning the file browser have been disambiguated
