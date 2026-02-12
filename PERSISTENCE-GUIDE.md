# Data Persistence Guide

## File Storage Locations

### 1. **Texture Tile Images** (`backend/images/`)
- Stores the actual PNG image data for drawn texture tiles
- Named with SHA256 hashes (e.g., `a0395fc96eb59cfc7.png`)
- Referenced by `imageId` in map `textureTiles` array
- **Created by:** `ImageService.uploadImage()`
- **Must persist** across server restarts

### 2. **Texture Library Files** (`backend/textures/`)
- Stores uploaded texture images for the brush library
- Named with SHA256 hashes (e.g., `3f4a5b2c1d.png`)
- Referenced by `textureId` in texture library metadata
- **Must persist** across server restarts

### 3. **Texture Library Metadata** (`textures.json`)
- JSON array of texture library entries
- Each entry: `{ id, name, textureId, tileSize, createdAt }`
- Filtered on load to only show textures with existing files

### 4. **World/Lobby Data** (`worlds.json`)
- Main application state storage
- Contains lobby maps with `textureTiles` arrays
- Format: `{ worldName: "{\"lobby\":{\"maps\":{...}}}" }`

## Issue: Missing Images After Restart

If textures disappear after restarting the server, check:

1. **Are the directories persisting?**
   ```powershell
   ls backend/images/
   ls backend/textures/
   ```

2. **Are files being written?**
   - Check console logs for "Stored new texture" messages
   - Verify files exist immediately after uploading

3. **Is the data in worlds.json?**
   - Open `worlds.json` and search for `textureTiles`
   - Verify `imageId` values match files in `backend/images/`

4. **Git tracking:**
   - `.gitkeep` files ensure directories persist in git
   - Actual image files should NOT be in git (too large)
   - For production, use persistent volume storage

## Testing Persistence

1. Upload a texture to the library
2. Draw some texture tiles on the map
3. Verify files exist:
   ```powershell
   ls backend/images/ | measure
   ls backend/textures/ | measure
   ```
4. Check worlds.json contains map data with textureTiles
5. Restart server
6. Verify files still exist
7. Reload page - textures should appear

## Common Issues

### "Texture library vanishes on restart"
- Files in `backend/textures/` don't persist
- Check if directory is being cleaned by build process
- Ensure not in temp folder or Docker ephemeral storage

### "Drawn map disappears" (404 errors)
- Files in `backend/images/` don't persist
- `worlds.json` has imageIds but files are missing
- Server needs persistent disk storage

### "Textures blurry"
- Fixed: Disabled image smoothing in rendering code
- Should now be consistently sharp at all zoom levels
