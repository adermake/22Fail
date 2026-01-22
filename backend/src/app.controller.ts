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
} from '@nestjs/common';
import type { Response } from 'express';
import { DataService } from './data.service';
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

  // Download image to server and return a local path
  @Post('images/download')
  async downloadImage(@Body() body: { url: string; name: string }): Promise<{ success: boolean; path?: string; error?: string }> {
    const { url, name } = body;
    
    if (!url || !name) {
      return { success: false, error: 'URL and name are required' };
    }

    try {
      // Create tokens directory if it doesn't exist
      const tokensDir = path.join(__dirname, '..', 'token-images');
      if (!fs.existsSync(tokensDir)) {
        fs.mkdirSync(tokensDir, { recursive: true });
      }

      // Generate unique filename
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const timestamp = Date.now();
      const ext = this.getExtensionFromUrl(url) || '.png';
      const filename = `${sanitizedName}_${timestamp}${ext}`;
      const filepath = path.join(tokensDir, filename);

      // Download the image
      await this.downloadFile(url, filepath);

      // Return relative path that can be served
      return { 
        success: true, 
        path: `/api/token-images/${filename}` 
      };
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, error: 'Failed to download image' };
    }
  }

  // Serve token images
  @Get('token-images/:filename')
  serveTokenImage(@Param('filename') filename: string, @Res() res: Response): void {
    const tokensDir = path.join(__dirname, '..', 'token-images');
    const filepath = path.join(tokensDir, filename);
    
    if (!fs.existsSync(filepath)) {
      res.status(404).send('Image not found');
      return;
    }

    res.sendFile(filepath);
  }

  private getExtensionFromUrl(url: string): string {
    const urlPath = new URL(url).pathname;
    const ext = path.extname(urlPath).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
      return ext;
    }
    return '.png';
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const base64 = Buffer.from(file.buffer).toString('base64');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    // Apply as a patch
    this.dataService.applyPatchToCharacter(id, {
      path: 'portrait',
      value: dataUrl,
    });

    // Broadcast to other clients using the helper method
    this.characterGateway.broadcastPatch(id, {
      path: 'portrait',
      value: dataUrl,
    });

    return { success: true };
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

  // Battle Map Endpoints
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

    // Update the race with the new image
    const race = this.dataService.getRace(id);
    if (!race) {
      throw new BadRequestException('Race not found');
    }

    race.baseImage = dataUrl;
    this.dataService.saveRace(race);

    return { success: true, imageUrl: dataUrl };
  }
}
