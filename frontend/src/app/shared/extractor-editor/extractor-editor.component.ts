import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExtractorBlock, createEmptyExtractorBlock } from '../../model/brewing.model';

@Component({
  selector: 'app-extractor-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './extractor-editor.component.html',
  styleUrl: './extractor-editor.component.css',
})
export class ExtractorEditorComponent implements OnInit {
  @Input() extractor: ExtractorBlock = createEmptyExtractorBlock();
  @Output() save = new EventEmitter<ExtractorBlock>();
  @Output() cancel = new EventEmitter<void>();

  edit: ExtractorBlock = createEmptyExtractorBlock();

  ngOnInit(): void {
    this.edit = JSON.parse(JSON.stringify(this.extractor));
    if (!this.edit.rarity) this.edit.rarity = 'COMMON';
  }

  onSave(): void {
    if (!this.edit.name?.trim()) return;
    this.edit.primaryReductionPercent = Math.min(100, Math.max(0, this.edit.primaryReductionPercent || 0));
    this.edit.secondaryReductionPercent = Math.min(100, Math.max(0, this.edit.secondaryReductionPercent || 0));
    this.edit.tertiaryReductionPercent = Math.min(100, Math.max(0, this.edit.tertiaryReductionPercent || 0));
    this.save.emit(this.edit);
  }
}
