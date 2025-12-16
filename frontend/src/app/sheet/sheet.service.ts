import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface JsonPatch {
  path: string;
  value: any;
}

export interface CharacterSheet {
  // Character
  name: string;
  race: string;
  age: number;
  alignment: string;
  size: string;
  extrainfo: string;

  // Klassen
  primary_class: string;
  secondary_class: string;
  level: number;
  learned_classes: string;

  strength: StatBlock;
  dexterity: StatBlock;
  speed: StatBlock;
  intelligence: StatBlock;
  chill: StatBlock;
  constitution: StatBlock;

  statuses: StatusBlock[];
}

export class StatusBlock {
  statusName!: string;
  statusColor!: string;
  statusBonus!: number;
  statusBase!: number;
  statusCurrent!: number;
  formulaType!: FormulaType;
}

export class StatBlock {
  name!: string;
  bonus!: number;
  base!: number;
  gain!: number;
  current!: number;

  constructor(name: string, base: number, gain: number = 0, bonus: number = 0) {
    this.base = base;
    this.gain = gain;
    this.bonus = bonus;
    this.name = name;
    this.current = 1;
  }
}
export enum FormulaType {
  LIFE = 'LIFE',
  ENERGY = 'ENERGY',
  MANA = 'MANA',
}
@Injectable({
  providedIn: 'root',
})
export class CharacterSheetService {
  characterSheetId!: string;
  currentSheet!: CharacterSheet;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  starterSheet: CharacterSheet = {
    // Character
    name: 'Arion Stormblade',
    race: 'Elf',
    age: 125,
    alignment: 'Neutral Good',
    size: 'Medium',
    extrainfo: 'A skilled archer and scholar, known for calm demeanor and precise aim.',

    // Classes
    primary_class: 'Ranger',
    secondary_class: 'Mage',
    level: 10,
    learned_classes: 'Ranger, Mage',

    // Stats
    strength: new StatBlock('Stärke', 12, 3, 2),
    dexterity: new StatBlock('Geschicklichkeit', 18, 4, 1),
    speed: new StatBlock('Geschwindigkeit', 15, 3, 2),
    intelligence: new StatBlock('Intelligenz', 16, 5, 2),
    chill: new StatBlock('Chill', 10, 2, 1),
    constitution: new StatBlock('Konstitution', 14, 2, 3),

    // Status Blocks
    statuses: [
      {
        statusName: 'Life',
        statusColor: 'red',
        statusBase: 80,
        statusBonus: 20,
        statusCurrent: 75,
        formulaType: FormulaType.LIFE,
      },
      {
        statusName: 'Mana',
        statusColor: 'blue',
        statusBase: 40,
        statusBonus: 10,
        statusCurrent: 30,
        formulaType: FormulaType.MANA,
      },
      {
        statusName: 'Energy',
        statusColor: 'green',
        statusBase: 50,
        statusBonus: 10,
        statusCurrent: 40,
        formulaType: FormulaType.ENERGY,
      },
    ],
  };

  async loadCharacter(id: string): Promise<any> {
    console.log('SEND ID ' + id);
    const observable = this.http.get(`/api/characters/${id}`);
    return await firstValueFrom(observable);
  }

  async saveCharacter(id: string, sheet: any): Promise<any> {
    const observable = this.http.post(`/api/characters/${id}`, sheet);
    return await firstValueFrom(observable);
  }

  // Convert character sheet to JSON string
  serializeCharacterSheet(sheet: CharacterSheet): string {
    return JSON.stringify(sheet, null, 2); // pretty print
  }

  // Parse JSON string back to character sheet object
  deserializeCharacterSheet(json: string): CharacterSheet {
    var sheet = JSON.parse(json);
    return sheet;
  }

  private socket?: Socket;

  // 🔌 Connect to backend socket
connectSocket() {
  if (this.socket) return;

  this.socket = io(window.location.origin, {
    path: '/socket.io',
    transports: ['websocket'],
  });

  this.socket.on('connect', () => {
    console.log('Socket connected:', this.socket?.id);
  });

  this.socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  this.socket.on('characterPatched', (patch: JsonPatch) => {
    this.applyJsonPatch(this.currentSheet, patch);
  });
}


  // 🏠 Join a character room
  joinCharacter(characterId: string) {
    if (!this.socket) {
      console.warn('Socket not connected yet');
      return;
    }

    this.socket.emit('joinCharacter', characterId);
  }

  // ✏️ Called by ngModelChange
  applyPatch(patch: JsonPatch) {
    if (!this.socket) return;

    // emit patch to backend
    this.socket.emit('patchCharacter', {
      characterId: this.characterSheetId,
      patch,
    });
  }

  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.split('.');
    let current = target;
    console.log("Applying patch!");
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] == null) current[key] = {};
      current = current[key];
    }

    current[keys[keys.length - 1]] = patch.value;
  }
}
