import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
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
        path: 'world-map/:worldName',
        loadComponent: () => import('./world-map/world-map.component').then(m => m.WorldMapComponent)
    },
    {
        // Map editor (format v2). Takes over 'world-map' once it reaches parity in Phase 3.
        path: 'map-editor/:worldName',
        loadComponent: () => import('./map-editor/map-editor.component').then(m => m.MapEditorComponent)
    },
    {
        path: 'library/:libraryId',
        loadComponent: () => import('./library-editor/library-editor.component').then(m => m.LibraryEditorComponent)
    },
    {
        path: 'rulebook',
        loadComponent: () => import('./rulebook/rulebook.component').then(m => m.RulebookComponent)
    },
    {
        path: 'rulebook/:page',
        loadComponent: () => import('./rulebook/rulebook.component').then(m => m.RulebookComponent)
    },
    { 
        path: 'stress-test', 
        loadComponent: () => import('./stress-test/stress-test.component').then(m => m.StressTestComponent)
    },
];
