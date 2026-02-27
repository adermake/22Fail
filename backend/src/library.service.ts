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

  private getLibraryFilePath(libraryId: string): string {
    const safeId = this.sanitizeFileName(libraryId);
    return path.join(this.librariesDir, `${safeId}.json`);
  }

  /**
   * Get all libraries
   */
  getAllLibraries(): Library[] {
    if (!fs.existsSync(this.librariesDir)) {
      return [];
    }

    const files = fs.readdirSync(this.librariesDir);
    const libraries: Library[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(this.librariesDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const library = JSON.parse(content);
          libraries.push(library);
        } catch (error) {
          console.error(`Error reading library file ${file}:`, error);
        }
      }
    }

    return libraries;
  }

  /**
   * Get a single library by ID
   */
  getLibrary(libraryId: string): Library {
    const filePath = this.getLibraryFilePath(libraryId);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Create a new library
   */
  createLibrary(library: Library): Library {
    const filePath = this.getLibraryFilePath(library.id);

    if (fs.existsSync(filePath)) {
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

    fs.writeFileSync(filePath, JSON.stringify(library, null, 2), 'utf-8');
    return library;
  }

  /**
   * Update an existing library
   */
  updateLibrary(libraryId: string, updates: Partial<Library>): Library {
    const filePath = this.getLibraryFilePath(libraryId);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const existingLibrary = JSON.parse(content);

    // Merge updates
    const updatedLibrary = {
      ...existingLibrary,
      ...updates,
      id: libraryId, // Ensure ID doesn't change
      updatedAt: Date.now()
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedLibrary, null, 2), 'utf-8');
    return updatedLibrary;
  }

  /**
   * Delete a library
   */
  deleteLibrary(libraryId: string): void {
    const filePath = this.getLibraryFilePath(libraryId);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Library with ID "${libraryId}" not found`);
    }

    fs.unlinkSync(filePath);
  }

  /**
   * Check if a library exists
   */
  libraryExists(libraryId: string): boolean {
    const filePath = this.getLibraryFilePath(libraryId);
    return fs.existsSync(filePath);
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
