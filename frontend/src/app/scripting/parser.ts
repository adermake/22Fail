/**
 * FailScript recursive-descent parser. Tolerant: on error it records a diagnostic and
 * tries to continue so the editor can still offer completions/highlighting.
 */

import { lex, Token } from './lexer';
import {
  AssignOp, BinaryOp, Block, Call, Diagnostic, Expr, Identifier, IfStmt, LogicalOp,
  Member, Program, Stmt,
} from './ast';

const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=']);

export interface ParseResult {
  program: Program;
  diagnostics: Diagnostic[];
}

export function parse(src: string): ParseResult {
  const { tokens, diagnostics } = lex(src);
  return new Parser(tokens, diagnostics, src.length).parseProgram();
}

class Parser {
  private pos = 0;

  constructor(
    private tokens: Token[],
    private diagnostics: Diagnostic[],
    private srcLen: number,
  ) {}

  private peek(o = 0): Token { return this.tokens[Math.min(this.pos + o, this.tokens.length - 1)]; }
  private atEof(): boolean { return this.peek().type === 'eof'; }
  private next(): Token { const t = this.peek(); if (!this.atEof()) this.pos++; return t; }

  private isPunct(v: string, o = 0): boolean { const t = this.peek(o); return t.type === 'punct' && t.value === v; }
  private isKeyword(v: string, o = 0): boolean { const t = this.peek(o); return t.type === 'keyword' && t.value === v; }

  private error(t: Token, message: string): void {
    this.diagnostics.push({ from: t.from, to: Math.max(t.to, t.from + 1), severity: 'error', message });
  }

  private expectPunct(v: string): Token {
    if (this.isPunct(v)) return this.next();
    this.error(this.peek(), `Erwartet '${v}'`);
    return this.peek();
  }

  parseProgram(): ParseResult {
    const body: Stmt[] = [];
    while (!this.atEof()) {
      const before = this.pos;
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
      if (this.pos === before) this.next(); // guarantee progress on unexpected token
    }
    return {
      program: { kind: 'Program', body, from: 0, to: this.srcLen },
      diagnostics: this.diagnostics,
    };
  }

  // ── Statements ──

  private parseStatement(): Stmt | null {
    if (this.isPunct(';')) { this.next(); return null; }
    if (this.isKeyword('var')) return this.parseVarDecl();
    if (this.isKeyword('if')) return this.parseIf();
    if (this.isKeyword('repeat')) return this.parseRepeat();
    if (this.isKeyword('while')) return this.parseWhile();
    if (this.isKeyword('effectActive') || this.isKeyword('untilNextTurn')) return this.parseLifecycle();
    if (this.isKeyword('grantSkill')) return this.parseGrantSkill();
    if (this.isKeyword('action')) return this.parseActionDecl();
    if (this.isPunct('{')) return this.parseBlock();
    return this.parseAssignOrExpr();
  }

  private parseVarDecl(): Stmt {
    const kw = this.next(); // 'var'
    const nameTok = this.peek();
    if (nameTok.type !== 'identifier') { this.error(nameTok, 'Variablenname erwartet'); }
    else this.next();
    this.expectPunct('=');
    const value = this.parseExpr();
    this.consumeOptionalSemicolon();
    return {
      kind: 'VarDecl', name: nameTok.value, nameSpan: { from: nameTok.from, to: nameTok.to },
      value, from: kw.from, to: value.to,
    };
  }

  private parseIf(): IfStmt {
    const kw = this.next(); // 'if'
    this.expectPunct('(');
    const test = this.parseExpr();
    this.expectPunct(')');
    const then = this.parseBlock();
    let elseBranch: Block | IfStmt | undefined;
    if (this.isKeyword('else')) {
      this.next();
      elseBranch = this.isKeyword('if') ? this.parseIf() : this.parseBlock();
    }
    return { kind: 'If', test, then, else: elseBranch, from: kw.from, to: (elseBranch ?? then).to };
  }

