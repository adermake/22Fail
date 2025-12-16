import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
type JsonObject = Record<string, any>;

@Injectable()
export class DataService {
  private filePath = path.join(__dirname, '../../../data.json');

  private applyJsonPatch(target: unknown, patch: JsonPatch): void {
    const keys = patch.path.split('.');
    let current = target as JsonObject;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }

      current = current[key] as JsonObject;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    current[keys[keys.length - 1]] = patch.value;
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
}

export interface JsonPatch {
  path: string;
  value: any;
}
