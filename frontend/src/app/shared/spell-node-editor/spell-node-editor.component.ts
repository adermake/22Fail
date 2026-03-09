import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy,
  ElementRef, ViewChild, HostListener, HostBinding, ChangeDetectorRef, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import {
  SpellGraph, SpellNode, SpellConnection, SpellPort, PendingConnection, PortPosition,
  buildRunePorts, portsCompatible, FLOW_COLOR, FLOW_TYPE, NEUTRAL_RUNE_ID,
} from './spell-node.model';
import { ImageUrlPipe } from '../image-url.pipe';

interface NodeState {
  node: SpellNode;
  ports: SpellPort[];
  rect: { w: number; h: number };
  floating: boolean; // subtle animation offset
}

@Component({
  selector: 'app-spell-node-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './spell-node-editor.component.html',
  styleUrl: './spell-node-editor.component.css',
})
export class SpellNodeEditorComponent implements OnInit, OnDestroy {

  @Input() spell: SpellBlock | null = null;
  @Input({ required: true }) availableRunes: RuneBlock[] = [];
  @Output() save        = new EventEmitter<SpellBlock>();
  @Output() cancel      = new EventEmitter<void>();
  @Output() deleteSpell = new EventEmitter<void>();

  get isNewSpell(): boolean { return this.spell === null; }

  @ViewChild('canvasWrap', { static: true }) canvasWrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('svgLayer',   { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  // ── Spell meta ─────────────────────────────────────────────────────────────
  spellName        = 'Neuer Zauber';
  spellDescription = '';

  // ── Rune palette ───────────────────────────────────────────────────────────
  paletteSearch = '';
  get filteredPaletteRunes(): RuneBlock[] {
    const q = this.paletteSearch.toLowerCase();
    const filtered = this.availableRunes.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.tags || []).some(t => t.toLowerCase().includes(q))
    );
    // Neutral node is always pinned at the top; matches search on 'neutral' / empty query
    const neutralMatches = !q || 'neutral'.includes(q);
    if (neutralMatches) {
      const neutralRune: RuneBlock = {
        name: NEUTRAL_RUNE_ID,
        glowColor: '#6b7280',
        tags: ['neutral'],
      } as RuneBlock;
      return [neutralRune, ...filtered];
    }
    return filtered;
  }

  // ── Graph state ────────────────────────────────────────────────────────────
  graph: SpellGraph = {
    startNode: { x: 160, y: 300 },
    nodes: [],
    connections: [],
  };

  nodeStates: Map<string, NodeState> = new Map();

  // ── Viewport ───────────────────────────────────────────────────────────────
  panX  = 0;
  panY  = 0;
  zoom  = 1;
  readonly MIN_ZOOM = 0.2;
  readonly MAX_ZOOM = 2.5;

  // Node size constants
  readonly NODE_IMG  = 110;  // rune image size (square)
  readonly NODE_W    = 110;  // alias kept for drop centering
  readonly PORT_R    = 8;    // port circle radius
  readonly PORT_GAP  = 28;   // vertical spacing between stacked ports

  // ── Interaction state ──────────────────────────────────────────────────────
  private isPanning    = false;
  private panStartX    = 0;
  private panStartY    = 0;
  private panStartPanX = 0;
  private panStartPanY = 0;

  draggingNodeId: string | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Signals — drive template reactivity in Angular 21 zoneless
  pending             = signal<PendingConnection | null>(null);
  hoveredPort         = signal<PortPosition | null>(null);
  graphNodesSig       = signal<SpellNode[]>([]);
  graphConnectionsSig = signal<SpellConnection[]>([]);
  selectedConnectionId: string | null = null;

  // Multi-select
  selectedNodeIds = new Set<string>();
  // Selected waypoints: connId → set of waypoint indices
  selectedWaypoints = new Map<string, Set<number>>();
  // Start node box-select state
  startNodeSelected = false;

  // Undo/redo stacks
  private undoStack: SpellGraph[] = [];
  private redoStack: SpellGraph[] = [];
  // Copy/paste clipboard
  private clipboard: { nodes: SpellNode[]; connections: SpellConnection[] } | null = null;

  // Expose for cursor CSS: set on host element when user is actively dragging a waypoint
  @HostBinding('class.wp-dragging')
  get isWpDragging(): boolean { return !!this.pullingWaypointConnId || !!this.draggingWaypointConnId; }

  // Marquee (selection box) state
  marqueeActive = false;
  marqueeStartX = 0;
  marqueeStartY = 0;
  marqueeEndX   = 0;
  marqueeEndY   = 0;


  // ── Waypoint drag state ────────────────────────────────────────────────────
  // Dragging an EXISTING waypoint circle:
  draggingWaypointConnId: string | null = null;
  draggingWaypointIndex = -1;
  // Pulling a NEW waypoint out of a line segment (mousedown on conn-hit, not on a waypoint):
  pullingWaypointConnId: string | null = null;
  pullingWaypointSegIndex = -1;  // insert position in waypoints array
  pullingWaypointPos: { x: number; y: number } | null = null;
  // Snap grid shown while dragging/pulling a waypoint:
  waypointSnapGrid: { x: number; y: number }[] = [];
  // Node drag snap indicators (world coords of matched port Ys/Xs)
  nodeDragSnapLines: { axis: 'x' | 'y'; v: number }[] = [];

  // Rune inspector panel (right sidebar)
  inspectedRune: RuneBlock | null = null;

  // Save feedback
  savedFeedback = false;
  lastSavedJson  = '';

  // ── Close-confirmation dialog ──
  showCloseDialog = false;

  // ── Quick-search popup state (drop connection into void to place+connect a rune) ──
  qsOpen     = false;
  qsX        = 0;
  qsY        = 0;
  qsWorldX   = 0;
  qsWorldY   = 0;
  qsQuery    = '';
  qsPending: PendingConnection | null = null;

  get qsResults(): RuneBlock[] {
    const q = this.qsQuery.toLowerCase().trim();
    return this.availableRunes
      .filter(r => r.name !== NEUTRAL_RUNE_ID && (q === '' || r.name.toLowerCase().includes(q)))
      .slice(0, 12);
  }

  openQuickSearch(pending: PendingConnection, clientX: number, clientY: number) {
    const world = this.clientToWorld(clientX, clientY);
    this.qsOpen    = true;
    this.qsX       = Math.min(clientX, window.innerWidth  - 260);
    this.qsY       = Math.min(clientY, window.innerHeight - 340);
    this.qsWorldX  = world.x;
    this.qsWorldY  = world.y;
    this.qsQuery   = '';
    this.qsPending = { ...pending };
    setTimeout(() => (document.querySelector('.qs-input') as HTMLInputElement | null)?.focus(), 0);
  }

  closeQuickSearch() {
    this.qsOpen    = false;
    this.qsQuery   = '';
    this.qsPending = null;
  }

  selectQsRune(rune: RuneBlock) {
    if (!this.qsPending) return;
    this.pushUndo();
    const pending = { ...this.qsPending };
    const wx = this.qsWorldX;
    const wy = this.qsWorldY;
    this.closeQuickSearch();
    const newId = `node-${this.nextId++}`;
    const newNode: SpellNode = { id: newId, runeId: rune.name, x: wx - this.NODE_IMG / 2, y: wy - this.NODE_IMG / 2 };
    this.graph.nodes = [...this.graph.nodes, newNode];
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    const allPorts = this.allPortPositions().filter(p => p.nodeId === newId);
    // Prefer a port whose kind specifically matches the pending connection kind
    const preferredKind = (pending.kind === 'flow-out') ? 'flow-in' : (pending.kind === 'data-out') ? 'data-in' : 'flow-in';
    const inputPort =
      allPorts.find(p => p.kind === preferredKind && this.canConnect(pending, p)) ??
      allPorts.find(p => (p.kind === 'flow-in' || p.kind === 'data-in') && this.canConnect(pending, p));
    if (inputPort) {
      this.createConnection(pending, inputPort);
    }
  }

  /** True when the rune has at least one input port compatible with the current pending connection. */
  isRuneCompatibleWithPending(rune: RuneBlock): boolean {
    if (!this.qsPending) return true;
    const ports = buildRunePorts(rune as any);
    const pk = this.qsPending.kind;
    if (pk === 'flow-out') return ports.some(p => p.kind === 'flow-in');
    if (pk === 'data-out') {
      return ports.some(p => p.kind === 'data-in' &&
        (p.types.length === 0 || this.qsPending!.types.length === 0 ||
          p.types.some(t => this.qsPending!.types.includes(t))));
    }
    return true;
  }

