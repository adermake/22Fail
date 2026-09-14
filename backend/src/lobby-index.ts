/**
 * Lobby map index: folders, map order, where each player stands, and moving player tokens between
 * maps.
 *
 * The index lives in `lobby.json`; every map's content lives in its own `maps/<id>/map.json`. A
 * client only ever loads the index plus the one map on screen, which is what keeps a lobby with
 * hundreds of maps fast. These are pure functions over plain objects — `DataService` does the file
 * IO around them, so the rules can be tested without a disk.
 */

export interface LobbyMapIndexEntry {
  id: string;
  name: string;
  folderId: string | null;
  order: number;
}

export interface LobbyMapFolder {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
}

export interface LobbyBackground {
  texture: string;
  file: string;
  opacity: number;
}

export interface LobbyIndex {
  /** Default map: where players without a location stand. */
  activeMapId: string;
  /** The map the GM has open (the world view's GM desk follows it). */
  gmMapId?: string;
  mapIndex: LobbyMapIndexEntry[];
  mapFolders: LobbyMapFolder[];
  /** characterId → mapId. */
  playerLocations: Record<string, string>;
  background?: LobbyBackground;
}

export type LobbyIndexOp =
  | { type: 'createMap'; map: { id: string; name?: string }; folderId: string | null }
  | { type: 'renameMap'; mapId: string; name: string }
  | { type: 'deleteMap'; mapId: string }
  | { type: 'moveMap'; mapId: string; folderId: string | null; beforeId?: string | null }
  | { type: 'createFolder'; folderId: string; name: string; parentId: string | null }
  | { type: 'renameFolder'; folderId: string; name: string }
  | { type: 'moveFolder'; folderId: string; parentId: string | null; beforeId?: string | null }
  | { type: 'deleteFolder'; folderId: string }
  | { type: 'setGmMap'; mapId: string }
  | { type: 'setBackground'; texture: string; file: string; opacity: number }
  | { type: 'sendPlayers'; mapId: string; characterIds: string[]; makeDefault?: boolean };

/** Fields of lobby.json the server owns; a client's full-lobby save must never overwrite them. */
export const LOBBY_INDEX_KEYS = [
  'activeMapId', 'gmMapId', 'mapIndex', 'mapFolders', 'playerLocations', 'background',
] as const;

export function generateLobbyId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/** Re-number `siblings` in display order with `moved` placed before `beforeId` (or last). */
export function placeAmong<T extends { id: string; order: number }>(
  siblings: T[], moved: T, beforeId?: string | null,
): void {
  const rest = siblings.filter(s => s.id !== moved.id).sort((a, b) => a.order - b.order);
  const at = beforeId ? rest.findIndex(s => s.id === beforeId) : -1;
  rest.splice(at >= 0 ? at : rest.length, 0, moved);
  rest.forEach((s, i) => (s.order = i));
}

/** Would making `candidateParentId` the parent of `folderId` create a cycle? */
export function isInsideFolder(
  folders: readonly LobbyMapFolder[], folderId: string, candidateParentId: string | null,
): boolean {
  let current = candidateParentId;
  const seen = new Set<string>();
  while (current) {
    if (current === folderId) return true;
    if (seen.has(current)) return false;
    seen.add(current);
    current = folders.find(f => f.id === current)?.parentId ?? null;
  }
  return false;
}

const cleanName = (name: unknown): string => String(name ?? '').trim().slice(0, 120);

/**
 * Apply one structural op (everything except the map-file work of createMap and the token moves of
 * sendPlayers, which `DataService` does around it). Returns whether the index changed.
 */
