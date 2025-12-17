import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CharacterApiService } from './character-api.service';
import { CharacterSocketService } from './character-socket.service';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class CharacterStoreService {
  private sheetSubject = new BehaviorSubject<CharacterSheet | null>(null);
  sheet$ = this.sheetSubject.asObservable();

  characterId!: string;

  constructor(private api: CharacterApiService, private socket: CharacterSocketService) {
    this.socket.patches$.subscribe((patch) => {
      const sheet = this.sheetSubject.value;
      if (!sheet) return;
      this.applyJsonPatch(sheet, patch);
      this.sheetSubject.next({ ...sheet });
    });
  }

  async save(): Promise<void> {
    const sheet = this.sheetSubject.value;
    if (!sheet) {
      console.warn('No character sheet loaded, cannot save.');
      return;
    }

    if (!this.characterId) {
      console.error('No characterId set, cannot save.');
      return;
    }

    try {
      await this.api.saveCharacter(this.characterId, sheet);
      console.log('Character saved successfully!');
    } catch (err) {
      console.error('Failed to save character:', err);
    }
  }
  async load(id: string) {
    this.characterId = id;
    let sheet = await this.api.loadCharacter(id);
    if (!sheet) {
      console.log('GOT NOTHING Creating new');
      sheet = createEmptySheet();
      this.sheetSubject.next(sheet);
      this.save();
    } else {
      this.sheetSubject.next(sheet);
    }

    this.socket.connect();
    this.socket.joinCharacter(id);
  }

  applyPatch(patch: JsonPatch) {
    console.log('APPLY PATCH');
    this.socket.sendPatch(this.characterId, patch);
  }

  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.split('.');
    let current = target;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] ??= {};
    }
    current[keys[keys.length - 1]] = patch.value;
  }
}
