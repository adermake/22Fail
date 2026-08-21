import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExtractorBlock, createEmptyExtractorBlock } from '../../model/brewing.model';
import {
  KNOWLEDGE_TIERS, KnowledgeTier, knowledgeTierOf, setKnowledgeTier,
} from '../../utils/knowledge-tier.util';

@Component({
  selector: 'app-extractor-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './extractor-editor.component.html',
  styleUrl: './extractor-editor.component.css',
})
export class ExtractorEditorComponent implements OnInit {
  // ── Wissensstufe (geheim | unbekannt | bekannt) ──────────────────────────────
  readonly knowledgeTiers = KNOWLEDGE_TIERS;

  get tier(): KnowledgeTier { return knowledgeTierOf(this.edit); }
  get tierHint(): string {
    return KNOWLEDGE_TIERS.find(t => t.value === this.tier)?.hint ?? '';
  }
  setTier(tier: KnowledgeTier): void { setKnowledgeTier(this.edit, tier); }

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
