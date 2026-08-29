import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssetBrowserApiService } from './asset-browser-api.service';
import {
  WeaponTypeBlock,
  builtinWeaponTypes,
  mergeWeaponTypes,
  normalizeWeaponType,
} from '../model/weapon-type-block.model';

/**
 * Loads GM-defined Waffentypen out of the libraries and merges them over the hardcoded list.
 *
 * The forge, the gear generator and the rulebook all read from here, so a type defined once in a
 * library shows up everywhere. Until something asks, nothing is fetched: `types()` starts as the
 * built-ins so a caller that never awaits `load()` still renders a sensible list.
 */
@Injectable({ providedIn: 'root' })
export class WeaponTypeService {
  private assets = inject(AssetBrowserApiService);

  /** Merged list: library entries first, then the built-ins they did not override. */
  readonly types = signal<WeaponTypeBlock[]>(builtinWeaponTypes());
  readonly loaded = signal(false);

  private inflight: Promise<WeaponTypeBlock[]> | null = null;

  /** Fetch once per session; repeated calls share the same promise. */
  load(): Promise<WeaponTypeBlock[]> {
    this.inflight ??= (async () => {
      try {
        const libraries = await firstValueFrom(this.assets.getAllLibraries());
        const perLibrary = await Promise.all(
          libraries.map(async (lib) => {
            try {
              const files = await firstValueFrom(
                this.assets.searchFiles(lib.id, '', ['weapon-type']),
              );
              return files.map((f) => normalizeWeaponType(f.data as WeaponTypeBlock));
            } catch {
              return [] as WeaponTypeBlock[];
            }
          }),
        );

        // De-duplicate by name: the same type can arrive twice via library dependencies.
        const seen = new Set<string>();
        const library = perLibrary.flat().filter((w) => {
          const key = (w?.name ?? '').trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const merged = mergeWeaponTypes(library);
        this.types.set(merged);
        this.loaded.set(true);
        return merged;
      } catch {
        this.inflight = null; // allow a retry; keep the built-ins in the meantime
        return this.types();
      }
    })();
    return this.inflight;
  }

  /** Drop the cache so the next `load()` re-reads the libraries (after an edit). */
  invalidate(): void {
    this.inflight = null;
    this.loaded.set(false);
  }

  byName(name: string): WeaponTypeBlock | undefined {
    const wanted = name.trim().toLowerCase();
    return this.types().find((w) => w.name.trim().toLowerCase() === wanted);
  }
}
