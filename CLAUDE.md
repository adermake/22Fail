# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A real-time D&D-style collaboration tool ("22Fail" / Eszentrium) with a custom German ruleset.
Angular 21 frontend + NestJS 11 backend, synchronised over Socket.IO, persisted as plain JSON
files. Every page view is created by URL and syncs live to everyone else in the room — assume any
state you touch has to reach other clients.

## Commands

All commands run inside `frontend/` or `backend/` — the repo root has no build of its own.

```bash
# frontend/
npm start                  # ng serve (prestart regenerates rulebook manifest + map atlas)
npm run build              # ng build (same pregeneration step)
npm run deploy:stage       # build + copy into backend/frontend-dist/frontend/browser
npm run stage              # copy only, if you already built
npm test                   # ng test -> vitest in jsdom
npx ng test --watch=false                              # single non-watch run
npx ng test --include src/app/utils/cooking.spec.ts    # one spec file
npx ng test --filter "Kochen"                          # one suite/test by name regex
npm run rulebook:manifest  # regenerate public/rulebook/index.json after editing a .md page

# backend/
npm run start:dev          # nest start --watch
npm run build              # nest build
npm run lint               # eslint --fix
npm test                   # jest (no backend specs exist yet)
```

The frontend has no lint target; formatting is Prettier (100 cols, single quotes) configured in
`frontend/package.json`.

**Never hand-copy the built frontend into the backend.** `npm run deploy:stage` exists because a
manual copy landed one directory level off and silently served a months-old bundle (missing icons,
stale rulebook). `backend/src/app.module.ts` probes several candidate paths and logs which one it
picked.

## Hard constraints in this repo

- **Git is read-only.** A PreToolUse hook (`.claude/guard.sh`) hard-blocks every mutating git
  subcommand and any file access outside the project folder. Do not offer to commit, push, or
  stage; ask the user instead.
- **graphify first.** `.cursor/rules/graphify.mdc` requires running `graphify query/path/explain`
  against `graphify-out/` before broad Read/Grep/Glob exploration, and `graphify update .` after
  editing code. `graphify-out/` is gitignored, so it may not exist — fall back to normal tools then.
- **`project_overview.md`** is the living architecture doc (581 lines, German). Read it before
  large changes and extend it when you add a subsystem; keep entries terse. It is far more
  detailed than this file on per-component behaviour (inventory drag rules, spell node editor,
  lobby panels, forging, status effects).
- **UI text is German**, always. Fix any English UI you encounter while working.

## Architecture

### Sync model — everything runs through JSON patches

The core loop for every synced entity: the client applies a patch locally (optimistic UI), sends it
over a WebSocket gateway, the server writes it into the entity's JSON file and broadcasts to the
room.

Patch shape: `{ path: 'inventory.0.name', value: ... }`. Paths arrive slash-based (`/inventory/-`)
and are normalised to dot-based; a trailing `-` segment appends to an array. Every
`applyJsonPatch` implementation (character-store, world-store, lobby-store, and several
components) must handle all three rules identically — divergence here is a recurring bug source.

Gateways in `backend/src/`, each owning a room type:

| Gateway | Rooms / responsibility |
| --- | --- |
| `character.gateway.ts` | `joinCharacter` / `patchCharacter` — character sheets |
| `world.gateway.ts` | world state, current events, loot reveal/claim, party stash, dice rolls |
| `battlemap.gateway.ts` | lobby + battle map + world map patches, measurements, pings |
| `map-editor.gateway.ts` | map editor v2 ops |

Matching frontend clients live in `frontend/src/app/services/*-socket.service.ts`, with
`*-store.service.ts` holding signal-based state and `*-api.service.ts` doing REST.

### Persistence

`DataService` and friends resolve `dataDir = path.join(__dirname, '../../../data')`. Because the
build lands in `backend/dist/` (not `backend/dist/src/`), this points at `Documents/data` —
*outside* the repo. Entities are one JSON file each under `characters/`, `worlds/`, `races/`,
plus per-world entity collections (items, spells, runes, skills, loot bundles, status effects).
There is no database and no migration system: changing a model means writing a repair/normalise
pass that runs on load (see `normalizeRace`).

### Auth

Soft identity only: users are `{ name, joinCode, isAdmin }` in `data/users.json`; the first user
becomes admin. `identity.interceptor.ts` attaches `x-user-id` / `x-user-code` headers to every API
call, and `admin.guard.ts` checks them server-side. No sessions, no passwords.

### Frontend layout

`frontend/src/app/`, standalone components + signals, zoneless where it matters (canvas editors
drive their own RAF loop). Routes in `app.routes.ts`, all lazy:

