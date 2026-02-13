# Migration Guide: To Directory-Based Storage

## Overview
This guide helps migrate from the old file structure to the new directory-based structure.

## What Changed

### Characters
**Old**: `characters/CharacterName-id123.json`  
**New**: `characters/id123.json`

- Filename is now ONLY the character ID from the URL
- No character name in filename
- If you visit `/characters/mychar`, the file is `characters/mychar.json`

### Worlds
**Old**: `worlds/WorldName.json` (single file with everything)  
**New**: `worlds/WorldName/` (directory structure)

```
worlds/{worldName}/
  world.json              # Core data only
  lobby.json              # Lobby configuration
  items/{itemId}.json     # Individual item files
  spells/{spellId}.json   # Individual spell files
  runes/{runeId}.json     # Individual rune files
  skills/{skillId}.json   # Individual skill files
  loot-bundles/{bundleId}.json
  maps/{mapId}/map.json   # Each map in its own folder
```

### Races
**Old**: `races/RaceName-id123.json`  
**New**: `races/id123.json`

- Filename is now ONLY the race ID

## Migration Steps

### On Your Deployed Server

1. **Backup everything first!**
   ```bash
   cp -r characters/ characters_backup/
   cp -r worlds/ worlds_backup/
   cp -r races/ races_backup/
   ```

2. **Migration script** (create as `migrate-to-dirs.js`):

```javascript
const fs = require('fs');
const path = require('path');

// Migrate characters: rename files to just ID
function migrateCharacters() {
  const dir = './characters';
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const baseName = file.replace('.json', '');
    
    // If file has a hyphen, extract the ID part (everything after last hyphen)
    if (baseName.includes('-')) {
      const parts = baseName.split('-');
      const id = parts[parts.length - 1];
      const newName = `${id}.json`;
      
      const oldPath = path.join(dir, file);
      const newPath = path.join(dir, newName);
      
      if (oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
        console.log(`✓ Renamed character: ${file} → ${newName}`);
      }
    }
  }
}

// Migrate races: rename files to just ID
function migrateRaces() {
  const dir = './races';
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const baseName = file.replace('.json', '');
    
    if (baseName.includes('-')) {
      const parts = baseName.split('-');
      const id = parts[parts.length - 1];
      const newName = `${id}.json`;
      
      const oldPath = path.join(dir, file);
      const newPath = path.join(dir, newName);
      
      if (oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
        console.log(`✓ Renamed race: ${file} → ${newName}`);
      }
    }
  }
}

// Migrate worlds: create directory structure
function migrateWorlds() {
  const worldsDir = './worlds';
  const files = fs.readdirSync(worldsDir);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const filePath = path.join(worldsDir, file);
    const worldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const worldName = worldData.name;
    
    // Create world directory
    const worldDir = path.join(worldsDir, worldName);
    if (!fs.existsSync(worldDir)) {
      fs.mkdirSync(worldDir, { recursive: true });
    }
    
    // Create subdirectories
    fs.mkdirSync(path.join(worldDir, 'items'), { recursive: true });
    fs.mkdirSync(path.join(worldDir, 'spells'), { recursive: true });
    fs.mkdirSync(path.join(worldDir, 'runes'), { recursive: true });
    fs.mkdirSync(path.join(worldDir, 'skills'), { recursive: true });
    fs.mkdirSync(path.join(worldDir, 'loot-bundles'), { recursive: true });
    fs.mkdirSync(path.join(worldDir, 'maps'), { recursive: true });
    
    // Save items
    const items = worldData.itemLibrary || [];
    for (const item of items) {
      const itemPath = path.join(worldDir, 'items', `${item.id}.json`);
      fs.writeFileSync(itemPath, JSON.stringify(item, null, 2));
    }
    
    // Save spells
    const spells = worldData.spellLibrary || [];
    for (const spell of spells) {
      const spellPath = path.join(worldDir, 'spells', `${spell.id}.json`);
      fs.writeFileSync(spellPath, JSON.stringify(spell, null, 2));
    }
    
    // Save runes
    const runes = worldData.runeLibrary || [];
    for (const rune of runes) {
      const runePath = path.join(worldDir, 'runes', `${rune.id}.json`);
      fs.writeFileSync(runePath, JSON.stringify(rune, null, 2));
    }
    
    // Save skills
    const skills = worldData.skillLibrary || [];
    for (const skill of skills) {
      const skillPath = path.join(worldDir, 'skills', `${skill.id}.json`);
      fs.writeFileSync(skillPath, JSON.stringify(skill, null, 2));
    }
    
    // Save loot bundles
    const bundles = worldData.lootBundles || [];
    for (const bundle of bundles) {
      const bundlePath = path.join(worldDir, 'loot-bundles', `${bundle.id}.json`);
      fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2));
    }
    
    // Save lobby if exists
    if (worldData.lobby) {
      const lobbyPath = path.join(worldDir, 'lobby.json');
      const lobbyData = { ...worldData.lobby };
      
      // Extract and save maps
      if (lobbyData.maps) {
        for (const mapId in lobbyData.maps) {
          const mapDir = path.join(worldDir, 'maps', mapId);
          fs.mkdirSync(mapDir, { recursive: true });
          const mapPath = path.join(mapDir, 'map.json');
          fs.writeFileSync(mapPath, JSON.stringify(lobbyData.maps[mapId], null, 2));
        }
        delete lobbyData.maps;
      }
      
      fs.writeFileSync(lobbyPath, JSON.stringify(lobbyData, null, 2));
    }
    
    // Save core world.json
    const coreWorld = {
      name: worldData.name,
      characterIds: worldData.characterIds || [],
      partyIds: worldData.partyIds || [],
      battleLoot: worldData.battleLoot || [],
      battleParticipants: worldData.battleParticipants || [],
      currentTurnIndex: worldData.currentTurnIndex || 0,
      trash: worldData.trash || [],
      battleMaps: worldData.battleMaps || [],
      battleTimeline: worldData.battleTimeline,
    };
    
    const worldFilePath = path.join(worldDir, 'world.json');
    fs.writeFileSync(worldFilePath, JSON.stringify(coreWorld, null, 2));
    
    console.log(`✓ Migrated world: ${worldName}`);
    
    // Delete old file
    fs.unlinkSync(filePath);
  }
}

// Run migrations
console.log('🚀 Starting migration...\n');

console.log('📦 Migrating characters...');
migrateCharacters();

console.log('\n📦 Migrating races...');
migrateRaces();

console.log('\n📦 Migrating worlds...');
migrateWorlds();

console.log('\n✅ Migration complete!');
console.log('⚠️  Backups are still in characters_backup/, worlds_backup/, races_backup/');
console.log('    Test your app before deleting backups!');
```

3. **Run the migration**:
   ```bash
   node migrate-to-dirs.js
   ```

4. **Test thoroughly** before deleting backups

5. **If everything works**, delete backups:
   ```bash
   rm -rf characters_backup/ worlds_backup/ races_backup/
   ```

## Important Notes

- The frontend doesn't need changes - all API routes remain the same
- URL structure is unchanged: `/characters/abc` still works the same way
- The character name field in the JSON no longer affects the filename
- World names from the URL determine the directory name
- Each world is now easily backupable - just copy its folder
- You can safely delete individual items/spells/etc by removing their files

## Rollback

If something goes wrong:
1. Stop the server
2. Delete new structure: `rm -rf characters/ worlds/ races/`
3. Restore backups: `mv characters_backup/ characters/` (etc.)
4. Redeploy old code version
