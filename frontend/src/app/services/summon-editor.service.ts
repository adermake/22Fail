import { Injectable, signal } from '@angular/core';
import { NpcStatblock } from '../model/npc-statblock.model';
import { SoulBlock, createSummonStatblock } from '../model/soul-block.model';
import { AssetFile } from '../model/asset-browser.model';
import { RuneBlock } from '../model/rune-block.model';

/** The caster's assets passed down so a summon can be equipped/skilled from what the caster has. */
export interface SummonAssets {
  items: AssetFile[];
  skills: AssetFile[];
  spells: AssetFile[];
  runes: RuneBlock[];
}

export interface SummonEditRequest {
  id: string;
  soul: SoulBlock;
  statblock: NpcStatblock; // seeded (soul stats locked) or a clone of the existing summon
  assets: SummonAssets;
}

/**
 * Opens the NPC editor for a summon from anywhere (the spell/rune builder) WITHOUT creating an import
 * cycle: callers just await `open(...)`; the app root renders the editor(s) from `requests` and calls
 * `finish(...)`. A stack is kept, so summon-inside-summon (recursion) stacks editors naturally.
 */
@Injectable({ providedIn: 'root' })
export class SummonEditorService {
  readonly requests = signal<SummonEditRequest[]>([]);
  private resolvers = new Map<string, (sb: NpcStatblock | null) => void>();

  /** Open the summon editor; resolves with the built statblock, or null if cancelled. */
  open(soul: SoulBlock, existing: NpcStatblock | null, assets?: SummonAssets): Promise<NpcStatblock | null> {
    const id = 'sum_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const statblock = existing
      ? (JSON.parse(JSON.stringify(existing)) as NpcStatblock)
      : createSummonStatblock(soul);
    const a: SummonAssets = assets ?? { items: [], skills: [], spells: [], runes: [] };
    return new Promise<NpcStatblock | null>(resolve => {
      this.resolvers.set(id, resolve);
      this.requests.update(r => [...r, { id, soul, statblock, assets: a }]);
    });
  }

  finish(id: string, statblock: NpcStatblock | null): void {
    const res = this.resolvers.get(id);
    this.resolvers.delete(id);
    this.requests.update(r => r.filter(x => x.id !== id));
    res?.(statblock);
  }
}
