import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Asset types supported by the browser
 */
export type AssetType = 'item' | 'spell' | 'rune' | 'skill' | 'macro' | 'status-effect';

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

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Library directory structure
  private getLibraryDir(libraryId: string): string {
    return path.join(this.librariesDir, this.sanitizeFileName(libraryId));
  }

  private getLibraryMetadataPath(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'library.json');
  }

  private getFoldersIndexPath(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), '.folders.json');
  }

  private getFilesDir(libraryId: string): string {
    return path.join(this.getLibraryDir(libraryId), 'assets');
  }

  private getFilePath(libraryId: string, fileId: string): string {
    return path.join(this.getFilesDir(libraryId), `${this.sanitizeFileName(fileId)}.json`);
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
   * Get library metadata
   */
  getLibrary(libraryId: string): AssetLibrary {
    const metadataPath = this.getLibraryMetadataPath(libraryId);
    if (!fs.existsSync(metadataPath)) {
      throw new NotFoundException(`Library "${libraryId}" not found`);
    }
    return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  }

  /**
   * Create a new library
   */
  createLibrary(name: string, description?: string): AssetLibrary {
    const id = this.generateId('lib');
    const now = Date.now();
    
    const library: AssetLibrary = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      tags: [],
      isPublic: false
    };

    const libraryDir = this.getLibraryDir(id);
    this.ensureDirectory(libraryDir);
    this.ensureDirectory(this.getFilesDir(id));

    // Write library metadata
    fs.writeFileSync(
      this.getLibraryMetadataPath(id),
      JSON.stringify(library, null, 2),
      'utf-8'
    );

    // Initialize empty folders index with root folder
    const rootFolder: AssetFolder = {
      id: 'root',
      name: name,
      parentId: null,
      path: '/',
      createdAt: now,
      updatedAt: now
    };

    fs.writeFileSync(
      this.getFoldersIndexPath(id),
      JSON.stringify({ folders: [rootFolder] }, null, 2),
      'utf-8'
    );

    return library;
  }

  /**
   * Update library metadata
   */
  updateLibrary(libraryId: string, updates: Partial<AssetLibrary>): AssetLibrary {
    const library = this.getLibrary(libraryId);
    
    const updated: AssetLibrary = {
      ...library,
      ...updates,
      id: libraryId, // Ensure ID doesn't change
      updatedAt: Date.now()
    };

    fs.writeFileSync(
      this.getLibraryMetadataPath(libraryId),
      JSON.stringify(updated, null, 2),
      'utf-8'
    );

    return updated;
  }

  /**
   * Delete a library
   */
  deleteLibrary(libraryId: string): void {
    const libraryDir = this.getLibraryDir(libraryId);
    if (!fs.existsSync(libraryDir)) {
      throw new NotFoundException(`Library "${libraryId}" not found`);
    }
    fs.rmSync(libraryDir, { recursive: true, force: true });
  }

  // ==================== FOLDER OPERATIONS ====================

  /**
   * Load folders index
   */
  private loadFoldersIndex(libraryId: string): AssetFolder[] {
    const indexPath = this.getFoldersIndexPath(libraryId);
    if (!fs.existsSync(indexPath)) {
      return [{
        id: 'root',
        name: 'Root',
        parentId: null,
        path: '/',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }];
    }
    const content = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    return content.folders || [];
  }

  /**
   * Save folders index
   */
  private saveFoldersIndex(libraryId: string, folders: AssetFolder[]): void {
    fs.writeFileSync(
      this.getFoldersIndexPath(libraryId),
      JSON.stringify({ folders }, null, 2),
      'utf-8'
    );
  }

  /**
   * Get folder by ID
   */
  getFolder(libraryId: string, folderId: string): AssetFolder {
    const folders = this.loadFoldersIndex(libraryId);
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }
    return folder;
  }

  /**
   * Get folder contents
   */
  getFolderContents(libraryId: string, folderId: string): FolderContents {
    const folders = this.loadFoldersIndex(libraryId);
    const folder = folderId === 'root' ? folders.find(f => f.parentId === null) : folders.find(f => f.id === folderId);
    
    if (!folder && folderId !== 'root') {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }

    const targetId = folder?.id || 'root';
    
    // Get subfolders
    const subfolders = folders.filter(f => f.parentId === targetId);
    
    // Get files in this folder
    const files = this.getFilesInFolder(libraryId, targetId);
    
    // Build breadcrumbs
    const breadcrumbs: AssetFolder[] = [];
    let current = folder;
    while (current) {
      breadcrumbs.unshift(current);
      current = current.parentId ? folders.find(f => f.id === current!.parentId) : undefined;
    }

    return {
      folder: folder || null,
      subfolders,
      files,
      breadcrumbs
    };
  }

  /**
   * Create a new folder
   */
  createFolder(libraryId: string, name: string, parentId: string): AssetFolder {
    const folders = this.loadFoldersIndex(libraryId);
    
    // Validate parent exists
    const parent = folders.find(f => f.id === parentId);
    if (!parent && parentId !== 'root') {
      throw new NotFoundException(`Parent folder "${parentId}" not found`);
    }

    const now = Date.now();
    const parentPath = parent?.path || '/';
    const newPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;

    const folder: AssetFolder = {
      id: this.generateId('folder'),
      name,
      parentId: parentId === 'root' ? folders.find(f => f.parentId === null)?.id || parentId : parentId,
      path: newPath,
      createdAt: now,
      updatedAt: now
    };

    folders.push(folder);
    this.saveFoldersIndex(libraryId, folders);

    // Update library timestamp
    this.touchLibrary(libraryId);

    return folder;
  }

  /**
   * Rename a folder
   */
  renameFolder(libraryId: string, folderId: string, newName: string): AssetFolder {
    const folders = this.loadFoldersIndex(libraryId);
    const folderIndex = folders.findIndex(f => f.id === folderId);
    
    if (folderIndex === -1) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }

    const folder = folders[folderIndex];
    const oldPath = folder.path;
    const parent = folders.find(f => f.id === folder.parentId);
    const parentPath = parent?.path || '/';
    const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;

    // Update folder
    folder.name = newName;
    folder.path = newPath;
    folder.updatedAt = Date.now();

    // Update all child folder paths
    this.updateChildPaths(folders, folderId, oldPath, newPath);

    // Update all files in this folder and subfolders
    this.updateFilePaths(libraryId, oldPath, newPath);

    this.saveFoldersIndex(libraryId, folders);
    this.touchLibrary(libraryId);

    return folder;
  }

  /**
   * Move a folder to a new parent
   */
  moveFolder(libraryId: string, folderId: string, newParentId: string): AssetFolder {
    const folders = this.loadFoldersIndex(libraryId);
    const folderIndex = folders.findIndex(f => f.id === folderId);
    
    if (folderIndex === -1) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }

    // Prevent moving to self or descendant
    if (this.isDescendant(folders, newParentId, folderId)) {
      throw new BadRequestException('Cannot move folder into itself or its descendant');
    }

    const folder = folders[folderIndex];
    const oldPath = folder.path;
    const newParent = folders.find(f => f.id === newParentId);
    const newParentPath = newParent?.path || '/';
    const newPath = newParentPath === '/' ? `/${folder.name}` : `${newParentPath}/${folder.name}`;

    // Update folder
    folder.parentId = newParentId;
    folder.path = newPath;
    folder.updatedAt = Date.now();

    // Update child paths
    this.updateChildPaths(folders, folderId, oldPath, newPath);

    // Update file paths
    this.updateFilePaths(libraryId, oldPath, newPath);

    this.saveFoldersIndex(libraryId, folders);
    this.touchLibrary(libraryId);

    return folder;
  }

  /**
   * Delete a folder and all its contents
   */
  deleteFolder(libraryId: string, folderId: string): void {
    const folders = this.loadFoldersIndex(libraryId);
    
    // Don't allow deleting root
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }
    if (folder.parentId === null) {
      throw new BadRequestException('Cannot delete root folder');
    }

    // Get all descendant folder IDs
    const toDelete = this.getDescendantFolderIds(folders, folderId);
    toDelete.push(folderId);

    // Delete all files in these folders
    for (const id of toDelete) {
      const files = this.getFilesInFolder(libraryId, id);
      for (const file of files) {
        this.deleteFileInternal(libraryId, file.id);
      }
    }

    // Remove folders from index
    const remaining = folders.filter(f => !toDelete.includes(f.id));
    this.saveFoldersIndex(libraryId, remaining);
    this.touchLibrary(libraryId);
  }

  // ==================== FILE OPERATIONS ====================

  /**
   * Load all files in a library
   */
  private loadAllFiles(libraryId: string): AssetFile[] {
    const filesDir = this.getFilesDir(libraryId);
    if (!fs.existsSync(filesDir)) {
      return [];
    }

    const files: AssetFile[] = [];
    const entries = fs.readdirSync(filesDir);
    
    for (const entry of entries) {
      if (entry.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(filesDir, entry), 'utf-8');
          files.push(JSON.parse(content));
        } catch (error) {
          console.error(`Error reading file ${entry}:`, error);
        }
      }
    }

    return files;
  }

  /**
   * Get files in a specific folder
   */
  getFilesInFolder(libraryId: string, folderId: string): AssetFile[] {
    const allFiles = this.loadAllFiles(libraryId);
    return allFiles.filter(f => f.folderId === folderId);
  }

  /**
   * Get a single file
   */
  getFile(libraryId: string, fileId: string): AssetFile {
    const filePath = this.getFilePath(libraryId, fileId);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File "${fileId}" not found`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  /**
   * Create a new file
   */
  createFile(libraryId: string, name: string, type: AssetType, folderId: string, data: any): AssetFile {
    const folders = this.loadFoldersIndex(libraryId);
    const folder = folders.find(f => f.id === folderId);
    
    const folderPath = folder?.path || '/';
    const now = Date.now();

    const file: AssetFile = {
      id: this.generateId(type),
      name,
      type,
      folderId,
      path: folderPath === '/' ? `/${name}` : `${folderPath}/${name}`,
      data: {
        ...data,
        id: data.id || this.generateId(type)
      },
      createdAt: now,
      updatedAt: now,
      icon: this.getTypeIcon(type),
      tags: []
    };

    this.ensureDirectory(this.getFilesDir(libraryId));
    fs.writeFileSync(
      this.getFilePath(libraryId, file.id),
      JSON.stringify(file, null, 2),
      'utf-8'
    );

    this.touchLibrary(libraryId);

    return file;
  }

  /**
   * Update a file
   */
  updateFile(libraryId: string, fileId: string, updates: Partial<AssetFile>): AssetFile {
    const file = this.getFile(libraryId, fileId);
    
    const updated: AssetFile = {
      ...file,
      ...updates,
      id: fileId, // Ensure ID doesn't change
      updatedAt: Date.now()
    };

    // If name changed, update path
    if (updates.name && updates.name !== file.name) {
      const folders = this.loadFoldersIndex(libraryId);
      const folder = folders.find(f => f.id === file.folderId);
      const folderPath = folder?.path || '/';
      updated.path = folderPath === '/' ? `/${updates.name}` : `${folderPath}/${updates.name}`;
    }

    fs.writeFileSync(
      this.getFilePath(libraryId, fileId),
      JSON.stringify(updated, null, 2),
      'utf-8'
    );

    this.touchLibrary(libraryId);

    return updated;
  }

  /**
   * Move a file to a different folder
   */
  moveFile(libraryId: string, fileId: string, newFolderId: string): AssetFile {
    const file = this.getFile(libraryId, fileId);
    const folders = this.loadFoldersIndex(libraryId);
    const newFolder = folders.find(f => f.id === newFolderId);

    const folderPath = newFolder?.path || '/';
    
    const updated: AssetFile = {
      ...file,
      folderId: newFolderId,
      path: folderPath === '/' ? `/${file.name}` : `${folderPath}/${file.name}`,
      updatedAt: Date.now()
    };

    fs.writeFileSync(
      this.getFilePath(libraryId, fileId),
      JSON.stringify(updated, null, 2),
      'utf-8'
    );

    this.touchLibrary(libraryId);

    return updated;
  }

  /**
   * Copy a file (creates a new file with new ID)
   */
  copyFile(libraryId: string, fileId: string, targetFolderId: string): AssetFile {
    const sourceFile = this.getFile(libraryId, fileId);
    
    // Create new file with new ID
    return this.createFile(
      libraryId,
      `${sourceFile.name} (Copy)`,
      sourceFile.type,
      targetFolderId,
      {
        ...sourceFile.data,
        id: undefined, // Will be regenerated
        name: `${sourceFile.data.name || sourceFile.name} (Copy)`
      }
    );
  }

  /**
   * Delete a file
   */
  deleteFile(libraryId: string, fileId: string): void {
    this.deleteFileInternal(libraryId, fileId);
    this.touchLibrary(libraryId);
  }

  private deleteFileInternal(libraryId: string, fileId: string): void {
    const filePath = this.getFilePath(libraryId, fileId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Copy multiple files and/or folders
   */
  copyMultiple(
    libraryId: string,
    folderIds: string[],
    fileIds: string[],
    targetFolderId: string
  ): { folders: AssetFolder[]; files: AssetFile[] } {
    const copiedFolders: AssetFolder[] = [];
    const copiedFiles: AssetFile[] = [];

    // Copy files
    for (const fileId of fileIds) {
      const copied = this.copyFile(libraryId, fileId, targetFolderId);
      copiedFiles.push(copied);
    }

    // Copy folders (with contents)
    for (const folderId of folderIds) {
      const result = this.copyFolderRecursive(libraryId, folderId, targetFolderId);
      copiedFolders.push(...result.folders);
      copiedFiles.push(...result.files);
    }

    return { folders: copiedFolders, files: copiedFiles };
  }

  /**
   * Move multiple files and/or folders
   */
  moveMultiple(
    libraryId: string,
    folderIds: string[],
    fileIds: string[],
    targetFolderId: string
  ): { folders: AssetFolder[]; files: AssetFile[] } {
    const movedFolders: AssetFolder[] = [];
    const movedFiles: AssetFile[] = [];

    // Move files
    for (const fileId of fileIds) {
      const moved = this.moveFile(libraryId, fileId, targetFolderId);
      movedFiles.push(moved);
    }

    // Move folders
    for (const folderId of folderIds) {
      const moved = this.moveFolder(libraryId, folderId, targetFolderId);
      movedFolders.push(moved);
    }

    return { folders: movedFolders, files: movedFiles };
  }

  /**
   * Delete multiple files and/or folders
   */
  deleteMultiple(libraryId: string, folderIds: string[], fileIds: string[]): void {
    // Delete files first
    for (const fileId of fileIds) {
      this.deleteFileInternal(libraryId, fileId);
    }

    // Delete folders (which also deletes their contents)
    for (const folderId of folderIds) {
      try {
        this.deleteFolder(libraryId, folderId);
      } catch (e) {
        // Folder might already be deleted as descendant
      }
    }

    this.touchLibrary(libraryId);
  }

  // ==================== HELPER METHODS ====================

  private copyFolderRecursive(
    libraryId: string,
    folderId: string,
    targetParentId: string
  ): { folders: AssetFolder[]; files: AssetFile[] } {
    const folders = this.loadFoldersIndex(libraryId);
    const sourceFolder = folders.find(f => f.id === folderId);
    
    if (!sourceFolder) {
      throw new NotFoundException(`Folder "${folderId}" not found`);
    }

    const copiedFolders: AssetFolder[] = [];
    const copiedFiles: AssetFile[] = [];
    const idMap = new Map<string, string>(); // Old ID -> New ID

    // Create new root folder
    const newFolder = this.createFolder(libraryId, `${sourceFolder.name} (Copy)`, targetParentId);
    copiedFolders.push(newFolder);
    idMap.set(folderId, newFolder.id);

    // Copy subfolders recursively
    const descendants = this.getDescendantFolders(folders, folderId);
    for (const desc of descendants) {
      const newParentId = idMap.get(desc.parentId!) || targetParentId;
      const copied = this.createFolder(libraryId, desc.name, newParentId);
      copiedFolders.push(copied);
      idMap.set(desc.id, copied.id);
    }

    // Copy files
    const allFolderIds = [folderId, ...this.getDescendantFolderIds(folders, folderId)];
    for (const srcFolderId of allFolderIds) {
      const files = this.getFilesInFolder(libraryId, srcFolderId);
      const newFolderId = idMap.get(srcFolderId) || targetParentId;
      
      for (const file of files) {
        const copied = this.copyFile(libraryId, file.id, newFolderId);
        copiedFiles.push(copied);
      }
    }

    return { folders: copiedFolders, files: copiedFiles };
  }

  private isDescendant(folders: AssetFolder[], parentId: string, childId: string): boolean {
    let current = folders.find(f => f.id === parentId);
    while (current) {
      if (current.id === childId) return true;
      current = current.parentId ? folders.find(f => f.id === current!.parentId) : undefined;
    }
    return false;
  }

  private getDescendantFolderIds(folders: AssetFolder[], parentId: string): string[] {
    const descendants: string[] = [];
    const queue = [parentId];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = folders.filter(f => f.parentId === current);
      for (const child of children) {
        descendants.push(child.id);
        queue.push(child.id);
      }
    }
    
    return descendants;
  }

  private getDescendantFolders(folders: AssetFolder[], parentId: string): AssetFolder[] {
    const ids = this.getDescendantFolderIds(folders, parentId);
    return folders.filter(f => ids.includes(f.id));
  }

  private updateChildPaths(folders: AssetFolder[], parentId: string, oldPath: string, newPath: string): void {
    for (const folder of folders) {
      if (folder.path.startsWith(oldPath + '/') || folder.path === oldPath) {
        folder.path = folder.path.replace(oldPath, newPath);
        folder.updatedAt = Date.now();
      }
    }
  }

  private updateFilePaths(libraryId: string, oldPath: string, newPath: string): void {
    const files = this.loadAllFiles(libraryId);
    for (const file of files) {
      if (file.path.startsWith(oldPath + '/') || file.path === oldPath) {
        file.path = file.path.replace(oldPath, newPath);
        file.updatedAt = Date.now();
        fs.writeFileSync(
          this.getFilePath(libraryId, file.id),
          JSON.stringify(file, null, 2),
          'utf-8'
        );
      }
    }
  }

  private touchLibrary(libraryId: string): void {
    try {
      const library = this.getLibrary(libraryId);
      library.updatedAt = Date.now();
      fs.writeFileSync(
        this.getLibraryMetadataPath(libraryId),
        JSON.stringify(library, null, 2),
        'utf-8'
      );
    } catch (e) {
      // Ignore if library doesn't exist yet
    }
  }

  private getTypeIcon(type: AssetType): string {
    switch (type) {
      case 'item': return '📦';
      case 'spell': return '✨';
      case 'rune': return '🔮';
      case 'skill': return '⚔️';
      case 'macro': return '⚡';
      case 'status-effect': return '🎭';
      default: return '📄';
    }
  }

  // ==================== SEARCH ====================

  /**
   * Search files across the library
   */
  searchFiles(libraryId: string, query: string, types?: AssetType[]): AssetFile[] {
    const files = this.loadAllFiles(libraryId);
    const lowerQuery = query.toLowerCase();
    
    return files.filter(file => {
      if (types && types.length > 0 && !types.includes(file.type)) {
        return false;
      }
      
      return (
        file.name.toLowerCase().includes(lowerQuery) ||
        file.path.toLowerCase().includes(lowerQuery) ||
        file.data?.name?.toLowerCase()?.includes(lowerQuery) ||
        file.data?.description?.toLowerCase()?.includes(lowerQuery) ||
        file.tags?.some(t => t.toLowerCase().includes(lowerQuery))
      );
    });
  }
}