  /**
   * Compute badge screen positions for a connection, enforcing a minimum
   * screen-space gap of MIN_D pixels between badge centres.
   * Returns { condition, passthrough, delay } each as {x,y} or null.
   */
  getBadgePositions(c: SpellConnection): {
    condition:   { x: number; y: number } | null;
    passthrough: { x: number; y: number } | null;
    delay:       { x: number; y: number } | null;
  } {
    const MIN_D = 36; // min screen pixels between badge centres
    const condition   = c.condition        ? this.getPointOnPath(c, 0.50) : null;
    let   passthrough = c.passthroughEnabled ? this.getPointOnPath(c, 0.15) : null;
    let   delay       = c.lineDelay          ? this.getPointOnPath(c, 0.32) : null;

    // Nudge delay forward until it clears the passthrough badge
    if (passthrough && delay) {
      for (let t = 0.32; t <= 0.70; t += 0.04) {
        delay = this.getPointOnPath(c, t);
        if (Math.hypot(delay.x - passthrough.x, delay.y - passthrough.y) >= MIN_D) break;
      }
    }
    // Nudge condition forward if it overlaps passthrough or delay
    if (condition) {
      for (let t = 0.50; t <= 0.88; t += 0.04) {
        const pt = this.getPointOnPath(c, t);
        const dP = passthrough ? Math.hypot(pt.x - passthrough.x, pt.y - passthrough.y) : Infinity;
        const dD = delay       ? Math.hypot(pt.x - delay.x,       pt.y - delay.y)       : Infinity;
        if (dP >= MIN_D && dD >= MIN_D) { /* condition stays at midpoint for readability; keep going */ break; }
      }
      // Keep condition at t=0.50 always for visual balance — only nudge pass/delay
    }
    return { condition, passthrough, delay };
  }

  // Track mousedown position to distinguish click vs drag on rune nodes
  private lastMouseDownX = 0;
  private lastMouseDownY = 0;

  // Expose for template
  readonly NEUTRAL_RUNE_ID = NEUTRAL_RUNE_ID;

  // ── Start node flow-out drag counter ──────────────────────────────────────
  private nextId = 1;

  // ── Animation ─────────────────────────────────────────────────────────────
  private animFrame = 0;

  // Bound document event handlers (stored for removeEventListener)
  private boundMouseMove!: (e: MouseEvent) => void;
  private boundMouseUp!:   (e: MouseEvent) => void;

  constructor(private cdr: ChangeDetectorRef) {}

