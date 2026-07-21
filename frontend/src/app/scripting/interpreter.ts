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
import { ACTION_TYPE_MAP, RESOURCE_NAMES, SYMBOL_MAP } from './symbols';

export type ScriptValue = number | string | boolean;

export type DisplayStyle = 'good' | 'bad' | 'neutral' | 'info';
export type DisplayItem =
  | { type: 'text'; text: string; style: DisplayStyle }
  | { type: 'stat'; label: string; value: string; style: DisplayStyle }
  | { type: 'banner'; text: string; style: DisplayStyle }
  | { type: 'box'; text: string; style: DisplayStyle };

export interface ScriptRoll { name: string; formula: string; rolls: number[]; total: number; }
export interface ScriptResourceChange { resource: string; amount: number; } // negative = lose

/** How a modifier combines with the running value in the stat pipeline. */
export type ModifierOp = 'add' | 'sub' | 'mul' | 'div' | 'set';
/** A stat modifier produced by an `effectActive` block. Priority/source added by the collector. */
export interface ScriptModifier { target: StatusModifierTarget; op: ModifierOp; amount: number; }

export interface ScriptGrantedSkill {
  name: string;
  description: string;
  actionType?: 'Aktion' | 'Bonusaktion' | 'Keine Aktion' | 'Reaktion';
  manaCost: number; energyCost: number; lifeCost: number;
  script: string;
}
export interface ScriptStatusOp { op: 'apply' | 'remove'; id: string; stacks?: number; }
/** A status effect created + applied on the fly via giveStatus(...) { …body… }. */
export interface ScriptGivenStatus {
  name: string; description: string; stacks: number; duration?: number;
  icon?: string; isDebuff: boolean; script: string;
}

export interface ScriptResult {
  ok: boolean;
  displays: DisplayItem[];
  rolls: ScriptRoll[];
  resourceChanges: ScriptResourceChange[];
  /**
   * Stat modifiers from `effectActive` blocks. Only populated in "collect" runs (used by
   * TrueStatsService to derive stats while the effect is active). Empty on trigger runs.
   */
  modifiers: ScriptModifier[];
  grantedSkills: ScriptGrantedSkill[];
  statusOps: ScriptStatusOp[];
  givenStatuses: ScriptGivenStatus[];
  errors: string[];
}

/**
 * Run options:
 *  - collect: derive continuous effectActive modifiers/skills (no side effects).
 *  - trigger: run ONLY the named onTrigger block's body (a manual, event-based action).
 * With neither, it's a "base" run: top-level statements execute; onTrigger blocks are skipped.
 */
export interface RunOptions { collect?: boolean; trigger?: string; }

function opFromAssign(op: AssignOp): ModifierOp {
  switch (op) {
    case '=': return 'set';
    case '+=': return 'add';
    case '-=': return 'sub';
    case '*=': return 'mul';
    case '/=': return 'div';
  }
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
export function runScript(src: string, ctx: CharacterContext, opts: RunOptions = {}): ScriptResult {
  const result: ScriptResult = {
    ok: false, displays: [], rolls: [], resourceChanges: [],
    modifiers: [], grantedSkills: [], statusOps: [], givenStatuses: [], errors: [],
  };
  const compiled = compileScript(src);
  if (!compiled.ok) {
    result.errors = compiled.diagnostics.filter(d => d.severity === 'error').map(d => d.message);
    return result;
  }
  try {
    new Interpreter(src, ctx, result, !!opts.collect, opts.trigger ?? null).runProgram(compiled.program);
    result.ok = true;
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e));
  }
  return result;
}

/** List the named onTrigger blocks in a script (for the manual-trigger UI). Tolerant of errors. */
export function listTriggers(src: string): { name: string }[] {
  const out: { name: string }[] = [];
  for (const s of compileScript(src).program.body) {
    if (s.kind === 'TriggerDecl' && s.name) out.push({ name: s.name });
  }
  return out;
}

/**
 * Does a base run of this script do anything observable? True when there is any top-level
 * statement that is neither an onTrigger block (manual) nor an effectActive block (passive).
 */
export function hasBaseAction(src: string): boolean {
  return compileScript(src).program.body.some(s => s.kind !== 'TriggerDecl' && s.kind !== 'Lifecycle');
}

interface Frame { vars: Map<string, ScriptValue>; parent: Frame | null; }

class Interpreter {
  private rng: () => number;
  /** True while executing an effectActive block (so stat assignments become modifiers). */
  private inEffectActive = false;
  /** Per-loop cap and a global iteration budget to prevent runaway scripts. */
  private readonly LOOP_CAP = 10000;
  private readonly TOTAL_BUDGET = 200000;
  private totalIterations = 0;

  /**
   * Two execution modes:
   *  - trigger (collect=false): the effect just fired. Run top-level side effects (dice,
   *    display, resource changes). `effectActive` blocks are skipped — they are continuous,
   *    not one-shot.
   *  - collect (collect=true): derive the effect's continuous contribution. Side-effect
   *    built-ins are no-ops and dice are deterministic; only `effectActive` blocks do work,
   *    yielding stat modifiers + granted skills.
   */
  constructor(
    private src: string, private ctx: CharacterContext, private result: ScriptResult,
    private collect: boolean, private triggerName: string | null,
  ) {
    this.rng = ctx.rng ?? Math.random;
  }

