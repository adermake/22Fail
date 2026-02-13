# Data Storage Migration - Summary

## What Changed

Your DND assist tool has been successfully migrated from storing all data in single JSON files to a folder-based structure with individual files for each entity.

### Old Structure
```
- data.json (all characters in one file)
- worlds.json (all worlds in one file)
- backend/races.json (all races in one file)
```

### New Structure
```
- characters/ (folder - outside backend)
  - CharacterName-characterId.json
  - unnamed-test.json
  - etc.

- worlds/ (folder - outside backend)
  - WorldName.json
  - test.json
  - etc.

- races/ (folder - outside backend)
  - RaceName-raceId.json
  - Movement-race_1768856821933_539ydzta1.json
  - etc.
```

## Migration Results

✅ **21 characters** successfully migrated from backend/data.json
✅ **1 world** successfully migrated from worlds.json
✅ **4 races** successfully migrated from backend/races.json

## File Naming Convention

All files now have **meaningful names** that include human-readable information:

- **Characters**: `CharacterName-characterId.json` (e.g., `Aragorn-char_123.json`)
- **Worlds**: `WorldName.json` (e.g., `MiddleEarth.json`)
- **Races**: `RaceName-raceId.json` (e.g., `Elf-race_456.json`)

If a character/race has no name, it defaults to `unnamed-id.json`.

## Key Changes to Code

### data.service.ts
- Completely refactored to work with individual files instead of single JSON files
- Added file name sanitization to handle special characters
- Added helper methods to find files by ID
- Character names are now reflected in filenames and updated when the name changes
- Each save/load operation now works with individual files

### app.controller.ts
- Updated stress test cleanup method to work with the new file structure
- All other endpoints continue to work as before

## Benefits

1. ✅ **No more single point of failure** - One corrupted character won't affect all others
2. ✅ **Easy to read** - You can see what each file contains just by looking at the filename
3. ✅ **Better organization** - Characters, worlds, and races are now in separate folders
4. ✅ **Version control friendly** - Git can now track changes to individual entities
5. ✅ **Easier backup** - You can back up or restore individual characters/worlds/races

## Backup

Your old data files have been backed up to:
- `backup-[timestamp]/worlds.json` (original worlds.json)

The old `backend/data.json` and `backend/races.json` files are still in place but are no longer used by the application.

## Testing

The migration is complete and all endpoints should continue to work as before:

- **GET /api/characters/:id** - Load character
- **POST /api/characters/:id** - Save character
- **PATCH /api/characters/:id** - Update character
- **GET /api/worlds/:name** - Load world
- **POST /api/worlds/:name** - Save world
- **PATCH /api/worlds/:name** - Update world
- **GET /api/races** - List all races
- **POST /api/races** - Save race
- **DELETE /api/races/:id** - Delete race

## Next Steps

1. **Test the application** - Start the backend and test character/world/race operations
2. **Verify data integrity** - Make sure all your characters, worlds, and races are accessible
3. **Delete old files** (optional) - Once you're confident everything works:
   - Delete `backend/data.json`
   - Delete `backend/races.json`
   - Delete `worlds.json`
   - Delete backup folders if no longer needed

## Migration Scripts Created

Two migration scripts were created to help with the data migration:

1. `migrate-data.js` - Migrates data from root-level JSON files
2. `migrate-backend-data.js` - Migrates data from backend/data.json

These scripts can be deleted once you've verified everything works.

## Technical Details

### File Operations

When a character is saved with a new name, the old file is automatically deleted and a new file with the updated name is created. This ensures filenames always reflect the current character name.

### Character ID Extraction

Character IDs are extracted from filenames using this pattern:
- Format: `name-id.json` or `id.json`
- The ID is always the last part before `.json`

### Race Name Updates

When a race name is updated, the file is automatically renamed to reflect the new name.

### World Names

World files are named exactly after the world name (sanitized for filesystem compatibility).

## Rollback (if needed)

If you need to rollback to the old system:

1. Stop the backend server
2. Restore the old `data.service.ts` from git history
3. Restore the old `app.controller.ts` from git history
4. Copy the backup files back to their original locations
5. Delete the characters/, worlds/, and races/ folders
6. Restart the server

---

**Migration Completed Successfully!** 🎉
