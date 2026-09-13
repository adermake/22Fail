import { JsonPatch } from '../model/json-patch.model';

/**
 * Applying one `{ path, value }` patch to an object graph.
 *
 * The three rules every implementation in the app has to agree on:
 *
 *  - paths arrive slash-based (`/strokes/-`) or dot-based (`strokes.0.color`) and mean the same
 *  - a numeric segment indexes an array
 *  - a trailing `-` appends to an array
 *
 * They have drifted apart before — the lobby's copy created `{}` where the next segment needed an
 * array, so an appended stroke was stored under a literal `'-'` key and vanished. Shared here so
 * there is one behaviour to test rather than several to keep in step.
 */

/** '-' appends, a number indexes — either way that segment addresses an array. */
function isArrayKeySegment(key: string | undefined): boolean {
  return key === '-' || (key !== undefined && !Number.isNaN(parseInt(key, 10)));
}

export function applyJsonPatchTo(target: any, patch: JsonPatch): void {
  let normalizedPath = patch.path.trim();
  if (normalizedPath.startsWith('/')) normalizedPath = normalizedPath.substring(1);
  normalizedPath = normalizedPath.replace(/\//g, '.');

  const keys = normalizedPath.split('.');

  if (keys.length === 1) {
    target[keys[0]] = patch.value;
    return;
  }

  let current = target;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const index = parseInt(key, 10);

    if (!Number.isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else {
      current[key] ??= isArrayKeySegment(keys[i + 1]) ? [] : {};
      current = current[key];
    }
  }

  const finalKey = keys[keys.length - 1];

  if (finalKey === '-' && Array.isArray(current)) {
    current.push(patch.value);
    return;
  }

  const finalIndex = parseInt(finalKey, 10);
  if (!Number.isNaN(finalIndex) && Array.isArray(current)) {
    current[finalIndex] = patch.value;
  } else {
    current[finalKey] = patch.value;
  }
}
