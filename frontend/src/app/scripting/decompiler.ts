/**
 * Legacy → FailScript decompiler.
 *
 * Converts the old structured `ActionMacro` (conditions + consequences) and the simpler
 * `MacroAction` into equivalent FailScript source, so existing saved skills / spells /
 * status effects keep working through the single (new) interpreter, and users can migrate
 * by editing the generated script.
 */

import { ActionCondition, ActionConsequence, ActionMacro } from '../model/action-macro.model';
import { MacroAction } from '../model/macro-action.model';

/** Legacy `chill` stat → FailScript `wille`; everything else is identity. */
function statName(s: string): string {
  return s === 'chill' ? 'wille' : s;
}

function escapeStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
function str(s: string): string {
  return `"${escapeStr(s)}"`;
}

/**
 * A legacy dice/number formula ("2d6+3", "10", "1d20") → a FailScript numeric expression.
 * Dice literals auto-roll in numeric context, so no `roll(...)` wrapper is needed.
 */
export function legacyFormulaToExpr(formula: string | undefined, fallback = 0): string {
  const f = (formula ?? '').trim();
  if (!f) return String(fallback);
  const m = f.match(/^(\d+)d(\d+)\s*([+-]\s*\d+)?$/i);
  if (m) {
    const dice = `${m[1]}d${m[2]}`;
    if (m[3]) {
      const k = m[3].replace(/\s+/g, '');
      return `${dice} ${k[0]} ${k.slice(1)}`;
    }
    return dice;
  }
  const n = parseFloat(f);
  return isNaN(n) ? String(fallback) : String(n);
}

function conditionExpr(c: ActionCondition): string {
  if (c.type === 'skill' && c.skillName) return `hasSkill(${str(c.skillName)})`;

  let left = '0';
  if (c.type === 'resource' && c.resource) left = c.resource;
  else if (c.type === 'stat' && c.stat) left = statName(c.stat);

  let right = String(c.value ?? 0);
  if (c.valueType === 'currentResource' && c.compareToResource) right = c.compareToResource;
  else if (c.valueType === 'maxResource' && c.compareToResource) right = `${c.compareToResource}Max`;
  else if (c.valueType === 'stat' && c.compareToStat) right = statName(c.compareToStat);

  return `${left} ${c.operator} ${right}`;
}

function consequenceStmt(c: ActionConsequence): string {
  const expr = legacyFormulaToExpr(c.diceFormula, c.amount ?? 0);
  switch (c.type) {
    case 'dice_roll':
      return `stat(${str(c.rollName || 'Wurf')}, ${expr})`;
    case 'spend_resource':
      return c.resource ? `loseResource(${c.resource}, ${expr})` : '// spend_resource ohne Ressource';
    case 'gain_resource':
      return c.resource ? `gainResource(${c.resource}, ${expr})` : '// gain_resource ohne Ressource';
    case 'apply_bonus':
      return `// apply_bonus wird nicht mehr unterstützt${c.bonusName ? ` (${c.bonusName})` : ''}`;
    default:
      return '// unbekannte Konsequenz';
  }
}

/** Convert an ActionMacro to FailScript. Conditions gate the consequences. */
export function actionMacroToScript(m: ActionMacro): string {
  const body = (m.consequences ?? []).map(consequenceStmt).join('\n');
  if (m.conditions && m.conditions.length > 0) {
    const cond = m.conditions.map(c => `(${conditionExpr(c)})`).join(' && ');
    const indented = body.split('\n').map(l => (l ? '  ' + l : l)).join('\n');
    return `if (${cond}) {\n${indented}\n} else {\n  display("Bedingung nicht erfüllt", bad)\n}`;
  }
  return body;
}

/** Convert a MacroAction to FailScript. */
export function macroActionToScript(a: MacroAction): string {
  const p = a.parameters || {};
  switch (a.actionType) {
    case 'dice_roll':
      return `stat(${str(p.rollName || a.name || 'Wurf')}, ${legacyFormulaToExpr(p.diceFormula, 0)})`;
    case 'apply_damage':
      return `loseResource(health, ${legacyFormulaToExpr(p.diceAmount, p.amount ?? 0)})`;
    case 'apply_healing':
      return `gainResource(health, ${legacyFormulaToExpr(p.diceAmount, p.amount ?? 0)})`;
    case 'modify_resource':
      return p.resource
        ? `gainResource(${p.resource}, ${legacyFormulaToExpr(p.resourceDiceAmount, p.resourceAmount ?? 0)})`
        : '// modify_resource ohne Ressource';
    case 'modify_stat':
      return p.stat
        ? `untilNextTurn {\n  ${statName(p.stat)} += ${p.statModifier ?? 0}\n}`
        : '// modify_stat ohne Stat';
    case 'apply_status':
      return p.statusEffectId ? `applyStatus(${str(p.statusEffectId)})` : '// apply_status ohne id';
    case 'remove_status':
      return p.statusEffectId ? `removeStatus(${str(p.statusEffectId)})` : '// remove_status ohne id';
    case 'custom_message':
      return `display(${str(p.message || '')})`;
    default:
      return '// unbekannte Aktion';
  }
}

/** Join multiple macros into one script. */
export function actionMacrosToScript(macros: ActionMacro[]): string {
  return macros.map(actionMacroToScript).filter(s => s.trim()).join('\n\n');
}
