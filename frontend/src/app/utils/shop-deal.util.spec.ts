import { createEmptySheet } from '../model/character-sheet-model';
import { ShopDeal, createEmptyShopDeal } from '../model/current-events.model';
import {
  DEAL_CATEGORIES, canAffordDeal, cetrisAfterDeal, createDealGrant, dealCategory,
  dealCategoryById, dealGrantEntry, formatCustomPrice, knowsDealKnowledge, maxDealQuantity,
  paysInCetris,
} from './shop-deal.util';

describe('Shop-Deals', () => {
  const deal = (over: Partial<ShopDeal> = {}): ShopDeal => ({ ...createEmptyShopDeal(), ...over });
  const gold = (n: number) => ({ copper: 0, silver: 0, gold: n, platinum: 0 });

  describe('Inhalt', () => {
    it('nimmt die Datei-ID, wenn das Asset keine eigene trägt', () => {
      const grant = createDealGrant(dealCategoryById('material-knowledge'), { id: 'file-7', data: { name: 'Mithril' } });
      expect(grant).toEqual({
        category: 'material-knowledge', type: 'knowledge', knowledgeKind: 'material',
        data: { name: 'Mithril', id: 'file-7' },
      });
    });

    it('Material als Ware geht zu den Rohstoffen, als Wissen in die Wissensliste', () => {
      const file = { id: 'm1', data: { id: 'm1', name: 'Eisen' } };
      const ware = dealGrantEntry(deal({ grant: createDealGrant(dealCategoryById('material'), file) }));
      const wissen = dealGrantEntry(deal({ grant: createDealGrant(dealCategoryById('material-knowledge'), file) }));
      expect(ware?.type).toBe('resource');
      expect(wissen?.type).toBe('knowledge');
      expect(wissen?.knowledgeKind).toBe('material');
    });

    it('Freitext vergibt nichts', () => {
      expect(createDealGrant(dealCategoryById('text'), { id: 'x', data: {} })).toBeUndefined();
      expect(dealGrantEntry(deal({ description: 'Eine Nacht im Gasthaus' }))).toBeNull();
      expect(dealCategory(deal()).id).toBe('text');
    });

    it('liest Alt-Deals mit `item`/`statusEffect` weiter', () => {
      const old = deal({ statusEffect: { id: 'se1', name: 'Gesegnet' } as never });
      expect(dealCategory(old).id).toBe('status-effect');
      expect(dealGrantEntry(old)?.type).toBe('status-effect');
    });

    it('jede Kategorie außer Freitext hat einen Asset-Typ und einen Vergabe-Typ', () => {
      for (const c of DEAL_CATEGORIES.filter(c => c.id !== 'text')) {
        expect(c.assetType).toBeTruthy();
        expect(c.grantType).toBeTruthy();
      }
    });
  });

  describe('Wissen', () => {
    const knowledge = deal({
      grant: createDealGrant(dealCategoryById('forge-trait-knowledge'), { id: 't1', data: { id: 't1' } }),
    });

    it('erkennt bereits Bekanntes', () => {
      const sheet = createEmptySheet();
      expect(knowsDealKnowledge(sheet, knowledge)).toBe(false);
      sheet.knownForgeTraitIds = ['t1'];
      expect(knowsDealKnowledge(sheet, knowledge)).toBe(true);
    });

    it('lässt sich nur einmal kaufen', () => {
      expect(maxDealQuantity(knowledge)).toBe(1);
      expect(maxDealQuantity(deal())).toBe(999);
      expect(maxDealQuantity(deal({ quantity: 5, sold: 3 }))).toBe(2);
    });
  });

  describe('Preise', () => {
    it('Cetris werden abgebucht, aber nie unter null', () => {
      expect(cetrisAfterDeal(gold(5), deal({ price: gold(2) }), 2)).toEqual(gold(1));
      expect(canAffordDeal(gold(3), deal({ price: gold(2) }), 2)).toBe(false);
    });

    it('Ankauf zahlt aus', () => {
      expect(cetrisAfterDeal(gold(1), deal({ price: gold(2), isReverseDeal: true }), 3)).toEqual(gold(7));
    });

    it('eine eigene Währung bucht nichts und ist immer leistbar', () => {
      const custom = deal({ price: gold(2), customPrice: { amount: 3, currency: 'Drachenschuppen' } });
      expect(paysInCetris(custom)).toBe(false);
      expect(cetrisAfterDeal(gold(0), custom, 4)).toBeNull();
      expect(canAffordDeal(gold(0), custom, 4)).toBe(true);
      expect(formatCustomPrice(custom.customPrice!, 4)).toBe('12 Drachenschuppen');
    });
  });
});
