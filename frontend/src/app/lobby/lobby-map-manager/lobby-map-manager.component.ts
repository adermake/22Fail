import {
  AfterViewInit, ChangeDetectionStrategy, Component, Directive, ElementRef, HostListener, Input,
  computed, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LobbyStoreService } from '../../services/lobby-store.service';
import { LobbyMapFolder, LobbyMapIndexEntry } from '../../model/lobby.model';
import { ImageUrlPipe } from '../../shared/image-url.pipe';

export interface MapManagerPlayer {
  id: string;
  name: string;
  portrait?: string;
}

type FolderRow = { kind: 'folder'; key: string; id: string; name: string; depth: number; count: number; open: boolean };
type MapRow = {
  kind: 'map'; key: string; id: string; name: string; depth: number;
  folderLabel: string; players: MapManagerPlayer[]; isDefault: boolean;
};
type Row = FolderRow | MapRow;

const COLLAPSED_KEY = 'lobby:map-folders-collapsed';

/** Focus and select an input as soon as it appears (inline rename). */
@Directive({ selector: '[lmmAutofocus]', standalone: true })
export class LmmAutofocusDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLInputElement>);
  ngAfterViewInit(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.focus();
    input.select();
  }
}

/**
 * Karten-Verwaltung (GM, rechtes Panel ohne Token-Auswahl): Ordner und Karten als Baum, ziehen zum
 * Verschieben, Doppelklick öffnet, Rechtsklick schickt Spieler hin. Karten mit Spielern leuchten
 * und zeigen deren Porträts.
 *
 * Liest nur den Karten-Index — bei 300 Karten sind das ein paar Kilobyte, keine Karteninhalte.
 */
