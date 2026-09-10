/**
 * Access to the generated map asset library (`npm run map:atlas`).
 *
 * Sprites live in a handful of packed atlas pages rather than as ~1000 loose files, so
 * Pixi can batch a map full of symbols instead of rebinding a texture per sprite. This
 * module owns loading those pages and slicing them into per-sprite textures.
 *
 * Everything here degrades quietly when the library is absent: the Wonderdraft extract is
 * large and licensed, so a checkout without it must still run.
 */

import { Assets, Rectangle, Texture } from 'pixi.js';

const BASE = '/mapassets';

/**
 * `props` holds the battlemap clutter from the bought packs — market stalls, carts, washing
 * lines. On a map where one hex is 4 km it is rarely wanted, so it gets its own tab rather
 * than padding out the pickers used constantly. See `tools/iso-classify.mjs`.
 */
export type SymbolCategory = 'trees' | 'mountains' | 'misc' | 'props';

export interface SpriteMeta {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  /** Nominal radius from Wonderdraft's sidecar; drives the default placement scale. */
  radius: number;
  /**
   * Anchor offset from the image centre, in source pixels. This is the symbol's visual
   * base — a tree's trunk rather than its bounding box — so it is what placement and
   * y-sorting must key off, not the sprite centre.
   */
  offsetX: number;
  offsetY: number;
  drawMode: string;
  /** `sample_color` symbols are drawn in the land colour; the rest keep their own. */
  colorable: boolean;
  /**
   * Wonderdraft's multi-slot recolour symbols, flattened to a white silhouette.
   *
   * Deliberately *not* `colorable`: that means "take the colour of the ground beneath", which
   * for a town marker sitting on land would paint it the same colour as the land and make it
   * disappear. These take a colour the user chooses instead.
   */
  tintable?: boolean;

  /**
   * Set on sprites that live in their own file instead of an atlas page.
   *
   * The bought isometric packs are an order of magnitude larger than the Wonderdraft
   * library — packed at native size they would need 36 atlas pages, all resident from
   * startup. The atlas exists because a map scatters *thousands* of trees; nobody scatters a
   * thousand mansions, so these load individually when one is actually placed and VRAM then
   * follows the map rather than the library.
   *
   * `page`/`x`/`y` are absent when this is set, and vice versa.
   */
  file?: string;
  /** Where this sprite's picker thumbnail sits on a `thumbPages` sheet. */
  thumb?: { page: number; x: number; y: number; w: number; h: number };
}

export interface GroupMeta {
  id: string;
  category: SymbolCategory;
  name: string;
  deprioritised: boolean;
  sprites: string[];
}

export interface PaperTextureMeta {
  id: string;
  name: string;
  file: string;
  size: number;
}

export interface AssetManifest {
  pages: { file: string; width: number; height: number }[];
  /** Small thumbnails for the standalone sprites, for the picker only — never the map. */
  thumbPages?: { file: string; width: number; height: number }[];
  paperTextures: PaperTextureMeta[];
  categories: Record<string, string[]>;
  groups: Record<string, GroupMeta>;
  sprites: Record<string, SpriteMeta>;
}

export class MapAssets {
  manifest: AssetManifest | null = null;

  private pages: Texture[] = [];
  private spriteTextures = new Map<string, Texture>();
  private paperCache = new Map<string, Texture>();

  get available(): boolean {
    return !!this.manifest && this.pages.length > 0;
  }

  /** Why loading failed, surfaced in the UI so the cause is not left to guesswork. */
  lastError: string | null = null;

