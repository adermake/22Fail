/**
 * FailScript — a custom scripting language for action macros.
 *
 * Abstract Syntax Tree.
 *
 * A small Java/C-flavoured scripting language for action macros. See the design plan
 * (i-want-to-be-goofy-token.md). Nodes carry `from`/`to` character offsets so the editor
 * (CodeMirror) can anchor diagnostics and hovers.
 */

export interface Span {
  from: number;
  to: number;
}

export type BinaryOp = '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=' | '==' | '!=';
export type LogicalOp = '&&' | '||';
export type AssignOp = '=' | '+=' | '-=' | '*=' | '/=';

// ── Expressions ──────────────────────────────────────────────────────────────

export type Expr =
  | NumberLit
  | StringLit
  | BoolLit
  | DiceLit
  | Identifier
  | Member
  | Unary
  | Binary
  | Logical
  | Call;

export interface NumberLit extends Span { kind: 'Number'; value: number; }
export interface StringLit extends Span { kind: 'String'; value: string; }
export interface BoolLit extends Span { kind: 'Bool'; value: boolean; }

/** A static dice literal like `2d8`. Dynamic dice use the `roll(count, sides)` call. */
export interface DiceLit extends Span { kind: 'Dice'; count: number; sides: number; }

/** A bare name — a local variable or a game symbol (resolved by the checker/interpreter). */
export interface Identifier extends Span { kind: 'Identifier'; name: string; }

/** Member access, e.g. `talent.athletik`, `strength.modifier`. */
export interface Member extends Span { kind: 'Member'; object: Expr; property: string; propertySpan: Span; }

export interface Unary extends Span { kind: 'Unary'; op: '-' | '!'; operand: Expr; }
export interface Binary extends Span { kind: 'Binary'; op: BinaryOp; left: Expr; right: Expr; }
export interface Logical extends Span { kind: 'Logical'; op: LogicalOp; left: Expr; right: Expr; }

export interface Call extends Span {
  kind: 'Call';
  callee: Identifier;   // built-in function name (calls are only on bare identifiers)
  args: Expr[];
}

// ── Statements ───────────────────────────────────────────────────────────────

export type Stmt =
  | VarDecl
  | Assign
  | ExprStmt
  | IfStmt
  | Block
  | Lifecycle
  | GrantSkill
  | GiveStatus
  | TriggerDecl
  | ActionDecl
  | RepeatStmt
  | WhileStmt;

export interface VarDecl extends Span { kind: 'VarDecl'; name: string; nameSpan: Span; value: Expr; }

/** Assignment to an lvalue. Assigning a *game symbol* is only legal inside a lifecycle block. */
export interface Assign extends Span { kind: 'Assign'; target: Identifier | Member; op: AssignOp; value: Expr; }

export interface ExprStmt extends Span { kind: 'ExprStmt'; expr: Expr; }

export interface IfStmt extends Span { kind: 'If'; test: Expr; then: Block; else?: Block | IfStmt; }

/** `repeat(count) { … }` — bounded loop. */
export interface RepeatStmt extends Span { kind: 'Repeat'; keywordSpan: Span; count: Expr; body: Block; }

/** `while (test) { … }` — capped at a max iteration count at runtime. */
export interface WhileStmt extends Span { kind: 'While'; keywordSpan: Span; test: Expr; body: Block; }

export interface Block extends Span { kind: 'Block'; body: Stmt[]; }

/**
 * A lifecycle scope. `effectActive { … }` is the primary form: while the source effect is
 * active, the block's stat assignments become auto-derived modifiers (never mutating real
 * data) and its `grantSkill`s become derived skills — all vanish when the effect is gone.
 * `untilNextTurn` is a deprecated alias kept so old scripts still parse; it behaves the same.
 */
export interface Lifecycle extends Span { kind: 'Lifecycle'; lifecycle: 'untilNextTurn' | 'effectActive'; keywordSpan: Span; body: Block; }

/** `grantSkill(name, manaCost, energyCost, lifeCost) { …action body… }`. */
export interface GrantSkill extends Span {
  kind: 'GrantSkill';
  keywordSpan: Span;
  args: Expr[];
  body: Block;
}

/**
 * `giveStatus(name, description, stacks, duration) { …effect body (can hold effectActive)… }`
 * — creates and applies a new status effect on the fly (used from onTrigger blocks).
 */
export interface GiveStatus extends Span {
  kind: 'GiveStatus';
  keywordSpan: Span;
  args: Expr[];
  body: Block;
}

/**
 * `onTrigger("Label") { …trigger body… }` — a named, manually-fired action. Not run by the
 * periodic/base execution; listed in the UI so a player can trigger the moment it applies.
 */
export interface TriggerDecl extends Span {
  kind: 'TriggerDecl';
  name: string;
  nameSpan: Span;
  keywordSpan: Span;
  body: Block;
}

/** A named, reusable action block: `action teleport { … }`. */
export interface ActionDecl extends Span { kind: 'ActionDecl'; name: string; nameSpan: Span; body: Block; }

export interface Program extends Span { kind: 'Program'; body: Stmt[]; }

// ── Diagnostics ──────────────────────────────────────────────────────────────

export interface Diagnostic {
  from: number;
  to: number;
  severity: 'error' | 'warning';
  message: string;
}