export function applyStructuralOp(index: LobbyIndex, op: LobbyIndexOp): boolean {
  const folderExists = (id: string | null | undefined): boolean =>
    !id || index.mapFolders.some(f => f.id === id);
  const mapExists = (id: string): boolean => index.mapIndex.some(e => e.id === id);

  switch (op.type) {
    case 'createMap': {
      if (!op.map?.id || mapExists(op.map.id)) return false;
      const folderId = folderExists(op.folderId) ? op.folderId ?? null : null;
      const entry: LobbyMapIndexEntry = {
        id: op.map.id, name: cleanName(op.map.name) || 'Neue Karte', folderId, order: 0,
      };
      index.mapIndex.push(entry);
      placeAmong(index.mapIndex.filter(e => e.folderId === folderId), entry, null);
      return true;
    }
    case 'renameMap': {
      const entry = index.mapIndex.find(e => e.id === op.mapId);
      const name = cleanName(op.name);
      if (!entry || !name || entry.name === name) return false;
      entry.name = name;
      return true;
    }
    case 'deleteMap': {
      if (index.mapIndex.length <= 1 || !mapExists(op.mapId)) return false;
      index.mapIndex = index.mapIndex.filter(e => e.id !== op.mapId);
      const fallback = index.activeMapId !== op.mapId && mapExists(index.activeMapId)
        ? index.activeMapId
        : index.mapIndex[0].id;
      if (index.activeMapId === op.mapId) index.activeMapId = fallback;
      if (index.gmMapId === op.mapId) index.gmMapId = fallback;
      for (const [characterId, mapId] of Object.entries(index.playerLocations)) {
        if (mapId === op.mapId) index.playerLocations[characterId] = fallback;
      }
      return true;
    }
    case 'moveMap': {
      const entry = index.mapIndex.find(e => e.id === op.mapId);
      if (!entry || !folderExists(op.folderId)) return false;
      entry.folderId = op.folderId ?? null;
      placeAmong(index.mapIndex.filter(e => e.folderId === entry.folderId), entry, op.beforeId);
      return true;
    }
    case 'createFolder': {
      if (!op.folderId || index.mapFolders.some(f => f.id === op.folderId)) return false;
      const parentId = folderExists(op.parentId) ? op.parentId ?? null : null;
      const folder: LobbyMapFolder = {
        id: op.folderId, name: cleanName(op.name) || 'Neuer Ordner', parentId, order: 0,
      };
      index.mapFolders.push(folder);
      placeAmong(index.mapFolders.filter(f => f.parentId === parentId), folder, null);
      return true;
    }
    case 'renameFolder': {
      const folder = index.mapFolders.find(f => f.id === op.folderId);
      const name = cleanName(op.name);
      if (!folder || !name || folder.name === name) return false;
      folder.name = name;
      return true;
    }
    case 'moveFolder': {
      const folder = index.mapFolders.find(f => f.id === op.folderId);
      if (!folder || !folderExists(op.parentId)) return false;
      if (op.parentId === folder.id || isInsideFolder(index.mapFolders, folder.id, op.parentId ?? null)) {
        return false;
      }
      folder.parentId = op.parentId ?? null;
      placeAmong(index.mapFolders.filter(f => f.parentId === folder.parentId), folder, op.beforeId);
      return true;
    }
    case 'deleteFolder': {
      const folder = index.mapFolders.find(f => f.id === op.folderId);
      if (!folder) return false;
      // Nothing is lost: whatever was inside moves up one level.
      for (const child of index.mapFolders) if (child.parentId === folder.id) child.parentId = folder.parentId;
      for (const entry of index.mapIndex) if (entry.folderId === folder.id) entry.folderId = folder.parentId;
      index.mapFolders = index.mapFolders.filter(f => f.id !== folder.id);
      return true;
    }
    case 'setGmMap': {
      if (!mapExists(op.mapId) || index.gmMapId === op.mapId) return false;
      index.gmMapId = op.mapId;
      return true;
    }
    case 'setBackground': {
      const texture = String(op.texture ?? '').trim();
      const file = String(op.file ?? '').trim();
      if (!texture || !/^[\w.-]+\.(png|jpe?g|webp)$/i.test(file)) {
        if (!index.background) return false;
        delete index.background;
        return true;
      }
      const opacity = Math.max(0, Math.min(1, Number(op.opacity) || 0));
      index.background = { texture, file, opacity };
      return true;
    }
    default:
      return false;
  }
}

// ─── Player tokens ───────────────────────────────────────────────────────────

const HEX_DIRECTIONS: [number, number][] = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

/** Nearest hex to `start` (breadth-first over neighbours) that no token stands on. */
export function findFreeHex(
  tokens: readonly { position?: { q: number; r: number } }[], start: { q: number; r: number },
): { q: number; r: number } {
  const key = (h: { q: number; r: number }) => `${h.q},${h.r}`;
  const taken = new Set(tokens.filter(t => t.position).map(t => key(t.position!)));
  const queue = [start];
  const seen = new Set([key(start)]);
  while (queue.length && seen.size < 10000) {
    const hex = queue.shift()!;
    if (!taken.has(key(hex))) return hex;
    for (const [dq, dr] of HEX_DIRECTIONS) {
      const next = { q: hex.q + dq, r: hex.r + dr };
      if (!seen.has(key(next))) {
        seen.add(key(next));
        queue.push(next);
      }
    }
  }
  return start;
}

/**
 * Send one player character to `toMapId`. Its token leaves the map it stood on and appears on the
 * nearest free hex to the target's spawn point — keeping HP, status effects and everything else it
 * carried. A token already on the target map stays where it is. Returns the ids of changed maps.
 */
export function sendCharacterToMap(
  maps: Record<string, any>, fromMapId: string | undefined, toMapId: string,
  characterId: string, fallbackName: string, newId: () => string = generateLobbyId,
): string[] {
  const changed: string[] = [];
  const target = maps[toMapId];
  if (!target) return changed;
  target.tokens ??= [];
  const isPlayerToken = (t: any) => t?.characterId === characterId && !t.isQuickToken;

  let carried: any = null;
  const source = fromMapId && fromMapId !== toMapId ? maps[fromMapId] : null;
  if (source) {
    source.tokens ??= [];
    const at = source.tokens.findIndex(isPlayerToken);
    if (at >= 0) {
      carried = source.tokens[at];
      source.tokens.splice(at, 1);
      changed.push(fromMapId!);
    }
  }

  if (!target.tokens.some(isPlayerToken)) {
    const position = findFreeHex(target.tokens, target.spawn ?? { q: 0, r: 0 });
    const base = carried ?? { characterId, name: fallbackName, team: 'blue', isQuickToken: false };
    // Links to tokens that stayed on the old map mean nothing here.
    const { parentTokenId, linkedTokenType, linkedOffset, linkedDistance, ...rest } = base;
    void parentTokenId; void linkedTokenType; void linkedOffset; void linkedDistance;
    target.tokens.push({ ...rest, id: carried?.id ?? newId(), position });
    changed.push(toMapId);
  }
  return changed;
}
