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
import { CommonModule, Location } from '@angular/common';
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
import { 
  ShopEvent, ShopDeal, LootBundleEvent, LootItem, 
  createEmptyShopDeal, Currency 
} from '../model/current-events.model';

// Editor Components
import { ItemEditorComponent } from '../sheet/item-editor/item-editor.component';
import { RuneEditorComponent } from '../shared/rune-editor/rune-editor.component';
import { SpellEditorComponent } from '../shared/spell-editor/spell-editor.component';
import { SkillEditorComponent } from '../shared/skill-editor/skill-editor.component';
import { StatusEffectEditorComponent } from '../shared/status-effect-editor/status-effect-editor.component';
import { MacroEditorComponent } from '../shared/macro-editor/macro-editor.component';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { ImageUrlPipe } from '../shared/image-url.pipe';

/**
 * Library Editor Component
 * 
 * This is the folder-tree file explorer where you EDIT libraries.
 * Unity-like asset browser interface with:
 * - Folder tree navigation
 * - File browser (grid/list views)
 * - Professional editors for all asset types (items, spells, shops, bundles, etc.)
 * - Item selection from library dependencies
 * - Library settings panel with dependency management
 * 
 * Accessed from World's "Asset Browser" → click ✏️ Edit button on a library
 */
@Component({
  selector: 'app-library-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageUrlPipe,
    ItemEditorComponent,
    RuneEditorComponent,
    SpellEditorComponent,
    SkillEditorComponent,
    StatusEffectEditorComponent,
    MacroEditorComponent,
  ],
  templateUrl: './library-editor.component.html',
  styleUrls: ['./library-editor.component.css', './library-editor-shop-bundle-editors.css'],
})
export class LibraryEditorComponent implements OnInit, OnDestroy {
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

  // Library settings state
  showLibrarySettings = signal(false);
  allLibraries = signal<AssetLibrary[]>([]);

  // Shop/Deal editing state
  addingDealToShop = signal<string | null>(null); // shopId currently adding deal to
  dealMode = signal<'sell' | 'buy' | null>(null); // 'sell' = shop sells to player, 'buy' = shop buys from player
  editingDealData = signal<Partial<ShopDeal> | null>(null);
  selectedDealItemType = signal<'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | null>(null);
  selectedDealItemId = signal<string | null>(null);

  // Loot Bundle editing state
  addingLootToBundle = signal<string | null>(null); // bundleId currently adding loot to
  editingLootItemData = signal<Partial<LootItem> | null>(null);
  selectedLootItemType = signal<'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'currency' | null>(null);
  selectedLootItemId = signal<string | null>(null);

  // Drag and drop state
  isDragging = signal(false);
  draggedIds = signal<Set<string>>(new Set());
  dragOverFolderId = signal<string | null>(null);

  // Marquee selection state
  isMarqueeSelecting = signal(false);
  marqueeStart = signal<{ x: number; y: number } | null>(null);
  marqueeEnd = signal<{ x: number; y: number } | null>(null);
  marqueeRect = signal<{ left: number; top: number; width: number; height: number } | null>(null);

  // Dummy sheet for item rendering
  dummySheet: CharacterSheet = createEmptySheet();

  // Tree state for folder tree
  expandedFolders = signal<Set<string>>(new Set(['root']));
  allFolders = signal<AssetFolder[]>([]);

