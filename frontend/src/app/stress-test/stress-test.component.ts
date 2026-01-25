import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CardComponent } from '../shared/card/card.component';
import { ImageService } from '../services/image.service';

interface StressTestConfig {
  characters: number;
  worlds: number;
  items: number;
  spells: number;
  runes: number;
  skills: number;
  battlemaps: number;
}

interface GenerationResult {
  success: boolean;
  created: {
    characters: number;
    worlds: number;
    images: number;
  };
  characterIds: string[];
  worldNames: string[];
  imageIds: string[];
}

@Component({
  selector: 'app-stress-test',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './stress-test.component.html',
  styleUrl: './stress-test.component.css',
})
export class StressTestComponent {
  private http = inject(HttpClient);
  private imageService = inject(ImageService);

  // Configuration
  config: StressTestConfig = {
    characters: 100,
    worlds: 5,
    items: 50,
    spells: 30,
    runes: 20,
    skills: 15,
    battlemaps: 10,
  };

  // Upload state
  uploadedImages = signal<string[]>([]);
  uploadProgress = signal<string>('');

  // Generation state
  isGenerating = signal(false);
  generationProgress = signal<string>('');
  lastResult = signal<GenerationResult | null>(null);

  // Cleanup state
  isCleaningUp = signal(false);

  // File input handler
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.uploadProgress.set('Uploading images...');
    const files = Array.from(input.files);
    const imageIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.uploadProgress.set(`Uploading ${i + 1}/${files.length}: ${file.name}`);

      try {
        const base64 = await this.fileToBase64(file);
        const imageId = await this.imageService.uploadImage(base64);
        imageIds.push(imageId);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    this.uploadedImages.set([...this.uploadedImages(), ...imageIds]);
    this.uploadProgress.set(`Uploaded ${imageIds.length} images`);

    // Clear input
    input.value = '';
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    const images = [...this.uploadedImages()];
    images.splice(index, 1);
    this.uploadedImages.set(images);
  }

  async generateTestData() {
    if (this.isGenerating()) return;

    this.isGenerating.set(true);
    this.generationProgress.set('Starting generation...');
    this.lastResult.set(null);

    try {
      // Prepare request body - just send image IDs, backend will use them directly
      const body: any = { ...this.config };
      if (this.uploadedImages().length > 0) {
        body.imageIds = this.uploadedImages();
      }

      this.generationProgress.set('Generating characters, worlds, and items...');

      const result = await this.http.post<GenerationResult>('/api/stress-test/generate', body).toPromise();

      if (result) {
        this.lastResult.set(result);
        this.generationProgress.set('✅ Generation complete!');
      }
    } catch (error) {
      console.error('Stress test generation failed:', error);
      this.generationProgress.set('❌ Generation failed - check console');
    } finally {
      this.isGenerating.set(false);
    }
  }

  async cleanupTestData() {
    if (this.isCleaningUp() || !confirm('This will delete all stress test data (characters starting with stress_char_ and worlds starting with StressWorld_). Continue?')) {
      return;
    }

    this.isCleaningUp.set(true);
    this.generationProgress.set('Cleaning up test data...');

    try {
      const result = await this.http.delete<{
        success: boolean;
        deleted: { characters: number; worlds: number };
      }>('/api/stress-test/cleanup').toPromise();

      if (result) {
        this.generationProgress.set(`✅ Deleted ${result.deleted.characters} characters, ${result.deleted.worlds} worlds`);
        this.lastResult.set(null);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      this.generationProgress.set('❌ Cleanup failed - check console');
    } finally {
      this.isCleaningUp.set(false);
    }
  }

  // Preset configurations
  loadPresetSmall() {
    this.config = {
      characters: 10,
      worlds: 1,
      items: 20,
      spells: 10,
      runes: 10,
      skills: 5,
      battlemaps: 2,
    };
  }

  loadPresetMedium() {
    this.config = {
      characters: 100,
      worlds: 5,
      items: 50,
      spells: 30,
      runes: 20,
      skills: 15,
      battlemaps: 10,
    };
  }

  loadPresetLarge() {
    this.config = {
      characters: 500,
      worlds: 20,
      items: 200,
      spells: 100,
      runes: 80,
      skills: 50,
      battlemaps: 30,
    };
  }

  loadPresetExtreme() {
    this.config = {
      characters: 2000,
      worlds: 50,
      items: 500,
      spells: 300,
      runes: 200,
      skills: 150,
      battlemaps: 100,
    };
  }

  get estimatedDataSize(): string {
    // Rough estimates per entity (in KB)
    const charSize = 5; // ~5KB per character
    const worldBaseSize = 10; // ~10KB base
    const itemSize = 0.5;
    const spellSize = 0.5;
    const runeSize = 0.5;
    const skillSize = 0.3;
    const battlemapSize = 2;

    const totalKB = 
      this.config.characters * charSize +
      this.config.worlds * (worldBaseSize + 
        this.config.items * itemSize +
        this.config.spells * spellSize +
        this.config.runes * runeSize +
        this.config.skills * skillSize +
        this.config.battlemaps * battlemapSize
      );

    if (totalKB < 1024) return `~${Math.round(totalKB)} KB`;
    return `~${(totalKB / 1024).toFixed(1)} MB`;
  }

  get totalEntities(): number {
    return this.config.characters + 
           this.config.worlds + 
           (this.config.worlds * (this.config.items + this.config.spells + this.config.runes + this.config.skills + this.config.battlemaps));
  }
}
