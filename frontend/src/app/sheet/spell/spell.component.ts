import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { KeywordEnhancer } from '../keyword-enhancer';
import { SpellBlock, SPELL_TAG_OPTIONS } from '../../model/spell-block-model';

@Component({
  selector: 'app-spell',
  imports: [CommonModule, FormsModule],
  templateUrl: './spell.component.html',
  styleUrl: './spell.component.css',
})
export class SpellComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @Input({ required: true }) spell!: SpellBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) index!: number;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  isEditing = false;
  tagOptions = SPELL_TAG_OPTIONS;
  hasDrawing = false;

  private ctx?: CanvasRenderingContext2D;
  private isDrawing= false;
  private lastX = 0;
  private lastY = 0;

  constructor(private cd: ChangeDetectorRef, private sanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    if (this.isEditing && this.hasDrawing && this.canvasRef) {
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

    // Load existing drawing if available
    if (this.spell.drawing) {
      const img = new Image();
      img.onload = () => {
        this.ctx?.drawImage(img, 0, 0);
      };
      img.src = this.spell.drawing;
    } else {
      this.clearCanvas();
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

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.editingChange.emit(this.isEditing);

    if (this.isEditing) {
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
        this.updateField('drawing', canvas.toDataURL('image/png'));
      } else if (!this.hasDrawing) {
        this.updateField('drawing', undefined);
      }
    }
  }

  toggleDrawing() {
    this.hasDrawing = !this.hasDrawing;
    if (!this.hasDrawing) {
      this.updateField('drawing', undefined);
    }
    this.cd.detectChanges(); // Force immediate update

    if (this.hasDrawing) {
      setTimeout(() => {
        this.initCanvas();
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

  hasTag(tag: string): boolean {
    return this.spell.tags?.includes(tag) || false;
  }

  deleteSpell() {
    if (confirm(`Delete spell "${this.spell.name}"?`)) {
      this.delete.emit();
    }
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

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }
}
