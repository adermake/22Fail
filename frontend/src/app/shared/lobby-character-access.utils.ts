/** Parse ?characterId=foo,bar,baz (commas, optional whitespace/trailing comma). */
export function parseCharacterIdParam(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(',').map(id => id.trim()).filter(Boolean);
}

export function formatCharacterIdParam(ids: Iterable<string>): string {
  return [...ids].join(',');
}

function storageKey(worldName: string): string {
  return `lobby:controlled-characters:${worldName}`;
}

export function loadControlledCharacterIds(worldName: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(worldName));
    if (!raw) return new Set();
    return new Set(parseCharacterIdParam(raw));
  } catch {
    return new Set();
  }
}

export function saveControlledCharacterIds(worldName: string, ids: Set<string>): void {
  try {
    localStorage.setItem(storageKey(worldName), formatCharacterIdParam(ids));
  } catch {
    // ignore quota / private mode
  }
}

/** Merge URL param + stored IDs (+ optional extra id), persist, and return the set. */
export function mergeControlledCharacterIds(
  worldName: string,
  fromUrl: string | null | undefined,
  extraId?: string,
): Set<string> {
  const merged = loadControlledCharacterIds(worldName);
  for (const id of parseCharacterIdParam(fromUrl)) {
    merged.add(id);
  }
  if (extraId) {
    merged.add(extraId);
  }
  saveControlledCharacterIds(worldName, merged);
  return merged;
}
