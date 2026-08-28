import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { PartyStashService } from './party-stash.service';
import { WorldSocketService } from './world-socket.service';
import { ItemBlock } from '../model/item-block.model';
import { PartyStashEntry } from '../model/world.model';
import { JsonPatch } from '../model/json-patch.model';

/**
 * A stand-in for the server: it owns the list, exactly like WorldGateway does, so these tests
 * exercise the real rule — the client may only act on what the server confirms.
 */
class FakeServer {
  stash: PartyStashEntry[] = [];
  patches$ = new Subject<JsonPatch>();
  /** Set to fail the next call, to test the "nothing changed" path. */
  offline = false;

  async depositToPartyStash(_world: string, entry: PartyStashEntry) {
    if (this.offline) return { ok: false, stash: [], reason: 'offline' };
    if (this.stash.some(e => e.entryId === entry.entryId)) return { ok: true, stash: this.stash };

    const mergeIdx = entry.stackKey
      ? this.stash.findIndex(e => e.stackKey === entry.stackKey && e.item?.stackable)
      : -1;
    if (mergeIdx >= 0) {
      const target = this.stash[mergeIdx];
      this.stash = this.stash.map((e, i) => i === mergeIdx
        ? { ...e, item: { ...e.item, amount: amountOf(target) + amountOf(entry) } as ItemBlock }
        : e);
    } else {
      this.stash = [...this.stash, entry];
    }
    this.broadcast();
    return { ok: true, stash: this.stash };
  }

  async withdrawFromPartyStash(_world: string, entryId: string, amount?: number) {
    if (this.offline) return { ok: false, stash: [], reason: 'offline' };
    const idx = this.stash.findIndex(e => e.entryId === entryId);
    if (idx < 0) return { ok: false, stash: this.stash, reason: 'gone' };

    const entry = this.stash[idx];
    const have = amountOf(entry);
    const wanted = amount === undefined ? have : Math.max(0, Math.floor(amount));
    if (wanted <= 0) return { ok: false, stash: this.stash, reason: 'bad-request' };

    if (wanted < have && entry.item.stackable) {
      this.stash = this.stash.map((e, i) => i === idx
        ? { ...e, item: { ...e.item, amount: have - wanted } as ItemBlock }
        : e);
      this.broadcast();
      const taken = { ...entry, item: { ...entry.item, amount: wanted } as ItemBlock };
      return { ok: true, entry: taken, stash: this.stash };
    }

    this.stash = this.stash.filter((_, i) => i !== idx);
    this.broadcast();
    return { ok: true, entry, stash: this.stash };
  }

  async readPartyStash(_world: string) {
    return { ok: true, stash: this.stash };
  }

  private broadcast(): void {
    this.patches$.next({ path: 'partyStash', value: this.stash } as JsonPatch);
  }
}

function item(name: string, extra: Partial<ItemBlock> = {}): ItemBlock {
  return { name, itemType: 'other', weight: 1, ...extra } as ItemBlock;
}

function stack(name: string, amount: number): ItemBlock {
  return item(name, { stackable: true, amount });
}

/** Units in an entry, mirroring the server's own rule. */
function amountOf(entry: PartyStashEntry): number {
  if (!entry?.item) return 0;
  if (!entry.item.stackable) return 1;
  return Math.max(1, Math.floor(entry.item.amount ?? 1));
}

