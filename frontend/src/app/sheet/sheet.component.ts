import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-sheet',
  imports: [
    CommonModule,
    StatsComponent,
    CharacterComponent,
    LevelclassComponent,
    CurrentstatComponent,
    CurrentstatsComponent,
    PortraitComponent,
    SkillsComponent,
  ],
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.css',
})
export class SheetComponent implements OnInit {
  public store = inject(CharacterStoreService);
  private route = inject(ActivatedRoute);

  async ngOnInit() {
    const classDefinitions = await fetch('class-definitions.txt').then((r) => r.text());
    await ClassTree.initialize(classDefinitions);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.load(id);
  }
}