  ngOnInit(): void {
    // Load all libraries for dependency selection
    this.loadAllLibraries();
    
    // Load library ID from route
    this.route.params.subscribe(async (params) => {
      const id = params['libraryId'];
      if (id) {
        this.libraryId.set(id);
        await this.loadLibrary();
        await this.loadDependencyItems(); // Load items from dependencies
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
      // Initialize dependencies array if not present
      if (!library.dependencies) {
        library.dependencies = [];
      }
      this.library.set(library);
      document.title = library.name;
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  }

  async loadAllLibraries(): Promise<void> {
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      this.allLibraries.set(libraries);
    } catch (error) {
      console.error('Failed to load all libraries:', error);
    }
  }

  toggleLibrarySettings(): void {
    this.showLibrarySettings.set(!this.showLibrarySettings());
  }

  async saveLibrarySettings(): Promise<void> {
    const lib = this.library();
    if (!lib) return;

    try {
      const updated = await firstValueFrom(this.api.updateLibrary(lib.id, {
        name: lib.name,
        description: lib.description,
        tags: lib.tags,
        isPublic: lib.isPublic,
        dependencies: lib.dependencies
      }));
      this.library.set(updated);
      await this.loadDependencyItems(); // Reload items when dependencies change
      console.log('Library settings saved successfully');
    } catch (error) {
      console.error('Failed to save library settings:', error);
      alert('Fehler beim Speichern der Bibliothekseinstellungen');
    }
  }

  updateLibraryTags(value: string): void {
    const lib = this.library();
    if (!lib) return;
    lib.tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  // ==================== DEPENDENCY ITEM LOADING ====================

  dependencyLibraries = computed(() => {
    const lib = this.library();
    const allLibs = this.allLibraries();
    if (!lib || !lib.dependencies || lib.dependencies.length === 0) return [];
    return allLibs.filter(l => lib.dependencies!.includes(l.id));
  });

  availableItems = signal<AssetFile[]>([]);
  availableRunes = signal<AssetFile[]>([]);
  availableSpells = signal<AssetFile[]>([]);
  availableSkills = signal<AssetFile[]>([]);
  availableStatusEffects = signal<AssetFile[]>([]);

  async loadDependencyItems(): Promise<void> {
    const lib = this.library();
    if (!lib) return;

    try {
      // Get items from current library and all dependencies
      const libraryIds = [lib.id, ...(lib.dependencies || [])];
      console.log('Loading items from library IDs:', libraryIds);
      
      // Load all item types in parallel
      const [items, runes, spells, skills, statusEffects] = await Promise.all([
        this.loadItemsByType(libraryIds, 'item'),
        this.loadItemsByType(libraryIds, 'rune'),
        this.loadItemsByType(libraryIds, 'spell'),
        this.loadItemsByType(libraryIds, 'skill'),
        this.loadItemsByType(libraryIds, 'status-effect')
      ]);

      console.log('Loaded items:', items.length, 'runes:', runes.length, 'spells:', spells.length, 'skills:', skills.length, 'status effects:', statusEffects.length);
      console.log('Available items sample:', items.slice(0, 3).map(i => ({ id: i.id, name: i.name, data: i.data })));

      this.availableItems.set(items);
      this.availableRunes.set(runes);
      this.availableSpells.set(spells);
      this.availableSkills.set(skills);
      this.availableStatusEffects.set(statusEffects);
    } catch (error) {
      console.error('Failed to load dependency items:', error);
    }
  }

  private async loadItemsByType(libraryIds: string[], type: AssetType): Promise<AssetFile[]> {
    const results: AssetFile[] = [];
    for (const libId of libraryIds) {
      try {
        const files = await firstValueFrom(this.api.searchFiles(libId, '', [type]));
        results.push(...files);
      } catch (error) {
        console.error(`Failed to load ${type} from library ${libId}:`, error);
      }
    }
    return results;
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

  private location = inject(Location);
  
  goBack(): void {
    this.location.back();
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
    const defaultName = 'Neuer Ordner';

    try {
      this.isLoading.set(true);
      const folder = await firstValueFrom(
        this.api.createFolder(this.libraryId(), defaultName, this.currentFolderId())
      );
      await this.loadFolderContents();
      await this.loadAllFolders();
      
      // Auto-start rename mode for new folder so user can immediately type new name
      this.startRename(folder.id);
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      const message = error?.error?.message || error?.message || 'Ordner erstellen fehlgeschlagen';
      alert(message);
    } finally {
      this.isLoading.set(false);
      this.showCreateMenu.set(false);
    }
  }

  async createFile(type: AssetType): Promise<void> {
    const baseName = `Neu ${getAssetTypeName(type)}`;
    const defaultName = this.generateUniqueName(baseName);

    const data = this.getEmptyDataForType(type, defaultName);

    try {
      this.isLoading.set(true);
      const file = await firstValueFrom(
        this.api.createFile(this.libraryId(), defaultName, type, this.currentFolderId(), data)
      );
      await this.loadFolderContents();
      
      // Auto-start rename mode for new file so user can immediately type new name
      this.startRename(file.id);
    } catch (error: any) {
      console.error('Failed to create file:', error);
      const message = error?.error?.message || error?.message || 'Datei erstellen fehlgeschlagen';
      alert(message);
    } finally {
      this.isLoading.set(false);
      this.showCreateMenu.set(false);
    }
  }

  /**
   * Generate unique name by appending number if name already exists
   */
  private generateUniqueName(baseName: string): string {
    const existingFiles = this.files();
    const existingNames = new Set(existingFiles.map(f => f.name.toLowerCase()));
    
    if (!existingNames.has(baseName.toLowerCase())) {
      return baseName;
    }
    
    let counter = 2;
    let uniqueName = `${baseName} ${counter}`;
    while (existingNames.has(uniqueName.toLowerCase())) {
      counter++;
      uniqueName = `${baseName} ${counter}`;
    }
    
    return uniqueName;
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
      case 'shop':
        return {
          id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: 'shop',
          name,
          description: '',
          deals: [],
          claimedDeals: {},
          createdAt: Date.now()
        };
      case 'loot-bundle':
        return {
          id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: 'loot',
          name,
          description: '',
          items: [],
          createdAt: Date.now()
        };
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
    
    // Focus and select the input after Angular renders it
    setTimeout(() => {
      const input = document.querySelector('.rename-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
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
        // Find the file to update its internal name too
        const file = this.files().find((f) => f.id === id);
        if (file) {
          // Update both filename and internal data.name to keep them in sync
          const updatedData = { ...file.data, name: newName };
          await firstValueFrom(this.api.updateFile(this.libraryId(), id, { 
            name: newName,
            data: updatedData 
          }));
        } else {
          // Fallback if file not found in current folder
          await firstValueFrom(this.api.updateFile(this.libraryId(), id, { name: newName }));
        }
      }

      await this.loadFolderContents();
    } catch (error: any) {
      console.error('Rename failed:', error);
      // Show user-friendly error for conflict
      const message = error?.error?.message || error?.message || 'Umbenennen fehlgeschlagen';
      alert(message);
      return; // Don't cancel rename so user can try a different name
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

  async saveEditor(data: any, closeAfterSave: boolean = true): Promise<void> {
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
      if (closeAfterSave) {
        this.closeEditor();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  }

  // ==================== SHOP DEAL MANAGEMENT ====================

  startAddingDealToShop(): void {
    const file = this.editingFile();
    if (!file || file.type !== 'shop') return;
    
    this.addingDealToShop.set(file.id);
    this.dealMode.set(null);
    this.editingDealData.set(null);
    this.selectedDealItemType.set(null);
    this.selectedDealItemId.set(null);
  }

  selectDealMode(mode: 'sell' | 'buy'): void {
    this.dealMode.set(mode);
    
    if (mode === 'buy') {
      // For reverse deals, initialize with empty data
      this.editingDealData.set({
        ...createEmptyShopDeal(),
        isReverseDeal: true,
        name: '',
        reverseDescription: '',
        price: { copper: 0, silver: 0, gold: 0, platinum: 0 }
      });
      this.selectedDealItemType.set(null);
      this.selectedDealItemId.set(null);
    } else {
      // For normal deals, reset to type selection
      this.editingDealData.set(null);
      this.selectedDealItemType.set(null);
      this.selectedDealItemId.set(null);
    }
  }

  selectDealItemType(type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect'): void {
    this.selectedDealItemType.set(type);
    this.selectedDealItemId.set(null);
    
    // Debug: Check what items are available
    console.log(`Selected type: ${type}`, {
      items: this.availableItems().length,
      runes: this.availableRunes().length,
      spells: this.availableSpells().length,
      skills: this.availableSkills().length,
      statusEffects: this.availableStatusEffects().length
    });
    
    switch(type) {
      case 'item':
        console.log('Available items:', this.availableItems().map(i => ({ id: i.id, name: i.name })));
        break;
      case 'spell':
        console.log('Available spells:', this.availableSpells().map(s => ({ id: s.id, name: s.name })));
        break;
      case 'skill':
        console.log('Available skills:', this.availableSkills().map(s => ({ id: s.id, name: s.name })));
        break;
    }
    
    // Initialize deal data with empty price (normal sell deal)
    this.editingDealData.set({
      ...createEmptyShopDeal(),
      isReverseDeal: false,
      name: 'Neuer Deal',
      price: { copper: 0, silver: 0, gold: 0, platinum: 0 }
    });
  }

  selectDealItem(itemFile: AssetFile): void {
    this.selectedDealItemId.set(itemFile.id);
    const deal = this.editingDealData();
    if (!deal) return;

    // Set item data based on type
    const type = this.selectedDealItemType();
    switch (type) {
      case 'item':
        deal.item = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case 'rune':
        deal.rune = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case 'spell':
        deal.spell = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case 'skill':
        deal.skill = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case 'status-effect':
        deal.statusEffect = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
    }
    this.editingDealData.set({ ...deal });
  }

  onDealItemSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex - 1; // -1 for placeholder option
    if (selectedIndex < 0) return;

    const type = this.selectedDealItemType();
    let itemFile: AssetFile | undefined;
    
    switch (type) {
      case 'item':
        itemFile = this.availableItems()[selectedIndex];
        break;
      case 'rune':
        itemFile = this.availableRunes()[selectedIndex];
        break;
      case 'spell':
        itemFile = this.availableSpells()[selectedIndex];
        break;
      case 'skill':
        itemFile = this.availableSkills()[selectedIndex];
        break;
      case 'status-effect':
        itemFile = this.availableStatusEffects()[selectedIndex];
        break;
    }

    if (itemFile) {
      this.selectDealItem(itemFile);
    }
  }

  async saveDealToShop(): Promise<void> {
    const file = this.editingFile();
    const deal = this.editingDealData();
    if (!file || !deal || file.type !== 'shop') return;

    const shopData = file.data as ShopEvent;
    if (!shopData.deals) shopData.deals = [];
    
    // Add final ID if missing
    if (!deal.id) {
      deal.id = `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    shopData.deals.push(deal as ShopDeal);
    
    // Save to backend without closing editor
    await this.saveEditor(shopData, false);
    
    // Reset state
    this.cancelAddingDeal();
  }

  async removeDealFromShop(dealId: string): Promise<void> {
    const file = this.editingFile();
    if (!file || file.type !== 'shop') return;

    const shopData = file.data as ShopEvent;
    shopData.deals = shopData.deals.filter(d => d.id !== dealId);
    
    // Save to backend without closing editor
    await this.saveEditor(shopData, false);
  }

  setAllDealsIdentified(identified: boolean): void {
    const file = this.editingFile();
    if (!file || file.type !== 'shop') return;
    const shopData = file.data as ShopEvent;
    if (!shopData.deals) return;
    shopData.deals.forEach(d => d.identified = identified);
  }

  allDealsIdentified(): boolean {
    const file = this.editingFile();
    if (!file || file.type !== 'shop') return true;
    const shopData = file.data as ShopEvent;
    if (!shopData.deals || shopData.deals.length === 0) return true;
    return shopData.deals.every(d => d.identified !== false);
  }

  cancelAddingDeal(): void {
    this.addingDealToShop.set(null);
    this.dealMode.set(null);
    this.editingDealData.set(null);
    this.selectedDealItemType.set(null);
    this.selectedDealItemId.set(null);
  }

  getDealItemName(deal: ShopDeal): string {
    return deal.item?.name || deal.rune?.name || deal.spell?.name || 
           deal.skill?.name || deal.statusEffect?.name || deal.name;
  }

  getDealItemIcon(deal: ShopDeal): string {
    if (deal.isReverseDeal) return '💰';
    if (deal.item) return getAssetTypeIcon('item');
    if (deal.rune) return getAssetTypeIcon('rune');
    if (deal.spell) return getAssetTypeIcon('spell');
    if (deal.skill) return getAssetTypeIcon('skill');
    if (deal.statusEffect) return getAssetTypeIcon('status-effect');
    return '💼';
  }

  formatCurrency(currency: Currency): string {
    const parts: string[] = [];
    if (currency.platinum > 0) parts.push(`${currency.platinum}p`);
    if (currency.gold > 0) parts.push(`${currency.gold}g`);
    if (currency.silver > 0) parts.push(`${currency.silver}s`);
    if (currency.copper > 0) parts.push(`${currency.copper}c`);
    return parts.length > 0 ? parts.join(' ') : '0c';
  }

  // ==================== LOOT BUNDLE MANAGEMENT ====================

  startAddingLootToBundle(): void {
    const file = this.editingFile();
    if (!file || file.type !== 'loot-bundle') return;
    
    this.addingLootToBundle.set(file.id);
    this.editingLootItemData.set(null);
    this.selectedLootItemType.set(null);
    this.selectedLootItemId.set(null);
  }

  selectLootItemType(type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'currency'): void {
    this.selectedLootItemType.set(type);
    this.selectedLootItemId.set(null);
    
    // Debug: Check what items are available
    console.log(`Selected loot type: ${type}`, {
      items: this.availableItems().length,
      runes: this.availableRunes().length,
      spells: this.availableSpells().length,
      skills: this.availableSkills().length,
      statusEffects: this.availableStatusEffects().length
    });
    
    if (type === 'currency') {
      // Initialize with empty currency
      this.editingLootItemData.set({
        id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'currency',
        data: { copper: 0, silver: 0, gold: 0, platinum: 0 }
      });
    } else {
      this.editingLootItemData.set({
        id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: type
      });
    }
  }

  selectLootItem(itemFile: AssetFile): void {
    this.selectedLootItemId.set(itemFile.id);
    const lootItem = this.editingLootItemData();
    if (!lootItem) return;

    lootItem.data = itemFile.data;
    this.editingLootItemData.set({ ...lootItem });
  }

  onLootItemSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex - 1; // -1 for placeholder option
    if (selectedIndex < 0) return;

    const type = this.selectedLootItemType();
    let itemFile: AssetFile | undefined;
    
    switch (type) {
      case 'item':
        itemFile = this.availableItems()[selectedIndex];
        break;
      case 'rune':
        itemFile = this.availableRunes()[selectedIndex];
        break;
      case 'spell':
        itemFile = this.availableSpells()[selectedIndex];
        break;
      case 'skill':
        itemFile = this.availableSkills()[selectedIndex];
        break;
      case 'status-effect':
        itemFile = this.availableStatusEffects()[selectedIndex];
        break;
    }

    if (itemFile) {
      this.selectLootItem(itemFile);
    }
  }

  async saveLootItemToBundle(): Promise<void> {
    const file = this.editingFile();
    const lootItem = this.editingLootItemData();
    if (!file || !lootItem || file.type !== 'loot-bundle') return;

    const bundleData = file.data as LootBundleEvent;
    if (!bundleData.items) bundleData.items = [];
    
    bundleData.items.push(lootItem as LootItem);
    
    // Save to backend without closing editor
    await this.saveEditor(bundleData, false);
    
    // Reset state
    this.cancelAddingLootItem();
  }

  async removeLootItemFromBundle(lootItemId: string): Promise<void> {
    const file = this.editingFile();
    if (!file || file.type !== 'loot-bundle') return;

    const bundleData = file.data as LootBundleEvent;
    bundleData.items = bundleData.items.filter(i => i.id !== lootItemId);
    
    // Save to backend without closing editor
    await this.saveEditor(bundleData, false);
  }

  cancelAddingLootItem(): void {
    this.addingLootToBundle.set(null);
    this.editingLootItemData.set(null);
    this.selectedLootItemType.set(null);
    this.selectedLootItemId.set(null);
  }

  getLootItemName(lootItem: LootItem): string {
    if (lootItem.type === 'currency') {
      return this.formatCurrency(lootItem.data as Currency);
    }
    return (lootItem.data as any)?.name || 'Unnamed';
  }

  getLootItemIcon(lootItem: LootItem): string {
    switch (lootItem.type) {
      case 'item': return getAssetTypeIcon('item');
      case 'rune': return getAssetTypeIcon('rune');
      case 'spell': return getAssetTypeIcon('spell');
      case 'skill': return getAssetTypeIcon('skill');
      case 'status-effect': return getAssetTypeIcon('status-effect');
      case 'currency': return '💰';
      default: return '❓';
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

  // ==================== DRAG AND DROP ====================

  onDragStart(event: DragEvent, id: string, isFolder: boolean): void {
    // If the item isn't selected, select only this item
    if (!this.selectedIds().has(id)) {
      this.selectedIds.set(new Set([id]));
      this.isSelectionFolder.set(isFolder);
    }

    // Set dragged items
    this.isDragging.set(true);
    this.draggedIds.set(new Set(this.selectedIds()));

    // Set drag data
    const dragData = {
      ids: Array.from(this.selectedIds()),
      isFolder,
      libraryId: this.libraryId()
    };
    event.dataTransfer!.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer!.effectAllowed = 'move';

    // Custom drag image with count
    if (this.selectedIds().size > 1) {
      const dragGhost = document.createElement('div');
      dragGhost.className = 'drag-ghost';
      dragGhost.textContent = `${this.selectedIds().size} Elemente`;
      dragGhost.style.cssText = 'position: absolute; top: -1000px; padding: 8px 16px; background: #0078d4; color: white; border-radius: 4px; font-size: 14px;';
      document.body.appendChild(dragGhost);
      event.dataTransfer!.setDragImage(dragGhost, 0, 0);
      setTimeout(() => dragGhost.remove(), 0);
    }
  }

  onDragEnd(event: DragEvent): void {
    this.isDragging.set(false);
    this.draggedIds.set(new Set());
    this.dragOverFolderId.set(null);
  }

  onDragOver(event: DragEvent, folderId: string): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    
    // Don't allow dropping on itself
    if (!this.draggedIds().has(folderId)) {
      this.dragOverFolderId.set(folderId);
    }
  }

  onDragLeave(event: DragEvent): void {
    this.dragOverFolderId.set(null);
  }

  async onDrop(event: DragEvent, targetFolderId: string): Promise<void> {
    event.preventDefault();
    this.dragOverFolderId.set(null);
    this.isDragging.set(false);

    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    try {
      const dragData = JSON.parse(data);
      const ids: string[] = dragData.ids;
      
      // Don't drop on itself
      if (ids.includes(targetFolderId)) return;

      // Get folder and file IDs
      const folderIds = ids.filter(id => 
        this.subfolders().some(f => f.id === id) || 
        this.allFolders().some(f => f.id === id)
      );
      const fileIds = ids.filter(id => 
        this.files().some(f => f.id === id) ||
        this.searchResults()?.some(f => f.id === id)
      );

      // Move items
      if (folderIds.length > 0 || fileIds.length > 0) {
        this.isLoading.set(true);
        try {
          await firstValueFrom(
            this.api.bulkMove(this.libraryId(), folderIds, fileIds, targetFolderId)
          );
          await this.loadFolderContents();
          await this.loadAllFolders();
          this.clearSelection();
        } catch (error) {
          console.error('Failed to move items:', error);
        } finally {
          this.isLoading.set(false);
        }
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }

  // Handle drop on breadcrumb
  async onBreadcrumbDrop(event: DragEvent, folderId: string): Promise<void> {
    await this.onDrop(event, folderId);
  }

  // Handle drop on tree node
  async onTreeNodeDrop(event: DragEvent, folderId: string): Promise<void> {
    await this.onDrop(event, folderId);
  }

  // ==================== MARQUEE SELECTION ====================

  onContentAreaMouseDown(event: MouseEvent): void {
    // Only start marquee on left click in empty area
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest('.folder-item, .file-item')) return;
    if ((event.target as HTMLElement).closest('.folder-tree')) return;
    if ((event.target as HTMLElement).closest('.content-toolbar')) return;

    const contentArea = (event.target as HTMLElement).closest('.folder-contents');
    if (!contentArea) return;

    const rect = contentArea.getBoundingClientRect();
    const x = event.clientX - rect.left + contentArea.scrollLeft;
    const y = event.clientY - rect.top + contentArea.scrollTop;

    this.isMarqueeSelecting.set(true);
    this.marqueeStart.set({ x, y });
    this.marqueeEnd.set({ x, y });

    // Clear selection unless holding Ctrl
    if (!event.ctrlKey && !event.metaKey) {
      this.clearSelection();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isMarqueeSelecting()) return;

    const contentArea = document.querySelector('.folder-contents');
    if (!contentArea) return;

    const rect = contentArea.getBoundingClientRect();
    const x = Math.max(0, event.clientX - rect.left + contentArea.scrollLeft);
    const y = Math.max(0, event.clientY - rect.top + contentArea.scrollTop);

    this.marqueeEnd.set({ x, y });

    // Calculate marquee rectangle
    const start = this.marqueeStart()!;
    const left = Math.min(start.x, x);
    const top = Math.min(start.y, y);
    const width = Math.abs(x - start.x);
    const height = Math.abs(y - start.y);

    this.marqueeRect.set({ left, top, width, height });

    // Find items within the marquee
    this.updateMarqueeSelection(rect);
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.isMarqueeSelecting()) {
      this.isMarqueeSelecting.set(false);
      this.marqueeRect.set(null);
    }
  }

  private updateMarqueeSelection(contentRect: DOMRect): void {
    const rect = this.marqueeRect();
    if (!rect || (rect.width < 5 && rect.height < 5)) return;

    const contentArea = document.querySelector('.folder-contents');
    if (!contentArea) return;

    const selected = new Set<string>();

    // Check all items (folders and files)
    const items = contentArea.querySelectorAll('[data-id]');
    items.forEach((el) => {
      const id = el.getAttribute('data-id');
      if (id && this.isElementInMarquee(el as HTMLElement, contentArea as HTMLElement, rect)) {
        selected.add(id);
      }
    });

    this.selectedIds.set(selected);
  }

  private isElementInMarquee(el: HTMLElement, container: HTMLElement, rect: { left: number; top: number; width: number; height: number }): boolean {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Element position relative to container
    const elLeft = elRect.left - containerRect.left + container.scrollLeft;
    const elTop = elRect.top - containerRect.top + container.scrollTop;
    const elRight = elLeft + elRect.width;
    const elBottom = elTop + elRect.height;

    // Marquee bounds
    const mRight = rect.left + rect.width;
    const mBottom = rect.top + rect.height;

    // Check intersection
    return !(elRight < rect.left || elLeft > mRight || elBottom < rect.top || elTop > mBottom);
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