  private tick(): void {
    if (++this.totalIterations > this.TOTAL_BUDGET) {
      throw new ScriptError('Iterationslimit überschritten');
    }
  }

  runProgram(program: Program): void {
    const frame: Frame = { vars: new Map(), parent: null };
    // Trigger run: execute ONLY the matching onTrigger block's body.
    if (this.triggerName !== null) {
      for (const s of program.body) {
        if (s.kind === 'TriggerDecl' && s.name === this.triggerName) this.execBlock(s.body, frame);
      }
      return;
    }
    // Base / collect run: execute top-level statements (onTrigger blocks are skipped here).
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
      case 'GiveStatus':
        this.execGiveStatus(stmt, frame);
        break;
      case 'TriggerDecl':
        // Named manual action — never runs during a base/collect pass (only via a trigger run).
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
    // effectActive is continuous: it only does work during a collect run (deriving the
    // effect's modifiers/skills). On a trigger run it is skipped entirely.
    if (!this.collect) return;
    const outer = this.inEffectActive;
    this.inEffectActive = true;
    const frame: Frame = { vars: new Map(), parent };
    for (const s of stmt.body.body) this.execStmt(s, frame);
    this.inEffectActive = outer;
  }

  private execGrantSkill(stmt: Extract<Stmt, { kind: 'GrantSkill' }>, frame: Frame): void {
    // Granted skills are effect-bound: derived only during collection, inside effectActive.
    if (!this.collect || !this.inEffectActive) return;
    const a = stmt.args;
    // grantSkill(name, description?, actionType?, manaCost?, energyCost?, lifeCost?)
    const name = String(this.evalExpr(a[0], frame));
    const description = a[1] ? String(this.evalExpr(a[1], frame)) : '';
    // actionType is a bare identifier (Aktion/Bonusaktion/…) — read structurally, not eval'd.
    const actionType = a[2]?.kind === 'Identifier' ? ACTION_TYPE_MAP[a[2].name] : undefined;
    const manaCost = a[3] ? toNum(this.evalExpr(a[3], frame)) : 0;
    const energyCost = a[4] ? toNum(this.evalExpr(a[4], frame)) : 0;
    const lifeCost = a[5] ? toNum(this.evalExpr(a[5], frame)) : 0;
    // Capture the action body as source so the granted skill can run it later.
    const script = this.src.slice(stmt.body.from + 1, stmt.body.to - 1).trim();
    this.result.grantedSkills.push({ name, description, actionType, manaCost, energyCost, lifeCost, script });
  }

  private execGiveStatus(stmt: Extract<Stmt, { kind: 'GiveStatus' }>, frame: Frame): void {
    // A side effect: create + apply a new status. Suppressed during a collect pass.
    if (this.collect) return;
    const a = stmt.args;
    // giveStatus(name, description?, stacks?, duration?, icon?, buff|debuff?)
    const name = String(this.evalExpr(a[0], frame));
    const description = a[1] ? String(this.evalExpr(a[1], frame)) : '';
    const stacks = a[2] ? Math.max(1, Math.floor(toNum(this.evalExpr(a[2], frame)))) : 1;
    const duration = a[3] ? toNum(this.evalExpr(a[3], frame)) : undefined;
    const icon = a[4] ? String(this.evalExpr(a[4], frame)) : undefined;
    // Polarity is a bare identifier (buff/debuff) — read structurally, not eval'd.
    const isDebuff = a[5]?.kind === 'Identifier' ? a[5].name === 'debuff' : true;
    // The body is a full effect script (can contain effectActive) — captured as source.
    const script = this.src.slice(stmt.body.from + 1, stmt.body.to - 1).trim();
    this.result.givenStatuses.push({ name, description, stacks, duration, icon, isDebuff, script });
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

    // Game stat inside an effectActive block → a derived modifier carrying its operation.
    // The RHS value becomes the modifier amount; the assignment operator becomes the op,
    // so `speed += 2`, `speed *= 2`, `speed = 0` all feed the stat pipeline in order.
    const sym = SYMBOL_MAP.get(name);
    if (sym?.assignable && sym.modifierTarget && this.inEffectActive) {
      this.result.modifiers.push({ target: sym.modifierTarget, op: opFromAssign(stmt.op), amount: toNum(rhs) });
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

  /** Side-effect built-ins do nothing during a collect run (only effectActive matters then). */
  private static readonly SIDE_EFFECTS = new Set([
    'display', 'stat', 'banner', 'box', 'loseResource', 'gainResource', 'applyStatus', 'removeStatus',
  ]);

  private evalCall(expr: Extract<Expr, { kind: 'Call' }>, frame: Frame): ScriptValue {
    const name = expr.callee.name;
    const args = expr.args;

    // During collection we still evaluate arguments (they may have no side effects) but
    // suppress the observable effect, so continuous derivation stays pure.
    if (this.collect && Interpreter.SIDE_EFFECTS.has(name)) {
      for (const a of args) if (a.kind !== 'Identifier') this.evalExpr(a, frame);
      return 0;
    }

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
    // During collection, dice must be deterministic (the block re-evaluates on every stat
    // read) — use the average so a dice-gated effectActive stays stable rather than flickering.
    if (this.collect) {
      const c = Math.max(0, Math.floor(count)), s = Math.max(0, Math.floor(sides));
      return Math.round(c * (s + 1) / 2);
    }
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
