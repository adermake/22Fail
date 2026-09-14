import {
  LobbyIndex, applyStructuralOp, findFreeHex, placeAmong, sendCharacterToMap,
} from './lobby-index';

const index = (): LobbyIndex => ({
  activeMapId: 'a',
  mapIndex: [
    { id: 'a', name: 'Dorf', folderId: null, order: 0 },
    { id: 'b', name: 'Wald', folderId: 'f1', order: 0 },
    { id: 'c', name: 'Höhle', folderId: 'f1', order: 1 },
  ],
  mapFolders: [
    { id: 'f1', name: 'Region', parentId: null, order: 0 },
    { id: 'f2', name: 'Dungeons', parentId: 'f1', order: 0 },
  ],
  playerLocations: { hero: 'c' },
});

describe('lobby index', () => {
  it('places an entry before another and renumbers', () => {
    const list = [{ id: 'x', order: 0 }, { id: 'y', order: 1 }, { id: 'z', order: 2 }];
    placeAmong(list, list[2], 'x');
    expect([...list].sort((a, b) => a.order - b.order).map(e => e.id)).toEqual(['z', 'x', 'y']);
  });

  it('moves a map into a folder before a sibling', () => {
    const i = index();
    expect(applyStructuralOp(i, { type: 'moveMap', mapId: 'a', folderId: 'f1', beforeId: 'c' })).toBe(true);
    const inFolder = i.mapIndex.filter(e => e.folderId === 'f1').sort((x, y) => x.order - y.order);
    expect(inFolder.map(e => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('refuses to move a folder into its own subfolder', () => {
    const i = index();
    expect(applyStructuralOp(i, { type: 'moveFolder', folderId: 'f1', parentId: 'f2' })).toBe(false);
    expect(i.mapFolders.find(f => f.id === 'f1')!.parentId).toBeNull();
  });

  it('lifts a deleted folder\'s contents one level up', () => {
    const i = index();
    applyStructuralOp(i, { type: 'deleteFolder', folderId: 'f1' });
    expect(i.mapIndex.find(e => e.id === 'b')!.folderId).toBeNull();
    expect(i.mapFolders.find(f => f.id === 'f2')!.parentId).toBeNull();
  });

  it('never deletes the last map and relocates players off a deleted one', () => {
    const i = index();
    expect(applyStructuralOp(i, { type: 'deleteMap', mapId: 'c' })).toBe(true);
    expect(i.playerLocations['hero']).toBe('a');
    applyStructuralOp(i, { type: 'deleteMap', mapId: 'b' });
    expect(applyStructuralOp(i, { type: 'deleteMap', mapId: 'a' })).toBe(false);
  });

  it('rejects an unsafe background file name', () => {
    const i = index();
    expect(applyStructuralOp(i, { type: 'setBackground', texture: 'x', file: '../secret.json', opacity: 1 })).toBe(false);
    applyStructuralOp(i, { type: 'setBackground', texture: 'paper', file: 'paper-paper.png', opacity: 3 });
    expect(i.background).toEqual({ texture: 'paper', file: 'paper-paper.png', opacity: 1 });
  });
});

describe('sending players', () => {
  it('finds the nearest free hex around the spawn', () => {
    const tokens = [{ position: { q: 0, r: 0 } }];
    const free = findFreeHex(tokens, { q: 0, r: 0 });
    expect(free).not.toEqual({ q: 0, r: 0 });
    expect(Math.abs(free.q) + Math.abs(free.r)).toBeLessThanOrEqual(2);
  });

  it('moves the token with its state to the spawn point', () => {
    const maps: Record<string, any> = {
      from: { tokens: [{ id: 't1', characterId: 'hero', isQuickToken: false, currentHealth: 7, position: { q: 3, r: 3 } }] },
      to: { tokens: [], spawn: { q: 5, r: -2 } },
    };
    expect(sendCharacterToMap(maps, 'from', 'to', 'hero', 'Held').sort()).toEqual(['from', 'to']);
    expect(maps['from'].tokens).toHaveLength(0);
    expect(maps['to'].tokens[0]).toMatchObject({ id: 't1', currentHealth: 7, position: { q: 5, r: -2 } });
  });

  it('leaves a token alone that already stands on the target map', () => {
    const maps: Record<string, any> = {
      to: { tokens: [{ id: 't1', characterId: 'hero', position: { q: 9, r: 9 } }], spawn: { q: 0, r: 0 } },
    };
    expect(sendCharacterToMap(maps, undefined, 'to', 'hero', 'Held')).toEqual([]);
    expect(maps['to'].tokens[0].position).toEqual({ q: 9, r: 9 });
  });

  it('creates a token for a player who had none', () => {
    const maps: Record<string, any> = { to: { spawn: { q: 1, r: 1 } } };
    sendCharacterToMap(maps, undefined, 'to', 'hero', 'Held', () => 'new');
    expect(maps['to'].tokens).toEqual([
      { id: 'new', characterId: 'hero', name: 'Held', team: 'blue', isQuickToken: false, position: { q: 1, r: 1 } },
    ]);
  });
});
