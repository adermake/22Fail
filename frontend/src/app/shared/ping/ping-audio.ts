/**
 * Low-volume playback for ping sounds. Audio elements are preloaded and cloned per
 * play so overlapping pings don't cut each other off. play() rejections (autoplay
 * policy before the user has interacted) are swallowed.
 */

import { PingType, PING_TYPES } from './ping.model';

const PING_VOLUME = 0.25;
const cache = new Map<PingType, HTMLAudioElement>();

function getBase(type: PingType): HTMLAudioElement {
  let base = cache.get(type);
  if (!base) {
    base = new Audio(PING_TYPES[type].sound);
    base.preload = 'auto';
    base.volume = PING_VOLUME;
    cache.set(type, base);
  }
  return base;
}

export function playPingSound(type: PingType): void {
  try {
    const el = getBase(type).cloneNode(true) as HTMLAudioElement;
    el.volume = PING_VOLUME;
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
