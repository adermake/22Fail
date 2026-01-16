import { Routes } from '@angular/router';
import { SheetComponent } from './sheet/sheet.component';
import { SessionComponent } from './session/session.component';
import { WorldComponent } from './world/world/world.component';
import { BattleMapComponent } from './battle-map/battle-map.component';

export const routes: Routes = [
    { path: 'characters/:id', component: SheetComponent },
    { path: 'game/:id', component: SessionComponent },
    { path: 'world/:worldName', component: WorldComponent },
    { path: 'battlemap/:id', redirectTo: 'battlemap/default/:id', pathMatch: 'full' },
    { path: 'battlemap/:worldName/:id', component: BattleMapComponent }
];
