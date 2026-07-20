/**
 * CodeMirror 6 integration for FailScript: syntax highlighting, autocomplete (symbols,
 * functions, keywords, talents, attribute members, in-scope vars), lint diagnostics from
 * the checker, and hover docs. Built to actively teach the language as the user types.
 */

import { Extension } from '@codemirror/state';
import { EditorView, hoverTooltip } from '@codemirror/view';
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import {
  autocompletion, CompletionContext, CompletionResult, snippetCompletion, startCompletion,
} from '@codemirror/autocomplete';
import { linter, Diagnostic as CmDiagnostic } from '@codemirror/lint';
import { tags as t } from '@lezer/highlight';

import { compileScript } from '../checker';
import {
  ACTION_TYPE_INFO, ACTION_TYPE_NAMES, ATTRIBUTE_MEMBERS, BUILTINS, BUILTIN_MAP, KEYWORD_INFO,
  RESOURCE_INFO, RESOURCE_NAMES, STYLE_NAMES, SYMBOLS, SYMBOL_MAP, TALENT_INFO,
} from '../symbols';
import { KEYWORDS } from '../lexer';

// ── Highlighting ──

const failscriptStream = StreamLanguage.define<{ inComment: boolean }>({
  startState: () => ({ inComment: false }),
  token(stream, state) {
    if (state.inComment) {
      if (stream.match(/^.*?\*\//)) state.inComment = false;
      else stream.skipToEnd();
      return 'comment';
    }
    if (stream.eatSpace()) return null;
    if (stream.match('//')) { stream.skipToEnd(); return 'comment'; }
    if (stream.match('/*')) {
      if (!stream.match(/^.*?\*\//)) { state.inComment = true; stream.skipToEnd(); }
      return 'comment';
    }
    if (stream.match(/^"(?:[^"\\]|\\.)*"?/)) return 'string';
    if (stream.match(/^\d+d\d+/)) return 'dice';
    if (stream.match(/^\d+(?:\.\d+)?/)) return 'number';
    const word = stream.match(/^[A-Za-z_]\w*/) as RegExpMatchArray | null;
    if (word) {
      const w = word[0];
      if (KEYWORDS.has(w)) return 'keyword';
      if (BUILTINS.some(f => f.name === w)) return 'function';
      if (SYMBOL_MAP.has(w)) return 'symbol';
      return 'variable';
    }
    if (stream.match(/^(?:&&|\|\||[+\-*/%<>=!]=?)/)) return 'operator';
    stream.next();
    return null;
  },
  tokenTable: {
    keyword: t.keyword,
    comment: t.comment,
    string: t.string,
    number: t.number,
    dice: t.atom,
    function: t.function(t.variableName),
    symbol: t.propertyName,
    variable: t.variableName,
    operator: t.operator,
  },
});

const highlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#c792ea', fontWeight: 'bold' },
  { tag: t.comment, color: '#6b7280', fontStyle: 'italic' },
  { tag: t.string, color: '#c3e88d' },
  { tag: t.number, color: '#f78c6c' },
  { tag: t.atom, color: '#ffcb6b', fontWeight: 'bold' }, // dice literals
  { tag: t.function(t.variableName), color: '#82aaff' },
  { tag: t.propertyName, color: '#89ddff' }, // game symbols
  { tag: t.variableName, color: '#e5e7eb' },
  { tag: t.operator, color: '#89ddff' },
]);

// ── Autocomplete ──

const STYLE_INFO: Record<string, string> = {
  good: 'Grün — positiv',
  bad: 'Rot — negativ',
  neutral: 'Grau — neutral',
  info: 'Blau — Info',
};

/**
 * The call whose parentheses directly enclose the cursor, plus which argument index the
 * cursor is in (commas at depth 0 since the opening paren). Best-effort (ignores strings).
 */
function enclosingCall(text: string): { name: string; argIndex: number } | null {
  let depth = 0;
  let commas = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    const c = text[i];
    if (c === ')') depth++;
    else if (c === '(') {
      if (depth === 0) {
        const m = text.slice(0, i).match(/([A-Za-z_]\w*)\s*$/);
        return m ? { name: m[1], argIndex: commas } : null;
      }
      depth--;
    } else if (c === ',' && depth === 0) {
      commas++;
    }
  }
  return null;
}

/** Choices for an argument that expects a fixed keyword set (resource / style / action type). */
function argChoiceOptions(call: { name: string; argIndex: number }) {
  // grantSkill(name, description, actionType, …) — the 3rd arg is a bare action-type keyword.
  if (call.name === 'grantSkill') {
    if (call.argIndex === 2) {
      return [...ACTION_TYPE_NAMES].map(a => ({ label: a, type: 'enum', detail: 'Aktionstyp', info: ACTION_TYPE_INFO[a], boost: 80 }));
    }
    return null;
  }
  const fn = BUILTIN_MAP.get(call.name);
  if (!fn) return null;
  if (fn.resourceFirstArg && call.argIndex === 0) {
    return [...RESOURCE_NAMES].map(r => ({ label: r, type: 'enum', detail: 'Ressource', info: RESOURCE_INFO[r], boost: 80 }));
  }
  if (fn.styleArgIndex === call.argIndex) {
    return [...STYLE_NAMES].map(s => ({ label: s, type: 'enum', detail: 'Stil', info: STYLE_INFO[s], boost: 80 }));
  }
  return null;
}

function localVarNames(doc: string): string[] {
  const names = new Set<string>();
  const re = /\bvar\s+([A-Za-z_]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc))) names.add(m[1]);
  return [...names];
}

