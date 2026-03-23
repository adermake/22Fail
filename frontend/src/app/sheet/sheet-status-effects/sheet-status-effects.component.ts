import {
  Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy,
  ChangeDetectorRef, OnChanges, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ActiveStatusEffect, StatusEffect } from '../../model/status-effect.model';
import { ActionMacro } from '../../model/action-macro.model';
import { JsonPatch } from '../../model/json-patch.model';
import { LibraryStoreService } from '../../services/library-store.service';

@Component({
  selector: 'app-sheet-status-effects',
  standalone: true,
  imports: [CommonModule],
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

  // Resolved status effect definitions keyed by statusEffectId
  resolvedEffects = new Map<string, StatusEffect>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sheet']) {
      this.resolveEffects();
    }
  }

  private resolveEffects() {
    this.resolvedEffects.clear();
    const actives = this.sheet.activeStatusEffects ?? [];
    const libs = this.libraryStore.allLibraries;
    for (const active of actives) {
      if (this.resolvedEffects.has(active.statusEffectId)) continue;
      for (const lib of libs) {
        const found = lib.statusEffects?.find(se => se.id === active.statusEffectId);
        if (found) {
          this.resolvedEffects.set(active.statusEffectId, found);
          break;
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
}
