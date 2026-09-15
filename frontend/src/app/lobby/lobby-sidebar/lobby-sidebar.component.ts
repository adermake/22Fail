/**
 * Lobby Sidebar Component
 * 
 * Tabbed sidebar showing Characters and Images.
 * Characters can be dragged onto the grid.
 * Images can be uploaded and managed.
 */

import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { Token, LibraryImage, LibraryTexture, Layer, LayerType } from '../../model/lobby.model';
import { NpcStatblock } from '../../model/npc-statblock.model';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { DiceRollEvent } from '../../services/world-socket.service';
import { LobbyLayerPanelComponent } from '../lobby-layer-panel/lobby-layer-panel.component';

type SidebarTab = 'characters' | 'images' | 'textures' | 'layers';

/** A library NPC statblock; `path` is its file path in the library (folders come from it). */
type NpcEntry = { id: string; name: string; path?: string; statblock: NpcStatblock };

/** Folder of a library file path, like the NPC editor's browser ("/" = root). */
function folderOf(path: string | undefined): string {
  const i = (path || '').lastIndexOf('/');
  return i <= 0 ? '/' : path!.slice(0, i);
}

/**
 * The sidebar is torn down whenever a token is selected (the Aktiv column takes its place), so its
 * state lives in localStorage — otherwise every deselect dropped you back on a collapsed tree.
 */
const TAB_KEY = 'lobby:sidebar-tab';
const SUBTAB_KEY = 'lobby:sidebar-char-subtab';
const NPC_FOLDERS_KEY = 'lobby:sidebar-npc-folders';
const LEVEL_OVERRIDE_KEY = 'lobby:npc-level-override';

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key) as T | null;
    if (value && allowed.includes(value)) return value;
  } catch { /* private mode */ }
  return fallback;
}

