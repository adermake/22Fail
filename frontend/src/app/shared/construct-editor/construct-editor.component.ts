import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructSocket, ItemBlock } from '../../model/item-block.model';
import {
  AttachRefusal, attachChild, constructComplexity, constructRequirements, constructSockets,
  constructStability, constructWeapons, constructWeight, detachChild, flattenConstruct, isConstruct,
} from '../../utils/construct.util';

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

/** A node being dragged, and what it takes to work out where it should land. */
interface NodeDrag {
  item: ItemBlock;
  /** Pointer position when the drag started. */
  startPX: number;
  startPY: number;
  /** The node's own nudge at that moment. */
  startDX: number;
  startDY: number;
  /** Auto-layout baseline, so the node can be kept on the canvas. */
  autoX: number;
  autoY: number;
  /** Ancestors' accumulated nudge — this node's own offset is relative to that. */
  inheritedX: number;
  inheritedY: number;
  moved: boolean;
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
  workingPool = signal<ItemBlock[]>([]);
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
    this.workingPool.set((this.pool ?? []).filter(i => isConstruct(i)).map(i => structuredClone(i)));
    this.picked.set(null);
    this.armedSocket.set(null);
    this.message.set('');
  }

  // ── Live numbers ────────────────────────────────────────────────────────────

  get complexity(): number { return constructComplexity(this.working()); }
  get stability(): number { return constructStability(this.working()); }
  get weight(): number { return Math.round(constructWeight(this.working()) * 10) / 10; }
  get partCount(): number { return Math.max(0, flattenConstruct(this.working()).length - 1); }

  get weapons(): { label: string; effectivity: number }[] {
    return constructWeapons(this.working()).map(w => ({ label: w.label, effectivity: w.effectivity }));
  }

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

  private layoutCache: { key: ItemBlock | null; value: Layout } | null = null;

  /** Cached on the root's identity — every edit replaces the root, so the key is free. */
  private laidOut(): Layout {
    const root = this.working();
    if (this.layoutCache?.key === root) return this.layoutCache.value;
    const value = this.computeLayout(root);
    this.layoutCache = { key: root, value };
    return value;
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

    // Grow the canvas around wherever the parts ended up, so dragged nodes stay reachable.
    const width = Math.max(spanOf(root) + PAD * 2,
      ...nodes.map(n => n.x + NODE_W + PAD));
    const height = Math.max(PAD * 2 + NODE_H,
      ...nodes.map(n => n.y + NODE_H + PAD));
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
    const { root: next, refused } = attachChild(root, nodeId, socketId, part);
    if (refused) {
      this.message.set(REFUSAL_TEXT[refused]);
      return;
    }
    this.working.set(next);
    this.workingPool.set(this.workingPool().filter(i => i !== part));
    this.picked.set(null);
    this.armedSocket.set(null);
    this.message.set('');
  }

  /** Clicking empty canvas drops whatever is in hand. */
  clearSelection(): void {
    this.picked.set(null);
    this.armedSocket.set(null);
  }

  onCanvasMove(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;

    const drag = this.nodeDrag;
    if (drag) {
      const movedBy = Math.abs(px - drag.startPX) + Math.abs(py - drag.startPY);
      if (!drag.moved && movedBy < DRAG_THRESHOLD) return;
      drag.moved = true;

      // The node's own nudge sits on top of its ancestors', so the pointer delta applies to it
      // directly. Clamped so nothing can be dragged off the top-left and become unreachable.
      const wantDX = drag.startDX + (px - drag.startPX);
      const wantDY = drag.startDY + (py - drag.startPY);
      drag.item.bauplanDX = Math.max(8 - drag.autoX - drag.inheritedX, wantDX);
      drag.item.bauplanDY = Math.max(8 - drag.autoY - drag.inheritedY, wantDY);
      this.touchWorking();
      return;
    }

    if (this.armedSocket()) this.pointer.set({ x: px, y: py });
  }

  // ── Moving nodes ────────────────────────────────────────────────────────────

  private nodeDrag: NodeDrag | null = null;
  /** Set for one event loop after a drag, so the trailing click does not also attach something. */
  private suppressClick = false;

  startNodeDrag(node: LaidOutNode, event: MouseEvent): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    const canvas = (event.currentTarget as HTMLElement).closest('.ce-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    this.nodeDrag = {
      item: node.item,
      startPX: event.clientX - rect.left,
      startPY: event.clientY - rect.top,
      startDX: node.item.bauplanDX ?? 0,
      startDY: node.item.bauplanDY ?? 0,
      autoX: node.autoX,
      autoY: node.autoY,
      // What the node inherits from above: its final position minus its own contribution.
      inheritedX: node.x - node.autoX - (node.item.bauplanDX ?? 0),
      inheritedY: node.y - node.autoY - (node.item.bauplanDY ?? 0),
      moved: false,
    };
  }

  endNodeDrag(): void {
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
    return flattenConstruct(this.working()).some(n => n.item.bauplanDX || n.item.bauplanDY);
  }

  /** Drop every nudge and let the tidy tree take over again. */
  resetLayout(): void {
    for (const node of flattenConstruct(this.working())) {
      delete node.item.bauplanDX;
      delete node.item.bauplanDY;
    }
    this.touchWorking();
  }

  /** Republish the root so the layout cache and the template both see the mutation. */
  private touchWorking(): void {
    const root = this.working();
    if (root) this.working.set({ ...root });
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

  /** Pull a part (and everything under it) back into the pool. Never blocked. */
  detach(node: LaidOutNode): void {
    const root = this.working();
    if (!root || !node.parentId || !node.socketId) return;
    const { root: next, detached } = detachChild(root, node.parentId, node.socketId);
    if (!detached) return;
    this.working.set(next);
    this.workingPool.set([...this.workingPool(), detached]);
    this.message.set('');
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
    this.save.emit({ root, pool: this.workingPool() });
  }

  close(): void { this.cancel.emit(); }
}
