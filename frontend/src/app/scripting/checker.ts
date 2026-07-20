/**
 * FailScript static checker. Produces diagnostics for the editor and gates execution.
 *
 * The central rule — the "stat leak" guard: game symbols are read-only; assigning one is
 * legal ONLY inside a lifecycle block (untilNextTurn), where it becomes a temporary
 * modifier. Permanent changes must go through built-ins (loseResource, …), never `=`.
 */

import {
  ACTION_TYPE_NAMES, ATTRIBUTE_MEMBERS, BUILTIN_MAP, RESOURCE_NAMES, STYLE_NAMES, SYMBOL_MAP, TALENT_IDS,
} from './symbols';
import { parse } from './parser';
import { Block, Diagnostic, Expr, Program, Stmt } from './ast';

export interface CompileResult {
  program: Program;
  diagnostics: Diagnostic[];
  ok: boolean;
}

/** Parse + check. `ok` is false if there are any error-severity diagnostics. */
export function compileScript(src: string): CompileResult {
  const { program, diagnostics } = parse(src);
  new Checker(diagnostics).checkProgram(program);
  const ok = !diagnostics.some(d => d.severity === 'error');
  return { program, diagnostics, ok };
}

class Scope {
  vars = new Set<string>();
  actions = new Set<string>();
  constructor(public parent: Scope | null) {}
  hasVar(name: string): boolean { return this.vars.has(name) || (this.parent?.hasVar(name) ?? false); }
  hasAction(name: string): boolean { return this.actions.has(name) || (this.parent?.hasAction(name) ?? false); }
}

/**
 * Built-ins that are NOT allowed directly inside an `effectActive` block: they have side
 * effects or are non-deterministic. effectActive is re-evaluated continuously to derive the
 * effect's contribution, so it must be pure (reads + math + stat assignments + grantSkill).
 */
const IMPURE_IN_EFFECT_ACTIVE = new Set([
  'display', 'stat', 'banner', 'box', 'loseResource', 'gainResource', 'applyStatus', 'removeStatus', 'roll',
]);

class Checker {
  /** Depth of enclosing effectActive blocks (a grantSkill body resets it to 0). */
  private lifecycleDepth = 0;

  constructor(private diagnostics: Diagnostic[]) {}

  private err(from: number, to: number, message: string): void {
    this.diagnostics.push({ from, to: Math.max(to, from + 1), severity: 'error', message });
  }
  private warn(from: number, to: number, message: string): void {
    this.diagnostics.push({ from, to: Math.max(to, from + 1), severity: 'warning', message });
  }

  checkProgram(program: Program): void {
    const scope = new Scope(null);
    // Hoist action declarations so they can be referenced before their textual position.
    for (const s of program.body) if (s.kind === 'ActionDecl') scope.actions.add(s.name);
    for (const s of program.body) this.checkStmt(s, scope);
  }

  private checkBlock(block: Block, parent: Scope, freshLifecycle?: number): void {
    const scope = new Scope(parent);
    for (const s of block.body) if (s.kind === 'ActionDecl') scope.actions.add(s.name);
    const savedLifecycle = this.lifecycleDepth;
    if (freshLifecycle !== undefined) this.lifecycleDepth = freshLifecycle;
    for (const s of block.body) this.checkStmt(s, scope);
    this.lifecycleDepth = savedLifecycle;
  }

