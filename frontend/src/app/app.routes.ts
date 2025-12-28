import { Routes } from '@angular/router';
import { SheetComponent } from './sheet/sheet.component';
import { SessionComponent } from './session/session.component';

export const routes: Routes = [
    { path: 'characters/:id', component: SheetComponent },
    { path: 'game/:id', component: SessionComponent }
];
