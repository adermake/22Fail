import { TestBed } from '@angular/core/testing';
import { GrantService } from './grant.service';
import { CharacterSocketService } from './character-socket.service';
import { createEmptySheet, CharacterSheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { createDeskEntry, DeskEntry, PendingGrant } from '../model/gm-desk.model';
import { JsonPatch } from '../model/json-patch.model';

/**
 * Die Vergabe ist die Stelle, an der vorher alles auseinanderlief: doppelte Einträge, verlorenes
 * Wissen, stumm verschluckte Statuseffekte. Deshalb wird hier das komplette Typ→Feld-Mapping
 * geprüft, nicht nur der Gegenstands-Fall.
 */
describe('GrantService — Vergabe an Charaktere', () => {
  let service: GrantService;
  let sent: { characterId: string; patch: JsonPatch }[];
  let sheet: CharacterSheet;

  const socketStub = {
    sendPatch: (characterId: string, patch: JsonPatch) => sent.push({ characterId, patch }),
  };

  const item = (over: Partial<ItemBlock> = {}): ItemBlock =>
    ({ id: 'i1', name: 'Trank', stackable: true, amount: 1, ...over }) as ItemBlock;

  beforeEach(() => {
    sent = [];
    sheet = createEmptySheet();
    TestBed.configureTestingModule({
      providers: [GrantService, { provide: CharacterSocketService, useValue: socketStub }],
    });
    service = TestBed.inject(GrantService);
  });

  describe('Gegenstände', () => {
    it('füllt ein freies Fach statt hinten anzuhängen', () => {
      sheet.inventory = [item({ id: 'a', name: 'Schwert', stackable: false }), null, null];

      const patches = service.acceptPatches(sheet, createDeskEntry('item', item({ id: 'b', name: 'Seil', stackable: false })));

      expect(patches.length).toBe(1);
      expect(patches[0].path).toBe('/inventory/1');
      expect((patches[0].value as ItemBlock).name).toBe('Seil');
    });

    it('stapelt auf einen gleichen Gegenstand auf', () => {
      sheet.inventory = [null, item({ amount: 3 })];

      const patches = service.acceptPatches(sheet, createDeskEntry('item', item({ amount: 2 })));

      expect(patches[0].path).toBe('/inventory/1');
      expect((patches[0].value as ItemBlock).amount).toBe(5);
    });

    it('hängt an, wenn kein Fach frei ist', () => {
      sheet.inventory = [item({ id: 'a', name: 'Schwert', stackable: false })];

      const patches = service.acceptPatches(sheet, createDeskEntry('item', item({ id: 'b', name: 'Seil', stackable: false })));

      expect(patches[0].path).toBe('/inventory/-');
    });
  });

  describe('Materialien', () => {
    it('stapelt in resources statt ein zweites Mal anzulegen', () => {
      sheet.resources = [item({ name: 'Eisenerz', amount: 4 })];

      const patches = service.acceptPatches(sheet, createDeskEntry('resource', item({ name: 'Eisenerz', amount: 1 })));

      expect(patches[0].path).toBe('/resources/0');
      expect((patches[0].value as ItemBlock).amount).toBe(5);
    });

    it('hängt ein neues Material an', () => {
      const patches = service.acceptPatches(sheet, createDeskEntry('resource', item({ name: 'Kupfererz' })));
      expect(patches[0].path).toBe('/resources/-');
    });
  });

  describe('Wissen', () => {
    const kinds: [string, string][] = [
      ['material', '/knownMaterialIds/-'],
      ['forge-trait', '/knownForgeTraitIds/-'],
      ['ingredient', '/knownIngredientIds/-'],
      ['extractor', '/knownExtractorIds/-'],
      ['brew-trait', '/knownBrewTraitIds/-'],
    ];

    for (const [kind, path] of kinds) {
      it(`schreibt ${kind} nach ${path}`, () => {
        const entry = createDeskEntry('knowledge', { id: 'k1', name: 'Mithril' }, { knowledgeKind: kind as never });
        const patches = service.acceptPatches(sheet, entry);
        expect(patches.length).toBe(1);
        expect(patches[0].path).toBe(path);
        expect(patches[0].value).toBe('k1');
      });
    }

    it('nimmt auch eine blanke ID als Daten', () => {
      const entry = createDeskEntry('knowledge', 'k9', { knowledgeKind: 'material', name: 'Erz' });
      expect(service.acceptPatches(sheet, entry)[0].value).toBe('k9');
    });

    it('vergibt bereits bekanntes Wissen nicht doppelt', () => {
      sheet.knownMaterialIds = ['k1'];
      const entry = createDeskEntry('knowledge', { id: 'k1' }, { knowledgeKind: 'material' });
      expect(service.acceptPatches(sheet, entry)).toEqual([]);
    });
  });

  describe('Statuseffekte', () => {
    it('wendet an und merkt den Effekt als gesehen vor', () => {
      const entry = createDeskEntry('status-effect', { id: 'se1', name: 'Vergiftet', defaultDuration: 3 });

      const patches = service.acceptPatches(sheet, entry);

      expect(patches.map(p => p.path)).toEqual(['/activeStatusEffects/-', '/seenStatusEffectIds/-']);
      expect((patches[0].value as { stacks: number }).stacks).toBe(1);
      expect(patches[1].value).toBe('se1');
    });

    it('merkt einen bereits gesehenen Effekt nicht erneut vor', () => {
      sheet.seenStatusEffectIds = ['se1'];
      const patches = service.acceptPatches(sheet, createDeskEntry('status-effect', { id: 'se1' }));
      expect(patches.map(p => p.path)).toEqual(['/activeStatusEffects/-']);
    });
  });

  describe('Währung', () => {
    it('rechnet auf den vorhandenen Bestand auf', () => {
      sheet.currency = { copper: 5, silver: 1, gold: 0, platinum: 0 };

      const patches = service.acceptPatches(sheet, createDeskEntry('currency', { copper: 7, silver: 0, gold: 2, platinum: 0 }));

      expect(patches[0].path).toBe('/currency');
      expect(patches[0].value).toEqual({ copper: 12, silver: 1, gold: 2, platinum: 0 });
    });
  });

  describe('Einfache Listen', () => {
    const simple: [DeskEntry['type'], string][] = [
      ['rune', '/runes/-'],
      ['spell', '/spells/-'],
      ['skill', '/skills/-'],
      ['soul', '/souls/-'],
    ];

    for (const [type, path] of simple) {
      it(`hängt ${type} an ${path}`, () => {
        const patches = service.acceptPatches(sheet, createDeskEntry(type, { id: 'x', name: 'X' }));
        expect(patches[0].path).toBe(path);
      });
    }
  });

  describe('Angebot und Entscheidung', () => {
    it('schreibt beim Anbieten nur in die Warteschlange, nicht ins Inventar', () => {
      service.offer('char1', createDeskEntry('item', item()), 'Spielleiter');

      expect(sent.length).toBe(1);
      expect(sent[0].characterId).toBe('char1');
      expect(sent[0].patch.path).toBe('/pendingGrants/-');
      expect((sent[0].patch.value as PendingGrant).fromName).toBe('Spielleiter');
    });

    it('legt beim Annehmen ab und räumt die Warteschlange auf', () => {
      const grant: PendingGrant = { ...createDeskEntry('item', item({ stackable: false })), offeredAt: 1 };
      sheet.pendingGrants = [grant];

      service.accept('char1', sheet, grant);

      const paths = sent.map(s => s.patch.path);
      expect(paths).toContain('/inventory/-');
      expect(paths).toContain('/pendingGrants');
      expect(sent.find(s => s.patch.path === '/pendingGrants')!.patch.value).toEqual([]);
    });

    it('legt beim Ablehnen nichts ab', () => {
      const grant: PendingGrant = { ...createDeskEntry('item', item()), offeredAt: 1 };
      sheet.pendingGrants = [grant];

      service.decline('char1', sheet, grant);

      expect(sent.length).toBe(1);
      expect(sent[0].patch.path).toBe('/pendingGrants');
    });
  });
});