  /** Fetch the manifest and atlas pages. Safe to call when the library is not built. */
  async load(): Promise<boolean> {
    this.lastError = null;

    try {
      const res = await fetch(`${BASE}/manifest.json`);
      if (!res.ok) {
        // The overwhelmingly common cause is a dev server started before the atlases were
        // generated: `public/` is copied at startup, so a newly created folder is missed.
        this.lastError =
          res.status === 404
            ? 'Symbol-Atlas nicht gefunden. "npm run map:atlas" ausführen und den Dev-Server neu starten.'
            : `Manifest konnte nicht geladen werden (HTTP ${res.status}).`;
        console.warn('[MapAssets]', this.lastError);
        return false;
      }
      this.manifest = (await res.json()) as AssetManifest;
    } catch (err) {
      this.lastError = 'Symbol-Atlas nicht erreichbar.';
      console.warn('[MapAssets] Manifest fetch failed:', err);
      return false;
    }

    try {
      this.pages = await Promise.all(
        this.manifest.pages.map(p => Assets.load<Texture>(`${BASE}/${p.file}`)),
      );
    } catch (err) {
      this.lastError = 'Atlas-Seiten konnten nicht geladen werden.';
      console.error('[MapAssets] Failed to load atlas pages:', err);
      this.manifest = null;
      return false;
    }

    if (this.pages.length === 0) {
      this.lastError = 'Atlas enthält keine Seiten.';
      return false;
    }
    return true;
  }

  /**
   * Texture for one sprite, cut from its atlas page.
   *
   * Sub-textures share the page's GPU texture, which is the whole point — a thousand
   * symbols drawn from two pages batch into two draw calls rather than a thousand.
   */
  sprite(id: string): Texture | null {
    const hit = this.spriteTextures.get(id);
    if (hit) return hit;

    const meta = this.manifest?.sprites[id];
    if (!meta) return null;

    // Standalone sprite: not on any page, so fetch it and report back when it lands.
    if (meta.file) {
      this.loadStandalone(id, meta.file);
      return null;
    }

    const page = this.pages[meta.page];
    if (!page) return null;

    const texture = new Texture({
      source: page.source,
      frame: new Rectangle(meta.x, meta.y, meta.w, meta.h),
    });
    this.spriteTextures.set(id, texture);
    return texture;
  }

  meta(id: string): SpriteMeta | null {
    return this.manifest?.sprites[id] ?? null;
  }

  /**
   * CSS for a sprite thumbnail, cut from its atlas page with background-position.
   *
   * The picker has to show the actual artwork — a list of names like `house_small` is
   * unusable for choosing a symbol. Slicing the atlas in CSS means no second set of
   * thumbnail files to generate, ship or keep in sync.
   */
  /**
   * Inline style for a picker thumbnail.
   *
   * `tint` colours *tintable* sprites, which are stored as plain white silhouettes — drawn
   * raw they are a blinding white blob in the picker, and they carry no colour of their own
   * to fall back on. Those are painted as a CSS mask instead of a background image, which is
   * the same trick the app's own icons use.
   */
  thumbStyle(id: string, box: number, tint?: string): Record<string, string> {
    const meta = this.manifest?.sprites[id];
    if (!meta) return {};

    /*
     * A standalone sprite is browsed from the thumbnail sheet, never from its own file.
     * The picker shows hundreds at once; pointing it at the full-size files would fetch
     * megabytes to draw 44px cells, and do it again on every scroll.
     */
    const onThumbSheet = !!meta.file && !!meta.thumb;
    const page = onThumbSheet
      ? this.manifest?.thumbPages?.[meta.thumb!.page]
      : this.manifest?.pages[meta.page];
    if (!page) return {};

    const src = onThumbSheet ? meta.thumb! : meta;

    // Fit the longest side into the box; small sprites are not blown up past 1:1.
    const scale = Math.min(box / Math.max(src.w, src.h), 1);
    const w = src.w * scale;
    const h = src.h * scale;

    const url = `url(${BASE}/${page.file})`;
    const size = `${page.width * scale}px ${page.height * scale}px`;
    const pos = `${-src.x * scale}px ${-src.y * scale}px`;

    const base: Record<string, string> = {
      width: `${w}px`,
      height: `${h}px`,
      // Centre the (usually smaller) sprite inside its cell.
      margin: `${(box - h) / 2}px ${(box - w) / 2}px`,
    };

    if (tint && meta.tintable) {
      return {
        ...base,
        'background-color': tint,
        'mask-image': url,
        'mask-size': size,
        'mask-position': pos,
        'mask-repeat': 'no-repeat',
        '-webkit-mask-image': url,
        '-webkit-mask-size': size,
        '-webkit-mask-position': pos,
        '-webkit-mask-repeat': 'no-repeat',
      };
    }

    return {
      ...base,
      'background-image': url,
      'background-size': size,
      'background-position': pos,
      'background-repeat': 'no-repeat',
    };
  }

