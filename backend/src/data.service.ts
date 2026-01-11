import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
type JsonObject = Record<string, any>;

@Injectable()
export class DataService {
  private filePath = path.join(__dirname, '../../../data.json');
  private worldsFilePath = path.join(__dirname, '../../../worlds.json');

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

  private readData(): Record<string, string> {
    try {
      const json = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(json) as Record<string, string>;
    } catch (error) {
      console.error('Error reading JSON file:', error);
      return {};
    }
  }

  private writeData(data: Record<string, string>): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  getCharacter(id: string): string | null {
    const data = this.readData();
    if (!data[id]) {
      // Character does not exist yet
      console.log('GET CHARACTER CALLED');
      return null;
    }
    return data[id];
  }

  saveCharacter(id: string, sheetJson: string): void {
    const data = this.readData();
    data[id] = sheetJson;
    console.log('SAVE CHARACTER CALLED');
    this.writeData(data);
  }

  applyPatchToCharacter(id: string, patch: JsonPatch): string | null {
    const data = this.readData();
    console.log('APPLY PATCH CHARACTER CALLED');
    if (!data[id]) {
      return null; // character does not exist
    }

    let sheet: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sheet = JSON.parse(data[id]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new Error(`Invalid JSON for character ${id}`);
    }

    this.applyJsonPatch(sheet, patch);

    const updatedJson = JSON.stringify(sheet, null, 2);
    data[id] = updatedJson;
    this.writeData(data);

    return updatedJson;
  }

  // World data methods
  private readWorlds(): Record<string, string> {
    try {
      const json = fs.readFileSync(this.worldsFilePath, 'utf-8');
      return JSON.parse(json) as Record<string, string>;
    } catch (error) {
      console.error('Error reading worlds file:', error);
      return {};
    }
  }

  private writeWorlds(data: Record<string, string>): void {
    fs.writeFileSync(this.worldsFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  getWorld(name: string): string | null {
    const data = this.readWorlds();
    if (!data[name]) {
      console.log('GET WORLD CALLED - not found');
      return null;
    }
    return data[name];
  }

  saveWorld(name: string, worldJson: string): void {
    const data = this.readWorlds();
    data[name] = worldJson;
    console.log('SAVE WORLD CALLED');
    this.writeWorlds(data);
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
    const data = this.readWorlds();
    console.log('APPLY PATCH WORLD CALLED for:', name);
    console.log('Available worlds:', Object.keys(data));

    // Truncate all image data in logs to keep console readable
    const logPatch = this.truncateImageData(patch);
    console.log('Patch:', logPatch);

    let world: any;

    if (!data[name]) {
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
      data[name] = JSON.stringify(world, null, 2);
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        world = JSON.parse(data[name]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        throw new Error(`Invalid JSON for world ${name}`);
      }
    }

    this.applyJsonPatch(world, patch);

    const updatedJson = JSON.stringify(world, null, 2);
    data[name] = updatedJson;
    this.writeWorlds(data);

    return updatedJson;
  }
}

export interface JsonPatch {
  path: string;
  value: any;
}
