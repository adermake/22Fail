import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
type JsonObject = Record<string, any>;

@Injectable()
export class DataService {
  private charactersDir = path.join(__dirname, '../../../characters');
  private worldsDir = path.join(__dirname, '../../../worlds');
  private racesDir = path.join(__dirname, '../../../races');
  private globalTexturesFilePath = path.join(__dirname, '../../../textures.json');

  constructor() {
    // Ensure directories exist
    this.ensureDirectory(this.charactersDir);
    this.ensureDirectory(this.worldsDir);
    this.ensureDirectory(this.racesDir);
  }

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private sanitizeFileName(name: string): string {
    // Remove or replace characters that are invalid in file names
    return name
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Replace invalid chars with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/\.+/g, '_') // Replace dots with underscore (except the extension)
      .substring(0, 200); // Limit length
  }

  private getCharacterFileName(characterId: string): string {
    // Filename is just the character ID
    const safeId = this.sanitizeFileName(characterId);
    return `${safeId}.json`;
  }

  private getCharacterFilePath(characterId: string): string {
    const fileName = this.getCharacterFileName(characterId);
    return path.join(this.charactersDir, fileName);
  }

  private getWorldDir(worldName: string): string {
    const safeName = this.sanitizeFileName(worldName);
    return path.join(this.worldsDir, safeName);
  }

  private getWorldFilePath(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'world.json');
  }

  private getWorldItemsDir(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'items');
  }

  private getWorldSpellsDir(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'spells');
  }

  private getWorldRunesDir(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'runes');
  }

  private getWorldSkillsDir(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'skills');
  }

  private getWorldLootBundlesDir(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'loot-bundles');
  }

  private getWorldLobbyFilePath(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'lobby.json');
  }

  private getWorldMapsDir(worldName: string): string {
    return path.join(this.getWorldDir(worldName), 'maps');
  }

  private getWorldMapDir(worldName: string, mapId: string): string {
    const safeMapId = this.sanitizeFileName(mapId);
    return path.join(this.getWorldMapsDir(worldName), safeMapId);
  }

  private getWorldMapFilePath(worldName: string, mapId: string): string {
    return path.join(this.getWorldMapDir(worldName, mapId), 'map.json');
  }

  private getRaceFileName(raceId: string): string {
    const safeId = this.sanitizeFileName(raceId);
    return `${safeId}.json`;
  }

  private getRaceFilePath(raceId: string): string {
    const fileName = this.getRaceFileName(raceId);
    return path.join(this.racesDir, fileName);
  }

  // Helper methods for reading/writing entity collections in world directories
  private readEntityCollection(dirPath: string): any[] {
    try {
      if (!fs.existsSync(dirPath)) {
        return [];
      }
      const files = fs.readdirSync(dirPath);
      const entities: any[] = [];
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(dirPath, file);
        try {
          const json = fs.readFileSync(filePath, 'utf-8');
          entities.push(JSON.parse(json));
        } catch (err) {
          console.error(`Error reading entity file ${file}:`, err);
        }
      }
      return entities;
    } catch (error) {
      console.error(`Error reading entity collection from ${dirPath}:`, error);
      return [];
    }
  }

  private writeEntity(dirPath: string, entityId: string, entity: any): void {
    this.ensureDirectory(dirPath);
    const safeId = this.sanitizeFileName(entityId);
    const filePath = path.join(dirPath, `${safeId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(entity, null, 2), 'utf-8');
  }

  private deleteEntity(dirPath: string, entityId: string): boolean {
    const safeId = this.sanitizeFileName(entityId);
    const filePath = path.join(dirPath, `${safeId}.json`);
    if (!fs.existsSync(filePath)) {
      return false;
    }
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting entity ${entityId} from ${dirPath}:`, error);
      return false;
    }
  }

  private readEntity(dirPath: string, entityId: string): any | null {
    const safeId = this.sanitizeFileName(entityId);
    const filePath = path.join(dirPath, `${safeId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const json = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(json);
    } catch (error) {
      console.error(`Error reading entity ${entityId} from ${dirPath}:`, error);
      return null;
    }
  }

  // Ensure all world subdirectories exist
  private ensureWorldDirectories(worldName: string): void {
    const worldDir = this.getWorldDir(worldName);
    this.ensureDirectory(worldDir);
    this.ensureDirectory(this.getWorldItemsDir(worldName));
    this.ensureDirectory(this.getWorldSpellsDir(worldName));
    this.ensureDirectory(this.getWorldRunesDir(worldName));
    this.ensureDirectory(this.getWorldSkillsDir(worldName));
    this.ensureDirectory(this.getWorldLootBundlesDir(worldName));
    this.ensureDirectory(this.getWorldMapsDir(worldName));
  }

  private createEmptyWorld(name: string): any {
    return {
      name,
      characterIds: [],
      partyIds: [],
      battleLoot: [],
      battleParticipants: [],
      currentTurnIndex: 0,
      trash: [],
      battleMaps: [], // Legacy, keeping for compatibility
    };
  }

  private applyJsonPatch(target: unknown, patch: JsonPatch): void {
    const keys = patch.path.split('.');

    // Special case: if path has only one key and value is an array, replace entire array
    if (keys.length === 1 && Array.isArray(patch.value)) {
      (target as JsonObject)[keys[0]] = patch.value;
      return;
    }

    let current = target as JsonObject;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);

      if (!isNaN(index) && Array.isArray(current)) {
        // Ensure array has enough elements
        while (current.length <= index) {
          current.push({});
        }
        current = current[index] as JsonObject;
      } else {
        if (typeof current[key] !== 'object' || current[key] === null) {
          current[key] = {};
        }
        current = current[key] as JsonObject;
      }
    }

    const finalKey = keys[keys.length - 1];
    const finalIndex = parseInt(finalKey, 10);

    if (!isNaN(finalIndex) && Array.isArray(current)) {
      // Ensure array has enough elements
      while (current.length <= finalIndex) {
        current.push({});
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      current[finalIndex] = patch.value;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      current[finalKey] = patch.value;
    }
  }

  // ==================== CHARACTER METHODS ====================

  getCharacter(id: string): string | null {
    const filePath = this.getCharacterFilePath(id);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const json = fs.readFileSync(filePath, 'utf-8');
      return json;
    } catch (error) {
      console.error(`Error reading character file for ${id}:`, error);
      return null;
    }
  }

  getAllCharacterIds(): string[] {
    try {
      const files = fs.readdirSync(this.charactersDir);
      const characterIds: string[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        // Extract character ID from filename (just remove .json)
        const id = file.replace('.json', '');
        characterIds.push(id);
      }

      return characterIds;
    } catch (error) {
      console.error('Error reading characters directory:', error);
      return [];
    }
  }

  saveCharacter(id: string, sheetJson: string): void {
    try {
      const filePath = this.getCharacterFilePath(id);
      fs.writeFileSync(filePath, sheetJson, 'utf-8');
      console.log('SAVE CHARACTER CALLED for:', id);
    } catch (error) {
      console.error(`Error saving character ${id}:`, error);
      throw error;
    }
  }

  applyPatchToCharacter(id: string, patch: JsonPatch): string | null {
    const logPatch = this.truncateImageData(patch);
    console.log('APPLY PATCH CHARACTER CALLED for:', id, 'Patch:', logPatch);
    
    const filePath = this.getCharacterFilePath(id);
    if (!fs.existsSync(filePath)) {
      return null; // character does not exist
    }

    let sheet: any;
    try {
      const json = fs.readFileSync(filePath, 'utf-8');
      sheet = JSON.parse(json);
    } catch (e) {
      throw new Error(`Invalid JSON for character ${id}`);
    }

    this.applyJsonPatch(sheet, patch);

    const updatedJson = JSON.stringify(sheet, null, 2);
    fs.writeFileSync(filePath, updatedJson, 'utf-8');

    return updatedJson;
  }

  // ==================== WORLD METHODS ====================

  getWorld(name: string): string | null {
    const filePath = this.getWorldFilePath(name);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      // Read the core world.json
      const worldJson = fs.readFileSync(filePath, 'utf-8');
      const world = JSON.parse(worldJson);

      // Load entity collections from their respective directories
      world.itemLibrary = this.readEntityCollection(this.getWorldItemsDir(name));
      world.spellLibrary = this.readEntityCollection(this.getWorldSpellsDir(name));
      world.runeLibrary = this.readEntityCollection(this.getWorldRunesDir(name));
      world.skillLibrary = this.readEntityCollection(this.getWorldSkillsDir(name));
      world.lootBundles = this.readEntityCollection(this.getWorldLootBundlesDir(name));

      // Load lobby if exists
      const lobbyPath = this.getWorldLobbyFilePath(name);
      if (fs.existsSync(lobbyPath)) {
        const lobbyJson = fs.readFileSync(lobbyPath, 'utf-8');
        world.lobby = JSON.parse(lobbyJson);
      }

      return JSON.stringify(world, null, 2);
    } catch (error) {
      console.error(`Error reading world ${name}:`, error);
      return null;
    }
  }

  saveWorld(name: string, worldJson: string): void {
    try {
      const world = JSON.parse(worldJson);
      this.ensureWorldDirectories(name);

      // Extract and save entity collections to their respective directories
      const itemLibrary = world.itemLibrary || [];
      const spellLibrary = world.spellLibrary || [];
      const runeLibrary = world.runeLibrary || [];
      const skillLibrary = world.skillLibrary || [];
      const lootBundles = world.lootBundles || [];

      // Clear existing entity files
      const itemsDir = this.getWorldItemsDir(name);
      const spellsDir = this.getWorldSpellsDir(name);
      const runesDir = this.getWorldRunesDir(name);
      const skillsDir = this.getWorldSkillsDir(name);
      const lootBundlesDir = this.getWorldLootBundlesDir(name);

      // Write each entity to its own file
      for (const item of itemLibrary) {
        this.writeEntity(itemsDir, item.id, item);
      }
      for (const spell of spellLibrary) {
        this.writeEntity(spellsDir, spell.id, spell);
      }
      for (const rune of runeLibrary) {
        this.writeEntity(runesDir, rune.id, rune);
      }
      for (const skill of skillLibrary) {
        this.writeEntity(skillsDir, skill.id, skill);
      }
      for (const bundle of lootBundles) {
        this.writeEntity(lootBundlesDir, bundle.id, bundle);
      }

      // Save lobby separately if present
      if (world.lobby) {
        const lobbyPath = this.getWorldLobbyFilePath(name);
        fs.writeFileSync(lobbyPath, JSON.stringify(world.lobby, null, 2), 'utf-8');
      }

      // Save core world data (without the entity collections and lobby)
      const coreWorld = {
        name: world.name,
        characterIds: world.characterIds || [],
        partyIds: world.partyIds || [],
        battleLoot: world.battleLoot || [],
        battleParticipants: world.battleParticipants || [],
        currentTurnIndex: world.currentTurnIndex || 0,
        trash: world.trash || [],
        battleMaps: world.battleMaps || [],
        battleTimeline: world.battleTimeline,
      };

      const worldFilePath = this.getWorldFilePath(name);
      fs.writeFileSync(worldFilePath, JSON.stringify(coreWorld, null, 2), 'utf-8');
      
      console.log('SAVE WORLD CALLED for:', name);
    } catch (error) {
      console.error(`Error saving world ${name}:`, error);
      throw error;
    }
  }

  getAllWorldNames(): string[] {
    try {
      const dirs = fs.readdirSync(this.worldsDir);
      const worldNames: string[] = [];

      for (const dir of dirs) {
        const dirPath = path.join(this.worldsDir, dir);
        if (!fs.statSync(dirPath).isDirectory()) continue;

        const worldFilePath = path.join(dirPath, 'world.json');
        if (!fs.existsSync(worldFilePath)) continue;

        try {
          const json = fs.readFileSync(worldFilePath, 'utf-8');
          const world = JSON.parse(json);
          if (world.name) {
            worldNames.push(world.name);
          }
        } catch (err) {
          console.error(`Error reading world file in ${dir}:`, err);
        }
      }

      return worldNames;
    } catch (error) {
      console.error('Error reading worlds directory:', error);
      return [];
    }
  }

  // Global texture library methods
  private readGlobalTextures(): any[] {
    try {
      if (!fs.existsSync(this.globalTexturesFilePath)) {
        return [];
      }
      const json = fs.readFileSync(this.globalTexturesFilePath, 'utf-8');
      return JSON.parse(json) as any[];
    } catch (error) {
      console.error('Error reading global textures file:', error);
      return [];
    }
  }

  private writeGlobalTextures(textures: any[]): void {
    fs.writeFileSync(this.globalTexturesFilePath, JSON.stringify(textures, null, 2), 'utf-8');
  }

  getGlobalTextures(): any[] {
    const textures = this.readGlobalTextures();
    const texturesDir = path.join(__dirname, '../../../textures');
    
    // Filter out textures where the actual file doesn't exist
    const validTextures = textures.filter(texture => {
      const filePath = path.join(texturesDir, texture.textureId);
      const exists = fs.existsSync(filePath);
      if (!exists) {
        console.log(`[DATA SERVICE] Filtering out missing texture: ${texture.textureId}`);
      }
      return exists;
    });
    
    // If we filtered any out, update the file to remove stale references
    if (validTextures.length !== textures.length) {
      console.log(`[DATA SERVICE] Removed ${textures.length - validTextures.length} stale texture references`);
      this.writeGlobalTextures(validTextures);
    }
    
    return validTextures;
  }

  addGlobalTexture(texture: { id: string; name: string; textureId: string; tileSize: number }): void {
    const textures = this.readGlobalTextures();
    textures.push({ ...texture, createdAt: Date.now() });
    this.writeGlobalTextures(textures);
    console.log('[DATA SERVICE] Added global texture:', texture.id);
  }

  deleteGlobalTexture(id: string): boolean {
    const textures = this.readGlobalTextures();
    const filtered = textures.filter(t => t.id !== id);
    if (filtered.length === textures.length) {
      return false; // Not found
    }
    this.writeGlobalTextures(filtered);
    console.log('[DATA SERVICE] Deleted global texture:', id);
    return true;
  }

  private truncateImageData(obj: any): any {
    if (typeof obj === 'string' && obj.startsWith('data:image') && obj.length > 100) {
      return obj.substring(0, 50) + '...[TRUNCATED ' + obj.length + ' chars]';
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.truncateImageData(item));
    }
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.truncateImageData(obj[key]);
      }
      return result;
    }
    return obj;
  }

  applyPatchToWorld(name: string, patch: JsonPatch): string | null {
    console.log('APPLY PATCH WORLD CALLED for:', name);
    console.log('Available worlds:', this.getAllWorldNames());

    // Truncate all image data in logs to keep console readable
    const logPatch = this.truncateImageData(patch);
    console.log('Patch:', logPatch);

    let worldJson = this.getWorld(name);

    if (!worldJson) {
      console.warn(`World "${name}" does not exist in backend! Creating it now...`);
      // Create a minimal world structure
      const world = this.createEmptyWorld(name);
      this.saveWorld(name, JSON.stringify(world, null, 2));
      worldJson = this.getWorld(name);
    }

    const world = JSON.parse(worldJson!);
    this.applyJsonPatch(world, patch);

    const updatedJson = JSON.stringify(world, null, 2);
    this.saveWorld(name, updatedJson);

    return updatedJson;
  }

  getBattleMap(worldName: string, battleMapId: string): any | null {
    const worldJson = this.getWorld(worldName);
    if (!worldJson) {
        return null;
    }
    const world = JSON.parse(worldJson);
    if (!world.battleMaps) {
        return null;
    }
    const battleMap = world.battleMaps.find((bm: any) => bm.id === battleMapId);
    return battleMap || null;
  }

  addBattleMap(worldName: string, battleMap: any): any {
      let worldJson = this.getWorld(worldName);
      if (!worldJson) {
        // if world does not exist, create it.
        const newWorld = this.createEmptyWorld(worldName);
        this.saveWorld(worldName, JSON.stringify(newWorld, null, 2));
        worldJson = this.getWorld(worldName)
      }
      const world = worldJson ? JSON.parse(worldJson) : this.createEmptyWorld(worldName);

      if (!world.battleMaps) {
          world.battleMaps = [];
      }
      world.battleMaps.push(battleMap);
      
      const updatedWorldJson = JSON.stringify(world, null, 2);
      this.saveWorld(worldName, updatedWorldJson);
      return battleMap;
  }

  applyPatchToBattleMap(worldName: string, battleMapId: string, patch: JsonPatch): string | null {
      const worldJson = this.getWorld(worldName);
      if (!worldJson) {
        console.error(`World ${worldName} not found`);
        return null;
      }

      const world = JSON.parse(worldJson);
      const battleMapIndex = world.battleMaps.findIndex((bm: any) => bm.id === battleMapId);

      if (battleMapIndex === -1) {
        console.error(`Battle map ${battleMapId} not found in world ${worldName}`);
        return null;
      }

      const worldPatch: JsonPatch = {
        path: `battleMaps.${battleMapIndex}.${patch.path}`,
        value: patch.value
      };

      this.applyJsonPatch(world, worldPatch);

      const updatedWorldJson = JSON.stringify(world, null, 2);
      this.saveWorld(worldName, updatedWorldJson);

      return updatedWorldJson;
    }

  // Lobby operations for new multi-map system
  getLobby(worldName: string): any | null {
    const lobbyPath = this.getWorldLobbyFilePath(worldName);
    if (!fs.existsSync(lobbyPath)) {
      return null;
    }

    try {
      const json = fs.readFileSync(lobbyPath, 'utf-8');
      const lobby = JSON.parse(json);

      // Load all maps from maps directory
      const mapsDir = this.getWorldMapsDir(worldName);
      if (fs.existsSync(mapsDir)) {
        lobby.maps = {};
        const mapDirs = fs.readdirSync(mapsDir);
        for (const mapDir of mapDirs) {
          const mapDirPath = path.join(mapsDir, mapDir);
          if (!fs.statSync(mapDirPath).isDirectory()) continue;

          const mapFilePath = path.join(mapDirPath, 'map.json');
          if (fs.existsSync(mapFilePath)) {
            try {
              const mapJson = fs.readFileSync(mapFilePath, 'utf-8');
              const mapData = JSON.parse(mapJson);
              lobby.maps[mapData.id] = mapData;
            } catch (err) {
              console.error(`Error reading map ${mapDir}:`, err);
            }
          }
        }
      }

      return lobby;
    } catch (error) {
      console.error(`Error reading lobby for ${worldName}:`, error);
      return null;
    }
  }

  saveLobby(worldName: string, lobby: any): any {
    try {
      this.ensureWorldDirectories(worldName);

      // Extract maps to save separately
      const maps = lobby.maps || {};
      const lobbyWithoutMaps = { ...lobby };
      delete lobbyWithoutMaps.maps;

      // Save lobby.json (without maps)
      const lobbyPath = this.getWorldLobbyFilePath(worldName);
      fs.writeFileSync(lobbyPath, JSON.stringify(lobbyWithoutMaps, null, 2), 'utf-8');

      // Save each map to its own directory
      for (const mapId in maps) {
        const mapData = maps[mapId];
        this.saveMap(worldName, mapId, mapData);
      }

      console.log('SAVED LOBBY for world:', worldName);
      return lobby;
    } catch (error) {
      console.error(`Error saving lobby for ${worldName}:`, error);
      throw error;
    }
  }

  getMap(worldName: string, mapId: string): any | null {
    const mapFilePath = this.getWorldMapFilePath(worldName, mapId);
    if (!fs.existsSync(mapFilePath)) {
      return null;
    }

    try {
      const json = fs.readFileSync(mapFilePath, 'utf-8');
      return JSON.parse(json);
    } catch (error) {
      console.error(`Error reading map ${mapId} for world ${worldName}:`, error);
      return null;
    }
  }

  saveMap(worldName: string, mapId: string, mapData: any): any {
    try {
      this.ensureWorldDirectories(worldName);
      const mapDir = this.getWorldMapDir(worldName, mapId);
      this.ensureDirectory(mapDir);

      const mapFilePath = this.getWorldMapFilePath(worldName, mapId);
      fs.writeFileSync(mapFilePath, JSON.stringify(mapData, null, 2), 'utf-8');

      console.log('SAVED MAP:', mapId, 'for world:', worldName);
      return mapData;
    } catch (error) {
      console.error(`Error saving map ${mapId} for world ${worldName}:`, error);
      throw error;
    }
  }

  applyPatchToMap(worldName: string, mapId: string, patch: JsonPatch): string | null {
    const mapData = this.getMap(worldName, mapId);
    if (!mapData) {
      console.error(`Map ${mapId} not found for world ${worldName}`);
      // Try legacy battlemap approach as fallback
      return this.applyPatchToBattleMap(worldName, mapId, patch);
    }

    this.applyJsonPatch(mapData, patch);
    this.saveMap(worldName, mapId, mapData);

    // Return the full world JSON for compatibility
    return this.getWorld(worldName);
  }

  // ==================== RACE METHODS ====================

  getAllRaces(): any[] {
    try {
      const files = fs.readdirSync(this.racesDir);
      const races: any[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.racesDir, file);
        try {
          const json = fs.readFileSync(filePath, 'utf-8');
          const race = JSON.parse(json);
          races.push(race);
        } catch (err) {
          console.error(`Error reading race file ${file}:`, err);
        }
      }

      return races;
    } catch (error) {
      console.error('Error reading races directory:', error);
      return [];
    }
  }

  getRace(id: string): any | null {
    const filePath = this.getRaceFilePath(id);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const json = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(json);
    } catch (error) {
      console.error(`Error reading race file for ${id}:`, error);
      return null;
    }
  }

  saveRace(race: any): any {
    try {
      const raceId = race.id;
      const filePath = this.getRaceFilePath(raceId);
      fs.writeFileSync(filePath, JSON.stringify(race, null, 2), 'utf-8');
      console.log('SAVED RACE:', raceId);
      return race;
    } catch (error) {
      console.error(`Error saving race ${race.id}:`, error);
      throw error;
    }
  }

  deleteRace(id: string): boolean {
    const filePath = this.getRaceFilePath(id);
    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      fs.unlinkSync(filePath);
      console.log('DELETED RACE:', id);
      return true;
    } catch (error) {
      console.error(`Error deleting race ${id}:`, error);
      return false;
    }
  }
}

export interface JsonPatch {
  path: string;
  value: any;
}
