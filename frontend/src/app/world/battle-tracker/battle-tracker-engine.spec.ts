import {
  BattleTrackerEngine,
  TimelineParticipant,
  advanceTimeline,
  groupTiles,
  pastTurnGroup,
  simulateTimeline,
  timelineDeviations,
} from './battle-tracker-engine';
import { BattleParticipant } from '../../model/world.model';
import { WorldStoreService } from '../../services/world-store.service';

/** Deterministic PRNG so a failing scenario can be replayed from its seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEAMS = ['blue', 'red', 'green'];

/** Random battle. Speeds come from a small pool so ties and same-tick triggers are common. */
function randomBattle(seed: number): TimelineParticipant[] {
  const rnd = mulberry32(seed);
  const n = 2 + Math.floor(rnd() * 7);
  const speedPool = [-5, 0, 3, 5, 5, 8, 10, 10, 12, 15, 20, 30];
  const teamCount = 1 + Math.floor(rnd() * 3);
  return Array.from({ length: n }, (_, i) => ({
    characterId: `c${i}`,
    name: `C${i}`,
    speed: speedPool[Math.floor(rnd() * speedPool.length)],
    team: TEAMS[Math.floor(rnd() * teamCount)],
    turnMeter: Math.floor(rnd() * 1000),
    turnsTaken: 0,
  }));
}

const ids = (ps: readonly TimelineParticipant[], count: number) =>
  simulateTimeline(ps, count).tiles.map(t => t.id);

