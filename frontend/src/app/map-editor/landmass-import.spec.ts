import {
  IMPORT_CELL_WARN,
  LandmassPlacement,
  LandmassSource,
  MAX_MASK_TEXELS,
  applyThreshold,
  cellsCovering,
  edgeCells,
  fitScale,
  importCellCount,
  innerCellRect,
  maskResolution,
  placementBounds,
  recommendedTier,
  worldPerTexel,
} from './landmass-import';
import { TIER_WORLD_SIZE } from './map-editor.model';
import { Bounds } from './map-camera';

/** A stand-in source; only the dimensions matter to the sizing rules. */
const source = (width: number, height: number): LandmassSource => ({
  bitmap: null as unknown as ImageBitmap,
  width,
  height,
  fileName: 'karte.png',
});

const at = (x: number, y: number, scale: number): LandmassPlacement => ({ x, y, scale });

/** Minimal ImageData stand-in — the browser class is not available under jsdom's canvas. */
const imageData = (pixels: number[][]): ImageData => {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach((px, i) => data.set(px, i * 4));
  return { data, width: pixels.length, height: 1, colorSpace: 'srgb' } as ImageData;
};

const blank = (count: number): ImageData =>
  imageData(Array.from({ length: count }, () => [0, 0, 0, 0]));

