/**
 * Secret groups: bundling map objects so the GM hides and reveals them as one thing.
 *
 * A secret at the table is rarely one object. "The bandit camp" is a label, three tents and a
 * region outline, and they have to appear together — revealing them one by one shows the
 * players a puzzle assembling itself. Per-object `vis` could already hide each piece; what was
 * missing was a handle for the set.
 *
 * ## `vis` stays the authority
 *
 * A group is a *label on top of* the existing visibility flag, never a replacement for it. The
 * server already strips `vis: 'secret'` objects out of player payloads (`viewFor`) and already
 * broadcasts a secret-to-public flip as a fresh `add` (`map-editor.gateway.ts`). Both keep
 * working untouched, because grouping writes `vis` exactly as the per-object checkbox does.
 *
 * The alternative — letting the group decide visibility — would mean two sources of truth for
 * "may a player see this", and the server would have to consult a group table to answer it.
 * The first object whose two answers disagreed would leak.
 *
 * ## One-directional membership
 *
 * Groups hold no member list; objects point at their group through `secret`. A two-sided model
 * needs both halves updated on every delete, move and undo, and drifts the first time one of
 * them is missed. Deriving members by scanning is cheap enough — this runs on a click, not per
 * frame — and cannot disagree with itself.
 *
 * ## Why membership is cleared with `''`
 *
 * `applyMapOp` applies an `upd` with `Object.assign`, so `{ secret: undefined }` works in
 * memory. It does not survive the trip: ops cross the socket as JSON, and `JSON.stringify`
 * silently omits undefined-valued keys. The sender would watch the object leave the group
 * while every other client — and the file on disk — kept it in. Always `''`.
 *
 * This module is pure: no Pixi, no Angular, no sockets. It decides *which ops to send*, and the
 * caller sends them.
 */

import { AnyMapObject, MapEditorData, MapOp, MapSecret, ObjectCollection } from './map-editor.model';

/** An object addressed across collections — what a cross-category selection is made of. */
export interface ObjectRef {
  c: ObjectCollection;
  id: string;
}

/** A group plus the state the panel needs to render it. */
export interface SecretSummary {
  secret: MapSecret;
  members: ObjectRef[];
  /** True once every member is public — the group has been let out. */
  revealed: boolean;
}

/** Collections a secret group can draw from. `markers` has no view yet, so nothing can pick one. */
export const SECRET_COLLECTIONS: readonly ObjectCollection[] = ['labels', 'symbols', 'regions'];

/** The groups on a document, tolerating one written before the field existed. */
export function secretsOf(data: MapEditorData): MapSecret[] {
  return Array.isArray(data.secrets) ? data.secrets : [];
}

