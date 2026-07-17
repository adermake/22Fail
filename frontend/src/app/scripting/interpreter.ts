/**
 * FailScript interpreter. Pure (no Angular): it evaluates a checked AST against a
 * CharacterContext and returns a structured ScriptResult. An Angular bridge maps that to
 * the app's UnifiedMacroResult and applies side effects via the existing patch/socket paths.
 */

import { StatusModifierTarget } from '../model/status-effect.model';
import {
  AssignOp, Block, Expr, Program, Stmt,
} from './ast';
import { compileScript } from './checker';
import { rollDice } from './dice';
import { RESOURCE_NAMES, SYMBOL_MAP } from './symbols';

export type ScriptValue = number | string | boolean;

export type DisplayStyle = 'good' | 'bad' | 'neutral' | 'info';
export type DisplayItem =
  | { type: 'text'; text: string; style: DisplayStyle }
  | { type: 'stat'; label: string; value: string; style: DisplayStyle }
  | { type: 'banner'; text: string; style: DisplayStyle }
  | { type: 'box'; text: string; style: DisplayStyle };

export interface ScriptRoll { name: string; formula: string; rolls: number[]; total: number; }
export interface ScriptResourceChange { resource: string; amount: number; } // negative = lose
export interface ScriptTempModifier { target: StatusModifierTarget; amount: number; }
export interface ScriptGrantedSkill { name: string; manaCost: number; energyCost: number; lifeCost: number; script: string; }
export interface ScriptStatusOp { op: 'apply' | 'remove'; id: string; stacks?: number; }

export interface ScriptResult {
  ok: boolean;
  displays: DisplayItem[];
  rolls: ScriptRoll[];
  resourceChanges: ScriptResourceChange[];
  /** From untilNextTurn (only persisted by the caller when combat is active). */
  tempModifiers: ScriptTempModifier[];
  grantedSkills: ScriptGrantedSkill[];
  statusOps: ScriptStatusOp[];
  errors: string[];
}

/** Read-side of a character, resolved by the host (player→TrueStatsService, NPC→statblock). */
export interface CharacterContext {
  readScalar(name: string): number | string;
  readAttributeMember(attr: string, prop: string): number;
  readTalent(id: string): number;
  hasSkill(name: string): boolean;
  inCombat(): boolean;
  rng?: () => number;
}

class ScriptError extends Error {}

/** Compile then run. Refuses to run scripts with checker errors. */
export function runScript(src: string, ctx: CharacterContext): ScriptResult {
  const result: ScriptResult = {
    ok: false, displays: [], rolls: [], resourceChanges: [],
    tempModifiers: [], grantedSkills: [], statusOps: [], errors: [],
  };
  const compiled = compileScript(src);
  if (!compiled.ok) {
    result.errors = compiled.diagnostics.filter(d => d.severity === 'error').map(d => d.message);
    return result;
  }
  try {
    new Interpreter(src, ctx, result).runProgram(compiled.program);
    result.ok = true;
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e));
  }
  return result;
}

interface Frame { vars: Map<string, ScriptValue>; parent: Frame | null; }

class Interpreter {
  private rng: () => number;
  /** Accumulated temp-modifier deltas per target, while inside a lifecycle block. */
  private tempDeltas: Map<StatusModifierTarget, number> | null = null;
  /** Per-loop cap and a global iteration budget to prevent runaway scripts. */
  private readonly LOOP_CAP = 10000;
  private readonly TOTAL_BUDGET = 200000;
  private totalIterations = 0;

  constructor(private src: string, private ctx: CharacterContext, private result: ScriptResult) {
    this.rng = ctx.rng ?? Math.random;
  }

  private tick(): void {
    if (++this.totalIterations > this.TOTAL_BUDGET) {
      throw new ScriptError('Iterationslimit überschritten');
    }
  }

  runProgram(program: Program): void {
    const frame: Frame = { vars: new Map(), parent: null };
    for (const s of program.body) this.execStmt(s, frame);
  }

