import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import {
  ForgeTrait, MaterialBlock, WEAPON_CATEGORY_LABELS, WEAPON_TYPES, WeaponCategory,
  WEAPON_STAT_KEYS, WeaponStatKey,
} from '../../model/forging.model';
import { ItemBlock } from '../../model/item-block.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemComponent } from '../../sheet/item/item.component';
import {
  DEFAULT_GEAR_SETTINGS, GearGenSettings, GeneratedPiece, WeaponRequest,
  defaultBudgetForLevel, generateArmorSet, generateWeapons,
} from '../../utils/gear-generator.util';

/** A reusable material pool, saved per browser so the next NPC starts where the last one left off. */
interface SavedPool {
  name: string;
  materialIds: string[];
}

const POOL_STORAGE_KEY = 'gear-generator-pools';

/**
 * Ausrüstung generieren — the fast path next to the manual Schmiede. Rolls a full armour set (and
 * any number of weapons) from a material pool and a Schmiedepunkte budget, all seeded: moving a
 * slider re-derives everything from the SAME seed, so only what the slider controls changes.
 */
@Component({
  selector: 'app-gear-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemComponent],
  templateUrl: './gear-generator.component.html',
  styleUrl: './gear-generator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GearGeneratorComponent implements OnInit {
  /** Level of the NPC being outfitted — drives the default budget (level × 2 + 10). */
  @Input() level = 1;
  /** Shown in the header so the GM knows who they are forging for. */
  @Input() targetName = '';

  @Output() equip = new EventEmitter<ItemBlock[]>();
  @Output() close = new EventEmitter<void>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(true);
  activeTab: 'armor' | 'weapons' = 'armor';

  allMaterials: MaterialBlock[] = [];
  allTraits: ForgeTrait[] = [];

  settings: GearGenSettings = { ...DEFAULT_GEAR_SETTINGS };

  armorPieces: GeneratedPiece[] = [];
  weaponPieces: GeneratedPiece[] = [];
  weaponRequests: WeaponRequest[] = [];

  materialFilter = '';
  poolName = '';
  savedPools: SavedPool[] = [];

  /** Stub sheet so app-item renders like anywhere else; stats are high so no false red badges. */
  readonly previewSheet = (() => {
    const stat = () => ({ current: 999, base: 999, bonus: 0, free: 0, gain: 0 });
    return {
      statuses: [], skills: [], equipment: [], inventory: [],
      primary_class: '', secondary_class: '', level: 1,
      strength: stat(), dexterity: stat(), speed: stat(),
      intelligence: stat(), constitution: stat(), chill: stat(),
    } as unknown as CharacterSheet;
  })();

  readonly weaponTypes = WEAPON_TYPES;
  readonly weaponCategories: WeaponCategory[] = ['LEICHT', 'FERNKAMPF', 'SCHWER'];
  readonly categoryLabels = WEAPON_CATEGORY_LABELS;
  readonly statKeys = WEAPON_STAT_KEYS;

  async ngOnInit(): Promise<void> {
    this.settings = {
      ...DEFAULT_GEAR_SETTINGS,
      seed: Math.floor(Math.random() * 1_000_000),
      budget: defaultBudgetForLevel(this.level),
      poolIds: [],
    };
    this.savedPools = this.readPools();
    await this.loadLibrary();
    this.regenerate();
  }

  // ── Library ────────────────────────────────────────────────────────────────

  private async loadLibrary(): Promise<void> {
    this.isLoading.set(true);
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const materialFiles: AssetFile[] = [];
      const traitFiles: AssetFile[] = [];
      for (const lib of libraries) {
        const [mats, traits] = await Promise.all([
          firstValueFrom(this.api.searchFiles(lib.id, '', ['material'])),
          firstValueFrom(this.api.searchFiles(lib.id, '', ['forge-trait'])),
        ]);
        materialFiles.push(...mats);
        traitFiles.push(...traits);
      }
      this.allMaterials = materialFiles
        .map(f => ({ ...(f.data as MaterialBlock), id: (f.data as MaterialBlock).id || f.id }));
      this.allTraits = traitFiles
        .map(f => ({ ...(f.data as ForgeTrait), id: (f.data as ForgeTrait).id || f.id }));
    } catch (e) {
      console.error('Ausrüstungsgenerator: Bibliothek konnte nicht geladen werden', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // ── Material pool ──────────────────────────────────────────────────────────

  get filteredMaterials(): MaterialBlock[] {
    const q = this.materialFilter.trim().toLowerCase();
    return this.allMaterials
      .filter(m => !q || m.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  inPool(material: MaterialBlock): boolean {
    return this.settings.poolIds.includes(material.id);
  }

  togglePool(material: MaterialBlock): void {
    const ids = this.settings.poolIds;
    this.settings.poolIds = ids.includes(material.id)
      ? ids.filter(id => id !== material.id)
      : [...ids, material.id];
    this.regenerate();
  }

  clearPool(): void {
    this.settings.poolIds = [];
    this.regenerate();
  }

  // ── Saved pools ────────────────────────────────────────────────────────────

  private readPools(): SavedPool[] {
    try {
      const raw = localStorage.getItem(POOL_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedPool[]) : [];
    } catch {
      return [];
    }
  }

  private writePools(pools: SavedPool[]): void {
    this.savedPools = pools;
    try { localStorage.setItem(POOL_STORAGE_KEY, JSON.stringify(pools)); } catch { /* private mode */ }
  }

  savePool(): void {
    const name = this.poolName.trim();
    if (!name || !this.settings.poolIds.length) return;
    const pools = this.savedPools.filter(p => p.name !== name);
    this.writePools([...pools, { name, materialIds: [...this.settings.poolIds] }]);
    this.poolName = '';
  }

  loadPool(pool: SavedPool): void {
    this.settings.poolIds = [...pool.materialIds];
    this.regenerate();
  }

  deletePool(pool: SavedPool): void {
    this.writePools(this.savedPools.filter(p => p.name !== pool.name));
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  /** Any slider move re-derives from the same seed — nothing else shifts underfoot. */
  regenerate(): void {
    const ctx = { materials: this.allMaterials, traits: this.allTraits, settings: this.settings };
    this.armorPieces = generateArmorSet(ctx);
    this.weaponPieces = generateWeapons(ctx, this.weaponRequests);
    this.cdr.markForCheck();
  }

  rerollSeed(): void {
    this.settings.seed = Math.floor(Math.random() * 1_000_000);
    this.regenerate();
  }

  resetBudget(): void {
    this.settings.budget = defaultBudgetForLevel(this.level);
    this.regenerate();
  }

  // ── Weapons ────────────────────────────────────────────────────────────────

  addWeapon(): void {
    this.weaponRequests = [
      ...this.weaponRequests,
      {
        id: 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        weaponTypeName: WEAPON_TYPES[0].name,
        statRequirementKey: 'STR',
      },
    ];
    this.activeTab = 'weapons';
    this.regenerate();
  }

  removeWeapon(id: string): void {
    this.weaponRequests = this.weaponRequests.filter(r => r.id !== id);
    this.regenerate();
  }

  setWeaponType(request: WeaponRequest, name: string): void {
    request.weaponTypeName = name;
    this.regenerate();
  }

  setWeaponStat(request: WeaponRequest, key: WeaponStatKey): void {
    request.statRequirementKey = key;
    this.regenerate();
  }

  // ── Output ─────────────────────────────────────────────────────────────────

  /** Look the roll up by request id — a request without a usable material yields no piece,
   *  which would shift every later index if the template matched positionally. */
  weaponPieceFor(request: WeaponRequest): GeneratedPiece | undefined {
    return this.weaponPieces.find(p => p.key === 'weapon:' + request.id);
  }

  get allPieces(): GeneratedPiece[] {
    return [...this.armorPieces, ...this.weaponPieces];
  }

  get totalSpent(): number {
    return this.allPieces.reduce((sum, p) => sum + p.spent, 0);
  }

  applyAll(): void {
    if (!this.allPieces.length) return;
    this.equip.emit(this.allPieces.map(p => p.item));
    this.close.emit();
  }

  applyArmorOnly(): void {
    if (!this.armorPieces.length) return;
    this.equip.emit(this.armorPieces.map(p => p.item));
    this.close.emit();
  }

  onClose(): void { this.close.emit(); }

  // ── Display helpers ────────────────────────────────────────────────────────

  traitLine(piece: GeneratedPiece): string {
    return piece.traitNames.join(', ');
  }

  materialLine(piece: GeneratedPiece): string {
    const parts = [piece.primaryName];
    if (piece.secondaryName) parts.push(`½ ${piece.secondaryName}`);
    if (piece.bonusName) parts.push(`+ ${piece.bonusName}`);
    return parts.join(' · ');
  }
}
