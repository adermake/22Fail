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
  buildRunePorts, portsCompatible, FLOW_COLOR, FLOW_TYPE,
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
    return this.availableRunes.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.tags || []).some(t => t.toLowerCase().includes(q))
    );
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
  pending    = signal<PendingConnection | null>(null);
  hoveredPort = signal<PortPosition | null>(null);
  selectedConnectionId: string | null = null;

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
      const rune = this.availableRunes.find(r => r.name === node.runeId);
      const ports = rune ? buildRunePorts(rune) : [
        { id: 'flow-in',  kind: 'flow-in'  as const, name: 'Fluss', color: FLOW_COLOR, types: FLOW_TYPE },
        { id: 'flow-out', kind: 'flow-out' as const, name: 'Fluss', color: FLOW_COLOR, types: FLOW_TYPE },
      ];
      const inputPorts  = ports.filter(p => p.kind === 'flow-in'  || p.kind === 'data-in');
      const outputPorts = ports.filter(p => p.kind === 'flow-out' || p.kind === 'data-out');
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
      const ins  = ns.ports.filter(p => p.kind === 'flow-in'  || p.kind === 'data-in');
      const outs = ns.ports.filter(p => p.kind === 'flow-out' || p.kind === 'data-out');
      const imgCY = n.y + this.NODE_IMG / 2;

      // Left edge (x = node.x), ports centered around image midpoint
      ins.forEach((p, i) => {
        result.push({
          nodeId: n.id, portId: p.id, kind: p.kind, color: p.color, types: p.types,
          x: n.x,
          y: imgCY - ((ins.length - 1) * this.PORT_GAP / 2) + i * this.PORT_GAP,
        });
      });

      // Right edge (x = node.x + NODE_IMG)
      outs.forEach((p, i) => {
        result.push({
          nodeId: n.id, portId: p.id, kind: p.kind, color: p.color, types: p.types,
          x: n.x + this.NODE_IMG,
          y: imgCY - ((outs.length - 1) * this.PORT_GAP / 2) + i * this.PORT_GAP,
        });
      });
    }
    return result;
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
  // Connection path helpers (SVG bezier)
  connectionPath(c: SpellConnection): string {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to   = this.resolvePortWorldPos(c.toNodeId,   c.toPortId);
    if (!from || !to) return '';
    return this.bezierPath(from.x, from.y, to.x, to.y);
  }

  pendingPath(): string {
    const p = this.pending();
    if (!p) return '';
    return this.bezierPath(p.fromX, p.fromY, p.toX, p.toY);
  }

  // Screen-space pending path — coordinates relative to canvas-wrap (no world transform).
  // Used by the overlay SVG that lives outside canvas-world, so it always renders correctly.
  pendingPathScreen(): string {
    const p = this.pending();
    if (!p) return '';
    const from = this.worldToCanvasLocal(p.fromX, p.fromY);
    const to   = this.worldToCanvasLocal(p.toX,   p.toY);
    return this.bezierPath(from.x, from.y, to.x, to.y);
  }

  pendingColor(): string {
    return this.pending()?.color ?? '#ffffff';
  }

  private bezierPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = Math.abs(x2 - x1);
    const force = Math.max(60, dx * 0.5);
    return `M ${x1} ${y1} C ${x1 + force} ${y1} ${x2 - force} ${y2} ${x2} ${y2}`;
  }

  private resolvePortWorldPos(nodeId: string, portId: string): { x: number; y: number } | null {
    const all = this.allPortPositions();
    return all.find(p => p.nodeId === nodeId && p.portId === portId) ?? null;
  }

  connectionColor(c: SpellConnection): string {
    const from = this.allPortPositions().find(p => p.nodeId === c.fromNodeId && p.portId === c.fromPortId);
    return from?.color ?? FLOW_COLOR;
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
  // Canvas mouse events (pan)
  onCanvasMouseDown(e: MouseEvent) {
    if (e.target !== this.canvasEl() && !(e.target as Element).classList.contains('svg-bg')) return;
    this.isPanning   = true;
    this.panStartX    = e.clientX;
    this.panStartY    = e.clientY;
    this.panStartPanX = this.panX;
    this.panStartPanY = this.panY;
  }

  // Document-level mouse handlers (registered manually in ngOnInit)
  private handleMouseMove(e: MouseEvent) {
    if (this.isPanning) {
      this.panX = this.panStartPanX + (e.clientX - this.panStartX);
      this.panY = this.panStartPanY + (e.clientY - this.panStartY);
      return;
    }
    if (this.draggingNodeId) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      const node = this.graph.nodes.find(n => n.id === this.draggingNodeId);
      if (node) {
        node.x = world.x - this.dragOffsetX;
        node.y = world.y - this.dragOffsetY;
        this.nodeStates.get(node.id)!.node = node;
      }
      return;
    }
    const cur = this.pending();
    if (cur) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      this.pending.set({ ...cur, toX: world.x, toY: world.y });
      this.hoveredPort.set(this.findPortAt(world.x, world.y, 14));
      return;
    }
    if (this.isDraggingStartNode) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      this.graph.startNode.x = world.x - this.startNodeDragOffX;
      this.graph.startNode.y = world.y - this.startNodeDragOffY;
    }
  }

  private handleMouseUp(e: MouseEvent) {
    if (this.isPanning)          { this.isPanning = false; return; }
    if (this.isDraggingStartNode){ this.isDraggingStartNode = false; return; }
    if (this.draggingNodeId)     { this.draggingNodeId = null; return; }
    const cur = this.pending();
    if (cur) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      const target = this.findPortAt(world.x, world.y, 14);
      if (target && this.canConnect(cur, target)) {
        this.createConnection(cur, target);
      }
      this.pending.set(null);
      this.hoveredPort.set(null);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Node drag
  onNodeMouseDown(e: MouseEvent, nodeId: string) {
    e.stopPropagation();
    if ((e.target as Element).closest('.rune-port')) return;
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
  // Port drag (start connection)
  onPortMouseDown(e: MouseEvent, nodeId: string, portId: string) {
    e.stopPropagation();
    e.preventDefault();
    const all = this.allPortPositions();
    const port = all.find(p => p.nodeId === nodeId && p.portId === portId);
    if (!port) return;
    // Only start connections from outputs
    if (port.kind !== 'flow-out' && port.kind !== 'data-out') return;
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
    // must be going to an input
    if (target.kind !== 'flow-in' && target.kind !== 'data-in') return false;
    // same node not allowed
    if (pending.fromNodeId === target.nodeId) return false;
    // type compatibility
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
    const conn: SpellConnection = {
      id: `conn-${this.nextId++}`,
      fromNodeId: pending.fromNodeId,
      fromPortId: pending.fromPortId,
      toNodeId:   target.nodeId,
      toPortId:   target.portId,
    };
    // Check for cycle (only for flow connections)
    if (this.createsCycle(conn)) {
      conn.isLoop = true;
      conn.loopCount = 1;
    }
    this.graph.connections = [...this.graph.connections, conn];
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
  }

  selectConnection(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.selectedConnectionId = this.selectedConnectionId === id ? null : id;
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
  }

  removeNode(nodeId: string) {
    this.graph.nodes       = this.graph.nodes.filter(n => n.id !== nodeId);
    this.graph.connections = this.graph.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    this.nodeStates.delete(nodeId);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Template helpers
  getNodeRune(nodeId: string): RuneBlock | undefined {
    const ns = this.nodeStates.get(nodeId);
    if (!ns) return undefined;
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

  nodeGlowColor(nodeId: string): string {
    const rune = this.getNodeRune(nodeId);
    return rune?.glowColor || '#8b5cf6';
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

  // Port's CSS top offset within the node div (world y → node-local px)
  portNodeTop(nodeId: string, portId: string): number {
    const pp   = this.portPortPos(nodeId, portId);
    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (!pp || !node) return 0;
    return pp.y - node.y - this.PORT_R;
  }

  trackById(_: number, item: { id: string }) { return item.id; }
  trackByName(_: number, item: { name: string }) { return item.name; }

  // ────────────────────────────────────────────────────────────────────────────
  // Keyboard: delete selected connection
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedConnectionId) {
      if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        this.removeConnection(this.selectedConnectionId);
      }
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
