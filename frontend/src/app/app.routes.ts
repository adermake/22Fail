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
        // The world map *is* the map editor (format v2): edit mode for the GM, game mode for
        // the table. The v1 viewer (Wonderdraft tiles in OpenSeadragon) was retired once v2
        // reached parity; every link in the app already pointed at this URL.
        path: 'world-map/:worldName',
        loadComponent: () => import('./map-editor/map-editor.component').then(m => m.MapEditorComponent)
    },
    {
        // Old bookmarks from the v2 development period.
        path: 'map-editor/:worldName',
        redirectTo: 'world-map/:worldName',
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
