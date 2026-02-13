const fs = require('fs');
const path = require('path');

console.log('=== DATA MIGRATION SCRIPT ===');
console.log('Moving data from single JSON files to folder structure\n');

// Sanitize file names by replacing invalid characters
function sanitizeFileName(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/\.+/g, '_')
    .substring(0, 200);
}

// ==================== MIGRATE CHARACTERS ====================
function migrateCharacters() {
  const dataJsonPath = path.join(__dirname, 'data.json');
  const charactersDir = path.join(__dirname, 'characters');

  if (!fs.existsSync(dataJsonPath)) {
    console.log('⚠️  data.json not found, skipping character migration');
    return 0;
  }

  // Ensure characters directory exists
  if (!fs.existsSync(charactersDir)) {
    fs.mkdirSync(charactersDir, { recursive: true });
  }

  const dataJson = fs.readFileSync(dataJsonPath, 'utf-8');
  const characters = JSON.parse(dataJson);

  let count = 0;
  for (const [characterId, characterJson] of Object.entries(characters)) {
    try {
      const character = JSON.parse(characterJson);
      const characterName = character.name || 'unnamed';
      const safeName = sanitizeFileName(characterName);
      const fileName = `${safeName}-${characterId}.json`;
      const filePath = path.join(charactersDir, fileName);

      // Write with nice formatting
      fs.writeFileSync(filePath, JSON.stringify(character, null, 2), 'utf-8');
      console.log(`✓ Migrated character: ${characterName} (${characterId}) -> ${fileName}`);
      count++;
    } catch (err) {
      console.error(`✗ Error migrating character ${characterId}:`, err.message);
    }
  }

  console.log(`\n📦 Migrated ${count} characters\n`);
  return count;
}

// ==================== MIGRATE WORLDS ====================
function migrateWorlds() {
  const worldsJsonPath = path.join(__dirname, 'worlds.json');
  const worldsDir = path.join(__dirname, 'worlds');

  if (!fs.existsSync(worldsJsonPath)) {
    console.log('⚠️  worlds.json not found, skipping world migration');
    return 0;
  }

  // Ensure worlds directory exists
  if (!fs.existsSync(worldsDir)) {
    fs.mkdirSync(worldsDir, { recursive: true });
  }

  const worldsJson = fs.readFileSync(worldsJsonPath, 'utf-8');
  const worlds = JSON.parse(worldsJson);

  let count = 0;
  for (const [worldName, worldJson] of Object.entries(worlds)) {
    try {
      const world = JSON.parse(worldJson);
      const safeName = sanitizeFileName(worldName);
      const fileName = `${safeName}.json`;
      const filePath = path.join(worldsDir, fileName);

      // Write with nice formatting
      fs.writeFileSync(filePath, JSON.stringify(world, null, 2), 'utf-8');
      console.log(`✓ Migrated world: ${worldName} -> ${fileName}`);
      count++;
    } catch (err) {
      console.error(`✗ Error migrating world ${worldName}:`, err.message);
    }
  }

  console.log(`\n🌍 Migrated ${count} worlds\n`);
  return count;
}

// ==================== MIGRATE RACES ====================
function migrateRaces() {
  const racesJsonPath = path.join(__dirname, 'races.json');
  const racesDir = path.join(__dirname, 'races');

  if (!fs.existsSync(racesJsonPath)) {
    console.log('⚠️  races.json not found, skipping race migration');
    return 0;
  }

  // Ensure races directory exists
  if (!fs.existsSync(racesDir)) {
    fs.mkdirSync(racesDir, { recursive: true });
  }

  const racesJson = fs.readFileSync(racesJsonPath, 'utf-8');
  const races = JSON.parse(racesJson);

  let count = 0;
  for (const race of races) {
    try {
      const raceId = race.id;
      const raceName = race.name || 'unnamed';
      const safeName = sanitizeFileName(raceName);
      const fileName = `${safeName}-${raceId}.json`;
      const filePath = path.join(racesDir, fileName);

      // Write with nice formatting
      fs.writeFileSync(filePath, JSON.stringify(race, null, 2), 'utf-8');
      console.log(`✓ Migrated race: ${raceName} (${raceId}) -> ${fileName}`);
      count++;
    } catch (err) {
      console.error(`✗ Error migrating race ${race.id}:`, err.message);
    }
  }

  console.log(`\n🎭 Migrated ${count} races\n`);
  return count;
}

// ==================== BACKUP OLD FILES ====================
function backupOldFiles() {
  console.log('📁 Creating backups of old files...\n');
  
  const filesToBackup = ['data.json', 'worlds.json', 'races.json'];
  const backupDir = path.join(__dirname, 'backup-' + Date.now());
  
  let backedUp = 0;
  for (const file of filesToBackup) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      const backupPath = path.join(backupDir, file);
      fs.copyFileSync(filePath, backupPath);
      console.log(`✓ Backed up: ${file} -> ${backupDir}/${file}`);
      backedUp++;
    }
  }
  
  console.log(`\n💾 Backed up ${backedUp} files to ${backupDir}\n`);
  return backupDir;
}

// ==================== MAIN MIGRATION ====================
function main() {
  try {
    // Create backups first
    const backupDir = backupOldFiles();
    
    // Run migrations
    const characterCount = migrateCharacters();
    const worldCount = migrateWorlds();
    const raceCount = migrateRaces();
    
    console.log('=== MIGRATION COMPLETE ===');
    console.log(`✓ ${characterCount} characters migrated`);
    console.log(`✓ ${worldCount} worlds migrated`);
    console.log(`✓ ${raceCount} races migrated`);
    console.log(`\n💡 Old files backed up to: ${backupDir}`);
    console.log(`💡 You can delete the old data.json, worlds.json, and races.json files if everything works correctly.`);
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

main();
