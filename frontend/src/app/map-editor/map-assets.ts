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

export type SymbolCategory = 'trees' | 'mountains' | 'misc';

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
  generatedAt: string;
  pages: { file: string; width: number; height: number }[];
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

  /** Fetch the manifest and atlas pages. Safe to call when the library is not built. */
  async load(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/manifest.json`);
      if (!res.ok) return false;
      this.manifest = (await res.json()) as AssetManifest;
    } catch {
      return false;
    }

    try {
      this.pages = await Promise.all(
        this.manifest.pages.map(p => Assets.load<Texture>(`${BASE}/${p.file}`)),
      );
    } catch (err) {
      console.error('[MapAssets] Failed to load atlas pages:', err);
      this.manifest = null;
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

  group(id: string): GroupMeta | null {
    return this.manifest?.groups[id] ?? null;
  }

  groupsIn(category: SymbolCategory): GroupMeta[] {
    const ids = this.manifest?.categories[category] ?? [];
    return ids.map(id => this.manifest!.groups[id]).filter(Boolean);
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
