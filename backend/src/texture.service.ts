import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class TextureService {
  private texturesDir = path.join(__dirname, '../../textures');

  constructor() {
    // Ensure textures directory exists
    if (!fs.existsSync(this.texturesDir)) {
      fs.mkdirSync(this.texturesDir, { recursive: true });
    }
  }

  /**
   * Store a texture and return its unique ID
   * @param base64Data The base64 data URL (e.g., "data:image/png;base64,...")
   * @returns The unique texture ID (hash)
   */
  storeTexture(base64Data: string): string {
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64 texture data: empty or not a string');
    }

    // Extract the actual base64 content (remove "data:image/png;base64," prefix)
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      throw new Error(`Invalid base64 texture data: format must be "data:image/TYPE;base64,CONTENT" (got: ${base64Data.substring(0, 50)}...)`);
    }

    const extension = matches[1]; // png, jpeg, etc
    const base64Content = matches[2];
    
    if (!base64Content || base64Content.trim().length === 0) {
      throw new Error('Invalid base64 texture data: base64 content is empty');
    }

    // Generate hash of the texture content (deduplication)
    const hash = crypto.createHash('sha256').update(base64Content).digest('hex');
    const textureId = `${hash}.${extension}`;
    const filePath = path.join(this.texturesDir, textureId);

    // Only write if file doesn't exist (deduplication)
    if (!fs.existsSync(filePath)) {
      const buffer = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, buffer);
      console.log(`[TEXTURE SERVICE] Stored new texture: ${textureId} (${(buffer.length / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`[TEXTURE SERVICE] Texture already exists: ${textureId}`);
    }

    return textureId;
  }

  /**
   * Retrieve a texture by its ID
   * @param textureId The unique texture ID
   * @returns The base64 data URL or null if not found
   */
  getTexture(textureId: string): string | null {
    // Security: only allow alphanumeric, dash, underscore, and one dot for extension
    if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(textureId)) {
      console.warn(`[TEXTURE SERVICE] Invalid texture ID format: ${textureId}`);
      return null;
    }

    const filePath = path.join(this.texturesDir, textureId);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`[TEXTURE SERVICE] Texture not found: ${textureId}`);
      return null;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const extension = path.extname(textureId).slice(1); // Remove the dot
      const base64 = buffer.toString('base64');
      return `data:image/${extension};base64,${base64}`;
    } catch (err) {
      console.error(`[TEXTURE SERVICE] Error reading texture ${textureId}:`, err);
      return null;
    }
  }

  /**
   * Get raw texture buffer for HTTP streaming
   * @param textureId The unique texture ID
   * @returns Object with buffer and mime type, or null if not found
   */
  getTextureBuffer(textureId: string): { buffer: Buffer; mimeType: string } | null {
    if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(textureId)) {
      return null;
    }

    const filePath = path.join(this.texturesDir, textureId);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const extension = path.extname(textureId).slice(1).toLowerCase();
      const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      return { buffer, mimeType };
    } catch (err) {
      console.error(`[TEXTURE SERVICE] Error reading texture ${textureId}:`, err);
      return null;
    }
  }

  /**
   * Delete a texture by its ID
   * @param textureId The unique texture ID
   * @returns true if deleted, false if not found
   */
  deleteTexture(textureId: string): boolean {
    if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(textureId)) {
      return false;
    }

    const filePath = path.join(this.texturesDir, textureId);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      fs.unlinkSync(filePath);
      console.log(`[TEXTURE SERVICE] Deleted texture: ${textureId}`);
      return true;
    } catch (err) {
      console.error(`[TEXTURE SERVICE] Error deleting texture ${textureId}:`, err);
      return false;
    }
  }

  /**
   * List all stored textures
   * @returns Array of texture IDs
   */
  listTextures(): string[] {
    try {
      const files = fs.readdirSync(this.texturesDir);
      return files.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
    } catch (err) {
      console.error('[TEXTURE SERVICE] Error listing textures:', err);
      return [];
    }
  }
}
