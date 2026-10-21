import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, Output,
  SimpleChanges, ViewChild, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructSocket, ItemBlock } from '../../model/item-block.model';
import {
  AttachRefusal, ConstructMerkmal, attachChild, constructComplexity, constructMaterialEffects,
  constructMerkmale, constructRequirements, constructSockets, constructStability, constructWeapons,
  constructWeight, detachChild, flattenConstruct, isConstruct,
} from '../../utils/construct.util';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;

/** One node as drawn on the canvas. */
interface LaidOutNode {
  item: ItemBlock;
  depth: number;
  /** Where it actually sits: the auto position plus its own and its ancestors' nudges. */
  x: number;
  y: number;
  /** Where the tidy tree would have put it — the baseline a drag measures against. */
  autoX: number;
  autoY: number;
  /** The socket on the parent that holds it — what a detach button addresses. */
  parentId?: string;
  socketId?: string;
  sockets: { socket: ConstructSocket; cx: number; cy: number; index: number }[];
}

interface Layout {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
}

/**
 * A node being dragged.
 *
 * Attached and staged parts move in different coordinate spaces — an offset from auto-layout versus
 * an absolute canvas position — so the drag records where it started and how far left/up it may go,
 * and writes the result into whichever pair of fields applies.
 */
interface NodeDrag {
  item: ItemBlock;
  staged: boolean;
  /** Pointer position when the drag started. */
  startPX: number;
  startPY: number;
  /** The value being moved, as it was at mousedown. */
  startX: number;
  startY: number;
  /** Clamp floor in that same space, so nothing lands off the top-left and out of reach. */
  minX: number;
  minY: number;
  moved: boolean;
}

/** An unattached part lying on the canvas, waiting to be wired up. */
interface StagedNode {
  item: ItemBlock;
  x: number;
  y: number;
}

/** How far the pointer must travel before a click becomes a drag. */
const DRAG_THRESHOLD = 4;

/** A line from a parent's socket down to the child hanging off it. */
interface LaidOutEdge {
  d: string;
  /** Nutzungskomplexität this one connection costs — the child's depth. */
  cost: number;
  midX: number;
  midY: number;
}

const NODE_W = 164;
const NODE_H = 74;
const H_GAP = 30;
const V_GAP = 82;
const PAD = 40;

const REFUSAL_TEXT: Record<AttachRefusal, string> = {
  'no-such-socket': 'Diesen Anschluss gibt es nicht mehr.',
  'socket-occupied': 'Der Anschluss ist schon belegt.',
  'not-a-construct': 'Nur Konstrukte lassen sich anschließen.',
  'too-deep': 'Zu tief verschachtelt.',
  'cycle': 'Ein Teil kann sich nicht selbst enthalten.',
};

/**
 * Bauplan — the assembly view for a Konstrukt.
 *
 * Parts are dragged out of the rail on the left and dropped onto an Anschluss; the tree lays itself
 * out, so there is nothing to position by hand and nothing extra to keep in sync. Attaching MOVES
 * the part into the machine (it leaves the pool); detaching hands it straight back.
 *
 * Disassembly is deliberately never gated: a machine that is broken, inert or far over its Fokus
 * budget can still be taken apart. Anything else would leave people unable to recover their own gear.
 */