@Component({
  selector: 'app-lobby-map-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe, LmmAutofocusDirective],
  templateUrl: './lobby-map-manager.component.html',
  styleUrl: './lobby-map-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyMapManagerComponent {
  private store = inject(LobbyStoreService);
  private lobby = toSignal(this.store.lobby$, { initialValue: null });

  @Input() set players(value: MapManagerPlayer[]) { this.playerList.set(value ?? []); }
  @Input() set currentMapId(value: string) { this.currentMap.set(value ?? ''); }

  readonly playerList = signal<MapManagerPlayer[]>([]);
  readonly currentMap = signal('');
  readonly query = signal('');
  readonly collapsed = signal<Set<string>>(readCollapsed());
  /** Row key being renamed ("map:<id>" / "folder:<id>"). */
  readonly renaming = signal<string | null>(null);
  readonly dropKey = signal<string | null>(null);
  readonly menu = signal<{ x: number; y: number; kind: 'map' | 'folder' | 'root'; id: string } | null>(null);
  readonly placingSpawn = this.store.placingSpawn;
  private drag: { kind: 'map' | 'folder'; id: string } | null = null;

  readonly mapCount = computed(() => this.lobby()?.mapIndex?.length ?? 0);

  /** Players per map; a player without a location stands on the default map. */
  private readonly playersByMap = computed(() => {
    const lobby = this.lobby();
    const byMap = new Map<string, MapManagerPlayer[]>();
    if (!lobby) return byMap;
    const locations = lobby.playerLocations ?? {};
    const known = new Set((lobby.mapIndex ?? []).map(m => m.id));
    for (const player of this.playerList()) {
      const located = locations[player.id];
      const mapId = located && known.has(located) ? located : lobby.activeMapId;
      (byMap.get(mapId) ?? byMap.set(mapId, []).get(mapId)!).push(player);
    }
    return byMap;
  });

  /** The tree flattened into rows (folders first per level); a search lists matching maps flat. */
  readonly rows = computed<Row[]>(() => {
    const lobby = this.lobby();
    if (!lobby) return [];
    const maps = lobby.mapIndex ?? [];
    const folders = lobby.mapFolders ?? [];
    const byMap = this.playersByMap();
    const folderIds = new Set(folders.map(f => f.id));
    const parentOf = (id: string | null) => (id && folderIds.has(id) ? id : null);
    const byOrder = (a: { order: number; name: string }, b: { order: number; name: string }) =>
      (a.order - b.order) || a.name.localeCompare(b.name, 'de');

    const mapRow = (m: LobbyMapIndexEntry, depth: number, folderLabel = ''): MapRow => ({
      kind: 'map', key: 'map:' + m.id, id: m.id, name: m.name, depth, folderLabel,
      players: byMap.get(m.id) ?? [], isDefault: m.id === lobby.activeMapId,
    });

    const q = this.query().trim().toLowerCase();
    if (q) {
      const path = (folderId: string | null): string => {
        const names: string[] = [];
        const seen = new Set<string>();
        let current = parentOf(folderId);
        while (current && !seen.has(current)) {
          seen.add(current);
          const folder = folders.find(f => f.id === current);
          if (!folder) break;
          names.unshift(folder.name);
          current = parentOf(folder.parentId);
        }
        return names.join(' / ');
      };
      return maps
        .filter(m => m.name.toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name, 'de'))
        .map(m => mapRow(m, 0, path(m.folderId)));
    }

    const childFolders = new Map<string | null, LobbyMapFolder[]>();
    for (const f of folders) {
      const key = f.parentId !== f.id ? parentOf(f.parentId) : null;
      (childFolders.get(key) ?? childFolders.set(key, []).get(key)!).push(f);
    }
    const childMaps = new Map<string | null, LobbyMapIndexEntry[]>();
    for (const m of maps) {
      const key = parentOf(m.folderId);
      (childMaps.get(key) ?? childMaps.set(key, []).get(key)!).push(m);
    }
    childFolders.forEach(list => list.sort(byOrder));
    childMaps.forEach(list => list.sort(byOrder));

    const counts = new Map<string, number>();
    const countIn = (folderId: string, seen: Set<string>): number => {
      if (counts.has(folderId)) return counts.get(folderId)!;
      if (seen.has(folderId)) return 0;
      seen.add(folderId);
      const total = (childMaps.get(folderId)?.length ?? 0)
        + (childFolders.get(folderId) ?? []).reduce((sum, f) => sum + countIn(f.id, seen), 0);
      counts.set(folderId, total);
      return total;
    };

    const collapsed = this.collapsed();
    const out: Row[] = [];
    const visited = new Set<string>();
    const walk = (parentId: string | null, depth: number) => {
      for (const f of childFolders.get(parentId) ?? []) {
        if (visited.has(f.id)) continue; // a broken cycle must not hang the panel
        visited.add(f.id);
        const open = !collapsed.has(f.id);
        out.push({
          kind: 'folder', key: 'folder:' + f.id, id: f.id, name: f.name, depth,
          count: countIn(f.id, new Set()), open,
        });
        if (open) walk(f.id, depth + 1);
      }
      for (const m of childMaps.get(parentId) ?? []) out.push(mapRow(m, depth));
    };
    walk(null, 0);
    return out;
  });

  mapName(id: string): string {
    return this.lobby()?.mapIndex?.find(m => m.id === id)?.name ?? '';
  }

  folderName(id: string): string {
    return this.lobby()?.mapFolders?.find(f => f.id === id)?.name ?? '';
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  open(mapId: string): void {
    this.menu.set(null);
    void this.store.openMapAsGm(mapId);
  }

  toggleFolder(folderId: string): void {
    const next = new Set(this.collapsed());
    if (next.has(folderId)) next.delete(folderId);
    else next.add(folderId);
    this.setCollapsed(next);
  }

  private expand(folderId: string | null): void {
    if (!folderId || !this.collapsed().has(folderId)) return;
    const next = new Set(this.collapsed());
    next.delete(folderId);
    this.setCollapsed(next);
  }

  private setCollapsed(next: Set<string>): void {
    this.collapsed.set(next);
    try { localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next])); } catch { /* private mode */ }
  }

  newMap(folderId: string | null): void {
    this.menu.set(null);
    this.query.set('');
    this.expand(folderId);
    const id = this.store.createMap('Neue Karte', folderId);
    this.renaming.set('map:' + id);
  }

  newFolder(parentId: string | null): void {
    this.menu.set(null);
    this.query.set('');
    this.expand(parentId);
    const id = this.store.createFolder('Neuer Ordner', parentId);
    this.renaming.set('folder:' + id);
  }

  startRename(key: string): void {
    this.menu.set(null);
    this.renaming.set(key);
  }

  commitRename(row: Row, value: string): void {
    if (this.renaming() !== row.key) return; // already cancelled
    this.renaming.set(null);
    const name = value.trim();
    if (!name || name === row.name) return;
    if (row.kind === 'map') this.store.renameMap(row.id, name);
    else this.store.renameFolder(row.id, name);
  }

  cancelRename(): void {
    this.renaming.set(null);
  }

  remove(kind: 'map' | 'folder', id: string): void {
    this.menu.set(null);
    if (kind === 'map') {
      if (this.mapCount() <= 1) {
        alert('Die letzte Karte kann nicht gelöscht werden.');
        return;
      }
      if (confirm(`Karte „${this.mapName(id)}" löschen? Spieler auf dieser Karte landen auf der Standardkarte.`)) {
        this.store.deleteMap(id);
      }
    } else if (confirm(`Ordner „${this.folderName(id)}" löschen? Karten und Unterordner wandern eine Ebene höher.`)) {
      this.store.deleteFolder(id);
    }
  }

  sendAll(mapId: string): void {
    this.menu.set(null);
    this.store.sendPlayers(mapId, this.playerList().map(p => p.id), true);
  }

  sendOne(mapId: string, characterId: string): void {
    this.menu.set(null);
    this.store.sendPlayers(mapId, [characterId]);
  }

  async placeSpawn(mapId: string): Promise<void> {
    this.menu.set(null);
    if (mapId !== this.currentMap()) await this.store.openMapAsGm(mapId);
    this.store.placingSpawn.set(true);
  }

  openMenu(event: MouseEvent, kind: 'map' | 'folder' | 'root', id: string): void {
    event.preventDefault();
    event.stopPropagation();
    const height = kind === 'map' ? 240 + this.playerList().length * 30 : 160;
    this.menu.set({
      kind, id,
      x: Math.min(event.clientX, window.innerWidth - 240),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - height)),
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menu.set(null);
    this.placingSpawn.set(false);
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  onDragStart(event: DragEvent, row: Row): void {
    this.drag = { kind: row.kind, id: row.id };
    event.dataTransfer?.setData('text/plain', `lobby-map:${row.kind}:${row.id}`);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent, key: string): void {
    if (!this.drag) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.dropKey() !== key) this.dropKey.set(key);
  }

  onDragEnd(): void {
    this.drag = null;
    this.dropKey.set(null);
  }

  /** Onto a folder: into it. Onto a map: next to it, before it. Onto empty space: top level. */
  onDrop(event: DragEvent, target: Row | null): void {
    event.preventDefault();
    event.stopPropagation();
    const drag = this.drag;
    this.onDragEnd();
    if (!drag) return;

    if (!target) {
      if (drag.kind === 'map') this.store.moveMap(drag.id, null);
      else this.store.moveFolder(drag.id, null);
      return;
    }
    if (target.kind === 'folder') {
      if (drag.kind === 'map') this.store.moveMap(drag.id, target.id);
      else if (drag.id !== target.id) this.store.moveFolder(drag.id, target.id);
      this.expand(target.id);
      return;
    }
    const entry = this.lobby()?.mapIndex?.find(m => m.id === target.id);
    if (!entry) return;
    if (drag.kind === 'map') {
      if (drag.id !== target.id) this.store.moveMap(drag.id, entry.folderId, target.id);
    } else {
      this.store.moveFolder(drag.id, entry.folderId);
    }
  }
}

function readCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
