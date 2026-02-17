/**
 * Dice Roll Popup Component
 * 
 * Shows animated dice roll results floating over character tokens.
 */

import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Point } from '../../model/lobby.model';

export interface DiceRollPopup {
  id: string;
  characterName: string;
  characterId: string;
  diceType: number;
  diceCount: number;
  rolls: number[];
  total: number;
  bonuses: { name: string; value: number }[];
  position: Point;
  formula?: string;
  actionName?: string;
  actionColor?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dice-roll-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (popup) {
      <div 
        class="roll-popup"
        [style.left.px]="popup.position.x"
        [style.top.px]="popup.position.y"
      >
        <div class="popup-content" [style.border-color]="popup.actionColor || '#f59e0b'">
          <!-- Character Name Header -->
          <div class="popup-header">
            <span class="character-name">{{ popup.characterName }}</span>
            @if (popup.actionName) {
              <span class="action-name" [style.color]="popup.actionColor">
                ⚡ {{ popup.actionName }}
              </span>
            }
          </div>
          
          <!-- Dice Formula -->
          <div class="popup-formula">
            {{ getFormula() }}
          </div>
          
          <!-- Individual Rolls -->
          @if (popup.rolls.length > 0) {
            <div class="popup-rolls">
              @for (roll of popup.rolls; track $index) {
                <span 
                  class="roll-die"
                  [class.crit-success]="roll === popup.diceType && popup.diceType === 20"
                  [class.crit-fail]="roll === 1 && popup.diceType === 20"
                >
                  {{ roll }}
                </span>
              }
            </div>
          }
          
          <!-- Bonuses -->
          @if (popup.bonuses.length > 0) {
            <div class="popup-bonuses">
              @for (bonus of popup.bonuses; track $index) {
                <span class="bonus-item">
                  {{ bonus.name }}: {{ bonus.value > 0 ? '+' : '' }}{{ bonus.value }}
                </span>
              }
            </div>
          }
          
          <!-- Total Result -->
          <div class="popup-total" [style.background-color]="popup.actionColor || '#f59e0b'">
            🎲 {{ popup.total }}
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .roll-popup {
      position: absolute;
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -100%);
      margin-top: -10px;
    }

    .popup-content {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
      border: 3px solid #f59e0b;
      border-radius: 12px;
      padding: 10px 14px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      min-width: 140px;
      backdrop-filter: blur(10px);
    }

    .popup-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    }

    .character-name {
      font-size: 11px;
      font-weight: 700;
      color: #f1f5f9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    .action-name {
      font-size: 10px;
      font-weight: 600;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .popup-formula {
      font-size: 11px;
      color: #cbd5e1;
      font-weight: 600;
      text-align: center;
      margin-bottom: 6px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .popup-rolls {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      justify-content: center;
      margin-bottom: 6px;
    }

    .roll-die {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
      border: 1px solid #475569;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .roll-die.crit-success {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-color: #4ade80;
      box-shadow: 
        0 2px 8px rgba(34, 197, 94, 0.5),
        0 0 12px rgba(74, 222, 128, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      animation: pulse-success 0.6s ease-out;
    }

    .roll-die.crit-fail {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-color: #f87171;
      box-shadow: 
        0 2px 8px rgba(239, 68, 68, 0.5),
        0 0 12px rgba(248, 113, 113, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      animation: shake 0.4s ease-out;
    }

    .popup-bonuses {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 6px;
      padding: 4px 0;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
    }

    .bonus-item {
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .popup-total {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      font-size: 16px;
      font-weight: 900;
      text-align: center;
      padding: 8px;
      border-radius: 8px;
      margin-top: 6px;
      box-shadow: 
        0 4px 12px rgba(245, 158, 11, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 0.5px;
    }

    @keyframes pulse-success {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.15);
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      25% {
        transform: translateX(-4px) rotate(-3deg);
      }
      75% {
        transform: translateX(4px) rotate(3deg);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiceRollPopupComponent implements OnInit, OnDestroy, OnChanges {
  @Input() popup!: DiceRollPopup | null;

  private rollSound: HTMLAudioElement | null = null;
  private previousPopupId: string | null = null;

  ngOnInit() {
    this.initRollSound();
  }

  ngOnDestroy() {
    this.rollSound = null;
  }

  ngOnChanges() {
    // Play sound when a new popup appears
    if (this.popup && this.popup.id !== this.previousPopupId) {
      this.playRollSound();
      this.previousPopupId = this.popup.id;
    } else if (!this.popup) {
      this.previousPopupId = null;
    }
  }

  private initRollSound() {
    // Create a better dice roll sound using Web Audio API
    // This creates a more pleasant multiple-tone dice clatter sound
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported');
      return;
    }

    const audioContext = new AudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.4; // seconds
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create multiple brief tones with different pitches (like dice bouncing)
    const bounces = [
      { time: 0.0, freq: 300, decay: 0.05 },
      { time: 0.06, freq: 250, decay: 0.04 },
      { time: 0.12, freq: 220, decay: 0.04 },
      { time: 0.18, freq: 200, decay: 0.05 },
      { time: 0.25, freq: 180, decay: 0.06 }
    ];

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      for (const bounce of bounces) {
        if (t >= bounce.time) {
          const localT = t - bounce.time;
          const envelope = Math.exp(-localT / bounce.decay);
          sample += Math.sin(2 * Math.PI * bounce.freq * localT) * envelope * 0.2;
        }
      }

      data[i] = sample;
    }

    // Convert to base64 WAV (simplified - just store the AudioBuffer for now)
    // We'll play it directly using Web Audio API
    this.rollSound = new Audio();
    
    // Create offline context to render the buffer to a WAV
    const offlineContext = new OfflineAudioContext(1, length, sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start();

    offlineContext.startRendering().then((renderedBuffer) => {
      // Convert to WAV blob
      const wav = this.audioBufferToWav(renderedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      if (this.rollSound) {
        this.rollSound.src = url;
      }
    });
  }

  private playRollSound() {
    if (this.rollSound) {
      this.rollSound.currentTime = 0;
      this.rollSound.volume = 0.3; // Gentle volume
      this.rollSound.play().catch(e => {
        console.warn('Could not play dice roll sound:', e);
      });
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }

  getFormula(): string {
    if (!this.popup) return '';
    if (this.popup.formula) return this.popup.formula;
    return `${this.popup.diceCount}d${this.popup.diceType}`;
  }
}
