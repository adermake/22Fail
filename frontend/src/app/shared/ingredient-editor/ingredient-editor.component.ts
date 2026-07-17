import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IngredientBlock, IngredientEffect, BrewEffectSlot, BREW_SLOT_LABELS,
  createEmptyIngredientBlock, createEmptyIngredientEffect,
} from '../../model/brewing.model';
import { StatusEffect } from '../../model/status-effect.model';
import { AssetBrowserApiService } from '../../services/asset-browser-api.service';

@Component({
  selector: 'app-ingredient-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingredient-editor.component.html',
  styleUrl: './ingredient-editor.component.css',
})
export class IngredientEditorComponent implements OnInit {
  @Input() ingredient: IngredientBlock = createEmptyIngredientBlock();
  @Output() save = new EventEmitter<IngredientBlock>();
  @Output() cancel = new EventEmitter<void>();

  private api = inject(AssetBrowserApiService);

  edit: IngredientBlock = createEmptyIngredientBlock();
  statusEffects: StatusEffect[] = [];
  slots: BrewEffectSlot[] = ['primary', 'secondary', 'tertiary'];
  slotLabels = BREW_SLOT_LABELS;

  async ngOnInit(): Promise<void> {
    this.edit = JSON.parse(JSON.stringify(this.ingredient));
    for (const slot of this.slots) {
      if (!this.edit[slot]) this.edit[slot] = createEmptyIngredientEffect();
    }
    if (!this.edit.rarity) this.edit.rarity = 'COMMON';
    await this.loadStatusEffects();
  }

  private async loadStatusEffects(): Promise<void> {
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const all: StatusEffect[] = [];
      for (const lib of libraries) {
        const files = await firstValueFrom(this.api.searchFiles(lib.id, '', ['status-effect']));
        for (const f of files) {
          const se = f.data as StatusEffect;
          if (se?.id) all.push({ ...se, /* keep library via tags? */ });
        }
      }
      this.statusEffects = all.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error('IngredientEditor: status effects load failed', e);
    }
  }

  effect(slot: BrewEffectSlot): IngredientEffect {
    return this.edit[slot];
  }

  onStatusPick(slot: BrewEffectSlot, statusEffectId: string): void {
    const se = this.statusEffects.find(s => s.id === statusEffectId);
    const eff = this.edit[slot];
    eff.statusEffectId = statusEffectId;
    eff.statusEffectName = se?.name ?? '';
  }

  onSave(): void {
    if (!this.edit.name?.trim()) return;
    this.save.emit(this.edit);
  }
}
