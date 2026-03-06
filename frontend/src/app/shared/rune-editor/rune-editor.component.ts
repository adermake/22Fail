import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Input, OnDestroy, OnInit, Output, ViewChild, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RuneBlock, RuneDataLine, RuneStatRequirements, RUNE_GLOW_COLORS, RUNE_DEFAULT_TAGS, RUNE_TAG_OPTIONS } from '../../model/rune-block.model';
import { ImageService } from '../../services/image.service';
import { ImageUrlPipe } from '../image-url.pipe';

@Component({
  selector: 'app-rune-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './rune-editor.component.html',
  styleUrl: './rune-editor.component.css',
})
export class RuneEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() rune: RuneBlock | null = null;
  @Input() showLearnedToggle = false; // only shown in character sheet context
  @Output() save   = new EventEmitter<RuneBlock>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  @ViewChild('drawCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput',  { static: false }) fileInputRef!: ElementRef<HTMLInputElement>;

  private imageService = inject(ImageService);
  private cd = inject(ChangeDetectorRef);

  editRune!: RuneBlock;
  isNewRune = true;

  glowColors   = RUNE_GLOW_COLORS;
  defaultTags  = RUNE_DEFAULT_TAGS;
  allTagOptions = RUNE_TAG_OPTIONS;
  newTag = '';

  // Drawing state
  isDrawing = signal(false);
  isErasing = signal(false);
  isSavingCanvas = signal(false);
  showDrawPanel = signal(false);
  canvasWidth  = signal(512);
  canvasHeight = signal(512);

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;
  private undoHistory: ImageData[] = [];
  private readonly MAX_UNDO = 25;
  private canvasReady = false;
  private keyHandler = this.onKeyDown.bind(this);

  statKeys: Array<{ key: keyof RuneStatRequirements; label: string }> = [
    { key: 'strength',     label: 'STR' },
    { key: 'dexterity',    label: 'GES' },
    { key: 'speed',        label: 'GES' },
    { key: 'intelligence', label: 'INT' },
    { key: 'constitution', label: 'KON' },
    { key: 'chill',        label: 'CHR' },
  ];

  ngOnInit() {
    if (this.rune) {
      this.editRune = JSON.parse(JSON.stringify(this.rune));
      this.isNewRune = false;
    } else {
      this.editRune = {
        name: '', description: '', drawing: '', tags: [],
        glowColor: '#06b6d4', fokus: 0, fokusMult: 0,
        mana: 0, manaMult: 0, effektivitaet: 0,
        statRequirements: { strength: 0, dexterity: 0, speed: 0, intelligence: 0, constitution: 0, chill: 0 },
        identified: true, learned: false,
      };
    }
    if (!this.editRune.statRequirements) this.editRune.statRequirements = {};
    if (!this.editRune.tags) this.editRune.tags = [];
    if (!this.editRune.inputs) this.editRune.inputs = [];
    if (!this.editRune.outputs) this.editRune.outputs = [];
    if (this.editRune.drawing) this.showDrawPanel.set(true);
    document.addEventListener('keydown', this.keyHandler);
  }

  ngAfterViewInit() {
    if (this.showDrawPanel() && this.canvasRef) {
      this.initCanvas();
    }
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }

  private onKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !this.drawing) {
      e.preventDefault();
      this.undo();
    }
  }

  // ─── Canvas ──────────────────────────────────────────────────────────────

  openDrawPanel() {
    this.showDrawPanel.set(true);
    this.canvasReady = false;
    this.cd.detectChanges();
    setTimeout(() => this.initCanvas(), 0);
  }

  private initCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.applyCtxSettings();
    if (this.editRune.drawing) {
      this.loadDrawingFromId(this.editRune.drawing);
    } else {
      this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      this.saveHistory();
    }
    this.canvasReady = true;
  }

  private applyCtxSettings() {
    const color = this.editRune.glowColor || '#06b6d4';
    this.ctx.lineWidth = 6;
    this.ctx.lineCap   = 'round';
    this.ctx.lineJoin  = 'round';
    this.ctx.strokeStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur  = 20;
  }

  private fillBlack() {
    const c = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, c.width, c.height);
  }

  private loadDrawingFromId(imageId: string) {
    const url = this.imageService.getImageUrl(imageId);
    if (!url) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (this.ctx) {
        const c = this.canvasRef.nativeElement;
        this.ctx.clearRect(0, 0, c.width, c.height);
        this.ctx.drawImage(img, 0, 0, c.width, c.height);
        this.saveHistory();
      }
    };
    img.src = url;
  }

  onCanvasMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    this.drawing = true;
    const canvas = this.canvasRef.nativeElement;
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    this.lastX = (e.clientX - r.left) * scaleX;
    this.lastY = (e.clientY - r.top) * scaleY;
    this.saveHistory();
  }

  onCanvasMouseMove(e: MouseEvent) {
    if (!this.drawing) return;
    const canvas = this.canvasRef.nativeElement;
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    const x = (e.clientX - r.left) * scaleX;
    const y = (e.clientY - r.top) * scaleY;
    this.stroke(x, y);
    this.lastX = x;
    this.lastY = y;
  }

  onCanvasMouseUp()   { this.drawing = false; }
  onCanvasMouseLeave(){ this.drawing = false; }

  private stroke(x: number, y: number) {
    this.ctx.setLineDash([]);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    if (this.isErasing()) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = 32;
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.lineWidth = 6;
    } else {
      // Multi-pass glow — wide outer glow passes
      const color = this.editRune.glowColor || '#06b6d4';
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
      for (const [blur, width] of [[40, 9], [20, 7], [10, 6], [4, 6]] as [number, number][]) {
        this.ctx.shadowBlur = blur;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      }
      // White inner core
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      this.ctx.shadowColor = 'rgba(255,255,255,0.6)';
      this.ctx.shadowBlur = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }
  }

  setGlowColor(c: string) {
    this.editRune.glowColor = c;
    this.applyCtxSettings();
  }

  toggleEraser() { this.isErasing.set(!this.isErasing()); }
  setDraw()      { this.isErasing.set(false); }

  clearCanvas() {
    if (!this.ctx) return;
    const c = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    this.applyCtxSettings();
    this.undoHistory = [];
    this.saveHistory();
  }

  undo() {
    if (this.undoHistory.length <= 1) return;
    this.undoHistory.pop();
    const img = this.undoHistory[this.undoHistory.length - 1];
    if (this.ctx) this.ctx.putImageData(img, 0, 0);
  }

  private saveHistory() {
    if (!this.ctx) return;
    const c = this.canvasRef.nativeElement;
    const snap = this.ctx.getImageData(0, 0, c.width, c.height);
    this.undoHistory.push(snap);
    if (this.undoHistory.length > this.MAX_UNDO) this.undoHistory.shift();
  }

  async uploadCanvasAsImage() {
    if (!this.canvasRef) return;
    this.isSavingCanvas.set(true);
    try {
      const canvas = this.canvasRef.nativeElement;
      const dataUrl = canvas.toDataURL('image/png');
      const id = await this.imageService.uploadImage(dataUrl);
      this.editRune.drawing = id;
    } finally {
      this.isSavingCanvas.set(false);
    }
  }

  // ─── File upload ─────────────────────────────────────────────────────────

  triggerFileUpload() { this.fileInputRef.nativeElement.click(); }

  async onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // Resize to 512×512 via offscreen canvas
      const img = new Image();
      img.onload = async () => {
        const tmp = document.createElement('canvas');
        tmp.width = tmp.height = 512;
        const tc = tmp.getContext('2d')!;
        tc.drawImage(img, 0, 0, 512, 512);
        const resized = tmp.toDataURL('image/png');
        const id = await this.imageService.uploadImage(resized);
        this.editRune.drawing = id;
        // Show draw panel with the uploaded image so user can annotate
        this.showDrawPanel.set(true);
        this.canvasReady = false;
        this.cd.detectChanges();
        setTimeout(() => this.initCanvas(), 0);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeImage() {
    this.editRune.drawing = '';
    this.showDrawPanel.set(false);
    this.undoHistory = [];
    this.canvasReady = false;
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────

  addTag() {
    const t = this.newTag.trim();
    if (t && !this.editRune.tags.includes(t)) {
      this.editRune.tags = [...this.editRune.tags, t];
    }
    this.newTag = '';
  }

  toggleTag(tag: string) {
    if (this.editRune.tags.includes(tag)) {
      this.editRune.tags = this.editRune.tags.filter(t => t !== tag);
    } else {
      this.editRune.tags = [...this.editRune.tags, tag];
    }
  }

  removeTag(i: number) {
    this.editRune.tags = this.editRune.tags.filter((_, idx) => idx !== i);
  }

  isTagActive(tag: string) { return (this.editRune.tags ?? []).includes(tag); }

  // ─── Datalines ────────────────────────────────────────────────────────────

  addDataLine(dir: 'inputs' | 'outputs') {
    const list = (this.editRune[dir] ?? []).slice();
    list.push({ name: '', color: '#06b6d4', types: [] });
    this.editRune[dir] = list;
  }

  removeDataLine(dir: 'inputs' | 'outputs', index: number) {
    const list = (this.editRune[dir] ?? []).slice();
    list.splice(index, 1);
    this.editRune[dir] = list;
  }

  addType(line: RuneDataLine, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value.trim();
    (event as KeyboardEvent).preventDefault();
    if (val && !line.types.includes(val)) {
      line.types = [...line.types, val];
    }
    input.value = '';
  }

  removeType(line: RuneDataLine, index: number) {
    line.types = line.types.filter((_, i) => i !== index);
  }

  // ─── Save / Cancel ────────────────────────────────────────────────────────

  async saveRune() {
    // If draw panel is open, flush canvas to image before saving
    if (this.showDrawPanel() && this.ctx) {
      await this.uploadCanvasAsImage();
    }
    this.save.emit(this.editRune);
  }

  cancelEdit() { this.cancel.emit(); }

  deleteRune() {
    if (confirm('Rune wirklich löschen?')) this.delete.emit();
  }
}
