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

  describe('Chunk-Liste (maßgeblich für Bulk-Löschungen)', () => {
    /*
     * Warum das eine eigene Route ist: der Client entschied früher aus seiner *eigenen* Kopie
     * von `chunkVersions`, ob in einer Kachel etwas liegt. Diese Kopie ist ein Cache und kann
     * Einträge verlieren — dann wurde das Radieren übersprungen, die alten Pixel blieben
     * liegen, und der nächste Stempel veröffentlichte sie wieder. Ein Quadrat gelöschter
     * Karte kam zurück. Hier auf dem Server ist die Liste mit der Platte abgeglichen.
     */
    const write = (layer: any, tier: any, cx: number, cy: number) =>
      svc.writeChunk('Testwelt', layer, tier, cx, cy, Buffer.from([1, 2, 3]));

    it('nennt nur Kacheln, die es wirklich gibt', async () => {
      await write('landColor', 'med', 2, 2);
      await write('landColor', 'med', 9, 9);

      const cells = svc.listChunks('Testwelt', 'landColor', 'med', 0, 0, 5, 5);
      expect(cells).toEqual([[2, 2]]);
    });

    it('trennt Layer und Stufe', async () => {
      await write('landColor', 'med', 1, 1);
      await write('height', 'med', 1, 1);
      await write('landColor', 'low', 1, 1);

      expect(svc.listChunks('Testwelt', 'landColor', 'med', 0, 0, 3, 3)).toEqual([[1, 1]]);
      expect(svc.listChunks('Testwelt', 'height', 'med', 0, 0, 3, 3)).toEqual([[1, 1]]);
      expect(svc.listChunks('Testwelt', 'waterColor', 'med', 0, 0, 3, 3)).toEqual([]);
    });

    it('funktioniert bei negativen Koordinaten', async () => {
      await write('height', 'high', -3, -2);
      expect(svc.listChunks('Testwelt', 'height', 'high', -5, -5, 0, 0)).toEqual([[-3, -2]]);
      expect(svc.listChunks('Testwelt', 'height', 'high', 0, 0, 5, 5)).toEqual([]);
    });

    it('meldet nach dem Löschen nichts mehr', async () => {
      await write('landColor', 'low', 0, 0);
      expect(svc.listChunks('Testwelt', 'landColor', 'low', 0, 0, 1, 1)).toHaveLength(1);

      svc.clearChunks('Testwelt', 'landColor', 'low', 0, 0, 1, 1);
      expect(svc.listChunks('Testwelt', 'landColor', 'low', 0, 0, 1, 1)).toEqual([]);
    });
  });

  describe('Chunk-Versionen (Cache-Schlüssel)', () => {
    /*
     * Die Chunk-Route wird mit `immutable, max-age=1 Jahr` ausgeliefert, und der Cache-Schlüssel
     * ist die Version in `?v=`. Eine *wiederverwendete* Version heißt deshalb: der Browser
     * beantwortet einen neuen Chunk mit Bytes, die er für einen alten gespeichert hat — alte
     * Karte taucht ohne jedes Zutun wieder auf, und auf dem Server ist nichts davon zu sehen.
     *
     * Genau das passierte: `writeChunk` zählte `vorher + 1`, was nach einem `clearChunks`
     * (löscht den Eintrag) wieder bei 1 beginnt, und der Platten-Scan vergab pauschal `1`.
     */
    const write = (layer: any, tier: any, cx: number, cy: number) =>
      svc.writeChunk('Testwelt', layer, tier, cx, cy, Buffer.from([1, 2, 3]));

    it('vergibt nach dem Löschen keine schon benutzte Version erneut', async () => {
      const first = await write('landColor', 'med', 1, -1);
      svc.clearChunks('Testwelt', 'landColor', 'med', 1, -1, 1, -1);
      const second = await write('landColor', 'med', 1, -1);

      expect(first).toBeGreaterThan(0);
      expect(second).toBeGreaterThan(first!);
    });

    it('zählt auch ohne Löschen streng aufwärts', async () => {
      const a = await write('height', 'low', 0, 0);
      const b = await write('height', 'low', 0, 0);
      expect(b).toBeGreaterThan(a!);
    });

    it('gibt einem neu eingelesenen Chunk keine 1, sondern seine mtime', async () => {
      await write('height', 'high', 2, 2);
      // Frisch einlesen, als wäre der Server neu gestartet.
      (svc as any).cache.clear();

      const versions = svc.getMap('Testwelt').chunkVersions as Record<string, number>;
      expect(versions['height/high/2/2']).toBeGreaterThan(1e12);
    });

    it('hebt eine alte Zähler-Version beim Laden auf die mtime an', async () => {
      /*
       * Der Heilpfad für bereits vergiftete Karten: ein Dokument aus der Zähler-Zeit hält
       * kleine Zahlen, und genau auf die ist ein ein Jahr altes Cache-Eintrag geschlüsselt.
       * Einmal anheben ändert die URL und umgeht ihn.
       */
      await write('landColor', 'low', 3, 3);
      const doc = svc.getMap('Testwelt');
      doc.chunkVersions['landColor/low/3/3'] = 2; // wie früher gespeichert
      await (svc as any).flushAsync('Testwelt');
      (svc as any).cache.clear();

      const versions = svc.getMap('Testwelt').chunkVersions as Record<string, number>;
      expect(versions['landColor/low/3/3']).toBeGreaterThan(1e12);
    });
  });
});
