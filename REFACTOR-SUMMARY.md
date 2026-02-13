# Directory-Based Storage Refactor - Summary

## What Was Changed

### 0. All Data Moved to `data/` Folder
- **ALL data storage is now consolidated under a single `data/` directory**
- This includes: characters, worlds, races, images, textures, and textures.json
- Makes backup and organization much simpler

### 1. Character Storage
- **Old**: `characters/CharacterName-id123.json`
- **New**: `data/characters/id123.json`
- Filename now uses ONLY the character ID from the URL
- No dependency on the character name field inside the JSON

### 2. World Storage  
- **Old**: Single file `worlds/WorldName.json` with all data
- **New**: Directory structure per world:
  ```
  data/worlds/{worldName}/
    world.json                 # Core world data
    lobby.json                 # Lobby configuration
    items/{itemId}.json
    spells/{spellId}.json
    runes/{runeId}.json
    skills/{skillId}.json
    loot-bundles/{bundleId}.json
    maps/{mapId}/map.json
  ```

### 3. Race Storage
- **Old**: `races/RaceName-id123.json`
- **New**: `data/races/id123.json`
- Filename now uses ONLY the race ID

### 4. Map Storage
- **Old**: Maps embedded in lobby object within world.json
- **New**: Each map gets its own folder: `data/worlds/{worldName}/maps/{mapId}/map.json`

### 5. Images & Textures
- **Old**: `images/` and `textures/` at root level
- **New**: `data/images/` and `data/textures/`
- Global texture library: `data/textures.json`

## Files Modified

### Backend Files
1. **data.service.ts** - Complete refactor:
   - Removed name-based filename generation for characters and races
   - Added directory structure helpers for worlds
   - Split world data into separate entity files (items, spells, etc.)
   - Moved lobby to separate file
   - Moved maps to individual folders
   - Added helper methods: `readEntityCollection`, `writeEntity`, `deleteEntity`, `readEntity`
   - Updated all CRUD operations to work with new structure

2. **app.controller.ts**:
   - Updated stress-test cleanup to handle:
     - Character files with simple `id.json` format
     - World directories instead of single files (uses `rmSync` recursive delete)

3. **docs.txt**:
   - Completely rewrote "DATA STORAGE" section
   - Added detailed directory structure diagram
   - Documented new philosophy and key principles
   - Clarified URL-driven identity approach

## Key Architecture Decisions

### 1. URL-Driven Identity
- File/folder names determined by URL, not internal JSON data
- `/characters/abc` → `characters/abc.json`
- `/world/testWorld` → `worlds/testWorld/`
- Character name field inside JSON is irrelevant to storage

### 2. Entity Separation
- Each item, spell, skill, rune, loot bundle gets its own file
- Easier to version control, backup, and inspect individual entities
- No more monolithic JSON files with large nested arrays

### 3. Hierarchical Organization
- World is the top-level container
- Lobby belongs to world
- Maps belong to lobby (inside world folder)
- Items/spells/etc belong to world

### 4. Characters Are Global
- Characters not bound to a single world
- Can participate in multiple worlds simultaneously
- Stored at root level, not inside world folders

## API Compatibility

✅ **No API changes required**
- All existing endpoints work the same
- Frontend requires NO changes
- WebSocket events unchanged
- URL routing unchanged

The refactor is **transparent to the frontend** - only the backend storage layer changed.

## Benefits

1. **Human-Readable Structure**
   - Easy to browse files in file explorer
   - Clear organization by entity type
   - Obvious world boundaries (each world is a folder)

2. **Easy Backup/Restore**
   - Copy entire world folder to backup a world
   - Delete world folder to remove a world
   - No need to edit monolithic JSON files

3. **Better Version Control**
   - Git diffs show actual entity changes
   - No more massive JSON diffs
   - Can merge entity changes more easily

4. **Safer Operations**
   - Deleting one item doesn't risk corrupting entire world
   - Atomic writes per entity
   - Easier to recover from partial failures

5. **URL Independence**
   - Changing character name doesn't rename file
   - File identity matches URL routing
   - Less confusion about which file to edit

## Migration Path

See [MIGRATION-TO-DIRECTORY-STRUCTURE.md](./MIGRATION-TO-DIRECTORY-STRUCTURE.md) for detailed migration instructions.

Key steps:
1. Backup existing data
2. Run migration script to transform old structure to new
3. Test thoroughly
4. Deploy updated code
5. Delete backups once confirmed working

## Testing Recommendations

1. **Character Operations**
   - Create new character via frontend
   - Edit character fields
   - Verify file saved as `{id}.json`
   - Load character in multiple browser tabs

2. **World Operations**
   - Create new world
   - Add items, spells, skills, runes
   - Verify each entity has its own file in subdirectories
   - Add characters to world
   - Create loot bundles

3. **Lobby/Map Operations**
   - Create lobby for a world
   - Add multiple maps
   - Verify each map in `maps/{mapId}/` folder
   - Edit map (add tokens, drawings)
   - Switch between maps

4. **Real-time Sync**
   - Open world in multiple browser windows
   - Make changes in one window
   - Verify changes appear in other windows
   - Test character sheet sync while world is open

5. **Stress Test**
   - Run stress test endpoint
   - Verify cleanup deletes all files/folders correctly

## Notes

- Local repository data is for development only
- Production data remains on deployed server
- `characters/`, `worlds/`, `races/` folders added to `.gitignore`
- No TypeScript errors after refactor
- All existing functionality preserved
