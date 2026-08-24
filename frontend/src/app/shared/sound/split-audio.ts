/**
 * Short synthesised ticks for the stack-split menu.
 *
 * Synthesised rather than loaded: these need to be instant and to fire many times a second while
 * an operation repeats under Shift, and each operation wants its own pitch so you can hear which
 * one landed without looking at it. A WebAudio blip costs nothing and ships no asset.
 */
import { scaledVolume } from './sound-settings';

/** This sound's baseline level; scaled at play time by the user's master SFX volume. */
const SPLIT_BASE_LEVEL = 0.32;

/** Pitch per operation — going up adds, going down removes. */
const TONES: Record<string, number> = {
  plus: 880,
  minus: 520,
  double: 1180,
  half: 660,
  set: 760,
  blocked: 160,
};

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  try {
    const Ctor = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext });
    const Impl = Ctor.AudioContext ?? Ctor.webkitAudioContext;
    if (!Impl) return null;
    ctx ??= new Impl();
    // Browsers suspend the context until the page has been interacted with.
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Play the tick for one split operation. `blocked` is the dull thud for something that could
 * not be applied.
 */
export function playSplitTick(kind: keyof typeof TONES | string): void {
  const volume = scaledVolume(SPLIT_BASE_LEVEL);
  if (volume <= 0) return; // muted

  const context = audioContext();
  if (!context) return;

  try {
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const blocked = kind === 'blocked';

    osc.type = blocked ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(TONES[kind] ?? TONES['set'], now);
    if (!blocked) {
      // A tiny upward chirp makes the tick read as "done" rather than "beep".
      osc.frequency.exponentialRampToValueAtTime((TONES[kind] ?? 760) * 1.35, now + 0.05);
    }

    const peak = blocked ? volume * 0.35 : volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (blocked ? 0.12 : 0.09));

    osc.connect(gain).connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch {
    /* audio is a nicety — never let it break the interaction */
  }
}
