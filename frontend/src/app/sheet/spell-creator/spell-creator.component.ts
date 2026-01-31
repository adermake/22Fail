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
export class SpellCreatorComponent implements AfterViewInit {
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
  private ctx?: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private expandThreshold = 50; // Distance from edge to trigger expansion
  private expandAmount = 200; // Pixels to add when expanding

  constructor(private cd: ChangeDetectorRef, private imageService: ImageService) {}

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
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing || !this.ctx || !this.canvasRef) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if we need to expand the canvas
    this.checkAndExpandCanvas(x, y);

    // Draw multiple passes with different blur levels for stronger glow
    const blurLevels = [30, 20, 10, 5];
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

  private checkAndExpandCanvas(x: number, y: number) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    let needsExpansion = false;
    let newWidth = this.canvasWidth();
    let newHeight = this.canvasHeight();

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
      // Save current canvas content
      const imageData = this.ctx?.getImageData(0, 0, canvas.width, canvas.height);
      
      // Update canvas size
      this.canvasWidth.set(newWidth);
      this.canvasHeight.set(newHeight);
      
      // Wait for the DOM to update, then restore content
      setTimeout(() => {
        // Restore context settings
        if (this.ctx) {
          this.ctx.lineWidth = 2;
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
          this.ctx.strokeStyle = this.strokeColor;
          this.ctx.shadowColor = this.strokeColor;
          this.ctx.shadowBlur = 20;
          
          // Restore previous drawing
          if (imageData) {
            this.ctx.putImageData(imageData, 0, 0);
          }
        }
      }, 0);
    }
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    if (!this.canvasRef || !this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Restore stroke settings
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 20;
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
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if we need to expand the canvas
    this.checkAndExpandCanvas(x, y);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }
}
