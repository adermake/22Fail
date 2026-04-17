import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EventEmitter, HostListener, inject, Input, OnChanges, OnInit, Output, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SpellBlock, CastingSpellEntry, generateSpellId } from '../../model/spell-block-model';
import { JsonPatch } from '../../model/json-patch.model';

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

const RUNE_SYMBOLS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];

@Component({
  selector: 'app-spellcast-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spellcast-window.component.html',
  styleUrl: './spellcast-window.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellcastWindowComponent implements OnInit, OnChanges {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() close = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);

  floatingRunes: FloatingRune[] = [];
  private runeIdCounter = 0;

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
      const c = spell.costSchedule?.cases?.[0]?.turns?.[0];
      return sum + (c ? c.fokus : (spell.costFokus || 0));
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
    const c = spell.costSchedule?.cases?.[0]?.turns?.[0];
    if (c) {
      const parts: string[] = [];
      if (c.mana)  parts.push(`${c.mana}M`);
      if (c.fokus) parts.push(`${c.fokus}F`);
      return parts.join(' ');
    }
    const parts: string[] = [];
    if (spell.costMana)  parts.push(`${spell.costMana}M`);
    if (spell.costFokus) parts.push(`${spell.costFokus}F`);
    return parts.join(' ');
  }

  reductionLabel(castLevel: number): string {
    const pct = Math.min(90, Math.floor((castLevel || 0) / 10) * 10);
    return pct > 0 ? `-${pct}%` : '';
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  castSpell(spell: SpellBlock): void {
    if (this.isActivelyCasting(spell)) return;
    const entry: CastingSpellEntry = {
      spellId: spell.id || generateSpellId(),
      spellName: spell.name,
      castLevel: 0,
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
    const updated = this.castingSpells.filter(e => e.spellId !== entry.spellId);
    this.sheet.castingSpells = updated;
    this._patchCasting();
    this.cdr.markForCheck();
  }

  private _patchCasting(): void {
    this.patch.emit({ path: 'castingSpells', value: [...this.castingSpells] });
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
