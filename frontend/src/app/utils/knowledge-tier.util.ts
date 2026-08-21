/**
 * Craft knowledge (Materialien, Schmiedemerkmale, Wirkstoffe, Extraktoren, Braumerkmale) is graded
 * in three tiers instead of the old public/private flag:
 *
 *  - `geheim`    — no player ever sees it; only a GM handing over the knowledge reveals it.
 *  - `unbekannt` — visible in FREE crafting mode only. It is not general knowledge and cannot be
 *                  used in enforced crafting.
 *  - `bekannt`   — always visible to everyone.
 *
 * Old data carries `isPublic` instead: true → `bekannt`, false → `geheim`, which is exactly how it
 * behaved before, so nothing changes for existing libraries until someone re-grades an entry.
 */
export type KnowledgeTier = 'geheim' | 'unbekannt' | 'bekannt';

export interface KnowledgeGraded {
  knowledgeTier?: KnowledgeTier;
  /** Legacy flag, kept in sync so anything still reading it stays correct. */
  isPublic?: boolean;
}

export const KNOWLEDGE_TIERS: { value: KnowledgeTier; label: string; hint: string }[] = [
  { value: 'geheim',    label: 'Geheim',    hint: 'Nur sichtbar, wenn der GM das Wissen vergibt' },
  { value: 'unbekannt', label: 'Unbekannt', hint: 'Nur im freien Handwerksmodus sichtbar' },
  { value: 'bekannt',   label: 'Bekannt',   hint: 'Für alle Spieler sichtbar' },
];

/** The tier of an entry, deriving it from the legacy flag when it has not been graded yet. */
export function knowledgeTierOf(entry: KnowledgeGraded | null | undefined): KnowledgeTier {
  if (!entry) return 'geheim';
  if (entry.knowledgeTier) return entry.knowledgeTier;
  return entry.isPublic ? 'bekannt' : 'geheim';
}

/** Write a tier onto an entry, keeping the legacy `isPublic` flag consistent. */
export function setKnowledgeTier<T extends KnowledgeGraded>(entry: T, tier: KnowledgeTier): T {
  entry.knowledgeTier = tier;
  entry.isPublic = tier === 'bekannt';
  return entry;
}

export interface KnowledgeVisibility {
  /** The character was granted this entry explicitly (known…Ids on the sheet). */
  known: boolean;
  /** Free crafting mode — the sandbox where `unbekannt` entries may be browsed. */
  freeMode?: boolean;
  /** GM/"unlock all" view: show everything. */
  unlockAll?: boolean;
}

/** Whether a character may see this piece of knowledge in the current context. */
export function isKnowledgeVisible(entry: KnowledgeGraded, ctx: KnowledgeVisibility): boolean {
  if (ctx.unlockAll || ctx.known) return true;
  switch (knowledgeTierOf(entry)) {
    case 'bekannt':   return true;
    case 'unbekannt': return !!ctx.freeMode;
    default:          return false;
  }
}

/** Whether an entry may actually be USED in enforced crafting (never true for `unbekannt`). */
export function isKnowledgeUsable(entry: KnowledgeGraded, ctx: KnowledgeVisibility): boolean {
  if (ctx.unlockAll || ctx.known) return true;
  return knowledgeTierOf(entry) === 'bekannt';
}
