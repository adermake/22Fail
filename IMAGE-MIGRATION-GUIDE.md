# Image Storage System Migration

## Problem
The world data is **76MB** due to base64-encoded images duplicated across characters, tokens, spells, and runes. This causes 7+ second load times.

## Solution
Centralized image storage system that:
- Stores images as files in `backend/images/` directory
- Uses SHA-256 hash for automatic deduplication
- Returns image IDs instead of base64 data
- Serves images via `/api/images/{id}` with 1-year cache headers

## Changes Made

### Backend
1. **image.service.ts** - New service for image storage/retrieval
   - `storeImage(base64Data)` - Stores image, returns ID (hash-based)
   - `getImage(imageId)` - Retrieves base64 (for legacy compatibility)
   - `getImageBuffer(imageId)` - Returns raw buffer for HTTP streaming
   - Automatic deduplication via SHA-256 hash

2. **app.controller.ts** - New endpoints
   - `POST /api/images` - Upload base64 image, get ID
   - `GET /api/images/:id` - Retrieve image (with 1-year cache)
   - `DELETE /api/images/:id` - Delete image
   - `GET /api/images` - List all images
   - `POST /api/migrate/portraits-to-images` - **Migration endpoint**
   - Updated `POST /characters/:id/portrait` - Now stores image ID
   - Updated `POST /races/:id/image` - Now stores image ID
   - Updated `POST /api/images/download` - Now returns imageId

3. **app.module.ts** - Added ImageService to providers

### Frontend
1. **image.service.ts** - New service
   - `uploadImage(base64Data)` - Upload to backend
   - `getImageUrl(imageIdOrData)` - Convert ID to URL (backward compatible with base64)

2. **image-url.pipe.ts** - New pipe for templates
   - Converts image IDs to `/api/images/{id}` URLs
   - Handles legacy base64 data URLs

3. **Updated Components** (added ImageUrlPipe):
   - ✅ portrait.component
   - ✅ world.component
   - ✅ battle-tracker.component
   - ✅ battlemap-grid.component
   - ✅ battlemap-token.component
   - ✅ battlemap-character-list.component
   - ✅ battlemap-battle-tracker.component
   - ✅ race-card.component
   - ✅ race-detail.component
   - ✅ race-form.component
   - ✅ spell.component
   - ✅ rune.component

4. **Updated Canvas Drawing** (now uploads images):
   - ✅ spell-creator.component - Uploads drawing on create
   - ✅ spell.component - Uploads drawing on save
   - ✅ runecreator.component - Uploads drawing on create
   - ✅ rune.component - Uploads drawing on save

## Migration Steps

### 1. Restart Backend
```powershell
cd c:\Users\adermake\Documents\22FailApp\backend
npm run start:dev
```

### 2. Run Migration
Open browser console and run:
```javascript
await fetch('/api/migrate/portraits-to-images', { method: 'POST' }).then(r => r.json())
```

Or add this temporary button to world.component.html:
```html
<button (click)="migrate()">Migrate Images</button>
```

And add to world.component.ts:
```typescript
async migrate() {
  const result = await this.inject(WorldApiService).migratePortraitsToImages();
  console.log('Migration complete:', result);
  alert(`Migrated ${result.migrated} images, skipped ${result.skipped}`);
}
```

### 3. Verify
- Check `backend/images/` directory - should contain .png/.jpg files
- World data should now be much smaller (<5MB instead of 76MB)
- Page loads should be significantly faster

## How It Works

### Before
```json
{
  "portrait": "data:image/png;base64,iVBORw0KG...[200KB]"
}
```
- 200KB+ per portrait
- Duplicated across multiple characters

### After
```json
{
  "portrait": "a7f3e2d1c4b5...abc123.png"
}
```
- ~50 bytes per reference
- Shared via hash - no duplicates
- Browser caches with 1-year headers

## Performance Impact

### Estimated Savings
- **Before**: 76MB world JSON
- **After**: ~2-5MB world JSON (95% reduction)
- **Load Time**: 7 seconds → ~500ms

### How Deduplication Works
If 10 characters use the same portrait:
- **Old**: 10 × 200KB = 2MB in JSON
- **New**: 10 × 50 bytes = 500 bytes in JSON + 200KB image file (loaded once, cached)

## Backward Compatibility
The `imageUrl` pipe handles both:
- **New IDs**: `abc123.png` → `/api/images/abc123.png`
- **Legacy base64**: `data:image/png;base64,...` → returned as-is

This allows gradual migration without breaking existing data.
