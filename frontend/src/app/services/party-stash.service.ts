import { Injectable, inject, signal } from '@angular/core';
import { ItemBlock } from '../model/item-block.model';
import { PartyStashEntry } from '../model/world.model';
import { WorldSocketService } from './world-socket.service';
import { identityKey } from '../utils/item-stack.util';

/**
 * The shared party stash ("Gemeinsamer Beutel"): one bag every character in the world can put
 * things into and take things out of.
 *
 * Duplicate- and disappearance-safety is not something the UI can promise on its own, so it
 * doesn't try. The server owns the list:
 *
 *  - Handing an item IN removes it from the sheet only after the server confirms it landed.
 *  - Taking an item OUT adds it to the sheet only if the server says THIS client removed it.
 *    Two people grabbing at once means one ack says `ok`, the other says `gone`.
 *  - Every change is broadcast as a `partyStash` world patch, so all sheets converge on the
 *    server's list rather than on their own optimistic guess.
 */
@Injectable({ providedIn: 'root' })
export class PartyStashService {
  private socket = inject(WorldSocketService);

  /** Current contents, as the server last reported them. */
  readonly entries = signal<PartyStashEntry[]>([]);
  /** True while a deposit/withdraw is in flight — the UI disables its buttons meanwhile. */
  readonly busy = signal(false);
  /** Last failure worth showing ("Jemand war schneller."). */
  readonly notice = signal('');

  private worldName: string | null = null;
  private subscribed = false;

  /** Point the stash at a world and pull its current contents. */
  async attach(worldName: string): Promise<void> {
    this.worldName = worldName;
    this.listen();
    const res = await this.socket.readPartyStash(worldName);
    if (res.ok) this.entries.set(res.stash ?? []);
  }

  /** Follow the broadcast list so every sheet shows the same bag. */
  private listen(): void {
    if (this.subscribed) return;
    this.subscribed = true;
    this.socket.patches$.subscribe(patch => {
      const path = patch.path.startsWith('/') ? patch.path.slice(1) : patch.path;
      if (path !== 'partyStash') return;
      this.entries.set(Array.isArray(patch.value) ? (patch.value as PartyStashEntry[]) : []);
    });
  }

  /**
   * Put an item in. Returns true only when the server took it — the caller removes the item
   * from the sheet exactly then, never before.
   */
  async deposit(item: ItemBlock, from?: { id?: string; name?: string }): Promise<boolean> {
    if (!this.worldName) { this.notice.set('Kein Party-Beutel — dieser Charakter hat keine Welt.'); return false; }
    const copy = structuredCloneSafe(item);
    const entry: PartyStashEntry = {
      entryId: newEntryId(),
      item: copy,
      // Lets the server merge this into an identical pile already in the bag. The rule for
      // "identical" lives in item-stack.util so the bag and the inventory agree.
      stackKey: copy.stackable ? identityKey(copy) : undefined,
      fromCharacterId: from?.id,
      fromName: from?.name,
      addedAt: Date.now(),
    };
    this.busy.set(true);
    try {
      const res = await this.socket.depositToPartyStash(this.worldName, entry);
      if (res.ok) {
        this.entries.set(res.stash ?? []);
        this.notice.set('');
        return true;
      }
      this.notice.set('Konnte nicht abgelegt werden — nichts wurde verändert.');
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  /**
   * Take an item out. Returns the item only if this client is the one that got it.
   * `amount` takes part of a pile; the server splits it in the same step that reserves it.
   */
  async withdraw(entryId: string, amount?: number): Promise<ItemBlock | null> {
    if (!this.worldName) return null;
    this.busy.set(true);
    try {
      const res = await this.socket.withdrawFromPartyStash(this.worldName, entryId, amount);
      if (res.stash) this.entries.set(res.stash);
      if (res.ok && res.entry) {
        this.notice.set('');
        return res.entry.item;
      }
      this.notice.set(res.reason === 'gone'
        ? 'Jemand war schneller — der Gegenstand ist weg.'
        : 'Konnte nicht genommen werden.');
      return null;
    } finally {
      this.busy.set(false);
    }
  }
}

/** Unique per deposit; the server treats it as the item's identity while it is in the bag. */
function newEntryId(): string {
  return `stash_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** A deep copy without dragging in a JSON round-trip for every field type we might add later. */
function structuredCloneSafe<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
