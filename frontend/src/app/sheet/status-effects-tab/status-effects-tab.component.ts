import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ActiveStatusEffect } from '../../model/status-effect.model';
import { StatusEffect } from '../../model/status-effect.model';
import { MacroAction } from '../../model/macro-action.model';
import { MacroExecutorService } from '../../services/macro-executor.service';
import { LibraryStoreService } from '../../services/library-store.service';
import { StatusEffectTileComponent } from '../../shared/status-effect-tile/status-effect-tile.component';

@Component({
  selector: 'app-status-effects-tab',
  standalone: true,
  imports: [CommonModule, StatusEffectTileComponent],
  template: `
    <div class="status-effects-container">
      <h2>Active Status Effects</h2>
      
      @if (sheet.activeStatusEffects && sheet.activeStatusEffects.length > 0) {
        <div class="status-effects-grid">
          @for (activeEffect of sheet.activeStatusEffects; track activeEffect.statusEffectId) {
            <app-status-effect-tile
              [activeEffect]="activeEffect"
              [statusEffect]="getStatusEffect(activeEffect)"
              [character]="sheet"
              (triggerAction)="triggerMacro(activeEffect)"
            />
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">💫</div>
          <p>No active status effects</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .status-effects-container {
      padding: 1.5rem;
    }

    h2 {
      margin: 0 0 1.5rem 0;
      color: var(--text);
      font-size: 1.5rem;
    }

    .status-effects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1rem;
    }
  `]
})
export class StatusEffectsTabComponent {
  @Input({ required: true }) sheet!: CharacterSheet;

  private macroExecutor = inject(MacroExecutorService);
  private libraryStore = inject(LibraryStoreService);

  // Cache for status effects and macros
  private statusEffectsCache = new Map<string, StatusEffect>();
  private macrosCache = new Map<string, MacroAction>();

  getStatusEffect(activeEffect: ActiveStatusEffect): StatusEffect | undefined {
    // Try cache first
    if (this.statusEffectsCache.has(activeEffect.statusEffectId)) {
      return this.statusEffectsCache.get(activeEffect.statusEffectId);
    }

    // Look up in library
    // For now, return undefined - this will be filled in when libraries are loaded
    return undefined;
  }

  async triggerMacro(activeEffect: ActiveStatusEffect) {
    const statusEffect = this.getStatusEffect(activeEffect);
    if (!statusEffect?.macroActionId) {
      console.warn('No macro action for status effect:', activeEffect.statusEffectId);
      return;
    }

    // Look up macro action
    let macro = this.macrosCache.get(statusEffect.macroActionId);
    if (!macro) {
      // Try to find in loaded libraries
      const lib = this.libraryStore.currentLibrary;
      if (lib) {
        macro = lib.macroActions.find(m => m.id === statusEffect.macroActionId);
        if (macro) {
          this.macrosCache.set(macro.id, macro);
        }
      }
    }

    if (!macro) {
      console.warn('Macro action not found:', statusEffect.macroActionId);
      return;
    }

    // Execute macro
    try {
      const result = await this.macroExecutor.executeMacro(macro, this.sheet, statusEffect.name);
      console.log('[STATUS EFFECTS] Macro execution result:', result);
      
      // TODO: Display result to user (toast notification or similar)
    } catch (error) {
      console.error('[STATUS EFFECTS] Macro execution failed:', error);
    }
  }
}
