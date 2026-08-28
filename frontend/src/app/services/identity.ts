/**
 * Stored device identity — the currently signed-in user's id + join code, persisted in
 * localStorage so a user only enters them once per device (no re-login each visit).
 *
 * A plain module (not an Angular service) so the socket services and the HTTP interceptor can
 * read it without a DI cycle through AuthService. AuthService owns the reactive/signal wrapper.
 */
const STORAGE_KEY = 'app:current-user';
/** Every identity this device has ever signed in with — survives "Nutzer wechseln". */
const KNOWN_KEY = 'app:known-users';

export interface StoredIdentity { userId: string; code: string }

/** A remembered account, enriched with what we need to render a one-click login button. */
export interface KnownAccount extends StoredIdentity {
  name: string;
  isAdmin: boolean;
  lastUsed: number;
}

export function getStoredIdentity(): StoredIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.userId && p.code ? { userId: p.userId, code: p.code } : null;
  } catch {
    return null;
  }
}

export function setStoredIdentity(id: StoredIdentity): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(id)); } catch { /* ignore */ }
}

/** Sign out of the active session. Deliberately keeps the remembered-accounts list. */
export function clearStoredIdentity(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ── Remembered accounts ──

/** Accounts this device knows, most recently used first. */
export function getKnownAccounts(): KnownAccount[] {
  try {
    const raw = localStorage.getItem(KNOWN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((a: any) => a && a.userId && a.code && a.name)
      .map((a: any) => ({
        userId: String(a.userId), code: String(a.code), name: String(a.name),
        isAdmin: !!a.isAdmin, lastUsed: Number(a.lastUsed) || 0,
      }))
      .sort((a: KnownAccount, b: KnownAccount) => b.lastUsed - a.lastUsed);
  } catch {
    return [];
  }
}

function writeKnownAccounts(list: KnownAccount[]): void {
  try { localStorage.setItem(KNOWN_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

/** Record (or refresh) an account on this device. Keyed by user id, so codes stay up to date. */
export function rememberAccount(acc: Omit<KnownAccount, 'lastUsed'>): void {
  const rest = getKnownAccounts().filter(a => a.userId !== acc.userId);
  writeKnownAccounts([{ ...acc, lastUsed: Date.now() }, ...rest].slice(0, 20));
}

/** Drop one remembered account (stale code, or the user asked to forget it). */
export function forgetAccount(userId: string): void {
  writeKnownAccounts(getKnownAccounts().filter(a => a.userId !== userId));
}

/** Identity headers to attach to HTTP requests (empty when signed out). */
export function identityHeaders(): Record<string, string> {
  const id = getStoredIdentity();
  return id ? { 'x-user-id': id.userId, 'x-user-code': id.code } : {};
}

/** Identity for the Socket.IO handshake `auth` field (undefined when signed out). */
export function identityAuth(): { userId: string; code: string } | undefined {
  const id = getStoredIdentity();
  return id ? { userId: id.userId, code: id.code } : undefined;
}
