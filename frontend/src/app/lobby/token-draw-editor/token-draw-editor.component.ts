import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output,
  ViewChild, signal,
} from '@angular/core';
import { floodFill } from '../../utils/flood-fill.util';

/** Pixel size of the drawing. Tokens render at ~54px, so this leaves plenty of room for zoom. */
const SIZE = 512;
const MAX_UNDO = 40;

type Tool = 'brush' | 'eraser' | 'fill' | 'pipette';

const TOOLS: { id: Tool; label: string; icon: string; key: string }[] = [
  { id: 'brush', label: 'Pinsel', icon: 'i-draw', key: 'B' },
  { id: 'eraser', label: 'Radierer', icon: 'i-eraser', key: 'E' },
  { id: 'fill', label: 'Füllen', icon: 'i-fill', key: 'G' },
  { id: 'pipette', label: 'Pipette', icon: 'i-pipette', key: 'I' },
];

const PRESETS = [
  '#000000', '#ffffff', '#6b7280', '#7c2d12', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#fcd5b5', '#a16207', '#1e3a8a', '#14532d',
];

/**
 * Full-screen PNG editor for a token's portrait.
 *
 * One raster layer, no vector paths: what you see is what gets saved. The source image (the token's
 * original portrait, or an upload) is painted INTO that layer, so drawing on top of it — or erasing
 * parts of it — just works.
 *
 * Strokes go to a scratch canvas at full strength and are composited over a snapshot of the layer
 * taken at pointer-down, at the chosen opacity. Drawing segments straight onto the layer with
 * `globalAlpha` would darken every point where segments overlap, which is most of them.
 */
