import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DataService } from './data.service';
import type { JsonPatch } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CharacterGateway } from './character.gateway';
@Controller('api')
export class AppController {
  constructor(
    private readonly dataService: DataService,
    private readonly characterGateway: CharacterGateway, // Add this
  ) {}

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
}
