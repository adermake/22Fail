import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SPELL_TAG_OPTIONS, SpellBlock } from '../../model/spell-block-model';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-spell-creator',
  imports: [CommonModule, FormsModule],
  templateUrl: './spell-creator.component.html',
  styleUrl: './spell-creator.component.css',
})
export class SpellCreatorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() create = new EventEmitter<SpellBlock>();
  @Output() cancel = new EventEmitter<void>();

  newSpell: SpellBlock = {
    name: '',
    description: '',
    drawing: undefined,
    tags: [],
    binding: { type: 'learned' },
    strokeColor: '#673ab7',
  };

  strokeColor = '#673ab7';
  tagOptions = SPELL_TAG_OPTIONS;
  hasDrawing = false;
  canvasWidth = signal(600);
  canvasHeight = signal(300);
  isErasing = signal(false);
  private ctx?: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private expandThreshold = 50; // Distance from edge to trigger expansion
  private expandAmount = 200; // Pixels to add when expanding
  private canvasOffsetX = 0; // Track content offset when expanding left
  private canvasOffsetY = 0; // Track content offset when expanding top
  private undoHistory: ImageData[] = []; // Undo history
  private maxUndoSteps = 20;

  constructor(private cd: ChangeDetectorRef, private imageService: ImageService) {}

  ngOnInit() {
    // Add keyboard listener for undo
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && this.hasDrawing && this.isDrawing === false) {
      event.preventDefault();
      this.undo();
    }
  }

  private canvasInitialized = false;

  ngAfterViewInit() {
    this.tryInitCanvas();
  }

  ngAfterViewChecked() {
    this.tryInitCanvas();
  }

  private tryInitCanvas() {
    if (this.hasDrawing && this.canvasRef && !this.canvasInitialized) {
      this.initCanvas();
      this.canvasInitialized = true;
    } else if (!this.hasDrawing) {
      this.canvasInitialized = false;
    }
  }

  toggleDrawing() {
    this.hasDrawing = !this.hasDrawing;
    this.canvasInitialized = false;
    if (!this.hasDrawing) {
      this.newSpell.drawing = undefined;
    }
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

    this.clearCanvas();
    this.saveToHistory(); // Save initial state
  }

  updateStrokeColor(color: string) {
    this.strokeColor = color;
    this.newSpell.strokeColor = color;
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
    }
  }

  get availableItems(): string[] {
    const allItems = [...(this.sheet.inventory || []), ...(this.sheet.equipment || [])];
    return allItems.map((item) => item.name);
  }


  startDrawing(event: MouseEvent) {
    if (!this.canvasRef) return;

    this.isDrawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - rect.left;
    this.lastY = event.clientY - rect.top;
    this.saveToHistory(); // Save state before drawing
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing || !this.ctx || !this.canvasRef) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    // Check if we need to expand the canvas
    const offset = this.checkAndExpandCanvas(x, y);
    x += offset.x;
    y += offset.y;
    this.lastX += offset.x;
    this.lastY += offset.y;

    if (this.isErasing()) {
      // Eraser mode - draw with black to match background
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = 20;
      this.ctx.shadowBlur = 0;
    } else {
      // Drawing mode
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

  private checkAndExpandCanvas(x: number, y: number): { x: number; y: number } {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return { x: 0, y: 0 };

    let needsExpansion = false;
    let newWidth = this.canvasWidth();
    let newHeight = this.canvasHeight();
    let offsetX = 0;
    let offsetY = 0;

    // Check if approaching left edge
    if (x < this.expandThreshold) {
      newWidth += this.expandAmount;
      offsetX = this.expandAmount;
      this.canvasOffsetX += this.expandAmount;
      needsExpansion = true;
    }

    // Check if approaching top edge
    if (y < this.expandThreshold) {
      newHeight += this.expandAmount;
      offsetY = this.expandAmount;
      this.canvasOffsetY += this.expandAmount;
      needsExpansion = true;
    }

    // Check if approaching right edge
    if (x > newWidth - this.expandThreshold) {
      newWidth += this.expandAmount;
      needsExpansion = true;
    }

    // Check if approaching bottom edge
    if (y > newHeight - this.expandThreshold) {
      newHeight += this.expandAmount;
      needsExpansion = true;
    }

    if (needsExpansion) {
      // Create temporary canvas to hold current content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Copy current canvas to temp
        tempCtx.drawImage(canvas, 0, 0);
        
        // Update main canvas size
        this.canvasWidth.set(newWidth);
        this.canvasHeight.set(newHeight);
        
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          if (this.ctx && canvas) {
            // Fill with black background
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw temp canvas content at offset position
            this.ctx.drawImage(tempCanvas, offsetX, offsetY);
            
            // Restore context settings
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.shadowColor = this.strokeColor;
            this.ctx.shadowBlur = 20;
            this.ctx.globalCompositeOperation = this.isErasing() ? 'destination-out' : 'source-over';
          }
        });
      }
    }

    return { x: offsetX, y: offsetY };
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    if (!this.canvasRef || !this.ctx) return;

    // Reset canvas to initial size
    this.canvasWidth.set(600);
    this.canvasHeight.set(300);
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;
    this.undoHistory = [];

    // Wait for size update, then clear
    setTimeout(() => {
      if (!this.ctx || !this.canvasRef) return;
      const canvas = this.canvasRef.nativeElement;
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Restore stroke settings
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.saveToHistory();
    }, 0);
  }

  toggleTag(tag: string) {
    const index = this.newSpell.tags.indexOf(tag);
    if (index > -1) {
      this.newSpell.tags = this.newSpell.tags.filter((t) => t !== tag);
    } else {
      this.newSpell.tags = [...this.newSpell.tags, tag];
    }
  }

  hasTag(tag: string): boolean {
    return this.newSpell.tags.includes(tag);
  }

  async createSpell() {
    if (!this.newSpell.name.trim()) {
      alert('Spell name is required');
      return;
    }

    if (this.newSpell.binding.type === 'item' && !this.newSpell.binding.itemName) {
      alert('Please select an item for item-bound spell');
      return;
    }

    // Convert canvas to base64 image if drawing is enabled
    if (this.hasDrawing && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      const dataUrl = canvas.toDataURL('image/png');
      // Upload image and get ID
      this.newSpell.drawing = await this.imageService.uploadImage(dataUrl);
    }

    this.create.emit({ ...this.newSpell });

    // Reset form
    this.newSpell = {
      name: '',
      description: '',
      drawing: undefined,
      tags: [],
      binding: { type: 'learned' },
    };
    this.hasDrawing = false;
    if (this.canvasRef) {
      this.clearCanvas();
    }
  }

  cancelCreate() {
    this.cancel.emit();
  }

  handleTouch(event: TouchEvent) {
    event.preventDefault(); // Prevent scrolling
    if (!this.canvasRef) return;

    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.isDrawing = true; // or this.isDrawingMode = true for spell.component
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
  }

  handleTouchMove(event: TouchEvent) {
    event.preventDefault(); // Prevent scrolling
    if (!this.isDrawing || !this.ctx || !this.canvasRef) return; // Use isDrawingMode for spell.component

    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;

    // Check if we need to expand the canvas
    const offset = this.checkAndExpandCanvas(x, y);
    x += offset.x;
    y += offset.y;
    this.lastX += offset.x;
    this.lastY += offset.y;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  toggleEraser() {
    this.isErasing.set(!this.isErasing());
  }

  private saveToHistory() {
    if (!this.canvasRef || !this.ctx) return;
    
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    this.undoHistory.push(imageData);
    
    // Limit history size
    if (this.undoHistory.length > this.maxUndoSteps) {
      this.undoHistory.shift();
    }
  }

  undo() {
    if (!this.canvasRef || !this.ctx || this.undoHistory.length < 2) return;
    
    // Remove current state
    this.undoHistory.pop();
    
    // Get previous state
    const previousState = this.undoHistory[this.undoHistory.length - 1];
    
    if (previousState) {
      const canvas = this.canvasRef.nativeElement;
      // Clear and restore
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.ctx.putImageData(previousState, 0, 0);
      
      // Restore context settings
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }
}