function completions(context: CompletionContext): CompletionResult | null {
  const before = context.matchBefore(/[A-Za-z_][\w.]*/);
  const textBefore = context.state.doc.sliceString(0, context.pos);
  const call = enclosingCall(textBefore);
  const argChoices = call ? argChoiceOptions(call) : null;

  // Inside an argument that expects a fixed keyword set (resource / style): offer ONLY
  // those — this is the inline assist for loseResource(mana|health|energy|fokus), etc.
  if (argChoices && (before || /[(,]\s*$/.test(textBefore) || context.explicit)) {
    return { from: before ? before.from : context.pos, options: argChoices, validFor: /^\w*$/ };
  }

  if (!before && !context.explicit) return null;

  const text = before ? before.text : '';
  const dot = text.lastIndexOf('.');

  // Member completion: talent.<id> or <attr>.<member>
  if (dot >= 0) {
    const objName = text.slice(0, dot);
    const from = (before!.from) + dot + 1;
    if (objName === 'talent') {
      return { from, options: TALENT_INFO.map(tl => ({ label: tl.id, type: 'property', detail: tl.statLabel, info: `${tl.name} — ${tl.description}` })) };
    }
    if (SYMBOL_MAP.get(objName)?.category === 'attribute') {
      return { from, options: Object.entries(ATTRIBUTE_MEMBERS).map(([k, v]) => ({ label: k, type: 'property', info: v })) };
    }
    return null;
  }

  const from = before ? before.from : context.pos;

  const options = [
    ...KEYWORD_INFO.map(k => k.snippet
      ? snippetCompletion(k.snippet, { label: k.name, type: 'keyword', info: k.description })
      : { label: k.name, type: 'keyword', info: k.description }),
    ...BUILTINS.map(f => snippetCompletion(`${f.name}(${'${}'})`, { label: f.name, type: 'function', detail: f.signature, info: f.description })),
    ...SYMBOLS.filter(s => s.category !== 'namespace').map(s => ({ label: s.name, type: 'variable', detail: s.category, info: s.description })),
    { label: 'talent', type: 'namespace', info: 'Talent-Würfelboni: talent.<name>' },
    ...localVarNames(context.state.doc.toString()).map(n => ({ label: n, type: 'variable', detail: 'lokal' })),
  ];
  return { from, options, validFor: /^[\w]*$/ };
}

// ── Lint ──

const failscriptLinter = linter(view => {
  const doc = view.state.doc.toString();
  const len = doc.length;
  return compileScript(doc).diagnostics.map<CmDiagnostic>(d => ({
    from: Math.min(d.from, len),
    to: Math.min(Math.max(d.to, d.from + 1), len),
    severity: d.severity,
    message: d.message,
  }));
}, { delay: 300 });

// ── Hover ──

const failscriptHover = hoverTooltip((view, pos) => {
  const { text, from } = view.state.doc.lineAt(pos);
  const rel = pos - from;
  const re = /[A-Za-z_]\w*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index, end = m.index + m[0].length;
    if (rel >= start && rel <= end) {
      const word = m[0];
      const info = describeSymbol(word);
      if (!info) return null;
      return {
        pos: from + start, end: from + end, above: true,
        create: () => {
          const dom = document.createElement('div');
          dom.className = 'fs-hover';
          dom.textContent = info;
          return { dom };
        },
      };
    }
  }
  return null;
});

function describeSymbol(word: string): string | null {
  const sym = SYMBOL_MAP.get(word);
  if (sym) return `${word} — ${sym.description}`;
  const fn = BUILTINS.find(f => f.name === word);
  if (fn) return `${fn.signature} — ${fn.description}`;
  const kw = KEYWORD_INFO.find(k => k.name === word);
  if (kw) return `${word} — ${kw.description}`;
  if (STYLE_INFO[word]) return `${word} (Stil) — ${STYLE_INFO[word]}`;
  return null;
}

const editorTheme = EditorView.theme({
  '&': { fontSize: '13px', height: '100%', color: '#e5e7eb', backgroundColor: '#0f172a' },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-gutters': { backgroundColor: '#0b1220', color: '#4b5563', border: 'none', borderRight: '1px solid #1f2937' },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.03)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.05)' },
  '.cm-tooltip': { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb', borderRadius: '6px' },
  '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#3b82f6', color: '#fff' },
  '.fs-hover': { padding: '4px 8px', maxWidth: '320px', font: '12px/1.4 sans-serif' },
}, { dark: true });

/** Re-indent a FailScript by brace depth (best-effort; ignores braces inside strings). */
export function formatFailScript(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let depth = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { out.push(''); continue; }
    const lead = line.match(/^\}+/)?.[0].length ?? 0;
    const thisDepth = Math.max(0, depth - lead);
    out.push('  '.repeat(thisDepth) + line);
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    depth = Math.max(0, depth + opens - closes);
  }
  return out.join('\n');
}

/** Auto-open the completion popup right after typing '(' or ',' inside a keyword-arg call. */
const autoOpenArgChoices = EditorView.updateListener.of(update => {
  if (!update.docChanged) return;
  let trigger = false;
  update.changes.iterChanges((_fa, _ta, _fb, _tb, inserted) => {
    const t = inserted.toString();
    if (t === '(' || t === ',') trigger = true;
  });
  if (!trigger) return;
  const pos = update.state.selection.main.head;
  const call = enclosingCall(update.state.doc.sliceString(0, pos));
  if (call && argChoiceOptions(call)) {
    setTimeout(() => startCompletion(update.view), 0);
  }
});

/** All FailScript editor extensions. */
export function failscriptExtensions(): Extension[] {
  return [
    failscriptStream,
    syntaxHighlighting(highlightStyle),
    autocompletion({ override: [completions], activateOnTyping: true }),
    autoOpenArgChoices,
    failscriptLinter,
    failscriptHover,
    editorTheme,
  ];
}
