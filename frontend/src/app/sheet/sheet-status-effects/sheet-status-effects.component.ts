import {
  Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy,
  ChangeDetectorRef, OnChanges, SimpleChanges, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ActiveStatusEffect, StatusEffect } from '../../model/status-effect.model';
import { ActionMacro } from '../../model/action-macro.model';
import { JsonPatch } from '../../model/json-patch.model';
import { FormulaType } from '../../model/formula-type.enum';
import { LibraryStoreService } from '../../services/library-store.service';
import { UnifiedMacroExecutorService, UnifiedMacroResult } from '../../services/unified-macro-executor.service';
import { ExecutionResultPopupComponent } from './execution-result-popup.component';
import { StatusEffectEditorComponent } from '../../shared/status-effect-editor/status-effect-editor.component';

@Component({
  selector: 'app-sheet-status-effects',
  standalone: true,
  imports: [CommonModule, FormsModule, ExecutionResultPopupComponent, StatusEffectEditorComponent],
  templateUrl: './sheet-status-effects.component.html',
  styleUrl: './sheet-status-effects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetStatusEffectsComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() triggerMacro = new EventEmitter<ActionMacro>();
  @Output() patch = new EventEmitter<JsonPatch>();

  private libraryStore = inject(LibraryStoreService);
  private macroExecutor = inject(UnifiedMacroExecutorService);
  private cdr = inject(ChangeDetectorRef);
  private libSub?: Subscription;

  /** All known status effect definitions from loaded libraries */
  resolvedEffects = new Map<string, StatusEffect>();

  /** Whether the add-effect picker is open */
  showPicker = false;

  /** Search string for the picker */
  pickerSearch = '';

  /** Expanded effect (shows description + execute button) */
  expandedEffect: ActiveStatusEffect | null = null;

  /** Context menu state */
  contextMenuEffect: ActiveStatusEffect | null = null;
  contextMenuX = 0;
  contextMenuY = 0;

  /** Execution result popup state */
  executionPopupResult: UnifiedMacroResult | null = null;
  executionPopupEffectId: string | null = null;

  /** Execute all in progress */
  executeAllInProgress = false;

  /** Effects currently expiring (for animation) */
  expiringEffects = new Set<string>();

  /** Effect editor state */
  editingEffect: ActiveStatusEffect | null = null;
  editedStatusEffect: StatusEffect | null = null;

  ngOnInit() {
    // Re-resolve whenever the library list changes (handles late-load case)
    this.libSub = this.libraryStore.allLibraries$.subscribe(() => {
      this.resolveEffects();
    });

    // Close context menu on global click
    document.addEventListener('click', () => this.closeContextMenu());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sheet']) {
      this.resolveEffects();
    }
  }

  ngOnDestroy() {
    this.libSub?.unsubscribe();
    document.removeEventListener('click', () => this.closeContextMenu());
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
    // Check for custom effect first (edited effects)
    if (active.customEffect) {
      return active.customEffect;
    }
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

  onEffectClick(active: ActiveStatusEffect, event: MouseEvent) {
    event.stopPropagation();
    this.toggleExpanded(active, event);
  }

  hasMacro(active: ActiveStatusEffect): boolean {
    return !!this.getEffect(active)?.embeddedMacro;
  }

  removeEffect(active: ActiveStatusEffect) {
    const updated = (this.sheet.activeStatusEffects ?? []).filter(
      e => !(e.statusEffectId === active.statusEffectId && e.appliedAt === active.appliedAt)
    );
    this.patch.emit({ path: '/activeStatusEffects', value: updated });
    this.closeExpandedView();
  }

  // ---- Expanded View ----

  toggleExpanded(active: ActiveStatusEffect, event: MouseEvent) {
    event.stopPropagation();
    if (this.expandedEffect === active) {
      this.expandedEffect = null;
    } else {
      this.expandedEffect = active;
      this.contextMenuEffect = null; // Close context menu if open
    }
    this.cdr.markForCheck();
  }

  closeExpandedView() {
    this.expandedEffect = null;
    this.cdr.markForCheck();
  }

  isExpanded(active: ActiveStatusEffect): boolean {
    return this.expandedEffect === active;
  }

  // ---- Macro Execution ----

  async executeEffectMacro(active: ActiveStatusEffect, event?: MouseEvent) {
    if (event) event.stopPropagation();

    const effect = this.getEffect(active);
    if (!effect) return;

    // Check if it has an embedded macro (ActionMacro) or macroActionId (MacroAction)
    if (effect.embeddedMacro) {
      const result = this.macroExecutor.executeActionMacro(effect.embeddedMacro, this.sheet);
      this.showExecutionPopup(active, result);
      this.applyResourceChanges(result);
    } else if (effect.macroActionId) {
      // Find MacroAction in libraries
      const macroAction = this.findMacroAction(effect.macroActionId);
      if (macroAction) {
        const result = this.macroExecutor.executeMacroAction(macroAction, this.sheet);
        this.showExecutionPopup(active, result);
        this.applyResourceChanges(result);
      }
    }
  }

  private findMacroAction(macroActionId: string) {
    for (const lib of this.libraryStore.allLibraries) {
      const macro = lib.macroActions?.find(m => m.id === macroActionId);
      if (macro) return macro;
    }
    return null;
  }

  private showExecutionPopup(active: ActiveStatusEffect, result: UnifiedMacroResult) {
    this.executionPopupResult = result;
    this.executionPopupEffectId = `${active.statusEffectId}-${active.appliedAt}`;
    this.cdr.markForCheck();

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (this.executionPopupEffectId === `${active.statusEffectId}-${active.appliedAt}`) {
        this.executionPopupResult = null;
        this.executionPopupEffectId = null;
        this.cdr.markForCheck();
      }
    }, 3000);
  }

  private applyResourceChanges(result: UnifiedMacroResult) {
    // Apply resource changes from the macro
    for (const change of result.resourceChanges) {
      const resourceMap: Record<string, FormulaType> = {
        'health': FormulaType.LIFE,
        'energy': FormulaType.ENERGY,
        'mana': FormulaType.MANA
      };

      const formulaType = resourceMap[change.resource];
      if (formulaType !== undefined) {
        const status = this.sheet.statuses?.find(s => s.formulaType === formulaType);
        if (status) {
          const currentValue = status.statusCurrent || 0;
          const newValue = Math.max(0, Math.min(
            this.getStatusMax(status),
            currentValue + change.amount
          ));

          // Find the index of this status
          const statusIndex = this.sheet.statuses?.indexOf(status);
          if (statusIndex !== undefined && statusIndex !== -1) {
            this.patch.emit({ 
              path: `/statuses/${statusIndex}/statusCurrent`, 
              value: newValue 
            });
          }
        }
      }
    }
  }

  private getStatusMax(status: any): number {
    return (status.statusBase || 0) + (status.statusBonus || 0) + (status.statusEffectBonus || 0);
  }

  isShowingPopup(active: ActiveStatusEffect): boolean {
    return this.executionPopupEffectId === `${active.statusEffectId}-${active.appliedAt}`;
  }

  // ---- Context Menu ----

  onRightClick(active: ActiveStatusEffect, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuEffect = active;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.expandedEffect = null; // Close expanded view if open
    this.cdr.markForCheck();
  }

  closeContextMenu() {
    this.contextMenuEffect = null;
    this.cdr.markForCheck();
  }

  contextDelete(event: MouseEvent) {
    event.stopPropagation();
    if (this.contextMenuEffect) {
      this.removeEffect(this.contextMenuEffect);
    }
    this.closeContextMenu();
  }

  contextEdit(event: MouseEvent) {
    event.stopPropagation();
    if (this.contextMenuEffect) {
      this.editEffect(this.contextMenuEffect);
    }
    this.closeContextMenu();
  }

  private editEffect(active: ActiveStatusEffect) {
    const effect = this.getEffect(active);
    if (!effect) {
      console.warn('Cannot edit effect: no definition found');
      return;
    }
    
    // Create a deep copy of the effect to edit
    this.editedStatusEffect = JSON.parse(JSON.stringify(effect));
    this.editingEffect = active;
    this.cdr.markForCheck();
  }

  saveEditedEffect(updatedEffect: StatusEffect) {
    if (!this.editingEffect) return;

    // Store the edited effect in customEffect (breaks library link)
    const effectsArray = this.sheet.activeStatusEffects || [];
    const index = effectsArray.indexOf(this.editingEffect);
    
    if (index !== -1) {
      const updated = { ...this.editingEffect, customEffect: updatedEffect };
      effectsArray[index] = updated;
      this.patch.emit({ path: '/activeStatusEffects', value: effectsArray });
    }

    // Close editor
    this.editingEffect = null;
    this.editedStatusEffect = null;
    this.cdr.markForCheck();
  }

  cancelEditEffect() {
    this.editingEffect = null;
    this.editedStatusEffect = null;
    this.cdr.markForCheck();
  }

  // ---- Execute All ----

  async executeAll() {
    if (this.executeAllInProgress) return;
    if (this.activeEffects.length === 0) return;

    this.executeAllInProgress = true;
    this.cdr.markForCheck();

    const effects = [...this.activeEffects];

    for (let i = 0; i < effects.length; i++) {
      const active = effects[i];
      
      // Tick down duration
      if (active.duration !== undefined && active.duration !== null && active.duration > 0) {
        active.duration -= 1;
      }

      // Execute macro if present
      const effect = this.getEffect(active);
      if (effect && (effect.embeddedMacro || effect.macroActionId)) {
        await this.executeEffectMacro(active);
      }

      // Wait 1 second before next
      if (i < effects.length - 1) {
        await this.delay(1000);
      }
    }

    // Mark expired effects for animation
    const expiring = effects.filter(e => e.duration === 0);
    for (const expired of expiring) {
      this.expiringEffects.add(`${expired.statusEffectId}-${expired.appliedAt}`);
    }
    this.cdr.markForCheck();

    // Wait for animation (500ms)
    await this.delay(500);

    // Update all durations and remove expired
    const updated = effects.filter(e => e.duration !== 0);

    this.patch.emit({ path: '/activeStatusEffects', value: updated });

    // Clear expiring set
    this.expiringEffects.clear();
    this.executeAllInProgress = false;
    this.cdr.markForCheck();
  }

  isExpiring(active: ActiveStatusEffect): boolean {
    return this.expiringEffects.has(`${active.statusEffectId}-${active.appliedAt}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    const search = this.pickerSearch.toLowerCase().trim();

    return Array.from(this.resolvedEffects.values()).filter(se => {
      const visible = se.public || seen.has(se.id);
      const matchesSearch = !search
        || se.name.toLowerCase().includes(search)
        || (se.tags ?? []).some(t => t.toLowerCase().includes(search));
      return visible && matchesSearch;
    });
  }

  applyEffect(effect: StatusEffect) {
    const libs = this.libraryStore.allLibraries;
    const sourceLib = libs.find(lib => lib.statusEffects?.some(e => e.id === effect.id));

    // Check if this effect is already active
    const existingIndex = (this.sheet.activeStatusEffects ?? []).findIndex(
      e => e.statusEffectId === effect.id
    );

    let updatedActive: ActiveStatusEffect[];

    if (existingIndex !== -1 && (effect.maxStacks || 1) > 1) {
      // Increase stack count
      updatedActive = [...(this.sheet.activeStatusEffects ?? [])];
      const existing = updatedActive[existingIndex];
      updatedActive[existingIndex] = {
        ...existing,
        stacks: (existing.stacks || 1) + 1
      };
    } else if (existingIndex === -1) {
      // Add new effect
      const newActive: ActiveStatusEffect = {
        statusEffectId: effect.id,
        sourceLibraryId: sourceLib?.id ?? '',
        appliedAt: Date.now(),
        stacks: 1,
        duration: effect.defaultDuration,
      };
      updatedActive = [...(this.sheet.activeStatusEffects ?? []), newActive];
    } else {
      // Effect exists but not stackable - don't add
      this.showPicker = false;
      this.cdr.markForCheck();
      return;
    }

    const updatedSeen = Array.from(new Set([...(this.sheet.seenStatusEffectIds ?? []), effect.id]));

    this.patch.emit({ path: '/activeStatusEffects', value: updatedActive });
    this.patch.emit({ path: '/seenStatusEffectIds', value: updatedSeen });

    this.showPicker = false;
    this.cdr.markForCheck();
  }
}
