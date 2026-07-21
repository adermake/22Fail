import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { setSfxVolume, sfxVolume } from './sound-settings';

/**
 * Compact master volume control for site sound effects (pings, dice). The speaker button
 * toggles mute (remembering the previous level); the slider sets the level. The value is
 * persisted, so a user only sets it once.
 */
@Component({
  selector: 'app-sound-volume-control',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="svc" [title]="'Lautstärke: ' + percent() + '%'">
      <button class="svc-btn" type="button" (click)="toggleMute()"
              [attr.aria-label]="volume() === 0 ? 'Ton einschalten' : 'Stummschalten'">
        {{ icon() }}
      </button>
      <input class="svc-range" type="range" min="0" max="100" step="1"
             [value]="percent()"
             (input)="onInput($event)"
             aria-label="Lautstärke der Soundeffekte" />
    </div>
  `,
  styles: [`
    .svc { display: inline-flex; align-items: center; gap: 6px; }
    .svc-btn {
      background: none; border: none; cursor: pointer; font-size: 1rem;
      line-height: 1; padding: 2px; color: inherit; opacity: 0.85;
    }
    .svc-btn:hover { opacity: 1; }
    .svc-range { width: 88px; accent-color: #8b5cf6; cursor: pointer; }
  `],
})
export class SoundVolumeControlComponent {
  volume = sfxVolume;
  /** Level restored when un-muting. */
  private lastAudible = 0.6;

  percent(): number {
    return Math.round(this.volume() * 100);
  }

  icon(): string {
    const v = this.volume();
    if (v === 0) return '🔇';
    if (v < 0.34) return '🔈';
    if (v < 0.67) return '🔉';
    return '🔊';
  }

  onInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) / 100;
    if (v > 0) this.lastAudible = v;
    setSfxVolume(v);
  }

  toggleMute(): void {
    if (this.volume() > 0) {
      this.lastAudible = this.volume();
      setSfxVolume(0);
    } else {
      setSfxVolume(this.lastAudible || 0.6);
    }
  }
}
