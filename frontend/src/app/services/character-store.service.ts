import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CharacterApiService } from './character-api.service';
import { CharacterSocketService } from './character-socket.service';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { JsonPatch } from '../model/json-patch.model';

/** Whether a path segment addresses an array position ('-' appends, a number indexes). */
function isArrayKey(key: string | undefined): boolean {
  return key === '-' || (key !== undefined && !isNaN(parseInt(key, 10)));
}

@Injectable({ providedIn: 'root' })
export class CharacterStoreService {
  private sheetSubject = new BehaviorSubject<CharacterSheet | null>(null);
  sheet$ = this.sheetSubject.asObservable();

  characterId!: string;

  get sheetValue(): CharacterSheet | null {
    return this.sheetSubject.value;
  }

  constructor(private api: CharacterApiService, private socket: CharacterSocketService) {
    this.socket.patches$.subscribe((data) => {
      const sheet = this.sheetSubject.value;
      if (!sheet) return;
      // Only apply the patch if it's for our character
      if (data.characterId === this.characterId) {
        this.applyJsonPatch(sheet, data.patch);
        this.sheetSubject.next({ ...sheet });
      }
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
    } catch (err) {
      console.error('Failed to save character:', err);
    }
  }
  async load(id: string) {
    this.characterId = id;
    let sheet = await this.api.loadCharacter(id);

    if (!sheet) {
      sheet = createEmptySheet();
      sheet.id = id; // Set the ID on new sheets
      this.sheetSubject.next(sheet);
      this.save();
    } else {
      sheet.id = id; // Ensure loaded sheets have ID property set
      this.sheetSubject.next(sheet);
    }

    this.socket.connect();
    this.socket.joinCharacter(id);
  }

  applyPatch(patch: JsonPatch) {
    // Apply optimistically
    this.applyPatchLocally(patch);
    this.socket.sendPatch(this.characterId, patch);
  }

  /**
   * Applies a patch to the local sheet WITHOUT sending it. For callers that already sent the
   * patch themselves (see `GrantService`) and only need the view to catch up.
   */
  applyPatchLocally(patch: JsonPatch) {
    const sheet = this.sheetSubject.value;
    if (!sheet) return;
    this.applyJsonPatch(sheet, patch);
    this.sheetSubject.next({ ...sheet });
  }

  private applyJsonPatch(target: any, patch: JsonPatch) {
    // Normalize path: remove leading slash, replace slashes with dots
    let normalizedPath = patch.path.trim();
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }
    normalizedPath = normalizedPath.replace(/\//g, '.');
    
    const keys = normalizedPath.split('.');
    let current = target;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);

      // Check if it's an array index
      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        // A missing container has to be created as the shape the NEXT segment needs: '-' or a
        // number means an array. Creating {} there turned '/pendingGrants/-' on a sheet that has
        // no pendingGrants yet into a literal '-' property, and the value was silently lost.
        current[key] ??= isArrayKey(keys[i + 1]) ? [] : {};
        current = current[key];
      }
    }

    const finalKey = keys[keys.length - 1];
    
    // Handle array append operation: '-' means append to array
    if (finalKey === '-' && Array.isArray(current)) {
      current.push(patch.value);
      return;
    }
    
    const finalIndex = parseInt(finalKey, 10);

    // Handle final key - could also be an array index
    if (!isNaN(finalIndex) && Array.isArray(current)) {
      current[finalIndex] = patch.value;
    } else {
      current[finalKey] = patch.value;
    }
  }
}