  // ────────────────────────────────────────────────────────────────────────────
  ngOnInit() {
    document.body.style.overflow = 'hidden';
    if (this.spell) {
      this.spellName        = this.spell.name;
      this.spellDescription = this.spell.description || '';
      if (this.spell.graph) {
        this.graph = JSON.parse(JSON.stringify(this.spell.graph));
        // Advance nextId past all existing IDs to prevent duplicate-ID collisions
        const allNums = [
          ...this.graph.nodes.map((n: any) => parseInt(n.id.replace(/[^0-9]/g, ''), 10)),
          ...this.graph.connections.map((c: any) => parseInt(c.id.replace(/[^0-9]/g, ''), 10)),
        ].filter((v: number) => !isNaN(v));
        if (allNums.length > 0) this.nextId = Math.max(...allNums) + 1;
      }
    }
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    this.graphConnectionsSig.set(this.graph.connections);
    this.lastSavedJson = JSON.stringify(this.graph);

    // Register document-level mouse listeners manually so they always fire
    // and are not subject to zone/CD timing issues.
    this.boundMouseMove = (e: MouseEvent) => this.handleMouseMove(e);
    this.boundMouseUp   = (e: MouseEvent) => this.handleMouseUp(e);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup',   this.boundMouseUp);

    this.startAnimation();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    cancelAnimationFrame(this.animFrame);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup',   this.boundMouseUp);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Animation loop — drives change detection every frame so interactive drags
  // (pending connection line, node dragging, panning) stay smooth.
  private startAnimation() {
    const tick = () => {
      this.cdr.detectChanges();
      this.animFrame = requestAnimationFrame(tick);
    };
    this.animFrame = requestAnimationFrame(tick);
  }

  nodeFloatY(_index: number): number { return 0; }

  // ────────────────────────────────────────────────────────────────────────────
  // Build NodeState from graph
  private rebuildNodeStates() {
    const newMap = new Map<string, NodeState>();
    for (const node of this.graph.nodes) {
      const existing = this.nodeStates.get(node.id);
      const isNeutral = node.runeId === NEUTRAL_RUNE_ID;
      const rune = isNeutral ? { name: NEUTRAL_RUNE_ID } : this.availableRunes.find(r => r.name === node.runeId);
      const ports = rune ? buildRunePorts(rune as any) : [
        { id: 'flow-in',  kind: 'flow-in'  as const, name: 'Fluss', color: FLOW_COLOR, types: FLOW_TYPE },
        { id: 'flow-out', kind: 'flow-out' as const, name: 'Fluss', color: FLOW_COLOR, types: FLOW_TYPE },
      ];
      const h = this.NODE_IMG;
      newMap.set(node.id, {
        node,
        ports,
        rect: { w: this.NODE_W, h },
        floating: existing?.floating ?? false,
      });
    }
    this.nodeStates = newMap;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Port world positions — MUST exactly match the CSS absolute positioning in the template
  allPortPositions(): PortPosition[] {
    const result: PortPosition[] = [];

    // Start node: flow-out on right edge of the 68px circle
    result.push({
      nodeId: 'start', portId: 'flow-out-0', kind: 'flow-out', color: FLOW_COLOR, types: FLOW_TYPE,
      x: this.graph.startNode.x + 34,
      y: this.graph.startNode.y,
    });

    // Rune nodes — ports centered vertically around the image center
    for (const ns of this.nodeStates.values()) {
      const n = ns.node;
      const isNeutral = n.runeId === NEUTRAL_RUNE_ID;
      const ins  = ns.ports.filter(p => p.kind === 'flow-in'  || p.kind === 'data-in');
      const outs = ns.ports.filter(p => p.kind === 'flow-out' || p.kind === 'data-out');
      const imgCY = n.y + this.NODE_IMG / 2;

      // Neutral nodes inherit color/types from their connected input
      const neutralInfo = isNeutral ? this.getNeutralPortInfo(n.id) : null;

      // Left edge (x = node.x), ports centered around image midpoint
      ins.forEach((p, i) => {
        result.push({
          nodeId: n.id, portId: p.id, kind: p.kind,
          color: neutralInfo ? neutralInfo.color : p.color,
          types: neutralInfo ? neutralInfo.types : p.types,
          x: n.x,
          y: imgCY - ((ins.length - 1) * this.PORT_GAP / 2) + i * this.PORT_GAP,
        });
      });

      // Right edge (x = node.x + NODE_IMG)
      outs.forEach((p, i) => {
        result.push({
          nodeId: n.id, portId: p.id, kind: p.kind,
          color: neutralInfo ? neutralInfo.color : p.color,
          types: neutralInfo ? neutralInfo.types : p.types,
          x: n.x + this.NODE_IMG,
          y: imgCY - ((outs.length - 1) * this.PORT_GAP / 2) + i * this.PORT_GAP,
        });
      });
    }
    return result;
  }

  /** Returns the color+types flowing through a neutral node (derived from its single input connection). */
  private getNeutralPortInfo(nodeId: string): { color: string; types: string[] } {
    const inConn = this.graph.connections.find(c => c.toNodeId === nodeId && c.toPortId === 'neutral-in');
    if (!inConn) return { color: '#6b7280', types: FLOW_TYPE };
    if (inConn.fromNodeId === 'start') return { color: FLOW_COLOR, types: FLOW_TYPE };
    const srcNs = this.nodeStates.get(inConn.fromNodeId);
    if (!srcNs) return { color: '#6b7280', types: FLOW_TYPE };
    const srcPort = srcNs.ports.find(p => p.id === inConn.fromPortId);
    if (!srcPort) return { color: '#6b7280', types: FLOW_TYPE };
    return { color: srcPort.color, types: srcPort.types };
  }

  private startNodeFlowOuts(): PortPosition[] {
    // Count how many outgoing connections start node already has
    const existing = this.graph.connections.filter(c => c.fromNodeId === 'start');
    const positions: PortPosition[] = [];
    // One fixed output at top
    positions.push({
      nodeId: 'start', portId: 'flow-out-0', kind: 'flow-out', color: FLOW_COLOR, types: FLOW_TYPE,
      x: this.graph.startNode.x + 34,
      y: this.graph.startNode.y,
    });
    return positions;
  }

  startPortPos(): { x: number; y: number } {
    return {
      x: this.graph.startNode.x + 34,
      y: this.graph.startNode.y,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Queen-movement router — all segments must be H, V, or 45° diagonal.
  // Returns intermediate world-space waypoints between (x1,y1)→(x2,y2) (endpoints NOT included).
  // Strategy: H → diagonal → H, splitting horizontal remainder evenly.
  queenRoute(x1: number, y1: number, x2: number, y2: number): { x: number; y: number }[] {
    const dx = x2 - x1, dy = y2 - y1;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx < 0.5 || ady < 0.5) return [];          // horizontal or vertical — direct
    if (Math.abs(adx - ady) < 0.5) return [];        // exact 45° diagonal — direct
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
    const diag = Math.min(adx, ady);
    const hBefore = (adx - diag) / 2;
    const pts: { x: number; y: number }[] = [];
    if (hBefore > 0.5) pts.push({ x: x1 + sx * hBefore, y: y1 });
    pts.push({ x: x1 + sx * (hBefore + diag), y: y1 + sy * diag });
    return pts;
  }

  // Build SVG path (screen space) running queenRoute between each consecutive world-space point pair.
  private buildQueenPath(worldPoints: { x: number; y: number }[]): string {
    if (worldPoints.length < 2) return '';
    const all: { x: number; y: number }[] = [worldPoints[0]];
    for (let i = 0; i < worldPoints.length - 1; i++) {
      const a = worldPoints[i], b = worldPoints[i + 1];
      all.push(...this.queenRoute(a.x, a.y, b.x, b.y), b);
    }
    return all.map((p, i) => {
      const s = this.worldToCanvasLocal(p.x, p.y);
      return `${i === 0 ? 'M' : 'L'} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
    }).join(' ');
  }

  // Loop arc — rectangular arch going upward (circuit-board style, no bezier)
  private loopArcPathScreen(c: SpellConnection): string {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return '';
    const worldDy = Math.abs(from.y - to.y);
    const rise = Math.max(80, worldDy * 0.8 + 80);
    const topY = Math.min(from.y, to.y) - rise;
    const pts = [
      { x: from.x, y: from.y },
      { x: from.x, y: topY   },
      { x: to.x,   y: topY   },
      { x: to.x,   y: to.y   },
    ];
    return pts.map((p, i) => {
      const s = this.worldToCanvasLocal(p.x, p.y);
      return `${i === 0 ? 'M' : 'L'} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
    }).join(' ');
  }

  // Compute snap-grid points for a control point dragged between prev→next.
  // Returns positions where both prev→pt and pt→next are queen-movement.
  computeSnapGrid(prev: { x: number; y: number }, next: { x: number; y: number }): { x: number; y: number }[] {
    const grid: { x: number; y: number }[] = [];
    const dx = next.x - prev.x, dy = next.y - prev.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;

    // Candidate intersections: corners where one segment is H/V/45 from prev and other from next
    const cxs = [prev.x, next.x, (prev.x + next.x) / 2,
                 prev.x + sx * ady, prev.x - sx * ady,
                 next.x + sx * ady, next.x - sx * ady];
    const cys = [prev.y, next.y, (prev.y + next.y) / 2,
                 prev.y + sy * adx, prev.y - sy * adx,
                 next.y + sy * adx, next.y - sy * adx];

    for (const cx of cxs) {
      for (const cy of cys) {
        const p = { x: cx, y: cy };
        if (this.isQueenMove(prev, p) && this.isQueenMove(p, next)) {
          grid.push(p);
        }
      }
    }
    // Auto-route midpoints from prev→next
    grid.push(...this.queenRoute(prev.x, prev.y, next.x, next.y));

    // Deduplicate
    const seen = new Set<string>();
    return grid.filter(p => {
      const k = `${Math.round(p.x)},${Math.round(p.y)}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }

  isQueenMove(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
    const dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y);
    return dx < 0.5 || dy < 0.5 || Math.abs(dx - dy) < 0.5;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Connection path helpers
  connectionPath(_c: SpellConnection): string { return ''; } // world-space — unused

  pendingPath(): string { return ''; } // world-space — unused

  // Screen-space pending path
  pendingPathScreen(): string {
    const p = this.pending();
    if (!p) return '';
    const isInput = p.kind === 'flow-in' || p.kind === 'data-in';
    const fx = isInput ? p.toX : p.fromX, fy = isInput ? p.toY : p.fromY;
    const tx = isInput ? p.fromX : p.toX, ty = isInput ? p.fromY : p.toY;
    return this.buildQueenPath([{ x: fx, y: fy }, { x: tx, y: ty }]);
  }

  pendingColor(): string {
    return this.pending()?.color ?? '#ffffff';
  }

  // Screen-space (canvas-wrap-local) — used by conn-overlay-svg
  connectionPathScreen(c: SpellConnection): string {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return '';
    const wps = c.waypoints ?? [];
    const liveWps = (this.pullingWaypointConnId === c.id && this.pullingWaypointPos)
      ? [
          ...wps.slice(0, this.pullingWaypointSegIndex),
          this.pullingWaypointPos,
          ...wps.slice(this.pullingWaypointSegIndex),
        ]
      : wps;
    return this.buildQueenPath([from, ...liveWps, to]);
  }

  private resolvePortWorldPos(nodeId: string, portId: string): { x: number; y: number } | null {
    const all = this.allPortPositions();
    return all.find(p => p.nodeId === nodeId && p.portId === portId) ?? null;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Coordinate helpers
  private canvasEl(): HTMLDivElement { return this.canvasWrapRef.nativeElement; }

  clientToWorld(cx: number, cy: number): { x: number; y: number } {
    const rect = this.canvasEl().getBoundingClientRect();
    return {
      x: (cx - rect.left - this.panX) / this.zoom,
      y: (cy - rect.top  - this.panY) / this.zoom,
    };
  }

  // World → canvas-wrap-local (no rect offset; used by the screen-space pending line SVG)
  worldToCanvasLocal(wx: number, wy: number): { x: number; y: number } {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY,
    };
  }

  worldToClient(wx: number, wy: number): { x: number; y: number } {
    const rect = this.canvasEl().getBoundingClientRect();
    return {
      x: wx * this.zoom + this.panX + rect.left,
      y: wy * this.zoom + this.panY + rect.top,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Wheel zoom
  onWheel(e: WheelEvent) {
    e.preventDefault();
    const rect  = this.canvasEl().getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, this.zoom * factor));
    // zoom towards mouse pointer
    this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
    this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }

  get transformStyle(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Canvas mouse events (pan + marquee selection)
  onCanvasMouseDown(e: MouseEvent) {
    const isCanvas = e.target === this.canvasEl() || (e.target as Element).classList.contains('svg-bg');
    if (!isCanvas) return;
    if (e.button === 0) {
      // Left click: marquee selection only — NO panning
      this.selectedConnectionId = null;
      this.selectedNodeIds = new Set();
      const rect = this.canvasEl().getBoundingClientRect();
      this.marqueeActive = true;
      this.marqueeStartX = e.clientX - rect.left;
      this.marqueeStartY = e.clientY - rect.top;
      this.marqueeEndX   = this.marqueeStartX;
      this.marqueeEndY   = this.marqueeStartY;
    } else if (e.button === 1) {
      // Middle mouse button: pan
      e.preventDefault();
      this.isPanning    = true;
      this.panStartX    = e.clientX;
      this.panStartY    = e.clientY;
      this.panStartPanX = this.panX;
      this.panStartPanY = this.panY;
    }
  }

  // Document-level mouse handlers (registered manually in ngOnInit)
  private handleMouseMove(e: MouseEvent) {
    if (this.marqueeActive) {
      const rect = this.canvasEl().getBoundingClientRect();
      this.marqueeEndX = e.clientX - rect.left;
      this.marqueeEndY = e.clientY - rect.top;
    }
    if (this.isPanning) {
      this.panX = this.panStartPanX + (e.clientX - this.panStartX);
      this.panY = this.panStartPanY + (e.clientY - this.panStartY);
      return;
    }
    // ── Dragging an existing waypoint circle ─────────────────────────────────
    if (this.draggingWaypointConnId !== null) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      const conn = this.graph.connections.find(c => c.id === this.draggingWaypointConnId);
      if (conn && conn.waypoints) {
        const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
        const to   = this.resolvePortWorldPos(conn.toNodeId,   conn.toPortId);
        if (from && to) {
          const allPts = [from, ...conn.waypoints, to];
          const prev = allPts[this.draggingWaypointIndex];
          const next = allPts[this.draggingWaypointIndex + 2];
          // Snap to snap-grid if close enough (20 world units)
          let snapped = world;
          const grid = this.computeSnapGrid(prev, next);
          this.waypointSnapGrid = grid;
          const SNAP_THRESHOLD = 20;
          let bestDist = SNAP_THRESHOLD;
          for (const g of grid) {
            const d = Math.hypot(world.x - g.x, world.y - g.y);
            if (d < bestDist) { bestDist = d; snapped = g; }
          }
          const newWps = [...conn.waypoints];
          newWps[this.draggingWaypointIndex] = snapped;
          this.graph.connections = this.graph.connections.map(c =>
            c.id === this.draggingWaypointConnId ? { ...c, waypoints: newWps } : c
          );
          this.graphConnectionsSig.set(this.graph.connections);
        }
      }
      return;
    }
    // ── Pulling a new waypoint out of a line segment ──────────────────────────
    if (this.pullingWaypointConnId !== null) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      // Snap to snap-grid if close enough
      let snapped = world;
      const SNAP_THRESHOLD = 20;
      let bestDist = SNAP_THRESHOLD;
      for (const g of this.waypointSnapGrid) {
        const d = Math.hypot(world.x - g.x, world.y - g.y);
        if (d < bestDist) { bestDist = d; snapped = g; }
      }
      this.pullingWaypointPos = snapped;
      return;
    }
    // ── Node drag with Y + X snap ─────────────────────────────────────────────
    if (this.draggingNodeId) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      const primaryNode = this.graph.nodes.find(n => n.id === this.draggingNodeId);
      if (primaryNode) {
        const newX = world.x - this.dragOffsetX;
        const newY = world.y - this.dragOffsetY;
        let   dx   = newX - primaryNode.x;
        let   dy   = newY - primaryNode.y;

        const movingIds = new Set(
          this.graph.nodes.filter(n => this.selectedNodeIds.has(n.id)).map(n => n.id)
        );
        const allPP = this.allPortPositions();
        const stationaryPorts = allPP.filter(pp => !movingIds.has(pp.nodeId));
        const stationaryYs = stationaryPorts.map(pp => pp.y);
        const stationaryXs = stationaryPorts.map(pp => pp.x);

        const SNAP_D = 10;
        let snapDy: number | null = null;
        let snapDx: number | null = null;

        for (const pp of allPP) {
          if (!movingIds.has(pp.nodeId)) continue;
          if (snapDy === null) {
            for (const sy of stationaryYs) {
              if (Math.abs(pp.y + dy - sy) < SNAP_D) { snapDy = sy - pp.y; break; }
            }
          }
          if (snapDx === null) {
            for (const sx of stationaryXs) {
              if (Math.abs(pp.x + dx - sx) < SNAP_D) { snapDx = sx - pp.x; break; }
            }
          }
          if (snapDy !== null && snapDx !== null) break;
        }
        if (snapDy !== null) dy = snapDy;
        if (snapDx !== null) dx = snapDx;

        // Snap indicator lines
        const snapYSet = new Set<number>();
        const snapXSet = new Set<number>();
        for (const pp of allPP) {
          if (!movingIds.has(pp.nodeId)) continue;
          for (const sy of stationaryYs) {
            if (Math.abs(pp.y + dy - sy) < 0.5) snapYSet.add(sy);
          }
          for (const sx of stationaryXs) {
            if (Math.abs(pp.x + dx - sx) < 0.5) snapXSet.add(sx);
          }
        }
        this.nodeDragSnapLines = [
          ...Array.from(snapYSet).map(y => ({ axis: 'y' as const, v: y })),
          ...Array.from(snapXSet).map(x => ({ axis: 'x' as const, v: x })),
        ];

        // Move all selected nodes
        for (const node of this.graph.nodes) {
          if (this.selectedNodeIds.has(node.id)) {
            node.x += dx;
            node.y += dy;
            this.nodeStates.get(node.id)!.node = node;
          }
        }
        // Move start node when it was box-selected
        if (this.startNodeSelected) {
          this.graph.startNode.x += dx;
          this.graph.startNode.y += dy;
        }
        // Move selected waypoints along with nodes
        for (const [connId, wpIndices] of this.selectedWaypoints) {
          const conn = this.graph.connections.find(c => c.id === connId);
          if (conn && conn.waypoints) {
            const newWps = conn.waypoints.map((wp, i) =>
              wpIndices.has(i) ? { x: wp.x + dx, y: wp.y + dy } : wp
            );
            conn.waypoints = newWps;
          }
        }
        if (this.selectedWaypoints.size > 0) {
          this.graph.connections = [...this.graph.connections];
          this.graphConnectionsSig.set(this.graph.connections);
        }
        this.graphNodesSig.set([...this.graph.nodes]);
      }
      return;
    }
    const cur = this.pending();
    if (cur) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      this.pending.set({ ...cur, toX: world.x, toY: world.y });
      // Only highlight ports that are VALID connection targets (input + compatible type)
      const near = this.findPortAt(world.x, world.y, 22);
      this.hoveredPort.set((near && this.canConnect(cur, near)) ? near : null);
      return;
    }
    if (this.isDraggingStartNode) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      let newSX = world.x - this.startNodeDragOffX;
      let newSY = world.y - this.startNodeDragOffY;

      // Snap: align the start port (y = newSY) with input ports of other nodes
      const SNAP_D = 10;
      const allPP = this.allPortPositions();
      for (const pp of allPP) {
        if (pp.nodeId === 'start') continue;
        if (pp.kind !== 'flow-in' && pp.kind !== 'data-in') continue;
        if (Math.abs(newSY - pp.y) < SNAP_D) { newSY = pp.y; break; }
      }

      const dxS    = newSX - this.graph.startNode.x;
      const dyS    = newSY - this.graph.startNode.y;
      this.graph.startNode.x = newSX;
      this.graph.startNode.y = newSY;
      // Move all other selected nodes by the same delta
      for (const node of this.graph.nodes) {
        if (this.selectedNodeIds.has(node.id)) {
          node.x += dxS;
          node.y += dyS;
          this.nodeStates.get(node.id)!.node = node;
        }
      }
      if (this.selectedNodeIds.size > 0) this.graphNodesSig.set([...this.graph.nodes]);
    }
  }

  private handleMouseUp(e: MouseEvent) {
    // Check pending FIRST
    const cur = this.pending();
    if (cur) {
      // DOM-based target detection: find the port element directly under the cursor.
      // Far more reliable than coordinate math under arbitrary zoom/pan transforms.
      const portEl = (e.target as Element).closest('[data-port-id]') as HTMLElement | null;
      const nodeId = portEl?.dataset['nodeId'];
      const portId = portEl?.dataset['portId'];
      let target: PortPosition | null = null;
      if (nodeId && portId) {
        const pp = this.allPortPositions().find(p => p.nodeId === nodeId && p.portId === portId);
        if (pp && this.canConnect(cur, pp)) target = pp;
      }
      // Fallback: coordinate scan with generous radius (handles fast mouse movement)
      if (!target) {
        const world = this.clientToWorld(e.clientX, e.clientY);
        const near  = this.findPortAt(world.x, world.y, 40);
        if (near && this.canConnect(cur, near)) target = near;
      }
      if (target) {
        this.createConnection(cur, target);
      } else if (!cur.isPickup) {
        // Drop into void with a fresh connection — open quick rune search
        this.openQuickSearch(cur, e.clientX, e.clientY);
      }
      this.pending.set(null);
      this.hoveredPort.set(null);
      return;
    }
    // Finish pulling a new waypoint out of a line
    if (this.pullingWaypointConnId !== null) {
      const connId  = this.pullingWaypointConnId;
      const segIdx  = this.pullingWaypointSegIndex;
      const pos     = this.pullingWaypointPos;
      this.pullingWaypointConnId  = null;
      this.pullingWaypointSegIndex = -1;
      this.pullingWaypointPos     = null;
      this.waypointSnapGrid       = [];
      if (pos) {
        const conn = this.graph.connections.find(c => c.id === connId);
        if (conn) {
          const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
          const to   = this.resolvePortWorldPos(conn.toNodeId,   conn.toPortId);
          if (from && to) {
            const wps    = conn.waypoints ?? [];
            const allPts = [from, ...wps, to];
            const prev   = allPts[segIdx];
            const next   = allPts[segIdx + 1];
            // Discard the waypoint only if it lies ON the auto-route path between prev→next
            // (i.e., inserting it doesn't change the visual route at all).
            const autoRoute = [prev, ...this.queenRoute(prev.x, prev.y, next.x, next.y), next];
            const isRedundant = autoRoute.slice(0, -1).some((a, i) =>
              this.distToSegment(pos, a, autoRoute[i + 1]) < 4
            );
            if (!isRedundant) {
              const newWps = [...wps.slice(0, segIdx), pos, ...wps.slice(segIdx)];
              this.updateConnectionWaypoints(connId, newWps);
            }
          }
        }
      }
      return;
    }
    // Finish dragging an existing waypoint — snap-delete if redundant with auto-route
    if (this.draggingWaypointConnId !== null) {
      const connId = this.draggingWaypointConnId;
      const wpIdx  = this.draggingWaypointIndex;
      this.draggingWaypointConnId = null;
      this.draggingWaypointIndex  = -1;
      this.waypointSnapGrid       = [];
      const conn = this.graph.connections.find(c => c.id === connId);
      if (conn && conn.waypoints) {
        const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
        const to   = this.resolvePortWorldPos(conn.toNodeId,   conn.toPortId);
        if (from && to) {
          const allPts = [from, ...conn.waypoints, to];
          const prev = allPts[wpIdx];
          const wp   = allPts[wpIdx + 1];
          const next = allPts[wpIdx + 2];
          // Delete waypoint if it lies on the auto-route path between its neighbours (redundant)
          if (prev && next && wp) {
            const autoRoute = [prev, ...this.queenRoute(prev.x, prev.y, next.x, next.y), next];
            const isRedundant = autoRoute.slice(0, -1).some((a, i) =>
              this.distToSegment(wp, a, autoRoute[i + 1]) < 6
            );
            if (isRedundant) {
              const newWps = conn.waypoints.filter((_, i) => i !== wpIdx);
              this.updateConnectionWaypoints(connId, newWps);
            }
          }
        }
      }
      return;
    }
    if (this.marqueeActive) {
      this.marqueeActive = false;
      this.finishMarqueeSelection();
    }
    if (this.isPanning)          { this.isPanning = false; return; }
    if (this.isDraggingStartNode){ this.isDraggingStartNode = false; return; }
    if (this.draggingNodeId)     { this.draggingNodeId = null; this.nodeDragSnapLines = []; return; }
  }

  // Returns true if wp lies within `threshold` units of the line segment prev→next
  private isNearlyCollinear(
    prev: { x: number; y: number },
    wp: { x: number; y: number },
    next: { x: number; y: number },
    threshold: number
  ): boolean {
    return this.distToSegment(wp, prev, next) < threshold;
  }

  // Compute marquee rect in world space and select contained nodes and waypoints
  private finishMarqueeSelection() {
    const ax = Math.min(this.marqueeStartX, this.marqueeEndX);
    const ay = Math.min(this.marqueeStartY, this.marqueeEndY);
    const bx = Math.max(this.marqueeStartX, this.marqueeEndX);
    const by = Math.max(this.marqueeStartY, this.marqueeEndY);
    const threshold = 6; // ignore tiny drags (clicks)
    if ((bx - ax) < threshold && (by - ay) < threshold) return;
    // Convert to world coords
    const wa = { x: (ax - this.panX) / this.zoom, y: (ay - this.panY) / this.zoom };
    const wb = { x: (bx - this.panX) / this.zoom, y: (by - this.panY) / this.zoom };
    const selected = new Set<string>();
    for (const node of this.graph.nodes) {
      const nx = node.x, ny = node.y, nw = this.NODE_IMG, nh = this.NODE_IMG;
      if (nx + nw >= wa.x && nx <= wb.x && ny + nh >= wa.y && ny <= wb.y) {
        selected.add(node.id);
      }
    }
    this.selectedNodeIds = selected;
    // Select start node if its circle overlaps the marquee
    const START_R = 34;
    const sn = this.graph.startNode;
    this.startNodeSelected = (
      sn.x + START_R >= wa.x && sn.x - START_R <= wb.x &&
      sn.y + START_R >= wa.y && sn.y - START_R <= wb.y
    );
    const newWpSel = new Map<string, Set<number>>();
    const tolW = 5 / this.zoom; // 5 screen-pixel tolerance converted to world units
    for (const c of this.graph.connections) {
      const wps = c.waypoints ?? [];
      const sel = new Set<number>();
      for (let i = 0; i < wps.length; i++) {
        if (wps[i].x >= wa.x - tolW && wps[i].x <= wb.x + tolW &&
            wps[i].y >= wa.y - tolW && wps[i].y <= wb.y + tolW) {
          sel.add(i);
        }
      }
      if (sel.size > 0) newWpSel.set(c.id, sel);
    }
    this.selectedWaypoints = newWpSel;
  }

  get marqueeRect(): { x: number; y: number; w: number; h: number } {
    return {
      x: Math.min(this.marqueeStartX, this.marqueeEndX),
      y: Math.min(this.marqueeStartY, this.marqueeEndY),
      w: Math.abs(this.marqueeEndX - this.marqueeStartX),
      h: Math.abs(this.marqueeEndY - this.marqueeStartY),
    };
  }

  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodeIds.has(nodeId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Node drag — if part of selection, move all selected nodes together
  onNodeMouseDown(e: MouseEvent, nodeId: string) {
    e.stopPropagation();
    if ((e.target as Element).closest('.rune-port')) return;
    this.pushUndo(); // capture pre-drag state
    this.lastMouseDownX = e.clientX;
    this.lastMouseDownY = e.clientY;
    // If clicking a selected node, ensure it stays selected (don't clear)
    if (!this.selectedNodeIds.has(nodeId)) {
      this.selectedNodeIds = new Set([nodeId]);
    }
    const node = this.graph.nodes.find(n => n.id === nodeId)!;
    const world = this.clientToWorld(e.clientX, e.clientY);
    this.draggingNodeId = nodeId;
    this.dragOffsetX = world.x - node.x;
    this.dragOffsetY = world.y - node.y;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Start node drag
  isDraggingStartNode = false;
  startNodeDragOffX = 0;
  startNodeDragOffY = 0;

  onStartNodeMouseDown(e: MouseEvent) {
    e.stopPropagation();
    if ((e.target as Element).closest('.rune-port, .port-circle')) return;
    this.pushUndo();
    const world = this.clientToWorld(e.clientX, e.clientY);
    this.isDraggingStartNode = true;
    this.startNodeDragOffX = world.x - this.graph.startNode.x;
    this.startNodeDragOffY = world.y - this.graph.startNode.y;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Port drag (start connection) — any port kind allowed (bidirectional)
  // If clicking an INPUT port that already has a connection:
  //   - data-in (single): picks up the existing connection (removes it, starts dragging from source)
  //   - flow-in (multi): always creates a new connection
  onPortMouseDown(e: MouseEvent, nodeId: string, portId: string) {
    e.stopPropagation();
    e.preventDefault();
    const all = this.allPortPositions();
    const port = all.find(p => p.nodeId === nodeId && p.portId === portId);
    if (!port) return;

    // Pick up existing connection from ANY input port that has incoming connections.
    // (Output ports always create a new connection.)
    const isInput = port.kind === 'flow-in' || port.kind === 'data-in';
    if (isInput) {
      const incoming = this.graph.connections.filter(
        c => c.toNodeId === nodeId && c.toPortId === portId
      );
      if (incoming.length > 0) {
        // Pick up the last incoming connection — remove it and drag from its source
        const existing = incoming[incoming.length - 1];
        const srcPort = all.find(p => p.nodeId === existing.fromNodeId && p.portId === existing.fromPortId);
        this.removeConnection(existing.id);
        if (srcPort) {
          this.pending.set({
            fromNodeId: srcPort.nodeId,
            fromPortId: srcPort.portId,
            fromX: srcPort.x,
            fromY: srcPort.y,
            toX: port.x,
            toY: port.y,
            color: srcPort.color,
            types: srcPort.types,
            kind: srcPort.kind,
            isPickup: true, // re-routing; drop-in-void = cancel, NOT quick search
          });
        }
        return;
      }
    }

    this.pending.set({
      fromNodeId: nodeId,
      fromPortId: portId,
      fromX: port.x,
      fromY: port.y,
      toX: port.x,
      toY: port.y,
      color: port.color,
      types: port.types,
      kind: port.kind,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Port hover check
  private findPortAt(wx: number, wy: number, radius: number): PortPosition | null {
    const all = this.allPortPositions();
    for (const p of all) {
      const dx = p.x - wx;
      const dy = p.y - wy;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) return p;
    }
    return null;
  }

  canConnect(pending: PendingConnection, target: PortPosition): boolean {
    const targetNodeIsNeutral = target.nodeId !== 'start' &&
      this.graph.nodes.find(n => n.id === target.nodeId)?.runeId === NEUTRAL_RUNE_ID;
    const pendingIsOutput = pending.kind === 'flow-out' || pending.kind === 'data-out';
    // Direction check: target must be the opposite side
    if (pendingIsOutput) {
      if (target.kind !== 'flow-in' && target.kind !== 'data-in') return false;
    } else {
      if (target.kind !== 'flow-out' && target.kind !== 'data-out') return false;
    }
    // Same node not allowed
    if (pending.fromNodeId === target.nodeId) return false;
    // neutral-in accepts any type — bypass type check only when connecting INTO it
    if (targetNodeIsNeutral && target.portId === 'neutral-in') return true;
    // Normal type compatibility
    const fromTypes = pending.types;
    const toTypes   = target.types;
    const fromFlow  = fromTypes.length === 0;
    const toFlow    = toTypes.length   === 0;
    if (fromFlow !== toFlow) return false;
    if (!fromFlow && !toFlow && !fromTypes.some(t => toTypes.includes(t))) return false;
    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Connection creation + loop detection
  createConnection(pending: PendingConnection, target: PortPosition) {
    this.pushUndo();
    // Normalize direction: fromPort is always the output side, toPort the input side
    const pendingIsOutput = pending.kind === 'flow-out' || pending.kind === 'data-out';
    const fromNodeId = pendingIsOutput ? pending.fromNodeId : target.nodeId;
    const fromPortId = pendingIsOutput ? pending.fromPortId : target.portId;
    const toNodeId   = pendingIsOutput ? target.nodeId      : pending.fromNodeId;
    const toPortId   = pendingIsOutput ? target.portId      : pending.fromPortId;

    // Prevent exact duplicate connections (same source + destination)
    const duplicate = this.graph.connections.find(
      c => c.fromNodeId === fromNodeId && c.fromPortId === fromPortId &&
           c.toNodeId   === toNodeId   && c.toPortId   === toPortId
    );
    if (duplicate) return;

    // data-in ports and neutral-in only allow one incoming connection — remove the old one
    const targetPortKind = target.kind;
    const isNeutralIn = toPortId === 'neutral-in';
    if (targetPortKind === 'data-in' || isNeutralIn) {
      const old = this.graph.connections.find(
        c => c.toNodeId === toNodeId && c.toPortId === toPortId
      );
      if (old) this.removeConnection(old.id);
    }

    const conn: SpellConnection = { id: `conn-${this.nextId++}`, fromNodeId, fromPortId, toNodeId, toPortId };
    // Check for cycle — auto-set arch+passthrough only if no existing passthrough line in the loop
    if (this.createsCycle(conn)) {
      const hasExistingPassthrough = this.graph.connections.some(
        c => c.passthroughEnabled &&
          (c.toNodeId === fromNodeId || c.fromNodeId === toNodeId)
      );
      if (!hasExistingPassthrough) {
        conn.passthroughEnabled = true;
        conn.maxPassthrough = 1;
        // Build default arch waypoints so cyclic line avoids overlapping node images
        const fromPos = this.resolvePortWorldPos(fromNodeId, fromPortId);
        const toPos   = this.resolvePortWorldPos(toNodeId,   toPortId);
        if (fromPos && toPos) {
          const worldDy = Math.abs(fromPos.y - toPos.y);
          const rise    = Math.max(80, worldDy * 0.8 + 80);
          const topY    = Math.min(fromPos.y, toPos.y) - rise;
          conn.waypoints = [{ x: fromPos.x, y: topY }, { x: toPos.x, y: topY }];
        }
      }
    }
    // No pre-stored waypoints — user pulls them out by dragging on the line
    if (!conn.waypoints) conn.waypoints = [];
    this.graph.connections = [...this.graph.connections, conn];
    this.graphConnectionsSig.set(this.graph.connections);
  }

  private createsCycle(newConn: SpellConnection): boolean {
    // Build adjacency from existing + new
    const adj = new Map<string, Set<string>>();
    const add = (from: string, to: string) => {
      if (!adj.has(from)) adj.set(from, new Set());
      adj.get(from)!.add(to);
    };
    for (const c of this.graph.connections) add(c.fromNodeId, c.toNodeId);
    add(newConn.fromNodeId, newConn.toNodeId);

    // DFS from target — if we can reach fromNodeId, it's a cycle
    const visited = new Set<string>();
    const dfs = (node: string): boolean => {
      if (node === newConn.fromNodeId) return true;
      if (visited.has(node)) return false;
      visited.add(node);
      for (const next of (adj.get(node) ?? [])) {
        if (dfs(next)) return true;
      }
      return false;
    };
    return dfs(newConn.toNodeId);
  }

  removeConnection(id: string) {
    this.graph.connections = this.graph.connections.filter(c => c.id !== id);
    if (this.selectedConnectionId === id) this.selectedConnectionId = null;
    this.graphConnectionsSig.set(this.graph.connections);
  }

  selectConnection(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.selectedConnectionId = this.selectedConnectionId === id ? null : id;
    this.selectedNodeIds = new Set(); // deselect nodes when selecting a connection
    this.startNodeSelected = false;
    this.inspectedRune = null; // close rune inspector
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Waypoint drag — click on a connection segment to add a waypoint,
  // drag an existing waypoint to move it, or move it "back in line" to delete it.
  onWaypointMouseDown(e: MouseEvent, connId: string, wpIdx: number) {
    e.stopPropagation();
    e.preventDefault();
    this.pushUndo(); // capture pre-drag state
    const conn = this.graph.connections.find(c => c.id === connId);
    if (conn) {
      const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
      const to   = this.resolvePortWorldPos(conn.toNodeId,   conn.toPortId);
      if (from && to) {
        const allPts = [from, ...(conn.waypoints ?? []), to];
        const prev = allPts[wpIdx];
        const next = allPts[wpIdx + 2];
        if (prev && next) this.waypointSnapGrid = this.computeSnapGrid(prev, next);
      }
    }
    this.draggingWaypointConnId  = connId;
    this.draggingWaypointIndex   = wpIdx;
  }

  // Mousedown on the invisible hit-area path — begin pulling a new waypoint from that segment.
  // Only responds to right-click; left-click on the line just selects it.
  onConnHitMouseDown(e: MouseEvent, c: SpellConnection) {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 2) return; // right-click only
    this.pushUndo(); // capture pre-pull state
    const world = this.clientToWorld(e.clientX, e.clientY);
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return;
    const wps = c.waypoints ?? [];

    // ── If near an existing waypoint, drag that instead of creating a new one ──
    const WP_GRAB_RADIUS = 18; // world-space grab radius for existing waypoints
    for (let i = 0; i < wps.length; i++) {
      if (Math.hypot(world.x - wps[i].x, world.y - wps[i].y) < WP_GRAB_RADIUS) {
        const allPts = [from, ...wps, to];
        const prev = allPts[i];
        const next = allPts[i + 2];
        if (prev && next) this.waypointSnapGrid = this.computeSnapGrid(prev, next);
        this.draggingWaypointConnId  = c.id;
        this.draggingWaypointIndex   = i;
        return;
      }
    }

    // ── Otherwise find nearest segment and start a pull ────────────────────
    const allPts = [from, ...wps, to];
    let bestSeg  = 0;
    let bestDist = Infinity;
    for (let i = 0; i < allPts.length - 1; i++) {
      const d = this.distToSegment(world, allPts[i], allPts[i + 1]);
      if (d < bestDist) { bestDist = d; bestSeg = i; }
    }
    if (bestDist > 40) return; // too far from any segment

    const prev = allPts[bestSeg];
    const next = allPts[bestSeg + 1];
    this.pullingWaypointConnId   = c.id;
    this.pullingWaypointSegIndex = bestSeg;
    this.pullingWaypointPos      = world;
    this.waypointSnapGrid        = this.computeSnapGrid(prev, next);
  }

  // Called from onConnGroupClick to insert a waypoint at the clicked segment position
  onConnGroupClick(e: MouseEvent, c: SpellConnection) {
    // If we just dragged a waypoint, ignore
    if (this.draggingWaypointConnId) return;
    // Select the connection
    this.selectConnection(c.id, e);
  }

  // Double-click on a connection inserts a waypoint at that position
  onConnGroupDblClick(e: MouseEvent, c: SpellConnection) {
    e.stopPropagation();
    this.pushUndo();
    const world = this.clientToWorld(e.clientX, e.clientY);
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return;
    const wps = c.waypoints ?? [];
    const allPts = [from, ...wps, to];

    // Find which segment was clicked (nearest segment endpoint-pair)
    let bestSeg = 0;
    let bestDist = Infinity;
    for (let i = 0; i < allPts.length - 1; i++) {
      const d = this.distToSegment(world, allPts[i], allPts[i + 1]);
      if (d < bestDist) { bestDist = d; bestSeg = i; }
    }
    if (bestDist > 30) return; // clicked too far from line

    // Insert new waypoint on this segment at the click position
    const newWp = this.snapToQueenMovement(world, allPts[bestSeg], allPts[bestSeg + 1]);
    const newWps = [...wps.slice(0, bestSeg), newWp, ...wps.slice(bestSeg)];
    this.updateConnectionWaypoints(c.id, newWps);
  }

  private distToSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  // Snap a point to lie on a queen-movement direction from anchor
  private snapToQueenMovement(p: { x: number; y: number },
                               a: { x: number; y: number },
                               _b: { x: number; y: number }): { x: number; y: number } {
    const dx = p.x - a.x, dy = p.y - a.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;
    // Pick nearest queen direction: H, V, or 45°
    const distH   = ady;                              // cost to go horizontal to p
    const distV   = adx;                              // cost to go vertical to p
    const distD   = Math.abs(adx - ady);              // cost to go diagonal to p
    const minCost = Math.min(distH, distV, distD);
    if (minCost === distH) return { x: p.x, y: a.y };             // horizontal
    if (minCost === distV) return { x: a.x, y: p.y };             // vertical
    const diag = Math.min(adx, ady);
    return { x: a.x + sx * diag, y: a.y + sy * diag };            // 45° diagonal
  }

  private updateConnectionWaypoints(connId: string, rawWps: { x: number; y: number }[]) {
    // Merge waypoints that are very close to each other (within 8 world units)
    const MERGE_D = 8;
    const wps: { x: number; y: number }[] = [];
    for (const wp of rawWps) {
      const last = wps[wps.length - 1];
      if (last && Math.hypot(wp.x - last.x, wp.y - last.y) < MERGE_D) {
        wps[wps.length - 1] = { x: (last.x + wp.x) / 2, y: (last.y + wp.y) / 2 };
      } else {
        wps.push(wp);
      }
    }
    this.graph.connections = this.graph.connections.map(c =>
      c.id === connId ? { ...c, waypoints: wps } : c
    );
    this.graphConnectionsSig.set(this.graph.connections);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Palette drag-to-canvas (HTML drag)
  onPaletteDragStart(e: DragEvent, rune: RuneBlock) {
    e.dataTransfer!.setData('runeName', rune.name);
    e.dataTransfer!.effectAllowed = 'copy';
  }

  onCanvasDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const runeName = e.dataTransfer!.getData('runeName');
    if (!runeName) return;
    const world = this.clientToWorld(e.clientX, e.clientY);
    this.addNode(runeName, world.x - this.NODE_IMG / 2, world.y - this.NODE_IMG / 2);
  }

  onCanvasDragOver(e: DragEvent) { e.preventDefault(); e.dataTransfer!.dropEffect = 'copy'; }

  private addNode(runeName: string, x: number, y: number) {
    this.pushUndo();
    const id = `node-${this.nextId++}`;
    const node: SpellNode = { id, runeId: runeName, x, y };
    this.graph.nodes = [...this.graph.nodes, node];
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
  }

  removeNode(nodeId: string) {
    this.graph.nodes       = this.graph.nodes.filter(n => n.id !== nodeId);
    this.graph.connections = this.graph.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    this.nodeStates.delete(nodeId);
    this.graphNodesSig.set(this.graph.nodes);
    this.graphConnectionsSig.set(this.graph.connections);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Template helpers
  getNodeRune(nodeId: string): RuneBlock | undefined {
    const ns = this.nodeStates.get(nodeId);
    if (!ns) return undefined;
    if (ns.node.runeId === NEUTRAL_RUNE_ID) return undefined; // neutral has its own template
    return this.availableRunes.find(r => r.name === ns.node.runeId);
  }

  getNodeState(nodeId: string): NodeState | undefined {
    return this.nodeStates.get(nodeId);
  }

  inputPorts(nodeId: string): SpellPort[] {
    const ns = this.nodeStates.get(nodeId);
    return ns ? ns.ports.filter(p => p.kind === 'flow-in'  || p.kind === 'data-in')  : [];
  }

  outputPorts(nodeId: string): SpellPort[] {
    const ns = this.nodeStates.get(nodeId);
    return ns ? ns.ports.filter(p => p.kind === 'flow-out' || p.kind === 'data-out') : [];
  }

  // For neutral nodes: pick glow from the first connected line's color
  nodeGlowColor(nodeId: string): string {
    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (node?.runeId === NEUTRAL_RUNE_ID) {
      return this.neutralNodeColor(nodeId);
    }
    const rune = this.getNodeRune(nodeId);
    return rune?.glowColor || '#8b5cf6';
  }

  neutralNodeColor(nodeId: string): string {
    return this.getNeutralPortInfo(nodeId).color;
  }

  nodeIndexForFloat(nodeId: string): number {
    return this.graph.nodes.findIndex(n => n.id === nodeId);
  }

  portPortPos(nodeId: string, portId: string): PortPosition | undefined {
    return this.allPortPositions().find(p => p.nodeId === nodeId && p.portId === portId);
  }

  isPortHovered(nodeId: string, portId: string): boolean {
    const h = this.hoveredPort();
    return h?.nodeId === nodeId && h?.portId === portId;
  }

  // True when a drag is active AND this port is a valid connection target
  isPendingValidTarget(nodeId: string, portId: string): boolean {
    const p = this.pending();
    if (!p) return false;
    const port = this.allPortPositions().find(pp => pp.nodeId === nodeId && pp.portId === portId);
    return !!port && this.canConnect(p, port);
  }

  isConnectionSelected(connId: string): boolean {
    return this.selectedConnectionId === connId;
  }

  isWaypointSelected(connId: string, wpIdx: number): boolean {
    return this.selectedWaypoints.get(connId)?.has(wpIdx) ?? false;
  }

  getLoopConn(connId: string): SpellConnection | undefined {
    return this.graph.connections.find(c => c.id === connId);
  }

  loopMidPoint(c: SpellConnection): { x: number; y: number } {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return { x: 0, y: 0 };
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  }

  loopMidPointScreen(c: SpellConnection): { x: number; y: number } {
    const wps = c.waypoints ?? [];
    if (wps.length > 0) {
      const mid = wps[Math.floor(wps.length / 2)];
      return this.worldToCanvasLocal(mid.x, mid.y);
    }
    const mp = this.loopMidPoint(c);
    return this.worldToCanvasLocal(mp.x, mp.y);
  }

  // Midpoint of a connection in screen space — used for badges
  connMidPointScreen(c: SpellConnection): { x: number; y: number } {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return { x: 0, y: 0 };
    const sf = this.worldToCanvasLocal(from.x, from.y);
    const st = this.worldToCanvasLocal(to.x,   to.y);
    return { x: (sf.x + st.x) / 2, y: (sf.y + st.y) / 2 };
  }

  connectionColor(c: SpellConnection): string {
    const from = this.allPortPositions().find(p => p.nodeId === c.fromNodeId && p.portId === c.fromPortId);
    return from?.color ?? FLOW_COLOR;
  }

  // True when the connection has any visible settings that need badge display
  hasConnectionSettings(c: SpellConnection): boolean {
    return !!(c.condition || c.passthroughEnabled || c.lineDelay);
  }

  /** Returns the currently selected SpellConnection, or null */
  getSelectedConnection(): SpellConnection | null {
    if (!this.selectedConnectionId) return null;
    return this.graph.connections.find(c => c.id === this.selectedConnectionId) ?? null;
  }

  /** Patches fields on the selected connection and emits change */
  updateSelectedConnection(patch: Partial<SpellConnection>) {
    if (!this.selectedConnectionId) return;
    this.pushUndo();
    const updated = this.graph.connections.map(c =>
      c.id === this.selectedConnectionId ? { ...c, ...patch } : c
    );
    this.graph.connections = updated;
    this.graphConnectionsSig.set(updated);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Undo / Redo
  private pushUndo() {
    const snap = JSON.stringify(this.graph);
    const last = this.undoStack.length > 0 ? JSON.stringify(this.undoStack[this.undoStack.length - 1]) : '';
    if (snap === last) return; // nothing changed
    this.undoStack.push(JSON.parse(snap));
    this.redoStack = [];
    if (this.undoStack.length > 60) this.undoStack.shift();
  }

  private applySnapshot(g: SpellGraph) {
    this.graph = g;
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    this.graphConnectionsSig.set(this.graph.connections);
    this.selectedConnectionId = null;
    this.selectedNodeIds = new Set();
    this.selectedWaypoints = new Map();
    this.startNodeSelected = false;
    // Keep nextId ahead of all restored IDs to avoid collisions
    const allNums = [
      ...this.graph.nodes.map(n => parseInt(n.id.replace(/[^0-9]/g, ''), 10)),
      ...this.graph.connections.map(c => parseInt(c.id.replace(/[^0-9]/g, ''), 10)),
    ].filter(v => !isNaN(v));
    if (allNums.length > 0) this.nextId = Math.max(this.nextId, Math.max(...allNums) + 1);
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(JSON.parse(JSON.stringify(this.graph)));
    this.applySnapshot(this.undoStack.pop()!);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(JSON.parse(JSON.stringify(this.graph)));
    this.applySnapshot(this.redoStack.pop()!);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Copy / Paste
  copySelected() {
    if (this.selectedNodeIds.size === 0) return;
    const nodes = this.graph.nodes.filter(n => this.selectedNodeIds.has(n.id));
    const ids   = new Set(nodes.map(n => n.id));
    const connections = this.graph.connections.filter(c => ids.has(c.fromNodeId) && ids.has(c.toNodeId));
    this.clipboard = {
      nodes:       JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    };
  }

  cutSelected() {
    if (this.selectedNodeIds.size === 0) return;
    this.copySelected();
    this.pushUndo();
    for (const id of [...this.selectedNodeIds]) this.removeNode(id);
    this.selectedNodeIds = new Set();
  }

  pasteClipboard() {
    if (!this.clipboard || this.clipboard.nodes.length === 0) return;
    this.pushUndo();
    const idMap  = new Map<string, string>();
    const OFFSET = 50;
    // Add new nodes with offset positions
    for (const node of this.clipboard.nodes) {
      const newId   = `node-${this.nextId++}`;
      idMap.set(node.id, newId);
      const newNode: SpellNode = { ...node, id: newId, x: node.x + OFFSET, y: node.y + OFFSET };
      this.graph.nodes = [...this.graph.nodes, newNode];
    }
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    // Recreate connections internal to the copied selection
    for (const conn of this.clipboard.connections) {
      const newFromId = idMap.get(conn.fromNodeId);
      const newToId   = idMap.get(conn.toNodeId);
      if (newFromId && newToId) {
        const newConn: SpellConnection = {
          ...JSON.parse(JSON.stringify(conn)),
          id: `conn-${this.nextId++}`,
          fromNodeId: newFromId,
          toNodeId:   newToId,
          // Offset waypoints to match the shifted node positions
          waypoints: conn.waypoints?.map((wp: { x: number; y: number }) => ({ x: wp.x + OFFSET, y: wp.y + OFFSET })),
        };
        this.graph.connections = [...this.graph.connections, newConn];
      }
    }
    this.graphConnectionsSig.set(this.graph.connections);
    this.selectedNodeIds = new Set(idMap.values());
    this.selectedConnectionId = null;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Point-on-path: returns screen-space position at fraction t (0..1) along connection
  getPointOnPath(c: SpellConnection, t: number): { x: number; y: number } {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return { x: 0, y: 0 };
    const wps     = c.waypoints ?? [];
    const liveWps = (this.pullingWaypointConnId === c.id && this.pullingWaypointPos)
      ? [...wps.slice(0, this.pullingWaypointSegIndex), this.pullingWaypointPos, ...wps.slice(this.pullingWaypointSegIndex)]
      : wps;
    // Build routed world-space points (queen-movement)
    const worldPoints = [from, ...liveWps, to];
    const pts: { x: number; y: number }[] = [worldPoints[0]];
    for (let i = 0; i < worldPoints.length - 1; i++) {
      const a = worldPoints[i], b = worldPoints[i + 1];
      pts.push(...this.queenRoute(a.x, a.y, b.x, b.y), b);
    }
    // Walk the polyline to find point at fraction t
    let totalLen = 0;
    const segLens: number[] = [];
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segLens.push(d);
      totalLen += d;
    }
    if (totalLen < 0.01) return this.worldToCanvasLocal(from.x, from.y);
    const target = Math.max(0, Math.min(1, t)) * totalLen;
    let walked = 0;
    for (let i = 0; i < segLens.length; i++) {
      if (walked + segLens[i] >= target) {
        const frac = segLens[i] > 0 ? (target - walked) / segLens[i] : 0;
        const a = pts[i], b = pts[i + 1];
        return this.worldToCanvasLocal(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac);
      }
      walked += segLens[i];
    }
    return this.worldToCanvasLocal(pts[pts.length - 1].x, pts[pts.length - 1].y);
  }

  /** Estimated pixel width of a condition label SVG rect */
  condLabelWidth(condition: string | undefined): number {
    return Math.max(50, (condition?.length ?? 0) * 6.5 + 28);
  }

  // Port's CSS top offset within the node div (world y → node-local px)
  portNodeTop(nodeId: string, portId: string): number {
    const pp   = this.portPortPos(nodeId, portId);
    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (!pp || !node) return 0;
    return pp.y - node.y - this.PORT_R;
  }

  trackById(_: number, item: { id: string }) { return item.id; }
  trackByName(_: number, item: { name: string }) { return item.name; }

  // Detect rune-node click (vs drag): if mouse barely moved between mousedown and mouseup
  onNodeClick(e: MouseEvent, node: SpellNode) {
    if ((e.target as Element).closest('[data-port-id]')) return; // ignore port clicks
    const moved = Math.abs(e.clientX - this.lastMouseDownX) > 4 ||
                  Math.abs(e.clientY - this.lastMouseDownY) > 4;
    if (!moved) this.inspectNode(node);
  }

  inspectNode(node: SpellNode) {
    if (node.runeId === NEUTRAL_RUNE_ID) return;
    this.selectedConnectionId = null; // close connection inspector
    this.inspectedRune = this.availableRunes.find(r => r.name === node.runeId) ?? null;
  }

  inspectPaletteRune(rune: RuneBlock) {
    if (rune.name === NEUTRAL_RUNE_ID) return;
    this.selectedConnectionId = null; // close connection inspector
    this.inspectedRune = rune;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Keyboard: delete selected connection or selected nodes
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      this.onSave();
      return;
    }
    if (e.ctrlKey && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      e.preventDefault();
      this.undo();
      return;
    }
    if (e.ctrlKey && (e.key === 'y' || e.key === 'Y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
      e.preventDefault();
      this.redo();
      return;
    }
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    // Copy / Cut / Paste — not in input fields
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      this.copySelected();
      return;
    }
    if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
      this.cutSelected();
      return;
    }
    if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
      this.pasteClipboard();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // First: delete selected waypoints (prioritised over node/conn delete)
      if (this.selectedWaypoints.size > 0) {
        this.pushUndo();
        for (const [connId, indices] of this.selectedWaypoints) {
          const conn = this.graph.connections.find(c => c.id === connId);
          if (conn?.waypoints) {
            this.updateConnectionWaypoints(connId, conn.waypoints.filter((_, i) => !indices.has(i)));
          }
        }
        this.selectedWaypoints = new Map();
        return;
      }
      if (this.selectedConnectionId) {
        this.pushUndo();
        this.removeConnection(this.selectedConnectionId);
      }
      if (this.selectedNodeIds.size > 0) {
        this.pushUndo();
        for (const id of [...this.selectedNodeIds]) {
          this.removeNode(id);
        }
        this.selectedNodeIds = new Set();
      }
    }
    if (e.key === 'Escape') {
      this.selectedConnectionId = null;
      this.selectedNodeIds = new Set();
      this.selectedWaypoints = new Map();
      this.startNodeSelected = false;
      this.pending.set(null);
      this.hoveredPort.set(null);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Zoom controls
  zoomIn()    { this.zoom = Math.min(this.MAX_ZOOM, this.zoom * 1.2); }
  zoomOut()   { this.zoom = Math.max(this.MIN_ZOOM, this.zoom / 1.2); }
  zoomReset() { this.zoom = 1; this.panX = 0; this.panY = 0; }

  // ────────────────────────────────────────────────────────────────────────────
  // Save
  onSave() {
    if (this.savedFeedback) return; // debounce double-click / repeated Ctrl+S
    const spell: SpellBlock = {
      name: this.spellName || 'Unbenannter Zauber',
      description: this.spellDescription,
      tags: this.extractTags(),
      binding: this.spell?.binding ?? { type: 'learned' },
      strokeColor: this.spell?.strokeColor ?? '#8b5cf6',
      libraryOrigin: this.spell?.libraryOrigin,
      libraryOriginName: this.spell?.libraryOriginName,
      graph: JSON.parse(JSON.stringify(this.graph)),
    };
    this.save.emit(spell);
    this.lastSavedJson = JSON.stringify(spell.graph);
    this.savedFeedback = true;
    // Show brief save confirmation, then reset — do NOT close the editor
    setTimeout(() => {
      this.savedFeedback = false;
    }, 700);
  }

  get isDirty(): boolean {
    return JSON.stringify(this.graph) !== this.lastSavedJson;
  }

  onClose() {
    if (this.isDirty) {
      this.showCloseDialog = true;
    } else {
      this.cancel.emit();
    }
  }

  onCloseConfirmSave() {
    this.onSave();
    this.showCloseDialog = false;
    this.cancel.emit();
  }

  onCloseConfirmDiscard() {
    this.showCloseDialog = false;
    this.cancel.emit();
  }

  onCloseDialogCancel() {
    this.showCloseDialog = false;
  }

  private extractTags(): string[] {
    const tags = new Set<string>();
    for (const node of this.graph.nodes) {
      const rune = this.availableRunes.find(r => r.name === node.runeId);
      if (rune) rune.tags?.forEach(t => tags.add(t));
    }
    return Array.from(tags);
  }

  onDelete() {
    if (confirm('Zauber wirklich löschen?')) {
      this.deleteSpell.emit();
    }
  }

  onCancel() { this.cancel.emit(); }

  // ────────────────────────────────────────────────────────────────────────────
  // SVG viewBox (always matches container size)
  svgViewBox = '0 0 1000 800';
  onCanvasResize(e: ResizeObserverEntry) {
    const r = e.contentRect;
    this.svgViewBox = `0 0 ${r.width} ${r.height}`;
  }
}
