/**
 * fix-descriptions.js
 *
 * Reads AlleKlassen.txt (UTF-8) and updates skill-definitions.ts:
 *  - Restores correct German characters (ä/ö/ü/ß/∞ etc.) in names, class names, descriptions
 *  - Replaces all description fields with verbatim text from AlleKlassen.txt
 *
 * Run: node fix-descriptions.js
 */

const fs   = require('fs');
const path = require('path');

const ALLE_KLASSEN = 'C:\\Users\\adermake\\Downloads\\AlleKlassen.txt';
const SKILL_DEFS   = path.join(__dirname, 'frontend', 'src', 'app', 'data', 'skill-definitions.ts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Replace every non-ASCII code point with U+FFFD — this is what Node's UTF-8
 *  decoder produces when reading Latin-1/Windows-1252 bytes as UTF-8. */
function toBroken(str) {
  return Array.from(str).map(c => (c.codePointAt(0) > 127 ? '\uFFFD' : c)).join('');
}

/** Normalise a string for map lookup:
 *    1. Replace non-ASCII with U+FFFD
 *    2. Normalise whitespace around & */
function normKey(str) {
  return toBroken(str).replace(/\s*&\s*/g, '&').trim();
}

/** Strip the trailing cost (and optional action-type keyword) from an active-
 *  skill description. Only the last comma-delimited segment is removed when
 *  it starts with a digit or is "0". If the new last segment is exactly an
 *  action-type keyword it is also removed. */
function stripCost(desc) {
  const parts = desc.split(',');
  if (parts.length < 2) return desc.trim();
  const last = parts[parts.length - 1].trim();
  if (!/^\d/.test(last) && last !== '0') return desc.trim();
  const rest = parts.slice(0, -1);
  const newLast = rest.length ? rest[rest.length - 1].trim() : '';
  if (/^(Bonusaktion|Keine Aktion|Reaktion|Keine Bonusaktion)$/i.test(newLast)) {
    rest.pop();
  }
  return rest.join(',').trim();
}

// ---------------------------------------------------------------------------
// ID-based overrides for skills whose stored name is wrong/ambiguous.
// Map: skillId → correct skill name to look up in the parsed map.
// ---------------------------------------------------------------------------
const idNameOverrides = {
  'arkanist_verinnerlichen':        'Verinnererlichen',   // vs base 'Verinnerlichen'
  'runenkuenstler_verinnerlichen':  'Verinnerstlichen',   // third variant
};

// ---------------------------------------------------------------------------
// Step 1 — Parse AlleKlassen.txt
// ---------------------------------------------------------------------------

// Keys: normKey(name)  OR  normKey(name) + '|' + normKey(className)
const skillNameMap = new Map();  // key → correct name (with umlauts)
const skillDescMap = new Map();  // key → verbatim description
const classNameMap = new Map();  // normKey(className) → correct class name

let currentClass = '';

function registerSkill(name, desc) {
  if (!name) return;
  const key         = normKey(name);
  const compoundKey = key + '|' + normKey(currentClass);

  // Compound key (name+class): always safe, no collision
  skillNameMap.set(compoundKey, name);
  skillDescMap.set(compoundKey, desc);

  // Name-only key: first-write wins; warn on real collision
  if (skillNameMap.has(key)) {
    const prev = skillNameMap.get(key);
    if (prev !== name || skillDescMap.get(key) !== desc) {
      console.warn(`⚠  Name collision on key "${key}": using compound key only`);
    }
  } else {
    skillNameMap.set(key, name);
    skillDescMap.set(key, desc);
  }
}

const alleLines = fs.readFileSync(ALLE_KLASSEN, 'utf8').split('\n');

for (const rawLine of alleLines) {
  const line = rawLine.trim();
  if (!line) continue;
  if (/^TIER\s/i.test(line)) continue;
  if (/^-{3,}/.test(line))   continue;

  // ── Class header: ends with ':', and has no (p)/(a) on the same line ──
  if (line.endsWith(':') && !line.includes('(p)') && !line.includes('(a)')) {
    currentClass = line.slice(0, -1).trim();
    classNameMap.set(normKey(currentClass), currentClass);
    continue;
  }

  // ── Skill line: strip leading flag chars ──
  let s = line;
  if (s.startsWith('!')) s = s.slice(1);
  if (s.startsWith('+')) s = s.slice(1);
  s = s.trim();

  const pIdx = s.search(/\(p\)/);
  const aIdx = s.search(/\(a\)/);

  let name, desc;

  if (pIdx !== -1) {
    // Passive skill
    name = s.slice(0, pIdx).trim();
    const colon = s.indexOf(':', pIdx);
    desc = colon !== -1 ? s.slice(colon + 1).trim() : '';
  } else if (aIdx !== -1) {
    // Active skill — strip trailing cost
    name = s.slice(0, aIdx).trim();
    const colon = s.indexOf(':', aIdx);
    desc = colon !== -1 ? stripCost(s.slice(colon + 1)) : '';
  } else if (s.includes(':')) {
    // Implicit skill: "SkillName: description" (no (p)/(a) marker)
    const colonIdx = s.indexOf(':');
    name = s.slice(0, colonIdx).trim();
    desc = s.slice(colonIdx + 1).trim();
  } else {
    // Pure stat bonus: the line IS both name and description.
    // Strip trailing ∞ (stored separately as infiniteLevel: true).
    name = s.replace(/∞$/, '').trim();
    desc = name;
    // Register a secondary truncated key for lines like "Reichweite+10m für ...",
    // whose stored name in skill-definitions.ts may be just the prefix.
    const fuerIdx = name.indexOf(' f\xfcr ');  // ü
    if (fuerIdx !== -1) {
      registerSkill(name.slice(0, fuerIdx), desc);
    }
  }

  registerSkill(name, desc);
}

console.log(`Parsed  ${classNameMap.size} classes  and  ${[...new Set([...skillDescMap.keys()].filter(k => !k.includes('|')))].length} unique skills`);

// ---------------------------------------------------------------------------
// Step 2 — Process skill-definitions.ts line by line
// ---------------------------------------------------------------------------

const fileLines = fs.readFileSync(SKILL_DEFS, 'utf8').split('\n');
const output    = [];

let pendingId      = null;  // last seen skill id
let pendingNameKey = null;  // normalized lookup key for current skill
let pendingClass   = null;  // correct class name for compound-key lookup
let nameHits  = 0;
let nameMisses = 0;
let descHits  = 0;

/** Return the best lookup key: compound if it exists, otherwise name-only. */
function bestKey(nameKey, className) {
  if (className) {
    const ck = nameKey + '|' + normKey(className);
    if (skillDescMap.has(ck)) return ck;
  }
  return nameKey;
}

for (const rawLine of fileLines) {
  let line = rawLine;

  // ── id: 'VALUE' ──
  const idM = line.match(/^(\s+id:\s*')([^']+)('.*)/);
  if (idM) {
    pendingId = idM[2];
    output.push(line);
    continue;
  }

  // ── name: 'VALUE' ──
  const nameM = line.match(/^(\s+name:\s*')([^']+)('.*)/);
  if (nameM) {
    let brokenName = nameM[2];
    pendingClass = null; // reset for new skill object

    // Strip '+' prefix (requiresSkill flag, not part of the actual name)
    if (brokenName.startsWith('+')) brokenName = brokenName.slice(1);

    // Apply ID-based override when the stored name is wrong
    const overrideName = pendingId && idNameOverrides[pendingId];
    const lookupName   = overrideName || brokenName;

    // Use normKey so the lookup works whether the file still has broken U+FFFD
    // or was already corrected to proper UTF-8 in a previous run.
    const key = normKey(lookupName);
    const correct = skillNameMap.get(key);

    if (correct) {
      line = nameM[1] + correct + nameM[3];
      pendingNameKey = key;
      nameHits++;
    } else {
      pendingNameKey = null;
      nameMisses++;
      console.warn(`  ✗ No match: "${nameM[2]}"${overrideName ? ` (override: ${overrideName})` : ''}`);
    }
    output.push(line);
    continue;
  }

  // ── class: 'VALUE' — fix name AND store for compound lookup ──
  const classM = line.match(/^(\s+class:\s*')([^']+)('.*)/);
  if (classM) {
    const brokenClass = classM[2];
    const correct     = classNameMap.get(normKey(brokenClass));
    pendingClass      = correct || brokenClass;
    if (correct) line = classM[1] + correct + classM[3];
    output.push(line);
    continue;
  }

  // ── description: 'VALUE' ──
  const descM = line.match(/^(\s+description:\s*')([^']+)('.*)/);
  if (descM && pendingNameKey !== null) {
    const lk   = bestKey(pendingNameKey, pendingClass);
    const cdesc = skillDescMap.get(lk);
    if (cdesc !== undefined) {
      line = descM[1] + cdesc + descM[3];
      descHits++;
    }
    pendingNameKey = null;
    pendingClass   = null;
    output.push(line);
    continue;
  }

  output.push(line);
}

console.log(`Skills matched: ${nameHits}  (missed: ${nameMisses})`);
console.log(`Descriptions updated: ${descHits}`);

// ---------------------------------------------------------------------------
// Step 3 — Fix class names in CLASS_DEFINITIONS (keys + children arrays)
// ---------------------------------------------------------------------------

let content = output.join('\n');

for (const [brokenCls, correctCls] of classNameMap) {
  const escaped = brokenCls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  content = content.replace(new RegExp("'" + escaped + "'", 'g'), `'${correctCls}'`);
}

// ---------------------------------------------------------------------------
// Step 4 — Write output as UTF-8
// ---------------------------------------------------------------------------

fs.writeFileSync(SKILL_DEFS, content, 'utf8');
console.log('\n✔  skill-definitions.ts rewritten with correct UTF-8 and verbatim descriptions.');
