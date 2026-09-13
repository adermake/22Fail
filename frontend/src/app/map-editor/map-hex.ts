/**
 * Flat-top hex grid in *global* world-pixel space.
 *
 * v1's hex math (`world-map/world-map-hex.utils.ts`) was tile-local: coordinates were
 * relative to a macro tile's top-left, with a `+4` centring fudge baked into the origin.
 * v2 has no tiles, so the grid is one continuous odd-q lattice over the whole world with a
 * clean origin. That file still serves the old viewer and is removed with it in Phase 3.
 *
 * Rounding here is true cube rounding rather than v1's rectangular `Math.round`, which
 * picked the wrong hex near shared edges — tolerable for a fog brush you drag, but wrong
 * for hit-testing a single hex.
 */

import { HexCoord, Point } from '../model/lobby.model';

/**
 * Circumradius (centre → vertex) in world px.
 *
 * This is the map's working scale, and it is the number that decides how much detail can
 * exist *inside* a hex. At the original 30 a hex spanned 60 world px, which at any
 * affordable raster density left it a dozen texels across — no brushwork finer than a blob
 * could survive there, however the chunk resolution was tuned.
 *
 * At 240 a hex spans 480 world px, or 240 texels at the current 2 px/texel, which is enough
 * to draw inside one. A hex still means the same 4 km; only the pixel scale changed.
 *
 * The cost is that a fixed viewport covers fewer hexes' worth of chunks before the streamer
 * hits its cap, which is the intended trade: detail where you are working, coarser LOD when
 * zoomed far out.
 */
export const HEX_RADIUS = 240;
export const HEX_WIDTH = 2 * HEX_RADIUS;
export const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;
/** Column pitch: flat-top hexes interlock at 3/4 of their width. */
export const HEX_X_SPACING = HEX_WIDTH * 0.75;
export const HEX_Y_SPACING = HEX_HEIGHT;

/** Scale used by the measuring ruler. */
export const KM_PER_HEX = 4;

/**
 * World pixels → kilometres.
 *
 * Divides by `HEX_HEIGHT`, not `HEX_X_SPACING`. The column pitch is only 3/4 of a hex's
 * width, so it is *not* the distance between neighbours: two adjacent centres are
 * `hypot(1.5R, √3R/2)` apart, which works out to `√3·R` — the same in every direction, which
 * is what makes it a hex grid. Measuring against the column pitch instead read every distance
 * about 15% long.
 */
export function worldToKm(worldPx: number): number {
  return (worldPx / HEX_HEIGHT) * KM_PER_HEX;
}

/** Centre of an odd-q offset hex, in world px. */
export function hexToWorld(hex: HexCoord): Point {
  return {
    x: hex.q * HEX_X_SPACING,
    y: hex.r * HEX_Y_SPACING + (hex.q & 1) * (HEX_Y_SPACING / 2),
  };
}

/** Hex containing a world point. */
export function worldToHex(x: number, y: number): HexCoord {
  // Fractional axial coords for a flat-top layout.
  const qf = ((2 / 3) * x) / HEX_RADIUS;
  const rf = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / HEX_RADIUS;
  const { q, r } = cubeRound(qf, rf);
  // Axial → odd-q offset.
  return { q, r: r + (q - (q & 1)) / 2 };
}

/** Round fractional axial coords to the nearest hex via the cube constraint x+y+z=0. */
function cubeRound(qf: number, rf: number): HexCoord {
  const sf = -qf - rf;
  let q = Math.round(qf);
  let r = Math.round(rf);
  const s = Math.round(sf);

  const dq = Math.abs(q - qf);
  const dr = Math.abs(r - rf);
  const ds = Math.abs(s - sf);

  // Discard whichever coordinate moved furthest, so the remaining two stay consistent.
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;

  return { q, r };
}

/** Axial form of an odd-q offset hex. */
function toAxial(h: HexCoord): HexCoord {
  return { q: h.q, r: h.r - (h.q - (h.q & 1)) / 2 };
}

/** Hex-step distance between two odd-q offset hexes. */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = toAxial(a);
  const bc = toAxial(b);
  return (
    (Math.abs(ac.q - bc.q) + Math.abs(ac.q + ac.r - bc.q - bc.r) + Math.abs(ac.r - bc.r)) / 2
  );
}

/** Hexes within `radius` rings of a centre (0 = the centre hex alone). */
export function hexesInRadius(centerQ: number, centerR: number, radius: number): HexCoord[] {
  const center = { q: centerQ, r: centerR };
  if (radius <= 0) return [center];

  const out: HexCoord[] = [];
  // Offset coords skew, so sweep a generous box and filter by true hex distance.
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = -radius - 1; dr <= radius + 1; dr++) {
      const h = { q: centerQ + dq, r: centerR + dr };
      if (hexDistance(center, h) <= radius) out.push(h);
    }
  }
  return out;
}

/** Vertices of a flat-top hex, starting at 0° so the top and bottom edges are horizontal. */
export function hexCorners(cx: number, cy: number, r = HEX_RADIUS): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

