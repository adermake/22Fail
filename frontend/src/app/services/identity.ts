/**
 * Stored device identity — the currently signed-in user's id + join code, persisted in
 * localStorage so a user only enters them once per device (no re-login each visit).
 *
 * A plain module (not an Angular service) so the socket services and the HTTP interceptor can
 * read it without a DI cycle through AuthService. AuthService owns the reactive/signal wrapper.
 */
const STORAGE_KEY = 'app:current-user';

export interface StoredIdentity { userId: string; code: string }

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

export function clearStoredIdentity(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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
