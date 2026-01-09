import { ChangeDetectorRef, Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { StatsComponent } from './stats/stats.component';
import { CharacterComponent } from './character/character.component';
import { LevelclassComponent } from './levelclass/levelclass.component';
import { CurrentstatComponent } from './currentstat/currentstat.component';
import { CurrentstatsComponent } from './currentstats/currentstats.component';
import { PortraitComponent } from './portrait/portrait.component';
import { ActivatedRoute } from '@angular/router';
import { CharacterApiService } from '../services/character-api.service';
import { CharacterStoreService } from '../services/character-store.service';
import { CommonModule } from '@angular/common';
import { SkillsComponent } from './skills/skills.component';
import { ClassTree } from './class-tree-model';
import { InventoryComponent } from "./inventory/inventory.component";
import { EquipmentComponent } from './equipment/equipment.component';

import { SpellsComponent } from "./spells/spells.component";
import { RunesComponent } from '../shared/runes/runes.component';
import { CurrencyComponent } from "./currency/currency.component";

@Component({
  selector: 'app-sheet',
  imports: [
    CommonModule,
    StatsComponent,
    CharacterComponent,
    LevelclassComponent,
    CurrentstatComponent,
    CurrentstatsComponent,
    EquipmentComponent,
    PortraitComponent,
    SkillsComponent,
    InventoryComponent,
    SpellsComponent,
    RunesComponent,
    CurrencyComponent
],
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.css',
})
export class SheetComponent implements OnInit, AfterViewInit {
  public store = inject(CharacterStoreService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    // Subscribe to loot offers and present a simple accept/decline dialog
    this.store.lootOffer$.subscribe(async (payload: any) => {
      try {
        const items = payload.items || [];
        if (!items.length) return;
        const names = items.map((it: any) => it.item?.name || it.item).join(', ');
        const accept = confirm(`You found loot: ${names}. Take all?`);
        if (accept) {
          // claim each item by index
          const worldName = payload.worldName;
          for (const idxInfo of items) {
            // send claim via store helper
            this.store.claimLoot(worldName, idxInfo.index);
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
    this.cdr.detectChanges();
  }

  async ngOnInit() {
    const classDefinitions = await fetch('class-definitions.txt').then((r) => r.text());
    await ClassTree.initialize(classDefinitions);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.load(id);
  }
}
