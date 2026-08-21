import {
  signal
} from "./chunk-XJL25EXC.js";

// src/app/shared/sound/sound-settings.ts
var STORAGE_KEY = "sfx-volume";
var DEFAULT_VOLUME = 0.6;
var clamp = (v) => Math.max(0, Math.min(1, v));
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null)
      return DEFAULT_VOLUME;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? clamp(n) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}
var sfxVolume = signal(load(), ...ngDevMode ? [{ debugName: "sfxVolume" }] : []);
function setSfxVolume(value) {
  const v = clamp(value);
  sfxVolume.set(v);
  try {
    localStorage.setItem(STORAGE_KEY, String(v));
  } catch {
  }
}
function scaledVolume(baseLevel) {
  return clamp(baseLevel * sfxVolume());
}

export {
  sfxVolume,
  setSfxVolume,
  scaledVolume
};
//# sourceMappingURL=chunk-RAWCOLGX.js.map
