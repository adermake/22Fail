import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
type JsonObject = Record<string, any>;

@Injectable()
export class DataService {
  private filePath = path.join(__dirname, '../../../data.json');

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

  getAllCharacters(): Record<string, any> {
    const data = this.readData();
    const result: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      if (key === 'worlds') continue;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        result[key] = JSON.parse(data[key]);
      } catch {
        // ignore invalid entries
      }
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  getWorld(name: string): any | null {
    const data = this.readData();
    const worldsRaw = data['worlds'];
    if (!worldsRaw) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const worlds = JSON.parse(worldsRaw);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return worlds[name] ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  }

  saveWorld(name: string, worldObj: any): void {
    const data = this.readData();
    let worlds: Record<string, any> = {};
    if (data['worlds']) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        worlds = JSON.parse(data['worlds']);
      } catch {
        worlds = {};
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    worlds[name] = worldObj;
    data['worlds'] = JSON.stringify(worlds, null, 2);
    this.writeData(data);
  }

  listWorlds(): string[] {
    const data = this.readData();
    if (!data['worlds']) return [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const worlds = JSON.parse(data['worlds']);
      return Object.keys(worlds);
    } catch {
      return [];
    }
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
}

export interface JsonPatch {
  path: string;
  value: any;
}
