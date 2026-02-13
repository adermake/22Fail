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

  private getCharacterFileName(characterId: string, characterName?: string): string {
    // Generate filename with character name for readability
    if (characterName) {
      const safeName = this.sanitizeFileName(characterName);
      return `${safeName}-${characterId}.json`;
    }
    return `${characterId}.json`;
  }

  private getWorldFileName(worldName: string): string {
    const safeName = this.sanitizeFileName(worldName);
    return `${safeName}.json`;
  }

  private getRaceFileName(raceId: string, raceName?: string): string {
    if (raceName) {
      const safeName = this.sanitizeFileName(raceName);
      return `${safeName}-${raceId}.json`;
    }
    return `${raceId}.json`;
  }

  private findCharacterFile(characterId: string): string | null {
    // Find a character file that contains the character ID
    const files = fs.readdirSync(this.charactersDir);
    const matchingFile = files.find(file => {
      return file.endsWith(`-${characterId}.json`) || file === `${characterId}.json`;
    });
    return matchingFile ? path.join(this.charactersDir, matchingFile) : null;
  }

  private findWorldFile(worldName: string): string | null {
    // Find a world file by world name
    const expectedFile = this.getWorldFileName(worldName);
    const fullPath = path.join(this.worldsDir, expectedFile);
    return fs.existsSync(fullPath) ? fullPath : null;
  }

  private findRaceFile(raceId: string): string | null {
    // Find a race file that contains the race ID
    const files = fs.readdirSync(this.racesDir);
    const matchingFile = files.find(file => {
      return file.endsWith(`-${raceId}.json`) || file === `${raceId}.json`;
    });
    return matchingFile ? path.join(this.racesDir, matchingFile) : null;
  }

  private createEmptyWorld(name: string): any {
    return {
      name,
      characterIds: [],
      partyIds: [],
      itemLibrary: [],
      runeLibrary: [],
      spellLibrary: [],
      skillLibrary: [],
      lootBundles: [],
      battleLoot: [],
      battleParticipants: [],
      currentTurnIndex: 0,
      trash: [],
      battleMaps: [],
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
    const filePath = this.findCharacterFile(id);
    if (!filePath) {
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

        // Extract character ID from filename
        // Format: name-id.json or id.json
        const baseName = file.replace('.json', '');
        const parts = baseName.split('-');
        const id = parts[parts.length - 1]; // Last part is always the ID
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
      const sheet = JSON.parse(sheetJson);
      const characterName = sheet.name || 'unnamed';
      
      // Delete old file if exists (in case name changed)
      const oldFile = this.findCharacterFile(id);
      const newFileName = this.getCharacterFileName(id, characterName);
      const newFilePath = path.join(this.charactersDir, newFileName);
      
      if (oldFile && oldFile !== newFilePath) {
        fs.unlinkSync(oldFile);
      }

      fs.writeFileSync(newFilePath, sheetJson, 'utf-8');
      console.log('SAVE CHARACTER CALLED for:', id, 'as', newFileName);
    } catch (error) {
      console.error(`Error saving character ${id}:`, error);
      throw error;
    }
  }

  applyPatchToCharacter(id: string, patch: JsonPatch): string | null {
    const logPatch = this.truncateImageData(patch);
    console.log('APPLY PATCH CHARACTER CALLED for:', id, 'Patch:', logPatch);
    
    const filePath = this.findCharacterFile(id);
    if (!filePath) {
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
    
    // Save with updated name if name was changed
    const characterName = sheet.name || 'unnamed';
    const newFileName = this.getCharacterFileName(id, characterName);
    const newFilePath = path.join(this.charactersDir, newFileName);
    
    if (filePath !== newFilePath) {
      fs.unlinkSync(filePath);
    }
    
    fs.writeFileSync(newFilePath, updatedJson, 'utf-8');

    return updatedJson;
  }

  // ==================== WORLD METHODS ====================

  getWorld(name: string): string | null {
    const filePath = this.findWorldFile(name);
    if (!filePath) {
      return null;
    }

    try {
      const json = fs.readFileSync(filePath, 'utf-8');
      return json;
    } catch (error) {
      console.error(`Error reading world file for ${name}:`, error);
      return null;
    }
  }

  saveWorld(name: string, worldJson: string): void {
    try {
      const fileName = this.getWorldFileName(name);
      const filePath = path.join(this.worldsDir, fileName);
      fs.writeFileSync(filePath, worldJson, 'utf-8');
      console.log('SAVE WORLD CALLED for:', name, 'as', fileName);
    } catch (error) {
      console.error(`Error saving world ${name}:`, error);
      throw error;
    }
  }

  getAllWorldNames(): string[] {
    try {
      const files = fs.readdirSync(this.worldsDir);
      const worldNames: string[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        // Read the file to get the actual world name
        const filePath = path.join(this.worldsDir, file);
        try {
          const json = fs.readFileSync(filePath, 'utf-8');
          const world = JSON.parse(json);
          if (world.name) {
            worldNames.push(world.name);
          }
        } catch (err) {
          console.error(`Error reading world file ${file}:`, err);
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

    let world: any;
    const filePath = this.findWorldFile(name);

    if (!filePath) {
      console.warn(`World "${name}" does not exist in backend! Creating it now...`);
      // Create a minimal world structure
      world = {
        name: name,
        characterIds: [],
        partyIds: [],
        itemLibrary: [],
        runeLibrary: [],
        spellLibrary: [],
        skillLibrary: [],
        battleParticipants: [],
        currentTurnIndex: 0,
        lootBundles: [],
        battleLoot: []
      };
      this.saveWorld(name, JSON.stringify(world, null, 2));
    } else {
      try {
        const json = fs.readFileSync(filePath, 'utf-8');
        world = JSON.parse(json);
      } catch (e) {
        throw new Error(`Invalid JSON for world ${name}`);
      }
    }

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
    const worldJson = this.getWorld(worldName);
    if (!worldJson) {
      return null;
    }
    const world = JSON.parse(worldJson);
    return world.lobby || null;
  }

  saveLobby(worldName: string, lobby: any): any {
    let worldJson = this.getWorld(worldName);
    
    if (!worldJson) {
      // Create world if it doesn't exist
      const newWorld = this.createEmptyWorld(worldName);
      newWorld.lobby = lobby;
      this.saveWorld(worldName, JSON.stringify(newWorld, null, 2));
      return lobby;
    }

    const world = JSON.parse(worldJson);
    world.lobby = lobby;
    
    const updatedWorldJson = JSON.stringify(world, null, 2);
    this.saveWorld(worldName, updatedWorldJson);
    
    return lobby;
  }

  getMap(worldName: string, mapId: string): any | null {
    const lobby = this.getLobby(worldName);
    if (!lobby || !lobby.maps) {
      return null;
    }
    return lobby.maps[mapId] || null;
  }

  saveMap(worldName: string, mapId: string, mapData: any): any {
    const worldJson = this.getWorld(worldName);
    
    if (!worldJson) {
      console.error(`World ${worldName} not found`);
      return null;
    }

    const world = JSON.parse(worldJson);
    
    if (!world.lobby) {
      world.lobby = {
        id: worldName,
        worldName: worldName,
        maps: {},
        activeMapId: mapId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    if (!world.lobby.maps) {
      world.lobby.maps = {};
    }

    world.lobby.maps[mapId] = mapData;
    world.lobby.updatedAt = Date.now();

    const updatedWorldJson = JSON.stringify(world, null, 2);
    this.saveWorld(worldName, updatedWorldJson);

    return mapData;
  }

  applyPatchToMap(worldName: string, mapId: string, patch: JsonPatch): string | null {
    const worldJson = this.getWorld(worldName);
    if (!worldJson) {
      console.error(`World ${worldName} not found`);
      return null;
    }

    const world = JSON.parse(worldJson);
    
    if (!world.lobby || !world.lobby.maps || !world.lobby.maps[mapId]) {
      console.error(`Map ${mapId} not found in lobby for world ${worldName}`);
      // Try legacy battlemap approach as fallback
      return this.applyPatchToBattleMap(worldName, mapId, patch);
    }

    const lobbyPatch: JsonPatch = {
      path: `lobby.maps.${mapId}.${patch.path}`,
      value: patch.value
    };

    this.applyJsonPatch(world, lobbyPatch);
    world.lobby.updatedAt = Date.now();

    const updatedWorldJson = JSON.stringify(world, null, 2);
    this.saveWorld(worldName, updatedWorldJson);

    return updatedWorldJson;
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
    const filePath = this.findRaceFile(id);
    if (!filePath) {
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
      const raceName = race.name || 'unnamed';
      const raceId = race.id;

      // Delete old file if exists (in case name changed)
      const oldFile = this.findRaceFile(raceId);
      const newFileName = this.getRaceFileName(raceId, raceName);
      const newFilePath = path.join(this.racesDir, newFileName);

      if (oldFile && oldFile !== newFilePath) {
        fs.unlinkSync(oldFile);
      }

      fs.writeFileSync(newFilePath, JSON.stringify(race, null, 2), 'utf-8');
      console.log('SAVED RACE:', raceId, 'as', newFileName);

      return race;
    } catch (error) {
      console.error(`Error saving race ${race.id}:`, error);
      throw error;
    }
  }

  deleteRace(id: string): boolean {
    const filePath = this.findRaceFile(id);
    if (!filePath) {
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
