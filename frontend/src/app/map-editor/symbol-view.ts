/**
 * Symbol rendering — culling, y-sorting and sprite pooling.
 *
 * Two things make this hold up with tens of thousands of symbols on a map:
 *
 *  - Only symbols in cells overlapping the viewport are considered, via `SpatialIndex`.
 *    Nothing walks the full collection per frame.
 *  - Sprites are pooled and all draw from the shared atlas pages, so a screen full of
 *    symbols batches into a couple of draw calls instead of one per sprite.
 *
 * Anchoring follows Wonderdraft's sidecar convention, which is subtler than it looks. A
 * symbol's stored position is its *visual base* — where a tree's trunk meets the ground —
 * and `offsetX/offsetY` says where the image centre sits relative to that. Getting this
 * wrong makes symbols float and mis-overlap in a way that is very annoying to correct once
 * a map is full of them, so both placement and the sort key use the base, never the centre.
 */

import { Container, Sprite } from 'pixi.js';
import { MapSymbol } from './map-editor.model';
import { Bounds } from './map-camera';
import { MapAssets } from './map-assets';
import { SpatialIndex } from './spatial-index';

/**
 * Below this on-screen size a symbol is a speck; drawing it costs a sprite and contributes
 * nothing. Skipping them is what keeps a zoomed-out view of a busy map affordable.
 */
const MIN_SCREEN_PX = 3;

/** Hard ceiling on sprites per frame, so a pathological view degrades instead of stalling. */
const MAX_VISIBLE = 12000;

export class SymbolView {
  readonly container = new Container();
  readonly index = new SpatialIndex<MapSymbol>();

  /** Sprites currently on screen, keyed by symbol id. */
  private active = new Map<string, Sprite>();
  private pool: Sprite[] = [];

  /**
   * Fallback for `sample_color` symbols placed where no land colour was painted.
   *
   * White, matching blank land — each symbol otherwise carries a `tint` sampled from the
   * ground beneath it at placement, so this is only the unpainted case.
   */
  private landColor = 0xffffff;
  private selected = new Set<string>();

  constructor(private assets: MapAssets) {
    // Pixi sorts by zIndex only when asked; the sort key is the symbol's base y, so
    // symbols lower on the map overlap those above them.
    this.container.sortableChildren = true;
  }

  private forceRefresh = false;

  setLandColor(color: number): void {
    this.landColor = color;
    // Tint is reapplied during render, so flagging a re-sync is all that is needed.
    this.forceRefresh = true;
  }

  setSelection(ids: Iterable<string>): void {
    this.selected = new Set(ids);
    this.forceRefresh = true;
  }

  /** Replace the indexed set (document load, or a remote change). */
  rebuild(symbols: MapSymbol[]): void {
    this.index.rebuild(symbols);
    this.forceRefresh = true;
  }

  add(symbol: MapSymbol): void {
    this.index.insert(symbol);
    this.forceRefresh = true;
  }

  update(symbol: MapSymbol): void {
    this.index.update(symbol);
    this.forceRefresh = true;
  }

  remove(id: string): void {
    this.index.remove(id);
    const sprite = this.active.get(id);
    if (sprite) {
      this.release(id, sprite);
    }
    this.forceRefresh = true;
  }

  private take(): Sprite {
    const s = this.pool.pop() ?? new Sprite();
    s.anchor.set(0.5);
    s.visible = true;
    return s;
  }

  private release(id: string, sprite: Sprite): void {
    this.container.removeChild(sprite);
    sprite.visible = false;
    this.active.delete(id);
    this.pool.push(sprite);
  }

