# Naming Conventions & Component Definitions

Last Updated: March 2, 2026

## Core Concepts

### 📚 LIBRARY (LibraryComponent)
**Route:** `/library/:libraryId`  
**File:** `frontend/src/app/library/library.component.ts`  
**Purpose:** Professional content editor where you DEFINE all library content with tabs and powerful editors

**Features:**
- Tab-based interface (Items, Runes, Spells, Skills, Status Effects, Macros, Shops, Loot Bundles)
- **Library Info Section** at the top with:
  - Description
  - Tags
  - **🔗 Library Dependencies** (multi-select dropdown with Ctrl/Cmd)
  - Public/Private toggle
- Professional editors for Shops and Loot Bundles:
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

### 🌍 WORLD LIBRARY (LibraryTabsComponent)
**Location:** Inside WorldComponent  
**File:** `frontend/src/app/world/library-tabs/library-tabs.component.ts`  
**Purpose:** READ-ONLY view of all content from libraries linked to the world

**Features:**
- Shows aggregated content from all world-linked libraries
- Tabs for items, runes, spells, skills, status effects
- Drag items to send to players
- Search/filter functionality
- Context menu to send items to characters
- **Does NOT include shops/bundles** (those are separate events)

**Usage:**
- DM opens a world → sees World Library section
- Shows combined content from all linked libraries
- Used to quickly send items/spells to players
- Not for editing (edit in the Library view instead)

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

| Feature | Library (Editor) | Assets (File Browser) | World Library (View) |
|---------|------------------|----------------------|---------------------|
| **Purpose** | Define & edit content | Organize files in folders | View world content |
| **Editable** | ✓ Full editors | ✓ File management | ✗ Read-only |
| **Dependencies** | ✓ Multi-select dropdown | ✓ Settings panel | ✗ Auto-resolved |
| **Shops/Bundles** | ✓ Professional editors | ✓ Simple metadata only | ✗ Not shown here |
| **Context Menu** | ✓ Edit/Duplicate/Delete | ✓ File operations | ✓ Send to players |
| **Navigation** | Tabs | Folders | Tabs |

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
    └── library-tabs/                 ← 🌍 WORLD LIBRARY (Read-only View)
        ├── library-tabs.component.ts
        ├── library-tabs.component.html
        └── library-tabs.component.css
```

---

## Routes

- `/library/:libraryId` → **Library** (Professional Editor) ← **PRIMARY VIEW**
- `/assets/:libraryId` → **Assets** (File Browser) ← Optional advanced organization
- `/world/:worldName` → **World** (includes World Library section)

---

## Summary for Communication

When discussing features, use these terms:

- **"in the Library"** = The tabbed editor with professional shop/bundle editors
- **"in Assets"** = The folder tree file browser (rarely used)
- **"in the World Library"** = The read-only tabs inside the World view showing linked content
- **"Library Info section"** = Top section in Library view with dependencies selector
- **"Library Settings"** = ⚙️ button in Assets view header

---

## Migration Notes

- **Old confusion:** `/library/:libraryId` used to route to AssetBrowserComponent
- **Fixed:** Now routes to LibraryComponent (the proper tabbed editor)
- **AssetBrowserComponent** moved to `/assets/:libraryId` for optional use
- All previous references to "library" meaning the file browser have been disambiguated
