import {
  Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy,
  ChangeDetectorRef, OnChanges, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ActiveStatusEffect, StatusEffect } from '../../model/status-effect.model';
import { ActionMacro } from '../../model/action-macro.model';
import { JsonPatch } from '../../model/json-patch.model';
import { LibraryStoreService } from '../../services/library-store.service';

@Component({
  selector: 'app-sheet-status-effects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sheet-status-effects.component.html',
  styleUrl: './sheet-status-effects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetStatusEffectsComponent implements OnChanges {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() triggerMacro = new EventEmitter<ActionMacro>();
  @Output() patch = new EventEmitter<JsonPatch>();

  private libraryStore = inject(LibraryStoreService);
  private cdr = inject(ChangeDetectorRef);

  /** All known status effect definitions from loaded libraries */
  resolvedEffects = new Map<string, StatusEffect>();

  /** Whether the add-effect picker is open */
  showPicker = false;

  /** Search string for the picker */
  pickerSearch = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sheet']) {
      this.resolveEffects();
    }
  }

  private resolveEffects() {
    this.resolvedEffects.clear();
    const libs = this.libraryStore.allLibraries;
    for (const lib of libs) {
      for (const se of lib.statusEffects ?? []) {
        if (!this.resolvedEffects.has(se.id)) {
          this.resolvedEffects.set(se.id, se);
        }
      }
    }
    this.cdr.markForCheck();
  }

  getEffect(active: ActiveStatusEffect): StatusEffect | undefined {
    return this.resolvedEffects.get(active.statusEffectId);
  }

  getEffectName(active: ActiveStatusEffect): string {
    return active.customName ?? this.getEffect(active)?.name ?? active.statusEffectId;
  }

  getEffectIcon(active: ActiveStatusEffect): string {
    return this.getEffect(active)?.icon ?? '✦';
  }

  getEffectColor(active: ActiveStatusEffect): string {
    return this.getEffect(active)?.color ?? '#8b5cf6';
  }

  onEffectClick(active: ActiveStatusEffect) {
    const effect = this.getEffect(active);
    if (effect?.embeddedMacro) {
      this.triggerMacro.emit(effect.embeddedMacro);
    }
  }

  hasMacro(active: ActiveStatusEffect): boolean {
    return !!this.getEffect(active)?.embeddedMacro;
  }

  removeEffect(active: ActiveStatusEffect) {
    const updated = (this.sheet.activeStatusEffects ?? []).filter(
      e => !(e.statusEffectId === active.statusEffectId && e.appliedAt === active.appliedAt)
    );
    this.patch.emit({ path: '/activeStatusEffects', value: updated });
  }

  get activeEffects(): ActiveStatusEffect[] {
    return this.sheet.activeStatusEffects ?? [];
  }

  trackByEffect(_: number, active: ActiveStatusEffect): string {
    return `${active.statusEffectId}-${active.appliedAt}`;
  }

  trackById(_: number, effect: StatusEffect): string {
    return effect.id;
  }

  // ---- Picker ----

  togglePicker() {
    this.showPicker = !this.showPicker;
    this.pickerSearch = '';
    this.cdr.markForCheck();
  }

  closePicker() {
    this.showPicker = false;
    this.cdr.markForCheck();
  }

  /** Effects the character is allowed to see:
   *  - public effects (visible to everyone), OR
   *  - effects the character has encountered before (seenStatusEffectIds) */
  get availableToAdd(): StatusEffect[] {
    const seen = new Set(this.sheet.seenStatusEffectIds ?? []);
    const alreadyActive = new Set((this.sheet.activeStatusEffects ?? []).map(e => e.statusEffectId));
    const search = this.pickerSearch.toLowerCase().trim();

    return Array.from(this.resolvedEffects.values()).filter(se => {
      const visible = se.public || seen.has(se.id);
      const notActive = !alreadyActive.has(se.id);
      const matchesSearch = !search
        || se.name.toLowerCase().includes(search)
        || (se.tags ?? []).some(t => t.toLowerCase().includes(search));
      return visible && notActive && matchesSearch;
    });
  }

  applyEffect(effect: StatusEffect) {
    const libs = this.libraryStore.allLibraries;
    const sourceLib = libs.find(lib => lib.statusEffects?.some(e => e.id === effect.id));

    const newActive: ActiveStatusEffect = {
      statusEffectId: effect.id,
      sourceLibraryId: sourceLib?.id ?? '',
      appliedAt: Date.now(),
      stacks: 1,
      duration: effect.defaultDuration,
    };

    const updatedActive = [...(this.sheet.activeStatusEffects ?? []), newActive];
    const updatedSeen = Array.from(new Set([...(this.sheet.seenStatusEffectIds ?? []), effect.id]));

    this.patch.emit({ path: '/activeStatusEffects', value: updatedActive });
    this.patch.emit({ path: '/seenStatusEffectIds', value: updatedSeen });

    this.showPicker = false;
    this.cdr.markForCheck();
  }
}