  /**
   * Sync the visible sprite set to the viewport.
   *
   * `zoom` is needed for the size cull — a symbol's on-screen size is what decides whether
   * it is worth drawing, not its world size.
   */
  render(bounds: Bounds, zoom: number, showSecrets: boolean): void {
    // Margin of one symbol's worth so sprites are ready before they scroll in.
    const visible = this.index.query({
      minX: bounds.minX - 256,
      minY: bounds.minY - 256,
      maxX: bounds.maxX + 256,
      maxY: bounds.maxY + 256,
    });

    const wanted = new Set<string>();
    let count = 0;

    for (const sym of visible) {
      if (count >= MAX_VISIBLE) break;
      if (sym.vis === 'secret' && !showSecrets) continue;

      const meta = this.assets.meta(sym.asset);
      if (!meta) continue;

      const scale = sym.scale || 1;
      if (Math.max(meta.w, meta.h) * scale * zoom < MIN_SCREEN_PX) continue;

      const texture = this.assets.sprite(sym.asset);
      if (!texture) continue;

      wanted.add(sym.id);
      count++;

      let sprite = this.active.get(sym.id);
      if (!sprite) {
        sprite = this.take();
        this.active.set(sym.id, sprite);
        this.container.addChild(sprite);
      }

      sprite.texture = texture;
      // Stored position is the visual base; the offset places the image centre from it.
      sprite.position.set(sym.x + meta.offsetX * scale, sym.y + meta.offsetY * scale);
      sprite.scale.set(sym.flipX ? -scale : scale, scale);
      sprite.rotation = sym.rotation || 0;
      // Sort on the base, not the sprite centre, so overlap follows ground position.
      sprite.zIndex = sym.y;

      // `sample_color` symbols are drawn in the land colour; the rest keep their own.
      sprite.tint = meta.colorable ? (parseTint(sym.tint) ?? this.landColor) : 0xffffff;

      if (this.selected.has(sym.id)) sprite.alpha = 0.65;
      else if (sym.vis === 'secret') sprite.alpha = 0.85;
      else sprite.alpha = 1;
    }

    // Retire sprites that scrolled out or were culled.
    for (const [id, sprite] of [...this.active]) {
      if (!wanted.has(id)) this.release(id, sprite);
    }

    this.forceRefresh = false;
  }

  /** True if something changed since the last render and a re-sync is due. */
  get needsRefresh(): boolean {
    return this.forceRefresh;
  }

  /**
   * Symbol under a world point.
   *
   * Hit radius comes from the sidecar's `radius` scaled by placement, so a big mountain is
   * easier to grab than a small shrub — matching what is visually under the cursor.
   */
  hitTest(x: number, y: number): MapSymbol | null {
    const candidates = this.index.query({
      minX: x - 256,
      minY: y - 256,
      maxX: x + 256,
      maxY: y + 256,
    });

    let best: MapSymbol | null = null;
    let bestDist = Infinity;

    for (const sym of candidates) {
      const meta = this.assets.meta(sym.asset);
      if (!meta) continue;
      const scale = sym.scale || 1;

      // Measure against the drawn centre rather than the base, which is where the
      // pixels actually are.
      const cx = sym.x + meta.offsetX * scale;
      const cy = sym.y + meta.offsetY * scale;
      const r = Math.max(8, meta.radius * scale);

      const d = Math.hypot(cx - x, cy - y);
      // Prefer the topmost (largest y) among overlapping hits, matching draw order.
      if (d <= r && (best === null || sym.y > best.y || d < bestDist)) {
        best = sym;
        bestDist = d;
      }
    }
    return best;
  }

  /** Symbols whose base falls inside a world rectangle. */
  inRect(rect: Bounds): MapSymbol[] {
    return this.index
      .query(rect)
      .filter(s => s.x >= rect.minX && s.x <= rect.maxX && s.y >= rect.minY && s.y <= rect.maxY);
  }

  destroy(): void {
    for (const [, sprite] of this.active) sprite.destroy();
    for (const sprite of this.pool) sprite.destroy();
    this.active.clear();
    this.pool = [];
    this.index.clear();
    this.container.destroy({ children: true });
  }
}

function parseTint(hex?: string): number | null {
  if (!hex) return null;
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return Number.isNaN(n) ? null : n;
}
