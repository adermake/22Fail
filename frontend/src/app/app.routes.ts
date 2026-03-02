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
        path: 'lobby/:worldName', 
        loadComponent: () => import('./lobby/lobby.component').then(m => m.LobbyComponent)
    },
    { 
        path: 'library/:libraryId', 
        loadComponent: () => import('./library/library.component').then(m => m.LibraryComponent)
    },
    { 
        path: 'assets/:libraryId', 
        loadComponent: () => import('./asset-browser/asset-browser.component').then(m => m.AssetBrowserComponent)
    },
    { 
        path: 'stress-test', 
        loadComponent: () => import('./stress-test/stress-test.component').then(m => m.StressTestComponent)
    },
];
