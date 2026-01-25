import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  /**
   * Upload a base64 image and get back an image ID
   * @param base64Data The base64 data URL (e.g., "data:image/png;base64,...")
   * @returns The unique image ID
   */
  async uploadImage(base64Data: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<{ imageId: string }>('/api/images', { data: base64Data })
    );
    return response.imageId;
  }

  /**
   * Get the URL for an image by its ID
   * For images stored in the new system, this returns /api/images/{id}
   * For legacy base64 data URLs, this returns them as-is
   * @param imageIdOrData Either an image ID or a legacy base64 data URL
   * @returns The image URL
   */
  getImageUrl(imageIdOrData: string | null | undefined): string | null {
    if (!imageIdOrData) {
      return null;
    }

    // Legacy: if it's already a data URL, return as-is
    if (imageIdOrData.startsWith('data:image')) {
      return imageIdOrData;
    }

    // New system: convert image ID to API URL
    return `/api/images/${imageIdOrData}`;
  }

  /**
   * Preload an image into browser cache
   * @param imageId The image ID
   */
  async preloadImage(imageId: string): Promise<void> {
    if (this.cache.has(imageId)) {
      return; // Already loaded
    }

    const url = this.getImageUrl(imageId);
    if (!url) return;

    // Create an image element to trigger browser caching
    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        this.cache.set(imageId, url);
        resolve();
      };
      img.onerror = reject;
    });
  }

  /**
   * Delete an image by its ID
   * @param imageId The image ID
   */
  async deleteImage(imageId: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.delete<{ success: boolean }>(`/api/images/${imageId}`)
    );
    this.cache.delete(imageId);
    return response.success;
  }
}