describe('Kampf-Zeitleiste', () => {
  beforeEach(() => {
    timelineDeviations.length = 0;
  });

  it('sagt 1000 Züge lang korrekt voraus: nach jedem Zug ist die neue Leiste die alte minus die erste Gruppe', () => {
    const LOOKAHEAD = 60;
    const failures: string[] = [];
    for (let seed = 1; seed <= 200 && failures.length < 5; seed++) {
      let ps = randomBattle(seed);
      for (let turn = 0; turn < 1000; turn++) {
        const before = ids(ps, LOOKAHEAD);
        const { consumed, participants } = advanceTimeline(ps);
        ps = participants;
        const expected = before.join(' ');
        const actual = [...consumed.map(t => t.id), ...ids(ps, LOOKAHEAD - consumed.length)].join(' ');
        if (actual !== expected) {
          failures.push(`seed ${seed}, Zug ${turn}:\n  erwartet ${expected}\n  ist      ${actual}`);
          break;
        }
      }
    }
    expect(failures).toEqual([]);
  }, 60_000);

  it('lässt keinen schnelleren Verbündeten vor Charaktere springen, die im selben Tick noch warten', () => {
    // Tick 1: A (blau), X (rot), B (blau) erreichen alle 1000; C (blau, schneller) erst in Tick 2.
    // Erwartet: A | X | B, C. Früher wurden X und B nach As Zug auf 999 gekappt, feuerten einen
    // Tick später zusammen mit C und wurden nach Tempo sortiert: C sprang nach vorne.
    const ps: TimelineParticipant[] = [
      { characterId: 'a', name: 'A', speed: 50, team: 'blue', turnMeter: 990, turnsTaken: 0 },
      { characterId: 'x', name: 'X', speed: 40, team: 'red', turnMeter: 990, turnsTaken: 0 },
      { characterId: 'b', name: 'B', speed: 30, team: 'blue', turnMeter: 990, turnsTaken: 0 },
      { characterId: 'c', name: 'C', speed: 60, team: 'blue', turnMeter: 900, turnsTaken: 0 },
    ];
    const names = (p: TimelineParticipant[]) =>
      groupTiles(simulateTimeline(p, 4).tiles).map(g => g.tiles.map(t => t.name).join('+'));

    expect(names(ps)).toEqual(['A', 'X', 'B+C']);
    const next = advanceTimeline(ps).participants;
    expect(next.find(p => p.characterId === 'x')!.turnMeter).toBeGreaterThanOrEqual(1000);
    expect(names(next).slice(0, 2)).toEqual(['X', 'B+C']);
  });

  it('„Zuletzt“ zeigt genau die eben verbrauchte Gruppe, mit denselben Tile-IDs', () => {
    let ps = randomBattle(5);
    expect(pastTurnGroup(ps)).toBeNull();
    for (let turn = 0; turn < 50; turn++) {
      const { consumed, participants } = advanceTimeline(ps);
      ps = participants;
      expect(pastTurnGroup(ps)!.tiles.map(t => t.id), `Zug ${turn}`).toEqual(consumed.map(t => t.id));
    }
  });

  it('Tile-IDs bleiben über einen Zug hinweg stabil (für Animation und Diagnose)', () => {
    const ps = randomBattle(42);
    const before = simulateTimeline(ps, 15).tiles;
    const { consumed, participants } = advanceTimeline(ps);
    const after = simulateTimeline(participants, 15).tiles;
    expect(after[0].id).toBe(before[consumed.length].id);
  });

  it('Spielleitung und Zuschauer sehen über 300 Züge (inkl. JSON-Speicherung) dieselbe Leiste, ohne Diagnose-Meldung', () => {
    for (const seed of [7, 99, 1234]) {
      const world = { battleParticipants: [] as BattleParticipant[] };
      const store = {
        get worldValue() {
          return world;
        },
        applyPatch(patch: { path: string; value: unknown }) {
          // Round-trip like the server does.
          (world as Record<string, unknown>)[patch.path] = JSON.parse(JSON.stringify(patch.value));
        },
      } as unknown as WorldStoreService;

      const roster = randomBattle(seed);
      const available = roster.map(p => ({ id: p.characterId, name: p.name, speed: p.speed }));

      const gm = new BattleTrackerEngine();
      gm.setWorldStore(store);
      gm.setAvailableCharacters(available);
      for (const p of roster) {
        gm.addCharacter(p.characterId);
        gm.setTeam(p.characterId, p.team);
        gm.setTurnMeter(p.characterId, p.turnMeter);
      }

      const viewer = new BattleTrackerEngine();
      viewer.setWorldStore(store);
      viewer.setAvailableCharacters(available);
      viewer.syncFromWorldStore();

      for (let turn = 0; turn < 300; turn++) {
        gm.nextTurn();
        viewer.syncFromWorldStore();
        expect(viewer.getTiles().map(t => t.id), `seed ${seed}, Zug ${turn}`).toEqual(
          gm.getTiles().map(t => t.id),
        );
        expect(viewer.getPastGroup()?.tiles.map(t => t.id)).toEqual(
          gm.getPastGroup()?.tiles.map(t => t.id),
        );
      }
      expect(timelineDeviations, `seed ${seed}`).toEqual([]);
    }
  });

  it('Diagnose meldet eine Abweichung, wenn sich die Leiste ohne Grund umsortiert', () => {
    const world = { battleParticipants: [] as BattleParticipant[] };
    const store = {
      get worldValue() {
        return world;
      },
      applyPatch() {},
    } as unknown as WorldStoreService;
    const engine = new BattleTrackerEngine();
    engine.setWorldStore(store);
    engine.setAvailableCharacters([
      { id: 'a', name: 'A', speed: 10 },
      { id: 'b', name: 'B', speed: 10 },
    ]);
    engine.addCharacter('a');
    engine.addCharacter('b');
    engine.setTurnMeter('a', 100);
    engine.setTurnMeter('b', 600);
    expect(timelineDeviations).toEqual([]);

    // A remote client writes different meters (same roster, same speeds) — not a legal advance.
    world.battleParticipants = [
      { characterId: 'a', name: 'A', speed: 10, team: 'blue', turnFrequency: 700, nextTurnAt: 0, currentTurn: 0 },
      { characterId: 'b', name: 'B', speed: 10, team: 'blue', turnFrequency: 100, nextTurnAt: 0, currentTurn: 0 },
    ];
    engine.syncFromWorldStore();
    expect(timelineDeviations.length).toBe(1);
  });
});
