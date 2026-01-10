import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { KeywordEnhancer } from '../keyword-enhancer';

@Component({
  selector: 'app-item',
  imports: [CommonModule, FormsModule],
  templateUrl: './item.component.html',
  styleUrl: './item.component.css',
})
export class ItemComponent {
  @Input({ required: true }) item!: ItemBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) index!: number;
  @Input() isEditing = false;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  get enhancedDescription(): SafeHtml {
    const original = this.item.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  get canUseItem(): boolean {
    if (!this.item.requirements) return true;

    const reqs = this.item.requirements;
    const stats = this.sheet;

    if (reqs.strength && stats.strength.current < reqs.strength) return false;
    if (reqs.dexterity && stats.dexterity.current < reqs.dexterity) return false;
    if (reqs.speed && stats.speed.current < reqs.speed) return false;
    if (reqs.intelligence && stats.intelligence.current < reqs.intelligence) return false;
    if (reqs.constitution && stats.constitution.current < reqs.constitution) return false;
    if (reqs.chill && stats.chill.current < reqs.chill) return false;
    if (this.item.lost) return false;
    return true;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.editingChange.emit(this.isEditing);
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }

  deleteItem() {
    if (confirm(`Delete item "${this.item.name}"?`)) {
      this.delete.emit();
    }
  }
}