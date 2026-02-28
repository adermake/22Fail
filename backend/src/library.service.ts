import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Library {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  items: any[];
  runes: any[];
  spells: any[];
  skills: any[];
  statusEffects: any[];
  macroActions: any[];
  shops: any[];
  lootBundles: any[];
  tags?: string[];
  isPublic?: boolean;
  author?: string;
}

@Injectable()
export class LibraryService {
  private dataDir = path.join(__dirname, '../../../data');
  private librariesDir = path.join(this.dataDir, 'libraries');

  constructor() {
    this.ensureDirectory(this.librariesDir);
    this.migrateOldLibraries();
  }

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private sanitizeFileName(name: string): string {
    return name
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/\.+/g, '_')
      .substring(0, 200);
  }

  // Folder-based library structure methods
  private getLibraryDir(libraryId: string): string {
    const safeId = this.sanitizeFileName(libraryId);
    return path.join(this.librariesDir, safeId);
  }

  /**
   * Resolve library identifier (ID or name) to the actual directory name
   * Checks both by sanitized identifier and by looking up ID in metadata
   */
  private resolveLibraryDir(identifier: string): string | null {
    // Try direct lookup first (identifier might be the name)
    const directPath = this.getLibraryDir(identifier);
    if (fs.existsSync(directPath)) {
      return directPath;
    }

    // Search all library directories by ID
    if (!fs.existsSync(this.librariesDir)) {
      return null;
    }

    const entries = fs.readdirSync(this.librariesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const metadataPath = path.join(this.librariesDir, entry.name, 'library.json');
          if (fs.existsSync(metadataPath)) {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
            if (metadata.id === identifier) {
              return path.join(this.librariesDir, entry.name);
            }
          }
        } catch (err) {
          // Skip invalid directories
        }
      }
    }

    return null;
  }

  private getLibraryMetadataFilePath(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'library.json');
  }

  private getLibraryItemsDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'items');
  }

  private getLibraryRunesDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'runes');
  }

  private getLibrarySpellsDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'spells');
  }

  private getLibrarySkillsDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'skills');
  }

  private getLibraryStatusEffectsDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'status-effects');
  }

  private getLibraryMacroActionsDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'macro-actions');
  }

  private getLibraryShopsDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'shops');
  }

  private getLibraryLootBundlesDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'loot-bundles');
  }

  // Helper methods for reading/writing entity collections
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

  /**
   * Read assets from the new asset browser format (name-based filesystem structure)
   * Uses .meta.json to find all files of a given type
   */
  private readAssetsFromDir(libraryDir: string, assetType: string): any[] {
    try {
      const metaPath = path.join(libraryDir, '.meta.json');
      
      // Check if new format exists
      if (!fs.existsSync(metaPath)) {
        console.log(`[LIBRARY] No .meta.json found in ${libraryDir}`);
        return [];
      }
      
      const metaContent = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      const idToPath = metaContent.idToPath || {};
      const entities: any[] = [];
      
      console.log(`[LIBRARY] Reading ${Object.keys(idToPath).length} tracked files for type ${assetType}`);
      
      // Iterate through all tracked files
      for (const [assetId, relativePath] of Object.entries(idToPath)) {
        try {
          const fullPath = path.join(libraryDir, relativePath as string);
          if (!fs.existsSync(fullPath)) {
            console.log(`[LIBRARY] File not found: ${fullPath}`);
            continue;
          }
          
          const fileContent = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          
          // Check if this file is of the requested type
          if (fileContent.type === assetType && fileContent.data) {
            entities.push(fileContent.data);
          }
        } catch (err) {
          console.error(`[LIBRARY] Error reading file for asset ${assetId}:`, err);
        }
      }
      
      console.log(`[LIBRARY] Found ${entities.length} entities of type ${assetType}`);
      return entities;
    } catch (error) {
      console.error(`[LIBRARY] Error reading assets of type ${assetType}:`, error);
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

  /**
   * Migrate old single-file libraries to new folder-based structure
   */
  private migrateOldLibraries(): void {
    try {
      if (!fs.existsSync(this.librariesDir)) {
        return;
      }

      const files = fs.readdirSync(this.librariesDir);
      
      for (const file of files) {
        // Only process .json files that are not inside folders
        if (file.endsWith('.json')) {
          const oldFilePath = path.join(this.librariesDir, file);
          const stat = fs.statSync(oldFilePath);
          
          if (stat.isFile()) {
            try {
              console.log(`Migrating library: ${file}`);
              const content = fs.readFileSync(oldFilePath, 'utf-8');
              const library = JSON.parse(content);
              
              // Create new folder-based structure
              const libraryDir = this.getLibraryDir(library.id);
              
              // Skip if already migrated
              if (fs.existsSync(libraryDir)) {
                console.log(`Library ${library.id} already migrated, skipping.`);
                continue;
              }
              
              this.ensureDirectory(libraryDir);
              
              // Write metadata
              const metadata = {
                id: library.id,
                name: library.name,
                description: library.description,
                createdAt: library.createdAt,
                updatedAt: library.updatedAt,
                tags: library.tags,
                isPublic: library.isPublic,
                author: library.author
              };
              fs.writeFileSync(
                this.getLibraryMetadataFilePath(library.id),
                JSON.stringify(metadata, null, 2),
                'utf-8'
              );
              
              // Write entities to separate folders
              if (library.items && library.items.length > 0) {
                const itemsDir = this.getLibraryItemsDir(library.id);
                library.items.forEach((item: any) => {
                  this.writeEntity(itemsDir, item.id || item.name, item);
                });
              }
              
              if (library.runes && library.runes.length > 0) {
                const runesDir = this.getLibraryRunesDir(library.id);
                library.runes.forEach((rune: any) => {
                  this.writeEntity(runesDir, rune.id || rune.name, rune);
                });
              }
              
              if (library.spells && library.spells.length > 0) {
                const spellsDir = this.getLibrarySpellsDir(library.id);
                library.spells.forEach((spell: any) => {
                  this.writeEntity(spellsDir, spell.id || spell.name, spell);
                });
              }
              
              if (library.skills && library.skills.length > 0) {
                const skillsDir = this.getLibrarySkillsDir(library.id);
                library.skills.forEach((skill: any) => {
                  this.writeEntity(skillsDir, skill.id || skill.name, skill);
                });
              }
              
              if (library.statusEffects && library.statusEffects.length > 0) {
                const effectsDir = this.getLibraryStatusEffectsDir(library.id);
                library.statusEffects.forEach((effect: any) => {
                  this.writeEntity(effectsDir, effect.id || effect.name, effect);
                });
              }
              
              if (library.macroActions && library.macroActions.length > 0) {
                const macrosDir = this.getLibraryMacroActionsDir(library.id);
                library.macroActions.forEach((macro: any) => {
                  this.writeEntity(macrosDir, macro.id || macro.name, macro);
                });
              }
              
              if (library.shops && library.shops.length > 0) {
                const shopsDir = this.getLibraryShopsDir(library.id);
                library.shops.forEach((shop: any) => {
                  this.writeEntity(shopsDir, shop.id || shop.name, shop);
                });
              }
              
              if (library.lootBundles && library.lootBundles.length > 0) {
                const lootBundlesDir = this.getLibraryLootBundlesDir(library.id);
                library.lootBundles.forEach((bundle: any) => {
                  this.writeEntity(lootBundlesDir, bundle.id || bundle.name, bundle);
                });
              }
              
              // Create backup of old file and delete it
              const backupDir = path.join(this.librariesDir, 'backup-old-format');
              this.ensureDirectory(backupDir);
              const backupPath = path.join(backupDir, file);
              fs.copyFileSync(oldFilePath, backupPath);
              fs.unlinkSync(oldFilePath);
              
              console.log(`Successfully migrated library ${library.id}`);
            } catch (error) {
              console.error(`Error migrating library file ${file}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during library migration:', error);
    }
  }

  /**
   * Get all libraries
   */
  getAllLibraries(): Library[] {
    if (!fs.existsSync(this.librariesDir)) {
      return [];
    }

    const entries = fs.readdirSync(this.librariesDir, { withFileTypes: true });
    const libraries: Library[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const libraryId = entry.name;
          const metadataFilePath = this.getLibraryMetadataFilePath(libraryId);
          
          if (fs.existsSync(metadataFilePath)) {
            const library = this.getLibrary(libraryId);
            libraries.push(library);
          }
        } catch (error) {
          console.error(`Error reading library directory ${entry.name}:`, error);
        }
      }
    }

    return libraries;
  }

  /**
   * Get a single library by ID
   */
  getLibrary(libraryId: string): Library {
    const libraryDir = this.resolveLibraryDir(libraryId);
    
    if (!libraryDir) {
      console.error(`[LIBRARY] Library "${libraryId}" not found`);
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    const metadataFilePath = path.join(libraryDir, 'library.json');
    if (!fs.existsSync(metadataFilePath)) {
      console.error(`[LIBRARY] Metadata file not found for library "${libraryId}"`);
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    const content = fs.readFileSync(metadataFilePath, 'utf-8');
    const metadata = JSON.parse(content);
    
    console.log(`[LIBRARY] Loading library "${metadata.name}" (${metadata.id})`);
    
    // Load all entity collections from old format
    const oldItems = this.readEntityCollection(path.join(libraryDir, 'items'));
    const oldRunes = this.readEntityCollection(path.join(libraryDir, 'runes'));
    const oldSpells = this.readEntityCollection(path.join(libraryDir, 'spells'));
    const oldSkills = this.readEntityCollection(path.join(libraryDir, 'skills'));
    const oldStatusEffects = this.readEntityCollection(path.join(libraryDir, 'status-effects'));
    const oldMacroActions = this.readEntityCollection(path.join(libraryDir, 'macro-actions'));
    const oldShops = this.readEntityCollection(path.join(libraryDir, 'shops'));
    const oldLootBundles = this.readEntityCollection(path.join(libraryDir, 'loot-bundles'));
    
    console.log(`[LIBRARY] Old format - Items: ${oldItems.length}, Runes: ${oldRunes.length}, Spells: ${oldSpells.length}, Skills: ${oldSkills.length}`);
    
    // Load assets from new asset browser format
    const newItems = this.readAssetsFromDir(libraryDir, 'item');
    const newRunes = this.readAssetsFromDir(libraryDir, 'rune');
    const newSpells = this.readAssetsFromDir(libraryDir, 'spell');
    const newSkills = this.readAssetsFromDir(libraryDir, 'skill');
    const newStatusEffects = this.readAssetsFromDir(libraryDir, 'status-effect');
    const newMacroActions = this.readAssetsFromDir(libraryDir, 'macro');
    
    console.log(`[LIBRARY] New format - Items: ${newItems.length}, Runes: ${newRunes.length}, Spells: ${newSpells.length}, Skills: ${newSkills.length}`);
    
    // Merge and deduplicate by ID
    const mergeById = (oldArr: any[], newArr: any[]): any[] => {
      const map = new Map<string, any>();
      for (const item of oldArr) {
        if (item.id) map.set(item.id, item);
      }
      for (const item of newArr) {
        if (item.id) map.set(item.id, item);
      }
      return Array.from(map.values());
    };
    
    const library: Library = {
      ...metadata,
      items: mergeById(oldItems, newItems),
      runes: mergeById(oldRunes, newRunes),
      spells: mergeById(oldSpells, newSpells),
      skills: mergeById(oldSkills, newSkills),
      statusEffects: mergeById(oldStatusEffects, newStatusEffects),
      macroActions: mergeById(oldMacroActions, newMacroActions),
      shops: oldShops,
      lootBundles: oldLootBundles
    };

    console.log(`[LIBRARY] Final counts - Items: ${library.items.length}, Runes: ${library.runes.length}, Spells: ${library.spells.length}, Skills: ${library.skills.length}`);
    
    return library;
  }

  /**
   * Create a new library
   */
  createLibrary(library: Library): Library {
    const libraryDir = this.getLibraryDir(library.id);

    if (fs.existsSync(libraryDir)) {
      throw new Error(`Library with ID "${library.id}" already exists`);
    }

    // Ensure timestamps are set
    const now = Date.now();
    if (!library.createdAt) {
      library.createdAt = now;
    }
    if (!library.updatedAt) {
      library.updatedAt = now;
    }

    // Create library directory
    this.ensureDirectory(libraryDir);

    // Write metadata
    const metadata = {
      id: library.id,
      name: library.name,
      description: library.description,
      createdAt: library.createdAt,
      updatedAt: library.updatedAt,
      tags: library.tags,
      isPublic: library.isPublic,
      author: library.author
    };
    fs.writeFileSync(
      this.getLibraryMetadataFilePath(library.id),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    // Write entities to separate folders
    if (library.items && library.items.length > 0) {
      const itemsDir = this.getLibraryItemsDir(library.id);
      library.items.forEach(item => {
        this.writeEntity(itemsDir, item.id || item.name, item);
      });
    }

    if (library.runes && library.runes.length > 0) {
      const runesDir = this.getLibraryRunesDir(library.id);
      library.runes.forEach(rune => {
        this.writeEntity(runesDir, rune.id || rune.name, rune);
      });
    }

    if (library.spells && library.spells.length > 0) {
      const spellsDir = this.getLibrarySpellsDir(library.id);
      library.spells.forEach(spell => {
        this.writeEntity(spellsDir, spell.id || spell.name, spell);
      });
    }

    if (library.skills && library.skills.length > 0) {
      const skillsDir = this.getLibrarySkillsDir(library.id);
      library.skills.forEach(skill => {
        this.writeEntity(skillsDir, skill.id || skill.name, skill);
      });
    }

    if (library.statusEffects && library.statusEffects.length > 0) {
      const effectsDir = this.getLibraryStatusEffectsDir(library.id);
      library.statusEffects.forEach(effect => {
        this.writeEntity(effectsDir, effect.id || effect.name, effect);
      });
    }

    if (library.macroActions && library.macroActions.length > 0) {
      const macrosDir = this.getLibraryMacroActionsDir(library.id);
      library.macroActions.forEach(macro => {
        this.writeEntity(macrosDir, macro.id || macro.name, macro);
      });
    }

    if (library.shops && library.shops.length > 0) {
      const shopsDir = this.getLibraryShopsDir(library.id);
      library.shops.forEach(shop => {
        this.writeEntity(shopsDir, shop.id || shop.name, shop);
      });
    }

    if (library.lootBundles && library.lootBundles.length > 0) {
      const lootBundlesDir = this.getLibraryLootBundlesDir(library.id);
      library.lootBundles.forEach(bundle => {
        this.writeEntity(lootBundlesDir, bundle.id || bundle.name, bundle);
      });
    }

    return library;
  }

  /**
   * Update an existing library
   */
  updateLibrary(libraryId: string, updates: Partial<Library>): Library {
    const metadataFilePath = this.getLibraryMetadataFilePath(libraryId);

    if (!fs.existsSync(metadataFilePath)) {
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    const content = fs.readFileSync(metadataFilePath, 'utf-8');
    const existingMetadata = JSON.parse(content);

    // Merge metadata updates
    const updatedMetadata = {
      id: libraryId, // Ensure ID doesn't change
      name: updates.name !== undefined ? updates.name : existingMetadata.name,
      description: updates.description !== undefined ? updates.description : existingMetadata.description,
      createdAt: existingMetadata.createdAt,
      updatedAt: Date.now(),
      tags: updates.tags !== undefined ? updates.tags : existingMetadata.tags,
      isPublic: updates.isPublic !== undefined ? updates.isPublic : existingMetadata.isPublic,
      author: updates.author !== undefined ? updates.author : existingMetadata.author
    };

    fs.writeFileSync(
      metadataFilePath,
      JSON.stringify(updatedMetadata, null, 2),
      'utf-8'
    );

    // Update entity collections if provided
    if (updates.items !== undefined) {
      const itemsDir = this.getLibraryItemsDir(libraryId);
      
      // Clear existing items
      if (fs.existsSync(itemsDir)) {
        fs.rmSync(itemsDir, { recursive: true, force: true });
      }
      
      // Write new items
      if (updates.items.length > 0) {
        updates.items.forEach(item => {
          this.writeEntity(itemsDir, item.id || item.name, item);
        });
      }
    }

    if (updates.runes !== undefined) {
      const runesDir = this.getLibraryRunesDir(libraryId);
      
      if (fs.existsSync(runesDir)) {
        fs.rmSync(runesDir, { recursive: true, force: true });
      }
      
      if (updates.runes.length > 0) {
        updates.runes.forEach(rune => {
          this.writeEntity(runesDir, rune.id || rune.name, rune);
        });
      }
    }

    if (updates.spells !== undefined) {
      const spellsDir = this.getLibrarySpellsDir(libraryId);
      
      if (fs.existsSync(spellsDir)) {
        fs.rmSync(spellsDir, { recursive: true, force: true });
      }
      
      if (updates.spells.length > 0) {
        updates.spells.forEach(spell => {
          this.writeEntity(spellsDir, spell.id || spell.name, spell);
        });
      }
    }

    if (updates.skills !== undefined) {
      const skillsDir = this.getLibrarySkillsDir(libraryId);
      
      if (fs.existsSync(skillsDir)) {
        fs.rmSync(skillsDir, { recursive: true, force: true });
      }
      
      if (updates.skills.length > 0) {
        updates.skills.forEach(skill => {
          this.writeEntity(skillsDir, skill.id || skill.name, skill);
        });
      }
    }

    if (updates.statusEffects !== undefined) {
      const effectsDir = this.getLibraryStatusEffectsDir(libraryId);
      
      if (fs.existsSync(effectsDir)) {
        fs.rmSync(effectsDir, { recursive: true, force: true });
      }
      
      if (updates.statusEffects.length > 0) {
        updates.statusEffects.forEach(effect => {
          this.writeEntity(effectsDir, effect.id || effect.name, effect);
        });
      }
    }

    if (updates.macroActions !== undefined) {
      const macrosDir = this.getLibraryMacroActionsDir(libraryId);
      
      if (fs.existsSync(macrosDir)) {
        fs.rmSync(macrosDir, { recursive: true, force: true });
      }
      
      if (updates.macroActions.length > 0) {
        updates.macroActions.forEach(macro => {
          this.writeEntity(macrosDir, macro.id || macro.name, macro);
        });
      }
    }

    if (updates.shops !== undefined) {
      const shopsDir = this.getLibraryShopsDir(libraryId);
      
      if (fs.existsSync(shopsDir)) {
        fs.rmSync(shopsDir, { recursive: true, force: true });
      }
      
      if (updates.shops.length > 0) {
        updates.shops.forEach(shop => {
          this.writeEntity(shopsDir, shop.id || shop.name, shop);
        });
      }
    }

    if (updates.lootBundles !== undefined) {
      const lootBundlesDir = this.getLibraryLootBundlesDir(libraryId);
      
      if (fs.existsSync(lootBundlesDir)) {
        fs.rmSync(lootBundlesDir, { recursive: true, force: true });
      }
      
      if (updates.lootBundles.length > 0) {
        updates.lootBundles.forEach(bundle => {
          this.writeEntity(lootBundlesDir, bundle.id || bundle.name, bundle);
        });
      }
    }

    return this.getLibrary(libraryId);
  }

  /**
   * Delete a library
   */
  deleteLibrary(libraryId: string): void {
    const libraryDir = this.getLibraryDir(libraryId);

    if (!fs.existsSync(libraryDir)) {
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    // Recursively delete the entire library directory
    fs.rmSync(libraryDir, { recursive: true, force: true });
  }

  /**
   * Check if a library exists
   */
  libraryExists(libraryId: string): boolean {
    const metadataFilePath = this.getLibraryMetadataFilePath(libraryId);
    return fs.existsSync(metadataFilePath);
  }

  /**
   * Get libraries by tag
   */
  getLibrariesByTag(tag: string): Library[] {
    const allLibraries = this.getAllLibraries();
    return allLibraries.filter(lib => lib.tags && lib.tags.includes(tag));
  }

  /**
   * Get public libraries
   */
  getPublicLibraries(): Library[] {
    const allLibraries = this.getAllLibraries();
    return allLibraries.filter(lib => lib.isPublic === true);
  }
}