  group(id: string): GroupMeta | null {
    return this.manifest?.groups[id] ?? null;
  }

  groupsIn(category: SymbolCategory): GroupMeta[] {
    const ids = this.manifest?.categories[category] ?? [];
    return ids.map(id => this.manifest!.groups[id]).filter(Boolean);
  }

  /**
   * Every sprite in a category, flattened in group order.
   *
   * The picker shows the whole category at once rather than making you choose a group name
   * first: browsing thirteen "Inked Mountains" and then backing out to try "Penned
   * Mountains" is guesswork through a list of words. Groups still exist — they drive which
   * sprites auto-variation may pick from — they are just not something you navigate.
   */
  spritesInCategory(category: SymbolCategory): string[] {
    const out: string[] = [];
    for (const group of this.groupsIn(category)) out.push(...group.sprites);
    return out;
  }

  /** The group a sprite belongs to, so selecting one also selects its variation set. */
  groupOf(spriteId: string): string {
    const slash = spriteId.lastIndexOf('/');
    return slash < 0 ? '' : spriteId.slice(0, slash);
  }

  /**
   * Filter a sprite list by a free-text query.
   *
   * Matches the sprite's own name, its id, and its group's name, so "burg" finds castles
   * whether the word is on the sprite or only on the group it lives in. Terms are ANDed,
   * which makes narrowing ("inked oak") work the way people expect from a search box.
   */
  search(ids: string[], query: string): string[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return ids;

    return ids.filter(id => {
      const meta = this.manifest?.sprites[id];
      const group = this.manifest?.groups[this.groupOf(id)];
      const haystack = `${id} ${meta?.name ?? ''} ${group?.name ?? ''}`.toLowerCase();
      return terms.every(t => haystack.includes(t));
    });
  }

  /** A random member of a group — placing a symbol rolls the next variation. */
  randomInGroup(groupId: string): string | null {
    const g = this.group(groupId);
    if (!g || g.sprites.length === 0) return null;
    return g.sprites[Math.floor(Math.random() * g.sprites.length)];
  }

  get paperTextures(): PaperTextureMeta[] {
    return this.manifest?.paperTextures ?? [];
  }

  /**
   * Fetch a standalone sprite's texture once, and tell the caller when it arrives.
   *
   * `sprite()` has to stay synchronous — it is called from the render loop, per visible
   * symbol, per frame — so the first request returns nothing and the symbol appears on the
   * next frame after the fetch resolves. `onTextureLoaded` is what schedules that frame;
   * without it a freshly panned-to prop would sit invisible until something else moved.
   */
  onTextureLoaded?: () => void;

  private pendingStandalone = new Set<string>();

  private loadStandalone(id: string, file: string): void {
    if (this.pendingStandalone.has(id)) return;
    this.pendingStandalone.add(id);

    Assets.load<Texture>(`${BASE}/${file}`)
      .then(texture => {
        this.spriteTextures.set(id, texture);
        this.onTextureLoaded?.();
      })
      .catch(err => {
        // Left in `pendingStandalone` on purpose: a missing file would otherwise be retried
        // every frame for as long as the symbol is on screen.
        console.warn('[MapAssets] Failed to load sprite', id, err);
      });
  }

  /**
   * Load a paper texture, set to repeat so it tiles seamlessly across the whole map —
   * the terrain shader samples it in world space, well outside 0..1.
   */
  async paper(id: string): Promise<Texture | null> {
    if (!id) return null;
    const hit = this.paperCache.get(id);
    if (hit) return hit;

    const meta = this.paperTextures.find(p => p.id === id);
    if (!meta) return null;

    try {
      const texture = await Assets.load<Texture>(`${BASE}/${meta.file}`);
      texture.source.addressMode = 'repeat';
      this.paperCache.set(id, texture);
      return texture;
    } catch (err) {
      console.error('[MapAssets] Failed to load paper texture', id, err);
      return null;
    }
  }

  destroy(): void {
    for (const t of this.spriteTextures.values()) t.destroy();
    this.spriteTextures.clear();
    this.paperCache.clear();
    this.pages = [];
    this.manifest = null;
  }
}
