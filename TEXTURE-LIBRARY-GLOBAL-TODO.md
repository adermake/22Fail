# Global Texture Library Implementation TODO

## Current State
- Texture library is stored per-world in `LobbyData.textureLibrary`
- Each lobby/world has its own separate texture library
- This causes duplication and inconsistency across worlds

## Required Changes

### 1. Backend Changes

#### Create Global Texture Storage
```typescript
// backend/src/data.service.ts
- Add new method: getGlobalTextureLibrary()
- Add new method: saveGlobalTextureLibrary(library: LibraryTexture[])
- Store in separate file: backend/data/global-textures.json
```

#### Add HTTP Endpoints
```typescript
// backend/src/app.controller.ts
@Get('api/textures/global')
getGlobalTextureLibrary() {
  return this.dataService.getGlobalTextureLibrary();
}

@Post('api/textures/global')
saveGlobalTextureLibrary(@Body() library: LibraryTexture[]) {
  return this.dataService.saveGlobalTextureLibrary(library);
}
```

### 2. Frontend Changes

#### Update Model
```typescript
// frontend/src/app/model/lobby.model.ts
export interface LobbyData {
  // ...existing fields...
  textureLibrary: LibraryTexture[]; // REMOVE THIS - move to global
}
```

#### Create Global Texture Service
```typescript
// frontend/src/app/services/texture-library.service.ts
@Injectable({ providedIn: 'root' })
export class TextureLibraryService {
  private library$ = new BehaviorSubject<LibraryTexture[]>([]);
  
  async loadLibrary(): Promise<void> {
    const lib = await this.http.get<LibraryTexture[]>('/api/textures/global').toPromise();
    this.library$.next(lib || []);
  }
  
  async addTexture(texture: LibraryTexture): Promise<void> {
    const current = this.library$.value;
    const updated = [...current, texture];
    await this.http.post('/api/textures/global', updated).toPromise();
    this.library$.next(updated);
  }
  
  // ... other methods
}
```

#### Update Lobby Store Service
```typescript
// frontend/src/app/services/lobby-store.service.ts
- Remove textureLibrary from get imageLibrary
- Use TextureLibraryService instead
```

#### Update UI Components
```typescript
// frontend/src/app/lobby/lobby-sidebar/lobby-sidebar.component.ts
- Inject TextureLibraryService
- Use textureLibraryService.library$ instead of store.textureLibrary
```

### 3. Data Migration

When loading old lobbies, migrate texture library to global:
1. Load lobby
2. If textureLibrary exists in lobby:
   - Merge with global texture library
   - Remove duplicates
   - Save to global
   - Remove textureLibrary from lobby data

### 4. Testing Checklist
- [ ] Global texture library loads on app init
- [ ] Adding texture saves globally
- [ ] All worlds see the same texture library
- [ ] Old lobbies migrate correctly
- [ ] No texture duplication across worlds

## Implementation Priority
1. Backend storage (data.service.ts)
2. Backend endpoints (app.controller.ts)
3. Frontend service (texture-library.service.ts)
4. Update UI components to use global service
5. Data migration for existing lobbies