  private checkStmt(stmt: Stmt, scope: Scope): void {
    switch (stmt.kind) {
      case 'VarDecl':
        this.checkExpr(stmt.value, scope);
        scope.vars.add(stmt.name);
        break;

      case 'Assign':
        this.checkAssign(stmt, scope);
        break;

      case 'ExprStmt':
        this.checkExpr(stmt.expr, scope);
        break;

      case 'If':
        this.checkExpr(stmt.test, scope);
        this.checkBlock(stmt.then, scope);
        if (stmt.else) {
          if (stmt.else.kind === 'Block') this.checkBlock(stmt.else, scope);
          else this.checkStmt(stmt.else, scope);
        }
        break;

      case 'Block':
        this.checkBlock(stmt, scope);
        break;

      case 'Repeat':
        this.checkExpr(stmt.count, scope);
        this.checkBlock(stmt.body, scope);
        break;

      case 'While':
        this.checkExpr(stmt.test, scope);
        this.checkBlock(stmt.body, scope);
        break;

      case 'Lifecycle':
        this.checkBlock(stmt.body, scope, this.lifecycleDepth + 1);
        break;

      case 'GrantSkill':
        // Granted skills are effect-bound: only legal inside effectActive, so the skill
        // exists exactly as long as the source effect. Anywhere else is a skill leak.
        if (this.lifecycleDepth === 0) {
          this.err(stmt.keywordSpan.from, stmt.keywordSpan.to,
            "'grantSkill' ist nur in 'effectActive { … }' erlaubt (sonst Skill-Leak). " +
            'So verschwindet die Fähigkeit, sobald der Effekt endet.');
        }
        if (stmt.args.length === 0) {
          this.err(stmt.keywordSpan.from, stmt.keywordSpan.to,
            'grantSkill(Name, Beschreibung?, Aktionstyp?, Mana?, Ausdauer?, Leben?) { … }');
        }
        // grantSkill(name, description?, actionType?, manaCost?, energyCost?, lifeCost?):
        // the actionType (index 2) is a bare keyword — validate it, don't resolve as a symbol.
        stmt.args.forEach((arg, i) => {
          if (i === 2) {
            if (arg.kind !== 'Identifier' || !ACTION_TYPE_NAMES.has(arg.name)) {
              this.err(arg.from, arg.to, `Aktionstyp erwartet: ${[...ACTION_TYPE_NAMES].join(', ')}`);
            }
            return;
          }
          this.checkExpr(arg, scope);
        });
        // The granted skill's action runs in its own future context → reset lifecycle scope.
        this.checkBlock(stmt.body, scope, 0);
        break;

      case 'ActionDecl':
        this.checkBlock(stmt.body, scope, 0);
        break;
    }
  }

  private checkAssign(stmt: Extract<Stmt, { kind: 'Assign' }>, scope: Scope): void {
    this.checkExpr(stmt.value, scope);
    const target = stmt.target;

    if (target.kind === 'Member') {
      this.err(target.from, target.to, 'Zuweisung an Eigenschaften ist nicht erlaubt (nur lesen).');
      return;
    }

    const name = target.name;

    // Local variable — always assignable.
    if (scope.hasVar(name)) return;

    const sym = SYMBOL_MAP.get(name);
    if (!sym) {
      this.err(target.from, target.to,
        `Unbekanntes Symbol '${name}'. Deklariere lokale Variablen mit 'var'.`);
      return;
    }

    if (!sym.assignable) {
      const hint = sym.category === 'resource'
        ? " Nutze loseResource()/gainResource()."
        : '';
      this.err(target.from, target.to,
        `'${name}' ist schreibgeschützt und kann nicht zugewiesen werden.${hint}`);
      return;
    }

    // Assignable game stat — only inside an effectActive block.
    if (this.lifecycleDepth === 0) {
      this.err(stmt.from, stmt.to,
        `Direkte Änderung von '${name}' ist nicht erlaubt (Stat-Leak). ` +
        `Verwende 'effectActive { ${name} += … }' — der Modifikator gilt, solange der Effekt aktiv ist.`);
    }
  }

  private checkExpr(expr: Expr, scope: Scope): void {
    switch (expr.kind) {
      case 'Number': case 'String': case 'Bool':
        break;

      case 'Dice':
        if (expr.count <= 0 || expr.sides <= 0) this.warn(expr.from, expr.to, 'Würfel ohne Wirkung');
        if (this.lifecycleDepth > 0) {
          this.err(expr.from, expr.to, 'Würfel sind in effectActive nicht erlaubt (muss deterministisch sein).');
        }
        break;

      case 'Identifier': {
        const name = expr.name;
        if (scope.hasVar(name) || scope.hasAction(name)) break;
        const sym = SYMBOL_MAP.get(name);
        if (sym) {
          if (sym.category === 'namespace') {
            this.err(expr.from, expr.to, `'${name}' muss mit einer Eigenschaft verwendet werden, z.B. ${name}.athletik`);
          }
          break;
        }
        if (BUILTIN_MAP.has(name)) {
          this.err(expr.from, expr.to, `Funktion '${name}' muss aufgerufen werden: ${name}(…)`);
          break;
        }
        this.err(expr.from, expr.to, `Unbekanntes Symbol '${name}'`);
        break;
      }

      case 'Member':
        this.checkMember(expr, scope);
        break;

      case 'Unary':
        this.checkExpr(expr.operand, scope);
        break;

      case 'Binary':
      case 'Logical':
        this.checkExpr(expr.left, scope);
        this.checkExpr(expr.right, scope);
        break;

      case 'Call':
        this.checkCall(expr, scope);
        break;
    }
  }

