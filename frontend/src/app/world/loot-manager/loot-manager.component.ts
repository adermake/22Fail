import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorldStoreService } from '../../services/world-store.service';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';

export interface LootBundle {
  name: string;
  description: string;
  items: ItemBlock[];
  runes: RuneBlock[];
  spells: SpellBlock[];
  skills: SkillBlock[];
  currency: { copper: number; silver: number; gold: number; platinum: number };
}

@Component({
  selector: 'app-loot-manager',
  imports: [CommonModule, FormsModule],
  templateUrl: './loot-manager.component.html',
  styleUrl: './loot-manager.component.css'
})
export class LootManagerComponent {
  store = inject(WorldStoreService);

  @Input() bundles: LootBundle[] = [];
  @Input() partyMembers: { id: string; name: string }[] = [];
  @Output() bundleCreated = new EventEmitter<LootBundle>();
  @Output() bundleDeleted = new EventEmitter<number>();

  newCurrency = { copper: 0, silver: 0, gold: 0, platinum: 0 };

  addCurrency() {
    const world = this.store.worldValue;
    if (!world) return;

    if (this.newCurrency.copper || this.newCurrency.silver || this.newCurrency.gold || this.newCurrency.platinum) {
      const currencyLoot = {
        id: `currency_${Date.now()}_${Math.random()}`,
        type: 'currency',
        data: { ...this.newCurrency },
        claimedBy: [],
        recipientIds: world.partyIds
      };

      this.store.applyPatch({
        path: 'battleLoot',
        value: [...world.battleLoot, currencyLoot]
      });

      this.newCurrency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    }
  }

  removeLoot(index: number) {
    const world = this.store.worldValue;
    if (!world) return;
    const newLoot = [...world.battleLoot];
    newLoot.splice(index, 1);
    this.store.applyPatch({ path: 'battleLoot', value: newLoot });
  }

  clearLoot() {
    this.store.applyPatch({ path: 'battleLoot', value: [] });
  }

  revealLoot() {
    this.store.revealBattleLoot();
  }

  isRecipient(loot: any, characterId: string): boolean {
    if (!loot.recipientIds || loot.recipientIds.length === 0) return true;
    return loot.recipientIds.includes(characterId);
  }

  toggleRecipient(lootIndex: number, characterId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const loot = world.battleLoot[lootIndex];
    let recipientIds = loot.recipientIds || [];

    if (recipientIds.length === 0) recipientIds = [...world.partyIds];

    if (recipientIds.includes(characterId)) {
      recipientIds = recipientIds.filter((id: string) => id !== characterId);
    } else {
      recipientIds = [...recipientIds, characterId];
    }

    this.store.applyPatch({
      path: `battleLoot.${lootIndex}.recipientIds`,
      value: recipientIds
    });
  }

  createBundleFromLoot() {
    const world = this.store.worldValue;
    if (!world || world.battleLoot.length === 0) return;

    const name = prompt('Enter bundle name:');
    if (!name) return;

    if (this.bundles.some(b => b.name === name)) {
      if (!confirm(`A bundle named "${name}" already exists. Overwrite it?`)) {
        return;
      }
    }

    const bundle: LootBundle = {
      name,
      description: 'Created from battle loot',
      items: [],
      runes: [],
      spells: [],
      skills: [],
      currency: { copper: 0, silver: 0, gold: 0, platinum: 0 }
    };

    world.battleLoot.forEach((loot: any) => {
      if (loot.type === 'item') bundle.items.push(loot.data);
      else if (loot.type === 'rune') bundle.runes.push(loot.data);
      else if (loot.type === 'spell') bundle.spells.push(loot.data);
      else if (loot.type === 'skill') bundle.skills.push(loot.data);
      else if (loot.type === 'currency') {
        bundle.currency.copper += loot.data.copper || 0;
        bundle.currency.silver += loot.data.silver || 0;
        bundle.currency.gold += loot.data.gold || 0;
        bundle.currency.platinum += loot.data.platinum || 0;
      }
    });

    this.bundleCreated.emit(bundle);
  }

  deleteBundle(index: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this bundle?')) {
      this.bundleDeleted.emit(index);
    }
  }

  onDragStartBundle(event: DragEvent, index: number) {
    event.dataTransfer!.effectAllowed = 'copy';
    event.dataTransfer!.setData('lootType', 'bundle');
    event.dataTransfer!.setData('lootIndex', index.toString());
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer!.getData('lootType');
    const index = parseInt(event.dataTransfer!.getData('lootIndex'));
    const world = this.store.worldValue;
    if (!world) return;

    if (type === 'bundle') {
      const bundle = this.bundles[index];
      if (!bundle) return;

      const newItems: any[] = [];
      const create = (t: string, d: any) => ({
        id: `${t}_${Date.now()}_${Math.random()}`,
        type: t,
        data: d,
        claimedBy: [],
        recipientIds: world.partyIds
      });

      bundle.items.forEach(i => newItems.push(create('item', i)));
      bundle.runes.forEach(r => newItems.push(create('rune', r)));
      bundle.spells.forEach(s => newItems.push(create('spell', s)));
      bundle.skills.forEach(s => newItems.push(create('skill', s)));

      if (bundle.currency.copper || bundle.currency.silver || bundle.currency.gold || bundle.currency.platinum) {
        newItems.push({
          id: `curr_${Date.now()}`,
          type: 'currency',
          data: { ...bundle.currency },
          claimedBy: [],
          recipientIds: world.partyIds
        });
      }

      this.store.applyPatch({ path: 'battleLoot', value: [...world.battleLoot, ...newItems] });
    } else {
      // Handle dropping items from library
      let lootData: any;
      switch (type) {
        case 'item':
          lootData = world.itemLibrary[index];
          break;
        case 'rune':
          lootData = world.runeLibrary[index];
          break;
        case 'spell':
          lootData = world.spellLibrary[index];
          break;
        case 'skill':
          lootData = world.skillLibrary[index];
          break;
      }

      if (lootData) {
        const newLootItem = {
          id: `${type}_${Date.now()}_${Math.random()}`,
          type,
          data: lootData,
          claimedBy: [],
          recipientIds: world.partyIds
        };
        this.store.applyPatch({
          path: 'battleLoot',
          value: [...world.battleLoot, newLootItem]
        });
      }
    }
  }
}
