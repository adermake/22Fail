/**
 * Low-volume playback for ping sounds. Audio elements are preloaded and cloned per
 * play so overlapping pings don't cut each other off. play() rejections (autoplay
 * policy before the user has interacted) are swallowed.
 */

import { PingType, PING_TYPES } from './ping.model';
import { scaledVolume } from '../sound/sound-settings';

/** This sound's baseline level; scaled at play time by the user's master SFX volume. */
const PING_BASE_LEVEL = 0.25;
const cache = new Map<PingType, HTMLAudioElement>();

function getBase(type: PingType): HTMLAudioElement {
  let base = cache.get(type);
  if (!base) {
    base = new Audio(PING_TYPES[type].sound);
    base.preload = 'auto';
    cache.set(type, base);
  }
  return base;
}

export function playPingSound(type: PingType): void {
  try {
    const volume = scaledVolume(PING_BASE_LEVEL);
    if (volume <= 0) return; // muted
    const el = getBase(type).cloneNode(true) as HTMLAudioElement;
    el.volume = volume;
    void el.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Warm the audio cache (e.g. on first user interaction) so the first ping is instant. */
export function preloadPingSounds(): void {
  for (const type of Object.keys(PING_TYPES) as PingType[]) {
    getBase(type);
  }
}
