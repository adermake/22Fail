import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  inject, signal, ViewChild, ElementRef, ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile, createAssetFile } from '../../model/asset-browser.model';
import { RuneBlock, RuneDataLine, RuneStatRequirements, DATA_TYPE_PRESETS } from '../../model/rune-block.model';
import { ImageService } from '../../services/image.service';
import { ImageUrlPipe } from '../../shared/image-url.pipe';

@Component({
  selector: 'app-rune-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './rune-table.component.html',
  styleUrl: './rune-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuneTableComponent implements OnInit, OnDestroy {
  @Input() libraryId!: string;
  @Input() folderId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() filesChanged = new EventEmitter<void>();

  @ViewChild('uploadInput') uploadInput!: ElementRef<HTMLInputElement>;

  private api = inject(AssetBrowserApiService);
  private imageService = inject(ImageService);
  private cdr = inject(ChangeDetectorRef);

  runeFiles: AssetFile[] = [];
  isLoading = signal(false);
  uploading = signal(false);
  savingIds = signal(new Set<string>());
  readonly presets = DATA_TYPE_PRESETS;
  /** Per-file save timer ids */
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

  ngOnInit() {
    this.loadRunes();
  }

  ngOnDestroy() {
    for (const t of this.saveTimers.values()) clearTimeout(t);
  }

  async loadRunes(): Promise<void> {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(
        this.api.getFolderContents(this.libraryId, this.folderId)
      );
      this.runeFiles = (contents.files ?? []).filter(f => f.type === 'rune');
      this.ensureRuneDefaults();
    } catch (e) {
      console.error('[RuneTable] Failed to load runes', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  private ensureRuneDefaults() {
    for (const f of this.runeFiles) {
      const d = f.data as RuneBlock;
      if (!d.statRequirements) d.statRequirements = {};
      if (!d.tags) d.tags = [];
      d.fokus ??= 0;
      d.fokusMult ??= 0;
      d.mana ??= 0;
      d.manaMult ??= 0;
      d.effektivitaet ??= 0;
    }
  }

  // ─── Auto-save ────────────────────────────────────────────────────────────

  onFieldChange(file: AssetFile) {
    const prev = this.saveTimers.get(file.id);
    if (prev) clearTimeout(prev);
    this.saveTimers.set(file.id, setTimeout(() => this.saveRune(file), 650));
  }

  async saveRune(file: AssetFile): Promise<void> {
    const saving = new Set(this.savingIds());
    saving.add(file.id);
    this.savingIds.set(saving);
    this.cdr.markForCheck();
    try {
      await firstValueFrom(
        this.api.updateFile(this.libraryId, file.id, {
          data: file.data,
          name: (file.data as RuneBlock).name || file.name,
        })
      );
    } catch (e) {
      console.error('[RuneTable] Save failed', e);
    } finally {
      const s2 = new Set(this.savingIds());
      s2.delete(file.id);
      this.savingIds.set(s2);
      this.cdr.markForCheck();
    }
  }

  // ─── Stat requirements helpers ────────────────────────────────────────────

  reqVal(file: AssetFile, key: keyof RuneStatRequirements): number {
    return (file.data as RuneBlock).statRequirements?.[key] ?? 0;
  }

  setReq(file: AssetFile, key: keyof RuneStatRequirements, value: number) {
    const rune = file.data as RuneBlock;
    if (!rune.statRequirements) rune.statRequirements = {};
    rune.statRequirements[key] = value || 0;
    this.onFieldChange(file);
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────

  tagsStr(file: AssetFile): string {
    return ((file.data as RuneBlock).tags ?? []).join(', ');
  }

  setTags(file: AssetFile, raw: string) {
    (file.data as RuneBlock).tags = raw.split(',').map(t => t.trim()).filter(Boolean);
    this.onFieldChange(file);
  }

  // ─── Upload ───────────────────────────────────────────────────────────────

  triggerUpload() {
    this.uploadInput.nativeElement.value = '';
    this.uploadInput.nativeElement.click();
  }

  async uploadRunes(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    this.uploading.set(true);
    this.cdr.markForCheck();

    for (const file of files) {
      try {
        const base64 = await this.readFileAsBase64(file);
        const imageId = await this.imageService.uploadImage(base64);
        const runeName = file.name.replace(/\.[^.]+$/, ''); // strip extension
        const newRune: RuneBlock = {
          name: runeName,
          description: '',
          drawing: imageId,
          tags: [],
          glowColor: '#ffffff',
          fokus: 0, fokusMult: 0,
          mana: 0, manaMult: 0,
          effektivitaet: 0,
          statRequirements: {},
          identified: true,
          learned: false,
          inputs: [
            { name: 'Medium', color: '#ec4899', types: ['Medium'] },
          ],
          outputs: [
            { name: 'Medium', color: '#ec4899', types: ['Medium'] },
          ],
        };
        const assetFile = await firstValueFrom(
          this.api.createFile(this.libraryId, runeName, 'rune', this.folderId, newRune)
        );
        if (!assetFile.data.statRequirements) assetFile.data.statRequirements = {};
        this.runeFiles = [...this.runeFiles, assetFile];
        this.filesChanged.emit();
      } catch (e) {
        console.error('[RuneTable] Upload failed for', file.name, e);
      }
    }

    this.uploading.set(false);
    this.cdr.markForCheck();
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async deleteRune(file: AssetFile): Promise<void> {
    if (!confirm(`Rune "${(file.data as RuneBlock).name || file.name}" wirklich löschen?`)) return;
    try {
      await firstValueFrom(this.api.deleteFile(this.libraryId, file.id));
      this.runeFiles = this.runeFiles.filter(f => f.id !== file.id);
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error('[RuneTable] Delete failed', e);
    }
  }

  // ─── Port helpers ─────────────────────────────────────────────────────────

  getPorts(file: AssetFile, dir: 'inputs' | 'outputs'): RuneDataLine[] {
    return (file.data as RuneBlock)[dir] ?? [];
  }

  addPresetPort(file: AssetFile, dir: 'inputs' | 'outputs', presetName: string) {
    const preset = this.presets.find(p => p.name === presetName);
    if (!preset) return;
    const rune = file.data as RuneBlock;
    if (!rune[dir]) rune[dir] = [];
    rune[dir]!.push({ name: preset.name, color: preset.color, types: [preset.type] });
    this.onFieldChange(file);
  }

  removePort(file: AssetFile, dir: 'inputs' | 'outputs', idx: number) {
    const rune = file.data as RuneBlock;
    if (!rune[dir]) return;
    rune[dir] = rune[dir]!.filter((_, i) => i !== idx);
    this.onFieldChange(file);
  }

  onAddPortSelect(event: Event, file: AssetFile, dir: 'inputs' | 'outputs') {
    const sel = event.target as HTMLSelectElement;
    const val = sel.value;
    sel.value = '';
    this.addPresetPort(file, dir, val);
  }
}
