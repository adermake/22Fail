import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LibraryApiService } from './library-api.service';
import { AssetBrowserApiService } from './asset-browser-api.service';
import { Library, createEmptyLibrary } from '../model/library.model';
import { ItemBlock } from '../model/item-block.model';
import { RuneBlock } from '../model/rune-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { SkillBlock } from '../model/skill-block.model';
import { StatusEffect } from '../model/status-effect.model';
import { MacroAction } from '../model/macro-action.model';

/**
 * Library Store Service
 * Manages state for a single library and provides CRUD operations
 */
@Injectable({ providedIn: 'root' })
export class LibraryStoreService {
  private api = inject(LibraryApiService);
  private assetBrowserApi = inject(AssetBrowserApiService);

  // Current library being edited
  private librarySubject = new BehaviorSubject<Library | null>(null);
  library$ = this.librarySubject.asObservable();

  // All available libraries (for selection/browsing)
  private allLibrariesSubject = new BehaviorSubject<Library[]>([]);
  allLibraries$ = this.allLibrariesSubject.asObservable();

  // Loading state
  isLoading = signal(false);

  get currentLibrary(): Library | null {
    return this.librarySubject.value;
  }

  get allLibraries(): Library[] {
    return this.allLibrariesSubject.value;
  }

  /**
   * Load all libraries from the backend
   */
  async loadAllLibraries(): Promise<void> {
    this.isLoading.set(true);
    try {
      this.api.getAllLibraries().subscribe({
        next: (libraries) => {
          this.allLibrariesSubject.next(libraries);
          console.log('[LIBRARY STORE] Loaded all libraries:', libraries.length);
        },
        error: (err) => {
          console.error('[LIBRARY STORE] Failed to load libraries:', err);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } catch (err) {
      console.error('[LIBRARY STORE] Error loading libraries:', err);
      this.isLoading.set(false);
    }
  }

  /**
   * Load a specific library by ID
   */
  async loadLibrary(libraryId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      this.api.getLibrary(libraryId).subscribe({
        next: (library) => {
          this.librarySubject.next(library);
          console.log('[LIBRARY STORE] Loaded library:', library.name);
        },
        error: (err) => {
          console.error('[LIBRARY STORE] Failed to load library:', err);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } catch (err) {
      console.error('[LIBRARY STORE] Error loading library:', err);
      this.isLoading.set(false);
    }
  }

  /**
   * Create a new library (using asset-browser API for consistency)
   */
  async createLibrary(name: string): Promise<Library> {
    return new Promise((resolve, reject) => {
      this.assetBrowserApi.createLibrary(name).subscribe({
        next: (created) => {
          // Convert AssetLibrary to Library format for compatibility
          const library: Library = {
            ...created,
            items: [],
            runes: [],
            spells: [],
            skills: [],
            statusEffects: [],
            macroActions: [],
            shops: [],
            lootBundles: [],
            dependencies: [],
            tags: created.tags || [],
            isPublic: created.isPublic || false
          };
          
          this.librarySubject.next(library);
          // Add to all libraries list
          const all = this.allLibrariesSubject.value;
          this.allLibrariesSubject.next([...all, library]);
          console.log('[LIBRARY STORE] Created library:', library.name);
          resolve(library);
        },
        error: (err) => {
          console.error('[LIBRARY STORE] Failed to create library:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * Save current library to backend
   */
  async saveLibrary(): Promise<void> {
    const library = this.librarySubject.value;
    if (!library) {
      console.warn('[LIBRARY STORE] No library loaded, cannot save.');
      return;
    }

    return new Promise((resolve, reject) => {
      this.api.updateLibrary(library.id, library).subscribe({
        next: (updated) => {
          this.librarySubject.next(updated);
          // Update in all libraries list
          const all = this.allLibrariesSubject.value;
          const index = all.findIndex(lib => lib.id === updated.id);
          if (index >= 0) {
            all[index] = updated;
            this.allLibrariesSubject.next([...all]);
          }
          console.log('[LIBRARY STORE] Library saved successfully');
          resolve();
        },
        error: (err) => {
          console.error('[LIBRARY STORE] Failed to save library:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * Delete a library
   */
  async deleteLibrary(libraryId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.deleteLibrary(libraryId).subscribe({
        next: () => {
          // Remove from all libraries
          const all = this.allLibrariesSubject.value;
          this.allLibrariesSubject.next(all.filter(lib => lib.id !== libraryId));
          
          // Clear current library if it was deleted
          if (this.currentLibrary?.id === libraryId) {
            this.librarySubject.next(null);
          }
          
          console.log('[LIBRARY STORE] Library deleted');
          resolve();
        },
        error: (err) => {
          console.error('[LIBRARY STORE] Failed to delete library:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * Add an item to current library
   */
  addItem(item: ItemBlock): void {
    const library = this.librarySubject.value;
    if (!library) return;

    item.libraryOrigin = library.id;
    item.libraryOriginName = library.name;
    library.items.push(item);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  /**
   * Update an item in current library
   */
  updateItem(itemId: string, updates: Partial<ItemBlock>): void {
    const library = this.librarySubject.value;
    if (!library) return;

    const index = library.items.findIndex(item => item.id === itemId);
    if (index >= 0) {
      library.items[index] = { ...library.items[index], ...updates };
      library.updatedAt = Date.now();
      this.librarySubject.next({ ...library });
    }
  }

  /**
   * Remove an item from current library
   */
  removeItem(itemId: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.items = library.items.filter(item => item.id !== itemId);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  // Similar methods for runes, spells, skills, status effects, and macro actions
  
  addRune(rune: RuneBlock): void {
    const library = this.librarySubject.value;
    if (!library) return;
    
    rune.libraryOrigin = library.id;
    rune.libraryOriginName = library.name;
    library.runes.push(rune);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  removeRune(runeName: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.runes = library.runes.filter(rune => rune.name !== runeName);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  addSpell(spell: SpellBlock): void {
    const library = this.librarySubject.value;
    if (!library) return;

    spell.libraryOrigin = library.id;
    spell.libraryOriginName = library.name;
    library.spells.push(spell);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  removeSpell(spellName: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.spells = library.spells.filter(spell => spell.name !== spellName);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  addSkill(skill: SkillBlock): void {
    const library = this.librarySubject.value;
    if (!library) return;

    skill.libraryOrigin = library.id;
    skill.libraryOriginName = library.name;
    library.skills.push(skill);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  removeSkill(skillName: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.skills = library.skills.filter(skill => skill.name !== skillName);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  addStatusEffect(statusEffect: StatusEffect): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.statusEffects.push(statusEffect);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  removeStatusEffect(statusEffectId: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.statusEffects = library.statusEffects.filter(se => se.id !== statusEffectId);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  addMacroAction(macroAction: MacroAction): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.macroActions.push(macroAction);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  removeMacroAction(macroActionId: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.macroActions = library.macroActions.filter(ma => ma.id !== macroActionId);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  addShop(shop: any): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.shops.push(shop);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  removeShop(shopId: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.shops = library.shops.filter(s => s.id !== shopId);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  addLootBundle(bundle: any): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.lootBundles.push(bundle);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  removeLootBundle(bundleId: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    library.lootBundles = library.lootBundles.filter(b => b.id !== bundleId);
    library.updatedAt = Date.now();
    this.librarySubject.next({ ...library });
  }

  updateShop(shopId: string, field: string, value: any): void {
    const library = this.librarySubject.value;
    if (!library) return;

    const shop = library.shops.find(s => s.id === shopId);
    if (shop) {
      (shop as any)[field] = value;
      library.updatedAt = Date.now();
      this.librarySubject.next({ ...library });
    }
  }

  addDealToShop(shopId: string, deal: any): void {
    const library = this.librarySubject.value;
    if (!library) return;

    const shop = library.shops.find(s => s.id === shopId);
    if (shop) {
      if (!shop.deals) shop.deals = [];
      shop.deals.push(deal);
      library.updatedAt = Date.now();
      this.librarySubject.next({ ...library });
    }
  }

  removeDealFromShop(shopId: string, dealId: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    const shop = library.shops.find(s => s.id === shopId);
    if (shop && shop.deals) {
      shop.deals = shop.deals.filter(d => d.id !== dealId);
      library.updatedAt = Date.now();
      this.librarySubject.next({ ...library });
    }
  }

  updateLootBundle(bundleId: string, field: string, value: any): void {
    const library = this.librarySubject.value;
    if (!library) return;

    const bundle = library.lootBundles.find(b => b.id === bundleId);
    if (bundle) {
      (bundle as any)[field] = value;
      library.updatedAt = Date.now();
      this.librarySubject.next({ ...library });
    }
  }

  addLootItemToBundle(bundleId: string, item: any): void {
    const library = this.librarySubject.value;
    if (!library) return;

    const bundle = library.lootBundles.find(b => b.id === bundleId);
    if (bundle) {
      if (!bundle.items) bundle.items = [];
      bundle.items.push(item);
      library.updatedAt = Date.now();
      this.librarySubject.next({ ...library });
    }
  }

  removeLootItemFromBundle(bundleId: string, itemId: string): void {
    const library = this.librarySubject.value;
    if (!library) return;

    const bundle = library.lootBundles.find(b => b.id === bundleId);
    if (bundle && bundle.items) {
      bundle.items = bundle.items.filter(i => i.id !== itemId);
      library.updatedAt = Date.now();
      this.librarySubject.next({ ...library });
    }
  }

  /**
   * Clear current library
   */
  clearLibrary(): void {
    this.librarySubject.next(null);
  }
}
