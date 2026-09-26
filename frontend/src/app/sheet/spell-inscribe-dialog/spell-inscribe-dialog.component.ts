import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { spellVoraussetzung } from '../../utils/spell-costs.util';
import {
  InscribableItem, buildInscription, inscribableItems, inscriptionSlots, usedInscriptionSlots,
} from '../../utils/spell-medium.util';

/**
 * Einschreiben — copy a spell the character knows onto a piece of material they carry.
 *
 * Driven from the Zauberbuch rather than from the item side on purpose: the player's thought is
 * "I know this spell, where do I put it", the knowledge state is only visible here, and the spell
 * to copy is already selected. The item side stays passive.
 */
@Component({
  selector: 'app-spell-inscribe-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spell-inscribe-dialog.component.html',
  styleUrl: './spell-inscribe-dialog.component.css',
})
export class SpellInscribeDialogComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) spell!: SpellBlock;
  @Output() inscribe = new EventEmitter<JsonPatch>();
  @Output() cancel = new EventEmitter<void>();

  search = '';
  selectedPath: string | null = null;
  durability = 0;

  private _candidates: InscribableItem[] | null = null;

  ngOnInit(): void {
    // Ten casts' worth is a round, useful starting point rather than a rule — the GM sets the real
    // number. A spell with no Voraussetzung burns nothing, so it gets a nominal 10.
    const voraussetzung = spellVoraussetzung(this.spell, this.learnedRunes);
    this.durability = Math.max(10, Math.round(voraussetzung * 10));
  }

  private get learnedRunes(): RuneBlock[] {
    return (this.sheet.runes ?? []).filter((r): r is RuneBlock => !!r);
  }

  get candidates(): InscribableItem[] {
    this._candidates ??= inscribableItems(this.sheet);
    const q = this.search.trim().toLowerCase();
    if (!q) return this._candidates;
    return this._candidates.filter(c => c.item.name.toLowerCase().includes(q));
  }

  slotLabel(entry: InscribableItem): string {
    return `${usedInscriptionSlots(entry.item)} / ${inscriptionSlots(entry.item)} belegt`;
  }

  sourceLabel(entry: InscribableItem): string {
    return entry.source === 'equipment' ? 'Ausrüstung' : 'Inventar';
  }

  select(entry: InscribableItem): void {
    if (entry.free <= 0) return;
    this.selectedPath = entry.path;
  }

  get selected(): InscribableItem | undefined {
    return this.candidates.find(c => c.path === this.selectedPath);
  }

  get canInscribe(): boolean {
    const target = this.selected;
    return !!target && target.free > 0 && this.durability > 0;
  }

  confirm(): void {
    const target = this.selected;
    if (!target || !this.canInscribe) return;
    const copy = buildInscription(this.spell, target.item.name, this.durability);
    // Trailing '-' appends; applyJsonPatchTo creates `embeddedSpells` as an array when the item has
    // none yet, because the following segment addresses an array position.
    this.inscribe.emit({ path: `${target.path}.embeddedSpells.-`, value: copy });
  }
}
