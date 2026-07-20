import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input,
  OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, placeholder as cmPlaceholder } from '@codemirror/view';
import { history, historyKeymap, defaultKeymap, indentWithTab } from '@codemirror/commands';
import { acceptCompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, indentOnInput } from '@codemirror/language';

import { failscriptExtensions, formatFailScript } from './failscript-cm';
import { BUILTINS, KEYWORD_INFO, SYMBOLS, TALENT_INFO } from '../symbols';
import { runScript, ScriptResult, CharacterContext } from '../interpreter';

interface RefItem { label: string; detail?: string; info?: string; insert: string; }
interface RefGroup { title: string; items: RefItem[]; }

/**
 * FailScript code editor: a CodeMirror 6 surface plus a browsable reference panel. The
 * panel and autocomplete are fed from the same symbol table, so "everything you can write"
 * is discoverable. Emits `valueChange` as the user types.
 */
@Component({
  selector: 'app-script-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="se-wrap" (keydown)="$event.stopPropagation()" (copy)="$event.stopPropagation()" (cut)="$event.stopPropagation()" (paste)="$event.stopPropagation()">
      <div class="se-main">
        <div class="se-editor" #host></div>
        <div class="se-toolbar">
          <button class="se-test-btn" type="button" (click)="runTest()">▶ Testlauf</button>
          <label class="se-num">Stapel <input type="number" min="0" [(ngModel)]="testStacks"></label>
          <label class="se-num">Dauer <input type="number" min="0" [(ngModel)]="testDuration"></label>
          <span class="se-hint">Tab: Vervollständigen · Strg+Shift+F: Formatieren</span>
        </div>
        @if (testResult) {
          <div class="se-test-result">
            <div class="se-test-head">
              <span>Testlauf (Dummy-Charakter)</span>
              <button type="button" (click)="testResult = null">✕</button>
            </div>
            @if (testResult.errors.length) {
              @for (e of testResult.errors; track $index) { <div class="se-test-err">⚠ {{ e }}</div> }
            } @else {
              @if (!testResult.displays.length && !testResult.resourceChanges.length && !testResult.rolls.length) {
                <div class="se-test-empty">Läuft — keine sichtbare Ausgabe.</div>
              }
              @for (d of testResult.displays; track $index) {
                @switch (d.type) {
                  @case ('banner') { <div class="ds-banner" [ngClass]="'ds-' + d.style">{{ d.text }}</div> }
                  @case ('stat') { <div class="ds-stat" [ngClass]="'ds-' + d.style"><span class="ds-lbl">{{ d.label }}</span><span class="ds-val">{{ d.value }}</span></div> }
                  @case ('box') { <div class="ds-boxrow"><span class="ds-box" [ngClass]="'ds-' + d.style">{{ d.text }}</span></div> }
                  @default { <div class="ds-text" [ngClass]="'ds-' + d.style">{{ d.text }}</div> }
                }
              }
              @for (rc of testResult.resourceChanges; track $index) {
                <div class="se-test-res" [class.gain]="rc.amount > 0" [class.loss]="rc.amount < 0">{{ rc.resource }}: {{ rc.amount > 0 ? '+' : '' }}{{ rc.amount }}</div>
              }
              @if (testResult.rolls.length) {
                <div class="se-test-rolls">🎲 @for (r of testResult.rolls; track $index) { <span>{{ r.formula }}=<b>{{ r.total }}</b></span> }</div>
              }
              @if (testResult.modifiers.length || testResult.grantedSkills.length || testResult.statusOps.length) {
                <div class="se-test-extra">
                  @for (m of testResult.modifiers; track $index) { <span title="Wirkt, solange der Effekt aktiv ist">⟳ {{ m.target }} {{ opSign(m.op) }} {{ m.amount }}</span> }
                  @for (g of testResult.grantedSkills; track $index) { <span>✚ {{ g.name }}</span> }
                  @for (o of testResult.statusOps; track $index) { <span>{{ o.op === 'apply' ? '＋' : '－' }} {{ o.id }}</span> }
                </div>
              }
            }
          </div>
        }
      </div>
      <div class="se-ref" [class.collapsed]="!refOpen()">
        <button class="se-ref-toggle" (click)="refOpen.set(!refOpen())" type="button">
          {{ refOpen() ? '›' : '‹' }} Hilfe
        </button>
        @if (refOpen()) {
          <div class="se-ref-body">
            <input class="se-ref-search" type="text" placeholder="Suchen…"
                   [value]="search()" (input)="search.set($any($event.target).value)" />
            @for (group of filteredGroups(); track group.title) {
              <div class="se-ref-group">
                <div class="se-ref-group-title">{{ group.title }}</div>
                @for (item of group.items; track item.label) {
                  <button class="se-ref-item" type="button" (click)="insert(item.insert)"
                          [title]="item.info || ''">
                    <span class="se-ref-label">{{ item.label }}</span>
                    @if (item.detail) { <span class="se-ref-detail">{{ item.detail }}</span> }
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .se-wrap { display: flex; height: 100%; min-height: 260px; border: 1px solid var(--border, #374151); border-radius: 8px; overflow: hidden; background: #0f172a; }
    .se-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .se-editor { flex: 1; min-width: 0; overflow: hidden; }
    .se-toolbar { flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: 4px 8px; background: #0b1220; border-top: 1px solid #1f2937; }
    .se-test-btn { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color: #86efac; font-weight: 700; font-size: 0.72rem; padding: 3px 12px; border-radius: 6px; cursor: pointer; }
    .se-test-btn:hover { background: rgba(34,197,94,0.28); }
    .se-num { font-size: 0.68rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
    .se-num input { width: 46px; background: #111827; border: 1px solid #374151; border-radius: 5px; color: #e5e7eb; padding: 2px 4px; font-size: 0.72rem; }
    .se-hint { flex-shrink: 0; font-size: 0.66rem; color: #6b7280; margin-left: auto; }
    .se-test-result { flex-shrink: 0; max-height: 40%; overflow-y: auto; padding: 6px 8px; background: #0f172a; border-top: 1px solid #1f2937; display: flex; flex-direction: column; gap: 5px; }
    .se-test-head { display: flex; justify-content: space-between; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
    .se-test-head button { background: none; border: none; color: #6b7280; cursor: pointer; }
    .se-test-err { font-size: 0.74rem; color: #fca5a5; }
    .se-test-empty { font-size: 0.72rem; color: #6b7280; font-style: italic; }
    .se-test-res { font-size: 0.74rem; }
    .se-test-res.gain { color: #22c55e; } .se-test-res.loss { color: #ef4444; }
    .se-test-rolls { font-size: 0.7rem; color: #fbbf24; display: flex; flex-wrap: wrap; gap: 8px; }
    .se-test-extra { font-size: 0.7rem; color: #93c5fd; display: flex; flex-wrap: wrap; gap: 8px; }
    /* Display primitives preview */
    .ds-text { font-size: 0.78rem; padding: 4px 8px; border-radius: 6px; border-left: 3px solid; }
    .ds-banner { font-size: 0.9rem; font-weight: 800; text-align: center; padding: 6px 8px; border-radius: 6px; }
    .ds-stat { display: flex; justify-content: space-between; gap: 8px; font-size: 0.78rem; padding: 4px 8px; border-radius: 6px; border-left: 3px solid; }
    .ds-stat .ds-val { font-weight: 800; }
    .ds-boxrow { display: flex; }
    .ds-box { display: inline-block; font-weight: 800; padding: 3px 12px; border-radius: 6px; border: 2px solid; }
    .ds-good { background: rgba(34,197,94,0.14); border-color: #22c55e; color: #86efac; }
    .ds-bad { background: rgba(239,68,68,0.14); border-color: #ef4444; color: #fca5a5; }
    .ds-info { background: rgba(59,130,246,0.14); border-color: #3b82f6; color: #93c5fd; }
    .ds-neutral { background: rgba(148,163,184,0.12); border-color: #94a3b8; color: #e5e7eb; }
    .se-ref { width: 240px; flex-shrink: 0; border-left: 1px solid var(--border, #374151); background: #111827; display: flex; flex-direction: column; }
    .se-ref.collapsed { width: 64px; }
    .se-ref-toggle { background: #1f2937; color: #e5e7eb; border: none; border-bottom: 1px solid #374151; padding: 6px 8px; cursor: pointer; text-align: left; font-size: 0.75rem; }
    .se-ref-body { overflow-y: auto; padding: 6px; }
    .se-ref-search { width: 100%; box-sizing: border-box; margin-bottom: 6px; padding: 4px 6px; background: #0b1220; border: 1px solid #374151; border-radius: 5px; color: #e5e7eb; font-size: 0.72rem; }
    .se-ref-group { margin-bottom: 8px; }
    .se-ref-group-title { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; margin: 4px 0 2px; }
    .se-ref-item { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; width: 100%; text-align: left; background: none; border: none; color: #cbd5e1; padding: 3px 5px; border-radius: 4px; cursor: pointer; font-size: 0.72rem; font-family: ui-monospace, monospace; }
    .se-ref-item:hover { background: #1f2937; color: #fff; }
    .se-ref-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .se-ref-detail { color: #6b7280; font-size: 0.62rem; flex-shrink: 0; }
  `],
})
export class ScriptEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() value = '';
  @Input() placeholder = '// Skript … Tippe für Autovervollständigung';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private view?: EditorView;
  refOpen = signal(true);
  search = signal('');

  // Test-run against a dummy character.
  testStacks = 1;
  testDuration = 3;
  testResult: ScriptResult | null = null;

  /** Run the current script against a dummy character to preview behaviour + look. */
  runTest(): void {
    const src = this.view?.state.doc.toString() ?? this.value ?? '';
    const dummy: Record<string, number> = {
      health: 50, healthMax: 50, energy: 40, energyMax: 40, mana: 30, manaMax: 30, fokus: 10, fokusMax: 10,
      strength: 12, dexterity: 10, speed: 14, intelligence: 12, constitution: 11, wille: 10,
      level: 5, movement: 8, grundbonus: 1, reaktion: 9, effectiveSpeed: 14, baseSpeed: 14,
      totalArmorDebuff: 0, speedPenaltyNegation: 0, armorMalus: 0, armorNegation: 0,
      encumbrancePercent: 40, totalWeight: 20, maxCapacity: 96,
      copper: 10, silver: 5, gold: 1, platinum: 0,
      stacks: this.testStacks || 0, turn: 1, duration: this.testDuration || 0, effectStrength: 5,
    };
    const ctx: CharacterContext = {
      readScalar: n => dummy[n] ?? 0,
      readAttributeMember: (a, p) => p === 'modifier' ? Math.floor(((dummy[a] ?? 10) - 10) / 2) : (dummy[a] ?? 0),
      readTalent: () => 0,
      hasSkill: () => true,
      inCombat: () => true,
      rng: Math.random,
    };
    // Trigger run = the one-shot output (dice/display/resources). Then a collect run to
    // preview the continuous effectActive contribution (stat modifiers + granted skills).
    const trigger = runScript(src, ctx);
    const collected = runScript(src, ctx, { collect: true });
    trigger.modifiers = collected.modifiers;
    trigger.grantedSkills = collected.grantedSkills;
    this.testResult = trigger;
  }

  opSign(op: string): string {
    return op === 'add' ? '+' : op === 'sub' ? '−' : op === 'mul' ? '×' : op === 'div' ? '÷' : '=';
  }

  private readonly groups: RefGroup[] = this.buildGroups();

  ngAfterViewInit(): void {
    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      cmPlaceholder(this.placeholder),
      ...failscriptExtensions(),
      keymap.of([
        { key: 'Tab', run: acceptCompletion },
        {
          key: 'Mod-Shift-f',
          preventDefault: true,
          run: v => {
            const formatted = formatFailScript(v.state.doc.toString());
            const sel = v.state.selection.main.head;
            v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: formatted }, selection: { anchor: Math.min(sel, formatted.length) } });
            return true;
          },
        },
        indentWithTab,
        ...closeBracketsKeymap,
        ...completionKeymap,
        ...historyKeymap,
        ...defaultKeymap,
      ]),
      EditorView.updateListener.of(u => {
        if (u.docChanged) {
          const doc = u.state.doc.toString();
          if (doc !== this.value) { this.value = doc; this.valueChange.emit(doc); }
        }
      }),
    ];
    this.view = new EditorView({
      state: EditorState.create({ doc: this.value ?? '', extensions }),
      parent: this.host.nativeElement,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.view) {
      const current = this.view.state.doc.toString();
      if (this.value !== current) {
        this.view.dispatch({ changes: { from: 0, to: current.length, insert: this.value ?? '' } });
      }
    }
  }

  ngOnDestroy(): void { this.view?.destroy(); }

  insert(text: string): void {
    const view = this.view;
    if (!view) return;
    const pos = view.state.selection.main.head;
    view.dispatch({ changes: { from: pos, insert: text }, selection: { anchor: pos + text.length } });
    view.focus();
  }

  filteredGroups(): RefGroup[] {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.groups;
    return this.groups
      .map(g => ({ title: g.title, items: g.items.filter(i => i.label.toLowerCase().includes(q) || (i.info ?? '').toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0);
  }

  private buildGroups(): RefGroup[] {
    const byCat = (cat: string) => SYMBOLS.filter(s => s.category === cat)
      .map(s => ({ label: s.name, detail: undefined, info: s.description, insert: s.name }));
    return [
      { title: 'Attribute', items: SYMBOLS.filter(s => s.category === 'attribute').map(s => ({ label: s.name, info: s.description, insert: s.name })) },
      { title: 'Ressourcen', items: byCat('resource') },
      { title: 'Abgeleitet', items: byCat('derived') },
      { title: 'Stufe/Klasse', items: [...byCat('level'), ...byCat('class')] },
      { title: 'Währung', items: byCat('currency') },
      { title: 'Talente', items: TALENT_INFO.map(t => ({ label: `talent.${t.id}`, detail: t.statLabel, info: `${t.name} — ${t.description}`, insert: `talent.${t.id}` })) },
      { title: 'Anzeige', items: [
        { label: 'display', detail: 'text, style?', info: 'Textzeile. Stil optional: good/bad/neutral/info', insert: 'display("Text", bad)' },
        { label: 'banner', detail: 'text, style?', info: 'Große Überschrift', insert: 'banner("Titel", good)' },
        { label: 'stat', detail: 'label, value, style?', info: 'Wert als Chip: label | value', insert: 'stat("HP", health, bad)' },
        { label: 'box', detail: 'text, style?', info: 'Wert als Kasten: [text]', insert: 'box("Leben: -5", bad)' },
      ] },
      { title: 'Stile', items: [
        { label: 'good', detail: 'grün', info: 'Positiv (grün)', insert: 'good' },
        { label: 'bad', detail: 'rot', info: 'Negativ (rot)', insert: 'bad' },
        { label: 'neutral', detail: 'grau', info: 'Neutral (grau)', insert: 'neutral' },
        { label: 'info', detail: 'blau', info: 'Info (blau)', insert: 'info' },
      ] },
      { title: 'Funktionen', items: BUILTINS.filter(f => !['display', 'stat', 'banner', 'box'].includes(f.name)).map(f => ({ label: f.name, detail: undefined, info: `${f.signature} — ${f.description}`, insert: `${f.name}(` })) },
      { title: 'Schlüsselwörter', items: KEYWORD_INFO.map(k => ({ label: k.name, info: k.description, insert: k.snippet ? k.snippet.replace(/\$\{?\}?/g, '').replace(/\t/g, '  ') : k.name })) },
      { title: 'Würfel', items: [{ label: '2d8', info: 'Würfel-Literal: Anzahl d Seiten', insert: '2d8' }, { label: 'roll(count, sides)', info: 'Dynamischer Wurf', insert: 'roll(' }] },
    ];
  }
}