  // ── Statements ──

  private execStmt(stmt: Stmt, frame: Frame): void {
    switch (stmt.kind) {
      case 'VarDecl':
        frame.vars.set(stmt.name, this.evalExpr(stmt.value, frame));
        break;
      case 'Assign':
        this.execAssign(stmt, frame);
        break;
      case 'ExprStmt':
        this.evalExpr(stmt.expr, frame);
        break;
      case 'If':
        if (truthy(this.evalExpr(stmt.test, frame))) this.execBlock(stmt.then, frame);
        else if (stmt.else) {
          if (stmt.else.kind === 'Block') this.execBlock(stmt.else, frame);
          else this.execStmt(stmt.else, frame);
        }
        break;
      case 'Block':
        this.execBlock(stmt, frame);
        break;
      case 'Repeat': {
        const n = Math.max(0, Math.min(this.LOOP_CAP, Math.floor(toNum(this.evalExpr(stmt.count, frame)))));
        for (let k = 0; k < n; k++) { this.tick(); this.execBlock(stmt.body, frame); }
        break;
      }
      case 'While': {
        let guard = 0;
        while (truthy(this.evalExpr(stmt.test, frame))) {
          this.tick();
          if (++guard > this.LOOP_CAP) throw new ScriptError('Schleifenlimit überschritten (mögliche Endlosschleife)');
          this.execBlock(stmt.body, frame);
        }
        break;
      }
      case 'Lifecycle':
        this.execLifecycle(stmt, frame);
        break;
      case 'GrantSkill':
        this.execGrantSkill(stmt, frame);
        break;
      case 'ActionDecl':
        // Declaration only; body runs when invoked. (Invocation reserved for M6.)
        break;
    }
  }

  private execBlock(block: Block, parent: Frame): void {
    const frame: Frame = { vars: new Map(), parent };
    for (const s of block.body) this.execStmt(s, frame);
  }

  private execLifecycle(stmt: Extract<Stmt, { kind: 'Lifecycle' }>, parent: Frame): void {
    const outer = this.tempDeltas;
    this.tempDeltas = new Map();
    const frame: Frame = { vars: new Map(), parent };
    for (const s of stmt.body.body) this.execStmt(s, frame);

    // Persist temp modifiers only when combat is active (out of combat = instant/no-op).
    if (this.ctx.inCombat()) {
      for (const [target, amount] of this.tempDeltas) {
        if (amount !== 0) this.result.tempModifiers.push({ target, amount });
      }
    }
    this.tempDeltas = outer;
  }

  private execGrantSkill(stmt: Extract<Stmt, { kind: 'GrantSkill' }>, frame: Frame): void {
    const name = String(this.evalExpr(stmt.args[0], frame));
    const manaCost = stmt.args[1] ? toNum(this.evalExpr(stmt.args[1], frame)) : 0;
    const energyCost = stmt.args[2] ? toNum(this.evalExpr(stmt.args[2], frame)) : 0;
    const lifeCost = stmt.args[3] ? toNum(this.evalExpr(stmt.args[3], frame)) : 0;
    // Capture the action body as source so the granted skill can run it later.
    const script = this.src.slice(stmt.body.from + 1, stmt.body.to - 1).trim();
    this.result.grantedSkills.push({ name, manaCost, energyCost, lifeCost, script });
  }

