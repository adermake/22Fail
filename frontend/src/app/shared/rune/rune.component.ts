import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPatch } from '../../model/json-patch.model';
import { RuneBlock, RUNE_TAG_OPTIONS, RUNE_GLOW_COLORS } from '../../model/rune-block.model';
import { KeywordEnhancer } from '../../sheet/keyword-enhancer';

@Component({
  selector: 'app-rune',
  imports: [CommonModule, FormsModule],
  templateUrl: './rune.component.html',
  styleUrl: './rune.component.css',
})
export class RuneComponent implements AfterViewInit {
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
  private canvasInitialized = false;

  private ctx?: CanvasRenderingContext2D;
  private isDrawingOnCanvas = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

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

  toggleEdit() {
    const newEditingState = !this.isEditing;
    this.editingChange.emit(newEditingState);

    if (newEditingState) {
      this.hasDrawing = !!this.rune.drawing;
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
        this.updateField('drawing', canvas.toDataURL('image/png'));
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
    }
  }

  get strokeColor(): string {
    return this.rune.strokeColor || '#8b5cf6';
  }

  initCanvas() {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 200;

    // Load existing drawing if available
    if (this.rune.drawing) {
      const img = new Image();
      img.onload = () => {
        this.ctx?.drawImage(img, 0, 0);
      };
      img.src = this.rune.drawing;
    } else {
      this.clearCanvas();
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

    this.isDrawingOnCanvas = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - rect.left;
    this.lastY = event.clientY - rect.top;
  }

  draw(event: MouseEvent) {
    if (!this.isDrawingOnCanvas || !this.ctx || !this.canvasRef) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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

  stopDrawing() {
    this.isDrawingOnCanvas = false;
  }

  clearCanvas() {
    if (!this.canvasRef || !this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Restore stroke settings after clearing
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 20;
  }

  handleTouch(event: TouchEvent) {
    event.preventDefault();
    if (!this.canvasRef) return;

    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.isDrawingOnCanvas = true;
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
  }

  handleTouchMove(event: TouchEvent) {
    if (!this.isDrawingOnCanvas || !this.ctx || !this.canvasRef) return;

    event.preventDefault();
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