import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Map Storage Service
 * 
 * Handles persistent file-based storage for maps, preventing data loss.
 * Maps are stored in: maps/{worldName}/{mapName}/
 *   - map.json: Full map data
 *   - images/: Map-specific images
 *   - backups/: Timestamped backup copies
 */
@Injectable()
export class MapStorageService {
  private readonly logger = new Logger(MapStorageService.name);
  private readonly mapsDirectory = join(process.cwd(), 'maps');

  constructor() {
    this.ensureMapsDirectory();
  }

  /**
   * Ensure the maps directory exists
   */
  private async ensureMapsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.mapsDirectory, { recursive: true });
      this.logger.log(`Maps directory initialized: ${this.mapsDirectory}`);
    } catch (error) {
      this.logger.error('Failed to create maps directory:', error);
    }
  }

  /**
   * Get the directory path for a specific map
   */
  private getMapDirectory(worldName: string, mapName: string): string {
    return join(this.mapsDirectory, worldName, mapName);
  }

  /**
   * Get the map JSON file path
   */
  private getMapFilePath(worldName: string, mapName: string): string {
    return join(this.getMapDirectory(worldName, mapName), 'map.json');
  }

  /**
   * Get the images directory for a map
   */
  private getMapImagesDirectory(worldName: string, mapName: string): string {
    return join(this.getMapDirectory(worldName, mapName), 'images');
  }

  /**
   * Get the backups directory for a map
   */
  private getMapBackupsDirectory(worldName: string, mapName: string): string {
    return join(this.getMapDirectory(worldName, mapName), 'backups');
  }

  /**
   * Save a map to the filesystem
   * Returns true if successful, false otherwise
   */
  async saveMap(worldName: string, mapName: string, mapData: any): Promise<boolean> {
    try {
      const mapDir = this.getMapDirectory(worldName, mapName);
      const mapFile = this.getMapFilePath(worldName, mapName);
      
      // Ensure directory exists
      await fs.mkdir(mapDir, { recursive: true });
      await fs.mkdir(this.getMapImagesDirectory(worldName, mapName), { recursive: true });
      
      // Add metadata
      const dataToSave = {
        ...mapData,
        _savedAt: new Date().toISOString(),
        _version: '1.0',
        _worldName: worldName,
        _mapName: mapName,
      };
      
      // Write map data
      await fs.writeFile(mapFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      
      this.logger.log(`Map saved: ${worldName}/${mapName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to save map ${worldName}/${mapName}:`, error);
      return false;
    }
  }

  /**
   * Load a map from the filesystem
   * Returns the map data or null if not found
   */
  async loadMap(worldName: string, mapName: string): Promise<any | null> {
    try {
      const mapFile = this.getMapFilePath(worldName, mapName);
      const data = await fs.readFile(mapFile, 'utf-8');
      const mapData = JSON.parse(data);
      
      this.logger.log(`Map loaded: ${worldName}/${mapName}`);
      return mapData;
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        this.logger.error(`Failed to load map ${worldName}/${mapName}:`, error);
      }
      return null;
    }
  }

  /**
   * Create a backup of the current map
   */
  async backupMap(worldName: string, mapName: string): Promise<boolean> {
    try {
      const mapFile = this.getMapFilePath(worldName, mapName);
      const backupsDir = this.getMapBackupsDirectory(worldName, mapName);
      
      // Ensure backups directory exists
      await fs.mkdir(backupsDir, { recursive: true });
      
      // Read current map
      const data = await fs.readFile(mapFile, 'utf-8');
      
      // Create timestamped backup
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const backupFile = join(backupsDir, `map-${timestamp}.json`);
      
      await fs.writeFile(backupFile, data, 'utf-8');
      
      this.logger.log(`Backup created: ${worldName}/${mapName} -> ${backupFile}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to backup map ${worldName}/${mapName}:`, error);
      return false;
    }
  }

  /**
   * List all maps for a world
   */
  async listMaps(worldName: string): Promise<string[]> {
    try {
      const worldDir = join(this.mapsDirectory, worldName);
      const entries = await fs.readdir(worldDir, { withFileTypes: true });
      
      // Filter for directories that contain a map.json file
      const maps: string[] = [];
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const mapFile = join(worldDir, entry.name, 'map.json');
          try {
            await fs.access(mapFile);
            maps.push(entry.name);
          } catch {
            // No map.json, skip this directory
          }
        }
      }
      
      return maps;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      this.logger.error(`Failed to list maps for ${worldName}:`, error);
      return [];
    }
  }

  /**
   * Delete a map (move to trash)
   */
  async deleteMap(worldName: string, mapName: string): Promise<boolean> {
    try {
      // Create final backup before deletion
      await this.backupMap(worldName, mapName);
      
      const mapDir = this.getMapDirectory(worldName, mapName);
      const trashDir = join(this.mapsDirectory, '_trash', worldName);
      
      await fs.mkdir(trashDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const trashPath = join(trashDir, `${mapName}-${timestamp}`);
      
      await fs.rename(mapDir, trashPath);
      
      this.logger.log(`Map moved to trash: ${worldName}/${mapName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete map ${worldName}/${mapName}:`, error);
      return false;
    }
  }

  /**
   * Save an image to the map's images directory
   */
  async saveMapImage(worldName: string, mapName: string, imageId: string, imageData: Buffer): Promise<boolean> {
    try {
      const imagesDir = this.getMapImagesDirectory(worldName, mapName);
      await fs.mkdir(imagesDir, { recursive: true });
      
      const imagePath = join(imagesDir, `${imageId}.png`);
      await fs.writeFile(imagePath, imageData);
      
      this.logger.log(`Image saved: ${worldName}/${mapName}/${imageId}.png`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to save image for ${worldName}/${mapName}:`, error);
      return false;
    }
  }

  /**
   * Load an image from the map's images directory
   */
  async loadMapImage(worldName: string, mapName: string, imageId: string): Promise<Buffer | null> {
    try {
      const imagePath = join(this.getMapImagesDirectory(worldName, mapName), `${imageId}.png`);
      const data = await fs.readFile(imagePath);
      return data;
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        this.logger.error(`Failed to load image ${worldName}/${mapName}/${imageId}:`, error);
      }
      return null;
    }
  }

  /**
   * Check if a map exists
   */
  async mapExists(worldName: string, mapName: string): Promise<boolean> {
    try {
      const mapFile = this.getMapFilePath(worldName, mapName);
      await fs.access(mapFile);
      return true;
    } catch {
      return false;
    }
  }
}