function store(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

function readOpenFolders(): Set<string> {
  try {
    const raw = localStorage.getItem(NPC_FOLDERS_KEY);
    if (raw) {
      const paths = JSON.parse(raw) as unknown;
      if (Array.isArray(paths)) return new Set(paths.filter((p): p is string => typeof p === 'string'));
    }
  } catch { /* unreadable or malformed — start collapsed */ }
  return new Set();
}

function readLevelOverride(): number | null {
  try {
    const level = Math.floor(Number(localStorage.getItem(LEVEL_OVERRIDE_KEY)));
    if (Number.isFinite(level) && level > 0) return level;
  } catch { /* private mode */ }
  return null;
}

@Component({
  selector: 'app-lobby-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe, LobbyLayerPanelComponent],
  templateUrl: './lobby-sidebar.component.html',
  styleUrls: ['./lobby-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbySidebarComponent {
  // Inputs
  @Input() characters: { id: string; sheet: CharacterSheet }[] = [];
  @Input() tokensOnMap: Token[] = [];
  @Input() images: LibraryImage[] = [];
  @Input() textures: LibraryTexture[] = [];
  @Input() isGM = false;
  @Input() selectedTextureId: string | null = null;
  @Input() npcStatblocks: NpcEntry[] = [];
  @Input() layers: Layer[] = [];
  @Input() activeLayerId: string | null = null;
  @Input() rolls: DiceRollEvent[] = [];

  // Outputs
  @Output() loadImages = new EventEmitter<FileList>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() renameImage = new EventEmitter<{ id: string; name: string }>();
  @Output() dragStart = new EventEmitter<LibraryImage>();
  @Output() loadTextures = new EventEmitter<FileList>();
  @Output() selectTexture = new EventEmitter<string | null>();
  @Output() npcDragStart = new EventEmitter<{ id: string; name: string; portrait?: string }>();
  @Output() layerSelect = new EventEmitter<string>();
  @Output() layerToggleVisible = new EventEmitter<string>();
  @Output() layerToggleLock = new EventEmitter<string>();
  @Output() layerDelete = new EventEmitter<string>();
  @Output() layerRename = new EventEmitter<{ id: string; name: string }>();
  @Output() layerReorder = new EventEmitter<Layer[]>();
  @Output() layerAdd = new EventEmitter<LayerType>();

  // Local state (tab, sub-tab, open folders and the level override survive a token selection)
  activeTab = signal<SidebarTab>(readStored(TAB_KEY, ['characters', 'images', 'textures', 'layers'] as const, 'characters'));
  charSubTab = signal<'players' | 'npcs'>(readStored(SUBTAB_KEY, ['players', 'npcs'] as const, 'players'));
  editingImageId = signal<string | null>(null);
  editingName = signal('');
  searchQuery = signal('');

  /** Level an NSC gets when dragged onto the map; null = the statblock's own level. */
  levelOverride = signal<number | null>(readLevelOverride());

  // Methods
  switchTab(tab: SidebarTab): void {
    this.activeTab.set(tab);
    store(TAB_KEY, tab);
  }

  switchCharSubTab(tab: 'players' | 'npcs'): void {
    this.charSubTab.set(tab);
    store(SUBTAB_KEY, tab);
  }

  setLevelOverride(value: string): void {
    const level = Math.floor(Number(value));
    const next = Number.isFinite(level) && level > 0 ? level : null;
    this.levelOverride.set(next);
    store(LEVEL_OVERRIDE_KEY, next === null ? '' : String(next));
  }

  getTotalBonus(roll: DiceRollEvent): number {
    return roll.bonuses.reduce((sum, b) => sum + b.value, 0);
  }

  formatTime(timestamp: Date): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (s < 10)  return 'Gerade eben';
    if (s < 60)  return `Vor ${s}s`;
    if (m < 60)  return `Vor ${m}min`;
    return `Vor ${h}h`;
  }

  get displayRolls(): DiceRollEvent[] {
    return this.rolls.slice(0, 50);
  }

  getRollDisplayResult(roll: DiceRollEvent): number {
    return roll.finalDamage ?? roll.result;
  }

  getRollRawResult(roll: DiceRollEvent): number | null {
    if (roll.rawResult !== undefined && roll.stabilitaet && roll.stabilitaet > 0) {
      return roll.rawResult;
    }
    return null;
  }

  // Character methods
  onCharacterDragStart(event: DragEvent, charId: string): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'character',
      characterId: charId
    }));
  }

  onNpcDragStart(event: DragEvent, npc: { id: string; name: string; statblock: NpcStatblock }): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'npc-statblock',
      statblockId: npc.id,
      name: npc.name,
      portrait: npc.statblock.defaultPortrait || '',
      // Level-Override: das abgelegte NSC wird direkt auf diesem Level gewürfelt.
      level: this.levelOverride() ?? undefined,
    }));
    this.npcDragStart.emit({ id: npc.id, name: npc.name, portrait: npc.statblock.defaultPortrait });
  }

  isTokenOnMap(charId: string): boolean {
    return this.tokensOnMap.some(t => t.characterId === charId);
  }

  get filteredCharacters() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.characters;
    return this.characters.filter(c => 
      c.sheet.name?.toLowerCase().includes(query) || 
      c.id.toLowerCase().includes(query)
    );
  }

  get filteredNpcs(): NpcEntry[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.npcStatblocks;
    return this.npcStatblocks.filter(n =>
      n.name.toLowerCase().includes(query) ||
      (n.statblock.raceName ?? '').toLowerCase().includes(query) ||
      (n.path ?? '').toLowerCase().includes(query)
    );
  }

  /** Opened NPC folders (collapsed by default — with 100+ NPCs a flat list is unusable). */
  openNpcFolders = signal<Set<string>>(readOpenFolders());

  /** NPCs grouped by library folder, sorted like the NPC editor's browser. */
  get npcFolders(): { path: string; label: string; npcs: NpcEntry[] }[] {
    const groups = new Map<string, NpcEntry[]>();
    for (const npc of this.filteredNpcs) {
      const dir = folderOf(npc.path);
      (groups.get(dir) ?? groups.set(dir, []).get(dir)!).push(npc);
    }
    return [...groups.entries()]
      .map(([path, npcs]) => ({
        path,
        label: path === '/' ? 'Wurzel' : path.replace(/^\//, ''),
        npcs: npcs.sort((a, b) => a.name.localeCompare(b.name, 'de')),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'de'));
  }

  /** While searching every folder with hits is open; a single folder is always open. */
  isNpcFolderOpen(path: string, folderCount: number): boolean {
    return !!this.searchQuery() || folderCount === 1 || this.openNpcFolders().has(path);
  }

  toggleNpcFolder(path: string): void {
    const next = new Set(this.openNpcFolders());
    if (next.has(path)) next.delete(path);
    else next.add(path);
    this.openNpcFolders.set(next);
    store(NPC_FOLDERS_KEY, JSON.stringify([...next]));
  }

  // Image methods
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loadImages.emit(input.files);
      input.value = ''; // Reset for future uploads
    }
  }

  onImageDragStart(event: DragEvent, image: LibraryImage): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'library-image',
      imageId: image.imageId,
      width: image.width,
      height: image.height
    }));
    this.dragStart.emit(image);
  }

  startRename(image: LibraryImage, event: MouseEvent): void {
    event.stopPropagation();
    this.editingImageId.set(image.id);
    this.editingName.set(image.name);
  }

  saveRename(): void {
    const id = this.editingImageId();
    const name = this.editingName().trim();
    if (id && name) {
      this.renameImage.emit({ id, name });
    }
    this.cancelRename();
  }

  cancelRename(): void {
    this.editingImageId.set(null);
    this.editingName.set('');
  }

  onRenameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveRename();
    } else if (event.key === 'Escape') {
      this.cancelRename();
    }
  }

  confirmDelete(id: string, name: string): void {
    if (confirm(`Delete "${name}"?`)) {
      this.deleteImage.emit(id);
    }
  }

  get filteredImages() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.images;
    return this.images.filter(img => 
      img.name.toLowerCase().includes(query)
    );
  }

  // Texture methods
  onTextureFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loadTextures.emit(input.files);
      input.value = ''; // Reset for future uploads
    }
  }

  onTextureSelect(textureId: string): void {
    if (this.selectedTextureId === textureId) {
      this.selectTexture.emit(null); // Deselect
    } else {
      this.selectTexture.emit(textureId);
    }
  }

  onTextureDragStart(event: DragEvent, texture: any): void {
    event.dataTransfer!.effectAllowed = 'copy';
    event.dataTransfer!.setData('textureId', texture.textureId);
    event.dataTransfer!.setData('textureName', texture.name);
    console.log('[Sidebar] Dragging texture:', texture.name);
  }

  get filteredTextures() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.textures;
    return this.textures.filter(tex => 
      tex.name.toLowerCase().includes(query)
    );
  }
}
