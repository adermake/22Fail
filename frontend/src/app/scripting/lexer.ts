/**
 * FailScript lexer. Produces a flat token stream for the parser. Dice literals (`2d8`)
 * are tokenized here to avoid ambiguity with identifiers; dynamic dice go through the
 * `roll(count, sides)` built-in instead.
 */

import { Diagnostic } from './ast';

export type TokenType =
  | 'number'
  | 'dice'
  | 'string'
  | 'identifier'
  | 'keyword'
  | 'punct'
  | 'eof';

export interface Token {
  type: TokenType;
  value: string;
  from: number;
  to: number;
  // dice payload
  diceCount?: number;
  diceSides?: number;
}

export const KEYWORDS = new Set([
  'var', 'if', 'else', 'true', 'false', 'effectActive', 'untilNextTurn', 'grantSkill', 'action',
  'repeat', 'while',
]);

// Multi-char punctuation first so longest-match wins.
const PUNCT = [
  '&&', '||', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=',
  '(', ')', '{', '}', ',', ';', '.', '+', '-', '*', '/', '%', '<', '>', '=', '!',
];

export interface LexResult {
  tokens: Token[];
  diagnostics: Diagnostic[];
}

const isDigit = (c: string) => c >= '0' && c <= '9';
const isIdentStart = (c: string) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
const isIdentPart = (c: string) => isIdentStart(c) || isDigit(c);

export function lex(src: string): LexResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];

    // Whitespace
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i++; continue; }

    // Comments: // line and /* block */
    if (c === '/' && src[i + 1] === '/') {
      i += 2;
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      if (i >= n) { diagnostics.push({ from: start, to: n, severity: 'error', message: 'Unbeendeter Blockkommentar' }); }
      else i += 2;
      continue;
    }

    // String literal (double quotes, with \" and \\ escapes)
    if (c === '"') {
      const start = i;
      i++;
      let value = '';
      let closed = false;
      while (i < n) {
        const ch = src[i];
        if (ch === '\\' && i + 1 < n) { value += src[i + 1]; i += 2; continue; }
        if (ch === '"') { i++; closed = true; break; }
        if (ch === '\n') break;
        value += ch;
        i++;
      }
      if (!closed) diagnostics.push({ from: start, to: i, severity: 'error', message: 'Unbeendeter Text (fehlendes ")' });
      tokens.push({ type: 'string', value, from: start, to: i });
      continue;
    }

    // Number, and dice literal (NdM)
    if (isDigit(c)) {
      const start = i;
      while (i < n && isDigit(src[i])) i++;
      // dice: <int> 'd' <int>  (only when the char after d is a digit)
      if (src[i] === 'd' && isDigit(src[i + 1])) {
        const count = parseInt(src.slice(start, i), 10);
        i++; // consume 'd'
        const sidesStart = i;
        while (i < n && isDigit(src[i])) i++;
        const sides = parseInt(src.slice(sidesStart, i), 10);
        tokens.push({ type: 'dice', value: src.slice(start, i), from: start, to: i, diceCount: count, diceSides: sides });
        continue;
      }
      // decimal part
      if (src[i] === '.' && isDigit(src[i + 1])) {
        i++;
        while (i < n && isDigit(src[i])) i++;
      }
      tokens.push({ type: 'number', value: src.slice(start, i), from: start, to: i });
      continue;
    }

    // Identifier / keyword
    if (isIdentStart(c)) {
      const start = i;
      while (i < n && isIdentPart(src[i])) i++;
      const value = src.slice(start, i);
      tokens.push({ type: KEYWORDS.has(value) ? 'keyword' : 'identifier', value, from: start, to: i });
      continue;
    }

    // Punctuation (longest match)
    let matched: string | null = null;
    for (const p of PUNCT) {
      if (src.startsWith(p, i)) { matched = p; break; }
    }
    if (matched) {
      tokens.push({ type: 'punct', value: matched, from: i, to: i + matched.length });
      i += matched.length;
      continue;
    }

    // Unknown character
    diagnostics.push({ from: i, to: i + 1, severity: 'error', message: `Unerwartetes Zeichen: '${c}'` });
    i++;
  }

  tokens.push({ type: 'eof', value: '', from: n, to: n });
  return { tokens, diagnostics };
}
