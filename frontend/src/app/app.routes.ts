import { Routes } from '@angular/router';
import { SheetComponent } from './sheet/sheet.component';

export const routes: Routes = [
    { path: 'characters/:id', component: SheetComponent }
];
