import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Lightweight user system — NOT real auth. A user is a display name plus an app-generated join
 * code (no user-chosen passwords, nothing sensitive to leak). Identity is "soft": the server is
 * the source of truth for who is admin and (via characters) what you control, which stops casual
 * URL-flipping cheats, but it is not cryptographically hardened.
 *
 * Stored as a single JSON array in data/users.json.
 */
export interface User {
  id: string;
  name: string;
  joinCode: string;
  isAdmin: boolean;
  createdAt: number;
}

const ADJECTIVES = [
  'swift',
  'brave',
  'silent',
  'lucky',
  'clever',
  'mighty',
  'gentle',
  'fierce',
  'sunny',
  'frosty',
  'golden',
  'shadow',
  'crimson',
  'azure',
  'jolly',
  'noble',
];
const NOUNS = [
  'otter',
  'falcon',
  'badger',
  'lynx',
  'raven',
  'wolf',
  'fox',
  'bear',
  'hawk',
  'stag',
  'owl',
  'moth',
  'newt',
  'toad',
  'crane',
  'boar',
];

/**
 * Master password that logs in as ANY user. This is a tool for a friends' game night, not a
 * secured product: it exists so the GM can get back into an account whose join code was lost and
 * can reproduce a player's view while debugging. Override with the ROOT_PASSWORD env var.
 */
const ROOT_PASSWORD = process.env.ROOT_PASSWORD || 'rootroot';

@Injectable()
export class UsersService {
  private dataDir = path.join(__dirname, '../../../data');
  private usersFile = path.join(this.dataDir, 'users.json');

  constructor() {
    if (!fs.existsSync(this.dataDir))
      fs.mkdirSync(this.dataDir, { recursive: true });
  }

  // ── Persistence ──
  private read(): User[] {
    try {
      if (!fs.existsSync(this.usersFile)) return [];
      const parsed = JSON.parse(fs.readFileSync(this.usersFile, 'utf-8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private write(users: User[]): void {
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2), 'utf-8');
  }

  // ── Id / code generation ──
  private genId(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private genCode(existing: User[]): string {
    const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
    for (let i = 0; i < 50; i++) {
      const code = `${pick(ADJECTIVES)}-${pick(NOUNS)}-${Math.floor(10 + Math.random() * 90)}`;
      if (!existing.some((u) => u.joinCode === code)) return code;
    }
    return `user-${Date.now().toString(36)}`;
  }

  // ── Queries ──
  list(): User[] {
    return this.read();
  }

  findById(id: string): User | undefined {
    return this.read().find((u) => u.id === id);
  }

  /** Resolve a user from the identity headers a client sends (soft auth). */
  resolve(userId?: string, code?: string): User | undefined {
    if (!userId || !code) return undefined;
    if (this.isRootPassword(code))
      return this.read().find((u) => u.id === userId);
    return this.read().find((u) => u.id === userId && u.joinCode === code);
  }

  /** True if `code` is the master password (constant-length-agnostic; soft auth, see above). */
  isRootPassword(code?: string): boolean {
    return !!code && code.trim() === ROOT_PASSWORD;
  }

  isEmpty(): boolean {
    return this.read().length === 0;
  }

  // ── Mutations ──
  /**
   * Log in by name + code (case-insensitive name). The master password works in place of any
   * user's join code. Returns the user or null.
   */
  login(name: string, code: string): User | null {
    const n = (name || '').trim().toLowerCase();
    const c = (code || '').trim();
    if (this.isRootPassword(c))
      return this.read().find((u) => u.name.toLowerCase() === n) ?? null;
    return (
      this.read().find((u) => u.name.toLowerCase() === n && u.joinCode === c) ??
      null
    );
  }

  /** Every user incl. join codes — only ever returned behind the master password. */
  listForRoot(password: string): User[] | null {
    return this.isRootPassword(password) ? this.read() : null;
  }

  /** Create the very first user as admin. Only allowed while there are no users. */
  bootstrapFirstAdmin(name: string): User {
    const users = this.read();
    if (users.length > 0) throw new Error('Users already exist');
    const user: User = {
      id: this.genId(),
      name: (name || 'Admin').trim() || 'Admin',
      joinCode: this.genCode(users),
      isAdmin: true,
      createdAt: Date.now(),
    };
    users.push(user);
    this.write(users);
    return user;
  }

  /** Admin creates a new user; returns it (with its generated join code). */
  create(name: string, isAdmin = false): User {
    const users = this.read();
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Name required');
    const user: User = {
      id: this.genId(),
      name: trimmed,
      joinCode: this.genCode(users),
      isAdmin: !!isAdmin,
      createdAt: Date.now(),
    };
    users.push(user);
    this.write(users);
    return user;
  }

  /** Admin updates a user: rename, promote/demote, regenerate the join code. */
  update(
    id: string,
    patch: { name?: string; isAdmin?: boolean; regenerateCode?: boolean },
  ): User | null {
    const users = this.read();
    const idx = users.findIndex((u) => u.id === id);
    if (idx < 0) return null;
    const u = users[idx];
    if (patch.name !== undefined && patch.name.trim())
      u.name = patch.name.trim();
    if (patch.isAdmin !== undefined) u.isAdmin = !!patch.isAdmin;
    if (patch.regenerateCode)
      u.joinCode = this.genCode(users.filter((x) => x.id !== id));
    users[idx] = u;
    this.write(users);
    return u;
  }

  remove(id: string): boolean {
    const users = this.read();
    const next = users.filter((u) => u.id !== id);
    if (next.length === users.length) return false;
    this.write(next);
    return true;
  }
}
