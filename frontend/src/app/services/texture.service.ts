import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TextureService {
  private cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  /**
   * Upload a base64 texture and get back a texture ID
   * @param base64Data The base64 data URL (e.g., "data:image/png;base64,...")
   * @returns The unique texture ID
   */
  async uploadTexture(base64Data: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<{ textureId: string }>('/api/textures', { data: base64Data })
    );
    return response.textureId;
  }

  /**
   * Get the URL for a texture by its ID
   * @param textureId The texture ID
   * @returns The texture URL
   */
  getTextureUrl(textureId: string | null | undefined): string | null {
    if (!textureId) {
      return null;
    }

    // For legacy data URLs
    if (textureId.startsWith('data:image')) {
      return textureId;
    }

    return `/api/textures/${textureId}`;
  }

  /**
   * Preload a texture into browser cache
   * @param textureId The texture ID
   */
  async preloadTexture(textureId: string): Promise<void> {
    if (this.cache.has(textureId)) {
      return; // Already loaded
    }

    const url = this.getTextureUrl(textureId);
    if (!url) return;

    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        this.cache.set(textureId, url);
        resolve();
      };
      img.onerror = reject;
    });
  }

  /**
   * Delete a texture by its ID
   * @param textureId The texture ID
   */
  async deleteTexture(textureId: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.delete<{ success: boolean }>(`/api/textures/${textureId}`)
    );
    this.cache.delete(textureId);
    return response.success;
  }

  /**
   * List all textures
   * @returns Array of texture IDs
   */
  async listTextures(): Promise<string[]> {
    const response = await firstValueFrom(
      this.http.get<{ textures: string[] }>('/api/textures')
    );
    return response.textures;
  }

  // ==================== Global Texture Library ====================

  /**
   * Get all global library textures
   * @returns Array of library textures with metadata
   */
  async getTextureLibrary(): Promise<any[]> {
    const response = await firstValueFrom(
      this.http.get<{ textures: any[] }>('/api/texture-library')
    );
    return response.textures;
  }

  /**
   * Add a texture to the global library
   * @param base64Data The texture image data
   * @param name The texture name
   * @param tileSize The default tile size
   * @returns The created library texture
   */
  async addToTextureLibrary(base64Data: string, name: string, tileSize: number = 100): Promise<any> {
    // First upload the texture file
    const textureId = await this.uploadTexture(base64Data);

    // Then add to library
    const response = await firstValueFrom(
      this.http.post<{ success: boolean; texture: any }>('/api/texture-library', {
        name,
        textureId,
        tileSize,
      })
    );
    return response.texture;
  }

  /**
   * Delete a texture from the global library
   * @param id The library texture ID
   * @returns Success status
   */
  async deleteFromTextureLibrary(id: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.delete<{ success: boolean }>(`/api/texture-library/${id}`)
    );
    return response.success;
  }
}
