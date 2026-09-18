import {
  MAX_CONSTRUCT_DEPTH, attachChild, constructArmorDebuff, constructComplexity, constructContents,
  constructDepth, constructRequirements, constructSkills, constructSpells, constructStability,
  constructValue, constructWeapons, constructWeight, detachChild, findConstructNode,
  flattenConstruct, isConstruct, usedSockets,
} from './construct.util';
import { ConstructSocket, ItemBlock } from '../model/item-block.model';

function part(name: string, partial: Partial<ItemBlock> = {}): ItemBlock {
  return {
    id: `id_${name}`, name, description: '', itemType: 'construct', weight: 1,
    lost: false, broken: false, isIdentified: true, requirements: {},
    ...partial,
  } as ItemBlock;
}

/** One socket, optionally filled. */
function socket(id: string, child?: ItemBlock, label?: string): ConstructSocket {
  return { id, label, child };
}

/**
 * The machine from the design sketch:
 *
 *   Kernkörper ─┬─ Arm ── Säge
 *               └─ Schild
 *
 * Komplexität 4: Arm 1 + Schild 1 + Säge 2.
 */
function sketch(overrides: {
  core?: Partial<ItemBlock>; arm?: Partial<ItemBlock>;
  saw?: Partial<ItemBlock>; shield?: Partial<ItemBlock>;
} = {}): ItemBlock {
  const saw = part('Säge', overrides.saw);
  const arm = part('Arm', { sockets: [socket('a1', saw, 'Werkzeug')], ...overrides.arm });
  const shield = part('Schild', overrides.shield);
  return part('Kernkörper', {
    sockets: [socket('c1', arm, 'Arm'), socket('c2', shield, 'Schild')],
    ...overrides.core,
  });
}

