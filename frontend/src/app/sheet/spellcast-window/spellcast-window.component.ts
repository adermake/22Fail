import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EventEmitter, HostListener, inject, Input, OnChanges, OnInit, Output, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SpellBlock, CastingSpellEntry, generateSpellId } from '../../model/spell-block-model';
import { JsonPatch } from '../../model/json-patch.model';
import { KeywordEnhancer } from '../keyword-enhancer';
import { ImageService } from '../../services/image.service';

interface FloatingRune {
  id: number;
  symbol: string;
  x: number;   // % from left
  y: number;   // % from top
  size: number; // px
  opacity: number;
  speed: number; // animation duration s
  delay: number;
  color: string;
}

interface PortalRune {
  id: number;
  drawing: string | null; // resolved URL (via ImageService) or null
  symbol: string;         // fallback unicode glyph
  color: string;
  x: number;    // % from left
  y: number;    // % from top
  size: number; // px
  speed: number;
  delay: number;
  opacity: number;
}

/** Positions distributed around screen edges, avoiding the central card area */
const PORTAL_POSITIONS = [
  { x: 4,  y: 8  }, { x: 86, y: 6  }, { x: 4,  y: 50 }, { x: 90, y: 52 },
  { x: 12, y: 84 }, { x: 82, y: 86 }, { x: 42, y: 3  }, { x: 52, y: 91 },
  { x: 8,  y: 28 }, { x: 86, y: 30 }, { x: 18, y: 72 }, { x: 76, y: 75 },
  { x: 38, y: 5  }, { x: 60, y: 7  }, { x: 6,  y: 68 }, { x: 88, y: 70 },
];

const RUNE_SYMBOLS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];

