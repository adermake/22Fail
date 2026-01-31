import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { KeywordEnhancer } from '../keyword-enhancer';
import { SpellBlock, SPELL_TAG_OPTIONS, SPELL_GLOW_COLORS } from '../../model/spell-block-model';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-spell',
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './spell.component.html',
  styleUrl: './spell.component.css',
})
export class SpellComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @Input({ required: true }) spell!: SpellBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) index!: number;
  @Input() isEditing = false;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  tagOptions = SPELL_TAG_OPTIONS;
  glowColors = SPELL_GLOW_COLORS;
  hasDrawing = false;
  canvasWidth = signal(600);
  canvasHeight = signal(300);
  isErasing = signal(false);
  isPanning = signal(false);

  private ctx?: CanvasRenderingContext2D;
  private isDrawing= false;
  private lastX = 0;
  private lastY = 0;
  private expandAmount = 200; // Pixels to add when expanding
  private undoHistory: ImageData[] = []; // Undo history
  private maxUndoSteps = 20;
  private panStartX = 0;
  private panStartY = 0;

  constructor(private cd: ChangeDetectorRef, private sanitizer: DomSanitizer, private imageService: ImageService) {}

  private canvasInitialized = false;

  ngOnInit() {
    // Add keyboard listener for undo
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && this.isEditing && this.hasDrawing && this.isDrawing === false) {
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

  toggleDrawing() {
    this.hasDrawing = !this.hasDrawing;
    this.canvasInitialized = false;
    if (!this.hasDrawing) {
      this.updateField('drawing', undefined);
    }
  }

  get strokeColor(): string {
    return this.spell.strokeColor || '#673ab7';
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
    if (this.spell.drawing) {
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
            this.saveToHistory(); // Save after loading
          }
        });
      };
      img.src = this.imageService.getImageUrl(this.spell.drawing) || '';
    } else {
      this.clearCanvas();
      this.saveToHistory(); // Save initial state
    }
  }

  get enhancedDescription(): SafeHtml {
    const original = this.spell.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  get isDisabled(): boolean {
    if (this.spell.binding.type === 'learned') {
      return false;
    }

    const itemName = this.spell.binding.itemName?.toLowerCase().trim();
    if (!itemName) return true;

    const allItems = [...(this.sheet.inventory || []), ...(this.sheet.equipment || [])];

    return !allItems.some((item) => item.name.toLowerCase().trim() === itemName);
  }

  get availableItems(): string[] {
    const allItems = [...(this.sheet.inventory || []), ...(this.sheet.equipment || [])];
    return allItems.map((item) => item.name);
  }

  async toggleEdit() {
    const newEditingState = !this.isEditing;
    this.editingChange.emit(newEditingState);

    if (newEditingState) {
      this.hasDrawing = !!this.spell.drawing;
      setTimeout(() => {
        if (this.hasDrawing && this.canvasRef) {
          this.initCanvas();
        }
        this.cd.detectChanges();
      }, 0);
    } else {
      // Save drawing when closing edit
      if (this.hasDrawing && this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        const dataUrl = canvas.toDataURL('image/png');
        const imageId = await this.imageService.uploadImage(dataUrl);
        this.updateField('drawing', imageId);
      } else if (!this.hasDrawing) {
        this.updateField('drawing', undefined);
      }
    }
  }


  startDrawing(event: MouseEvent) {
    if (!this.canvasRef) return;

    // Middle mouse button for panning
    if (event.button === 1) {
      event.preventDefault();
      this.isPanning.set(true);
      const container = this.canvasRef.nativeElement.parentElement;
      if (container) {
        this.panStartX = event.clientX + container.scrollLeft;
        this.panStartY = event.clientY + container.scrollTop;
      }
      return;
    }

    // Left mouse button for drawing
    if (event.button === 0) {
      this.isDrawing = true;
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      this.lastX = event.clientX - rect.left;
      this.lastY = event.clientY - rect.top;
      this.saveToHistory(); // Save state before drawing
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
    if (!this.isDrawing || !this.ctx) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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

  stopDrawing() {
    this.isDrawing = false;
    this.isPanning.set(false);
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

  private expandCanvas(direction: 'left' | 'right' | 'top' | 'bottom') {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;

    // Create temporary canvas to hold current content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;

    // Copy current canvas to temp
    tempCtx.drawImage(canvas, 0, 0);
    
    let newWidth = this.canvasWidth();
    let newHeight = this.canvasHeight();
    let offsetX = 0;
    let offsetY = 0;

    // Calculate new size and offset based on direction
    switch (direction) {
      case 'left':
        newWidth += this.expandAmount;
        offsetX = this.expandAmount;
        break;
      case 'right':
        newWidth += this.expandAmount;
        break;
      case 'top':
        newHeight += this.expandAmount;
        offsetY = this.expandAmount;
        break;
      case 'bottom':
        newHeight += this.expandAmount;
        break;
    }

    // Update canvas size
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
        
        // Save to history after expansion
        this.saveToHistory();
      }
    });
  }

  clearCanvas() {
    if (!this.canvasRef || !this.ctx) return;

    // Reset canvas to initial size
    this.canvasWidth.set(600);
    this.canvasHeight.set(300);
    this.undoHistory = [];

    // Wait for size update, then clear
    setTimeout(() => {
      if (!this.ctx || !this.canvasRef) return;
      const canvas = this.canvasRef.nativeElement;
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Restore stroke settings after clearing
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.saveToHistory();
    }, 0);
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }

  toggleTag(tag: string) {
    if (!this.spell.tags) {
      this.spell.tags = [];
    }

    const index = this.spell.tags.indexOf(tag);
    let newTags: string[];

    if (index > -1) {
      newTags = this.spell.tags.filter((t) => t !== tag);
    } else {
      newTags = [...this.spell.tags, tag];
    }

    this.updateField('tags', newTags);
  }

  updateStrokeColor(color: string) {
    this.updateField('strokeColor', color);
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
    }
  }

  hasTag(tag: string): boolean {
    return this.spell.tags?.includes(tag) || false;
  }

  deleteSpell() {
    this.delete.emit();
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
    if (!this.isDrawing || !this.ctx || !this.canvasRef) return;

    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

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
