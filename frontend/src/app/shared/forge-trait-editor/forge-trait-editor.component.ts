import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForgeTrait, createEmptyForgeTrait } from '../../model/forging.model';

@Component({
  selector: 'app-forge-trait-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forge-trait-editor.component.html',
  styleUrl: './forge-trait-editor.component.css',
})
export class ForgeTraitEditorComponent implements OnInit {
  @Input() trait: ForgeTrait = createEmptyForgeTrait();
  @Output() save = new EventEmitter<ForgeTrait>();
  @Output() cancel = new EventEmitter<void>();

  edit: ForgeTrait = createEmptyForgeTrait();

  /** Live preview of the effect at level 1 */
  get previewEffect(): string {
    if (!this.edit.scalable) return this.edit.effect;
    return this.edit.effect.replace(/\[L\]/g, '1');
  }

  ngOnInit(): void {
    this.edit = JSON.parse(JSON.stringify(this.trait));
    if (this.edit.maxLevel == null) this.edit.maxLevel = 1;
    if (!this.edit.appliesTo) this.edit.appliesTo = 'all';
  }

  onScalableChange(): void {
    if (!this.edit.scalable) {
      this.edit.maxLevel = 1;
    }
  }

  onSave(): void {
    if (!this.edit.name?.trim()) return;
    this.save.emit(this.edit);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
