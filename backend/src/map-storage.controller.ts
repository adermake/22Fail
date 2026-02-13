import { Controller, Get, Post, Delete, Param, Body, Logger } from '@nestjs/common';
import { MapStorageService } from './map-storage.service';

/**
 * Map Storage Controller
 * 
 * REST API for persistent map storage and backups.
 */
@Controller('api/maps')
export class MapStorageController {
  private readonly logger = new Logger(MapStorageController.name);

  constructor(private readonly mapStorage: MapStorageService) {}

  /**
   * Save a map to disk
   * POST /api/maps/save
   * Body: { worldName: string, mapName: string, mapData: any }
   */
  @Post('save')
  async saveMap(@Body() body: { worldName: string; mapName: string; mapData: any }) {
    const { worldName, mapName, mapData } = body;
    
    if (!worldName || !mapName || !mapData) {
      return { success: false, error: 'Missing required fields' };
    }

    const success = await this.mapStorage.saveMap(worldName, mapName, mapData);
    
    if (success) {
      this.logger.log(`Map saved via API: ${worldName}/${mapName}`);
    }
    
    return { success };
  }

  /**
   * Load a map from disk
   * GET /api/maps/load/:worldName/:mapName
   */
  @Get('load/:worldName/:mapName')
  async loadMap(@Param('worldName') worldName: string, @Param('mapName') mapName: string) {
    const mapData = await this.mapStorage.loadMap(worldName, mapName);
    
    if (!mapData) {
      return { success: false, error: 'Map not found' };
    }
    
    return { success: true, mapData };
  }

  /**
   * Create a backup of a map
   * POST /api/maps/backup/:worldName/:mapName
   */
  @Post('backup/:worldName/:mapName')
  async backupMap(@Param('worldName') worldName: string, @Param('mapName') mapName: string) {
    const success = await this.mapStorage.backupMap(worldName, mapName);
    return { success };
  }

  /**
   * List all maps for a world
   * GET /api/maps/list/:worldName
   */
  @Get('list/:worldName')
  async listMaps(@Param('worldName') worldName: string) {
    const maps = await this.mapStorage.listMaps(worldName);
    return { success: true, maps };
  }

  /**
   * Delete a map (moves to trash)
   * DELETE /api/maps/:worldName/:mapName
   */
  @Delete(':worldName/:mapName')
  async deleteMap(@Param('worldName') worldName: string, @Param('mapName') mapName: string) {
    const success = await this.mapStorage.deleteMap(worldName, mapName);
    return { success };
  }

  /**
   * Check if a map exists
   * GET /api/maps/exists/:worldName/:mapName
   */
  @Get('exists/:worldName/:mapName')
  async mapExists(@Param('worldName') worldName: string, @Param('mapName') mapName: string) {
    const exists = await this.mapStorage.mapExists(worldName, mapName);
    return { exists };
  }
}