/**
 * Neighbour directions in **axial** coords, in the same order as `hexCorners`.
 *
 * Edge `k` runs between corner `k` and corner `k + 1`, so its outward bearing is
 * `60k + 30` degrees — and that is exactly where the neighbour across it sits. Listing the
 * directions in corner order is what lets one index name both the edge and the hex beyond it,
 * with no lookup table to keep in step.
 */
const AXIAL_DIRS: readonly HexCoord[] = [
  { q: 1, r: 0 }, // 30°  — right, down
  { q: 0, r: 1 }, // 90°  — down
  { q: -1, r: 1 }, // 150° — left, down
  { q: -1, r: 0 }, // 210° — left, up
  { q: 0, r: -1 }, // 270° — up
  { q: 1, r: -1 }, // 330° — right, up
];

/** Odd-q offset form of an axial hex — the inverse of `toAxial`. */
function fromAxial(h: HexCoord): HexCoord {
  return { q: h.q, r: h.r + (h.q - (h.q & 1)) / 2 };
}

/** The hex across edge `dir` (0–5, in `hexCorners` order). */
export function hexNeighbor(hex: HexCoord, dir: number): HexCoord {
  const a = toAxial(hex);
  const d = AXIAL_DIRS[((dir % 6) + 6) % 6];
  return fromAxial({ q: a.q + d.q, r: a.r + d.r });
}

/** The six neighbours, in edge order. */
export function hexNeighbors(hex: HexCoord): HexCoord[] {
  return AXIAL_DIRS.map((_, i) => hexNeighbor(hex, i));
}

/**
 * Canonical name for the edge between two adjacent hexes.
 *
 * An edge belongs to *both* hexes, so the two of them have to agree on one name or clicking
 * the same line from either side would produce two different passages sitting on top of each
 * other. Sorting the pair fixes that: the key is the same whichever hex you came from.
 */
export function edgeKey(a: HexCoord, b: HexCoord): string {
  const first = a.q < b.q || (a.q === b.q && a.r <= b.r) ? a : b;
  const second = first === a ? b : a;
  return `${first.q},${first.r}|${second.q},${second.r}`;
}

export function parseEdgeKey(key: string): { a: HexCoord; b: HexCoord } | null {
  const [left, right] = key.split('|');
  const a = parseHexKey(left ?? '');
  const b = parseHexKey(right ?? '');
  return a && b ? { a, b } : null;
}

/**
 * The two world-space corners an edge runs between.
 *
 * Derived from the *first* hex of the canonical pair rather than whichever one was clicked,
 * so every client draws the identical segment. Taking them from the clicked hex would give
 * the same line geometrically but built from a different pair of floats, and the circles at
 * the ends would not quite line up between two screens.
 */
export function edgeEndpoints(key: string): [Point, Point] | null {
  const pair = parseEdgeKey(key);
  if (!pair) return null;

  const dir = hexNeighbors(pair.a).findIndex(n => n.q === pair.b.q && n.r === pair.b.r);
  if (dir < 0) return null; // not actually adjacent

  const centre = hexToWorld(pair.a);
  const corners = hexCorners(centre.x, centre.y);
  return [corners[dir], corners[(dir + 1) % 6]];
}

/** Midpoint of an edge, used as the passage's position for culling and hit-testing. */
export function edgeMidpoint(key: string): Point | null {
  const ends = edgeEndpoints(key);
  if (!ends) return null;
  return { x: (ends[0].x + ends[1].x) / 2, y: (ends[0].y + ends[1].y) / 2 };
}

/**
 * The hex edge nearest a world point, with how far away it is.
 *
 * Measured against the *midpoints* of the containing hex's six edges. Distance to the
 * segment itself would be the obvious choice and is wrong for this job: near a corner two
 * edges are both zero away, so a click there would pick between them arbitrarily. Midpoints
 * give every edge one unambiguous target, which is what makes clicking along a boundary
 * land where it looks like it should.
 */
export function nearestEdge(x: number, y: number): { key: string; distance: number } {
  const hex = worldToHex(x, y);
  const centre = hexToWorld(hex);
  const corners = hexCorners(centre.x, centre.y);

  let best = 0;
  let bestDist = Infinity;
  for (let k = 0; k < 6; k++) {
    const next = corners[(k + 1) % 6];
    const mx = (corners[k].x + next.x) / 2;
    const my = (corners[k].y + next.y) / 2;
    const d = Math.hypot(mx - x, my - y);
    if (d < bestDist) {
      bestDist = d;
      best = k;
    }
  }

  return { key: edgeKey(hex, hexNeighbor(hex, best)), distance: bestDist };
}

export function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function parseHexKey(key: string): HexCoord | null {
  const parts = key.split(',').map(Number);
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  return { q: parts[0], r: parts[1] };
}

/** Inclusive hex-coordinate bounds covering a world-space rectangle. */
export function hexRangeForBounds(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): { minQ: number; maxQ: number; minR: number; maxR: number } {
  // One extra ring of slack absorbs the half-row stagger of odd columns.
  return {
    minQ: Math.floor(minX / HEX_X_SPACING) - 1,
    maxQ: Math.ceil(maxX / HEX_X_SPACING) + 1,
    minR: Math.floor(minY / HEX_Y_SPACING) - 1,
    maxR: Math.ceil(maxY / HEX_Y_SPACING) + 1,
  };
}

export type { HexCoord, Point };
