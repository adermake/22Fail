import { RegionView, centroid, dashedSegments, distanceToPath, pathBounds } from './region-view';
import { MapRegion, Point } from './map-editor.model';

const square: Point[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('dashed path', () => {
  it('emits nothing for a degenerate path', () => {
    expect(dashedSegments([], 10, 10)).toEqual([]);
    expect(dashedSegments([{ x: 0, y: 0 }], 10, 10)).toEqual([]);
  });

  it('closes the loop back to the first point', () => {
    // A solid pattern (no gap) should trace the entire perimeter, all four edges.
    const segs = dashedSegments(square, 1000, 0);
    const total = segs.reduce((a, s) => a + Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y), 0);
    expect(total).toBeCloseTo(400, 3);
  });

  it('covers roughly the dash fraction of the perimeter', () => {
    const dash = 10;
    const gap = 10;
    const segs = dashedSegments(square, dash, gap);
    const covered = segs.reduce((a, s) => a + Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y), 0);
    // Half on, half off, over a 400px perimeter.
    expect(covered).toBeGreaterThan(180);
    expect(covered).toBeLessThan(220);
  });

  it('carries the pattern across corners instead of restarting at each vertex', () => {
    // With a period longer than one edge, restarting per edge would emit exactly one
    // segment per edge starting at each corner. Continuing means some edge starts mid-gap.
    const segs = dashedSegments(square, 60, 60);
    const startsAtCorner = segs.filter(
      s => square.some(p => Math.hypot(p.x - s.from.x, p.y - s.from.y) < 0.001),
    ).length;
    expect(startsAtCorner).toBeLessThan(4);
  });

  it('produces no segments when the dash is vanishing', () => {
    expect(dashedSegments(square, 0, 20)).toHaveLength(0);
  });

  it('keeps every segment on the path', () => {
    for (const seg of dashedSegments(square, 7, 5)) {
      expect(distanceToPath(square, seg.from.x, seg.from.y)).toBeLessThan(0.001);
      expect(distanceToPath(square, seg.to.x, seg.to.y)).toBeLessThan(0.001);
    }
  });
});

describe('path geometry', () => {
  it('measures distance to the nearest edge, including the closing one', () => {
    expect(distanceToPath(square, 50, 0)).toBeCloseTo(0, 6);
    expect(distanceToPath(square, 50, 10)).toBeCloseTo(10, 6);
    // Inside the square: nearest edge is 40 away, not the centroid.
    expect(distanceToPath(square, 50, 50)).toBeCloseTo(50, 6);
    // Near the closing edge from last point back to first.
    expect(distanceToPath(square, -5, 50)).toBeCloseTo(5, 6);
  });

  it('clamps to segment endpoints rather than the infinite line', () => {
    const line: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    // Far off the end: distance is to the endpoint, not a perpendicular foot.
    expect(distanceToPath(line, 30, 0)).toBeCloseTo(20, 6);
  });

  it('averages vertices for the centroid', () => {
    expect(centroid(square)).toEqual({ x: 50, y: 50 });
    expect(centroid([])).toEqual({ x: 0, y: 0 });
  });

  it('bounds a path', () => {
    expect(pathBounds(square)).toEqual({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
  });
});

/**
 * Rubber-band selection, used by the cross-category secret selector.
 *
 * "Touches the box" rather than "fits inside it": a territory outline dwarfs the band a GM
 * drags over a cluster of symbols, so requiring containment would make it impossible to catch
 * a region with the same gesture that catches everything standing in it.
 */
describe('region rubber band', () => {
  function region(id: string, points: Point[]): MapRegion {
    const c = centroid(points);
    return { id, x: c.x, y: c.y, vis: 'public', points, color: '#fff', thickness: 4, dash: 0, gap: 0 };
  }

  it('catches a region the band only clips', () => {
    const view = new RegionView();
    view.rebuild([region('r1', square)]);

    // Band overlapping the top-left corner only.
    expect(view.inRect({ minX: -10, minY: -10, maxX: 10, maxY: 10 }).map(r => r.id)).toEqual(['r1']);
  });

  it('ignores a region entirely outside the band', () => {
    const view = new RegionView();
    view.rebuild([region('r1', square)]);

    expect(view.inRect({ minX: 500, minY: 500, maxX: 600, maxY: 600 })).toEqual([]);
  });

  it('does not catch a region merely enclosing the band', () => {
    const view = new RegionView();
    view.rebuild([region('r1', square)]);

    // A band deep inside the square touches no vertex. Selecting here would mean dragging a
    // box over a town to pick its buildings also grabs the whole kingdom around it.
    expect(view.inRect({ minX: 40, minY: 40, maxX: 60, maxY: 60 })).toEqual([]);
  });
});
