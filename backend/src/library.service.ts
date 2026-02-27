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
    const metadataFilePath = this.getLibraryMetadataFilePath(libraryId);

    if (!fs.existsSync(metadataFilePath)) {
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    const content = fs.readFileSync(metadataFilePath, 'utf-8');
    const metadata = JSON.parse(content);
    
    // Load all entity collections
    const library: Library = {
      ...metadata,
      items: this.readEntityCollection(this.getLibraryItemsDir(libraryId)),
      runes: this.readEntityCollection(this.getLibraryRunesDir(libraryId)),
      spells: this.readEntityCollection(this.getLibrarySpellsDir(libraryId)),
      skills: this.readEntityCollection(this.getLibrarySkillsDir(libraryId)),
      statusEffects: this.readEntityCollection(this.getLibraryStatusEffectsDir(libraryId)),
      macroActions: this.readEntityCollection(this.getLibraryMacroActionsDir(libraryId))
    };

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
