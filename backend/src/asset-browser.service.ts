import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Asset types supported by the browser
 */
export type AssetType = 'item' | 'spell' | 'rune' | 'skill' | 'macro' | 'status-effect' | 'shop' | 'loot-bundle';

/**
 * Folder structure
 */
export interface AssetFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * File/Asset structure
 */
export interface AssetFile {
  id: string;
  name: string;
  type: AssetType;
  folderId: string;
  path: string;
  data: any;
  createdAt: number;
  updatedAt: number;
  icon?: string;
  tags?: string[];
}

/**
 * Folder contents response
 */
export interface FolderContents {
  folder: AssetFolder | null;
  subfolders: AssetFolder[];
  files: AssetFile[];
  breadcrumbs: AssetFolder[];
}

/**
 * Library structure for asset browser
 */
export interface AssetLibrary {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  isPublic?: boolean;
  author?: string;
}

/**
 * Metadata file structure
 */
interface LibraryMeta {
  libraryId: string;
  idToPath: Map<string, string>; // assetId -> relative path
  folders: Map<string, AssetFolder>; // folderId -> folder info
}

@Injectable()
export class AssetBrowserService {
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

  private generateId(libraryName: string, prefix: string): string {
    const sanitized = this.sanitizeFileName(libraryName);
    return `${sanitized}_${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Resolve library identifier (ID or name) to the actual folder name
   * This allows methods to accept either the UUID ID or the library name
   */
  private resolveLibraryName(identifier: string): string {
    // If it's already a valid folder name, return it
    const directPath = path.join(this.librariesDir, this.sanitizeFileName(identifier));
    if (fs.existsSync(directPath)) {
      return this.sanitizeFileName(identifier);
    }

    // Try finding by ID
    const allLibs = this.getAllLibraries();
    const byId = allLibs.find(l => l.id === identifier);
    if (byId) {
      return this.sanitizeFileName(byId.name);
    }

    // If nothing found, return sanitized identifier (will fail later with proper error)
    return this.sanitizeFileName(identifier);
  }

  // Library directory structure (name-based)
  private getLibraryDir(libraryName: string): string {
    return path.join(this.librariesDir, this.sanitizeFileName(libraryName));
  }

  private getLibraryMetadataPath(libraryName: string): string {
    return path.join(this.getLibraryDir(libraryName), 'library.json');
  }

  private getMetaPath(libraryName: string): string {
    return path.join(this.getLibraryDir(libraryName), '.meta.json');
  }

  // ==================== METADATA OPERATIONS ====================

  private loadMeta(libraryName: string): LibraryMeta {
    const metaPath = this.getMetaPath(libraryName);
    let meta: LibraryMeta;

    if (!fs.existsSync(metaPath)) {
      // Initialize with root folder
      meta = {
        libraryId: this.generateId(libraryName, 'lib'),
        idToPath: new Map(),
        folders: new Map([
          ['root', {
            id: 'root',
            name: libraryName,
            parentId: null,
            path: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
          }]
        ])
      };
    } else {
      const content = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      meta = {
        libraryId: content.libraryId,
        idToPath: new Map(Object.entries(content.idToPath || {})),
        folders: new Map(Object.entries(content.folders || {}).map(([id, folder]) => [id, folder as AssetFolder]))
      };
    }

    // Auto-discover unregistered AssetFile JSON files and register them
    const registered = this.autoDiscoverAssets(libraryName, meta);
    if (registered > 0) {
      console.log(`[ASSET-BROWSER] Auto-registered ${registered} untracked files in "${libraryName}"`);
      this.saveMeta(libraryName, meta);
    }

    return meta;
  }

  /**
   * Scan library directory for JSON files that look like valid AssetFiles
   * but aren't tracked in .meta.json yet. Registers them automatically.
   */
  private autoDiscoverAssets(libraryName: string, meta: LibraryMeta): number {
    const libraryDir = this.getLibraryDir(libraryName);
    if (!fs.existsSync(libraryDir)) return 0;

    const trackedPaths = new Set(meta.idToPath.values());
    let registered = 0;

    const scanDir = (dirPath: string, relativeBase: string) => {
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'status-effects'
          && entry.name !== 'items' && entry.name !== 'runes' && entry.name !== 'spells'
          && entry.name !== 'skills' && entry.name !== 'macro-actions' && entry.name !== 'shops'
          && entry.name !== 'loot-bundles') {
          const subRelative = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
          scanDir(path.join(dirPath, entry.name), subRelative);
        }
        if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('.') && entry.name !== 'library.json') {
          const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
          if (trackedPaths.has(relativePath)) continue;

          try {
            const content = JSON.parse(fs.readFileSync(path.join(dirPath, entry.name), 'utf-8'));
            // Check if it looks like a valid AssetFile (has id, type, data)
            if (content.id && content.type && content.data) {
              meta.idToPath.set(content.id, relativePath);
              trackedPaths.add(relativePath);
              // Ensure the file's folderId maps to an existing folder
              if (content.folderId && !meta.folders.has(content.folderId)) {
                content.folderId = 'root';
                fs.writeFileSync(path.join(dirPath, entry.name), JSON.stringify(content, null, 2), 'utf-8');
              }
              registered++;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    };

    scanDir(libraryDir, '');
    return registered;
  }

  private saveMeta(libraryName: string, meta: LibraryMeta): void {
    const content = {
      libraryId: meta.libraryId,
      idToPath: Object.fromEntries(meta.idToPath),
      folders: Object.fromEntries(meta.folders)
    };
    fs.writeFileSync(
      this.getMetaPath(libraryName),
      JSON.stringify(content, null, 2),
      'utf-8'
    );
  }

  // ==================== LIBRARY OPERATIONS ====================

  /**
   * Get all libraries (metadata only)
   */
  getAllLibraries(): AssetLibrary[] {
    if (!fs.existsSync(this.librariesDir)) {
      return [];
    }

    const entries = fs.readdirSync(this.librariesDir, { withFileTypes: true });
    const libraries: AssetLibrary[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        try {
          const metadataPath = this.getLibraryMetadataPath(entry.name);
          if (fs.existsSync(metadataPath)) {
            const content = fs.readFileSync(metadataPath, 'utf-8');
            libraries.push(JSON.parse(content));
          }
        } catch (error) {
          console.error(`Error reading library ${entry.name}:`, error);
        }
      }
    }

    return libraries;
  }

  /**
   * Get library metadata by ID or name
   */
  getLibrary(identifier: string): AssetLibrary {
    // Try as name first
    const metadataPath = this.getLibraryMetadataPath(identifier);
    if (fs.existsSync(metadataPath)) {
      return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    }

    // Try finding by ID
    const allLibs = this.getAllLibraries();
    const byId = allLibs.find(l => l.id === identifier);
    if (byId) {
      return byId;
    }

    throw new NotFoundException(`Library "${identifier}" not found`);
  }

  /**
   * Create a new library
   */
  createLibrary(name: string, description?: string): AssetLibrary {
    const now = Date.now();
    const sanitizedName = this.sanitizeFileName(name);
    const meta = this.loadMeta(sanitizedName);
    
    const library: AssetLibrary = {
      id: meta.libraryId,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      tags: [],
      isPublic: false
    };

    const libraryDir = this.getLibraryDir(sanitizedName);
    this.ensureDirectory(libraryDir);

    // Write library metadata
    fs.writeFileSync(
      this.getLibraryMetadataPath(sanitizedName),
      JSON.stringify(library, null, 2),
      'utf-8'
    );

    // Initialize meta with root folder
    this.saveMeta(sanitizedName, meta);

    return library;
  }

  /**
   * Update library metadata
   */
  updateLibrary(libraryIdentifier: string, updates: Partial<AssetLibrary>): AssetLibrary {
    const library = this.getLibrary(libraryIdentifier);
    const libraryName = library.name;
    
    const updated: AssetLibrary = {
      ...library,
      ...updates,
      id: library.id, // Ensure ID doesn't change
      updatedAt: Date.now()
    };

    fs.writeFileSync(
      this.getLibraryMetadataPath(libraryName),
      JSON.stringify(updated, null, 2),
      'utf-8'
    );

    return updated;
  }

  /**
   * Delete a library
   */
  deleteLibrary(libraryName: string): void {
    const libraryDir = this.getLibraryDir(libraryName);
    if (!fs.existsSync(libraryDir)) {
      throw new NotFoundException(`Library "${libraryName}" not found`);
    }
    fs.rmSync(libraryDir, { recursive: true, force: true });
  }

  // ==================== FOLDER OPERATIONS ====================

  private getFolderDiskPath(libraryName: string, folderPath: string): string {
    return path.join(this.getLibraryDir(libraryName), folderPath);
  }

  private buildFolderStructure(meta: LibraryMeta): AssetFolder[] {
    return Array.from(meta.folders.values());
  }

  /**
   * Get folder by ID
   */
  getFolder(libraryName: string, folderId: string): AssetFolder {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const folder = meta.folders.get(folderId);
    if (!folder) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }
    return folder;
  }

  /**
   * Get folder contents
   */
  getFolderContents(libraryName: string, folderId: string): FolderContents {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const folder = meta.folders.get(folderId);
    
    if (!folder && folderId !== 'root') {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }

    const targetFolder = folder || meta.folders.get('root')!;
    
    // Get subfolders
    const subfolders = Array.from(meta.folders.values())
      .filter(f => f.parentId === targetFolder.id);
    
    // Get files in this folder
    const files = this.getFilesInFolder(libraryName, targetFolder);
    
    // Build breadcrumbs
    const breadcrumbs: AssetFolder[] = [];
    let current: AssetFolder | undefined = targetFolder;
    while (current) {
      breadcrumbs.unshift(current);
      current = current.parentId ? meta.folders.get(current.parentId) : undefined;
    }

    return {
      folder: targetFolder,
      subfolders,
      files,
      breadcrumbs
    };
  }

  /**
   * Create a new folder
   */
  createFolder(libraryName: string, name: string, parentId: string): AssetFolder {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const parent = meta.folders.get(parentId);
    
    if (!parent && parentId !== 'root') {
      throw new NotFoundException(`Parent folder "${parentId}" not found`);
    }

    const parentFolder = parent || meta.folders.get('root')!;
    const now = Date.now();
    const sanitizedName = this.sanitizeFileName(name);
    const newPath = parentFolder.path ? `${parentFolder.path}/${sanitizedName}` : sanitizedName;
    
    // Check if folder already exists
    const diskPath = this.getFolderDiskPath(libraryName, newPath);
    if (fs.existsSync(diskPath)) {
      throw new ConflictException(
        `Ein Ordner mit dem Namen "${name}" existiert bereits hier.`
      );
    }

    const folder: AssetFolder = {
      id: this.generateId(libraryName, 'folder'),
      name,
      parentId: parentFolder.id,
      path: newPath,
      createdAt: now,
      updatedAt: now
    };

    // Create physical directory (diskPath already declared above for duplicate check)
    this.ensureDirectory(diskPath);

    // Update meta
    meta.folders.set(folder.id, folder);
    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);

    return folder;
  }

  /**
   * Delete a folder and all its contents
   */
  deleteFolder(libraryName: string, folderId: string): void {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const folder = meta.folders.get(folderId);
    
    if (!folder) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }
    if (folder.parentId === null) {
      throw new BadRequestException('Cannot delete root folder');
    }

    // Get all descendant folder IDs
    const toDelete = this.getDescendantFolderIds(meta, folderId);
    toDelete.push(folderId);

    // Delete physical folder
    const diskPath = this.getFolderDiskPath(libraryName, folder.path);
    if (fs.existsSync(diskPath)) {
      fs.rmSync(diskPath, { recursive: true, force: true });
    }

    // Remove from meta
    for (const id of toDelete) {
      meta.folders.delete(id);
    }

    // Clean up idToPath entries
    const pathsToRemove: string[] = [];
    for (const [assetId, assetPath] of meta.idToPath.entries()) {
      if (assetPath.startsWith(folder.path + '/') || assetPath === folder.path) {
        pathsToRemove.push(assetId);
      }
    }
    for (const assetId of pathsToRemove) {
      meta.idToPath.delete(assetId);
    }

    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);
  }

  /**
   * Rename a folder
   */
  renameFolder(libraryName: string, folderId: string, newName: string): AssetFolder {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const folder = meta.folders.get(folderId);
    
    if (!folder) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }

    const oldPath = folder.path;
    const oldDiskPath = this.getFolderDiskPath(libraryName, oldPath);
    
    const parent = folder.parentId ? meta.folders.get(folder.parentId) : null;
    const sanitizedName = this.sanitizeFileName(newName);
    const newPath = parent?.path ? `${parent.path}/${sanitizedName}` : sanitizedName;
    const newDiskPath = this.getFolderDiskPath(libraryName, newPath);
    
    // Check if target folder name already exists
    if (oldPath !== newPath && fs.existsSync(newDiskPath)) {
      throw new ConflictException(
        `Ein Ordner mit dem Namen "${newName}" existiert bereits hier.`
      );
    }

    // Rename physical folder
    if (fs.existsSync(oldDiskPath)) {
      fs.renameSync(oldDiskPath, newDiskPath);
    }

    // Update folder info
    folder.name = newName;
    folder.path = newPath;
    folder.updatedAt = Date.now();

    // Update all descendants
    this.updateDescendantPaths(meta, folderId, oldPath, newPath);

    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);

    return folder;
  }

  /**
   * Move a folder
   */
  moveFolder(libraryName: string, folderId: string, newParentId: string): AssetFolder {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const folder = meta.folders.get(folderId);
    
    if (!folder) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }

    if (this.isDescendant(meta, newParentId, folderId)) {
      throw new BadRequestException('Cannot move folder into itself or its descendant');
    }

    const oldPath = folder.path;
    const oldDiskPath = this.getFolderDiskPath(libraryName, oldPath);
    
    const newParent = meta.folders.get(newParentId);
    if (!newParent && newParentId !== 'root') {
      throw new NotFoundException(`Parent folder "${newParentId}" not found`);
    }

    const parentFolder = newParent || meta.folders.get('root')!;
    const sanitizedName = this.sanitizeFileName(folder.name);
    const newPath = parentFolder.path ? `${parentFolder.path}/${sanitizedName}` : sanitizedName;
    const newDiskPath = this.getFolderDiskPath(libraryName, newPath);

    // Move physical folder
    if (fs.existsSync(oldDiskPath)) {
      this.ensureDirectory(path.dirname(newDiskPath));
      fs.renameSync(oldDiskPath, newDiskPath);
    }

    // Update folder info
    folder.parentId = parentFolder.id;
    folder.path = newPath;
    folder.updatedAt = Date.now();

    // Update descendants
    this.updateDescendantPaths(meta, folderId, oldPath, newPath);

    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);

    return folder;
  }

  // ==================== FILE OPERATIONS ====================

  private getFileDiskPath(libraryName: string, folderPath: string, fileName: string): string {
    const folderDiskPath = this.getFolderDiskPath(libraryName, folderPath);
    const sanitizedName = this.sanitizeFileName(fileName);
    return path.join(folderDiskPath, `${sanitizedName}.json`);
  }

  private getFilesInFolder(libraryName: string, folder: AssetFolder): AssetFile[] {
    const diskPath = this.getFolderDiskPath(libraryName, folder.path);
    if (!fs.existsSync(diskPath)) {
      return [];
    }

    const files: AssetFile[] = [];
    const entries = fs.readdirSync(diskPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
        try {
          const content = fs.readFileSync(path.join(diskPath, entry.name), 'utf-8');
          const file = JSON.parse(content);
          files.push(file);
        } catch (error) {
          console.error(`Error reading file ${entry.name}:`, error);
        }
      }
    } 

    return files;
  }

  /**
   * Get a single file by ID
   */
  getFile(libraryName: string, fileId: string): AssetFile {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const relativePath = meta.idToPath.get(fileId);
    
    if (!relativePath) {
      throw new NotFoundException(`File "${fileId}" not found`);
    }

    const diskPath = path.join(this.getLibraryDir(libraryName), relativePath);
    if (!fs.existsSync(diskPath)) {
      throw new NotFoundException(`File "${fileId}" not found on disk`);
    }

    return JSON.parse(fs.readFileSync(diskPath, 'utf-8'));
  }

  /**
   * Create a new file
   */
  createFile(libraryName: string, name: string, type: AssetType, folderId: string, data: any): AssetFile {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const folder = meta.folders.get(folderId) || meta.folders.get('root')!;
    
    // Check if a file with the same name already exists in this folder
    const diskPath = this.getFileDiskPath(libraryName, folder.path, name);
    if (fs.existsSync(diskPath)) {
      throw new ConflictException(
        `Eine Datei mit dem Namen "${name}" existiert bereits in diesem Ordner.`
      );
    }
    
    const now = Date.now();
    const fileId = this.generateId(libraryName, type);

    const file: AssetFile = {
      id: fileId,
      name,
      type,
      folderId: folder.id,
      path: folder.path ? `${folder.path}/${name}` : name,
      data: {
        ...data,
        id: data.id || fileId
      },
      createdAt: now,
      updatedAt: now,
      icon: this.getTypeIcon(type),
      tags: []
    };

    // Write to disk (diskPath already declared above for duplicate check)
    this.ensureDirectory(path.dirname(diskPath));
    fs.writeFileSync(diskPath, JSON.stringify(file, null, 2), 'utf-8');

    // Update meta
    const relativePath = folder.path ? `${folder.path}/${this.sanitizeFileName(name)}.json` : `${this.sanitizeFileName(name)}.json`;
    meta.idToPath.set(fileId, relativePath);
    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);

    return file;
  }

  /**
   * Update a file
   */
  updateFile(libraryName: string, fileId: string, updates: Partial<AssetFile>): AssetFile {
    libraryName = this.resolveLibraryName(libraryName);
    const file = this.getFile(libraryName, fileId);
    const meta = this.loadMeta(libraryName);
    
    const oldPath = meta.idToPath.get(fileId)!;
    const oldDiskPath = path.join(this.getLibraryDir(libraryName), oldPath);
    
    const updated: AssetFile = {
      ...file,
      ...updates,
      id: fileId,
      updatedAt: Date.now()
    };

    // If name changed, rename file
    if (updates.name && updates.name !== file.name) {
      const folder = meta.folders.get(file.folderId)!;
      const newDiskPath = this.getFileDiskPath(libraryName, folder.path, updates.name);
      
      // Check if target name already exists
      if (fs.existsSync(newDiskPath)) {
        throw new ConflictException(
          `Eine Datei mit dem Namen "${updates.name}" existiert bereits in diesem Ordner.`
        );
      }
      
      // Write updated content to new path
      fs.writeFileSync(newDiskPath, JSON.stringify(updated, null, 2), 'utf-8');
      
      // Delete old file
      if (fs.existsSync(oldDiskPath)) {
        fs.unlinkSync(oldDiskPath);
      }
      
      const newRelativePath = folder.path ? `${folder.path}/${this.sanitizeFileName(updates.name)}.json` : `${this.sanitizeFileName(updates.name)}.json`;
      meta.idToPath.set(fileId, newRelativePath);
      updated.path = folder.path ? `${folder.path}/${updates.name}` : updates.name;
    } else {
      fs.writeFileSync(oldDiskPath, JSON.stringify(updated, null, 2), 'utf-8');
    }

    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);

    return updated;
  }

  /**
   * Move a file
   */
  moveFile(libraryName: string, fileId: string, newFolderId: string): AssetFile {
    libraryName = this.resolveLibraryName(libraryName);
    const file = this.getFile(libraryName, fileId);
    const meta = this.loadMeta(libraryName);
    
    const oldPath = meta.idToPath.get(fileId)!;
    const oldDiskPath = path.join(this.getLibraryDir(libraryName), oldPath);
    
    const newFolder = meta.folders.get(newFolderId) || meta.folders.get('root')!;
    const newDiskPath = this.getFileDiskPath(libraryName, newFolder.path, file.name);

    // Move file
    this.ensureDirectory(path.dirname(newDiskPath));
    fs.renameSync(oldDiskPath, newDiskPath);

    // Update file
    file.folderId = newFolder.id;
    file.path = newFolder.path ? `${newFolder.path}/${file.name}` : file.name;
    file.updatedAt = Date.now();

    fs.writeFileSync(newDiskPath, JSON.stringify(file, null, 2), 'utf-8');

    // Update meta
    const newRelativePath = newFolder.path ? `${newFolder.path}/${this.sanitizeFileName(file.name)}.json` : `${this.sanitizeFileName(file.name)}.json`;
    meta.idToPath.set(fileId, newRelativePath);
    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);

    return file;
  }

  /**
   * Copy a file
   */
  copyFile(libraryName: string, fileId: string, targetFolderId: string): AssetFile {
    const sourceFile = this.getFile(libraryName, fileId);
    return this.createFile(
      libraryName,
      `${sourceFile.name} (Copy)`,
      sourceFile.type,
      targetFolderId,
      {
        ...sourceFile.data,
        id: undefined,
        name: `${sourceFile.data.name || sourceFile.name} (Copy)`
      }
    );
  }

  /**
   * Delete a file
   */
  deleteFile(libraryName: string, fileId: string): void {
    libraryName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(libraryName);
    const relativePath = meta.idToPath.get(fileId);
    
    if (!relativePath) {
      throw new NotFoundException(`File "${fileId}" not found`);
    }

    const diskPath = path.join(this.getLibraryDir(libraryName), relativePath);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    meta.idToPath.delete(fileId);
    this.saveMeta(libraryName, meta);
    this.touchLibrary(libraryName);
  }

  // ==================== BUL K OPERATIONS ====================

  copyMultiple(
    libraryName: string,
    folderIds: string[],
    fileIds: string[],
    targetFolderId: string
  ): { folders: AssetFolder[]; files: AssetFile[] } {
    const copiedFolders: AssetFolder[] = [];
    const copiedFiles: AssetFile[] = [];

    for (const fileId of fileIds) {
      const copied = this.copyFile(libraryName, fileId, targetFolderId);
      copiedFiles.push(copied);
    }

    // Note: folder copying not implemented yet - would need recursive copy
    // for (const folderId of folderIds) {
    //   const copied = this.copyFolder(libraryName, folderId, targetFolderId);
    //   copiedFolders.push(copied);
    // }

    return { folders: copiedFolders, files: copiedFiles };
  }

  moveMultiple(
    libraryName: string,
    folderIds: string[],
    fileIds: string[],
    targetFolderId: string
  ): { folders: AssetFolder[]; files: AssetFile[] } {
    const movedFolders: AssetFolder[] = [];
    const movedFiles: AssetFile[] = [];

    for (const fileId of fileIds) {
      const moved = this.moveFile(libraryName, fileId, targetFolderId);
      movedFiles.push(moved);
    }

    for (const folderId of folderIds) {
      const moved = this.moveFolder(libraryName, folderId, targetFolderId);
      movedFolders.push(moved);
    }

    return { folders: movedFolders, files: movedFiles };
  }

  deleteMultiple(libraryName: string, folderIds: string[], fileIds: string[]): void {
    for (const fileId of fileIds) {
      this.deleteFile(libraryName, fileId);
    }

    for (const folderId of folderIds) {
      try {
        this.deleteFolder(libraryName, folderId);
      } catch (e) {
        // Might already be deleted as descendant
      }
    }
  }

  // ==================== SEARCH ====================

  searchFiles(libraryName: string, query: string, types?: AssetType[]): AssetFile[] {
    const resolvedName = this.resolveLibraryName(libraryName);
    const meta = this.loadMeta(resolvedName);
    const files: AssetFile[] = [];
    const lowerQuery = query.toLowerCase();

    for (const [fileId, relativePath] of meta.idToPath.entries()) {
      try {
        const file = this.getFile(resolvedName, fileId);
        
        if (types && types.length > 0 && !types.includes(file.type)) {
          continue;
        }
        
        if (
          file.name.toLowerCase().includes(lowerQuery) ||
          file.path.toLowerCase().includes(lowerQuery) ||
          file.data?.name?.toLowerCase()?.includes(lowerQuery) ||
          file.data?.description?.toLowerCase()?.includes(lowerQuery) ||
          file.tags?.some(t => t.toLowerCase().includes(lowerQuery))
        ) {
          files.push(file);
        }
      } catch (e) {
        // Skip files that can't be loaded
      }
    }

    return files;
  }

  // ==================== HELPER METHODS ====================

  private getDescendantFolderIds(meta: LibraryMeta, parentId: string): string[] {
    const descendants: string[] = [];
    const queue = [parentId];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const [folderId, folder] of meta.folders.entries()) {
        if (folder.parentId === current) {
          descendants.push(folderId);
          queue.push(folderId);
        }
      }
    }
    
    return descendants;
  }

  private isDescendant(meta: LibraryMeta, parentId: string, childId: string): boolean {
    let current = meta.folders.get(parentId);
    while (current) {
      if (current.id === childId) return true;
      current = current.parentId ? meta.folders.get(current.parentId) : undefined;
    }
    return false;
  }

  private updateDescendantPaths(meta: LibraryMeta, parentId: string, oldPath: string, newPath: string): void {
    const descendants = this.getDescendantFolderIds(meta, parentId);
    
    for (const folderId of descendants) {
      const folder = meta.folders.get(folderId)!;
      folder.path = folder.path.replace(oldPath, newPath);
      folder.updatedAt = Date.now();
    }

    // Update file paths in meta
    for (const [assetId, assetPath] of meta.idToPath.entries()) {
      if (assetPath.startsWith(oldPath + '/')) {
        const newAssetPath = assetPath.replace(oldPath, newPath);
        meta.idToPath.set(assetId, newAssetPath);
      }
    }
  }

  private touchLibrary(libraryName: string): void {
    try {
      const metadataPath = this.getLibraryMetadataPath(libraryName);
      if (fs.existsSync(metadataPath)) {
        const library = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        library.updatedAt = Date.now();
        fs.writeFileSync(metadataPath, JSON.stringify(library, null, 2), 'utf-8');
      }
    } catch (e) {
      // Ignore
    }
  }

  private getTypeIcon(type: AssetType): string {
    switch (type) {
      case 'item': return '📦';
      case 'spell': return '📖';
      case 'rune': return '✨';
      case 'skill': return '⚔️';
      case 'macro': return '⚡';
      case 'status-effect': return '🎭';
      case 'shop': return '🏪';
      case 'loot-bundle': return '🎁';
      default: return '📄';
    }
  }
}
