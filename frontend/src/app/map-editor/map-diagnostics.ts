/**
 * Instrumentation for the terrain streaming pipeline.
 *
 * Written because four rounds of fixing tile glitches from screenshots produced four real
 * bugs and still did not settle the symptom. Inferring what the streamer did from what the
 * map looked like afterwards is guesswork; this records what it actually did.
 *
 * Two halves, and both matter:
 *  - a rolling event log, for reconstructing a sequence after something looked wrong
 *  - live counters, for spotting the pathologies that never appear in a single event —
 *    a tile refetched thirty times, a cell stuck on a fallback, evictions churning
 *
 * Everything is inert unless enabled, so the instrumented paths cost a boolean check.
 */

export type DiagKind =
  | 'fetch:start'
  | 'fetch:done'
  | 'fetch:empty'
  | 'fetch:skip-dirty'
  | 'fetch:error'
  | 'tile:create'
  | 'tile:evict'
  | 'upload:start'
  | 'upload:done'
  | 'upload:fail'
  | 'paint:chunk'
  | 'paint:parent'
  | 'cell:build'
  | 'cell:fallback'
  | 'cell:drop'
  | 'level:change'
  | 'note';

export interface DiagEvent {
  /** ms since the recorder started, so sequences read as a timeline. */
  t: number;
  kind: DiagKind;
  /** Tile identity, where the event has one: `layer L{level} cx,cy`. */
  tile: string;
  detail: string;
}

const MAX_EVENTS = 600;

export class MapDiagnostics {
  enabled = false;

  private events: DiagEvent[] = [];
  private started = performance.now();
  private counts = new Map<string, number>();
  /** Per-tile fetch tally — the cheapest way to see a tile being pulled over and over. */
  private fetchesPerTile = new Map<string, number>();
  private inFlight = 0;

  log(kind: DiagKind, tile: string, detail = ''): void {
    if (!this.enabled) return;

    this.events.push({ t: Math.round(performance.now() - this.started), kind, tile, detail });
    // Ring buffer: a long session must not grow without bound.
    if (this.events.length > MAX_EVENTS) this.events.splice(0, this.events.length - MAX_EVENTS);

    this.counts.set(kind, (this.counts.get(kind) ?? 0) + 1);

    if (kind === 'fetch:start') {
      this.inFlight++;
      this.fetchesPerTile.set(tile, (this.fetchesPerTile.get(tile) ?? 0) + 1);
    } else if (kind === 'fetch:done' || kind === 'fetch:empty' || kind === 'fetch:error') {
      this.inFlight = Math.max(0, this.inFlight - 1);
    }
  }

  /** Most recent events, newest last. */
  recent(n = 40): DiagEvent[] {
    return this.events.slice(-n);
  }

  get summary(): { label: string; value: string }[] {
    const c = (k: DiagKind) => this.counts.get(k) ?? 0;

    // A tile fetched many times over is the signature of a refetch loop.
    let worstTile = '';
    let worstCount = 0;
    for (const [tile, n] of this.fetchesPerTile) {
      if (n > worstCount) {
        worstCount = n;
        worstTile = tile;
      }
    }

    return [
      { label: 'in flight', value: String(this.inFlight) },
      { label: 'fetches', value: `${c('fetch:start')} (${c('fetch:empty')} empty)` },
      { label: 'skipped (dirty)', value: String(c('fetch:skip-dirty')) },
      { label: 'errors', value: String(c('fetch:error')) },
      { label: 'uploads', value: `${c('upload:done')} ok / ${c('upload:fail')} fail` },
      { label: 'tiles made', value: String(c('tile:create')) },
      { label: 'evictions', value: String(c('tile:evict')) },
      { label: 'cells built', value: String(c('cell:build')) },
      { label: 'on fallback', value: String(c('cell:fallback')) },
      { label: 'level changes', value: String(c('level:change')) },
      { label: 'most-fetched', value: worstCount > 1 ? `${worstTile} ×${worstCount}` : '—' },
    ];
  }

  reset(): void {
    this.events = [];
    this.counts.clear();
    this.fetchesPerTile.clear();
    this.inFlight = 0;
    this.started = performance.now();
  }

  /** Dump the log to the console, for pasting somewhere readable. */
  dump(): void {
    const lines = this.events.map(e => `${String(e.t).padStart(6)}ms ${e.kind.padEnd(16)} ${e.tile.padEnd(24)} ${e.detail}`);
    console.log(`[map-diag] ${this.events.length} events\n${lines.join('\n')}`);
    console.table(this.summary);
  }
}

/** Shared recorder — the streamer and the view both write to the same timeline. */
export const mapDiag = new MapDiagnostics();

/** Canonical tile label, so events and the overlay agree on naming. */
export function tileLabel(layer: string, cx: number, cy: number, level: number): string {
  return `${layer} L${level} ${cx},${cy}`;
}