  private parseRepeat(): Stmt {
    const kw = this.next(); // 'repeat'
    this.expectPunct('(');
    const count = this.parseExpr();
    this.expectPunct(')');
    const body = this.parseBlock();
    return { kind: 'Repeat', keywordSpan: { from: kw.from, to: kw.to }, count, body, from: kw.from, to: body.to };
  }

  private parseWhile(): Stmt {
    const kw = this.next(); // 'while'
    this.expectPunct('(');
    const test = this.parseExpr();
    this.expectPunct(')');
    const body = this.parseBlock();
    return { kind: 'While', keywordSpan: { from: kw.from, to: kw.to }, test, body, from: kw.from, to: body.to };
  }

  private parseLifecycle(): Stmt {
    const kw = this.next(); // 'effectActive' | 'untilNextTurn'
    const body = this.parseBlock();
    return {
      kind: 'Lifecycle', lifecycle: kw.value === 'untilNextTurn' ? 'untilNextTurn' : 'effectActive',
      keywordSpan: { from: kw.from, to: kw.to }, body, from: kw.from, to: body.to,
    };
  }

  private parseGrantSkill(): Stmt {
    const kw = this.next(); // 'grantSkill'
    this.expectPunct('(');
    const args = this.parseArgList();
    this.expectPunct(')');
    const body = this.parseBlock();
    return { kind: 'GrantSkill', keywordSpan: { from: kw.from, to: kw.to }, args, body, from: kw.from, to: body.to };
  }

  private parseActionDecl(): Stmt {
    const kw = this.next(); // 'action'
    const nameTok = this.peek();
    if (nameTok.type !== 'identifier') this.error(nameTok, 'Aktionsname erwartet');
    else this.next();
    const body = this.parseBlock();
    return {
      kind: 'ActionDecl', name: nameTok.value, nameSpan: { from: nameTok.from, to: nameTok.to },
      body, from: kw.from, to: body.to,
    };
  }

  private parseBlock(): Block {
    const open = this.expectPunct('{');
    const body: Stmt[] = [];
    while (!this.atEof() && !this.isPunct('}')) {
      const before = this.pos;
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
      if (this.pos === before) this.next();
    }
    const close = this.expectPunct('}');
    return { kind: 'Block', body, from: open.from, to: close.to };
  }

  private parseAssignOrExpr(): Stmt {
    const expr = this.parseExpr();
    if (this.peek().type === 'punct' && ASSIGN_OPS.has(this.peek().value)) {
      const opTok = this.next();
      const value = this.parseExpr();
      this.consumeOptionalSemicolon();
      if (expr.kind !== 'Identifier' && expr.kind !== 'Member') {
        this.error(opTok, 'Ungültiges Zuweisungsziel');
      }
      return {
        kind: 'Assign', target: expr as Identifier | Member, op: opTok.value as AssignOp,
        value, from: expr.from, to: value.to,
      };
    }
    this.consumeOptionalSemicolon();
    return { kind: 'ExprStmt', expr, from: expr.from, to: expr.to };
  }

  private consumeOptionalSemicolon(): void {
    if (this.isPunct(';')) this.next();
  }

  // ── Expressions (precedence climbing) ──

  private parseExpr(): Expr { return this.parseLogicalOr(); }

  private parseLogicalOr(): Expr {
    let left = this.parseLogicalAnd();
    while (this.isPunct('||')) {
      const op = this.next().value as LogicalOp;
      const right = this.parseLogicalAnd();
      left = { kind: 'Logical', op, left, right, from: left.from, to: right.to };
    }
    return left;
  }

  private parseLogicalAnd(): Expr {
    let left = this.parseEquality();
    while (this.isPunct('&&')) {
      const op = this.next().value as LogicalOp;
      const right = this.parseEquality();
      left = { kind: 'Logical', op, left, right, from: left.from, to: right.to };
    }
    return left;
  }

