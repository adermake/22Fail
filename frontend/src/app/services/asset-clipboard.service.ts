import { Injectable, signal, computed } from '@angular/core';
import { ClipboardData, ClipboardItem } from '../model/asset-browser.model';

/**
 * Clipboard service for copy/cut/paste operations in the asset browser
 */
@Injectable({ providedIn: 'root' })
export class AssetClipboardService {
  // Clipboard state
  private clipboardData = signal<ClipboardData | null>(null);

  // Computed properties
  hasData = computed(() => this.clipboardData() !== null);
  isCut = computed(() => this.clipboardData()?.operation === 'cut');
  isCopy = computed(() => this.clipboardData()?.operation === 'copy');
  itemCount = computed(() => this.clipboardData()?.items.length ?? 0);

  /**
   * Get current clipboard data
   */
  getData(): ClipboardData | null {
    return this.clipboardData();
  }

  /**
   * Copy items to clipboard
   */
  copy(libraryId: string, items: ClipboardItem[]): void {
    this.clipboardData.set({
      operation: 'copy',
      items,
      sourceLibraryId: libraryId
    });
    console.log('[CLIPBOARD] Copied', items.length, 'items');
  }

  /**
   * Cut items to clipboard
   */
  cut(libraryId: string, items: ClipboardItem[]): void {
    this.clipboardData.set({
      operation: 'cut',
      items,
      sourceLibraryId: libraryId
    });
    console.log('[CLIPBOARD] Cut', items.length, 'items');
  }

  /**
   * Clear clipboard
   */
  clear(): void {
    this.clipboardData.set(null);
    console.log('[CLIPBOARD] Cleared');
  }

  /**
   * Check if clipboard has items that can be pasted
   */
  canPaste(): boolean {
    return this.clipboardData() !== null && this.clipboardData()!.items.length > 0;
  }

  /**
   * Get clipboard info for display
   */
  getInfo(): string {
    const data = this.clipboardData();
    if (!data || data.items.length === 0) {
      return '';
    }

    const folderCount = data.items.filter(i => i.type === 'folder').length;
    const fileCount = data.items.filter(i => i.type === 'file').length;
    const parts: string[] = [];

    if (folderCount > 0) {
      parts.push(`${folderCount} Ordner`);
    }
    if (fileCount > 0) {
      parts.push(`${fileCount} Datei${fileCount > 1 ? 'en' : ''}`);
    }

    const operation = data.operation === 'cut' ? 'Ausgeschnitten' : 'Kopiert';
    return `${operation}: ${parts.join(', ')}`;
  }

  /**
   * Extract folder and file IDs from clipboard
   */
  getItemsByType(): { folderIds: string[]; fileIds: string[] } {
    const data = this.clipboardData();
    if (!data) {
      return { folderIds: [], fileIds: [] };
    }

    const folderIds = data.items.filter(i => i.type === 'folder').map(i => i.id);
    const fileIds = data.items.filter(i => i.type === 'file').map(i => i.id);

    return { folderIds, fileIds };
  }
}
