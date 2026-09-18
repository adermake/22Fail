import { SimpleChanges } from '@angular/core';
import { ConstructEditorComponent } from './construct-editor.component';
import { ItemBlock } from '../../model/item-block.model';
import { constructComplexity, flattenConstruct } from '../../utils/construct.util';

/**
 * The Bauplan's interaction rules.
 *
 * The component has no injected dependencies, so it is driven directly — no TestBed needed, and the
 * tests stay about behaviour rather than about rendering.
 */

function part(name: string, sockets: number = 0): ItemBlock {
  return {
    id: `id_${name}`, name, description: '', itemType: 'construct', weight: 1,
    lost: false, broken: false, isIdentified: true, requirements: {},
    sockets: Array.from({ length: sockets }, (_, i) => ({ id: `${name}_s${i}`, label: `A${i}` })),
  } as ItemBlock;
}

function change(previousValue: unknown, currentValue: unknown) {
  return { previousValue, currentValue, firstChange: false, isFirstChange: () => false };
}

/**
 * What Angular actually does between two clicks.
 *
 * The parent feeds `pool` from a getter, so it is a NEW array every pass and Angular reports it as
 * changed — a POPULATED SimpleChanges, not an empty one. Passing `{}` here would make these tests
 * vacuous: the old implementation ignored that too.
 */
function changeDetection(c: ConstructEditorComponent, pool: ItemBlock[]): void {
  const previous = c.pool;
  c.pool = [...pool];
  c.ngOnChanges({ pool: change(previous, c.pool) } as unknown as SimpleChanges);
}

/** Opening the Bauplan on a machine: Angular reports every input as a first change. */
function open(c: ConstructEditorComponent, root: ItemBlock, pool: ItemBlock[]): void {
  const previousRoot = c.root;
  c.root = root;
  c.pool = pool;
  c.ngOnChanges({
    root: change(previousRoot, root),
    pool: change([], pool),
  } as unknown as SimpleChanges);
}

