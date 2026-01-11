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
  styles: [`
    .loot-manager-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .section-header h3 { margin: 0; color: var(--accent); font-size: 1.1rem; }
    
    .loot-list {
      flex: 1;
      overflow-y: auto;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.5rem;
      min-height: 200px;
    }
    .loot-item {
      display: flex;
      flex-direction: column;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .loot-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .loot-type {
      font-size: 0.7rem;
      text-transform: uppercase;
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      margin-right: 0.5rem;
    }
    .loot-controls { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    
    .currency-form {
      display: grid;
      grid-template-columns: repeat(4, 1fr) auto;
      gap: 0.5rem;
      align-items: end;
      background: var(--bg-secondary);
      padding: 0.5rem;
      border-radius: 6px;
    }
    .currency-input label { display: block; font-size: 0.7rem; color: var(--text-muted); }
    .currency-input input { width: 100%; padding: 4px; border: 1px solid var(--border); border-radius: 4px; }
    
    .bundle-list {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    .bundle-card {
      min-width: 120px;
      padding: 0.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: grab;
      text-align: center;
    }
    .bundle-card:active { cursor: grabbing; }
    .bundle-name { font-weight: bold; font-size: 0.9rem; display: block; margin-bottom: 4px; }
    .bundle-desc { font-size: 0.75rem; color: var(--text-muted); }

    button {
      padding: 4px 8px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: var(--accent-hover); }
    button.secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
    button.secondary:hover { border-color: var(--accent); color: var(--accent); }
    button.danger { background: #ef4444; }

    .loot-recipients {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border);
    }
    .recipients-label { font-size: 0.7rem; color: var(--text-muted); display: block; margin-bottom: 4px; }
    .recipient-checkboxes { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .recipient-checkbox { font-size: 0.8rem; display: flex; align-items: center; gap: 4px; cursor: pointer; }
  `],
  template: `
    <div class="loot-manager-container">
      <!-- Currency Reward -->
      <div class="currency-form">
        <div class="currency-input"><label>CP</label><input type="number" [(ngModel)]="newCurrency.copper"></div>
        <div class="currency-input"><label>SP</label><input type="number" [(ngModel)]="newCurrency.silver"></div>
        <div class="currency-input"><label>GP</label><input type="number" [(ngModel)]="newCurrency.gold"></div>
        <div class="currency-input"><label>PP</label><input type="number" [(ngModel)]="newCurrency.platinum"></div>
        <button (click)="addCurrency()">Add</button>
      </div>

      <!-- Bundles -->
      <div class="bundles-section">
        <div class="section-header">
          <h3>Loot Bundles</h3>
          <button class="secondary" (click)="createBundleFromLoot()">Save Current as Bundle</button>
        </div>
        <div class="bundle-list">
          <div *ngFor="let bundle of bundles; let i = index" 
               class="bundle-card"
               draggable="true"
               (dragstart)="onDragStartBundle($event, i)">
            <span class="bundle-name">{{bundle.name}}</span>
            <span class="bundle-desc">{{bundle.items.length + bundle.runes.length + bundle.spells.length}} items</span>
          </div>
        </div>
      </div>

      <!-- Battle Loot List -->
      <div class="loot-section" style="flex: 1; display: flex; flex-direction: column;">
        <div class="section-header">
          <h3>Battle Loot</h3>
          <div style="display: flex; gap: 0.5rem;">
            <button (click)="revealLoot()">Reveal All</button>
            <button class="danger" (click)="clearLoot()">Clear</button>
          </div>
        </div>
        
        <div class="loot-list" 
             (dragover)="onDragOver($event)" 
             (drop)="onDrop($event)">
          
          <div *ngIf="store.worldValue?.battleLoot?.length === 0" style="text-align: center; padding: 2rem; color: gray; font-style: italic;">
            Drag items or bundles here to add loot
          </div>

          <div *ngFor="let item of store.worldValue?.battleLoot; let i = index" class="loot-item">
            <div class="loot-item-header">
              <div>
                <span class="loot-type">{{item.type}}</span>
                <strong>{{item.data.name || 'Currency'}}</strong>
              </div>
              <button class="danger" (click)="removeLoot(i)">×</button>
            </div>
            
            <div *ngIf="item.type === 'currency'" style="font-size: 0.8rem; margin-top: 4px;">
              <span *ngIf="item.data.platinum">{{item.data.platinum}} pp </span>
              <span *ngIf="item.data.gold">{{item.data.gold}} gp </span>
              <span *ngIf="item.data.silver">{{item.data.silver}} sp </span>
              <span *ngIf="item.data.copper">{{item.data.copper}} cp</span>
            </div>

            <div class="loot-recipients">
              <span class="recipients-label">Send to:</span>
              <div class="recipient-checkboxes">
                <label *ngFor="let member of partyMembers" class="recipient-checkbox">
                  <input type="checkbox" 
                         [checked]="isRecipient(item, member.id)" 
                         (change)="toggleRecipient(i, member.id)">
                  {{ member.name }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LootManagerComponent {
  store = inject(WorldStoreService);

  @Input() bundles: LootBundle[] = [];
  @Input() partyMembers: {id: string, name: string}[] = [];
  @Output() bundleCreated = new EventEmitter<LootBundle>();

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

    const bundle: LootBundle = {
      name,
      description: 'Created from battle loot',
      items: [], runes: [], spells: [], skills: [],
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
      // Unpack bundle to battle loot logic...
      // (Same logic as previously discussed, implemented here)
      const newItems: any[] = [];
      const create = (t: string, d: any) => ({ id: `${t}_${Date.now()}_${Math.random()}`, type: t, data: d, claimedBy: [], recipientIds: world.partyIds });
      
      bundle.items.forEach(i => newItems.push(create('item', i)));
      bundle.runes.forEach(r => newItems.push(create('rune', r)));
      bundle.spells.forEach(s => newItems.push(create('spell', s)));
      bundle.skills.forEach(s => newItems.push(create('skill', s)));
      if (bundle.currency.copper || bundle.currency.silver || bundle.currency.gold || bundle.currency.platinum) {
        newItems.push({ id: `curr_${Date.now()}`, type: 'currency', data: {...bundle.currency}, claimedBy: [], recipientIds: world.partyIds });
      }
      
      this.store.applyPatch({ path: 'battleLoot', value: [...world.battleLoot, ...newItems] });
    } else {
      // Handle dropping items from library
      let lootData: any;
      switch (type) {
        case 'item': lootData = world.itemLibrary[index]; break;
        case 'rune': lootData = world.runeLibrary[index]; break;
        case 'spell': lootData = world.spellLibrary[index]; break;
        case 'skill': lootData = world.skillLibrary[index]; break;
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