describe('Landmassen-Import', () => {
  describe('Platzierung', () => {
    it('zentriert das Bild auf der angegebenen Position', () => {
      const b = placementBounds(source(100, 50), at(1000, 2000, 4));
      expect(b).toEqual({ minX: 800, minY: 1900, maxX: 1200, maxY: 2100 });
    });

    it('passt das Bild in die Ansicht, ohne es zu beschneiden', () => {
      const view = { minX: 0, minY: 0, maxX: 800, maxY: 400 };
      // Die Höhe ist der engere Zwang: 400/50 < 800/100.
      expect(fitScale(source(100, 50), view)).toBe(8);
    });
  });

  describe('Kachelzahl', () => {
    it('zählt jede berührte Kachel, auch bei negativen Koordinaten', () => {
      const span = TIER_WORLD_SIZE.high;
      const bounds = { minX: -span * 0.5, minY: 0, maxX: span * 1.5, maxY: span };
      // Spalten -1, 0, 1 in einer Zeile.
      expect(cellsCovering(bounds, 'high')).toHaveLength(3);
    });

    it('zählt die gröberen Stufen mit, die derselbe Stempel schreibt', () => {
      const span = TIER_WORLD_SIZE.high;
      const bounds = { minX: 0, minY: 0, maxX: span * 2, maxY: span * 2 };

      // 4 high-Kacheln, dazu je eine med und eine low unter derselben Fläche.
      expect(importCellCount(bounds, 'high')).toBe(6);
      expect(importCellCount(bounds, 'low')).toBe(1);
    });
  });

  describe('empfohlene Detailstufe', () => {
    it('geht nicht feiner als das Quellbild auflöst', () => {
      // Ein Bildpunkt deckt 64 Weltpixel — feiner als `med` (16 px/Texel) wäre reine
      // Interpolation, `high` (2 px/Texel) erst recht.
      const tier = recommendedTier(source(200, 200), at(0, 0, 64));
      expect(worldPerTexel(tier) * 2).toBeGreaterThanOrEqual(64);
    });

    it('bleibt unter der Kachelgrenze, auch wenn das Bild fein genug wäre', () => {
      // Ein riesiges, sehr scharfes Bild: `high` löste es auf, kostet aber Zehntausende
      // Kacheln, also muss die Empfehlung gröber ausfallen.
      const src = source(20000, 20000);
      const placement = at(0, 0, 2);
      const tier = recommendedTier(src, placement);

      expect(importCellCount(placementBounds(src, placement), tier)).toBeLessThanOrEqual(
        IMPORT_CELL_WARN,
      );
    });
  });

  describe('Arbeitsauflösung der Masken', () => {
    it('skaliert ein überfeines Bild auf die Texeldichte der Zielstufe herunter', () => {
      const res = maskResolution(
        { threshold: 0.5, withColor: true, worldPerTexel: worldPerTexel('low'), worldWidth: 65536 },
        8000,
        4000,
      );
      // 65536 Weltpixel / 128 px pro Texel = 512 Texel, doppelt für sauberes Filtern.
      expect(res.w).toBe(1024);
      // Das Seitenverhältnis bleibt erhalten.
      expect(res.h).toBe(512);
    });

    it('vergrößert ein kleines Bild nicht', () => {
      const res = maskResolution(
        { threshold: 0.5, withColor: true, worldPerTexel: worldPerTexel('high'), worldWidth: 1e9 },
        300,
        200,
      );
      expect(res).toEqual({ w: 300, h: 200 });
    });

    it('deckelt riesige Quellen, damit der Arbeitspuffer endlich bleibt', () => {
      const res = maskResolution(
        { threshold: 0.5, withColor: true, worldPerTexel: worldPerTexel('high'), worldWidth: 1e9 },
        40000,
        20000,
      );
      expect(Math.max(res.w, res.h)).toBe(MAX_MASK_TEXELS);
    });
  });

  describe('Ersetzen: Innenbereich und Randkacheln', () => {
    /*
     * Der Bereich zerfällt in zwei Sorten Kacheln, und beide müssen behandelt werden.
     * Ganz innenliegende lassen sich als Datei löschen; angeschnittene halten auch Karte
     * *außerhalb* und müssen echt ausradiert werden.
     *
     * Sie zu überspringen war der Fehler: eine Kachel ist bei `med` 23 Hex breit und bei
     * `low` 182 — „ein kachelbreiter Rand“ ist damit ein Streifen alter Karte quer über die
     * neue, der auf jeder Zoomstufe darüberliegt.
     */
    it('teilt jede berührte Kachel entweder dem Innenbereich oder dem Rand zu', () => {
      const span = TIER_WORLD_SIZE.med;
      const bounds = { minX: span * 0.5, minY: span * 0.5, maxX: span * 3.5, maxY: span * 3.5 };

      const all = cellsCovering(bounds, 'med').length;
      const inner = innerCellRect(bounds, 'med')!;
      const innerCount = (inner.maxCx - inner.minCx + 1) * (inner.maxCy - inner.minCy + 1);

      // Keine Kachel fällt durch, keine wird doppelt behandelt.
      expect(innerCount + edgeCells(bounds, 'med').length).toBe(all);
    });

    it('erkennt bei kachelgenauem Rechteck gar keinen Rand', () => {
      const span = TIER_WORLD_SIZE.med;
      const bounds = { minX: 0, minY: 0, maxX: span * 3, maxY: span * 2 };

      expect(innerCellRect(bounds, 'med')).toEqual({ minCx: 0, minCy: 0, maxCx: 2, maxCy: 1 });
      expect(edgeCells(bounds, 'med')).toEqual([]);
    });

    it('zählt bei angeschnittenem Rechteck jede Randkachel', () => {
      const span = TIER_WORLD_SIZE.med;
      // 0,5 bis 2,5 Kacheln: nur Kachel 1 liegt ganz innen, die 8 drumherum sind Rand.
      const bounds = { minX: span * 0.5, minY: span * 0.5, maxX: span * 2.5, maxY: span * 2.5 };

      expect(innerCellRect(bounds, 'med')).toEqual({ minCx: 1, minCy: 1, maxCx: 1, maxCy: 1 });
      expect(edgeCells(bounds, 'med')).toHaveLength(8);
    });

    it('behandelt ein Bild kleiner als eine Kachel komplett als Rand', () => {
      const span = TIER_WORLD_SIZE.low;
      const bounds = { minX: span * 0.2, minY: span * 0.2, maxX: span * 0.8, maxY: span * 0.8 };

      // Nichts zu löschen — und ohne Randbehandlung bliebe die ganze grobe Kachel stehen.
      expect(innerCellRect(bounds, 'low')).toBeNull();
      expect(edgeCells(bounds, 'low')).toEqual([{ cx: 0, cy: 0 }]);
    });

    it('wächst der Rand mit dem Umfang, nicht mit der Fläche', () => {
      // Das ist der Grund, warum Randkacheln echt radiert werden dürfen: bei `high` deckt ein
      // großer Import tausende Kacheln ab, aber nur ein Bruchteil davon ist Rand.
      const span = TIER_WORLD_SIZE.high;
      const bounds = { minX: span * 0.5, minY: span * 0.5, maxX: span * 40.5, maxY: span * 40.5 };

      const all = cellsCovering(bounds, 'high').length;
      const ring = edgeCells(bounds, 'high').length;

      // Berührt werden die Spalten 0..40; ganz innen liegen 1..39, weil an *beiden* Rändern
      // eine Spalte angeschnitten ist.
      expect(all).toBe(41 * 41);
      expect(ring).toBe(41 * 41 - 39 * 39);
      expect(ring / all).toBeLessThan(0.1);
    });
  });

  describe('Innenrechteck beim Ersetzen', () => {
    /*
     * „Bereich ersetzen“ löscht nur Kacheln, die *ganz* im Bild liegen — eine angeschnittene
     * hält auch Karte außerhalb, die stehen bleiben muss. Das ist genau der Randstreifen, der
     * als bekannte Kehrseite dokumentiert ist.
     */
    const innerRect = (bounds: Bounds, span: number) => ({
      minCx: Math.ceil(bounds.minX / span),
      minCy: Math.ceil(bounds.minY / span),
      maxCx: Math.floor(bounds.maxX / span) - 1,
      maxCy: Math.floor(bounds.maxY / span) - 1,
    });

    it('nimmt bei kachelgenauem Rechteck jede Kachel', () => {
      const span = TIER_WORLD_SIZE.high;
      const r = innerRect({ minX: 0, minY: 0, maxX: span * 3, maxY: span * 2 }, span);
      expect(r).toEqual({ minCx: 0, minCy: 0, maxCx: 2, maxCy: 1 });
    });

    it('lässt angeschnittene Randkacheln aus', () => {
      const span = TIER_WORLD_SIZE.high;
      // Von der Mitte einer Kachel bis in die Mitte der übernächsten: nur Kachel 1 liegt ganz
      // innen, 0 und 2 sind angeschnitten.
      const r = innerRect(
        { minX: span * 0.5, minY: span * 0.5, maxX: span * 2.5, maxY: span * 2.5 },
        span,
      );
      expect(r).toEqual({ minCx: 1, minCy: 1, maxCx: 1, maxCy: 1 });
    });

    it('ergibt ein leeres Rechteck, wenn keine Kachel ganz überdeckt ist', () => {
      const span = TIER_WORLD_SIZE.low;
      // Ein Bild, das kleiner als eine grobe Kachel ist, darf keine davon löschen.
      const r = innerRect(
        { minX: span * 0.2, minY: span * 0.2, maxX: span * 0.8, maxY: span * 0.8 },
        span,
      );
      expect(r.maxCx < r.minCx || r.maxCy < r.minCy).toBe(true);
    });
  });

  describe('Schwellwert', () => {
    it('macht Deckkraft zu Land und Transparenz zu Wasser', () => {
      const src = imageData([
        [10, 20, 30, 255],
        [10, 20, 30, 0],
      ]);
      const height = blank(2);
      applyThreshold(src, height, null, 0.5);

      expect([...height.data.slice(0, 4)]).toEqual([255, 255, 255, 255]);
      expect([...height.data.slice(4, 8)]).toEqual([255, 255, 255, 0]);
    });

    it('übernimmt die Farbe nur dort, wo auch Land ist', () => {
      // Halbtransparente Ränder tragen oft schwarzes RGB; ohne die Maske zöge das einen
      // dunklen Saum um jede Küste.
      const src = imageData([
        [200, 180, 120, 255],
        [0, 0, 0, 40],
      ]);
      const height = blank(2);
      const color = blank(2);
      applyThreshold(src, height, color, 0.5);

      expect([...color.data.slice(0, 4)]).toEqual([200, 180, 120, 255]);
      expect([...color.data.slice(4, 8)]).toEqual([0, 0, 0, 0]);
    });

    it('zählt vollständig transparente Punkte auch bei Schwelle 0 als Wasser', () => {
      const src = imageData([[0, 0, 0, 0]]);
      const height = blank(1);
      applyThreshold(src, height, null, 0);
      expect(height.data[3]).toBe(0);
    });

    it('verschiebt die Küste mit der Schwelle', () => {
      const src = imageData([[9, 9, 9, 100]]);

      const low = blank(1);
      applyThreshold(src, low, null, 0.3);
      expect(low.data[3]).toBe(255);

      const high = blank(1);
      applyThreshold(src, high, null, 0.6);
      expect(high.data[3]).toBe(0);
    });
  });
});