export function newSecretId(): string {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Objects belonging to a group, in collection order. */
export function membersOf(data: MapEditorData, secretId: string): ObjectRef[] {
  const out: ObjectRef[] = [];
  if (!secretId) return out;
  for (const c of SECRET_COLLECTIONS) {
    for (const o of data[c] as AnyMapObject[]) {
      if (o.secret === secretId) out.push({ c, id: o.id });
    }
  }
  return out;
}

/**
 * Every group with its members and reveal state.
 *
 * A group with no members left is reported too, so the panel can show it and the GM can delete
 * it. Dropping it here instead would make groups vanish on their own the moment their last
 * object is deleted — surprising, and it would take the name with it.
 */
export function summarize(data: MapEditorData): SecretSummary[] {
  // Defended rather than assumed: the server backfills the field on load, but a document
  // cached from before this existed would otherwise take the whole editor down on render.
  return secretsOf(data).map(secret => {
    const members = membersOf(data, secret.id);
    return { secret, members, revealed: members.length > 0 && members.every(m => isPublic(data, m)) };
  });
}

function isPublic(data: MapEditorData, ref: ObjectRef): boolean {
  return find(data, ref)?.vis !== 'secret';
}

export function find(data: MapEditorData, ref: ObjectRef): AnyMapObject | undefined {
  return (data[ref.c] as AnyMapObject[]).find(o => o.id === ref.id);
}

/**
 * Ops that put a selection into a group and hide it.
 *
 * Sets `vis` as well as `secret`, because "group as secret" is one act to the user: they picked
 * the things nobody should see yet. An object already in another group moves; it cannot be in
 * two, since `secret` is a single field.
 */
export function groupOps(refs: readonly ObjectRef[], secretId: string): MapOp[] {
  return dedupe(refs).map(ref => ({
    t: 'upd' as const,
    c: ref.c,
    id: ref.id,
    v: { secret: secretId, vis: 'secret' as const },
  }));
}

/**
 * Ops that shift a whole group across the map.
 *
 * A secret is a place, not a pile of unrelated objects: the camp's label, its tents and its
 * outline have to keep their arrangement, so the whole set moves by one delta rather than
 * each member being dragged into position again.
 *
 * Regions carry their geometry in `points`, so moving one means moving every vertex — moving
 * only the cached centroid would leave the outline behind and silently corrupt the index.
 */
export function moveOps(
  refs: readonly ObjectRef[],
  origins: ReadonlyMap<string, AnyMapObject>,
  dx: number,
  dy: number,
): MapOp[] {
  const ops: MapOp[] = [];
  for (const ref of dedupe(refs)) {
    const from = origins.get(refKey(ref));
    if (!from) continue;

    const v: Record<string, unknown> = { x: from.x + dx, y: from.y + dy };
    if (ref.c === 'regions') {
      const points = (from as { points?: { x: number; y: number }[] }).points ?? [];
      v['points'] = points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    }
    ops.push({ t: 'upd', c: ref.c, id: ref.id, v });
  }
  return ops;
}

export function refKey(ref: ObjectRef): string {
  return `${ref.c}:${ref.id}`;
}

/** A hit, with how deep the click fell inside the shape: 0 dead centre, 1 on the edge. */
export interface ScoredHit extends ObjectRef {
  score: number;
}

/**
 * The candidate the click sits deepest inside.
 *
 * Ranking by collection instead made symbols unpickable. A label's reach is its whole box,
 * so a name stretched across a valley contained every icon under it, and with labels checked
 * first the arrow could only ever return the label — clicking a castle got you its name.
 *
 * Comparing depth fixes that without needing a rule about which kind of thing matters more:
 * a click in the middle of a castle is deep inside the castle and near the edge of the label,
 * so the castle wins; a click on the lettering is the other way round. Ties fall to input
 * order, which callers give as what is drawn on top.
 */
export function pickTightest(candidates: readonly (ScoredHit | null)[]): ObjectRef | null {
  let best: ScoredHit | null = null;
  for (const c of candidates) {
    if (!c || !Number.isFinite(c.score)) continue;
    if (!best || c.score < best.score) best = c;
  }
  return best ? { c: best.c, id: best.id } : null;
}

/**
 * Ops that reveal a group.
 *
 * Not reachable from the editor: revealing is a thing that happens at the table, in game
 * mode, not while drawing the map. Kept here because the rule — only `vis` changes, the
 * group survives — belongs with the rest of the group logic rather than being re-derived
 * wherever the reveal button eventually lands.
 *
 * Only `vis` changes — the group survives its own reveal, so it can be hidden again after the
 * party leaves, and so the panel can still say what that bundle was.
 */
export function revealOps(data: MapEditorData, secretId: string): MapOp[] {
  return membersOf(data, secretId)
    .filter(ref => !isPublic(data, ref))
    .map(ref => ({ t: 'upd' as const, c: ref.c, id: ref.id, v: { vis: 'public' as const } }));
}

/** Ops that hide a revealed group again. Game mode, like `revealOps`. */
export function hideOps(data: MapEditorData, secretId: string): MapOp[] {
  return membersOf(data, secretId)
    .filter(ref => isPublic(data, ref))
    .map(ref => ({ t: 'upd' as const, c: ref.c, id: ref.id, v: { vis: 'secret' as const } }));
}

/**
 * Ops that dissolve a group, leaving every object exactly as visible as it was.
 *
 * Dissolving is an organisational act, not a reveal. Letting it also make things public would
 * mean tidying up the panel could spill a secret onto the players' screens.
 */
export function dissolveOps(data: MapEditorData, secretId: string): MapOp[] {
  const ops: MapOp[] = membersOf(data, secretId).map(ref => ({
    t: 'upd' as const,
    c: ref.c,
    id: ref.id,
    v: { secret: '' },
  }));
  ops.push({
    t: 'set',
    path: 'secrets',
    value: secretsOf(data).filter(s => s.id !== secretId),
  });
  return ops;
}

/** Ops that remove a selection from its groups without touching visibility. */
export function ungroupOps(refs: readonly ObjectRef[]): MapOp[] {
  return dedupe(refs).map(ref => ({
    t: 'upd' as const,
    c: ref.c,
    id: ref.id,
    v: { secret: '' },
  }));
}

function dedupe(refs: readonly ObjectRef[]): ObjectRef[] {
  const seen = new Set<string>();
  const out: ObjectRef[] = [];
  for (const ref of refs) {
    const key = `${ref.c}:${ref.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}

/** Name for a new group, numbered so two unnamed ones stay distinguishable. */
export function defaultSecretName(existing: readonly MapSecret[]): string {
  let n = existing.length + 1;
  const taken = new Set(existing.map(s => s.name));
  while (taken.has(`Geheimnis ${n}`)) n++;
  return `Geheimnis ${n}`;
}
