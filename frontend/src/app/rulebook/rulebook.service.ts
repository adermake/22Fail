import { Injectable, inject, isDevMode, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { renderMarkdown } from './markdown/rulebook-markdown';
import type { RenderResult, RulebookManifest, RulebookPage } from './rulebook.model';

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
}