- `sheet/` — the player character sheet (`/characters/:id`); by far the largest area: inventory,
  equipment, skills, spells, talents, forging, brewing, cooking, skill tree, status effects.
- `world/` — the GM dashboard (`/world/:worldName`): party overview, battle tracker, current
  events, damage calculator, library tabs.
- `lobby/` — the live hex battle map (`/lobby/:worldName`): grid, tokens, sidebar, character panel,
  bottom panel (status + active spells/skills).
- `map-editor/` — world map editor v2 (PixiJS v8, authored detail tiers, server-enforced secrets).
- `world-map/` — the older world map, still in use until map-editor v2 reaches parity.
- `library-editor/` — content authoring (`/library/:libraryId`): items, runes, spells, skills,
  status effects, macros, shops, loot bundles, plus library dependencies.
- `rulebook/` — `/rulebook/:page`, renders `public/rulebook/*.md` (see below).
- `scripting/` — FailScript, the in-house action-macro language.
- `services/`, `model/`, `utils/`, `shared/`, `data/` — cross-cutting.

`NAMING-CONVENTIONS.md` disambiguates three things that all sound like "library": the **Library**
editor (`/library/:id`), the **Assets** file browser (`/assets/:id`), and the read-only **World
Library** tabs inside the world view. Use those exact terms when discussing them.

### Rules engine

`TrueStatsService` (`services/true-stats.service.ts`) is the single stat calculator. It resolves
base stats, race, equipment, status effects and script-derived modifiers through an ordered
pipeline (`add`/`sub`/`mul`/`div`/`set` with priorities) and is the authority for resource maxima —
`world.component.getResourceMax()` delegates to it so the dashboard can't drift from the sheet.

Dice convention: **lower is better**. `diceBonus = (5 - stat / 2) | 0`, and stat modifiers use
`(-5 + stat / 2) | 0`. In the UI a *negative* modifier helps and renders green (`.dice-good`),
a *positive* one hurts and renders red (`.dice-bad`) — global classes in `styles.css`.

### FailScript (`frontend/src/app/scripting/`)

Custom scripting language for skills, items, status effects and rest triggers.
Pipeline: `lexer.ts` → `parser.ts` → `checker.ts` (compiles, rejects stat leaks) →
`interpreter.ts` (pure, no Angular; returns a structured `ScriptResult`). `decompiler.ts` converts
legacy `ActionMacro` objects back into script text. The Angular bridge is
`UnifiedMacroExecutorService.executeScript()`, which maps results onto patches/sockets.
`script-editor/` is the CodeMirror integration. Tests: `scripting/failscript.spec.ts`.

### Rulebook

Pages are plain Markdown in `frontend/public/rulebook/*.md` with flat front-matter and `:::`
container directives, plus live-data injections resolved by `rulebook-data-sources.ts`. HTTP can't
list a directory, so `tools/generate-rulebook-manifest.mjs` builds `index.json` (page list +
heading outline for tab dropdowns and search). It runs on prestart/prebuild — run
`npm run rulebook:manifest` after editing a page mid-session. `slugify` in that tool must stay
identical to `src/app/rulebook/markdown/slug.ts`.

## Conventions

- **No emoji in the UI.** Icons are SVGs in `public/icons/` rendered as CSS masks:
  `<i class="app-icon i-dice">`. Add a new `.i-*` rule in `styles.css` alongside the others.
  (Older code and `project_overview.md` still show emoji; replace them when you touch that code.)
- **Theme tokens** live in `:root` in `styles.css` (`--accent`, `--bg`, `--card`, `--border`,
  `--text`, `--health-color`, `--energy-color`, `--mana-color`). Use them rather than literals.
- **Strict TypeScript** with `strictTemplates`, `noPropertyAccessFromIndexSignature` and
  `noImplicitReturns` — index-signature lookups need bracket access.
- Standalone components only; no NgModules anywhere.
- Game-rule logic belongs in `utils/*.util.ts` or a service with a `.spec.ts`, not in a component —
  that is what the existing tests cover (cooking, gear generation, stacking, forging, status
  cleanse, skill/talent bonuses).
- Split large components rather than growing them; several existing ones are already over-long.

## Reference docs at the repo root

`BigGuide.txt` and `Allgemeines.txt` are the German game-rules source of truth (dice system, stats,
classes). `docs.txt` is an older architecture snapshot. The `*.js` scripts at the root
(`generate-skill-data.js`, `parse-races*.js`, `write-races.js`, …) are one-off data-generation
tools that wrote into `data/` — historical, not part of any build.