describe('Gemeinsamer Beutel', () => {
  let svc: PartyStashService;
  let server: FakeServer;

  beforeEach(async () => {
    server = new FakeServer();
    TestBed.configureTestingModule({
      providers: [{ provide: WorldSocketService, useValue: server }],
    });
    svc = TestBed.inject(PartyStashService);
    await svc.attach('Testwelt');
  });

  it('starts from what the server already holds', async () => {
    expect(svc.entries()).toEqual([]);
  });

  it('accepts a deposit and shows it', async () => {
    expect(await svc.deposit(item('Seil'), { id: 'c1', name: 'Ayla' })).toBe(true);
    expect(svc.entries().length).toBe(1);
    expect(svc.entries()[0].item.name).toBe('Seil');
    expect(svc.entries()[0].fromName).toBe('Ayla');
  });

  it('gives every deposit its own identity, even for identical items', async () => {
    await svc.deposit(item('Fackel'));
    await svc.deposit(item('Fackel'));
    const ids = svc.entries().map(e => e.entryId);
    expect(new Set(ids).size).toBe(2);
  });

  it('deposits a copy — later edits to the sheet item do not reach into the bag', async () => {
    const original = item('Trank');
    await svc.deposit(original);
    original.name = 'Umbenannt';
    expect(svc.entries()[0].item.name).toBe('Trank');
  });

  it('reports failure and changes nothing when the server refuses', async () => {
    server.offline = true;
    expect(await svc.deposit(item('Seil'))).toBe(false);
    expect(svc.entries()).toEqual([]);
    expect(svc.notice()).not.toBe('');
  });

  it('hands a withdrawn item to the taker and removes it from the bag', async () => {
    await svc.deposit(item('Schwert'));
    const entryId = svc.entries()[0].entryId;
    const taken = await svc.withdraw(entryId);
    expect(taken?.name).toBe('Schwert');
    expect(svc.entries()).toEqual([]);
  });

  it('gives the item to exactly ONE of two simultaneous takers', async () => {
    await svc.deposit(item('Amulett'));
    const entryId = svc.entries()[0].entryId;

    const [a, b] = await Promise.all([svc.withdraw(entryId), svc.withdraw(entryId)]);
    const winners = [a, b].filter(Boolean);
    expect(winners.length).toBe(1);
    expect(winners[0]!.name).toBe('Amulett');
    expect(server.stash).toEqual([]);
  });

  it('tells the loser what happened instead of failing silently', async () => {
    await svc.deposit(item('Amulett'));
    const entryId = svc.entries()[0].entryId;
    await svc.withdraw(entryId);
    expect(await svc.withdraw(entryId)).toBeNull();
    expect(svc.notice()).toContain('schneller');
  });

  it('never loses an item when a withdraw fails', async () => {
    await svc.deposit(item('Ring'));
    server.offline = true;
    expect(await svc.withdraw(svc.entries()[0].entryId)).toBeNull();
    server.offline = false;
    expect(server.stash.length).toBe(1);
  });

  it('follows the broadcast list when someone else changes the bag', async () => {
    const foreign: PartyStashEntry = {
      entryId: 'stash_other', item: item('Karte'), addedAt: Date.now(),
    };
    server.stash = [foreign];
    server.patches$.next({ path: 'partyStash', value: server.stash } as JsonPatch);
    expect(svc.entries()[0].item.name).toBe('Karte');
  });

  it('ignores world patches that are not about the bag', async () => {
    await svc.deposit(item('Seil'));
    server.patches$.next({ path: 'gmDesk', value: [] } as JsonPatch);
    expect(svc.entries().length).toBe(1);
  });

  it('refuses to deposit when the character has no world', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: WorldSocketService, useValue: new FakeServer() }],
    });
    const lone = TestBed.inject(PartyStashService); // never attached to a world
    expect(await lone.deposit(item('Seil'))).toBe(false);
    expect(lone.notice()).toContain('Welt');
  });

  describe('Stapel im Beutel', () => {
    it('merges an identical stackable deposit into the pile already there', async () => {
      await svc.deposit(stack('Pfeil', 10));
      await svc.deposit(stack('Pfeil', 5));
      expect(svc.entries().length).toBe(1);
      expect(svc.entries()[0].item.amount).toBe(15);
    });

    it('keeps different items apart', async () => {
      await svc.deposit(stack('Pfeil', 10));
      await svc.deposit(stack('Bolzen', 5));
      expect(svc.entries().length).toBe(2);
    });

    it('never merges unstackable items', async () => {
      await svc.deposit(item('Schwert'));
      await svc.deposit(item('Schwert'));
      expect(svc.entries().length).toBe(2);
    });

    it('takes part of a pile and leaves the rest', async () => {
      await svc.deposit(stack('Pfeil', 10));
      const entryId = svc.entries()[0].entryId;

      const taken = await svc.withdraw(entryId, 4);
      expect(taken?.amount).toBe(4);
      expect(svc.entries()[0].item.amount).toBe(6);
    });

    it('empties the entry when the last units are taken', async () => {
      await svc.deposit(stack('Pfeil', 3));
      const entryId = svc.entries()[0].entryId;
      const taken = await svc.withdraw(entryId, 3);
      expect(taken?.amount).toBe(3);
      expect(svc.entries()).toEqual([]);
    });

    it('conserves units when two people split the same pile at once', async () => {
      await svc.deposit(stack('Pfeil', 10));
      const entryId = svc.entries()[0].entryId;

      const [a, b] = await Promise.all([svc.withdraw(entryId, 6), svc.withdraw(entryId, 6)]);
      const got = [a, b].filter(Boolean).reduce((sum, i) => sum + (i!.amount ?? 1), 0);
      const left = server.stash.reduce((sum, e) => sum + amountOf(e), 0);
      expect(got + left).toBe(10);
    });

    it('refuses to take zero', async () => {
      await svc.deposit(stack('Pfeil', 5));
      const entryId = svc.entries()[0].entryId;
      expect(await svc.withdraw(entryId, 0)).toBeNull();
      expect(server.stash[0].item.amount).toBe(5);
    });
  });
});
