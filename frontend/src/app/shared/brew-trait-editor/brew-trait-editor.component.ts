import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrewTrait, createEmptyBrewTrait } from '../../model/brewing.model';

/**
 * Editor for Braumerkmale — the brewing counterpart to ForgeTraitEditor. Same shape, except
 * there is no "applies to" (potions are one kind) and the cost is flat per application.
 */
@Component({
  selector: 'app-brew-trait-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brew-trait-editor.component.html',
  styleUrl: './brew-trait-editor.component.css',
})
export class BrewTraitEditorComponent implements OnInit {
  @Input() trait: BrewTrait = createEmptyBrewTrait();
  @Output() save = new EventEmitter<BrewTrait>();
  @Output() cancel = new EventEmitter<void>();

  edit: BrewTrait = createEmptyBrewTrait();

  /** Live preview of the effect at level 1 */
  get previewEffect(): string {
    if (!this.edit.scalable) return this.edit.effect;
    return this.edit.effect.replace(/\[L\]/g, '1');
  }

  ngOnInit(): void {
    this.edit = JSON.parse(JSON.stringify(this.trait));
    if (this.edit.maxLevel == null) this.edit.maxLevel = 1;
    if (this.edit.braupunktKosten == null) this.edit.braupunktKosten = 1;
  }

  onScalableChange(): void {
    if (!this.edit.scalable) this.edit.maxLevel = 1;
  }

  onSave(): void {
    if (!this.edit.name?.trim()) return;
    this.save.emit(this.edit);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
