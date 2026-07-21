/**
 * Global sound-effects volume, persisted per browser.
 *
 * A plain module rather than an Angular service so non-DI helpers (ping-audio.ts) can read it
 * too. Each sound keeps its own baseline level and scales it through `scaledVolume`, so the
 * relative mix between quiet pings and louder dice stays intact as the master slider moves.
 */
import { signal } from '@angular/core';

const STORAGE_KEY = 'sfx-volume';
const DEFAULT_VOLUME = 0.6;

const clamp = (v: number) => Math.max(0, Math.min(1, v));

function load(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_VOLUME;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? clamp(n) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

/** Master SFX volume, 0..1. Read this in templates to reflect the current setting. */
export const sfxVolume = signal<number>(load());

/** Set + persist the master volume (0..1). */
export function setSfxVolume(value: number): void {
  const v = clamp(value);
  sfxVolume.set(v);
  try {
    localStorage.setItem(STORAGE_KEY, String(v));
  } catch {
    // Storage unavailable (private mode / quota) — the setting still applies this session.
  }
}

/** Scale a sound's own baseline level by the master volume. */
export function scaledVolume(baseLevel: number): number {
  return clamp(baseLevel * sfxVolume());
}

export const isMuted = () => sfxVolume() === 0;