  private execAssign(stmt: Extract<Stmt, { kind: 'Assign' }>, frame: Frame): void {
    const rhs = this.evalExpr(stmt.value, frame);
    const target = stmt.target;
    if (target.kind !== 'Identifier') throw new ScriptError('Ungültiges Zuweisungsziel');
    const name = target.name;

    // Local variable?
    const declaringFrame = this.findVarFrame(frame, name);
    if (declaringFrame) {
      declaringFrame.vars.set(name, this.applyAssignOp(stmt.op, declaringFrame.vars.get(name), rhs));
      return;
    }

    // Game stat inside a lifecycle block → temp modifier delta.
    const sym = SYMBOL_MAP.get(name);
    if (sym?.assignable && sym.modifierTarget && this.tempDeltas) {
      const current = toNum(this.ctx.readScalar(name));
      const newValue = toNum(this.applyAssignOp(stmt.op, current, rhs));
      const delta = newValue - current;
      this.tempDeltas.set(sym.modifierTarget, (this.tempDeltas.get(sym.modifierTarget) ?? 0) + delta);
      return;
    }
    // Should be unreachable (checker forbids), but guard anyway.
    throw new ScriptError(`'${name}' kann hier nicht zugewiesen werden`);
  }

  private applyAssignOp(op: AssignOp, current: ScriptValue | undefined, rhs: ScriptValue): ScriptValue {
    if (op === '=') return rhs;
    const a = toNum(current ?? 0);
    const b = toNum(rhs);
    switch (op) {
      case '+=': return typeof current === 'string' || typeof rhs === 'string' ? String(current ?? '') + String(rhs) : a + b;
      case '-=': return a - b;
      case '*=': return a * b;
      case '/=': return b === 0 ? 0 : a / b;
    }
  }

  private findVarFrame(frame: Frame | null, name: string): Frame | null {
    for (let f = frame; f; f = f.parent) if (f.vars.has(name)) return f;
    return null;
  }

  // ── Expressions ──

  private evalExpr(expr: Expr, frame: Frame): ScriptValue {
    switch (expr.kind) {
      case 'Number': return expr.value;
      case 'String': return expr.value;
      case 'Bool': return expr.value;
      case 'Dice': return this.doRoll(expr.count, expr.sides, `${expr.count}d${expr.sides}`);
      case 'Identifier': return this.readIdentifier(expr.name, frame);
      case 'Member': return this.readMember(expr, frame);
      case 'Unary': {
        const v = this.evalExpr(expr.operand, frame);
        return expr.op === '-' ? -toNum(v) : !truthy(v);
      }
      case 'Logical': {
        const l = this.evalExpr(expr.left, frame);
        if (expr.op === '&&') return truthy(l) ? this.evalExpr(expr.right, frame) : l;
        return truthy(l) ? l : this.evalExpr(expr.right, frame);
      }
      case 'Binary': return this.evalBinary(expr, frame);
      case 'Call': return this.evalCall(expr, frame);
    }
  }

  private readIdentifier(name: string, frame: Frame): ScriptValue {
    const f = this.findVarFrame(frame, name);
    if (f) return f.vars.get(name)!;
    if (SYMBOL_MAP.has(name)) return this.ctx.readScalar(name);
    throw new ScriptError(`Unbekanntes Symbol '${name}'`);
  }

  private readMember(expr: Extract<Expr, { kind: 'Member' }>, _frame: Frame): ScriptValue {
    if (expr.object.kind === 'Identifier') {
      if (expr.object.name === 'talent') return this.ctx.readTalent(expr.property);
      return this.ctx.readAttributeMember(expr.object.name, expr.property);
    }
    throw new ScriptError('Nicht unterstützter Eigenschaftszugriff');
  }

  private evalBinary(expr: Extract<Expr, { kind: 'Binary' }>, frame: Frame): ScriptValue {
    const l = this.evalExpr(expr.left, frame);
    const r = this.evalExpr(expr.right, frame);
    switch (expr.op) {
      case '+': return (typeof l === 'string' || typeof r === 'string') ? String(l) + String(r) : toNum(l) + toNum(r);
      case '-': return toNum(l) - toNum(r);
      case '*': return toNum(l) * toNum(r);
      case '/': return toNum(r) === 0 ? 0 : toNum(l) / toNum(r);
      case '%': return toNum(r) === 0 ? 0 : toNum(l) % toNum(r);
      case '<': return toNum(l) < toNum(r);
      case '>': return toNum(l) > toNum(r);
      case '<=': return toNum(l) <= toNum(r);
      case '>=': return toNum(l) >= toNum(r);
      case '==': return l === r;
      case '!=': return l !== r;
    }
  }

