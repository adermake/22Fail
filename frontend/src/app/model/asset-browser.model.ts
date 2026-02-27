/**
 * Asset Browser Models
 * Unity-like asset management system for library content
 */

export type AssetType = 'item' | 'spell' | 'rune' | 'skill' | 'macro' | 'status-effect';

/**
 * Represents a folder in the asset browser
 */
export interface AssetFolder {
  id: string;
  name: string;
  parentId: string | null; // null = root folder
  path: string; // Full path like "/items/weapons/swords"
  createdAt: number;
  updatedAt: number;
}

/**
 * Represents a file/asset in the asset browser
 */
export interface AssetFile {
  id: string;
  name: string;
  type: AssetType;
  folderId: string; // ID of containing folder
  path: string; // Full path like "/items/weapons/swords/excalibur"
  data: any; // The actual content (ItemBlock, SpellBlock, etc.)
  createdAt: number;
  updatedAt: number;
  
  // Optional metadata
  icon?: string; // Custom icon or auto-derived
  tags?: string[];
}

/**
 * Combined view of folder contents
 */
export interface FolderContents {
  folder: AssetFolder | null; // null for root
  subfolders: AssetFolder[];
  files: AssetFile[];
}

/**
 * Clipboard data for copy/cut operations
 */
export interface ClipboardData {
  operation: 'copy' | 'cut';
  items: ClipboardItem[];
  sourceLibraryId: string;
}

export interface ClipboardItem {
  type: 'folder' | 'file';
  id: string;
  path: string;
}

/**
 * Selection state for the asset browser
 */
export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
  selectionType: 'folder' | 'file' | 'mixed' | null;
}

/**
 * Asset browser view modes
 */
export type ViewMode = 'grid' | 'list';

/**
 * Sort options for asset browser
 */
export type SortField = 'name' | 'type' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

/**
 * Get icon for asset type
 */
export function getAssetTypeIcon(type: AssetType): string {
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

/**
 * Get display name for asset type
 */
export function getAssetTypeName(type: AssetType): string {
  switch (type) {
    case 'item': return 'Item';
    case 'spell': return 'Zauber';
    case 'rune': return 'Rune';
    case 'skill': return 'Skill';
    case 'macro': return 'Makro';
    case 'status-effect': return 'Status-Effekt';
    default: return 'Unbekannt';
  }
}

/**
 * Generate unique ID for assets
 */
export function generateAssetId(type: 'folder' | AssetType): string {
  const prefix = type === 'folder' ? 'folder' : type;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create empty folder
 */
export function createEmptyFolder(name: string, parentId: string | null, parentPath: string): AssetFolder {
  const now = Date.now();
  return {
    id: generateAssetId('folder'),
    name,
    parentId,
    path: parentPath === '/' ? `/${name}` : `${parentPath}/${name}`,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Create asset file with data
 */
export function createAssetFile(name: string, type: AssetType, folderId: string, folderPath: string, data: any): AssetFile {
  const now = Date.now();
  return {
    id: generateAssetId(type),
    name,
    type,
    folderId,
    path: folderPath === '/' ? `/${name}` : `${folderPath}/${name}`,
    data: {
      ...data,
      id: data.id || generateAssetId(type)
    },
    createdAt: now,
    updatedAt: now,
    icon: getAssetTypeIcon(type)
  };
}