  private checkMember(expr: Extract<Expr, { kind: 'Member' }>, scope: Scope): void {
    const obj = expr.object;
    if (obj.kind === 'Identifier') {
      if (obj.name === 'talent') {
        if (!TALENT_IDS.has(expr.property)) {
          this.err(expr.propertySpan.from, expr.propertySpan.to, `Unbekanntes Talent '${expr.property}'`);
        }
        return;
      }
      const sym = SYMBOL_MAP.get(obj.name);
      if (sym && sym.category === 'attribute') {
        if (!ATTRIBUTE_MEMBERS[expr.property]) {
          this.err(expr.propertySpan.from, expr.propertySpan.to,
            `Unbekannte Eigenschaft '${expr.property}' (erlaubt: ${Object.keys(ATTRIBUTE_MEMBERS).join(', ')})`);
        }
        return;
      }
    }
    this.err(expr.from, expr.to, 'Nicht unterstützter Eigenschaftszugriff');
  }

  private checkCall(expr: Extract<Expr, { kind: 'Call' }>, scope: Scope): void {
    const name = expr.callee.name;

    // Calling a declared action (no args).
    if (scope.hasAction(name)) {
      if (expr.args.length > 0) this.err(expr.from, expr.to, `Aktion '${name}' nimmt keine Argumente`);
      return;
    }

    const fn = BUILTIN_MAP.get(name);
    if (!fn) {
      this.err(expr.callee.from, expr.callee.to, `Unbekannte Funktion '${name}'`);
      for (const a of expr.args) this.checkExpr(a, scope);
      return;
    }

    if (this.lifecycleDepth > 0 && IMPURE_IN_EFFECT_ACTIVE.has(name)) {
      this.err(expr.callee.from, expr.callee.to,
        `'${name}' ist in effectActive nicht erlaubt. Hier sind nur Stat-Zuweisungen ` +
        '(speed += 2, speed *= 2, …), grantSkill und reine Berechnungen erlaubt.');
    }

    if (expr.args.length < fn.minArgs || expr.args.length > fn.maxArgs) {
      this.err(expr.from, expr.to, `'${name}' erwartet ${fn.signature}`);
    }

    // Resource-selector first argument (loseResource/gainResource).
    if (fn.resourceFirstArg && expr.args.length >= 1) {
      const first = expr.args[0];
      if (first.kind !== 'Identifier' || !RESOURCE_NAMES.has(first.name)) {
        this.err(first.from, first.to, `Erwartet eine Ressource: ${[...RESOURCE_NAMES].join(', ')}`);
      }
    }

    // Style-selector argument (display/stat/banner) — a bareword good/bad/neutral/info.
    if (fn.styleArgIndex !== undefined && expr.args.length > fn.styleArgIndex) {
      const styleArg = expr.args[fn.styleArgIndex];
      if (styleArg.kind !== 'Identifier' || !STYLE_NAMES.has(styleArg.name)) {
        this.err(styleArg.from, styleArg.to, `Stil erwartet: ${[...STYLE_NAMES].join(', ')}`);
      }
    }

    // Check the remaining (value) arguments normally.
    for (let k = 0; k < expr.args.length; k++) {
      if (fn.resourceFirstArg && k === 0) continue;
      if (fn.styleArgIndex === k) continue;
      this.checkExpr(expr.args[k], scope);
    }
  }
}
