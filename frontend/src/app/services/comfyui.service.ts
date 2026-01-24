import { Injectable, signal } from '@angular/core';

/**
 * ComfyUI Service
 * 
 * Handles communication with a local ComfyUI instance for AI image generation.
 * The browser connects directly to ComfyUI on the local network.
 */

export interface ComfyUIConfig {
  host: string;
  port: number;
}

export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  imageBlob?: Blob;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComfyUIService {
  // Default ComfyUI address - can be configured
  private config: ComfyUIConfig = {
    host: 'localhost',
    port: 8188
  };

  // Reactive state
  isAvailable = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  lastError = signal<string | null>(null);

  // Custom prompt (can be overridden per battlemap)
  private customPrompt: string | null = null;

  // AI generation settings
  private aiSettings: {
    seed: number;
    steps: number;
    cfg: number;
    denoise: number;
  } = {
    seed: -1, // -1 = random
    steps: 10,
    cfg: 1.5,
    denoise: 0.75
  };

  // Default prompt for D&D maps
  private readonly defaultPrompt = "((topdown view))A detailed fantasy town map for Dungeons & Dragons, top-down view. The town is medieval-style, with cobblestone streets, timber-framed houses, and thatched roofs. Include a bustling marketplace with stalls, a central town square with a fountain, a small castle or lord's manor on a hill, a temple or chapel, and a blacksmith's forge. Surround the town with wooden palisades and gates, with roads leading into a dense forest and nearby farmlands. Add a river running through or beside the town with a stone bridge. Include small details like wells, carts, trees, and lanterns for atmosphere. Colorful, hand-drawn, fantasy map aesthetic, easy to read with clear labels and icons, vintage RPG style.";

  // Client ID for WebSocket
  private clientId = this.generateClientId();

  // The workflow template - node 21 will be updated with the uploaded image
  private workflowTemplate = {
    "3": {
      "inputs": {
        "seed": 0, // Will be randomized
        "steps": 10,
        "cfg": 1.5,
        "sampler_name": "euler_ancestral",
        "scheduler": "normal",
        "denoise": 0.75,
        "model": ["16", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["11", 0]
      },
      "class_type": "KSampler",
      "_meta": { "title": "KSampler" }
    },
    "4": {
      "inputs": {
        "ckpt_name": "hephaistosNextgenxlLCM_v20.safetensors"
      },
      "class_type": "CheckpointLoaderSimple",
      "_meta": { "title": "Load Checkpoint" }
    },
    "6": {
      "inputs": {
        "text": "((topdown view))A detailed fantasy town map for Dungeons & Dragons, top-down view. The town is medieval-style, with cobblestone streets, timber-framed houses, and thatched roofs. Include a bustling marketplace with stalls, a central town square with a fountain, a small castle or lord's manor on a hill, a temple or chapel, and a blacksmith's forge. Surround the town with wooden palisades and gates, with roads leading into a dense forest and nearby farmlands. Add a river running through or beside the town with a stone bridge. Include small details like wells, carts, trees, and lanterns for atmosphere. Colorful, hand-drawn, fantasy map aesthetic, easy to read with clear labels and icons, vintage RPG style.",
        "clip": ["16", 1]
      },
      "class_type": "CLIPTextEncode",
      "_meta": { "title": "CLIP Text Encode (Prompt)" }
    },
    "7": {
      "inputs": {
        "text": "low quality",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode",
      "_meta": { "title": "CLIP Text Encode (Prompt)" }
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode",
      "_meta": { "title": "VAE Decode" }
    },
    "11": {
      "inputs": {
        "pixels": ["15", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEEncode",
      "_meta": { "title": "VAE Encode" }
    },
    "14": {
      "inputs": {
        "images": ["8", 0]
      },
      "class_type": "PreviewImage",
      "_meta": { "title": "Preview Image" }
    },
    "15": {
      "inputs": {
        "upscale_method": "nearest-exact",
        "width": 1024,
        "height": 1024,
        "crop": "disabled",
        "image": ["21", 0]
      },
      "class_type": "ImageScale",
      "_meta": { "title": "Upscale Image" }
    },
    "16": {
      "inputs": {
        "lora_name": "dnd-maps.safetensors",
        "strength_model": 1,
        "strength_clip": 1,
        "model": ["4", 0],
        "clip": ["4", 1]
      },
      "class_type": "LoraLoader",
      "_meta": { "title": "Load LoRA" }
    },
    "21": {
      "inputs": {
        "image": "", // Will be set to uploaded filename
        "upload": "image"
      },
      "class_type": "LoadImage",
      "_meta": { "title": "Load Image" }
    }
  };

  private get baseUrl(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }

  /**
   * Configure the ComfyUI connection
   */
  configure(config: Partial<ComfyUIConfig>): void {
    this.config = { ...this.config, ...config };
    this.checkAvailability();
  }

  /**
   * Check if ComfyUI is reachable
   */
  async checkAvailability(): Promise<boolean> {
    try {
      console.log('[ComfyUI] Checking availability at:', this.baseUrl);
      
      const response = await fetch(`${this.baseUrl}/system_stats`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const available = response.ok;
      this.isAvailable.set(available);
      this.lastError.set(null);
      console.log('[ComfyUI] Available:', available);
      return available;
    } catch (error: any) {
      console.error('[ComfyUI] Connection error:', error?.message || error);
      this.isAvailable.set(false);
      
      // Provide more helpful error messages
      if (error?.message?.includes('BLOCKED')) {
        this.lastError.set('Request blocked - try disabling ad blocker for localhost');
      } else if (error?.message?.includes('NetworkError') || error?.message?.includes('Failed to fetch')) {
        this.lastError.set('ComfyUI not reachable - is it running with --enable-cors-header?');
      } else {
        this.lastError.set(`ComfyUI error: ${error?.message || 'Unknown'}`);
      }
      return false;
    }
  }

  /**
   * Generate an image from a canvas drawing
   * @param canvas The canvas element with the drawing
   * @returns The generated image as a blob
   */
  async generateFromCanvas(canvas: HTMLCanvasElement): Promise<GenerationResult> {
    if (!this.isAvailable()) {
      const available = await this.checkAvailability();
      if (!available) {
        return { success: false, error: 'ComfyUI is not available' };
      }
    }

    this.isGenerating.set(true);
    this.lastError.set(null);

    try {
      // Step 1: Convert canvas to blob
      const blob = await this.canvasToBlob(canvas);
      
      // Step 2: Upload image to ComfyUI
      const filename = await this.uploadImage(blob);
      
      // Step 3: Create workflow with the uploaded image
      const workflow = this.createWorkflow(filename);
      
      // Step 4: Queue the prompt and wait for result
      const result = await this.queueAndWait(workflow);
      
      this.isGenerating.set(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.lastError.set(errorMessage);
      this.isGenerating.set(false);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Convert canvas to PNG blob
   */
  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    });
  }

  /**
   * Upload an image to ComfyUI
   */
  private async uploadImage(blob: Blob): Promise<string> {
    const formData = new FormData();
    const filename = `battlemap_input_${Date.now()}.png`;
    formData.append('image', blob, filename);
    formData.append('overwrite', 'true');

    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const result = await response.json();
    return result.name; // The filename on the server
  }

  /**
   * Set a custom prompt for AI generation
   */
  setCustomPrompt(prompt: string | null): void {
    this.customPrompt = prompt && prompt.trim() ? prompt : null;
  }

  /**
   * Set AI generation settings
   */
  setSettings(settings: { seed?: number; steps?: number; cfg?: number; denoise?: number }): void {
    if (settings.seed !== undefined) this.aiSettings.seed = settings.seed;
    if (settings.steps !== undefined) this.aiSettings.steps = settings.steps;
    if (settings.cfg !== undefined) this.aiSettings.cfg = settings.cfg;
    if (settings.denoise !== undefined) this.aiSettings.denoise = settings.denoise;
  }

  /**
   * Get current settings
   */
  getSettings(): { seed: number; steps: number; cfg: number; denoise: number } {
    return { ...this.aiSettings };
  }

  /**
   * Get the current prompt (custom or default)
   */
  getCurrentPrompt(): string {
    return this.customPrompt || this.defaultPrompt;
  }

  /**
   * Create a workflow with the specified input image
   */
  private createWorkflow(inputImageFilename: string): any {
    const workflow = JSON.parse(JSON.stringify(this.workflowTemplate));
    
    // Set the input image
    workflow["21"].inputs.image = inputImageFilename;
    
    // Set seed - use random if -1, otherwise use the specified seed
    const seed = this.aiSettings.seed === -1 
      ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      : this.aiSettings.seed;
    workflow["3"].inputs.seed = seed;
    
    // Set other parameters
    workflow["3"].inputs.steps = this.aiSettings.steps;
    workflow["3"].inputs.cfg = this.aiSettings.cfg;
    workflow["3"].inputs.denoise = this.aiSettings.denoise;
    
    // Set the prompt (custom or default)
    const prompt = this.customPrompt || this.defaultPrompt;
    workflow["6"].inputs.text = prompt;
    
    return workflow;
  }

  /**
   * Queue a prompt and wait for the result using WebSocket
   */
  private async queueAndWait(workflow: any): Promise<GenerationResult> {
    // Queue the prompt
    const queueResponse = await fetch(`${this.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: workflow,
        client_id: this.clientId
      })
    });

    if (!queueResponse.ok) {
      throw new Error(`Failed to queue prompt: ${queueResponse.statusText}`);
    }

    const { prompt_id } = await queueResponse.json();

    // Wait for completion via WebSocket
    return this.waitForCompletion(prompt_id);
  }

  /**
   * Wait for prompt completion using WebSocket
   */
  private waitForCompletion(promptId: string): Promise<GenerationResult> {
    return new Promise((resolve, reject) => {
      const wsUrl = `ws://${this.config.host}:${this.config.port}/ws?clientId=${this.clientId}`;
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Generation timed out (60s)'));
      }, 60000);

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'executing' && message.data.node === null && message.data.prompt_id === promptId) {
            // Execution complete
            clearTimeout(timeout);
            ws.close();
            
            // Fetch the result
            const result = await this.fetchResult(promptId);
            resolve(result);
          }
        } catch (e) {
          // Ignore parse errors for binary messages
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        ws.close();
        reject(new Error('WebSocket error'));
      };

      ws.onclose = () => {
        clearTimeout(timeout);
      };
    });
  }

  /**
   * Fetch the generated image from history
   */
  private async fetchResult(promptId: string): Promise<GenerationResult> {
    const historyResponse = await fetch(`${this.baseUrl}/history/${promptId}`);
    
    if (!historyResponse.ok) {
      throw new Error('Failed to fetch history');
    }

    const history = await historyResponse.json();
    const outputs = history[promptId]?.outputs;

    if (!outputs) {
      throw new Error('No outputs found');
    }

    // Find the preview image output (node 14)
    const previewOutput = outputs["14"];
    if (!previewOutput?.images?.[0]) {
      throw new Error('No image in output');
    }

    const imageInfo = previewOutput.images[0];
    const imageUrl = `${this.baseUrl}/view?filename=${imageInfo.filename}&subfolder=${imageInfo.subfolder || ''}&type=${imageInfo.type}`;

    // Fetch the image as blob
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image');
    }

    const imageBlob = await imageResponse.blob();
    const blobUrl = URL.createObjectURL(imageBlob);

    return {
      success: true,
      imageUrl: blobUrl,
      imageBlob: imageBlob
    };
  }

  /**
   * Generate a unique client ID
   */
  private generateClientId(): string {
    return 'battlemap_' + Math.random().toString(36).substring(2, 15);
  }
}
