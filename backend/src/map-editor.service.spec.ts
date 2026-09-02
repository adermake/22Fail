/**
 * Map document persistence.
 *
 * This file is the whole world's symbols, labels, regions and settings in one JSON document,
 * and it is rewritten in full after every edit. Losing it loses the map, so the write path is
 * worth holding to its guarantees explicitly:
 *
 *  - a failed write must leave the previous document untouched, never truncated;
 *  - a save requested while one is running must not be dropped;
 *  - shutdown must not return until everything owed is actually on disk.
 *
 * The last two are not hypothetical. An earlier version queued the follow-up write as
 * fire-and-forget, so `onModuleDestroy` resolved while the write carrying the newest edits was
 * still in flight — precisely the loss the hook exists to prevent.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MapEditorService } from './map-editor.service';

describe('MapEditorService — Persistenz', () => {
  let svc: MapEditorService;
  let root: string;

  const mapFile = () =>
    path.join(root, 'worlds', 'Testwelt', 'map-editor', 'map.json');

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'map-editor-spec-'));
    svc = new MapEditorService();
    // The real path points outside the repo; redirect so a test can never touch live data.
    (svc as any).worldsDir = path.join(root, 'worlds');
  });

  afterEach(async () => {
    // Settle any pending write before removing the tree, or the teardown races the writer.
    await svc.onModuleDestroy();
    fs.rmSync(root, { recursive: true, force: true });
  });

  /** Queue a save the way an op does, without waiting for the debounce. */
  const flush = (): void => (svc as any).flush('Testwelt');
  const flushAsync = (): Promise<void> => (svc as any).flushAsync('Testwelt');

  it('schreibt das Dokument auf die Platte', async () => {
    svc.getMap('Testwelt').symbols.push({ id: 's1' });
    await flushAsync();

    const doc = JSON.parse(fs.readFileSync(mapFile(), 'utf-8'));
    expect(doc.symbols.map((s: any) => s.id)).toEqual(['s1']);
  });

  it('schreibt ohne Einrückung', async () => {
    svc.getMap('Testwelt').symbols.push({ id: 's1' });
    await flushAsync();

    // Ein Drittel der Datei wäre sonst Leerzeichen — bei 50k Symbolen 4 MB pro Speichern.
    expect(fs.readFileSync(mapFile(), 'utf-8')).not.toContain('\n  ');
  });

  it('verliert keine Änderung, die während eines laufenden Schreibens ankommt', async () => {
    const doc = svc.getMap('Testwelt');
    doc.symbols.push({ id: 's1' });
    flush(); // Schreiben #1 läuft los

    doc.symbols.push({ id: 's2' }); // Änderung mitten im Schreiben
    flush(); // muss ein zweites Schreiben nach sich ziehen
    flush();

    await svc.onModuleDestroy();

    const written = JSON.parse(fs.readFileSync(mapFile(), 'utf-8'));
    expect(written.symbols.map((s: any) => s.id)).toEqual(['s1', 's2']);
  });

  it('kehrt vom Herunterfahren erst zurück, wenn nichts mehr aussteht', async () => {
    const doc = svc.getMap('Testwelt');
    doc.symbols.push({ id: 's1' });
    flush();
    doc.symbols.push({ id: 's2' });
    flush();

    await svc.onModuleDestroy();

    expect((svc as any).writing.size).toBe(0);
    expect((svc as any).writeAgain.size).toBe(0);
  });

  it('schreibt auch eine nur eingeplante Speicherung beim Herunterfahren noch', async () => {
    const doc = svc.getMap('Testwelt');
    doc.symbols.push({ id: 'spaet' });
    // Wie ein Op: Timer läuft, auf der Platte steht noch nichts.
    (svc as any).scheduleSave('Testwelt');
    expect(fs.existsSync(mapFile())).toBe(false);

    await svc.onModuleDestroy();

    const written = JSON.parse(fs.readFileSync(mapFile(), 'utf-8'));
    expect(written.symbols.map((s: any) => s.id)).toEqual(['spaet']);
  });

  it('lässt das alte Dokument unangetastet, wenn das Schreiben scheitert', async () => {
    svc.getMap('Testwelt').symbols.push({ id: 'gut' });
    await flushAsync();
    const before = fs.readFileSync(mapFile(), 'utf-8');

    // In-place-Schreiben würde hier eine halbe Datei hinterlassen — also die ganze Welt.
    (svc as any).cache.get('Testwelt').kaputt = {
      get boom() {
        throw new Error('serialise failure');
      },
    };
    await flushAsync();

    expect(fs.readFileSync(mapFile(), 'utf-8')).toBe(before);
    expect(fs.existsSync(mapFile() + '.tmp')).toBe(false);
  });

  it('hinterlässt nach einem erfolgreichen Schreiben keine Temp-Datei', async () => {
    svc.getMap('Testwelt').symbols.push({ id: 's1' });
    await flushAsync();

    expect(fs.existsSync(mapFile() + '.tmp')).toBe(false);
  });
});
