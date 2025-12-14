import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataService {
  private filePath = path.join(__dirname, '../data.json');

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
      return null;
    }
    return data[id];
  }

  saveCharacter(id: string, sheetJson: string): void {
    const data = this.readData();
    data[id] = sheetJson;
    this.writeData(data);
  }
}