  private parseEquality(): Expr {
    let left = this.parseComparison();
    while (this.isPunct('==') || this.isPunct('!=')) {
      const op = this.next().value as BinaryOp;
      const right = this.parseComparison();
      left = { kind: 'Binary', op, left, right, from: left.from, to: right.to };
    }
    return left;
  }

  private parseComparison(): Expr {
    let left = this.parseAddition();
    while (this.isPunct('<') || this.isPunct('>') || this.isPunct('<=') || this.isPunct('>=')) {
      const op = this.next().value as BinaryOp;
      const right = this.parseAddition();
      left = { kind: 'Binary', op, left, right, from: left.from, to: right.to };
    }
    return left;
  }

  private parseAddition(): Expr {
    let left = this.parseMultiplication();
    while (this.isPunct('+') || this.isPunct('-')) {
      const op = this.next().value as BinaryOp;
      const right = this.parseMultiplication();
      left = { kind: 'Binary', op, left, right, from: left.from, to: right.to };
    }
    return left;
  }

  private parseMultiplication(): Expr {
    let left = this.parseUnary();
    while (this.isPunct('*') || this.isPunct('/') || this.isPunct('%')) {
      const op = this.next().value as BinaryOp;
      const right = this.parseUnary();
      left = { kind: 'Binary', op, left, right, from: left.from, to: right.to };
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.isPunct('-') || this.isPunct('!')) {
      const opTok = this.next();
      const operand = this.parseUnary();
      return { kind: 'Unary', op: opTok.value as '-' | '!', operand, from: opTok.from, to: operand.to };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expr {
    let expr = this.parsePrimary();
    for (;;) {
      if (this.isPunct('(') && expr.kind === 'Identifier') {
        this.next(); // '('
        const args = this.parseArgList();
        const close = this.expectPunct(')');
        const call: Call = { kind: 'Call', callee: expr, args, from: expr.from, to: close.to };
        expr = call;
      } else if (this.isPunct('.')) {
        this.next();
        const propTok = this.peek();
        if (propTok.type !== 'identifier') { this.error(propTok, 'Eigenschaftsname erwartet'); break; }
        this.next();
        const member: Member = {
          kind: 'Member', object: expr, property: propTok.value,
          propertySpan: { from: propTok.from, to: propTok.to }, from: expr.from, to: propTok.to,
        };
        expr = member;
      } else {
        break;
      }
    }
    return expr;
  }

  private parseArgList(): Expr[] {
    const args: Expr[] = [];
    if (this.isPunct(')')) return args;
    args.push(this.parseExpr());
    while (this.isPunct(',')) { this.next(); if (this.isPunct(')')) break; args.push(this.parseExpr()); }
    return args;
  }

  private parsePrimary(): Expr {
    const t = this.peek();
    switch (t.type) {
      case 'number':
        this.next();
        return { kind: 'Number', value: parseFloat(t.value), from: t.from, to: t.to };
      case 'dice':
        this.next();
        return { kind: 'Dice', count: t.diceCount ?? 0, sides: t.diceSides ?? 0, from: t.from, to: t.to };
      case 'string':
        this.next();
        return { kind: 'String', value: t.value, from: t.from, to: t.to };
      case 'identifier':
        this.next();
        return { kind: 'Identifier', name: t.value, from: t.from, to: t.to };
      case 'keyword':
        if (t.value === 'true' || t.value === 'false') {
          this.next();
          return { kind: 'Bool', value: t.value === 'true', from: t.from, to: t.to };
        }
        this.error(t, `Unerwartetes Schlüsselwort '${t.value}'`);
        return { kind: 'Number', value: 0, from: t.from, to: t.to };
      case 'punct':
        if (t.value === '(') {
          this.next();
          const e = this.parseExpr();
          this.expectPunct(')');
          return e;
        }
        this.error(t, `Unerwartetes Zeichen '${t.value}'`);
        return { kind: 'Number', value: 0, from: t.from, to: t.to };
      default:
        this.error(t, 'Ausdruck erwartet');
        return { kind: 'Number', value: 0, from: t.from, to: t.to };
    }
  }
}
