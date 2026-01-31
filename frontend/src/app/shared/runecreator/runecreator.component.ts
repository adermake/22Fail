import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RuneBlock, RUNE_TAG_OPTIONS } from '../../model/rune-block.model';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-rune-creator',
  imports: [CommonModule, FormsModule],
  templateUrl: './runecreator.component.html',
  styleUrl: './runecreator.component.css',
})
export class RuneCreatorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() create = new EventEmitter<RuneBlock>();
  @Output() cancel = new EventEmitter<void>();

  newRune: RuneBlock = {
    name: '',
    description: '',
    drawing: '',
    tags: [],
    strokeColor: '#8b5cf6',
  };

  strokeColor = '#8b5cf6';
  tagOptions = RUNE_TAG_OPTIONS;
  canvasWidth = signal(400);
  canvasHeight = signal(400);
  isErasing = signal(false);
  isPanning = signal(false);
  
  presetColors = [
    '#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#00ffff', 
    '#0066ff', '#6600ff', '#ff00ff', '#ffffff', '#000000'
  ];
  
  eraserSizes = [10, 20, 30, 40];
  eraserSize = 20;
  Math = Math;
  
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private expandAmount = 200;
  private undoHistory: ImageData[] = [];
  private maxUndoSteps = 20;
  private panStartX = 0;
  private panStartY = 0;

  constructor(private imageService: ImageService) {}

  ngOnInit() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && this.isDrawing === false) {
      event.preventDefault();
      this.undo();
    }
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 20;
    
    // Fill with black background
    this.clearCanvas();
    this.saveToHistory();
  }

  updateStrokeColor(color: string) {
    this.strokeColor = color;
    this.newRune.strokeColor = color;
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
    }
  }

  startDrawing(event: MouseEvent) {
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
      this.isDrawing = true;
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      this.lastX = event.clientX - rect.left;
      this.lastY = event.clientY - rect.top;
      this.saveToHistory();
    }
  }

  draw(event: MouseEvent) {
    // Handle panning
    if (this.isPanning()) {
      const container = this.canvasRef.nativeElement.parentElement;
      if (container) {
        container.scrollLeft = this.panStartX - event.clientX;
        container.scrollTop = this.panStartY - event.clientY;
      }
      return;
    }

    if (!this.isDrawing) return;

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
      this.ctx.shadowBlur = blur;
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    });

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.isDrawing = false;
    this.isPanning.set(false);
  }

  clearCanvas() {
    // Reset to initial size
    this.canvasWidth.set(400);
    this.canvasHeight.set(400);
    
    requestAnimationFrame(() => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
      this.undoHistory = [];
      this.saveToHistory();
    });
  }

  toggleEraser() {
    this.isErasing.set(!this.isErasing());
  }

  setDrawMode() {
    this.isErasing.set(false);
  }

  selectColor(color: string) {
    this.strokeColor = color;
    this.newRune.strokeColor = color;
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
      const canvas = this.canvasRef.nativeElement;
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.ctx.drawImage(tempCanvas, offsetX, offsetY);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
    });
  }

  private saveToHistory() {
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    this.undoHistory.push(imageData);
    
    if (this.undoHistory.length > this.maxUndoSteps) {
      this.undoHistory.shift();
    }
  }

  undo() {
    if (this.undoHistory.length < 2) return;
    
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

  toggleTag(tag: string) {
    const index = this.newRune.tags.indexOf(tag);
    if (index > -1) {
      this.newRune.tags = this.newRune.tags.filter(t => t !== tag);
    } else {
      this.newRune.tags = [...this.newRune.tags, tag];
    }
  }

  hasTag(tag: string): boolean {
    return this.newRune.tags.includes(tag);
  }

  async createRune() {
    if (!this.newRune.name.trim()) {
      alert('Rune name is required');
      return;
    }

    // Convert canvas to base64 image
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    // Upload image and get ID
    this.newRune.drawing = await this.imageService.uploadImage(dataUrl);

    this.create.emit({ ...this.newRune });
    
    // Reset form
    this.newRune = {
      name: '',
      description: '',
      drawing: '',
      tags: [],
    };
    this.clearCanvas();
  }

  cancelCreate() {
    this.cancel.emit();
  }
}