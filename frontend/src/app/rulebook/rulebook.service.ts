import { Injectable, inject, isDevMode, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { renderMarkdown } from './markdown/rulebook-markdown';
import type {
  RenderResult,
  RulebookManifest,
  RulebookPage,
  RulebookSearchHit,
} from './rulebook.model';

/**
 * Loads the rulebook manifest and pages from /rulebook (frontend static assets)
 * and renders them. Rendered HTML is cached per page.
 */
@Injectable({ providedIn: 'root' })
export class RulebookService {
  private http = inject(HttpClient);
  private manifestPromise: Promise<RulebookManifest> | null = null;
  private pageCache = new Map<string, RenderResult>();

  readonly pages = signal<readonly RulebookPage[]>([]);

  loadManifest(): Promise<RulebookManifest> {
    this.manifestPromise ??= firstValueFrom(
      // The manifest carries the content hashes, so it must never be served stale.
      this.http.get<RulebookManifest>('/rulebook/index.json', {
        headers: { 'Cache-Control': 'no-cache' },
      }),
    )
      .then((m) => {
        this.pages.set(m.pages ?? []);
        return m;
      })
      .catch((err) => {
        this.manifestPromise = null; // allow retry
        throw err;
      });
    return this.manifestPromise;
  }

  async loadPage(id: string): Promise<RenderResult> {
    const cached = this.pageCache.get(id);
    if (cached) return cached;

    const manifest = await this.loadManifest();
    const page = manifest.pages.find((p) => p.id === id);
    if (!page) throw new Error(`Unbekannte Regelwerk-Seite: "${id}"`);

    // Assets aren't content-hashed by Angular, so bust the cache with the manifest hash.
    const url = isDevMode() ? `/rulebook/${page.file}` : `/rulebook/${page.file}?v=${page.hash}`;
    const source = await firstValueFrom(this.http.get(url, { responseType: 'text' }));

    const result = await renderMarkdown(source, id); // ← markdown-it lazy chunk loads here
    if (result.warnings.length && isDevMode()) {
      console.warn(`[rulebook] ${id}:`, result.warnings);
    }
    this.pageCache.set(id, result); // only successes are cached
    return result;
  }

  // ── Search ────────────────────────────────────────────────────────────────────
  private plainTextCache: Map<string, string> | null = null;

  /** Raw markdown of every page, stripped to plain text. Fetched once, on first search. */
  private async loadAllText(): Promise<Map<string, string>> {
    if (this.plainTextCache) return this.plainTextCache;
    const manifest = await this.loadManifest();
    const entries = await Promise.all(
      manifest.pages.map(async (p) => {
        try {
          const url = isDevMode() ? `/rulebook/${p.file}` : `/rulebook/${p.file}?v=${p.hash}`;
          const raw = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
          return [p.id, toPlainText(raw)] as const;
        } catch {
          return [p.id, ''] as const;
        }
      }),
    );
    this.plainTextCache = new Map(entries);
    return this.plainTextCache;
  }

  /**
   * Searches jump points (headings + section titles) and body text across all pages.
   * Jump points always outrank body matches, so "where do I jump to?" wins over "where is
   * this word mentioned?".
   */
  async search(query: string): Promise<RulebookSearchHit[]> {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const manifest = await this.loadManifest();
    const hits: RulebookSearchHit[] = [];

    // 1) Jump points — highest priority (exact > prefix > contains).
    for (const page of manifest.pages) {
      for (const entry of page.outline ?? []) {
        const text = entry.text.toLowerCase();
        const at = text.indexOf(q);
        if (at < 0) continue;
        const score =
          1000 - entry.level * 10 + (text === q ? 500 : at === 0 ? 250 : 0) + (entry.kind === 'section' ? 5 : 0);
        hits.push({
          pageId: page.id,
          pageTab: page.tab,
          anchor: entry.id,
          title: entry.text,
          kind: 'jump',
          score,
        });
      }
      // The page itself is a jump target too.
      const tab = page.tab.toLowerCase();
      if (tab.includes(q)) {
        hits.push({
          pageId: page.id,
          pageTab: page.tab,
          title: page.title,
          kind: 'jump',
          score: 1200 + (tab === q ? 500 : 0),
        });
      }
    }

    // 2) Body text — lower priority, attributed to the nearest preceding jump point.
    const texts = await this.loadAllText();
    for (const page of manifest.pages) {
      const body = texts.get(page.id) ?? '';
      if (!body) continue;
      const lower = body.toLowerCase();
      let from = 0;
      let found = 0;
      while (found < 3) {
        const at = lower.indexOf(q, from);
        if (at < 0) break;
        from = at + q.length;
        found++;
        const anchor = nearestAnchor(page, body, at);
        // Skip if we already have a jump hit for this exact spot.
        if (hits.some((h) => h.kind === 'jump' && h.pageId === page.id && h.anchor === anchor)) continue;
        hits.push({
          pageId: page.id,
          pageTab: page.tab,
          anchor,
          title: anchor ? titleOf(page, anchor) : page.title,
          excerpt: excerptAround(body, at, q.length),
          kind: 'text',
          score: 100 - found,
        });
      }
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, 40);
  }
}

/** Strips markdown/directive syntax so body search matches what the reader actually sees. */
function toPlainText(raw: string): string {
  return raw
    .replace(/^﻿/, '')
    .replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '')
    .replace(/^:{3,}.*$/gm, '') // directive fences
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/:(icon|hl|kbd|jump)\[([^\]]*)\](\{[^}]*\})?/g, '$2')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_>#]+/g, '')
    .replace(/[ \t]+/g, ' ');
}

/** The id of the last outline entry appearing before `index` in the text. */
function nearestAnchor(page: RulebookPage, body: string, index: number): string | undefined {
  let best: string | undefined;
  let bestPos = -1;
  for (const entry of page.outline ?? []) {
    const pos = body.indexOf(entry.text);
    if (pos >= 0 && pos <= index && pos > bestPos) {
      bestPos = pos;
      best = entry.id;
    }
  }
  return best;
}

function titleOf(page: RulebookPage, anchor: string): string {
  return (page.outline ?? []).find((e) => e.id === anchor)?.text ?? page.title;
}

function excerptAround(body: string, at: number, len: number): string {
  const start = Math.max(0, at - 45);
  const end = Math.min(body.length, at + len + 55);
  return (start > 0 ? '… ' : '') + body.slice(start, end).trim() + (end < body.length ? ' …' : '');
}
