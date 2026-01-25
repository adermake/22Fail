import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: 'stress-test', 
        pathMatch: 'full' 
    },
    { 
        path: 'characters/:id', 
        loadComponent: () => import('./sheet/sheet.component').then(m => m.SheetComponent)
    },
    { 
        path: 'game/:id', 
        loadComponent: () => import('./session/session.component').then(m => m.SessionComponent)
    },
    { 
        path: 'world/:worldName', 
        loadComponent: () => import('./world/world/world.component').then(m => m.WorldComponent)
    },
    { 
        path: 'battlemap/:worldName/:mapId', 
        loadComponent: () => import('./battlemap/battlemap.component').then(m => m.BattlemapComponent)
    },
    { 
        path: 'stress-test', 
        loadComponent: () => import('./stress-test/stress-test.component').then(m => m.StressTestComponent)
    },
];
