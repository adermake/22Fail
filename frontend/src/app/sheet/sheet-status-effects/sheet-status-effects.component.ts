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
import { StatusEffectEditorComponent } from '../../shared/status-effect-editor/status-effect-editor.component';

@Component({
  selector: 'app-sheet-status-effects',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusEffectEditorComponent],
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
  private popupTimeout?: any;

  resolvedEffects = new Map<string, StatusEffect>();

  showPicker = false;
  pickerSearch = '';

  expandedEffect: ActiveStatusEffect | null = null;

  contextMenuEffect: ActiveStatusEffect | null = null;
  contextMenuX = 0;
  contextMenuY = 0;

  executionPopupResult: UnifiedMacroResult | null = null;
  executionPopupStackInfo: string | null = null;

  executeAllInProgress = false;

  expiringEffects = new Set<string>();
  triggeringEffects = new Set<string>();

  editingEffect: ActiveStatusEffect | null = null;
  editedStatusEffect: StatusEffect | null = null;

  // Hover tooltip state
  hoverEffect: ActiveStatusEffect | null = null;
  hoverX = 0;
  hoverY = 0;
  lastRollResults = new Map<string, UnifiedMacroResult>();

  private static statLabels: Record<string, string> = {
    strength: 'ST\u00c4',
    dexterity: 'GES',
    speed: 'SPD',
    intelligence: 'INT',
    constitution: 'KON',
    chill: 'WIL'
  };

  ngOnInit() {
    this.libSub = this.libraryStore.allLibraries$.subscribe(() => {
      this.resolveEffects();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sheet']) {
      this.resolveEffects();
    }
  }

  ngOnDestroy() {
    this.libSub?.unsubscribe();
    if (this.popupTimeout) clearTimeout(this.popupTimeout);
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
    if (active.customEffect) return active.customEffect;
    return this.resolvedEffects.get(active.statusEffectId);
  }

  getEffectName(active: ActiveStatusEffect): string {
    return active.customName ?? this.getEffect(active)?.name ?? active.statusEffectId;
  }

  getEffectIcon(active: ActiveStatusEffect): string {
    return this.getEffect(active)?.icon ?? '\u2726';
  }

  getEffectColor(active: ActiveStatusEffect): string {
    return this.getEffect(active)?.color ?? '#8b5cf6';
  }

  getStatLabel(stat: string): string {
    return SheetStatusEffectsComponent.statLabels[stat] ?? stat;
  }

  getLastResult(active: ActiveStatusEffect): UnifiedMacroResult | undefined {
    return this.lastRollResults.get(this.trackByEffect(0, active));
  }

  onEffectClick(active: ActiveStatusEffect, event: MouseEvent) {
    event.stopPropagation();
    if (this.expandedEffect === active) {
      this.expandedEffect = null;
    } else {
      this.expandedEffect = active;
      this.contextMenuEffect = null;
      this.hoverEffect = null;
    }
    this.cdr.markForCheck();
  }

  hasMacro(active: ActiveStatusEffect): boolean {
    const effect = this.getEffect(active);
    if (!effect) return false;
    return !!(effect.embeddedMacro || effect.embeddedMacros?.length || effect.macroActionId);
  }

  private getAllMacros(effect: StatusEffect): ActionMacro[] {
    const macros: ActionMacro[] = [];
    if (effect.embeddedMacros?.length) {
      macros.push(...effect.embeddedMacros);
    } else if (effect.embeddedMacro) {
      macros.push(effect.embeddedMacro);
    }
    if (effect.macroActionId) {
      const found = this.findMacroAction(effect.macroActionId);
      if (found) {
        const asMacro: ActionMacro = {
          id: found.id,
          name: found.name || 'Macro',
          icon: (found as any).icon || '\u2726',
          color: (found as any).color || '#f59e0b',
          conditions: (found as any).conditions ?? [],
          consequences: (found as any).consequences ?? [],
          referencedSkillNames: (found as any).referencedSkillNames ?? [],
          isValid: (found as any).isValid ?? true,
          order: (found as any).order ?? 0,
          createdAt: new Date(),
          modifiedAt: new Date()
        };
        macros.push(asMacro);
      }
    }
    return macros;
  }

  removeEffect(active: ActiveStatusEffect) {
    const updated = (this.sheet.activeStatusEffects ?? []).filter(
      e => !(e.statusEffectId === active.statusEffectId && e.appliedAt === active.appliedAt)
    );
    this.patch.emit({ path: '/activeStatusEffects', value: updated });
    this.closeExpandedView();
  }

  closeExpandedView() {
    this.expandedEffect = null;
    this.cdr.markForCheck();
  }

  // ---- Hover tooltip ----

  onCardHover(active: ActiveStatusEffect, event: MouseEvent) {
    const key = this.trackByEffect(0, active);
    if (this.lastRollResults.has(key)) {
      this.hoverEffect = active;
      this.hoverX = event.clientX + 12;
      this.hoverY = event.clientY + 12;
      this.cdr.markForCheck();
    }
  }

  onCardLeave() {
    this.hoverEffect = null;
    this.cdr.markForCheck();
  }

  // ---- Macro Execution ----

  async executeEffectMacro(active: ActiveStatusEffect, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const effect = this.getEffect(active);
    if (!effect) return;

    const macros = this.getAllMacros(effect);
    if (macros.length === 0) return;

    const stacks = active.stacks || 1;
    const allResults: UnifiedMacroResult[] = [];
    const key = this.trackByEffect(0, active);

    // Trigger animation
    this.triggeringEffects.add(key);
    this.cdr.markForCheck();

    // Execute all macros for each stack
    for (let s = 0; s < stacks; s++) {
      for (const macro of macros) {
        const result = this.macroExecutor.executeActionMacro(macro, this.sheet);
        allResults.push(result);
        this.applyResourceChanges(result);
      }
    }

    // Merge results for display
    const merged = this.mergeResults(allResults, stacks);
    this.lastRollResults.set(key, merged);
    this.showExecutionPopup(merged, stacks > 1 ? stacks + '\u00d7 Stapel' : null);

    // Tick down duration on single execute
    if (active.duration !== undefined && active.duration !== null && active.duration > 0) {
      active.duration -= 1;
      const updatedEffects = [...(this.sheet.activeStatusEffects ?? [])];
      if (active.duration === 0) {
        // Remove expired
        const filtered = updatedEffects.filter(
          e => !(e.statusEffectId === active.statusEffectId && e.appliedAt === active.appliedAt)
        );
        this.patch.emit({ path: '/activeStatusEffects', value: filtered });
        this.expiringEffects.add(key);
        setTimeout(() => {
          this.expiringEffects.delete(key);
          this.cdr.markForCheck();
        }, 600);
      } else {
        this.patch.emit({ path: '/activeStatusEffects', value: updatedEffects });
      }
    }

    // Remove trigger animation after delay
    setTimeout(() => {
      this.triggeringEffects.delete(key);
      this.cdr.markForCheck();
    }, 800);
  }

  private mergeResults(results: UnifiedMacroResult[], stacks: number): UnifiedMacroResult {
    if (results.length === 1) return results[0];
    // Merge all rolls and resource changes
    return {
      success: results.every(r => r.success),
      actionName: results[0].actionName,
      actionIcon: results[0].actionIcon,
      actionColor: results[0].actionColor,
      conditionFailures: results.flatMap(r => r.conditionFailures),
      rolls: results.flatMap(r => r.rolls),
      resourceChanges: results.flatMap(r => r.resourceChanges),
      timestamp: new Date()
    };
  }

  private findMacroAction(macroActionId: string) {
    for (const lib of this.libraryStore.allLibraries) {
      const macro = lib.macroActions?.find((m: any) => m.id === macroActionId);
      if (macro) return macro;
    }
    return null;
  }

  private showExecutionPopup(result: UnifiedMacroResult, stackInfo: string | null) {
    if (this.popupTimeout) clearTimeout(this.popupTimeout);
    this.executionPopupResult = result;
    this.executionPopupStackInfo = stackInfo;
    this.cdr.markForCheck();

    this.popupTimeout = setTimeout(() => {
      this.executionPopupResult = null;
      this.executionPopupStackInfo = null;
      this.cdr.markForCheck();
    }, 8000);
  }

  dismissExecutionPopup() {
    if (this.popupTimeout) clearTimeout(this.popupTimeout);
    this.executionPopupResult = null;
    this.executionPopupStackInfo = null;
    this.cdr.markForCheck();
  }

  private applyResourceChanges(result: UnifiedMacroResult) {
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
          const statusIndex = this.sheet.statuses?.indexOf(status);
          if (statusIndex !== undefined && statusIndex !== -1) {
            this.patch.emit({ path: '/statuses/' + statusIndex + '/statusCurrent', value: newValue });
          }
        }
      }
    }
  }

  private getStatusMax(status: any): number {
    return (status.statusBase || 0) + (status.statusBonus || 0) + (status.statusEffectBonus || 0);
  }

  // ---- Context Menu ----

  onRightClick(active: ActiveStatusEffect, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuEffect = active;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.expandedEffect = null;
    this.cdr.markForCheck();
  }

  closeContextMenu() {
    this.contextMenuEffect = null;
    this.cdr.markForCheck();
  }

  contextDelete(event: MouseEvent) {
    event.stopPropagation();
    if (this.contextMenuEffect) this.removeEffect(this.contextMenuEffect);
    this.closeContextMenu();
  }

  contextEdit(event: MouseEvent) {
    event.stopPropagation();
    if (this.contextMenuEffect) this.editEffect(this.contextMenuEffect);
    this.closeContextMenu();
  }

  editEffect(active: ActiveStatusEffect) {
    const effect = this.getEffect(active);
    if (!effect) return;
    this.editedStatusEffect = JSON.parse(JSON.stringify(effect));
    this.editingEffect = active;
    this.expandedEffect = null;
    this.cdr.markForCheck();
  }

  saveEditedEffect(updatedEffect: StatusEffect) {
    if (!this.editingEffect) return;
    const effectsArray = this.sheet.activeStatusEffects || [];
    const index = effectsArray.indexOf(this.editingEffect);
    if (index !== -1) {
      const updated = { ...this.editingEffect, customEffect: updatedEffect };
      effectsArray[index] = updated;
      this.patch.emit({ path: '/activeStatusEffects', value: effectsArray });
    }
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
    if (this.executeAllInProgress || this.activeEffects.length === 0) return;

    this.executeAllInProgress = true;
    this.cdr.markForCheck();

    const effects = [...this.activeEffects];

    for (let i = 0; i < effects.length; i++) {
      const active = effects[i];
      const key = this.trackByEffect(i, active);

      // Trigger animation
      this.triggeringEffects.add(key);
      this.cdr.markForCheck();

      // Tick down duration
      if (active.duration !== undefined && active.duration !== null && active.duration > 0) {
        active.duration -= 1;
      }

      // Execute macros for each stack
      const effect = this.getEffect(active);
      if (effect) {
        const macros = this.getAllMacros(effect);
        const stacks = active.stacks || 1;
        const allResults: UnifiedMacroResult[] = [];

        for (let s = 0; s < stacks; s++) {
          for (const macro of macros) {
            const result = this.macroExecutor.executeActionMacro(macro, this.sheet);
            allResults.push(result);
            this.applyResourceChanges(result);
          }
        }

        if (allResults.length > 0) {
          const merged = this.mergeResults(allResults, stacks);
          this.lastRollResults.set(key, merged);
          this.showExecutionPopup(merged, stacks > 1 ? stacks + '\u00d7 Stapel' : null);
        }
      }

      // Wait for readability
      if (i < effects.length - 1) {
        await this.delay(2000);
      }

      this.triggeringEffects.delete(key);
      this.cdr.markForCheck();
    }

    // Mark expired effects
    const expiring = effects.filter(e => e.duration === 0);
    for (const expired of expiring) {
      this.expiringEffects.add(this.trackByEffect(0, expired));
    }
    this.cdr.markForCheck();

    await this.delay(600);

    const updated = effects.filter(e => e.duration !== 0);
    this.patch.emit({ path: '/activeStatusEffects', value: updated });

    this.expiringEffects.clear();
    this.executeAllInProgress = false;
    this.cdr.markForCheck();
  }

  isExpiring(active: ActiveStatusEffect): boolean {
    return this.expiringEffects.has(this.trackByEffect(0, active));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get activeEffects(): ActiveStatusEffect[] {
    return this.sheet.activeStatusEffects ?? [];
  }

  trackByEffect(_: number, active: ActiveStatusEffect): string {
    return active.statusEffectId + '-' + active.appliedAt;
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

    const existingIndex = (this.sheet.activeStatusEffects ?? []).findIndex(
      e => e.statusEffectId === effect.id
    );

    let updatedActive: ActiveStatusEffect[];

    if (existingIndex !== -1 && (effect.maxStacks || 1) > 1) {
      updatedActive = [...(this.sheet.activeStatusEffects ?? [])];
      const existing = updatedActive[existingIndex];
      const currentStacks = existing.stacks || 1;
      if (currentStacks < (effect.maxStacks || 1)) {
        updatedActive[existingIndex] = { ...existing, stacks: currentStacks + 1 };
      } else {
        this.showPicker = false;
        this.cdr.markForCheck();
        return;
      }
    } else if (existingIndex === -1) {
      const newActive: ActiveStatusEffect = {
        statusEffectId: effect.id,
        sourceLibraryId: sourceLib?.id ?? '',
        appliedAt: Date.now(),
        stacks: 1,
        duration: effect.defaultDuration,
      };
      updatedActive = [...(this.sheet.activeStatusEffects ?? []), newActive];
    } else {
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
