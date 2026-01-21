import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RuneBlock, RUNE_TAG_OPTIONS } from '../../model/rune-block.model';

@Component({
  selector: 'app-rune-creator',
  imports: [CommonModule, FormsModule],
  templateUrl: './runecreator.component.html',
  styleUrl: './runecreator.component.css',
})
export class RuneCreatorComponent implements AfterViewInit {
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
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 20;
    
    // Fill with black background
    this.clearCanvas();
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
    this.isDrawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - rect.left;
    this.lastY = event.clientY - rect.top;
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Restore stroke settings
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 20;
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

  createRune() {
    if (!this.newRune.name.trim()) {
      alert('Rune name is required');
      return;
    }

    // Convert canvas to base64 image
    const canvas = this.canvasRef.nativeElement;
    this.newRune.drawing = canvas.toDataURL('image/png');

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