import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class ImageService {
  private imagesDir = path.join(__dirname, '../../images');

  constructor() {
    // Ensure images directory exists
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  /**
   * Store an image and return its unique ID
   * @param base64Data The base64 data URL (e.g., "data:image/png;base64,...")
   * @returns The unique image ID (hash)
   */
  storeImage(base64Data: string): string {
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64 image data: empty or not a string');
    }

    // Extract the actual base64 content (remove "data:image/png;base64," prefix)
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      throw new Error(`Invalid base64 image data: format must be "data:image/TYPE;base64,CONTENT" (got: ${base64Data.substring(0, 50)}...)`);
    }

    const extension = matches[1]; // png, jpeg, etc
    const base64Content = matches[2];
    
    if (!base64Content || base64Content.trim().length === 0) {
      throw new Error('Invalid base64 image data: base64 content is empty');
    }

    // Generate hash of the image content (deduplication)
    const hash = crypto.createHash('sha256').update(base64Content).digest('hex');
    const imageId = `${hash}.${extension}`;
    const filePath = path.join(this.imagesDir, imageId);

    // Only write if file doesn't exist (deduplication)
    if (!fs.existsSync(filePath)) {
      const buffer = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, buffer);
      console.log(`[IMAGE SERVICE] Stored new image: ${imageId} (${(buffer.length / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`[IMAGE SERVICE] Image already exists: ${imageId}`);
    }

    return imageId;
  }

  /**
   * Retrieve an image by its ID
   * @param imageId The unique image ID
   * @returns The base64 data URL or null if not found
   */
  getImage(imageId: string): string | null {
    // Security: only allow alphanumeric, dash, underscore, and one dot for extension
    if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(imageId)) {
      console.warn(`[IMAGE SERVICE] Invalid image ID format: ${imageId}`);
      return null;
    }

    const filePath = path.join(this.imagesDir, imageId);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`[IMAGE SERVICE] Image not found: ${imageId}`);
      return null;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const extension = path.extname(imageId).slice(1); // Remove the dot
      const base64 = buffer.toString('base64');
      return `data:image/${extension};base64,${base64}`;
    } catch (err) {
      console.error(`[IMAGE SERVICE] Error reading image ${imageId}:`, err);
      return null;
    }
  }

  /**
   * Get raw image buffer for HTTP streaming
   * @param imageId The unique image ID
   * @returns Object with buffer and mime type, or null if not found
   */
  getImageBuffer(imageId: string): { buffer: Buffer; mimeType: string } | null {
    if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(imageId)) {
      return null;
    }

    const filePath = path.join(this.imagesDir, imageId);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const extension = path.extname(imageId).slice(1).toLowerCase();
      const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      return { buffer, mimeType };
    } catch (err) {
      console.error(`[IMAGE SERVICE] Error reading image ${imageId}:`, err);
      return null;
    }
  }

  /**
   * Delete an image by its ID
   * @param imageId The unique image ID
   * @returns true if deleted, false if not found
   */
  deleteImage(imageId: string): boolean {
    if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(imageId)) {
      return false;
    }

    const filePath = path.join(this.imagesDir, imageId);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      fs.unlinkSync(filePath);
      console.log(`[IMAGE SERVICE] Deleted image: ${imageId}`);
      return true;
    } catch (err) {
      console.error(`[IMAGE SERVICE] Error deleting image ${imageId}:`, err);
      return false;
    }
  }

  /**
   * List all stored images
   * @returns Array of image IDs
   */
  listImages(): string[] {
    try {
      const files = fs.readdirSync(this.imagesDir);
      return files.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
    } catch (err) {
      console.error('[IMAGE SERVICE] Error listing images:', err);
      return [];
    }
  }
}
