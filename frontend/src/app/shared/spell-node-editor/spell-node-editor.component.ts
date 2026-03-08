import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy,
  ElementRef, ViewChild, HostListener, ChangeDetectorRef, signal,
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

  // Marquee (selection box) state
  marqueeActive = false;
  marqueeStartX = 0;
  marqueeStartY = 0;
  marqueeEndX   = 0;
  marqueeEndY   = 0;

  // Inline editing state for connection badges
  editingConnId: string | null = null;

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
  // Node drag snap indicators (world coords of matched port Ys)
  nodeDragSnapLines: { y: number }[] = [];

  // Rune inspector panel (right sidebar)
  inspectedRune: RuneBlock | null = null;

  // Save feedback
  savedFeedback = false;

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
      }
    }
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    this.graphConnectionsSig.set(this.graph.connections);

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
    if (c.isLoop) return this.loopArcPathScreen(c);
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return '';
    // User waypoints as control points; each sub-segment uses queen routing
    const wps = c.waypoints ?? [];
    // Also include the currently-being-pulled waypoint for live preview
    if (this.pullingWaypointConnId === c.id && this.pullingWaypointPos) {
      const liveWps = [
        ...wps.slice(0, this.pullingWaypointSegIndex),
        this.pullingWaypointPos,
        ...wps.slice(this.pullingWaypointSegIndex),
      ];
      return this.buildQueenPath([from, ...liveWps, to]);
    }
    return this.buildQueenPath([from, ...wps, to]);
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
    // ── Node drag with Y-snap ─────────────────────────────────────────────────
    if (this.draggingNodeId) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      const primaryNode = this.graph.nodes.find(n => n.id === this.draggingNodeId);
      if (primaryNode) {
        const newX = world.x - this.dragOffsetX;
        let   newY = world.y - this.dragOffsetY;
        const dx = newX - primaryNode.x;
        let   dy = newY - primaryNode.y;

        // Compute candidate Y positions of ports on nodes being moved
        const movingIds = new Set(
          this.graph.nodes.filter(n => this.selectedNodeIds.has(n.id)).map(n => n.id)
        );

        // Gather all port screen-Y from stationary nodes
        const stationaryPortYs: number[] = [];
        for (const pp of this.allPortPositions()) {
          if (!movingIds.has(pp.nodeId)) stationaryPortYs.push(pp.y);
        }

        // Candidate port Ys on moving nodes after applying dy
        const SNAP_Y = 10;
        let snapDy: number | null = null;
        for (const pp of this.allPortPositions()) {
          if (!movingIds.has(pp.nodeId)) continue;
          const candidateY = pp.y + dy;
          for (const sy of stationaryPortYs) {
            if (Math.abs(candidateY - sy) < SNAP_Y) {
              snapDy = sy - pp.y;
              break;
            }
          }
          if (snapDy !== null) break;
        }
        if (snapDy !== null) dy = snapDy;

        // Compute snap indicator lines (port Ys that we just snapped to)
        if (snapDy !== null) {
          const snapSet = new Set<number>();
          for (const pp of this.allPortPositions()) {
            if (!movingIds.has(pp.nodeId)) continue;
            const snappedY = pp.y + dy;
            for (const sy of stationaryPortYs) {
              if (Math.abs(snappedY - sy) < 0.5) snapSet.add(sy);
            }
          }
          this.nodeDragSnapLines = Array.from(snapSet).map(y => ({ y }));
        } else {
          this.nodeDragSnapLines = [];
        }

        // Move all selected nodes
        for (const node of this.graph.nodes) {
          if (this.selectedNodeIds.has(node.id)) {
            node.x += dx;
            node.y += dy;
            this.nodeStates.get(node.id)!.node = node;
          }
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
      this.graph.startNode.x = world.x - this.startNodeDragOffX;
      this.graph.startNode.y = world.y - this.startNodeDragOffY;
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
      if (target) this.createConnection(cur, target);
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
            // Discard if the position essentially matches the auto-route (within 4 world units)
            const autoMid = this.queenRoute(prev.x, prev.y, next.x, next.y);
            const isRedundant = autoMid.length === 0
              || autoMid.some(m => Math.hypot(pos.x - m.x, pos.y - m.y) < 4);
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
          // Delete waypoint if it is collinear (or nearly so) with its neighbours
          if (prev && next && this.isNearlyCollinear(prev, wp, next, 8)) {
            const newWps = conn.waypoints.filter((_, i) => i !== wpIdx);
            this.updateConnectionWaypoints(connId, newWps);
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

  // Compute marquee rect in world space and select contained nodes
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
    // Check for cycle
    if (this.createsCycle(conn)) {
      conn.isLoop = true;
      conn.loopCount = 1;
    }
    // No pre-stored waypoints — user pulls them out by dragging on the line
    conn.waypoints = [];
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
  }

  // Right-click on a connection — toggle branch/normal (only when source has multiple outs)
  onConnectionRightClick(c: SpellConnection, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Only toggle if the source node has more than one outgoing flow connection
    const siblingsCount = this.graph.connections.filter(
      x => x.fromNodeId === c.fromNodeId && x.fromPortId === c.fromPortId
    ).length;
    if (siblingsCount < 2) return;
    const updated = this.graph.connections.map(x =>
      x.id === c.id ? { ...x, isBranch: !x.isBranch, branchLabel: x.branchLabel ?? '' } : x
    );
    this.graph.connections = updated;
    this.graphConnectionsSig.set(updated);
  }

  setBranchLabel(connId: string, label: string) {
    const updated = this.graph.connections.map(c =>
      c.id === connId ? { ...c, branchLabel: label } : c
    );
    this.graph.connections = updated;
    this.graphConnectionsSig.set(updated);
  }

  setLoopCount(connId: string, value: number) {
    const updated = this.graph.connections.map(c =>
      c.id === connId ? { ...c, loopCount: Math.max(1, value) } : c
    );
    this.graph.connections = updated;
    this.graphConnectionsSig.set(updated);
  }

  startConnBadgeEdit(connId: string, e: Event) {
    e.stopPropagation();
    this.editingConnId = connId;
  }

  stopConnBadgeEdit(e: Event) {
    e.stopPropagation();
    this.editingConnId = null;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Waypoint drag — click on a connection segment to add a waypoint,
  // drag an existing waypoint to move it, or move it "back in line" to delete it.
  onWaypointMouseDown(e: MouseEvent, connId: string, wpIdx: number) {
    e.stopPropagation();
    e.preventDefault();
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

  // Mousedown on the invisible hit-area path — begin pulling a new waypoint from that segment
  onConnHitMouseDown(e: MouseEvent, c: SpellConnection) {
    if (c.isLoop) return;
    e.stopPropagation();
    e.preventDefault();
    const world = this.clientToWorld(e.clientX, e.clientY);
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return;
    const wps    = c.waypoints ?? [];
    const allPts = [from, ...wps, to];

    // Find nearest segment
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
    if (c.isLoop) return; // no waypoints on loop arcs
    e.stopPropagation();
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

  private updateConnectionWaypoints(connId: string, wps: { x: number; y: number }[]) {
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
    if (c.isLoop) {
      const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
      const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
      if (!from || !to) return { x: 0, y: 0 };
      // Match loopArcPathScreen: rectangular arch top-center
      const worldDy = Math.abs(from.y - to.y);
      const rise  = Math.max(80, worldDy * 0.8 + 80);
      const topY  = Math.min(from.y, to.y) - rise;
      const midX  = (from.x + to.x) / 2;
      return this.worldToCanvasLocal(midX, topY);
    }
    const mp = this.loopMidPoint(c);
    return this.worldToCanvasLocal(mp.x, mp.y);
  }

  // Midpoint for branch label badge (sits on the line midpoint)
  branchMidPointScreen(c: SpellConnection): { x: number; y: number } {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return { x: 0, y: 0 };
    const sf = this.worldToCanvasLocal(from.x, from.y);
    const st = this.worldToCanvasLocal(to.x,   to.y);
    return { x: (sf.x + st.x) / 2, y: (sf.y + st.y) / 2 };
  }

  connectionColor(c: SpellConnection): string {
    if (c.isBranch) return '#f59e0b'; // amber for branch
    const from = this.allPortPositions().find(p => p.nodeId === c.fromNodeId && p.portId === c.fromPortId);
    return from?.color ?? FLOW_COLOR;
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
    this.inspectedRune = this.availableRunes.find(r => r.name === node.runeId) ?? null;
  }

  inspectPaletteRune(rune: RuneBlock) {
    if (rune.name === NEUTRAL_RUNE_ID) return;
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
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selectedConnectionId) {
        this.removeConnection(this.selectedConnectionId);
      }
      if (this.selectedNodeIds.size > 0) {
        for (const id of [...this.selectedNodeIds]) {
          this.removeNode(id);
        }
        this.selectedNodeIds = new Set();
      }
    }
    if (e.key === 'Escape') {
      this.selectedConnectionId = null;
      this.selectedNodeIds = new Set();
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
    this.savedFeedback = true;
    // Show brief save confirmation, then reset — do NOT close the editor
    setTimeout(() => {
      this.savedFeedback = false;
    }, 700);
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