@Component({
  selector: 'app-token-draw-editor',
  standalone: true,
  templateUrl: './token-draw-editor.component.html',
  styleUrl: './token-draw-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenDrawEditorComponent implements AfterViewInit {
  /** Shown in the header — the token's name. */
  @Input() title = '';
  /** The token's current hand-drawn portrait, if any. Opens on this so edits continue it. */
  @Input() initialImage: string | null = null;
  /** URL of the image the token had before any drawing — "Originalbild laden". */
  @Input() originalSrc: string | null = null;

  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('root') rootRef?: ElementRef<HTMLElement>;
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly size = SIZE;
  readonly tools = TOOLS;
  readonly presets = PRESETS;

  tool = signal<Tool>('brush');
  color = signal('#000000');
  brushSize = signal(14);
  opacity = signal(100);
  showHexGuide = signal(true);
  recentColors = signal<string[]>([]);

  canUndo = signal(false);
  canRedo = signal(false);
  dirty = signal(false);
  confirmDiscard = signal(false);
  message = signal('');

  /** Brush outline under the pointer, in stage pixels. */
  cursor = signal<{ x: number; y: number; d: number } | null>(null);

  private ctx: CanvasRenderingContext2D | null = null;
  private base = document.createElement('canvas');
  private stroke = document.createElement('canvas');
  private undoStack: ImageData[] = [];
  private redoStack: ImageData[] = [];
  private drawing: { pointerId: number; last: { x: number; y: number } } | null = null;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    for (const c of [this.base, this.stroke]) { c.width = SIZE; c.height = SIZE; }
    this.rootRef?.nativeElement.focus();

    const start = this.initialImage || this.originalSrc;
    if (start) void this.paintImage(start, false);
  }

  // ── Sources ─────────────────────────────────────────────────────────────────

  loadOriginal(): void {
    if (this.originalSrc) void this.paintImage(this.originalSrc, true);
  }

  onUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => void this.paintImage(reader.result as string, true);
    reader.readAsDataURL(file);
  }

  /**
   * Replace the layer with an image, cropped to cover the square — the same framing the token
   * itself uses in 'Füllen' mode. `undoable` is false only for the image the editor opens on.
   */
  private paintImage(src: string, undoable: boolean): Promise<void> {
    return new Promise(resolve => {
      const img = new Image();
      if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = () => {
        const ctx = this.ctx;
        if (!ctx) { resolve(); return; }
        if (undoable) this.pushUndo();
        const scale = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
        this.message.set('');
        resolve();
      };
      img.onerror = () => {
        this.message.set('Bild konnte nicht geladen werden.');
        resolve();
      };
      img.src = src;
    });
  }

  clearCanvas(): void {
    if (!this.ctx) return;
    this.pushUndo();
    this.ctx.clearRect(0, 0, SIZE, SIZE);
  }

  // ── Undo ────────────────────────────────────────────────────────────────────

  private pushUndo(): void {
    if (!this.ctx) return;
    this.undoStack.push(this.ctx.getImageData(0, 0, SIZE, SIZE));
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
    this.dirty.set(true);
    this.syncHistoryFlags();
  }

  undo(): void {
    const ctx = this.ctx;
    const prev = this.undoStack.pop();
    if (!ctx || !prev) return;
    this.redoStack.push(ctx.getImageData(0, 0, SIZE, SIZE));
    ctx.putImageData(prev, 0, 0);
    this.syncHistoryFlags();
  }

  redo(): void {
    const ctx = this.ctx;
    const next = this.redoStack.pop();
    if (!ctx || !next) return;
    this.undoStack.push(ctx.getImageData(0, 0, SIZE, SIZE));
    ctx.putImageData(next, 0, 0);
    this.syncHistoryFlags();
  }

  private syncHistoryFlags(): void {
    this.canUndo.set(this.undoStack.length > 0);
    this.canRedo.set(this.redoStack.length > 0);
  }

  // ── Pointer ─────────────────────────────────────────────────────────────────

  /** Pointer position in canvas pixels. */
  private toCanvas(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvasRef!.nativeElement.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SIZE,
      y: ((event.clientY - rect.top) / rect.height) * SIZE,
    };
  }

  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !this.ctx) return;
    event.preventDefault();
    const p = this.toCanvas(event);
    const tool = this.tool();

    if (tool === 'fill') { this.fillAt(p); return; }
    if (tool === 'pipette') { this.pickAt(p); return; }

    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.pushUndo();
    const base = this.base.getContext('2d')!;
    base.clearRect(0, 0, SIZE, SIZE);
    base.drawImage(this.ctx.canvas, 0, 0);
    this.stroke.getContext('2d')!.clearRect(0, 0, SIZE, SIZE);

    this.drawing = { pointerId: event.pointerId, last: p };
    this.strokeSegment(p, p, this.widthFor(event));
    this.composite();
    if (tool === 'brush') this.rememberColor(this.color());
  }

  onPointerMove(event: PointerEvent): void {
    this.updateCursor(event);
    const drawing = this.drawing;
    if (!drawing || drawing.pointerId !== event.pointerId) return;
    // Coalesced events keep fast strokes smooth instead of turning them into polygons.
    const events = event.getCoalescedEvents?.() ?? [event];
    for (const e of events.length ? events : [event]) {
      const p = this.toCanvas(e);
      this.strokeSegment(drawing.last, p, this.widthFor(e));
      drawing.last = p;
    }
    this.composite();
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.drawing || this.drawing.pointerId !== event.pointerId) return;
    this.drawing = null;
    this.composite();
  }

  onPointerLeave(): void {
    if (!this.drawing) this.cursor.set(null);
  }

  /** Pen pressure scales the width; mice report a flat 0.5 while pressed, so they are left alone. */
  private widthFor(event: PointerEvent): number {
    const size = this.brushSize();
    return event.pointerType === 'pen' && event.pressure > 0 ? Math.max(1, size * event.pressure * 1.6) : size;
  }

  private strokeSegment(a: { x: number; y: number }, b: { x: number; y: number }, width: number): void {
    const s = this.stroke.getContext('2d')!;
    s.strokeStyle = s.fillStyle = this.tool() === 'eraser' ? '#000000' : this.color();
    s.lineWidth = width;
    s.lineCap = 'round';
    s.lineJoin = 'round';
    if (a.x === b.x && a.y === b.y) {
      s.beginPath();
      s.arc(a.x, a.y, width / 2, 0, Math.PI * 2);
      s.fill();
      return;
    }
    s.beginPath();
    s.moveTo(a.x, a.y);
    s.lineTo(b.x, b.y);
    s.stroke();
  }

  /** Layer = snapshot from pointer-down + the whole stroke so far, at the chosen opacity. */
  private composite(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(this.base, 0, 0);
    ctx.globalAlpha = this.opacity() / 100;
    ctx.globalCompositeOperation = this.tool() === 'eraser' ? 'destination-out' : 'source-over';
    ctx.drawImage(this.stroke, 0, 0);
    ctx.restore();
  }

  private fillAt(p: { x: number; y: number }): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const image = ctx.getImageData(0, 0, SIZE, SIZE);
    const before = ctx.getImageData(0, 0, SIZE, SIZE);
    const changed = floodFill(image.data, SIZE, SIZE, p.x, p.y, hexToRgb(this.color()), this.opacity() / 100);
    if (!changed) return;
    this.undoStack.push(before);
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
    this.dirty.set(true);
    this.syncHistoryFlags();
    ctx.putImageData(image, 0, 0);
    this.rememberColor(this.color());
  }

  /** Pick a colour off the drawing, then hand straight back to the brush. */
  private pickAt(p: { x: number; y: number }): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const [r, g, b, a] = ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
    if (a === 0) { this.message.set('Dort ist nichts — transparente Stelle.'); return; }
    this.color.set(rgbToHex(r, g, b));
    this.message.set('');
    this.tool.set('brush');
  }

  private updateCursor(event: PointerEvent): void {
    const tool = this.tool();
    if (tool !== 'brush' && tool !== 'eraser') { this.cursor.set(null); return; }
    const rect = this.canvasRef!.nativeElement.getBoundingClientRect();
    this.cursor.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      d: Math.max(4, (this.brushSize() / SIZE) * rect.width),
    });
  }

  // ── Settings ────────────────────────────────────────────────────────────────

  setColor(c: string): void {
    this.color.set(c);
    if (this.tool() === 'eraser' || this.tool() === 'pipette') this.tool.set('brush');
  }

  private rememberColor(c: string): void {
    const list = [c, ...this.recentColors().filter(x => x !== c)].slice(0, 8);
    this.recentColors.set(list);
  }

  setBrushSize(v: number): void {
    this.brushSize.set(Math.max(1, Math.min(120, Math.round(v) || 1)));
  }

  setOpacity(v: number): void {
    this.opacity.set(Math.max(5, Math.min(100, Math.round(v) || 100)));
  }

  // ── Keys ────────────────────────────────────────────────────────────────────

  /**
   * Handled on the editor's own root and never allowed past it: the lobby listens on document and
   * window, and B/E/G/Strg+Z there would switch map tools or undo map strokes behind the editor.
   */
  onKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'range') return;

    const key = event.key.toLowerCase();
    if (event.ctrlKey || event.metaKey) {
      if (key === 'z' && !event.shiftKey) { event.preventDefault(); this.undo(); }
      else if (key === 'y' || (key === 'z' && event.shiftKey)) { event.preventDefault(); this.redo(); }
      else if (key === 's') { event.preventDefault(); this.onSave(); }
      return;
    }
    const tool = TOOLS.find(t => t.key.toLowerCase() === key);
    if (tool) { this.tool.set(tool.id); this.cursor.set(null); return; }
    if (key === '[') this.setBrushSize(this.brushSize() - Math.max(1, Math.round(this.brushSize() * 0.15)));
    else if (key === ']') this.setBrushSize(this.brushSize() + Math.max(1, Math.round(this.brushSize() * 0.15)));
    else if (key === 'h') this.showHexGuide.set(!this.showHexGuide());
    else if (key === 'escape') this.requestClose();
  }

  // ── Leaving ─────────────────────────────────────────────────────────────────

  onSave(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.save.emit(canvas.toDataURL('image/png'));
  }

  requestClose(): void {
    if (this.dirty()) this.confirmDiscard.set(true);
    else this.cancel.emit();
  }

  discard(): void { this.cancel.emit(); }

  keepDrawing(): void {
    this.confirmDiscard.set(false);
    this.rootRef?.nativeElement.focus();
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