describe('Bauplan', () => {
  let c: ConstructEditorComponent;
  let core: ItemBlock;
  let arm: ItemBlock;
  let saw: ItemBlock;

  beforeEach(() => {
    c = new ConstructEditorComponent();
    core = part('Kernkoerper', 2);
    arm = part('Arm', 1);
    saw = part('Saege');
    c.fokusFree = 10;
    open(c, core, [arm, saw]);
  });

  /** The rail entry for a part, by name — the working copies are clones, not the originals. */
  function railItem(name: string): ItemBlock {
    return c.workingPool().find(i => i.name === name)!;
  }

  it('seeds a working copy without touching the originals', () => {
    expect(c.working()!.name).toBe('Kernkoerper');
    expect(c.working()).not.toBe(core);
    expect(c.workingPool().map(i => i.name)).toEqual(['Arm', 'Saege']);
  });

  describe('survives change detection', () => {
    // The bug that shipped: `pool` arrives from a parent getter, so its identity changes on every
    // pass. Re-seeding on that cleared the picked part between the click on a part and the click on
    // a socket, so attaching silently did nothing at all — it looked like a broken drop target.

    it('keeps the picked part across a pass', () => {
      c.pick(railItem('Arm'));
      expect(c.picked()).toBeTruthy();
      changeDetection(c, [arm, saw]);
      expect(c.picked()).toBeTruthy();
    });

    it('keeps work already done across a pass', () => {
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      expect(c.partCount).toBe(1);

      changeDetection(c, [arm, saw]);
      expect(c.partCount).toBe(1);
      expect(c.workingPool().map(i => i.name)).toEqual(['Saege']);
    });

    it('keeps an armed Anschluss across a pass', () => {
      c.socketClick(c.nodes[0], c.nodes[0].sockets[0].socket);
      expect(c.armedSocket()).toBeTruthy();
      changeDetection(c, [arm, saw]);
      expect(c.armedSocket()).toBeTruthy();
    });

    it('does re-seed when a different machine is opened', () => {
      c.pick(railItem('Arm'));
      open(c, part('Andere', 1), [arm, saw]);
      expect(c.working()!.name).toBe('Andere');
      expect(c.picked()).toBeNull();
    });
  });

  describe('part first', () => {
    it('attaches on a click into a free Anschluss', () => {
      c.pick(railItem('Arm'));
      c.socketClick(c.nodes[0], c.nodes[0].sockets[0].socket);
      expect(flattenConstruct(c.working()).map(n => n.item.name)).toEqual(['Kernkoerper', 'Arm']);
      expect(c.picked()).toBeNull();
      expect(c.workingPool().map(i => i.name)).toEqual(['Saege']);
    });

    it('attaches on a click anywhere on the node, taking the first free Anschluss', () => {
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      expect(c.working()!.sockets![0].child!.name).toBe('Arm');
    });

    it('fills the next free Anschluss rather than the occupied one', () => {
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      c.pick(railItem('Saege'));
      c.dropOnNode(c.nodes[0]);
      expect(c.working()!.sockets!.map(s => s.child?.name)).toEqual(['Arm', 'Saege']);
    });

    it('says so when a node has no room left', () => {
      open(c, part('Voll', 0), [arm, saw]);
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      expect(c.message()).toContain('keinen freien Anschluss');
      expect(c.partCount).toBe(0);
    });

    it('does nothing on an Anschluss that is already occupied', () => {
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      c.pick(railItem('Saege'));
      c.socketClick(c.nodes[0], c.nodes[0].sockets[0].socket);
      expect(c.picked()).toBeTruthy(); // still in hand
      expect(c.partCount).toBe(1);
    });
  });

  describe('wire first', () => {
    it('arms an Anschluss, then completes it on the part', () => {
      c.socketClick(c.nodes[0], c.nodes[0].sockets[0].socket);
      expect(c.armedSocket()).toEqual({ nodeId: 'id_Kernkoerper', socketId: 'Kernkoerper_s0' });

      c.pick(railItem('Arm'));
      expect(c.armedSocket()).toBeNull();
      expect(c.working()!.sockets![0].child!.name).toBe('Arm');
    });

    it('disarms when the same Anschluss is clicked again', () => {
      const socket = c.nodes[0].sockets[0].socket;
      c.socketClick(c.nodes[0], socket);
      c.socketClick(c.nodes[0], socket);
      expect(c.armedSocket()).toBeNull();
    });

    it('draws a wire to the cursor only while armed', () => {
      expect(c.pendingWire).toBeNull();
      c.socketClick(c.nodes[0], c.nodes[0].sockets[0].socket);
      expect(c.pendingWire).toContain('M ');
    });

    it('is cleared by a click on empty canvas', () => {
      c.socketClick(c.nodes[0], c.nodes[0].sockets[0].socket);
      c.clearSelection();
      expect(c.armedSocket()).toBeNull();
    });
  });

  describe('Zerlegen', () => {
    it('hands a part and its subtree back to the rail', () => {
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      const armNode = c.nodes.find(n => n.item.name === 'Arm')!;
      c.pick(railItem('Saege'));
      c.dropOnNode(armNode);
      expect(c.complexity).toBe(1 + 2);

      c.detach(c.nodes.find(n => n.item.name === 'Arm')!);
      expect(c.partCount).toBe(0);
      expect(c.workingPool().map(i => i.name)).toEqual(['Arm']);
      expect(flattenConstruct(c.workingPool()[0]).map(n => n.item.name)).toEqual(['Arm', 'Saege']);
    });

    it('works on a machine far over its Fokus budget', () => {
      c.fokusFree = 0;
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      expect(c.fits).toBe(false);
      c.detach(c.nodes.find(n => n.item.name === 'Arm')!);
      expect(c.partCount).toBe(0);
    });
  });

  describe('Kennzahlen', () => {
    it('reports Komplexität against the Fokus available', () => {
      c.fokusFree = 1;
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      expect(c.complexity).toBe(1);
      expect(c.fits).toBe(true);

      c.pick(railItem('Saege'));
      c.dropOnNode(c.nodes.find(n => n.item.name === 'Arm')!);
      expect(c.complexity).toBe(3);
      expect(c.fits).toBe(false);
      expect(c.overBy).toBe(2);
    });

    it('lays the tree out top-down with one row per depth', () => {
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      const ys = c.nodes.map(n => n.y);
      expect(ys[1]).toBeGreaterThan(ys[0]);
      expect(c.edges.length).toBe(1);
      expect(c.edges[0].cost).toBe(1);
    });
  });

  describe('Knoten verschieben', () => {
    /** A canvas-relative mouse event; the component reads clientX/Y against the canvas rect. */
    function mouse(x: number, y: number): MouseEvent {
      return {
        button: 0, clientX: x, clientY: y,
        stopPropagation: () => {},
        currentTarget: { closest: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0 }) }) },
      } as unknown as MouseEvent;
    }

    function drag(c: ConstructEditorComponent, node: ReturnType<() => any>, dx: number, dy: number) {
      c.startNodeDrag(node, mouse(100, 100));
      c.onCanvasMove({
        clientX: 100 + dx, clientY: 100 + dy,
        currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
      } as unknown as MouseEvent);
      c.endNodeDrag();
    }

    beforeEach(() => {
      c.pick(railItem('Arm'));
      c.dropOnNode(c.nodes[0]);
      c.pick(railItem('Saege'));
      c.dropOnNode(c.nodes.find(n => n.item.name === 'Arm')!);
    });

    function nodeAt(name: string) { return c.nodes.find(n => n.item.name === name)!; }

    it('moves a node by the pointer delta', () => {
      const before = nodeAt('Arm');
      drag(c, before, 60, 40);
      const after = nodeAt('Arm');
      expect(after.x).toBe(before.x + 60);
      expect(after.y).toBe(before.y + 40);
    });

    it('carries the parts underneath along', () => {
      const sawBefore = nodeAt('Saege');
      drag(c, nodeAt('Arm'), 60, 40);
      const sawAfter = nodeAt('Saege');
      expect(sawAfter.x).toBe(sawBefore.x + 60);
      expect(sawAfter.y).toBe(sawBefore.y + 40);
    });

    it('moves a leaf on its own without disturbing its parent', () => {
      const armBefore = nodeAt('Arm');
      drag(c, nodeAt('Saege'), 30, 0);
      expect(nodeAt('Arm').x).toBe(armBefore.x);
      expect(nodeAt('Saege').x).toBe(nodeAt('Saege').autoX + 30);
    });

    it('keeps the wire attached to both ends after a move', () => {
      drag(c, nodeAt('Saege'), 120, 20);
      const saw = nodeAt('Saege');
      const arm = nodeAt('Arm');
      const wire = c.edges.find(e => e.cost === 2)!;
      expect(wire.d).toContain(`${saw.x + 164 / 2} ${saw.y}`);
      expect(wire.d).toContain(`M ${arm.sockets[0].cx} ${arm.sockets[0].cy}`);
    });

    it('grows the canvas so a node dragged right stays reachable', () => {
      const before = c.canvasWidth;
      drag(c, nodeAt('Saege'), 500, 0);
      expect(c.canvasWidth).toBeGreaterThan(before);
      expect(c.canvasWidth).toBeGreaterThanOrEqual(nodeAt('Saege').x + 164);
    });

    it('will not let a node be dragged off the top-left', () => {
      drag(c, nodeAt('Arm'), -9999, -9999);
      expect(nodeAt('Arm').x).toBeGreaterThanOrEqual(0);
      expect(nodeAt('Arm').y).toBeGreaterThanOrEqual(0);
    });

    it('ignores a twitch below the drag threshold', () => {
      drag(c, nodeAt('Arm'), 2, 1);
      expect(nodeAt('Arm').item.bauplanDX).toBeUndefined();
    });

    it('does not attach anything on the click that ends a drag', () => {
      // Free the Säge up again so there IS something in hand that a stray click could attach.
      c.detach(nodeAt('Saege'));
      c.pick(railItem('Saege'));
      expect(c.picked()).toBeTruthy();

      c.startNodeDrag(nodeAt('Arm'), mouse(100, 100));
      c.onCanvasMove({
        clientX: 160, clientY: 100,
        currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
      } as unknown as MouseEvent);
      c.endNodeDrag();

      const before = c.partCount;
      c.nodeClick(nodeAt('Arm'));
      expect(c.partCount).toBe(before);
      expect(c.picked()).toBeTruthy(); // still in hand, not silently bolted on

      // …and the very next click, which is a real click, still works.
      c.nodeClick(nodeAt('Arm'));
      expect(c.partCount).toBe(before + 1);
    });

    it('restores the tidy tree on demand', () => {
      const armAuto = nodeAt('Arm').autoX;
      drag(c, nodeAt('Arm'), 90, 70);
      expect(c.hasManualLayout()).toBe(true);

      c.resetLayout();
      expect(c.hasManualLayout()).toBe(false);
      expect(nodeAt('Arm').x).toBe(armAuto);
    });

    it('keeps positions through a change-detection pass', () => {
      drag(c, nodeAt('Arm'), 50, 30);
      const moved = nodeAt('Arm').x;
      changeDetection(c, [arm, saw]);
      expect(nodeAt('Arm').x).toBe(moved);
    });

    it('sends the positions along on save, so they survive the session', () => {
      let emitted: { root: ItemBlock; pool: ItemBlock[] } | null = null;
      c.save.subscribe(e => (emitted = e));
      drag(c, nodeAt('Arm'), 45, 25);
      c.confirm();
      expect(emitted!.root.sockets![0].child!.bauplanDX).toBe(45);
      expect(emitted!.root.sockets![0].child!.bauplanDY).toBe(25);
    });
  });

  it('emits the machine and the leftovers on save', () => {
    let emitted: { root: ItemBlock; pool: ItemBlock[] } | null = null;
    c.save.subscribe(e => (emitted = e));
    c.pick(railItem('Arm'));
    c.dropOnNode(c.nodes[0]);
    c.confirm();

    expect(emitted).toBeTruthy();
    expect(constructComplexity(emitted!.root)).toBe(1);
    expect(emitted!.pool.map(i => i.name)).toEqual(['Saege']);
    // The originals were never touched — nothing is committed until the parent applies it.
    expect(core.sockets![0].child).toBeUndefined();
  });
});
