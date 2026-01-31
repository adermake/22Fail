import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPatch } from '../../model/json-patch.model';
import { RuneBlock, RUNE_TAG_OPTIONS, RUNE_GLOW_COLORS } from '../../model/rune-block.model';
import { KeywordEnhancer } from '../../sheet/keyword-enhancer';
import { ImageUrlPipe } from '../image-url.pipe';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-rune',
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './rune.component.html',
  styleUrl: './rune.component.css',
})
export class RuneComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @Input({ required: true }) rune!: RuneBlock;
  @Input({ required: true }) index!: number;
  @Input() isEditing = false;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  tagOptions = RUNE_TAG_OPTIONS;
  glowColors = RUNE_GLOW_COLORS;
  hasDrawing = false;
  canvasWidth = signal(400);
  canvasHeight = signal(400);
  isErasing = signal(false);
  isPanning = signal(false);
  isFullscreenDrawing = signal(false);
  
  // Preset colors for color picker
  presetColors = [
    '#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#00ffff', 
    '#0066ff', '#6600ff', '#ff00ff', '#ffffff', '#000000'
  ];
  
  // Eraser sizes
  eraserSizes = [10, 20, 30, 40];
  eraserSize = 20;
  
  // Make Math available in template
  Math = Math;
  
  private canvasInitialized = false;
  private ctx?: CanvasRenderingContext2D;
  private isDrawingOnCanvas = false;
  private lastX = 0;
  private lastY = 0;
  private expandAmount = 200;
  private undoHistory: ImageData[] = [];
  private maxUndoSteps = 20;
  private panStartX = 0;
  private panStartY = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && this.isEditing && this.hasDrawing && this.isDrawingOnCanvas === false) {
      event.preventDefault();
      this.undo();
    }
  }

  ngAfterViewInit() {
    this.tryInitCanvas();
  }

  ngAfterViewChecked() {
    this.tryInitCanvas();
  }

  private tryInitCanvas() {
    if (this.isEditing && this.hasDrawing && this.canvasRef && !this.canvasInitialized) {
      this.initCanvas();
      this.canvasInitialized = true;
    } else if (!this.isEditing || !this.hasDrawing) {
      this.canvasInitialized = false;
    }
  }

  get enhancedDescription(): SafeHtml {
    const original = this.rune.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  async toggleEdit() {
    const newEditingState = !this.isEditing;
    this.editingChange.emit(newEditingState);

    if (newEditingState) {
      this.hasDrawing = !!this.rune.drawing;
    } else {
      // Save drawing when closing edit (if not already saved by fullscreen close)
      if (this.hasDrawing && this.canvasRef && this.isFullscreenDrawing()) {
        // Already saved by closeFullscreenDrawing
      } else if (this.hasDrawing && this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        const dataUrl = canvas.toDataURL('image/png');
        const imageId = await this.imageService.uploadImage(dataUrl);
        this.updateField('drawing', imageId);
      } else if (!this.hasDrawing) {
        this.updateField('drawing', undefined);
      }
    }
  }

  toggleDrawing() {
    this.hasDrawing = !this.hasDrawing;
    this.canvasInitialized = false;
    if (!this.hasDrawing) {
      this.updateField('drawing', undefined);
    } else {
      // Open fullscreen when toggling drawing on
      setTimeout(() => this.openFullscreenDrawing(), 0);
    }
  }

  openFullscreenDrawing() {
    if (!this.hasDrawing) return;
    this.isFullscreenDrawing.set(true);
    this.canvasInitialized = false;
    this.cd.detectChanges();
    setTimeout(() => {
      if (this.canvasRef) {
        this.initCanvas();
        // Load existing drawing if available
        if (this.rune.drawing) {
          this.loadDrawing(this.rune.drawing);
        }
        this.cd.detectChanges();
      }
    }, 0);
  }

  async closeFullscreenDrawing() {
    // Save drawing when closing
    if (this.hasDrawing && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      const dataUrl = canvas.toDataURL('image/png');
      const imageId = await this.imageService.uploadImage(dataUrl);
      this.updateField('drawing', imageId);
    } else if (!this.hasDrawing) {
      this.updateField('drawing', undefined);
    }
    this.isFullscreenDrawing.set(false);
  }

  private loadDrawing(imageId: string) {
    if (!this.ctx) return;
    const img = new Image();
    img.onload = () => {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());
        this.ctx.drawImage(img, 0, 0);
      }
    };
    img.src = this.imageService.getImageUrl(imageId);
  }

  get strokeColor(): string {
    return this.rune.strokeColor || '#8b5cf6';
  }

  initCanvas() {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 20;

    // Load existing drawing if available
    if (this.rune.drawing) {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to match image dimensions
        this.canvasWidth.set(img.width);
        this.canvasHeight.set(img.height);
        
        // Wait for canvas to resize, then draw image
        requestAnimationFrame(() => {
          if (this.ctx) {
            // Fill black background first
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw the image
            this.ctx.drawImage(img, 0, 0);
            // Restore settings
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.shadowColor = this.strokeColor;
            this.ctx.shadowBlur = 20;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.saveToHistory();
          }
        });
      };
      img.src = this.imageService.getImageUrl(this.rune.drawing) || '';
    } else {
      this.clearCanvas();
      this.saveToHistory();
    }
  }

  updateStrokeColor(color: string) {
    this.updateField('strokeColor', color);
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
    }
  }

  startDrawing(event: MouseEvent) {
    if (!this.canvasRef) return;

    // Middle mouse button for panning
    if (event.button === 1) {
      event.preventDefault();
      const container = this.canvasRef.nativeElement.parentElement;
      if (container) {
        this.isPanning.set(true);
        this.panStartX = container.scrollLeft + event.clientX;
        this.panStartY = container.scrollTop + event.clientY;
      }
      return;
    }

    // Left mouse button for drawing
    if (event.button === 0) {
      this.isDrawingOnCanvas = true;
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      this.lastX = event.clientX - rect.left;
      this.lastY = event.clientY - rect.top;
      this.saveToHistory();
    }
  }

  draw(event: MouseEvent) {
    if (!this.canvasRef) return;

    // Handle panning
    if (this.isPanning()) {
      const container = this.canvasRef.nativeElement.parentElement;
      if (container) {
        container.scrollLeft = this.panStartX - event.clientX;
        container.scrollTop = this.panStartY - event.clientY;
      }
      return;
    }

    // Handle drawing
    if (!this.isDrawingOnCanvas || !this.ctx) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isErasing()) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.eraserSize;
      this.ctx.shadowBlur = 0;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.lineWidth = 2;
    }

    // Draw multiple passes with different blur levels for stronger glow
    const blurLevels = this.isErasing() ? [0] : [30, 20, 10, 5];
    blurLevels.forEach(blur => {
      this.ctx!.shadowBlur = blur;
      this.ctx!.beginPath();
      this.ctx!.moveTo(this.lastX, this.lastY);
      this.ctx!.lineTo(x, y);
      this.ctx!.stroke();
    });

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.isDrawingOnCanvas = false;
    this.isPanning.set(false);
  }

  clearCanvas() {
    if (!this.canvasRef || !this.ctx) return;

    // Reset to initial size
    this.canvasWidth.set(400);
    this.canvasHeight.set(400);
    
    requestAnimationFrame(() => {
      if (this.ctx && this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.shadowColor = this.strokeColor;
        this.ctx.shadowBlur = 20;
        this.ctx.lineWidth = 2;
        this.undoHistory = [];
        this.saveToHistory();
      }
    });
  }

  toggleEraser() {
    this.isErasing.set(!this.isErasing());
  }

  setDrawMode() {
    this.isErasing.set(false);
  }

  selectColor(color: string) {
    this.updateField('strokeColor', color);
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
    }
  }

  onColorInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectColor(input.value);
  }

  selectEraserSize(size: number) {
    this.eraserSize = size;
  }

  expandLeft() {
    this.expandCanvas('left');
  }

  expandRight() {
    this.expandCanvas('right');
  }

  expandTop() {
    this.expandCanvas('top');
  }

  expandBottom() {
    this.expandCanvas('bottom');
  }

  expandCanvas(direction: 'left' | 'right' | 'top' | 'bottom') {
    if (!this.canvasRef || !this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    const oldWidth = this.canvasWidth();
    const oldHeight = this.canvasHeight();

    let newWidth = oldWidth;
    let newHeight = oldHeight;
    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
      case 'left':
        newWidth = oldWidth + this.expandAmount;
        offsetX = this.expandAmount;
        break;
      case 'right':
        newWidth = oldWidth + this.expandAmount;
        break;
      case 'top':
        newHeight = oldHeight + this.expandAmount;
        offsetY = this.expandAmount;
        break;
      case 'bottom':
        newHeight = oldHeight + this.expandAmount;
        break;
    }

    this.canvasWidth.set(newWidth);
    this.canvasHeight.set(newHeight);

    requestAnimationFrame(() => {
      if (this.ctx && this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(tempCanvas, offsetX, offsetY);
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.shadowColor = this.strokeColor;
        this.ctx.shadowBlur = 20;
        this.ctx.lineWidth = 2;
      }
    });
  }

  private saveToHistory() {
    if (!this.canvasRef || !this.ctx) return;
    
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    this.undoHistory.push(imageData);
    
    if (this.undoHistory.length > this.maxUndoSteps) {
      this.undoHistory.shift();
    }
  }

  undo() {
    if (!this.canvasRef || !this.ctx || this.undoHistory.length < 2) return;
    
    this.undoHistory.pop();
    const previousState = this.undoHistory[this.undoHistory.length - 1];
    
    if (previousState) {
      this.ctx.putImageData(previousState, 0, 0);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
    }
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }

  toggleTag(tag: string) {
    if (!this.rune.tags) {
      this.rune.tags = [];
    }
    
    const index = this.rune.tags.indexOf(tag);
    let newTags: string[];
    
    if (index > -1) {
      newTags = this.rune.tags.filter(t => t !== tag);
    } else {
      newTags = [...this.rune.tags, tag];
    }
    
    this.updateField('tags', newTags);
  }

  hasTag(tag: string): boolean {
    return this.rune.tags?.includes(tag) || false;
  }

  deleteRune() {
    this.delete.emit();
  }
}