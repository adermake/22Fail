import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { DataService } from './data.service';
import { ImageService } from './image.service';
import { TextureService } from './texture.service';
import { StressTestService } from './stress-test.service';
import type { JsonPatch } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CharacterGateway } from './character.gateway';
import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';

@Controller('api')
export class AppController {
  constructor(
    private readonly dataService: DataService,
    private readonly imageService: ImageService,
    private readonly textureService: TextureService,
    private readonly stressTestService: StressTestService,
    private readonly characterGateway: CharacterGateway, // Add this
  ) {}

  // Image proxy endpoint - downloads image from URL and returns it
  // This avoids CORS issues when searching for images
  @Get('images/proxy')
  async proxyImage(@Query('url') url: string, @Res() res: Response): Promise<void> {
    if (!url) {
      res.status(400).send('URL is required');
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    return new Promise((resolve) => {
      protocol.get(url, { timeout: 10000 }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirects
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.proxyImage(redirectUrl, res).then(resolve);
            return;
          }
        }
        
        const contentType = response.headers['content-type'] || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        
        response.pipe(res);
        response.on('end', () => resolve());
      }).on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(500).send('Failed to fetch image');
        resolve();
      });
    });
  }

  // Download image to server and return an image ID
  @Post('images/download')
  async downloadImage(@Body() body: { url: string; name: string }): Promise<{ success: boolean; imageId?: string; error?: string }> {
    const { url, name } = body;
    
    if (!url || !name) {
      return { success: false, error: 'URL and name are required' };
    }

    try {
      // Download the image to a temporary buffer
      const buffer = await this.downloadFileToBuffer(url);
      
      // Determine mime type from URL
      const ext = this.getExtensionFromUrl(url) || 'png';
      const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      
      // Convert to base64 data URL
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      // Store using image service (automatically deduplicates)
      const imageId = this.imageService.storeImage(dataUrl);

      return { 
        success: true, 
        imageId 
      };
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, error: 'Failed to download image' };
    }
  }

  private getExtensionFromUrl(url: string): string {
    try {
      const urlPath = new URL(url).pathname;
      const ext = path.extname(urlPath).toLowerCase().substring(1); // Remove the dot
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
        return ext;
      }
    } catch (err) {
      // Invalid URL
    }
    return 'png';
  }

  private downloadFileToBuffer(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const request = protocol.get(url, { timeout: 30000 }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.downloadFileToBuffer(redirectUrl).then(resolve).catch(reject);
            return;
          }
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }

  private downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(destPath);
      
      const request = protocol.get(url, { timeout: 30000 }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlinkSync(destPath);
            this.downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
            return;
          }
        }
        
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      });

      request.on('error', (err) => {
        file.close();
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(err);
      });
      
      request.on('timeout', () => {
        request.destroy();
        file.close();
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(new Error('Download timeout'));
      });
    });
  }

  @Get('characters/:id')
  getCharacter(@Param('id') id: string): any {
    const sheetJson = this.dataService.getCharacter(id);
    console.log('LOADING CHARACTER: ' + id);
    if (!sheetJson) {
      // Character not found → send null
      console.log('Character not found: ' + id);
      return null;
    }

    return JSON.parse(sheetJson); // existing character
  }

  @Get('characters')
  getAllCharacterIds(): string[] {
    return this.dataService.getAllCharacterIds();
  }

  // POST /characters/:id
  @Post('characters/:id')
  saveCharacter(@Param('id') id:string, @Body() body: any): any {
    // body is already an object, convert to JSON string
    console.log('SAVED ' + id);
    const sheetJson = JSON.stringify(body);
    this.dataService.saveCharacter(id, sheetJson);
    return { success: true };
  }

  @Patch('characters/:id')
  applyPatch(@Param('id') id: string, @Body() patch: JsonPatch): any {
    console.log('PATCH', id, patch);

    const updatedSheet = this.dataService.applyPatchToCharacter(id, patch);

    if (!updatedSheet) {
      return { success: false, error: 'Character not found' };
    }

    return {
      success: true,
      patch,
    };
  }

  // In your controller
  @Post('characters/:id/portrait')
  @UseInterceptors(FileInterceptor('portrait'))
  uploadPortrait(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Convert to base64
    const base64 = Buffer.from(file.buffer).toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    // Store image and get ID
    const imageId = this.imageService.storeImage(dataUrl);

    // Apply as a patch with just the image ID
    this.dataService.applyPatchToCharacter(id, {
      path: 'portrait',
      value: imageId,
    });

    // Broadcast to other clients using the helper method
    this.characterGateway.broadcastPatch(id, {
      path: 'portrait',
      value: imageId,
    });

    return { success: true, imageId };
  }

  // ==================== Image Management ====================

  @Post('images')
  uploadImage(@Body('data') base64Data: string): any {
    if (!base64Data) {
      throw new BadRequestException('No image data provided');
    }

    const imageId = this.imageService.storeImage(base64Data);
    return { imageId };
  }

  @Get('images/:id')
  getImage(@Param('id') id: string, @Res() res: Response): void {
    const imageData = this.imageService.getImageBuffer(id);
    
    if (!imageData) {
      res.status(404).send('Image not found');
      return;
    }

    res.setHeader('Content-Type', imageData.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year
    res.send(imageData.buffer);
  }

  @Delete('images/:id')
  deleteImage(@Param('id') id: string): any {
    const deleted = this.imageService.deleteImage(id);
    return { success: deleted };
  }

  @Get('images')
  listImages(): any {
    const images = this.imageService.listImages();
    return { images };
  }

  // ==================== Texture Management ====================

  @Post('textures')
  uploadTexture(@Body('data') base64Data: string): any {
    if (!base64Data) {
      throw new BadRequestException('No texture data provided');
    }

    const textureId = this.textureService.storeTexture(base64Data);
    return { textureId };
  }

  @Get('textures/:id')
  getTexture(@Param('id') id: string, @Res() res: Response): void {
    const textureData = this.textureService.getTextureBuffer(id);
    
    if (!textureData) {
      res.status(404).send('Texture not found');
      return;
    }

    res.setHeader('Content-Type', textureData.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year
    res.send(textureData.buffer);
  }

  @Delete('textures/:id')
  deleteTexture(@Param('id') id: string): any {
    const deleted = this.textureService.deleteTexture(id);
    return { success: deleted };
  }

  @Get('textures')
  listTextures(): any {
    const textures = this.textureService.listTextures();
    return { textures };
  }

  // ==================== Global Texture Library ====================

  @Get('texture-library')
  getTextureLibrary(): any {
    const textures = this.dataService.getGlobalTextures();
    return { textures };
  }

  @Post('texture-library')
  addToTextureLibrary(@Body() body: { name: string; textureId: string; tileSize: number }): any {
    const { name, textureId, tileSize } = body;

    if (!name || !textureId || !tileSize) {
      throw new BadRequestException('Missing required fields: name, textureId, tileSize');
    }

    const texture = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      textureId,
      tileSize,
    };

    this.dataService.addGlobalTexture(texture);
    return { success: true, texture };
  }

  @Delete('texture-library/:id')
  deleteFromTextureLibrary(@Param('id') id: string): any {
    const deleted = this.dataService.deleteGlobalTexture(id);
    return { success: deleted };
  }

  // Clean up orphaned images (admin endpoint)
  @Post('images/cleanup')
  cleanupOrphanedImages(): any {
    console.log('[CLEANUP] Starting image cleanup...');
    
    // Get all stored images
    const allImages = this.imageService.listImages();
    console.log(`[CLEANUP] Found ${allImages.length} stored images`);
    
    // Get all worlds to check for image references
    const worlds = this.dataService.getAllWorldNames();
    const referencedImages = new Set<string>();
    
    for (const worldName of worlds) {
      try {
        const worldData = this.dataService.getWorld(worldName);
        if (worldData) {
          const world = JSON.parse(worldData);
          
          // Check lobby maps for image references
          if (world.lobby && world.lobby.maps) {
            for (const map of world.lobby.maps) {
              if (map.images) {
                for (const [imageId] of Object.entries(map.images)) {
                  referencedImages.add(imageId);
                }
              }
            }
          }
          
          // Check characters for portrait images
          if (world.characters) {
            for (const character of world.characters) {
              if (character.portrait && character.portrait.startsWith('http://localhost:3000/api/images/')) {
                const imageId = character.portrait.replace('http://localhost:3000/api/images/', '');
                referencedImages.add(imageId);
              }
            }
          }
        }
      } catch (error) {
        console.error(`[CLEANUP] Error checking world ${worldName}:`, error);
      }
    }
    
    console.log(`[CLEANUP] Found ${referencedImages.size} referenced images`);
    
    // Find orphaned images
    const orphanedImages = allImages.filter(imageId => !referencedImages.has(imageId));
    console.log(`[CLEANUP] Found ${orphanedImages.length} orphaned images:`, orphanedImages);
    
    // Delete orphaned images
    let deletedCount = 0;
    for (const imageId of orphanedImages) {
      if (this.imageService.deleteImage(imageId)) {
        deletedCount++;
      }
    }
    
    console.log(`[CLEANUP] Deleted ${deletedCount} orphaned images`);
    return { 
      success: true, 
      totalImages: allImages.length,
      referencedImages: referencedImages.size,
      orphanedImages: orphanedImages.length,
      deletedImages: deletedCount,
      orphanedImageIds: orphanedImages
    };
  }

  // World endpoints
  @Get('worlds/:name')
  getWorld(@Param('name') name: string): any {
    const worldJson = this.dataService.getWorld(name);
    console.log('LOADING WORLD: ' + name);
    if (!worldJson) {
      console.log('World not found: ' + name);
      return null;
    }
    console.log('World loaded successfully: ' + name);
    return JSON.parse(worldJson);
  }

  @Post('worlds/:name')
  saveWorld(@Param('name') name: string, @Body() body: any): any {
    console.log('SAVING WORLD ' + name);
    const worldJson = JSON.stringify(body);
    this.dataService.saveWorld(name, worldJson);
    return { success: true };
  }

  @Patch('worlds/:name')
  applyWorldPatch(@Param('name') name: string, @Body() patch: JsonPatch): any {
    console.log('PATCH WORLD', name, patch);

    const updatedWorld = this.dataService.applyPatchToWorld(name, patch);

    if (!updatedWorld) {
      return { success: false, error: 'World not found' };
    }

    return {
      success: true,
      patch,
    };
  }

  // Battle Map Endpoints (legacy)
  @Get('worlds/:worldName/battlemaps/:battleMapId')
  getBattleMap(@Param('worldName') worldName: string, @Param('battleMapId') battleMapId: string): any {
    const battleMap = this.dataService.getBattleMap(worldName, battleMapId);
    if (!battleMap) {
      return null;
    }
    return battleMap;
  }

  @Post('worlds/:worldName/battlemaps')
  addBattleMap(@Param('worldName') worldName: string, @Body() body: any): any {
    const newBattleMap = this.dataService.addBattleMap(worldName, body);
    return { success: true, battleMap: newBattleMap };
  }

  // Lobby Endpoints (new multi-map system)
  @Get('worlds/:worldName/lobby')
  getLobby(@Param('worldName') worldName: string): any {
    const lobby = this.dataService.getLobby(worldName);
    if (!lobby) {
      // Return null if lobby doesn't exist yet - frontend will create one
      return null;
    }
    return lobby;
  }

  @Post('worlds/:worldName/lobby')
  saveLobby(@Param('worldName') worldName: string, @Body() body: any): any {
    const lobby = this.dataService.saveLobby(worldName, body);
    return lobby;
  }

  @Get('worlds/:worldName/lobby/maps/:mapId')
  getMap(@Param('worldName') worldName: string, @Param('mapId') mapId: string): any {
    const map = this.dataService.getMap(worldName, mapId);
    if (!map) {
      return null;
    }
    return map;
  }

  @Post('worlds/:worldName/lobby/maps/:mapId')
  saveMap(@Param('worldName') worldName: string, @Param('mapId') mapId: string, @Body() body: any): any {
    const map = this.dataService.saveMap(worldName, mapId, body);
    return map;
  }

  // ==================== Migration Utilities ====================

  @Post('migrate/portraits-to-images')
  async migratePortraitsToImages(): Promise<any> {
    console.log('[MIGRATION] Starting portrait to image ID migration...');
    let migrated = 0;
    let skipped = 0;

    // Migrate all characters
    const allCharacters = this.dataService.getAllCharacterIds();
    console.log(`[MIGRATION] Found ${allCharacters.length} characters`);

    for (const characterId of allCharacters) {
      const characterJson = this.dataService.getCharacter(characterId);
      if (!characterJson) continue;

      const character = JSON.parse(characterJson);
      
      // Check if portrait is a base64 data URL
      if (character.portrait && typeof character.portrait === 'string' && character.portrait.startsWith('data:image')) {
        try {
          const imageId = this.imageService.storeImage(character.portrait);
          this.dataService.applyPatchToCharacter(characterId, {
            path: 'portrait',
            value: imageId,
          });
          console.log(`[MIGRATION] Migrated character ${characterId}: ${(character.portrait.length / 1024).toFixed(2)}KB -> ${imageId}`);
          migrated++;
        } catch (err) {
          console.error(`[MIGRATION] Failed to migrate character ${characterId}:`, err);
        }
      } else {
        skipped++;
      }
    }

    console.log(`[MIGRATION] Complete: ${migrated} migrated, ${skipped} skipped`);
    return { success: true, migrated, skipped };
  }

  // Race endpoints - globally shared across all characters
  @Get('races')
  getAllRaces(): any {
    console.log('LOADING ALL RACES');
    return this.dataService.getAllRaces();
  }

  @Get('races/:id')
  getRace(@Param('id') id: string): any {
    console.log('LOADING RACE:', id);
    const race = this.dataService.getRace(id);
    if (!race) {
      return null;
    }
    return race;
  }

  @Post('races')
  saveRace(@Body() body: any): any {
    console.log('SAVING RACE:', body.id || body.name);
    const race = this.dataService.saveRace(body);
    return { success: true, race };
  }

  @Delete('races/:id')
  deleteRace(@Param('id') id: string): any {
    console.log('DELETING RACE:', id);
    const success = this.dataService.deleteRace(id);
    return { success };
  }

  @Post('races/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  uploadRaceImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Convert to base64
    const base64 = Buffer.from(file.buffer).toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    // Store image and get ID
    const imageId = this.imageService.storeImage(dataUrl);

    // Update the race with the image ID
    const race = this.dataService.getRace(id);
    if (!race) {
      throw new BadRequestException('Race not found');
    }

    race.baseImage = imageId;
    this.dataService.saveRace(race);

    return { success: true, imageUrl: imageId };
  }

  // ==================== STRESS TEST ENDPOINTS ====================

  @Post('stress-test/generate')
  async generateStressTestData(@Body() config: {
    characters?: number;
    worlds?: number;
    items?: number;
    spells?: number;
    runes?: number;
    skills?: number;
    battlemaps?: number;
    customImages?: string[];
  }) {
    console.log('[STRESS TEST] Generating test data:', config);

    const result = await this.stressTestService.generateStressTestData(config);

    // Save all generated characters
    for (const char of result.characters) {
      this.dataService.saveCharacter(char.id, JSON.stringify(char.data, null, 2));
    }

    // Save all generated worlds
    for (const world of result.worlds) {
      this.dataService.saveWorld(world.name, JSON.stringify(world, null, 2));
    }

    console.log(`[STRESS TEST] Created ${result.characters.length} characters, ${result.worlds.length} worlds, ${result.imageIds.length} images`);

    return {
      success: true,
      created: {
        characters: result.characters.length,
        worlds: result.worlds.length,
        images: result.imageIds.length,
      },
      characterIds: result.characters.map(c => c.id),
      worldNames: result.worlds.map(w => w.name),
      imageIds: result.imageIds,
    };
  }

  @Delete('stress-test/cleanup')
  async cleanupStressTestData() {
    console.log('[STRESS TEST] Cleaning up test data');

    // Delete characters - delete the actual files
    const allCharIds = this.dataService.getAllCharacterIds();
    const stressCharIds = allCharIds.filter(id => id.startsWith('stress_char_'));

    for (const charId of stressCharIds) {
      // Delete character file (now just id.json)
      const charactersDir = path.join(__dirname, '../../../characters');
      const filePath = path.join(charactersDir, `${charId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete worlds - delete the entire world directories
    const worldNames = this.dataService.getAllWorldNames();
    const stressWorldNames = worldNames.filter(name => name.startsWith('StressWorld_'));

    const worldsDir = path.join(__dirname, '../../../worlds');
    for (const worldName of stressWorldNames) {
      // Sanitize world name to match directory name
      const safeName = worldName
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/\.+/g, '_')
        .substring(0, 200);
      
      const worldDirPath = path.join(worldsDir, safeName);
      if (fs.existsSync(worldDirPath)) {
        // Delete the entire world directory recursively
        fs.rmSync(worldDirPath, { recursive: true, force: true });
      }
    }

    console.log(`[STRESS TEST] Deleted ${stressCharIds.length} characters, ${stressWorldNames.length} worlds`);

    return {
      success: true,
      deleted: {
        characters: stressCharIds.length,
        worlds: stressWorldNames.length,
      },
    };
  }
}