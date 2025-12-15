import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DataService } from './data.service';
import type { JsonPatch } from './data.service';
@Controller('api')
export class AppController {
  constructor(private readonly dataService: DataService) {}

  @Get('characters/:id')
  getCharacter(@Param('id') id: string): any {
    const sheetJson = this.dataService.getCharacter(id);
    console.log('LOADING ' + id);
    if (!sheetJson) {
      // Character not found → send null

      return null;
    }

    return JSON.parse(sheetJson); // existing character
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
}