describe('Konstrukte', () => {
  describe('Struktur', () => {
    it('recognises the item type', () => {
      expect(isConstruct(part('Arm'))).toBe(true);
      expect(isConstruct(part('Schwert', { itemType: 'weapon' }))).toBe(false);
      expect(isConstruct(null)).toBe(false);
    });

    it('counts only filled sockets as used', () => {
      const core = part('Kernkörper', { sockets: [socket('c1', part('Arm')), socket('c2')] });
      expect(usedSockets(core).length).toBe(1);
    });

    it('walks root first, depth-first in socket order', () => {
      expect(flattenConstruct(sketch()).map(n => n.item.name))
        .toEqual(['Kernkörper', 'Arm', 'Säge', 'Schild']);
    });

    it('reports each node depth and where it hangs', () => {
      const nodes = flattenConstruct(sketch());
      expect(nodes.map(n => n.depth)).toEqual([0, 1, 2, 1]);
      const saw = nodes[2];
      expect(saw.parentId).toBe('id_Arm');
      expect(saw.socketId).toBe('a1');
      expect(saw.trail).toEqual(['Kernkörper', 'Arm', 'Säge']);
    });

    it('measures how deep the tree runs', () => {
      expect(constructDepth(sketch())).toBe(2);
      expect(constructDepth(part('Arm'))).toBe(0);
    });

    it('finds a node anywhere by id', () => {
      expect(findConstructNode(sketch(), 'id_Säge')?.depth).toBe(2);
      expect(findConstructNode(sketch(), 'id_Nichts')).toBeUndefined();
    });
  });

  describe('Nutzungskomplexität', () => {
    it('matches the design sketch: 1 + 1 + 2 = 4', () => {
      expect(constructComplexity(sketch())).toBe(4);
    });

    it('is zero for an unassembled Konstrukt — carrying one costs nothing', () => {
      expect(constructComplexity(part('Kernkörper'))).toBe(0);
      expect(constructComplexity(part('Kernkörper', { sockets: [socket('c1'), socket('c2')] }))).toBe(0);
    });

    it('charges a socket by the depth of what fills it', () => {
      const chain = part('A', {
        sockets: [socket('s', part('B', { sockets: [socket('s', part('C', {
          sockets: [socket('s', part('D'))],
        }))] }))],
      });
      expect(constructComplexity(chain)).toBe(1 + 2 + 3);
    });

    it('still charges for broken parts — they are bolted on either way', () => {
      expect(constructComplexity(sketch({ saw: { broken: true } }))).toBe(4);
      expect(constructComplexity(sketch({ arm: { broken: true } }))).toBe(4);
    });
  });

  describe('Anforderungen', () => {
    it('decays with depth: root fully, tier 2 half, tier 3 a third', () => {
      const req = { strength: 10 };
      // 10/1 + 10/2 + 10/2 + 10/3 = 23.33 → 23
      const tree = sketch({
        core: { requirements: req }, arm: { requirements: req },
        saw: { requirements: req }, shield: { requirements: req },
      });
      expect(constructRequirements(tree).strength).toBe(23);
    });

    it('makes a wide machine cost more Kraft and less Fokus than a tall one', () => {
      const req = { strength: 10 };
      const tall = sketch({
        core: { requirements: req }, arm: { requirements: req },
        saw: { requirements: req }, shield: { requirements: req },
      });
      const wide = part('Kernkörper', {
        requirements: req,
        sockets: [
          socket('c1', part('Arm', { requirements: req })),
          socket('c2', part('Schild', { requirements: req })),
          socket('c3', part('Säge', { requirements: req })),
        ],
      });

      expect(constructComplexity(tall)).toBe(4);
      expect(constructRequirements(tall).strength).toBe(23);
      expect(constructComplexity(wide)).toBe(3);
      expect(constructRequirements(wide).strength).toBe(25);
    });

    it('floors once per stat, not at every node', () => {
      // Three tier-2 parts at 1 STR: 0.5 × 3 = 1.5 → 1. Flooring per node would give 0.
      const tree = part('Kernkörper', {
        sockets: [
          socket('c1', part('A', { requirements: { strength: 1 } })),
          socket('c2', part('B', { requirements: { strength: 1 } })),
          socket('c3', part('C', { requirements: { strength: 1 } })),
        ],
      });
      expect(constructRequirements(tree).strength).toBe(1);
    });

    it('keeps each stat apart and omits the ones that come out at zero', () => {
      const tree = part('Kernkörper', {
        requirements: { strength: 12, intelligence: 4 },
        sockets: [socket('c1', part('Arm', { requirements: { dexterity: 6 } }))],
      });
      expect(constructRequirements(tree)).toEqual({ strength: 12, intelligence: 4, dexterity: 3 });
    });

    it('counts broken parts — a dead limb still weighs on the frame', () => {
      const tree = sketch({
        core: { requirements: { strength: 10 } }, arm: { requirements: { strength: 10 }, broken: true },
      });
      expect(constructRequirements(tree).strength).toBe(15);
    });
  });

  describe('Stabilität', () => {
    it('sums every part with no depth decay', () => {
      const tree = sketch({
        core: { stability: 50 }, arm: { stability: 20 }, saw: { stability: 5 }, shield: { stability: 40 },
      });
      expect(constructStability(tree)).toBe(115);
    });

    it('drops a broken part but keeps the rest of the machine working', () => {
      const tree = sketch({
        core: { stability: 50 }, arm: { stability: 20 },
        saw: { stability: 5 }, shield: { stability: 40, broken: true },
      });
      expect(constructStability(tree)).toBe(75);
    });

    it('drops a broken part together with everything below it', () => {
      const tree = sketch({
        core: { stability: 50 }, arm: { stability: 20, broken: true },
        saw: { stability: 5 }, shield: { stability: 40 },
      });
      expect(constructStability(tree)).toBe(90);
    });

    it('drops lost parts the same way', () => {
      const tree = sketch({ core: { stability: 50 }, shield: { stability: 40, lost: true } });
      expect(constructStability(tree)).toBe(50);
    });
  });

  describe('Waffen', () => {
    it('presents every cutting part as its own weapon, named by its trail', () => {
      const tree = sketch({ saw: { efficiency: 12 }, shield: { efficiency: 4 } });
      expect(constructWeapons(tree).map(w => [w.label, w.effectivity])).toEqual([
        ['Kernkörper / Arm / Säge', 12],
        ['Kernkörper / Schild', 4],
      ]);
    });

    it('names the root by itself when the root is the weapon', () => {
      expect(constructWeapons(part('Klinge', { efficiency: 9 }))[0].label).toBe('Klinge');
    });

    it('ignores parts that cannot hit anything', () => {
      expect(constructWeapons(sketch({ core: { stability: 50 } }))).toEqual([]);
    });

    it('leaves a broken blade out of the fight', () => {
      const tree = sketch({ saw: { efficiency: 12, broken: true }, shield: { efficiency: 4 } });
      expect(constructWeapons(tree).map(w => w.label)).toEqual(['Kernkörper / Schild']);
    });

    it('lets a Merkmal arm an armor-kind part — the resolver decides, not the forged field', () => {
      // The Arm is forged from armor materials and has no efficiency of its own, but a Merkmal
      // writing `item.effectivity += 8` must still make it a weapon here.
      const tree = sketch({ arm: { constructMaterialKind: 'armor' } });
      const withMerkmal = constructWeapons(tree, (item, prop) =>
        prop === 'effectivity' && item.name === 'Arm' ? 8 : 0);
      expect(withMerkmal.map(w => [w.label, w.effectivity])).toEqual([['Kernkörper / Arm', 8]]);
    });
  });

  describe('Gewicht, Malus und Wert', () => {
    it('sums weight over the whole machine, broken parts included', () => {
      const tree = sketch({ saw: { weight: 3, broken: true } });
      expect(constructWeight(tree)).toBe(1 + 1 + 3 + 1);
    });

    it('sums Rüstungsmalus of the working parts only', () => {
      const tree = sketch({ core: { armorDebuff: 3 }, shield: { armorDebuff: 2, broken: true } });
      expect(constructArmorDebuff(tree)).toBe(3);
    });

    it('sums what the whole machine is worth', () => {
      const tree = sketch({ core: { value: 100 }, arm: { value: 50 }, saw: { value: 25 } });
      expect(constructValue(tree)).toBe(175);
    });
  });

  describe('Fähigkeiten und Zauber', () => {
    it('gathers them from every working part and labels them with their origin', () => {
      const tree = sketch({
        saw: { embeddedSkills: [{ name: 'Sägen', type: 'active' } as any] },
        shield: { embeddedSpells: [{ name: 'Barriere' } as any] },
      });
      expect(constructSkills(tree).map(s => [s.name, s.class]))
        .toEqual([['Sägen', 'Konstrukt: Kernkörper / Arm / Säge']]);
      expect(constructSpells(tree).map(s => [s.name, (s as any).itemOrigin]))
        .toEqual([['Barriere', 'Kernkörper / Schild']]);
    });

    it('loses a broken part\'s abilities along with its subtree', () => {
      const tree = sketch({
        arm: { broken: true },
        saw: { embeddedSkills: [{ name: 'Sägen', type: 'active' } as any] },
      });
      expect(constructSkills(tree)).toEqual([]);
    });
  });

  describe('Zusammenbauen', () => {
    it('plugs a part into a free socket', () => {
      const core = part('Kernkörper', { sockets: [socket('c1', undefined, 'Arm')] });
      const { root, refused } = attachChild(core, 'id_Kernkörper', 'c1', part('Arm'));
      expect(refused).toBeUndefined();
      expect(root.sockets?.[0].child?.name).toBe('Arm');
      expect(constructComplexity(root)).toBe(1);
    });

    it('plugs into a socket deep in the tree', () => {
      const tree = sketch();
      const withGrip = attachChild(tree, 'id_Säge', 's1', part('Griff'));
      expect(withGrip.refused).toBe('no-such-socket');

      const sawWithSocket = sketch({ saw: { sockets: [socket('s1')] } });
      const { root } = attachChild(sawWithSocket, 'id_Säge', 's1', part('Griff'));
      expect(constructComplexity(root)).toBe(4 + 3);
    });

    it('leaves the original tree untouched', () => {
      const core = part('Kernkörper', { sockets: [socket('c1')] });
      attachChild(core, 'id_Kernkörper', 'c1', part('Arm'));
      expect(core.sockets?.[0].child).toBeUndefined();
    });

    it('gives every part entering the tree a real id', () => {
      // Two same-named parts without ids would otherwise share a Merkmal bookkeeping key.
      const core = part('Kernkörper', { sockets: [socket('c1')] });
      const nameless = part('Arm', {
        id: undefined, sockets: [socket('a1', part('Säge', { id: undefined }))],
      });
      const { root } = attachChild(core, 'id_Kernkörper', 'c1', nameless);
      const ids = flattenConstruct(root).map(n => n.item.id);
      expect(ids.every(Boolean)).toBe(true);
      expect(new Set(ids).size).toBe(3);
    });

    it('refuses an occupied socket', () => {
      expect(attachChild(sketch(), 'id_Kernkörper', 'c1', part('Arm')).refused).toBe('socket-occupied');
    });

    it('refuses a socket that does not exist', () => {
      expect(attachChild(sketch(), 'id_Kernkörper', 'zzz', part('Arm')).refused).toBe('no-such-socket');
      expect(attachChild(sketch(), 'id_Nichts', 'c1', part('Arm')).refused).toBe('no-such-socket');
    });

    it('refuses anything that is not a Konstrukt', () => {
      const core = part('Kernkörper', { sockets: [socket('c1')] });
      const sword = part('Schwert', { itemType: 'weapon' });
      expect(attachChild(core, 'id_Kernkörper', 'c1', sword).refused).toBe('not-a-construct');
    });

    it('refuses a part that already contains its own future parent', () => {
      const core = part('Kernkörper', { sockets: [socket('c1')] });
      const impossible = part('Arm', { sockets: [socket('a1', core)] });
      expect(attachChild(core, 'id_Kernkörper', 'c1', impossible).refused).toBe('cycle');
    });

    it('refuses to nest past the depth ceiling', () => {
      let chain = part('N0');
      for (let i = 1; i <= MAX_CONSTRUCT_DEPTH; i++) {
        chain = part(`N${i}`, { sockets: [socket('s', chain)] });
      }
      const core = part('Kernkörper', { sockets: [socket('c1')] });
      expect(attachChild(core, 'id_Kernkörper', 'c1', chain).refused).toBe('too-deep');
    });
  });

  describe('Zerlegen', () => {
    it('pulls a part back out with everything below it', () => {
      const { root, detached } = detachChild(sketch(), 'id_Kernkörper', 'c1');
      expect(detached?.name).toBe('Arm');
      expect(flattenConstruct(detached).map(n => n.item.name)).toEqual(['Arm', 'Säge']);
      expect(flattenConstruct(root).map(n => n.item.name)).toEqual(['Kernkörper', 'Schild']);
      expect(constructComplexity(root)).toBe(1);
    });

    it('works on a broken machine — you never lose gear you cannot repair', () => {
      const tree = sketch({ core: { broken: true }, arm: { broken: true, lost: true } });
      expect(detachChild(tree, 'id_Kernkörper', 'c1').detached?.name).toBe('Arm');
    });

    it('leaves the original tree untouched', () => {
      const tree = sketch();
      detachChild(tree, 'id_Kernkörper', 'c1');
      expect(tree.sockets?.[0].child?.name).toBe('Arm');
    });

    it('does nothing to an empty or unknown socket', () => {
      const tree = sketch();
      expect(detachChild(tree, 'id_Säge', 'nope').root).toBe(tree);
      const empty = part('Kernkörper', { sockets: [socket('c1')] });
      expect(detachChild(empty, 'id_Kernkörper', 'c1').detached).toBeUndefined();
    });

    it('round-trips: detaching then re-attaching restores the machine', () => {
      const original = sketch();
      const { root, detached } = detachChild(original, 'id_Kernkörper', 'c1');
      const { root: rebuilt } = attachChild(root, 'id_Kernkörper', 'c1', detached!);
      expect(flattenConstruct(rebuilt).map(n => n.item.name))
        .toEqual(flattenConstruct(original).map(n => n.item.name));
      expect(constructComplexity(rebuilt)).toBe(4);
    });
  });

  describe('Inhalt', () => {
    it('lists what deleting the machine would silently take along', () => {
      expect(constructContents(sketch()).map(i => i.name)).toEqual(['Arm', 'Säge', 'Schild']);
    });

    it('is empty for an unassembled Konstrukt', () => {
      expect(constructContents(part('Kernkörper', { sockets: [socket('c1')] }))).toEqual([]);
    });
  });
});
