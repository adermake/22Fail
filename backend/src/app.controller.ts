import {
  BadRequestException,
  Body,
  Controller,
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
import { WorldGateway } from './world.gateway';
@Controller('api')
export class AppController {
  constructor(
    private readonly dataService: DataService,
    private readonly characterGateway: CharacterGateway, // Add this
    private readonly worldGateway: WorldGateway, // world gateway
  ) {}

  @Get('characters/:id')
  getCharacter(@Param('id') id: string): any {
    const sheetJson = this.dataService.getCharacter(id);
    console.log('LOADING ' + id);
    if (!sheetJson) {
      // Character not found → send null
      console.log('sendnull for ' + id);
      return null;
    }

    console.log('sendnull for ' + sheetJson);
    return JSON.parse(sheetJson); // existing character
  }

  @Get('characters')
  listCharacters(): any {
    return this.dataService.getAllCharacters();
  }

  @Get('worlds')
  listWorlds(): any {
    return this.dataService.listWorlds();
  }

  @Get('worlds/:name')
  getWorld(@Param('name') name: string): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const world = this.dataService.getWorld(name);
    if (!world) return null;
    return world;
  }

  @Post('worlds/:name')
  saveWorld(@Param('name') name: string, @Body() body: any): any {
    this.dataService.saveWorld(name, body);
    return { success: true };
  }

  // POST /characters/:id
  @Post('characters/:id')
  saveCharacter(@Param('id') id: string, @Body() body: any): any {
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

  @Patch('worlds/:name')
  applyWorldPatch(@Param('name') name: string, @Body() patch: JsonPatch): any {
    console.log('WORLD PATCH', name, patch);

    const updated = this.dataService.applyPatchToWorld(name, patch);
    if (!updated) {
      return { success: false, error: 'World not found' };
    }

    // Broadcast via gateway
    this.worldGateway.broadcastPatch(name, patch);

    return { success: true, patch };
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
}
