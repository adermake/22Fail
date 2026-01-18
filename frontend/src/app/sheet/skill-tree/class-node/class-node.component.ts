import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Tier color definitions
const TIER_COLORS: Record<number, string> = {
  1: '#22c55e',  // Green
  2: '#eab308',  // Yellow
  3: '#ef4444',  // Red
  4: '#a855f7',  // Purple
  5: '#3b82f6',  // Blue
};

@Component({
  selector: 'app-class-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './class-node.component.html',
  styleUrl: './class-node.component.css'
})
export class ClassNodeComponent {
  @Input() className: string = '';
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() tier: number = 1;
  @Input() learnedCount: number = 0;
  @Input() totalCount: number = 0;
  @Input() isSelected: boolean = false;
  @Input() isAccessible: boolean = false;
  @Input() canLearn: boolean = true;  // Can learn from this class (has 3 skills from parent)
  @Input() editMode: boolean = false;

  @Output() select = new EventEmitter<void>();
  @Output() dragStart = new EventEmitter<MouseEvent>();

  onClick() {
    if (!this.editMode) {
      this.select.emit();
    }
  }

  onMouseDown(event: MouseEvent) {
    if (this.editMode) {
      this.dragStart.emit(event);
    }
  }

  get progress(): number {
    if (this.totalCount === 0) return 0;
    return (this.learnedCount / this.totalCount) * 100;
  }

  get isComplete(): boolean {
    return this.totalCount > 0 && this.learnedCount >= this.totalCount;
  }

  get tierClass(): string {
    return `tier-${this.tier}`;
  }

  get tierColor(): string {
    return TIER_COLORS[this.tier] || TIER_COLORS[5];
  }
}
