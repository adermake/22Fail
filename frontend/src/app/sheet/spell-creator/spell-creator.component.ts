import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SPELL_TAG_OPTIONS, SpellBlock } from '../../model/spell-block-model';

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
  };

  tagOptions = SPELL_TAG_OPTIONS;
  hasDrawing = false;
  private ctx?: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (this.canvasRef) {
      this.initCanvas();
    }
  }

  initCanvas() {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#000';
    
    this.clearCanvas();
  }

  get availableItems(): string[] {
    const allItems = [
      ...(this.sheet.inventory || []),
      ...(this.sheet.equipment || [])
    ];
    return allItems.map(item => item.name);
  }

  toggleDrawing() {
    this.hasDrawing = !this.hasDrawing;
    if (!this.hasDrawing) {
      this.newSpell.drawing = undefined;
    } else {
      // Initialize canvas after it's rendered
      setTimeout(() => {
        this.initCanvas();
        this.cd.detectChanges();
      }, 0);
    }
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
    if (!this.canvasRef || !this.ctx) return;
    
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  toggleTag(tag: string) {
    const index = this.newSpell.tags.indexOf(tag);
    if (index > -1) {
      this.newSpell.tags = this.newSpell.tags.filter(t => t !== tag);
    } else {
      this.newSpell.tags = [...this.newSpell.tags, tag];
    }
  }

  hasTag(tag: string): boolean {
    return this.newSpell.tags.includes(tag);
  }

  createSpell() {
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
      this.newSpell.drawing = canvas.toDataURL('image/png');
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
}