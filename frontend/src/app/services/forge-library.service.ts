import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssetBrowserApiService } from './asset-browser-api.service';
import { LibraryStoreService } from './library-store.service';
import { ForgeTrait, MaterialBlock } from '../model/forging.model';

export interface ForgeLibrary {
  materials: MaterialBlock[];
  traits: ForgeTrait[];
}

/**
 * Materialien und Schmiedemerkmale aus allen Bibliotheken.
 *
 * Der Ausrüstungsgenerator braucht sie beim Bearbeiten, die Lobby beim Ablegen eines NSC mit
 * generierten Ausrüstungsplätzen — beide laden über diesen einen Weg. Gecacht pro Sitzung; eine
 * Bibliotheksänderung verwirft den Cache.
 */
@Injectable({ providedIn: 'root' })
export class ForgeLibraryService {
  private api = inject(AssetBrowserApiService);
  private inflight: Promise<ForgeLibrary> | null = null;

  constructor() {
    inject(LibraryStoreService).libraryChanged$.subscribe(() => this.invalidate());
  }

  /** `fresh` skips the cache — the gear generator wants the materials as they are right now. */
  load(options: { fresh?: boolean } = {}): Promise<ForgeLibrary> {
    if (options.fresh) this.invalidate();
    this.inflight ??= (async () => {
      try {
        const libraries = await firstValueFrom(this.api.getAllLibraries());
        const perLibrary = await Promise.all(libraries.map(async (lib) => {
          const [mats, traits] = await Promise.all([
            firstValueFrom(this.api.searchFiles(lib.id, '', ['material'])),
            firstValueFrom(this.api.searchFiles(lib.id, '', ['forge-trait'])),
          ]);
          return { mats, traits };
        }));
        return {
          materials: perLibrary.flatMap(p => p.mats)
            .map(f => ({ ...(f.data as MaterialBlock), id: (f.data as MaterialBlock).id || f.id })),
          traits: perLibrary.flatMap(p => p.traits)
            .map(f => ({ ...(f.data as ForgeTrait), id: (f.data as ForgeTrait).id || f.id })),
        };
      } catch (e) {
        this.inflight = null; // allow a retry on the next call
        console.error('Schmiede-Bibliothek konnte nicht geladen werden', e);
        return { materials: [], traits: [] };
      }
    })();
    return this.inflight;
  }

  invalidate(): void {
    this.inflight = null;
  }
}
