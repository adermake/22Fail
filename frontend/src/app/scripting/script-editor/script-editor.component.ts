import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input,
  OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, placeholder as cmPlaceholder } from '@codemirror/view';
import { history, historyKeymap, defaultKeymap, indentWithTab } from '@codemirror/commands';
import { acceptCompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, indentOnInput } from '@codemirror/language';

import { failscriptExtensions } from './failscript-cm';
import { BUILTINS, KEYWORD_INFO, SYMBOLS, TALENT_INFO } from '../symbols';

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
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="se-wrap">
      <div class="se-editor" #host></div>
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
    .se-editor { flex: 1; min-width: 0; overflow: hidden; }
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
      { title: 'Funktionen', items: BUILTINS.map(f => ({ label: f.name, detail: undefined, info: `${f.signature} — ${f.description}`, insert: `${f.name}(` })) },
      { title: 'Schlüsselwörter', items: KEYWORD_INFO.map(k => ({ label: k.name, info: k.description, insert: k.snippet ? k.snippet.replace(/\$\{?\}?/g, '').replace(/\t/g, '  ') : k.name })) },
      { title: 'Würfel', items: [{ label: '2d8', info: 'Würfel-Literal: Anzahl d Seiten', insert: '2d8' }, { label: 'roll(count, sides)', info: 'Dynamischer Wurf', insert: 'roll(' }] },
    ];
  }
}