@Component({
  selector: 'app-spellcast-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spellcast-window.component.html',
  styleUrl: './spellcast-window.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellcastWindowComponent implements OnInit, OnChanges {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() close = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);
  private _sanitizer = inject(DomSanitizer);
  private _imageService = inject(ImageService);
  protected readonly Math = Math;

  floatingRunes: FloatingRune[] = [];
  private runeIdCounter = 0;
  private _portalRunes: PortalRune[] = [];
  get portalRunes(): PortalRune[] { return this._portalRunes; }

  // ── Pending cast state ────────────────────────────────────────────────────
  pendingCastSpell: SpellBlock | null = null;
  pendingCastLevel = 0;
  skalierung = 1;

  // ── Data accessors ────────────────────────────────────────────────────────

  get availableSpells(): SpellBlock[] {
    return this.sheet.spells || [];
  }

  get castingSpells(): CastingSpellEntry[] {
    return this.sheet.castingSpells || [];
  }

  get manaCurrent(): number {
    return this.sheet.statuses?.find(s => s.statusName === 'Mana')?.statusCurrent ?? 0;
  }

  get manaMax(): number {
    return this.sheet.statuses?.find(s => s.statusName === 'Mana')?.statusBase ?? 100;
  }

  get manaPercent(): number {
    const max = this.manaMax;
    return max ? Math.min(100, Math.round((this.manaCurrent / max) * 100)) : 0;
  }

  get fokusMax(): number {
    const intelligence = this.sheet.intelligence?.current || 10;
    const base = Math.floor(intelligence / 2) + 5;
    return Math.floor((base + (this.sheet.fokusBonus || 0)) * (this.sheet.fokusMultiplier || 1));
  }

  get fokusUsed(): number {
    return this.castingSpells.reduce((sum, entry) => {
      const spell = this.availableSpells.find(s => s.id === entry.spellId);
      if (!spell) return sum;
      return sum + (spell.perTurnFokus || spell.costFokus || 0);
    }, 0);
  }

  get fokusPercent(): number {
    const max = this.fokusMax;
    return max ? Math.min(100, Math.round((this.fokusUsed / max) * 100)) : 0;
  }

  isActivelyCasting(spell: SpellBlock): boolean {
    return this.castingSpells.some(e => e.spellId === spell.id);
  }

  getActiveCast(spell: SpellBlock): CastingSpellEntry | undefined {
    return this.castingSpells.find(e => e.spellId === spell.id);
  }

  getSpell(spellId: string): SpellBlock | undefined {
    return this.availableSpells.find(s => s.id === spellId);
  }

  spellColor(spell: SpellBlock): string {
    return spell.strokeColor || '#8b5cf6';
  }

  costLabel(spell: SpellBlock): string {
    const parts: string[] = [];
    if (spell.costMana)  parts.push(`${spell.costMana}M`);
    if (spell.costFokus) parts.push(`${spell.costFokus}F`);
    return parts.join(' ');
  }

  perTurnLabel(spell: SpellBlock): string {
    const parts: string[] = [];
    if (spell.perTurnMana)  parts.push(`${spell.perTurnMana}M`);
    if (spell.perTurnFokus) parts.push(`${spell.perTurnFokus}F`);
    return parts.length ? parts.join(' ') + '/Rd' : '';
  }

  reductionLabel(castLevel: number): string {
    const pct = Math.min(90, Math.floor((castLevel || 0) / 10) * 10);
    return pct > 0 ? `-${pct}%` : '';
  }

  // ── Spell stat helpers ────────────────────────────────────────────────────

  spellStatReqs(spell: SpellBlock): { key: string; label: string; value: number }[] {
    const req = spell.statRequirements;
    if (!req) return [];
    const map = [
      { key: 'strength',     label: 'STR' },
      { key: 'dexterity',    label: 'GES' },
      { key: 'speed',        label: 'SPD' },
      { key: 'intelligence', label: 'INT' },
      { key: 'constitution', label: 'KON' },
      { key: 'chill',        label: 'CHR' },
    ];
    return map
      .filter(m => (req as Record<string, number>)[m.key] > 0)
      .map(m => ({ key: m.key, label: m.label, value: (req as Record<string, number>)[m.key] }));
  }

  spellMeetsStat(key: string, value: number): boolean {
    const stat = (this.sheet as any)[key];
    const current = stat?.current ?? 0;
    return current >= value;
  }

  castLevelMeetsReq(key: string, value: number): boolean {
    const stat = (this.sheet as any)[key];
    const current = stat?.current ?? 0;
    // Each 10 cast levels adds 1 effective stat point
    return current + Math.floor(this.pendingCastLevel / 10) >= value;
  }

  castLevelForReq(key: string, value: number): number {
    const stat = (this.sheet as any)[key];
    const current = stat?.current ?? 0;
    if (current >= value) return 0;
    return Math.max(0, (value - current) * 10);
  }

  get castLevelMarkers(): { key: string; label: string; level: number }[] {
    if (!this.pendingCastSpell?.statRequirements) return [];
    return this.spellStatReqs(this.pendingCastSpell)
      .filter(req => !this.spellMeetsStat(req.key, req.value))
      .map(req => ({ key: req.key, label: req.label, level: this.castLevelForReq(req.key, req.value) }))
      .filter(m => m.level <= 100);
  }

  // ── Resource impact computations ──────────────────────────────────────────

  get fokusAvailable(): number {
    return Math.max(0, this.fokusMax - this.fokusUsed);
  }

  get fokusAvailPercent(): number {
    return this.fokusMax > 0 ? Math.min(100, Math.round((this.fokusAvailable / this.fokusMax) * 100)) : 0;
  }

  pendingCostManaTotal(): number {
    const spell = this.pendingCastSpell;
    if (!spell) return 0;
    const base = spell.costMana || 0;
    const reduction = Math.min(0.9, Math.floor(this.pendingCastLevel / 10) * 0.1);
    return Math.round(base * (1 - reduction) * this.skalierung * 100) / 100;
  }

  pendingCostFokusTotal(): number {
    const spell = this.pendingCastSpell;
    if (!spell) return 0;
    const base = spell.costFokus || 0;
    const reduction = Math.min(0.9, Math.floor(this.pendingCastLevel / 10) * 0.1);
    return Math.round(base * (1 - reduction) * this.skalierung * 100) / 100;
  }

  manaAfterCast(): number {
    return this.manaCurrent - this.pendingCostManaTotal();
  }

  fokusAfterCast(): number {
    return this.fokusAvailable - this.pendingCostFokusTotal();
  }

  get manaAfterPercent(): number {
    const after = Math.max(0, this.manaAfterCast());
    return this.manaMax > 0 ? Math.round((after / this.manaMax) * 100) : 0;
  }

  get manaCostPercent(): number {
    return this.manaMax > 0 ? Math.min(100, Math.round((this.pendingCostManaTotal() / this.manaMax) * 100)) : 0;
  }

  get fokusAfterPercent(): number {
    const after = Math.max(0, this.fokusAfterCast());
    return this.fokusMax > 0 ? Math.round((after / this.fokusMax) * 100) : 0;
  }

  get fokusCostPercent(): number {
    return this.fokusMax > 0 ? Math.min(100, Math.round((this.pendingCostFokusTotal() / this.fokusMax) * 100)) : 0;
  }

  get skalerungStars(): number[] {
    return Array.from({ length: Math.min(9, Math.floor(this.skalierung - 1)) });
  }

  // ── Cast confirmation popup ───────────────────────────────────────────────

  get showCastConfirm(): boolean { return this.pendingCastSpell !== null; }

  requestCast(spell: SpellBlock): void {
    if (this.isActivelyCasting(spell)) return;
    this.pendingCastSpell = spell;
    this.pendingCastLevel = 0;
    this.skalierung = 1;
    this._computePortalRunes(spell);
    this.cdr.markForCheck();
  }

  cancelCast(): void {
    this.pendingCastSpell = null;
    this._portalRunes = [];
    this.cdr.markForCheck();
  }

  confirmCast(): void {
    const spell = this.pendingCastSpell;
    if (!spell) return;
    const sk = this.skalierung;
    const cl = this.pendingCastLevel;
    this.pendingCastSpell = null;
    this._portalRunes = [];
    this.castSpell(spell, cl, sk);
    this.cdr.markForCheck();
  }

  enhancedSpellDesc(spell: SpellBlock): SafeHtml {
    const enhanced = KeywordEnhancer.enhance(spell.description || '');
    return this._sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  private _computePortalRunes(spell: SpellBlock): void {
    const runeByName = new Map(
      (this.sheet.runes || []).filter(r => r !== null).map(r => [r!.name, r!])
    );
    const nodes = spell.graph?.nodes || [];
    const positions = PORTAL_POSITIONS;
    // Use at least 8 rune glyphs, up to positions.length
    const useCount = Math.min(positions.length, Math.max(nodes.length > 0 ? nodes.length : 0, 8));
    const speeds  = [12, 9, 14, 11, 8, 13, 10, 15, 12, 9, 11, 14, 8, 13, 10, 12];
    const delays  = [0, -4, -8, -2, -6, -10, -3, -7, -1, -5, -9, -2, -6, -4, -8, -3];
    const sizes   = [52, 38, 56, 42, 46, 40, 58, 44, 48, 36, 52, 40, 46, 42, 50, 38];
    const opacities = [0.6, 0.5, 0.65, 0.55, 0.45, 0.6, 0.5, 0.55, 0.65, 0.45, 0.55, 0.6, 0.5, 0.65, 0.55, 0.45];
    this._portalRunes = [];
    for (let i = 0; i < useCount; i++) {
      const nodeIdx = nodes.length > 0 ? (i % nodes.length) : -1;
      const node = nodeIdx >= 0 ? nodes[nodeIdx] : null;
      const rune = node ? runeByName.get(node.runeId) : null;
      const color = rune?.glowColor || spell.strokeColor || '#8b5cf6';
      const drawingUrl = rune?.drawing ? this._imageService.getImageUrl(rune.drawing) : null;
      const pos = positions[i % positions.length];
      this._portalRunes.push({
        id: i,
        drawing: drawingUrl,
        symbol: rune
          ? (rune.name?.charAt(0)?.toUpperCase() ?? '✦')
          : RUNE_SYMBOLS[i % RUNE_SYMBOLS.length],
        color,
        x: pos.x,
        y: pos.y,
        size: sizes[i % 16],
        speed: speeds[i % 16],
        delay: delays[i % 16],
        opacity: opacities[i % 16],
      });
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  castSpell(spell: SpellBlock, castLevel = 0, skalierung = 1): void {
    const entryId = `${spell.id || generateSpellId()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: CastingSpellEntry = {
      spellId: spell.id || generateSpellId(),
      spellName: spell.name,
      castLevel,
      entryId,
      skalierung: skalierung !== 1 ? skalierung : undefined,
    };
    const updated = [...this.castingSpells, entry];
    this.sheet.castingSpells = updated;
    this.patch.emit({ path: 'castingSpells', value: updated });
    this._spawnRunesForSpell(spell);
    this.cdr.markForCheck();
  }

  incrementCastLevel(entry: CastingSpellEntry): void {
    entry.castLevel = (entry.castLevel || 0) + 1;
    this._patchCasting();
  }

  decrementCastLevel(entry: CastingSpellEntry): void {
    entry.castLevel = Math.max(0, (entry.castLevel || 0) - 1);
    this._patchCasting();
  }

  stopCasting(entry: CastingSpellEntry): void {
    const updated = entry.entryId
      ? this.castingSpells.filter(e => e.entryId !== entry.entryId)
      : this.castingSpells.filter(e => e.spellId !== entry.spellId);
    this.sheet.castingSpells = updated;
    this._patchCasting();
    this.cdr.markForCheck();
  }

  private _patchCasting(): void {
    this.patch.emit({ path: 'castingSpells', value: [...this.castingSpells] });
    this.cdr.markForCheck();
  }

  /** Adjust a counter on a spell's definition and sync via patch */
  adjustCounter(spellId: string, counterIndex: number, newValue: number): void {
    const spells = [...(this.sheet.spells || [])];
    const idx = spells.findIndex(s => s.id === spellId);
    if (idx < 0) return;
    const spell = { ...spells[idx] };
    if (!spell.counters || counterIndex >= spell.counters.length) return;
    spell.counters = spell.counters.map((c, i) =>
      i === counterIndex ? { ...c, current: Math.max(c.min, Math.min(c.max, newValue)) } : c
    );
    spells[idx] = spell;
    this.sheet.spells = spells;
    this.patch.emit({ path: 'spells', value: spells });
    this.cdr.markForCheck();
  }

  // ── Floating runes ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this._generateAmbientRunes();
  }

  ngOnChanges(_: SimpleChanges): void {
    this.cdr.markForCheck();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  private _generateAmbientRunes(): void {
    const count = 18;
    for (let i = 0; i < count; i++) {
      this.floatingRunes.push(this._makeRune());
    }
  }

  private _spawnRunesForSpell(spell: SpellBlock): void {
    const color = spell.strokeColor || '#8b5cf6';
    for (let i = 0; i < 5; i++) {
      this.floatingRunes.push(this._makeRune(color));
    }
    // cap total
    if (this.floatingRunes.length > 40) {
      this.floatingRunes = this.floatingRunes.slice(-40);
    }
    this.cdr.markForCheck();
  }

  private _makeRune(color?: string): FloatingRune {
    const colors = ['#8b5cf6','#3b82f6','#06b6d4','#ec4899','#a78bfa'];
    return {
      id: this.runeIdCounter++,
      symbol: RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)],
      x: Math.random() * 95,
      y: Math.random() * 95,
      size: 14 + Math.floor(Math.random() * 28),
      opacity: 0.05 + Math.random() * 0.15,
      speed: 8 + Math.random() * 14,
      delay: Math.random() * -12,
      color: color || colors[Math.floor(Math.random() * colors.length)],
    };
  }
}
