import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  inject, signal, ChangeDetectorRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import { MaterialBlock, MaterialStats, createEmptyMaterialBlock } from '../../model/forging.model';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialTableComponent implements OnInit, OnDestroy {
  @Input() libraryId!: string;
  @Input() folderId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() filesChanged = new EventEmitter<void>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  materialFiles: AssetFile[] = [];
  isLoading = signal(false);
  savingIds = signal(new Set<string>());
  addingNew = signal(false);
  newName = '';

  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

  ngOnInit() { this.loadMaterials(); }

  ngOnDestroy() {
    for (const t of this.saveTimers.values()) clearTimeout(t);
  }

  async loadMaterials(): Promise<void> {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(
        this.api.getFolderContents(this.libraryId, this.folderId)
      );
      this.materialFiles = (contents.files ?? []).filter(f => f.type === 'material');
      this.ensureDefaults();
    } catch (e) {
      console.error('[MaterialTable] Failed to load materials', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  private ensureDefaults() {
    for (const f of this.materialFiles) {
      const d = f.data as MaterialBlock;
      d.isPublic ??= false;
      d.canBeWeaponMaterial ??= false;
      d.canBeArmorMaterial ??= false;
      if (d.canBeWeaponMaterial && !d.weaponStats) d.weaponStats = this.defaultWeaponStats();
      if (d.canBeArmorMaterial && !d.armorStats) d.armorStats = this.defaultArmorStats();
      // Always keep stats initialized so user can toggle freely
      if (!d.weaponStats) d.weaponStats = this.defaultWeaponStats();
      if (!d.armorStats) d.armorStats = this.defaultArmorStats();
    }
  }

  private defaultWeaponStats(): MaterialStats {
    return { haltbarkeit: 50, haltbarkeitSkalierung: 10, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: '', weight: 1, reqBase: 0, reqScaling: 0 };
  }

  private defaultArmorStats(): MaterialStats {
    return { haltbarkeit: 80, haltbarkeitSkalierung: 15, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: '', weight: 2, ruestungsmalus: 0, reqBase: 0, reqScaling: 0 };
  }

  // ─── Auto-save ────────────────────────────────────────────────────────────

  onFieldChange(file: AssetFile) {
    const prev = this.saveTimers.get(file.id);
    if (prev) clearTimeout(prev);
    this.saveTimers.set(file.id, setTimeout(() => this.saveMaterial(file), 650));
  }

  async saveMaterial(file: AssetFile): Promise<void> {
    const saving = new Set(this.savingIds());
    saving.add(file.id);
    this.savingIds.set(saving);
    this.cdr.markForCheck();
    try {
      await firstValueFrom(
        this.api.updateFile(this.libraryId, file.id, {
          data: file.data,
          name: (file.data as MaterialBlock).name || file.name,
        })
      );
    } catch (e) {
      console.error('[MaterialTable] Save failed', e);
    } finally {
      const s2 = new Set(this.savingIds());
      s2.delete(file.id);
      this.savingIds.set(s2);
      this.cdr.markForCheck();
    }
  }

  // ─── Add new material ─────────────────────────────────────────────────────

  startAdding() {
    this.newName = '';
    this.addingNew.set(true);
    this.cdr.markForCheck();
  }

  cancelAdding() {
    this.addingNew.set(false);
    this.newName = '';
  }

  async confirmAdd(): Promise<void> {
    const name = this.newName.trim() || 'Neues Material';
    this.addingNew.set(false);
    const block = createEmptyMaterialBlock();
    block.name = name;
    try {
      const file = await firstValueFrom(
        this.api.createFile(this.libraryId, name, 'material', this.folderId, block)
      );
      // Ensure stats are initialized
      if (!file.data.weaponStats) file.data.weaponStats = this.defaultWeaponStats();
      if (!file.data.armorStats) file.data.armorStats = this.defaultArmorStats();
      this.materialFiles = [...this.materialFiles, file];
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error('[MaterialTable] Create failed', e);
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async deleteMaterial(file: AssetFile): Promise<void> {
    if (!confirm(`Material "${(file.data as MaterialBlock).name}" löschen?`)) return;
    try {
      await firstValueFrom(this.api.deleteFile(this.libraryId, file.id));
      this.materialFiles = this.materialFiles.filter(f => f.id !== file.id);
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error('[MaterialTable] Delete failed', e);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  mat(file: AssetFile): MaterialBlock { return file.data as MaterialBlock; }

  ws(file: AssetFile): MaterialStats { return (file.data as MaterialBlock).weaponStats!; }
  aStats(file: AssetFile): MaterialStats { return (file.data as MaterialBlock).armorStats!; }
}
