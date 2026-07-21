/**
 * View-agnostic state machine for radial pings. A host component (world map / lobby)
 * feeds it G-key state and pointer events in screen + world coordinates, and provides
 * callbacks to trigger change detection and to broadcast a fired ping. Rendering is left
 * to the host (it maps world→screen for its own viewport).
 */

import {
  ActivePing,
  PingBroadcast,
  PingType,
  PING_DURATION_MS,
  makePingId,
  pingTypeFromDrag,
} from './ping.model';
import { playPingSound } from './ping-audio';

export class PingController {
  activePings: ActivePing[] = [];

  gDown = false;
  wheelOpen = false;
  wheelScreen = { x: 0, y: 0 };
  wheelType: PingType = 'generic';

  private wheelWorld = { x: 0, y: 0 };
  private downScreen: { x: number; y: number } | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();

  constructor(
    private onChange: () => void,
    private broadcast: (p: PingBroadcast) => void,
    private selfId: () => string,
  ) {}

  destroy(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.activePings = [];
  }

  /**
   * Track the G key. Once the wheel is OPEN it deliberately survives a G release — letting go
   * a moment early while aiming used to dismiss the wheel mid-drag. The wheel then closes
   * either by firing a ping (endWheel) or by tapping G again, which acts as a cancel.
   */
  setGDown(v: boolean): void {
    if (this.gDown === v) return;
    this.gDown = v;
    if (v && this.wheelOpen) this.cancelWheel(); // fresh G press = dismiss the open wheel
  }

  /** Arm the wheel on mousedown. Returns true if it consumed the event. */
  beginWheel(screenX: number, screenY: number, worldX: number, worldY: number): boolean {
    if (!this.gDown) return false;
    this.wheelOpen = true;
    this.downScreen = { x: screenX, y: screenY };
    this.wheelScreen = { x: screenX, y: screenY };
    this.wheelWorld = { x: worldX, y: worldY };
    this.wheelType = 'generic';
    this.onChange();
    return true;
  }

  updateWheel(screenX: number, screenY: number): boolean {
    if (!this.wheelOpen || !this.downScreen) return false;
    this.wheelType = pingTypeFromDrag(screenX - this.downScreen.x, screenY - this.downScreen.y);
    this.onChange();
    return true;
  }

  /** Fire the selected ping on mouseup. Returns true if it consumed the event. */
  endWheel(): boolean {
    if (!this.wheelOpen) return false;
    const id = makePingId();
    const type = this.wheelType;
    const { x: worldX, y: worldY } = this.wheelWorld;
    const createdBy = this.selfId();
    this.wheelOpen = false;
    this.downScreen = null;

    this.addPing({ id, type, worldX, worldY, createdBy, createdAt: Date.now() }, true);
    this.broadcast({ id, type, worldX, worldY, createdBy });
    return true;
  }

  cancelWheel(): void {
    this.wheelOpen = false;
    this.downScreen = null;
    this.onChange();
  }

  /** A ping from another client (or our own echo — deduped by id). */
  addRemotePing(b: PingBroadcast): void {
    if (this.activePings.some(p => p.id === b.id)) return;
    this.addPing({ ...b, createdAt: Date.now() }, true);
  }

  private addPing(ping: ActivePing, playSound: boolean): void {
    this.activePings = [...this.activePings, ping];
    if (playSound) playPingSound(ping.type);
    const t = setTimeout(() => {
      this.activePings = this.activePings.filter(p => p.id !== ping.id);
      this.timers.delete(t);
      this.onChange();
    }, PING_DURATION_MS);
    this.timers.add(t);
    this.onChange();
  }
}
