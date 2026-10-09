import { FantasyClock } from '../model/world.model';

/** What a world without a stored clock shows — matches the world store's load-time migration. */
export const DEFAULT_WORLD_CLOCK: FantasyClock = { year: 321, day: 1, hour: 8, minute: 0 };

const MINUTES_PER_DAY = 24 * 60;
const DAYS_PER_YEAR = 360;
const MINUTES_PER_YEAR = DAYS_PER_YEAR * MINUTES_PER_DAY;

/** "Jahr: 321  |  Tag: 001  |  08:00 Uhr" — the label the lobby toolbar has always shown. */
export function formatWorldClock(clock: FantasyClock): string {
  const day = String(clock.day).padStart(3, '0');
  const hour = String(clock.hour).padStart(2, '0');
  const minute = String(clock.minute).padStart(2, '0');
  return `Jahr: ${clock.year}  |  Tag: ${day}  |  ${hour}:${minute} Uhr`;
}

/** Move the clock by `minutesDelta` (may be negative), rolling over days and years; never below zero. */
export function shiftFantasyClock(clock: FantasyClock, minutesDelta: number): FantasyClock {
  const base =
    (clock.year - 1) * MINUTES_PER_YEAR +
    (clock.day - 1) * MINUTES_PER_DAY +
    clock.hour * 60 +
    clock.minute;
  const shifted = Math.max(0, base + minutesDelta);

  const year = Math.floor(shifted / MINUTES_PER_YEAR) + 1;
  const restYear = shifted % MINUTES_PER_YEAR;
  const day = Math.floor(restYear / MINUTES_PER_DAY) + 1;
  const restDay = restYear % MINUTES_PER_DAY;
  return { year, day, hour: Math.floor(restDay / 60), minute: restDay % 60 };
}
