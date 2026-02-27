import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AssetBrowserApiService,
  AssetLibrary,
  FolderContentsResponse,
} from '../services/asset-browser-api.service';
import { AssetClipboardService } from '../services/asset-clipboard.service';
import {
  AssetFile,
  AssetFolder,
  AssetType,
  ClipboardItem,
  ViewMode,
  SortOptions,
  getAssetTypeIcon,
  getAssetTypeName,
} from '../model/asset-browser.model';
import { ItemBlock } from '../model/item-block.model';
import { RuneBlock } from '../model/rune-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { SkillBlock } from '../model/skill-block.model';
import { StatusEffect, createEmptyStatusEffect } from '../model/status-effect.model';
import { MacroAction, createEmptyMacroAction } from '../model/macro-action.model';

// Editor Components
import { ItemEditorComponent } from '../sheet/item-editor/item-editor.component';
import { RuneEditorComponent } from '../shared/rune-editor/rune-editor.component';
import { SpellEditorComponent } from '../shared/spell-editor/spell-editor.component';
import { SkillEditorComponent } from '../shared/skill-editor/skill-editor.component';
import { StatusEffectEditorComponent } from '../shared/status-effect-editor/status-effect-editor.component';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';

@Component({
  selector: 'app-asset-browser',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ItemEditorComponent,
    RuneEditorComponent,
    SpellEditorComponent,
    SkillEditorComponent,
    StatusEffectEditorComponent,
  ],
  templateUrl: './asset-browser.component.html',
  styleUrl: './asset-browser.component.css',
})
export class AssetBrowserComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(AssetBrowserApiService);
  clipboard = inject(AssetClipboardService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Library state
  libraryId = signal<string>('');
  library = signal<AssetLibrary | null>(null);

  // Navigation state
  currentFolderId = signal<string>('root');
  folderContents = signal<FolderContentsResponse | null>(null);
  breadcrumbs = computed(() => this.folderContents()?.breadcrumbs ?? []);
  subfolders = computed(() => {
    const contents = this.folderContents();
    if (!contents) return [];
    return this.sortItems(contents.subfolders, 'folder');
  });
  files = computed(() => {
    const contents = this.folderContents();
    if (!contents) return [];
    return this.sortItems(contents.files, 'file');
  });

  // Selection state
  selectedIds = signal<Set<string>>(new Set());
  lastSelectedId = signal<string | null>(null);
  isSelectionFolder = signal<boolean>(false);

  // View options
  viewMode = signal<ViewMode>('grid');
  sortOptions = signal<SortOptions>({ field: 'name', direction: 'asc' });
  searchQuery = signal<string>('');
  searchResults = signal<AssetFile[] | null>(null);
  isSearching = computed(() => this.searchQuery().length > 0);

  // UI state
  isLoading = signal(false);
  isRenaming = signal<string | null>(null);
  renameValue = signal('');
  showCreateMenu = signal(false);
  contextMenuPosition = signal<{ x: number; y: number } | null>(null);
  contextMenuTarget = signal<{ type: 'folder' | 'file'; id: string } | null>(null);

  // Editor state
  editingFile = signal<AssetFile | null>(null);
  editingType = signal<AssetType | null>(null);

  // Dummy sheet for item rendering
  dummySheet: CharacterSheet = createEmptySheet();

  // Tree state for folder tree
  expandedFolders = signal<Set<string>>(new Set(['root']));
  allFolders = signal<AssetFolder[]>([]);

  ngOnInit(): void {
    // Load library ID from route
    this.route.params.subscribe(async (params) => {
      const id = params['libraryId'];
      if (id) {
        this.libraryId.set(id);
        await this.loadLibrary();
        await this.loadFolderContents();
        await this.loadAllFolders();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // ==================== KEYBOARD SHORTCUTS ====================

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    // Don't trigger if typing in input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const hasSelection = this.selectedIds().size > 0;

    // Ctrl+C - Copy
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && hasSelection) {
      event.preventDefault();
      this.copySelected();
    }

    // Ctrl+X - Cut
    if ((event.ctrlKey || event.metaKey) && event.key === 'x' && hasSelection) {
      event.preventDefault();
      this.cutSelected();
    }

    // Ctrl+V - Paste
    if ((event.ctrlKey || event.metaKey) && event.key === 'v' && this.clipboard.canPaste()) {
      event.preventDefault();
      this.paste();
    }

    // Delete - Delete selected
    if (event.key === 'Delete' && hasSelection) {
      event.preventDefault();
      this.deleteSelected();
    }

    // F2 - Rename
    if (event.key === 'F2' && this.selectedIds().size === 1) {
      event.preventDefault();
      this.startRename(Array.from(this.selectedIds())[0]);
    }

    // Enter - Open selected
    if (event.key === 'Enter' && this.selectedIds().size === 1) {
      event.preventDefault();
      const id = Array.from(this.selectedIds())[0];
      this.openItem(id);
    }

    // Escape - Clear selection or close context menu
    if (event.key === 'Escape') {
      if (this.contextMenuPosition()) {
        this.closeContextMenu();
      } else if (this.isRenaming()) {
        this.cancelRename();
      } else {
        this.clearSelection();
      }
    }

    // Ctrl+A - Select all
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      this.selectAll();
    }
  }

  // ==================== DATA LOADING ====================

  async loadLibrary(): Promise<void> {
    try {
      const library = await firstValueFrom(this.api.getLibrary(this.libraryId()));
      this.library.set(library);
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  }

  async loadFolderContents(): Promise<void> {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(
        this.api.getFolderContents(this.libraryId(), this.currentFolderId())
      );
      this.folderContents.set(contents);
      this.clearSelection();
    } catch (error) {
      console.error('Failed to load folder contents:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadAllFolders(): Promise<void> {
    // Load root folder contents to get all folders for tree
    try {
      const rootContents = await firstValueFrom(
        this.api.getFolderContents(this.libraryId(), 'root')
      );
      // Build full folder list recursively
      const folders: AssetFolder[] = [];
      if (rootContents.folder) {
        folders.push(rootContents.folder);
      }
      await this.loadFoldersRecursive(folders, 'root');
      this.allFolders.set(folders);
    } catch (error) {
      console.error('Failed to load folder tree:', error);
    }
  }

  private async loadFoldersRecursive(folders: AssetFolder[], parentId: string): Promise<void> {
    try {
      const contents = await firstValueFrom(
        this.api.getFolderContents(this.libraryId(), parentId)
      );
      for (const subfolder of contents.subfolders) {
        folders.push(subfolder);
        await this.loadFoldersRecursive(folders, subfolder.id);
      }
    } catch (error) {
      // Ignore errors for individual folders
    }
  }

  // ==================== NAVIGATION ====================

  navigateToFolder(folderId: string): void {
    this.currentFolderId.set(folderId);
    this.loadFolderContents();
  }

  navigateUp(): void {
    const parent = this.folderContents()?.folder?.parentId;
    if (parent) {
      this.navigateToFolder(parent);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // ==================== SELECTION ====================

  selectItem(id: string, isFolder: boolean, event: MouseEvent): void {
    event.stopPropagation();

    if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      const current = new Set(this.selectedIds());
      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }
      this.selectedIds.set(current);
    } else if (event.shiftKey && this.lastSelectedId()) {
      // Range selection
      this.selectRange(this.lastSelectedId()!, id, isFolder);
    } else {
      // Single selection
      this.selectedIds.set(new Set([id]));
      this.isSelectionFolder.set(isFolder);
    }

    this.lastSelectedId.set(id);
  }

  private selectRange(startId: string, endId: string, isFolder: boolean): void {
    const items = isFolder ? this.subfolders() : this.files();
    const ids = items.map((item) => item.id);
    const startIndex = ids.indexOf(startId);
    const endIndex = ids.indexOf(endId);

    if (startIndex === -1 || endIndex === -1) return;

    const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
    const rangeIds = ids.slice(from, to + 1);

    this.selectedIds.set(new Set(rangeIds));
  }

  selectAll(): void {
    const allIds = [
      ...this.subfolders().map((f) => f.id),
      ...this.files().map((f) => f.id),
    ];
    this.selectedIds.set(new Set(allIds));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
    this.lastSelectedId.set(null);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  /**
   * Check if an item is in the cut clipboard (should show faded)
   */
  isCutItem(id: string): boolean {
    const data = this.clipboard.getData();
    if (!data || data.operation !== 'cut') return false;
    return data.items.some(item => item.id === id);
  }

  // ==================== CLIPBOARD OPERATIONS ====================

  copySelected(): void {
    const items = this.getSelectedClipboardItems();
    this.clipboard.copy(this.libraryId(), items);
  }

  cutSelected(): void {
    const items = this.getSelectedClipboardItems();
    this.clipboard.cut(this.libraryId(), items);
  }

  private getSelectedClipboardItems(): ClipboardItem[] {
    const items: ClipboardItem[] = [];

    for (const id of this.selectedIds()) {
      const folder = this.subfolders().find((f) => f.id === id);
      if (folder) {
        items.push({ type: 'folder', id: folder.id, path: folder.path });
        continue;
      }

      const file = this.files().find((f) => f.id === id);
      if (file) {
        items.push({ type: 'file', id: file.id, path: file.path });
      }
    }

    return items;
  }

  async paste(): Promise<void> {
    const data = this.clipboard.getData();
    if (!data) return;

    const { folderIds, fileIds } = this.clipboard.getItemsByType();
    const targetFolderId = this.currentFolderId();

    try {
      this.isLoading.set(true);

      if (data.operation === 'copy') {
        await firstValueFrom(
          this.api.bulkCopy(this.libraryId(), folderIds, fileIds, targetFolderId)
        );
      } else {
        await firstValueFrom(
          this.api.bulkMove(this.libraryId(), folderIds, fileIds, targetFolderId)
        );
        this.clipboard.clear();
      }

      await this.loadFolderContents();
      await this.loadAllFolders();
    } catch (error) {
      console.error('Paste failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ==================== CREATE OPERATIONS ====================

  async createFolder(): Promise<void> {
    const name = prompt('Enter folder name:', 'New Folder');
    if (!name) return;

    try {
      this.isLoading.set(true);
      await firstValueFrom(
        this.api.createFolder(this.libraryId(), name, this.currentFolderId())
      );
      await this.loadFolderContents();
      await this.loadAllFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      this.isLoading.set(false);
      this.showCreateMenu.set(false);
    }
  }

  async createFile(type: AssetType): Promise<void> {
    const defaultName = `New ${getAssetTypeName(type)}`;
    const name = prompt(`Enter ${getAssetTypeName(type).toLowerCase()} name:`, defaultName);
    if (!name) return;

    const data = this.getEmptyDataForType(type, name);

    try {
      this.isLoading.set(true);
      const file = await firstValueFrom(
        this.api.createFile(this.libraryId(), name, type, this.currentFolderId(), data)
      );
      await this.loadFolderContents();
      
      // Open the editor for the new file
      this.openEditor(file);
    } catch (error) {
      console.error('Failed to create file:', error);
    } finally {
      this.isLoading.set(false);
      this.showCreateMenu.set(false);
    }
  }

  private getEmptyDataForType(type: AssetType, name: string): any {
    switch (type) {
      case 'item':
        return {
          name,
          description: '',
          weight: 0,
          lost: false,
          broken: false,
          itemType: 'other',
          requirements: {}
        };
      case 'spell':
        return { name, description: '', tags: [], binding: { type: 'learned' } };
      case 'rune':
        return { name, description: '' };
      case 'skill':
        return {
          name,
          description: '',
          class: '',
          type: 'active',
          enlightened: false
        };
      case 'status-effect':
        return { ...createEmptyStatusEffect(), name };
      case 'macro':
        return { ...createEmptyMacroAction(), name };
      default:
        return { name };
    }
  }

  toggleCreateMenu(): void {
    this.showCreateMenu.set(!this.showCreateMenu());
  }

  // ==================== RENAME OPERATIONS ====================

  startRename(id: string): void {
    const folder = this.subfolders().find((f) => f.id === id);
    const file = this.files().find((f) => f.id === id);
    const name = folder?.name || file?.name || '';

    this.isRenaming.set(id);
    this.renameValue.set(name);
  }

  cancelRename(): void {
    this.isRenaming.set(null);
    this.renameValue.set('');
  }

  async confirmRename(): Promise<void> {
    const id = this.isRenaming();
    const newName = this.renameValue().trim();

    if (!id || !newName) {
      this.cancelRename();
      return;
    }

    try {
      this.isLoading.set(true);

      const folder = this.subfolders().find((f) => f.id === id);
      if (folder) {
        await firstValueFrom(this.api.renameFolder(this.libraryId(), id, newName));
        await this.loadAllFolders();
      } else {
        await firstValueFrom(this.api.updateFile(this.libraryId(), id, { name: newName }));
      }

      await this.loadFolderContents();
    } catch (error) {
      console.error('Rename failed:', error);
    } finally {
      this.isLoading.set(false);
      this.cancelRename();
    }
  }

  // ==================== DELETE OPERATIONS ====================

  async deleteSelected(): Promise<void> {
    const count = this.selectedIds().size;
    if (count === 0) return;

    const confirmed = confirm(`Delete ${count} item${count > 1 ? 's' : ''}?`);
    if (!confirmed) return;

    const folderIds: string[] = [];
    const fileIds: string[] = [];

    for (const id of this.selectedIds()) {
      if (this.subfolders().some((f) => f.id === id)) {
        folderIds.push(id);
      } else {
        fileIds.push(id);
      }
    }

    try {
      this.isLoading.set(true);
      await firstValueFrom(this.api.bulkDelete(this.libraryId(), folderIds, fileIds));
      await this.loadFolderContents();
      await this.loadAllFolders();
      this.clearSelection();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ==================== OPEN/EDIT OPERATIONS ====================

  openItem(id: string): void {
    const folder = this.subfolders().find((f) => f.id === id);
    if (folder) {
      this.navigateToFolder(folder.id);
      return;
    }

    const file = this.files().find((f) => f.id === id);
    if (file) {
      this.openEditor(file);
    }
  }

  onDoubleClick(id: string, isFolder: boolean, event: MouseEvent): void {
    event.stopPropagation();
    this.openItem(id);
  }

  openEditor(file: AssetFile): void {
    this.editingFile.set(file);
    this.editingType.set(file.type);
  }

  closeEditor(): void {
    this.editingFile.set(null);
    this.editingType.set(null);
  }

  async saveEditor(data: any): Promise<void> {
    const file = this.editingFile();
    if (!file) return;

    try {
      await firstValueFrom(
        this.api.updateFile(this.libraryId(), file.id, {
          data,
          name: data.name || file.name,
        })
      );
      await this.loadFolderContents();
      this.closeEditor();
    } catch (error) {
      console.error('Save failed:', error);
    }
  }

  // ==================== CONTEXT MENU ====================

  onContextMenu(event: MouseEvent, type: 'folder' | 'file' | 'background', id?: string): void {
    event.preventDefault();
    event.stopPropagation();

    if (type !== 'background' && id) {
      // Select the item if not already selected
      if (!this.selectedIds().has(id)) {
        this.selectedIds.set(new Set([id]));
        this.isSelectionFolder.set(type === 'folder');
      }
      this.contextMenuTarget.set({ type, id });
    } else {
      this.contextMenuTarget.set(null);
    }

    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
  }

  closeContextMenu(): void {
    this.contextMenuPosition.set(null);
    this.contextMenuTarget.set(null);
  }

  // ==================== SORTING ====================

  private sortItems<T extends AssetFolder | AssetFile>(items: T[], type: 'folder' | 'file'): T[] {
    const { field, direction } = this.sortOptions();
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...items].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          if (type === 'file') {
            comparison = ((a as AssetFile).type || '').localeCompare((b as AssetFile).type || '');
          }
          break;
        case 'createdAt':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'updatedAt':
          comparison = a.updatedAt - b.updatedAt;
          break;
      }

      return comparison * multiplier;
    });
  }

  setSortField(field: 'name' | 'type' | 'createdAt' | 'updatedAt'): void {
    const current = this.sortOptions();
    if (current.field === field) {
      this.sortOptions.set({
        field,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      this.sortOptions.set({ field, direction: 'asc' });
    }
  }

  // ==================== SEARCH ====================

  async search(): Promise<void> {
    const query = this.searchQuery().trim();
    if (!query) {
      this.searchResults.set(null);
      return;
    }

    try {
      const results = await firstValueFrom(this.api.searchFiles(this.libraryId(), query));
      this.searchResults.set(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set(null);
  }

  // ==================== FOLDER TREE ====================

  toggleFolderExpand(folderId: string): void {
    const expanded = new Set(this.expandedFolders());
    if (expanded.has(folderId)) {
      expanded.delete(folderId);
    } else {
      expanded.add(folderId);
    }
    this.expandedFolders.set(expanded);
  }

  isFolderExpanded(folderId: string): boolean {
    return this.expandedFolders().has(folderId);
  }

  getChildFolders(parentId: string | null): AssetFolder[] {
    return this.allFolders().filter((f) => f.parentId === parentId);
  }

  getRootFolders(): AssetFolder[] {
    return this.allFolders().filter((f) => f.parentId === null);
  }

  // ==================== VIEW MODE ====================

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  // ==================== HELPERS ====================

  getAssetIcon(type: AssetType): string {
    return getAssetTypeIcon(type);
  }

  getAssetTypeName(type: AssetType): string {
    return getAssetTypeName(type);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
}