  private evalCall(expr: Extract<Expr, { kind: 'Call' }>, frame: Frame): ScriptValue {
    const name = expr.callee.name;
    const args = expr.args;

    switch (name) {
      case 'display':
        this.result.displays.push({ type: 'text', text: String(this.evalExpr(args[0], frame)), style: styleOf(args[1]) });
        return 0;
      case 'stat':
        this.result.displays.push({ type: 'stat', label: String(this.evalExpr(args[0], frame)), value: String(this.evalExpr(args[1], frame)), style: styleOf(args[2]) });
        return 0;
      case 'banner':
        this.result.displays.push({ type: 'banner', text: String(this.evalExpr(args[0], frame)), style: styleOf(args[1]) });
        return 0;
      case 'box':
        this.result.displays.push({ type: 'box', text: String(this.evalExpr(args[0], frame)), style: styleOf(args[1]) });
        return 0;
      case 'roll': {
        if (args.length === 1 && args[0].kind === 'Dice') {
          return this.doRoll(args[0].count, args[0].sides, `${args[0].count}d${args[0].sides}`);
        }
        const count = toNum(this.evalExpr(args[0], frame));
        const sides = args[1] ? toNum(this.evalExpr(args[1], frame)) : 20;
        return this.doRoll(count, sides, `${Math.floor(count)}d${Math.floor(sides)}`);
      }
      case 'loseResource':
      case 'gainResource': {
        const res = (args[0] as { name?: string }).name;
        if (!res || !RESOURCE_NAMES.has(res)) throw new ScriptError('Unbekannte Ressource');
        const amt = toNum(this.evalExpr(args[1], frame));
        this.result.resourceChanges.push({ resource: res, amount: name === 'loseResource' ? -amt : amt });
        return 0;
      }
      case 'applyStatus':
        this.result.statusOps.push({ op: 'apply', id: String(this.evalExpr(args[0], frame)), stacks: args[1] ? toNum(this.evalExpr(args[1], frame)) : 1 });
        return 0;
      case 'removeStatus':
        this.result.statusOps.push({ op: 'remove', id: String(this.evalExpr(args[0], frame)) });
        return 0;
      case 'hasSkill':
        return this.ctx.hasSkill(String(this.evalExpr(args[0], frame)));
      case 'min': return Math.min(...args.map(a => toNum(this.evalExpr(a, frame))));
      case 'max': return Math.max(...args.map(a => toNum(this.evalExpr(a, frame))));
      case 'floor': return Math.floor(toNum(this.evalExpr(args[0], frame)));
      case 'ceil': return Math.ceil(toNum(this.evalExpr(args[0], frame)));
      case 'round': return Math.round(toNum(this.evalExpr(args[0], frame)));
      case 'abs': return Math.abs(toNum(this.evalExpr(args[0], frame)));
      default:
        throw new ScriptError(`Unbekannte Funktion '${name}'`);
    }
  }

  private doRoll(count: number, sides: number, formula: string): number {
    const roll = rollDice(count, sides, this.rng);
    this.result.rolls.push({ name: formula, formula: roll.formula, rolls: roll.rolls, total: roll.total });
    return roll.total;
  }
}

// ── Value helpers ──

function toNum(v: ScriptValue | undefined): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  return 0;
}

function truthy(v: ScriptValue): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  return false;
}

/** A style-selector arg is a bareword identifier (good/bad/neutral/info); default neutral. */
function styleOf(arg: Expr | undefined): DisplayStyle {
  if (arg && arg.kind === 'Identifier' && (arg.name === 'good' || arg.name === 'bad' || arg.name === 'info' || arg.name === 'neutral')) {
    return arg.name;
  }
  return 'neutral';
}
