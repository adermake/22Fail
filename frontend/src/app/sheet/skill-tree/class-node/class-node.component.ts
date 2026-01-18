import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  @Output() select = new EventEmitter<void>();

  onClick() {
    this.select.emit();
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
}