@Component({
  selector: 'app-construct-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './construct-editor.component.html',
  styleUrl: './construct-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstructEditorComponent implements OnChanges {
  /** The machine being assembled. Edited on a local copy; nothing leaves until `save`. */
  @Input({ required: true }) root!: ItemBlock;
  /** Loose Konstrukte the owner has lying around — the rail on the left. */
  @Input() pool: ItemBlock[] = [];
  /** Fokus available for this machine, after sustained spells and other Konstrukte. */
  @Input() fokusFree = 0;

  @Output() save = new EventEmitter<{ root: ItemBlock; pool: ItemBlock[] }>();
  @Output() cancel = new EventEmitter<void>();

  working = signal<ItemBlock | null>(null);
  /** Loose parts still on the shelf. Parts lying on the canvas live in `staged` instead. */
  workingPool = signal<ItemBlock[]>([]);
  /** Loose parts dropped on the canvas: on the workbench, connected to nothing yet. */
  staged = signal<ItemBlock[]>([]);
  /**
   * Bumped whenever a node is moved in place.
   *
   * Layout positions are mutated ON the item rather than by rebuilding the tree, so there is no new
   * root reference to publish. Copying the root instead (`working.set({...root})`) looked like it
   * worked, because children are shared through the copied `sockets` array and kept receiving
   * mutations — but the ROOT object was replaced, leaving the in-flight drag writing to an orphan.
   * That is why the root node used to move exactly one frame and then stick.
   */
  revision = signal(0);
  /** Part picked up in the rail — click-to-pick works alongside dragging. */
  picked = signal<ItemBlock | null>(null);
  /** Anschluss armed on the canvas, waiting for a part: the wire-first direction. */
  armedSocket = signal<{ nodeId: string; socketId: string } | null>(null);
  /** Cursor position inside the canvas, for the pending wire. */
  pointer = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  message = signal<string>('');

  /** The root this session was seeded from — see ngOnChanges. */
  private seededFrom: ItemBlock | null = null;

  ngOnChanges(_: SimpleChanges): void {
    /*
     * Seed on the ROOT's identity only, never on `pool`.
     *
     * The parent hands `pool` in from a getter, so it is a fresh array on every change-detection
     * pass and Angular reports it as changed every single time. Re-seeding on that wiped the
     * assembly — and the picked part — between the click on a part and the click on a socket, so
     * attaching silently did nothing at all.
     */
    if (this.root === this.seededFrom) return;
    this.seededFrom = this.root;
    // Deep copy: everything here is provisional until the player saves.
    this.working.set(this.root ? structuredClone(this.root) : null);

    // A loose part that carries canvas coordinates was left on the workbench last time; everything
    // else belongs on the shelf.
    const loose = (this.pool ?? []).filter(i => isConstruct(i)).map(i => structuredClone(i));
    this.staged.set(loose.filter(i => i.bauplanX !== undefined || i.bauplanY !== undefined));
    this.workingPool.set(loose.filter(i => i.bauplanX === undefined && i.bauplanY === undefined));

    this.picked.set(null);
    this.armedSocket.set(null);
    this.message.set('');
    this.revision.set(0);
  }

  // ── Live numbers ────────────────────────────────────────────────────────────

  get complexity(): number { return constructComplexity(this.working()); }
  get stability(): number { return constructStability(this.working()); }
  get weight(): number { return Math.round(constructWeight(this.working()) * 10) / 10; }
  get partCount(): number { return Math.max(0, flattenConstruct(this.working()).length - 1); }

  get weapons(): { label: string; effectivity: number }[] {
    return constructWeapons(this.working()).map(w => ({ label: w.label, effectivity: w.effectivity }));
  }

  /** Schmiedemerkmale of the whole machine with where each comes from — the right-hand panel. */
  get merkmale(): ConstructMerkmal[] {
    this.revision();
    return constructMerkmale(this.working());
  }

  get materialEffects(): { effect: string; trail: string; inactive: boolean }[] {
    this.revision();
    return constructMaterialEffects(this.working());
  }

  // ── View: pan + zoom, the same handling as the Runen editor ─────────────────
  //
  // Wheel zooms towards the pointer, middle mouse (or left on empty canvas) pans. Everything that
  // reads a pointer position goes through `toWorld`, so drops, drags and wires land where the
  // cursor is at any zoom.

  @ViewChild('canvasWrap') canvasWrapRef?: ElementRef<HTMLElement>;
  zoom = signal(1);
  panX = signal(0);
  panY = signal(0);
  private pan: { startX: number; startY: number; panX: number; panY: number; moved: boolean } | null = null;

  get transformStyle(): string {
    return `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoom()})`;
  }

  get zoomPercent(): number { return Math.round(this.zoom() * 100); }

  /** Pointer position in canvas (unzoomed) coordinates. */
  private toWorld(event: MouseEvent): { x: number; y: number } {
    // Unrendered (unit tests): treat the viewport origin as the canvas corner.
    const rect = this.canvasWrapRef?.nativeElement.getBoundingClientRect() ?? { left: 0, top: 0 };
    return {
      x: (event.clientX - rect.left - this.panX()) / this.zoom(),
      y: (event.clientY - rect.top - this.panY()) / this.zoom(),
    };
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.canvasWrapRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    this.zoomAround(event.deltaY < 0 ? 1.1 : 1 / 1.1, mx, my);
  }

  private zoomAround(factor: number, mx: number, my: number): void {
    const old = this.zoom();
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, old * factor));
    this.panX.set(mx - (mx - this.panX()) * (next / old));
    this.panY.set(my - (my - this.panY()) * (next / old));
    this.zoom.set(next);
  }

  zoomBy(factor: number): void {
    const rect = this.canvasWrapRef?.nativeElement.getBoundingClientRect();
    this.zoomAround(factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
  }

  resetView(): void {
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  /**
   * Start panning. Middle mouse anywhere; left only on empty canvas — nodes and Anschlüsse stop
   * their own mousedown, so a left press that reaches here hit the background.
   */
  onWrapMouseDown(event: MouseEvent): void {
    if (event.button !== 1 && event.button !== 0) return;
    if (event.button === 1) event.preventDefault();
    this.pan = { startX: event.clientX, startY: event.clientY, panX: this.panX(), panY: this.panY(), moved: false };
  }

  get isPanning(): boolean { return !!this.pan?.moved; }

  /** Anforderungen with the depth decay applied — what the wearer actually has to meet. */
  get requirements(): { label: string; value: number }[] {
    const req = constructRequirements(this.working());
    const labels: [keyof typeof req, string][] = [
      ['strength', 'STR'], ['dexterity', 'GES'], ['speed', 'SCH'],
      ['intelligence', 'INT'], ['constitution', 'KON'], ['chill', 'WIL'],
    ];
    return labels
      .map(([key, label]) => ({ label, value: req[key] ?? 0 }))
      .filter(e => e.value > 0);
  }

  /** Would this machine actually run on the Fokus available? */
  get fits(): boolean { return this.complexity <= this.fokusFree; }

  get overBy(): number { return Math.max(0, this.complexity - this.fokusFree); }

  // ── Layout ──────────────────────────────────────────────────────────────────

  get nodes(): LaidOutNode[] { return this.laidOut().nodes; }
  get edges(): LaidOutEdge[] { return this.laidOut().edges; }
  get canvasWidth(): number { return this.laidOut().width; }
  get canvasHeight(): number { return this.laidOut().height; }

  private layoutCache: { key: ItemBlock | null; rev: number; value: Layout } | null = null;

  /**
   * Cached on the root's identity AND the revision counter: structural edits replace the root,
   * moves bump the revision. Reading `revision()` here is also what registers the dependency that
   * repaints the canvas mid-drag.
   */
  private laidOut(): Layout {
    const root = this.working();
    const rev = this.revision();
    if (this.layoutCache?.key === root && this.layoutCache.rev === rev) return this.layoutCache.value;
    const value = this.computeLayout(root);
    this.layoutCache = { key: root, rev, value };
    return value;
  }

  /** Unattached parts on the workbench, laid out where they were dropped. */
  get stagedNodes(): StagedNode[] {
    this.revision();
    return this.staged().map((item, i) => ({
      item,
      x: item.bauplanX ?? PAD + i * (NODE_W + H_GAP),
      y: item.bauplanY ?? PAD,
    }));
  }

  /**
   * Tidy top-down tree, then each node's own nudge on top.
   *
   * A node's offset is inherited by everything below it, so dragging a branch carries its parts
   * along and only the part you actually grabbed moves on its own. Undragged machines lay
   * themselves out exactly as before — the tidy tree is the baseline, not a one-time seed.
   */
  private computeLayout(root: ItemBlock | null): Layout {
    if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

    const spanOf = (item: ItemBlock): number => {
      const kids = constructSockets(item).map(s => s.child).filter((c): c is ItemBlock => !!c);
      if (!kids.length) return NODE_W;
      const total = kids.reduce((sum, k) => sum + spanOf(k), 0) + H_GAP * (kids.length - 1);
      return Math.max(NODE_W, total);
    };

    const nodes: LaidOutNode[] = [];

    const place = (item: ItemBlock, depth: number, left: number,
                   inheritedX: number, inheritedY: number,
                   parentId?: string, socketId?: string): void => {
      const span = spanOf(item);
      const autoX = left + span / 2 - NODE_W / 2;
      const autoY = PAD + depth * (NODE_H + V_GAP);
      const dx = inheritedX + (item.bauplanDX ?? 0);
      const dy = inheritedY + (item.bauplanDY ?? 0);
      const x = autoX + dx;
      const y = autoY + dy;
      const socks = constructSockets(item);

      nodes.push({
        item, depth, x, y, autoX, autoY, parentId, socketId,
        sockets: socks.map((socket, index) => ({
          socket, index,
          cx: x + (NODE_W * (index + 1)) / (socks.length + 1),
          cy: y + NODE_H,
        })),
      });

      const kids = socks.filter(s => s.child);
      const kidsTotal = kids.reduce((sum, s) => sum + spanOf(s.child!), 0)
        + H_GAP * Math.max(0, kids.length - 1);
      let cursor = left + (span - kidsTotal) / 2;

      for (const socket of socks) {
        if (!socket.child) continue;
        place(socket.child, depth + 1, cursor, dx, dy, item.id ?? item.name, socket.id);
        cursor += spanOf(socket.child) + H_GAP;
      }
    };

    place(root, 0, PAD, 0, 0);

    // Wires second: a child may have been dragged anywhere, so both ends have to be final first.
    const byId = new Map(nodes.map(n => [n.item.id ?? n.item.name, n]));
    const edges: LaidOutEdge[] = [];
    for (const node of nodes) {
      if (!node.parentId || !node.socketId) continue;
      const port = byId.get(node.parentId)?.sockets.find(s => s.socket.id === node.socketId);
      if (!port) continue;
      const cx = node.x + NODE_W / 2;
      const midY = (port.cy + node.y) / 2;
      edges.push({
        d: `M ${port.cx} ${port.cy} C ${port.cx} ${midY}, ${cx} ${midY}, ${cx} ${node.y}`,
        cost: node.depth,
        midX: (port.cx + cx) / 2,
        midY,
      });
    }

    // Grow the canvas around wherever the parts ended up — attached or merely parked — so nothing
    // that was dragged out to the side becomes unreachable.
    const staged = this.staged();
    const width = Math.max(spanOf(root) + PAD * 2,
      ...nodes.map(n => n.x + NODE_W + PAD),
      ...staged.map(i => (i.bauplanX ?? 0) + NODE_W + PAD));
    const height = Math.max(PAD * 2 + NODE_H,
      ...nodes.map(n => n.y + NODE_H + PAD),
      ...staged.map(i => (i.bauplanY ?? 0) + NODE_H + PAD));
    return { nodes, edges, width, height };
  }

  // ── Assembly ────────────────────────────────────────────────────────────────
  //
  // A connection can be started from either end, like the Runen editor: pick a part and drop it on
  // an Anschluss, or pull a wire out of an Anschluss and click the part it should hold. Whichever
  // is armed, clicking the other end completes it.

  nodeId(node: LaidOutNode): string { return node.item.id ?? node.item.name; }

  isArmed(node: LaidOutNode, socket: ConstructSocket): boolean {
    const armed = this.armedSocket();
    return !!armed && armed.nodeId === this.nodeId(node) && armed.socketId === socket.id;
  }

  /** Click a part in the rail: completes an armed wire, or picks the part up. */
  pick(item: ItemBlock): void {
    const armed = this.armedSocket();
    if (armed) {
      this.attachByIds(armed.nodeId, armed.socketId, item);
      return;
    }
    this.picked.set(this.picked() === item ? null : item);
    this.message.set('');
  }

  onDragStart(item: ItemBlock): void {
    this.picked.set(item);
    this.message.set('');
  }

  /** Click an Anschluss: completes a picked part, or arms the wire for a part to be chosen. */
  socketClick(node: LaidOutNode, socket: ConstructSocket): void {
    if (socket.child) return;
    const part = this.picked();
    if (part) {
      this.attachByIds(this.nodeId(node), socket.id, part);
      return;
    }
    this.armedSocket.set(
      this.isArmed(node, socket) ? null : { nodeId: this.nodeId(node), socketId: socket.id },
    );
    this.message.set('');
  }

  /**
   * Drop a part anywhere on a node and it takes the first free Anschluss.
   *
   * Aiming at a 13px diamond was the whole problem — the node itself is a target big enough to hit,
   * and which socket a part sits in changes nothing about the machine.
   */
  dropOnNode(node: LaidOutNode): void {
    const part = this.picked();
    if (!part) return;
    const free = node.sockets.find(s => !s.socket.child);
    if (!free) {
      this.message.set(`„${node.item.name}" hat keinen freien Anschluss.`);
      return;
    }
    this.attachByIds(this.nodeId(node), free.socket.id, part);
  }

  private attachByIds(nodeId: string, socketId: string, part: ItemBlock): void {
    const root = this.working();
    if (!root) return;
    // An attached part takes its place from the tree, so its workbench coordinates go.
    const placed: ItemBlock = { ...part };
    delete placed.bauplanX;
    delete placed.bauplanY;

    const { root: next, refused } = attachChild(root, nodeId, socketId, placed);
    if (refused) {
      this.message.set(REFUSAL_TEXT[refused]);
      return;
    }
    this.working.set(next);
    this.workingPool.set(this.workingPool().filter(i => i !== part));
    this.staged.set(this.staged().filter(i => i !== part));
    this.picked.set(null);
    this.armedSocket.set(null);
    this.message.set('');
  }

  // ── The workbench: parts on the canvas, connected to nothing ────────────────

  /** Park a part on the canvas at a point. It is still loose — just no longer on the shelf. */
  private stageAt(part: ItemBlock, x: number, y: number): void {
    part.bauplanX = Math.max(8, x - NODE_W / 2);
    part.bauplanY = Math.max(8, y - NODE_H / 2);
    if (!this.staged().includes(part)) this.staged.set([...this.staged(), part]);
    this.workingPool.set(this.workingPool().filter(i => i !== part));
    this.picked.set(null);
    this.touchWorking();
  }

  /** Click on a parked part: completes an armed wire, or picks it up to place elsewhere. */
  stagedClick(staged: StagedNode): void {
    if (this.suppressClick) { this.suppressClick = false; return; }
    const armed = this.armedSocket();
    if (armed) {
      this.attachByIds(armed.nodeId, armed.socketId, staged.item);
      return;
    }
    this.picked.set(this.picked() === staged.item ? null : staged.item);
    this.message.set('');
  }

  /** Send a parked part back to the shelf. */
  unstage(staged: StagedNode): void {
    delete staged.item.bauplanX;
    delete staged.item.bauplanY;
    this.staged.set(this.staged().filter(i => i !== staged.item));
    this.workingPool.set([...this.workingPool(), staged.item]);
    if (this.picked() === staged.item) this.picked.set(null);
    this.touchWorking();
  }

  /** Empty canvas: park what is in hand there, or clear the selection. */
  onCanvasClick(event: MouseEvent): void {
    if (this.suppressClick) { this.suppressClick = false; return; }
    const part = this.picked();
    if (part) {
      const p = this.toWorld(event);
      this.stageAt(part, p.x, p.y);
      return;
    }
    this.clearSelection();
  }

  onCanvasDrop(event: MouseEvent): void {
    event.preventDefault();
    const part = this.picked();
    if (!part) return;
    const p = this.toWorld(event);
    this.stageAt(part, p.x, p.y);
  }

  clearSelection(): void {
    this.picked.set(null);
    this.armedSocket.set(null);
  }

  onCanvasMove(event: MouseEvent): void {
    const pan = this.pan;
    if (pan) {
      const dx = event.clientX - pan.startX;
      const dy = event.clientY - pan.startY;
      if (!pan.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      pan.moved = true;
      this.panX.set(pan.panX + dx);
      this.panY.set(pan.panY + dy);
      return;
    }

    const { x: px, y: py } = this.toWorld(event);

    const drag = this.nodeDrag;
    if (drag) {
      const movedBy = Math.abs(px - drag.startPX) + Math.abs(py - drag.startPY);
      if (!drag.moved && movedBy < DRAG_THRESHOLD) return;
      drag.moved = true;

      const x = Math.max(drag.minX, drag.startX + (px - drag.startPX));
      const y = Math.max(drag.minY, drag.startY + (py - drag.startPY));
      if (drag.staged) {
        drag.item.bauplanX = x;
        drag.item.bauplanY = y;
      } else {
        drag.item.bauplanDX = x;
        drag.item.bauplanDY = y;
      }
      this.touchWorking();
      return;
    }

    if (this.armedSocket()) this.pointer.set({ x: px, y: py });
  }

  // ── Moving nodes ────────────────────────────────────────────────────────────

  private nodeDrag: NodeDrag | null = null;
  /** Set for one event loop after a drag, so the trailing click does not also attach something. */
  private suppressClick = false;

  /** Move an attached node: what travels is its offset from the tidy-tree position. */
  startNodeDrag(node: LaidOutNode, event: MouseEvent): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    // Stops the browser starting a text/image drag out of the node's own label, which otherwise
    // swallows the mousemove stream and leaves the node stuck where it started.
    event.preventDefault();
    const p = this.toWorld(event);

    // What the node inherits from above: its final position minus its own contribution.
    const inheritedX = node.x - node.autoX - (node.item.bauplanDX ?? 0);
    const inheritedY = node.y - node.autoY - (node.item.bauplanDY ?? 0);
    this.nodeDrag = {
      item: node.item,
      staged: false,
      startPX: p.x,
      startPY: p.y,
      startX: node.item.bauplanDX ?? 0,
      startY: node.item.bauplanDY ?? 0,
      minX: 8 - node.autoX - inheritedX,
      minY: 8 - node.autoY - inheritedY,
      moved: false,
    };
  }

  /** Move a parked part: absolute canvas coordinates, with no tree position to offset from. */
  startStagedDrag(staged: StagedNode, event: MouseEvent): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    const p = this.toWorld(event);
    this.nodeDrag = {
      item: staged.item,
      staged: true,
      startPX: p.x,
      startPY: p.y,
      startX: staged.x,
      startY: staged.y,
      minX: 8,
      minY: 8,
      moved: false,
    };
  }

  endNodeDrag(): void {
    if (this.pan) {
      // A pan that moved must not also count as a click on the background.
      this.suppressClick = this.pan.moved;
      this.pan = null;
    }
    if (!this.nodeDrag) return;
    this.suppressClick = this.nodeDrag.moved;
    this.nodeDrag = null;
  }

  /** True while a node is being moved — the canvas uses it to suppress hover affordances. */
  get isDraggingNode(): boolean { return !!this.nodeDrag?.moved; }

  /** A click on a node: attach what is in hand, unless that click was the end of a drag. */
  nodeClick(node: LaidOutNode): void {
    if (this.suppressClick) { this.suppressClick = false; return; }
    this.dropOnNode(node);
  }

  hasManualLayout(): boolean {
    this.revision();
    return flattenConstruct(this.working()).some(n => n.item.bauplanDX || n.item.bauplanDY);
  }

  /** Drop every nudge and let the tidy tree take over again. Parked parts keep their spot. */
  resetLayout(): void {
    for (const node of flattenConstruct(this.working())) {
      delete node.item.bauplanDX;
      delete node.item.bauplanDY;
    }
    this.touchWorking();
  }

  /**
   * Announce an in-place mutation.
   *
   * A counter, NOT a copy of the root: see `revision`. Copying broke dragging the root node, since
   * the drag then held a reference to the object that had just been replaced.
   */
  private touchWorking(): void {
    this.revision.update(v => v + 1);
  }

  /** The wire trailing from an armed Anschluss to the cursor. */
  get pendingWire(): string | null {
    const armed = this.armedSocket();
    if (!armed) return null;
    const node = this.nodes.find(n => this.nodeId(n) === armed.nodeId);
    const port = node?.sockets.find(s => s.socket.id === armed.socketId);
    if (!port) return null;
    const p = this.pointer();
    const midY = (port.cy + p.y) / 2;
    return `M ${port.cx} ${port.cy} C ${port.cx} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  }

  /**
   * Pull a part (and everything under it) off the machine. Never blocked.
   *
   * It stays on the canvas exactly where it was rather than vanishing back to the shelf — taking
   * something apart to rearrange it is the common case, and watching it teleport away was jarring.
   */
  detach(node: LaidOutNode): void {
    const root = this.working();
    if (!root || !node.parentId || !node.socketId) return;
    const { root: next, detached } = detachChild(root, node.parentId, node.socketId);
    if (!detached) return;
    this.working.set(next);
    detached.bauplanX = node.x;
    detached.bauplanY = node.y;
    delete detached.bauplanDX;
    delete detached.bauplanDY;
    this.staged.set([...this.staged(), detached]);
    this.message.set('');
    this.touchWorking();
  }

  /** How many parts come away with this one — shown on the detach button. */
  subtreeSize(node: LaidOutNode): number {
    return flattenConstruct(node.item).length;
  }

  freeSocketCount(node: LaidOutNode): number {
    return node.sockets.filter(s => !s.socket.child).length;
  }

  /** Effektivität / Stabilität badge for one node, as forged. */
  nodeStat(item: ItemBlock): { icon: string; value: number } | null {
    if (item.efficiency) return { icon: 'i-effektivity', value: item.efficiency };
    if (item.stability) return { icon: 'i-stability', value: item.stability };
    return null;
  }

  confirm(): void {
    const root = this.working();
    if (!root) return;
    // Both shelf and workbench are still loose inventory items; only their coordinates differ.
    this.save.emit({ root, pool: [...this.workingPool(), ...this.staged()] });
  }

  close(): void { this.cancel.emit(); }
}
