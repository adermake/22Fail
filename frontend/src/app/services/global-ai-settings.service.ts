import { Injectable, signal } from '@angular/core';
import { GlobalAiSettings, AiColorPrompt } from '../model/battlemap.model';

const STORAGE_KEY = 'dnd-global-ai-settings';

// Default color prompts
export function getDefaultAiColorPrompts(): AiColorPrompt[] {
  return [
    { id: '1', color: '#22c55e', name: 'Forest', prompt: 'dense forest, tall trees, lush vegetation' },
    { id: '2', color: '#3b82f6', name: 'Water', prompt: 'water, river, lake, blue water surface' },
    { id: '3', color: '#8b4513', name: 'Path', prompt: 'dirt path, road, trail, brown ground' },
    { id: '4', color: '#9ca3af', name: 'Stone', prompt: 'stone floor, cobblestone, grey stone tiles' },
    { id: '5', color: '#eab308', name: 'Sand', prompt: 'sandy terrain, desert sand, beach sand' },
    { id: '6', color: '#dc2626', name: 'Building', prompt: 'building structure, house, wooden building, medieval structure' },
  ];
}

// Default settings
function getDefaultSettings(): GlobalAiSettings {
  return {
    colorPrompts: getDefaultAiColorPrompts(),
    basePrompt: 'A detailed fantasy map for Dungeons & Dragons, top-down view, medieval fantasy style',
    generalRegionPrompt: 'detailed, high quality, clear',
    negativePrompt: 'blurry, low quality, distorted, text, watermark, ugly, modern',
    steps: 10,
    cfg: 1.5,
    denoise: 0.75
  };
}

@Injectable({
  providedIn: 'root'
})
export class GlobalAiSettingsService {
  private settings = signal<GlobalAiSettings>(this.loadSettings());

  constructor() {}

  // Load from localStorage
  private loadSettings(): GlobalAiSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new fields
        return { ...getDefaultSettings(), ...parsed };
      }
    } catch (e) {
      console.error('[GlobalAiSettings] Failed to load settings:', e);
    }
    return getDefaultSettings();
  }

  // Save to localStorage
  private saveSettings(settings: GlobalAiSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      this.settings.set(settings);
    } catch (e) {
      console.error('[GlobalAiSettings] Failed to save settings:', e);
    }
  }

  // Get all settings
  getSettings(): GlobalAiSettings {
    return this.settings();
  }

  // Update settings
  updateSettings(updates: Partial<GlobalAiSettings>): void {
    const current = this.settings();
    const updated = { ...current, ...updates };
    this.saveSettings(updated);
  }

  // Color prompts management
  getColorPrompts(): AiColorPrompt[] {
    return this.settings().colorPrompts;
  }

  addColorPrompt(colorPrompt: Omit<AiColorPrompt, 'id'>): void {
    const current = this.settings();
    const newPrompt: AiColorPrompt = {
      ...colorPrompt,
      id: Date.now().toString()
    };
    this.updateSettings({
      colorPrompts: [...current.colorPrompts, newPrompt]
    });
  }

  updateColorPrompt(id: string, updates: Partial<AiColorPrompt>): void {
    const current = this.settings();
    const colorPrompts = current.colorPrompts.map(cp =>
      cp.id === id ? { ...cp, ...updates } : cp
    );
    this.updateSettings({ colorPrompts });
  }

  deleteColorPrompt(id: string): void {
    const current = this.settings();
    const colorPrompts = current.colorPrompts.filter(cp => cp.id !== id);
    this.updateSettings({ colorPrompts });
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.saveSettings(getDefaultSettings());
  }
}
