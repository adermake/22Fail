/**
 * Lobby Character Panel
 *
 * Right-side permanent panel for the lobby.
 * Always present — no layout shift = no canvas flash.
 * When a token is selected: shows full character action panel.
 * When nothing selected: shows dice roller + roll history.
 */

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy,
  inject, signal, ChangeDetectorRef, OnChanges, SimpleChanges,
  ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CharacterSheet } from '../../model/character-sheet-model';
import { NpcStatblock } from '../../model/npc-statblock.model';
import { Token, TokenStatusEffect, LinkedTokenType } from '../../model/lobby.model';
import { DiceRollEvent, WorldSocketService } from '../../services/world-socket.service';
import { TrueStatsService } from '../../services/true-stats.service';
import { FormulaType } from '../../model/formula-type.enum';
import { SkillBlock } from '../../model/skill-block.model';
import { SpellBlock, CastingSpellEntry, ActiveSkillEntry } from '../../model/spell-block-model';
import { CharacterSocketService } from '../../services/character-socket.service';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { SKILL_DEFINITIONS } from '../../data/skill-definitions';
import { LibraryStoreService } from '../../services/library-store.service';
import { DiceRollerComponent } from '../../sheet/dice-roller/dice-roller.component';
import { DamageCalculatorComponent } from '../../world/damage-calculator/damage-calculator.component';
import { SpellcastWindowComponent } from '../../sheet/spellcast-window/spellcast-window.component';
import { createEmptySheet } from '../../model/character-sheet-model';
import { StatusEffect } from '../../model/status-effect.model';
import { ItemBlock } from '../../model/item-block.model';
import { StatBlock } from '../../model/stat-block.model';
import { JsonPatch } from '../../model/json-patch.model';

interface StatDisplay {
  label: string;
  value: number;
  bonus: number;
}

type PanelTab = 'actions' | 'rolls' | 'status' | 'aussehen' | 'linked' | 'equipment';

@Component({
  selector: 'app-lobby-character-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe, DiceRollerComponent, DamageCalculatorComponent, SpellcastWindowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="char-panel">

  @if (!token) {
    <!-- No token selected: show dice + roll history -->
    <div class="panel-header">
      <span class="panel-title">🎲 Würfelverlauf</span>
    </div>

    <div class="quick-dice-section">
      <button class="open-dice-btn" (click)="openDiceRoller()">🎲 Würfelansicht öffnen</button>
    </div>

    <div class="roll-history">
      @if (rolls.length === 0) {
        <div class="empty-rolls">Noch keine Würfe in dieser Sitzung</div>
      }
      @for (roll of reversedRolls; track roll.id) {
        <div class="roll-entry" [class.secret]="roll.isSecret">
          <div class="roll-meta">
            <span class="roll-char">{{ roll.characterName }}</span>
            @if (roll.actionName) { <span class="roll-action-name">{{ roll.actionName }}</span> }
            <span class="roll-time">{{ formatTime(roll.timestamp) }}</span>
          </div>
          <div class="roll-dice-row">
            @for (d of roll.rolls; track $index) {
              <span class="die-val"
                [class.crit-low]="d === 1 && roll.diceType === 20"
                [class.crit-high]="d === roll.diceType && roll.diceType === 20">{{ d }}</span>
            }
            @if (getTotalBonus(roll) !== 0) {
              <span class="roll-bonus" [class.pos]="getTotalBonus(roll) < 0" [class.neg]="getTotalBonus(roll) > 0">
                {{ getTotalBonus(roll) > 0 ? '+' : '' }}{{ getTotalBonus(roll) }}
              </span>
            }
            <span class="roll-eq">= <strong>{{ roll.result }}</strong></span>
          </div>
        </div>
      }
    </div>

  } @else {

    <!-- Token selected: full character action panel -->

    <!-- Header -->
    <div class="token-header">
      @if (token.portrait) {
        <img class="token-portrait" [src]="token.portrait | imageUrl" alt="" />
      } @else {
        <div class="token-portrait-placeholder">{{ (token.name || '?').charAt(0).toUpperCase() }}</div>
      }
      <span class="token-name">{{ token.name }}</span>
      <button class="deselect-btn" (click)="deselect.emit()" title="Auswahl aufheben">✕</button>
    </div>

    <!-- Resources: HP / Mana / Energy -->
    <div class="resources">
      <!-- LP -->
      <div class="res-row">
        <span class="res-icon">❤️</span>
        <span class="res-label">LP</span>
        <div class="res-controls">
          <button class="res-btn minus" (click)="adjustResource('health', -1)">−</button>
          <input class="res-input" type="number"
            [value]="currentHealth"
            (change)="setResource('health', $event)"
            min="0" [max]="maxHealth" />
          <button class="res-btn plus" (click)="adjustResource('health', 1)">+</button>
        </div>
        <span class="res-max">/ {{ maxHealth }}</span>
      </div>
      <div class="res-bar-wrap"><div class="res-bar hp" [style.width.%]="healthPct()"></div></div>

      @if (maxMana > 0) {
        <div class="res-row">
          <span class="res-icon">🔮</span>
          <span class="res-label">Mana</span>
          <div class="res-controls">
            <button class="res-btn minus" (click)="adjustResource('mana', -1)">−</button>
            <input class="res-input" type="number"
              [value]="currentMana"
              (change)="setResource('mana', $event)"
              min="0" [max]="maxMana" />
            <button class="res-btn plus" (click)="adjustResource('mana', 1)">+</button>
          </div>
          <span class="res-max">/ {{ maxMana }}</span>
        </div>
        <div class="res-bar-wrap"><div class="res-bar mana" [style.width.%]="manaPct()"></div></div>
      }

      @if (maxEnergy > 0) {
        <div class="res-row">
          <span class="res-icon">⚡</span>
          <span class="res-label">Energie</span>
          <div class="res-controls">
            <button class="res-btn minus" (click)="adjustResource('energy', -1)">−</button>
            <input class="res-input" type="number"
              [value]="currentEnergy"
              (change)="setResource('energy', $event)"
              min="0" [max]="maxEnergy" />
            <button class="res-btn plus" (click)="adjustResource('energy', 1)">+</button>
          </div>
          <span class="res-max">/ {{ maxEnergy }}</span>
        </div>
        <div class="res-bar-wrap"><div class="res-bar energy" [style.width.%]="energyPct()"></div></div>
      }
    </div>

    <!-- Key Stats: Weapon Efficiency + Defense -->
    @if (weaponEfficiency > 0 || totalStability > 0) {
      <div class="key-stats-row">
        @if (weaponEfficiency > 0) {
          <div class="key-stat-item" title="Waffeneffizienz – höchster Wert aller Waffen">
            <span class="key-stat-label">⚔️ Effizienz</span>
            <span class="key-stat-val">{{ weaponEfficiency }}</span>
          </div>
        }
        @if (totalStability > 0) {
          <div class="key-stat-item" title="Gesamtverteidigung (Summe Stabilität ÷ 5)">
            <span class="key-stat-label">🛡️ Verteidigung</span>
            <span class="key-stat-val">{{ totalStability }}</span>
          </div>
        }
      </div>
    }

    <!-- Panel Tabs -->
    <div class="panel-tabs">
      <button class="ptab" [class.active]="activeTab() === 'actions'" (click)="activeTab.set('actions')" title="Aktionen">⚔️</button>
      <button class="ptab" [class.active]="activeTab() === 'rolls'" (click)="activeTab.set('rolls')" title="Würfelverlauf">🎲</button>
      <button class="ptab" [class.active]="activeTab() === 'status'" (click)="activeTab.set('status')" title="Status-Effekte">✨</button>
      <button class="ptab" [class.active]="activeTab() === 'equipment'" (click)="activeTab.set('equipment')" title="Ausrüstung">🎒</button>
      <button class="ptab" [class.active]="activeTab() === 'aussehen'" (click)="activeTab.set('aussehen')" title="Aussehen & Transform">🎨</button>
      <button class="ptab" [class.active]="activeTab() === 'linked'" (click)="activeTab.set('linked')" title="Verknüpfte Token">🔗</button>
    </div>

    <div class="panel-body">

      @if (activeTab() === 'actions') {

        <!-- Schnellwürfe -->
        <div class="section-header">⚔️ Schnellwürfe</div>
        <div class="stats-grid">
          @for (stat of stats; track stat.label) {
            <button class="stat-roll-btn" (click)="rollStat(stat)"
              title="1d20 {{ stat.bonus >= 0 ? '+' : '' }}{{ stat.bonus }}">
              <span class="stat-lbl">{{ stat.label }}</span>
              <span class="stat-val">{{ stat.value }}</span>
              <span class="stat-mod" [class.mod-good]="stat.bonus < 0" [class.mod-bad]="stat.bonus > 0">
                {{ stat.bonus >= 0 ? '+' : '' }}{{ stat.bonus }}
              </span>
            </button>
          }
        </div>

        <!-- Freier Wurf -->
        <div class="section-header">🎲 Freier Wurf</div>
        <div class="free-roll-section">
          <button class="open-dice-btn" (click)="openDiceRoller()">🎲 Würfelansicht öffnen</button>
          @if (weaponEfficiency > 0) {
            <button class="open-dice-btn dmg-btn" (click)="openDamageRoller()">⚔️ Schaden würfeln</button>
          }
        </div>

        <!-- Alle Fertigkeiten & Zauber Vollansicht -->
        @if (allSkills.length > 0 || spells.length > 0) {
          <div class="free-roll-section">
            <button class="open-dice-btn abilities-btn" (click)="openAbilitiesOverlay()">✦ Fertigkeiten &amp; Zauber (Vollansicht)</button>
          </div>
        }

        <!-- Fertigkeiten -->
        @if (allSkills.length > 0) {
          <div class="section-header">✨ Fertigkeiten</div>
          <div class="skill-cards-list">
            @for (skill of allSkills; track skill.name) {
              <div class="lsc"
                [attr.data-type]="skill.type"
                [class.lsc--clickable]="skill.type === 'active'"
                [class.lsc--active]="skill.type === 'active' && isSkillActive(skill)"
                (click)="onSkillCardClick(skill)">
                <div class="lsc-bar">
                  <span class="lsc-type-icon">{{ getSkillTypeIcon(skill.type) }}</span>
                  <span class="lsc-type-lbl">{{ getSkillTypeLabel(skill.type) }}</span>
                  <span class="lsc-name">{{ skill.name }}</span>
                  @if (skill.actionType) {
                    <span class="lsc-action-tag" [attr.data-action]="skill.actionType">{{ skill.actionType }}</span>
                  }
                  @if (skill.enlightened) {
                    <span class="lsc-enl">✦</span>
                  }
                  @if (skill.type === 'active' && isSkillActive(skill)) {
                    <span class="lsc-active-badge">Aktiv</span>
                  }
                </div>
                @if (skill.description) {
                  <div class="lsc-desc">{{ skill.description }}</div>
                }
                <div class="lsc-footer">
                  @if (skill.class) {
                    <span class="lsc-class">{{ skill.class }}</span>
                  }
                  @if (skill.cost) {
                    <span class="lsc-cost" [attr.data-resource]="skill.cost.type">
                      {{ skill.cost.type === 'mana' ? '�' : skill.cost.type === 'energy' ? '⚡' : '❤️' }} {{ skill.cost.amount }}{{ skill.cost.perRound ? '/Rd' : '' }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Zauber -->
        @if (spells.length > 0) {
          <div class="section-header">🔮 Zauber</div>
          <div class="spell-list">
            @for (spell of spells; track spell.name) {
              <div class="spell-entry">
                <div class="spell-meta">
                  <span class="spell-icon">{{ spell.icon || '✨' }}</span>
                  <span class="spell-name">{{ spell.name }}</span>
                  @if (spell.costMana) {
                    <span class="skill-tag cost-tag">{{ spell.costMana }}🔮</span>
                  }
                </div>
                <button class="action-btn spell-btn" [class.action-btn--active]="isSpellActive(spell)" (click)="activateSpell(spell)">Aktivieren</button>
              </div>
            }
          </div>
        }

        @if (stats.length === 0 && allSkills.length === 0 && spells.length === 0) {
          <div class="empty-rolls">Keine Daten für diesen Token</div>
        }
      }

      @if (activeTab() === 'rolls') {
        <div class="roll-history">
          @if (rolls.length === 0) {
            <div class="empty-rolls">Noch keine Würfe in dieser Sitzung</div>
          }
          @for (roll of reversedRolls; track roll.id) {
            <div class="roll-entry" [class.secret]="roll.isSecret">
              <div class="roll-meta">
                <span class="roll-char">{{ roll.characterName }}</span>
                @if (roll.actionName) { <span class="roll-action-name">{{ roll.actionName }}</span> }
                <span class="roll-time">{{ formatTime(roll.timestamp) }}</span>
              </div>
              <div class="roll-dice-row">
                @for (d of roll.rolls; track $index) {
                  <span class="die-val"
                    [class.crit-low]="d === 1 && roll.diceType === 20"
                    [class.crit-high]="d === roll.diceType && roll.diceType === 20">{{ d }}</span>
                }
                @if (getTotalBonus(roll) !== 0) {
                  <span class="roll-bonus" [class.pos]="getTotalBonus(roll) < 0" [class.neg]="getTotalBonus(roll) > 0">
                    {{ getTotalBonus(roll) > 0 ? '+' : '' }}{{ getTotalBonus(roll) }}
                  </span>
                }
                <span class="roll-eq">= <strong>{{ roll.result }}</strong></span>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Status-Effekte Tab ── -->
      @if (activeTab() === 'status') {
        <div class="status-tab">
          <!-- Active effects list -->
          @if (tokenStatusEffects.length === 0) {
            <div class="empty-rolls">Keine aktiven Status-Effekte</div>
          }
          @for (fx of tokenStatusEffects; track fx.id) {
            <div class="fx-entry" [class.debuff]="fx.isDebuff">
              <span class="fx-icon">{{ fx.icon || (fx.isDebuff ? '💀' : '⭐') }}</span>
              <span class="fx-name">{{ fx.name }}</span>
              <div class="fx-controls">
                <span class="fx-stacks-label">Stapel</span>
                <button class="fx-btn" (click)="adjustFxStacks(fx, -1)">−</button>
                <span class="fx-val">{{ fx.stacks }}</span>
                <button class="fx-btn" (click)="adjustFxStacks(fx, 1)">+</button>
                @if (fx.duration !== undefined) {
                  <span class="fx-dur-label">Runden</span>
                  <button class="fx-btn" (click)="adjustFxDuration(fx, -1)">−</button>
                  <span class="fx-val">{{ fx.duration }}</span>
                  <button class="fx-btn" (click)="adjustFxDuration(fx, 1)">+</button>
                }
                <button class="fx-remove-btn" (click)="removeStatusEffect(fx.id)" title="Entfernen">✕</button>
              </div>
            </div>
          }

          <!-- Library picker -->
          <button class="add-fx-btn" (click)="openLibraryPicker()">
            📚 Aus Bibliothek wählen
          </button>
          @if (showLibraryPicker()) {
            <div class="lib-picker">
              <input class="fx-input lib-picker-search" placeholder="Status-Effekt suchen..."
                [(ngModel)]="libraryPickerSearch" />
              <div class="lib-picker-list">
                @if (filteredLibraryEffects.length === 0) {
                  <div class="empty-rolls">Keine Status-Effekte gefunden</div>
                }
                @for (effect of filteredLibraryEffects; track effect.id) {
                  <div class="lib-picker-item" (click)="applyLibraryStatusEffect(effect)">
                    <span class="lib-picker-icon">{{ effect.icon || (effect.isDebuff ? '💀' : '⭐') }}</span>
                    <div class="lib-picker-info">
                      <span class="lib-picker-name">{{ effect.name }}</span>
                      @if (effect.defaultDuration) {
                        <span class="lib-picker-dur">{{ effect.defaultDuration }} Runden</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Add effect form -->
          @if (showAddEffectForm()) {
            <div class="add-fx-form">
              <div class="form-row">
                <input class="fx-input" placeholder="Icon (Emoji)" [(ngModel)]="newEffectIcon" style="width:54px" maxlength="4" />
                <input class="fx-input" placeholder="Name" [(ngModel)]="newEffectName" style="flex:1" />
              </div>
              <div class="form-row">
                <label class="fx-check">
                  <input type="checkbox" [(ngModel)]="newEffectIsDebuff" /> Debuff
                </label>
                <input class="fx-input" type="number" placeholder="Dauer (leer=∞)" [(ngModel)]="newEffectDuration" style="width:96px" min="1" />
              </div>
              <div class="form-row">
                <button class="do-roll-btn small-btn" (click)="addStatusEffect()">Hinzufügen</button>
                <button class="action-btn" (click)="showAddEffectForm.set(false)">Abbrechen</button>
              </div>
            </div>
          } @else {
            <button class="add-fx-btn" (click)="openAddEffectForm()">+ Status-Effekt hinzufügen</button>
          }
        </div>
      }

      <!-- ── Aussehen Tab ── -->
      @if (activeTab() === 'aussehen') {
        <div class="aussehen-tab">

          <!-- Rename -->
          <div class="section-header">📛 Name</div>
          <div class="aussehen-row">
            <input class="fx-input name-input" [(ngModel)]="localName" placeholder="Token-Name" />
            <button class="action-btn" (click)="saveName()">Speichern</button>
          </div>

          <!-- Scale -->
          <div class="section-header">📐 Skalierung</div>
          <div class="aussehen-row uniform-row">
            <label class="fx-check">
              <input type="checkbox" [(ngModel)]="uniformScale" /> Einheitlich
            </label>
            <div class="scale-quick-btns">
              <button class="quick-btn" (click)="adjustScale(-0.25)">−¼</button>
              <input type="number" class="fx-input scale-number-input"
                [value]="uniformScale ? localScaleX : localScaleX"
                min="0.1" max="20" step="0.1"
                (change)="onScaleInputChange($any($event.target).value)" />
              <button class="quick-btn" (click)="adjustScale(0.25)">+¼</button>
            </div>
          </div>
          @if (!uniformScale) {
            <div class="aussehen-slider-row">
              <span class="slider-label">X</span>
              <input type="range" class="slider" min="0.1" max="10" step="0.05"
                [value]="localScaleX" (input)="localScaleX = +$any($event.target).value; applyCosmetic()" />
              <span class="slider-val">{{ localScaleX.toFixed(2) }}</span>
            </div>
            <div class="aussehen-slider-row">
              <span class="slider-label">Y</span>
              <input type="range" class="slider" min="0.1" max="10" step="0.05"
                [value]="localScaleY" (input)="localScaleY = +$any($event.target).value; applyCosmetic()" />
              <span class="slider-val">{{ localScaleY.toFixed(2) }}</span>
            </div>
          } @else {
            <div class="aussehen-slider-row">
              <span class="slider-label">Scale</span>
              <input type="range" class="slider" min="0.1" max="10" step="0.05"
                [value]="localScaleX" (input)="localScaleX = +$any($event.target).value; localScaleY = localScaleX; applyCosmetic()" />
              <span class="slider-val">{{ localScaleX.toFixed(2) }}</span>
            </div>
          }

          <!-- Rotation -->
          <div class="section-header">🔄 Drehung</div>
          <div class="aussehen-slider-row">
            <span class="slider-label">°</span>
            <input type="range" class="slider" min="0" max="360" step="1"
              [value]="localRotation" (input)="localRotation = +$any($event.target).value; applyCosmetic()" />
            <span class="slider-val">{{ localRotation }}°</span>
          </div>
          <div class="rotation-btns">
            <button class="quick-btn" (click)="rotateBy(-60)" title="-60°">↺ 60°</button>
            <button class="quick-btn" (click)="rotateBy(60)" title="+60°">↻ 60°</button>
            <button class="quick-btn" (click)="localRotation = 0; applyCosmetic()" title="Reset">Reset</button>
          </div>

          <!-- Image mode -->
          <div class="section-header">🖼️ Bildmodus</div>
          <div class="imagemode-row">
            <button class="mode-btn" [class.active]="localImageMode === 'fill'" (click)="localImageMode = 'fill'; applyCosmetic()">Füllen</button>
            <button class="mode-btn" [class.active]="localImageMode === 'stretch'" (click)="localImageMode = 'stretch'; applyCosmetic()">Strecken</button>
          </div>

          <!-- Custom portrait -->
          <div class="section-header">🖼️ Portrait</div>
          @if (token.customPortraitData) {
            <div class="portrait-preview-row">
              <img [src]="token.customPortraitData" class="portrait-preview" alt="Portrait" />
              <button class="quick-btn danger-btn" (click)="clearCustomPortrait()">Löschen</button>
            </div>
          }
          <!-- Upload portrait -->
          <div class="aussehen-row">
            <label class="add-fx-btn upload-portrait-label" style="cursor:pointer;">
              📁 Bild hochladen
              <input type="file" accept="image/*" style="display:none" (change)="uploadPortrait($event)" />
            </label>
          </div>
          <!-- Draw portrait -->
          @if (!showDrawCanvas()) {
            <button class="add-fx-btn draw-btn" (click)="openDrawCanvas()">
              ✏️ Auf Token zeichnen
            </button>
          } @else {
            <div class="draw-canvas-container">
              <div class="draw-canvas-toolbar">
                <label class="fx-check" style="gap:4px">
                  Farbe: <input type="color" [(ngModel)]="drawColor" style="width:28px;height:22px;padding:0;border:none;cursor:pointer;background:none;" />
                </label>
                <label class="fx-check" style="gap:4px">
                  Pinsel:
                  <input type="range" min="2" max="40" step="1" [(ngModel)]="drawBrushSize" class="slider" style="width:60px" />
                  <span class="slider-val">{{ drawBrushSize }}</span>
                </label>
                <button class="quick-btn" (click)="clearDrawCanvas()" title="Leinwand leeren">🗑️</button>
              </div>
              <canvas #tokenDrawCanvas
                class="draw-canvas"
                width="256" height="256"
                (mousedown)="onDrawCanvasMouseDown($event)"
                (mousemove)="onDrawCanvasMouseMove($event)"
                (mouseup)="onDrawCanvasMouseUp()"
                (mouseleave)="onDrawCanvasMouseUp()"
              ></canvas>
              <div class="draw-canvas-actions">
                <button class="action-btn" (click)="saveDrawCanvas()">Speichern</button>
                <button class="quick-btn" (click)="closeDrawCanvas()">Abbrechen</button>
              </div>
            </div>
          }

        </div>
      }

      <!-- ── Verknüpfung Tab ── -->
      @if (activeTab() === 'linked') {
        <div class="linked-tab">

          <!-- Parent info -->
          @if (token.parentTokenId) {
            <div class="linked-parent-info">
              <span class="fx-icon">🔗</span>
              <span>Verknüpft mit: <strong>{{ getParentName() }}</strong></span>
              <span class="linked-type-badge">{{ getLinkedTypeLabel(token!.linkedTokenType) }}</span>
              <button class="fx-remove-btn" (click)="detachFromParent()" title="Trennen">Trennen</button>
            </div>
          }

          <!-- Children list -->
          @if (linkedChildren.length > 0) {
            <div class="section-header">Verknüpfte Token</div>
            @for (child of linkedChildren; track child.id) {
              <div class="fx-entry">
                <span class="fx-icon">🔗</span>
                <span class="fx-name">{{ child.name }}</span>
                <span class="linked-type-badge">{{ getLinkedTypeLabel(child.linkedTokenType) }}</span>
                <button class="fx-remove-btn" (click)="detachChild(child.id)" title="Trennen">Trennen</button>
              </div>
            }
          }

          <!-- Create new linked token -->
          <div class="section-header">Neuer verknüpfter Token</div>
          <div class="form-row">
            <input class="fx-input" placeholder="Name" [(ngModel)]="newLinkedName" style="flex:1" />
          </div>
          <div class="form-row">
            <select class="fx-input" [(ngModel)]="newLinkedType">
              <option value="free">Frei (Free)</option>
              <option value="keepDistance">Abstand halten</option>
              <option value="keepOffset">Versatz halten</option>
            </select>
          </div>
          <button class="add-fx-btn" (click)="startLinkedTokenPlacement()">
            🔗 Token platzieren
          </button>
          <div class="linked-type-hint">
            @if (newLinkedType === 'free') { <span class="hint-text">Freie Platzierung, folgt dem Eltern-Token nicht automatisch</span> }
            @if (newLinkedType === 'keepDistance') { <span class="hint-text">Hält denselben Abstand zum Eltern-Token in Hexfeldern</span> }
            @if (newLinkedType === 'keepOffset') { <span class="hint-text">Hält denselben relativen Versatz zum Eltern-Token</span> }
          </div>

        </div>
      }

      <!-- ── Ausrüstung Tab ── -->
      @if (activeTab() === 'equipment') {
        <div class="equip-tab">
          @if (equipment.length === 0) {
            <div class="empty-rolls">Keine Ausrüstung vorhanden</div>
          } @else {
            @for (item of equipment; track item.name) {
              <div class="equip-entry"
                [class.equip-entry--weapon]="item.itemType === 'weapon'"
                [class.equip-entry--armor]="item.itemType === 'armor'">
                <div class="equip-top">
                  <span class="equip-type-icon">{{ item.itemType === 'weapon' ? '⚔️' : item.itemType === 'armor' ? '🛡️' : '🎒' }}</span>
                  <span class="equip-name">{{ item.lost ? '[Verloren] ' : '' }}{{ item.name }}</span>
                  @if (item.broken) { <span class="equip-broken-badge">💔 Kaputt</span> }
                </div>
                @if (item.itemType === 'weapon' && item.efficiency !== undefined) {
                  <div class="equip-stat-row">
                    <span class="equip-stat-label">⚔️ Effizienz</span>
                    <span class="equip-stat-val">{{ item.efficiency }}</span>
                  </div>
                }
                @if (item.itemType === 'armor' && item.stability !== undefined) {
                  <div class="equip-stat-row">
                    <span class="equip-stat-label">🛡️ Stabilität</span>
                    <span class="equip-stat-val">{{ item.stability }}</span>
                  </div>
                }
                @if (item.description) {
                  <div class="equip-desc">{{ item.description }}</div>
                }
              </div>
            }
          }
        </div>
      }

    </div><!-- /panel-body -->

    <!-- ── Würfelansicht Overlay ── -->
    @if (showDiceRoller() && diceSheet) {
      <div class="dice-overlay-backdrop" (click)="showDiceRoller.set(false)">
        <div class="dice-overlay-panel" (click)="$event.stopPropagation()">
          <button class="dice-overlay-close" (click)="showDiceRoller.set(false)" title="Schließen">✕</button>
          <app-dice-roller [sheet]="diceSheet" (close)="showDiceRoller.set(false)"></app-dice-roller>
        </div>
      </div>
    }

    <!-- ── Schaden würfeln Overlay ── -->
    @if (showDamageRoller()) {
      <div class="dice-overlay-backdrop" (click)="showDamageRoller.set(false)">
        <div class="dice-overlay-panel" (click)="$event.stopPropagation()">
          <button class="dice-overlay-close" (click)="showDamageRoller.set(false)" title="Schließen">✕</button>
          <app-damage-calculator
            [worldName]="worldName"
            [characterName]="character?.name ?? npc?.name ?? 'Spielleiter'"
            [characterId]="character?.id ?? token?.id ?? 'dm'"
            [initialEffektivitaet]="weaponEfficiency > 0 ? weaponEfficiency : undefined"
            (close)="showDamageRoller.set(false)">
          </app-damage-calculator>
        </div>
      </div>
    }

    <!-- ── Fertigkeiten & Zauber Vollansicht ── -->
    @if (showAbilitiesOverlay() && diceSheet) {
      <app-spellcast-window
        [sheet]="diceSheet"
        [defaultTab]="currentAbilityTab"
        (patch)="handleAbilitiesPatch($event)"
        (tabChange)="onAbilityTabChange($event)"
        (close)="showAbilitiesOverlay.set(false)">
      </app-spellcast-window>
    }

  }

</div>
  `,
  styles: [`
    .char-panel {
      height: 100%;
      width: 100%;
      background: #111827;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: inherit;
      color: #e5e7eb;
    }

    /* ---- Panel Header / Token Header ---- */
    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      flex-shrink: 0;
    }
    .panel-title {
      font-size: 13px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .token-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      flex-shrink: 0;
    }
    .token-portrait {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #6366f1;
    }
    .token-portrait-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      color: #9ca3af;
      border: 2px solid #4b5563;
      flex-shrink: 0;
    }
    .token-name {
      flex: 1;
      font-size: 14px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .deselect-btn {
      background: none;
      border: 1px solid #374151;
      color: #94a3b8;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }
    .deselect-btn:hover { background: #374151; color: #ef4444; }

    /* ---- Resources ---- */
    .resources {
      padding: 8px 10px 4px;
      background: #1a2332;
      border-bottom: 1px solid #2d3748;
      flex-shrink: 0;
    }
    .res-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }
    .res-icon { font-size: 12px; flex-shrink: 0; }
    .res-label {
      font-size: 10px;
      font-weight: 700;
      color: #9ca3af;
      width: 42px;
      flex-shrink: 0;
    }
    .res-controls {
      display: flex;
      align-items: center;
      gap: 2px;
      flex: 1;
    }
    .res-btn {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      border: 1px solid #374151;
      background: #1f2937;
      color: #d1d5db;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      flex-shrink: 0;
      padding: 0;
      line-height: 1;
    }
    .res-btn.minus:hover { background: #7f1d1d; border-color: #ef4444; }
    .res-btn.plus:hover { background: #14532d; border-color: #22c55e; }
    .res-input {
      width: 46px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 3px;
      color: #f1f5f9;
      font-size: 12px;
      text-align: center;
      padding: 2px 4px;
      flex: 1;
      min-width: 0;
    }
    .res-input:focus { outline: none; border-color: #6366f1; }
    .res-max {
      font-size: 10px;
      color: #6b7280;
      flex-shrink: 0;
    }
    .res-bar-wrap {
      height: 4px;
      background: #1f2937;
      border-radius: 2px;
      margin-bottom: 6px;
      overflow: hidden;
    }
    .res-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    .res-bar.hp { background: linear-gradient(90deg, #ef4444, #f87171); }
    .res-bar.mana { background: linear-gradient(90deg, #6366f1, #818cf8); }
    .res-bar.energy { background: linear-gradient(90deg, #eab308, #fde047); }

    /* ---- Panel Tabs ---- */
    .panel-tabs {
      display: flex;
      background: #0f172a;
      border-bottom: 1px solid #334155;
      flex-shrink: 0;
    }
    .ptab {
      flex: 1;
      padding: 7px 4px;
      background: transparent;
      border: none;
      color: #6b7280;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .ptab:hover { color: #d1d5db; background: #1e293b; }
    .ptab.active {
      color: #818cf8;
      background: #1e293b;
      border-bottom: 2px solid #6366f1;
    }

    /* ---- Panel Body (scrollable) ---- */
    .panel-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0;
    }
    .panel-body::-webkit-scrollbar { width: 4px; }
    .panel-body::-webkit-scrollbar-track { background: #0f172a; }
    .panel-body::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

    /* ---- Section headers ---- */
    .section-header {
      font-size: 10px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 8px 10px 4px;
      background: #0f172a;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    /* ---- Stats grid ---- */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 4px 8px 8px;
    }
    .stat-roll-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 4px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
      gap: 2px;
    }
    .stat-roll-btn:hover {
      background: #2d3748;
      border-color: #6366f1;
      transform: translateY(-1px);
    }
    .stat-lbl {
      font-size: 9px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .stat-val {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .stat-mod {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .stat-mod.mod-good { color: #22c55e; background: rgba(34,197,94,0.1); }
    .stat-mod.mod-bad { color: #f87171; background: rgba(248,113,113,0.1); }

    /* ---- Quick dice / free roll ---- */
    .quick-dice-section, .free-roll-section {
      padding: 8px 10px;
      border-bottom: 1px solid #1e293b;
    }
    .dice-type-row {
      display: flex;
      gap: 3px;
      flex-wrap: wrap;
      margin-bottom: 6px;
    }
    .dice-btn {
      padding: 3px 6px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 4px;
      color: #9ca3af;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .dice-btn:hover { background: #2d3748; color: #d1d5db; }
    .dice-btn.active { background: #4338ca; border-color: #6366f1; color: #e0e7ff; }
    .bonus-roll-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .bonus-input {
      width: 56px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 4px;
      color: #f1f5f9;
      font-size: 12px;
      text-align: center;
      padding: 4px 6px;
    }
    .bonus-input:focus { outline: none; border-color: #6366f1; }
    .do-roll-btn {
      flex: 1;
      padding: 5px 8px;
      background: linear-gradient(135deg, #4338ca, #7c3aed);
      border: none;
      border-radius: 5px;
      color: white;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .do-roll-btn:hover { opacity: 0.85; }

    /* ---- Skills ---- */
    .skill-list, .spell-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 8px 8px;
    }
    .skill-entry, .spell-entry {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 5px 8px;
      background: #1e293b;
      border: 1px solid #2d3748;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .skill-entry:hover, .spell-entry:hover { background: #243044; }
    .skill-meta, .spell-meta {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      min-width: 0;
    }
    .skill-name, .spell-name {
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .spell-icon { font-size: 13px; flex-shrink: 0; }
    .skill-tag {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      white-space: nowrap;
    }
    .action-tag { background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
    .cost-tag { background: rgba(234,179,8,0.15); color: #fde047; border: 1px solid rgba(234,179,8,0.2); }

    .action-btn {
      padding: 4px 8px;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 4px;
      color: #9ca3af;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .action-btn:hover { background: #374151; color: #f1f5f9; border-color: #6366f1; }
    .action-btn--active { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.4); color: #4ade80; }
    .action-btn--active:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #f87171; }
    .spell-btn:hover { border-color: #8b5cf6; }

    /* ---- Roll History ---- */
    .roll-history {
      flex: 1;
      overflow-y: auto;
      padding: 4px 8px;
    }
    .roll-history::-webkit-scrollbar { width: 4px; }
    .roll-history::-webkit-scrollbar-track { background: #0f172a; }
    .roll-history::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

    .empty-rolls {
      padding: 20px;
      text-align: center;
      color: #4b5563;
      font-size: 12px;
    }

    .roll-entry {
      padding: 6px 8px;
      background: #1a2130;
      border: 1px solid #1e293b;
      border-radius: 6px;
      margin-bottom: 4px;
      transition: background 0.15s;
    }
    .roll-entry:hover { background: #1e2a3f; }
    .roll-entry.secret { border-color: #5b21b6; }
    .roll-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 3px;
      flex-wrap: wrap;
    }
    .roll-char {
      font-size: 11px;
      font-weight: 700;
      color: #818cf8;
    }
    .roll-action-name {
      font-size: 10px;
      color: #f59e0b;
      font-weight: 600;
    }
    .roll-time {
      font-size: 9px;
      color: #4b5563;
      margin-left: auto;
    }
    .roll-dice-row {
      display: flex;
      align-items: center;
      gap: 3px;
      flex-wrap: wrap;
    }
    .die-val {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 3px;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 700;
      color: #d1d5db;
    }
    .die-val.crit-low { background: rgba(34,197,94,0.2); border-color: #22c55e; color: #4ade80; }
    .die-val.crit-high { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #f87171; }
    .roll-bonus { font-size: 11px; font-weight: 700; padding: 0 3px; }
    .roll-bonus.pos { color: #22c55e; }
    .roll-bonus.neg { color: #f87171; }
    .roll-eq { font-size: 12px; color: #d1d5db; margin-left: 4px; }
    .roll-eq strong { color: #fbbf24; font-size: 14px; }

    /* ---- Status Effects Tab ---- */
    .status-tab, .aussehen-tab, .linked-tab {
      padding: 0 0 16px;
    }
    .fx-entry {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: #1a2130;
      border: 1px solid #1e293b;
      border-radius: 6px;
      margin: 3px 8px;
    }
    .fx-entry.debuff { border-color: #7f1d1d; background: #1f0f0f; }
    .fx-icon { font-size: 14px; flex-shrink: 0; }
    .fx-name { font-size: 12px; font-weight: 600; color: #e2e8f0; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .fx-controls { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
    .fx-stacks-label, .fx-dur-label { font-size: 9px; color: #6b7280; }
    .fx-btn {
      width: 18px; height: 18px;
      background: #1f2937; border: 1px solid #374151; border-radius: 3px;
      color: #d1d5db; font-size: 13px; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      padding: 0; line-height: 1;
    }
    .fx-btn:hover { background: #374151; }
    .fx-val { font-size: 11px; font-weight: 700; color: #f1f5f9; min-width: 14px; text-align: center; }
    .fx-remove-btn {
      width: 18px; height: 18px;
      background: none; border: 1px solid #374151; border-radius: 3px;
      color: #ef4444; font-size: 10px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; padding: 0;
    }
    .fx-remove-btn:hover { background: #7f1d1d; border-color: #ef4444; }
    .add-fx-btn {
      display: block; width: calc(100% - 16px); margin: 6px 8px 0;
      padding: 7px 10px;
      background: #1e293b; border: 1px dashed #334155; border-radius: 6px;
      color: #6b7280; font-size: 12px; font-weight: 600; cursor: pointer;
      text-align: center; transition: all 0.15s;
    }
    .add-fx-btn:hover { border-color: #6366f1; color: #a5b4fc; background: #1e2540; }
    .add-fx-form {
      margin: 4px 8px; padding: 8px; background: #1e293b; border: 1px solid #334155; border-radius: 6px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .form-row { display: flex; gap: 6px; align-items: center; }
    .fx-input {
      background: #0f172a; border: 1px solid #334155; border-radius: 4px;
      color: #f1f5f9; font-size: 12px; padding: 4px 6px;
    }
    .fx-input:focus { outline: none; border-color: #6366f1; }
    .fx-check { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #9ca3af; cursor: pointer; }
    .fx-check input { cursor: pointer; }
    .small-btn { flex: 1; padding: 5px 8px !important; font-size: 11px !important; }

    .scale-number-input {
      width: 52px !important;
      text-align: center;
      font-size: 13px !important;
      font-weight: 700 !important;
      padding: 3px 4px !important;
      -moz-appearance: textfield;
    }
    .scale-number-input::-webkit-outer-spin-button,
    .scale-number-input::-webkit-inner-spin-button { -webkit-appearance: none; }
    .upload-portrait-label {
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .draw-canvas-container {
      margin: 2px 8px 6px;
      background: #1a2130;
      border: 1px solid #334155;
      border-radius: 6px;
      overflow: hidden;
    }
    .draw-canvas-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      flex-wrap: wrap;
    }
    .draw-canvas {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      cursor: crosshair;
      image-rendering: pixelated;
    }
    .draw-canvas-actions {
      display: flex;
      gap: 6px;
      padding: 6px 8px;
      border-top: 1px solid #334155;
    }
    /* ---- Aussehen Tab ---- */
    .aussehen-row { display: flex; align-items: center; gap: 8px; padding: 4px 10px 6px; }
    .uniform-row { justify-content: space-between; }
    .scale-quick-btns { display: flex; align-items: center; gap: 6px; }
    .scale-label { font-size: 12px; font-weight: 700; color: #f1f5f9; min-width: 36px; text-align: center; }
    .quick-btn {
      padding: 3px 8px; background: #1e293b; border: 1px solid #334155; border-radius: 4px;
      color: #9ca3af; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
    }
    .quick-btn:hover { background: #2d3748; border-color: #6366f1; color: #e2e8f0; }
    .aussehen-slider-row { display: flex; align-items: center; gap: 8px; padding: 2px 10px 4px; }
    .slider-label { font-size: 10px; font-weight: 700; color: #6b7280; width: 16px; flex-shrink: 0; }
    .slider { flex: 1; accent-color: #6366f1; }
    .slider-val { font-size: 11px; color: #94a3b8; min-width: 36px; text-align: right; }
    .rotation-btns { display: flex; gap: 6px; padding: 2px 10px 6px; }
    .imagemode-row { display: flex; gap: 6px; padding: 4px 10px 6px; }
    .mode-btn {
      flex: 1; padding: 5px 8px; background: #1e293b; border: 1px solid #334155;
      border-radius: 5px; color: #6b7280; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s;
    }
    .mode-btn:hover { border-color: #6366f1; color: #a5b4fc; }
    .mode-btn.active { background: #312e81; border-color: #6366f1; color: #e0e7ff; }
    .name-input { flex: 1; }
    .portrait-preview-row { display: flex; align-items: center; gap: 8px; padding: 4px 10px; }
    .portrait-preview { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; border: 2px solid #6366f1; }
    .danger-btn { color: #ef4444 !important; border-color: #7f1d1d !important; }
    .danger-btn:hover { background: #7f1d1d !important; color: #fca5a5 !important; }
    .draw-btn { margin-top: 4px; }

    /* ---- Linked Tab ---- */
    .linked-parent-info {
      display: flex; align-items: center; gap: 6px; padding: 6px 10px;
      background: #1a2130; border: 1px solid #1e3a5f; border-radius: 6px; margin: 4px 8px;
    }
    .linked-type-badge {
      font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px;
      background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3);
    }
    .linked-type-hint { padding: 4px 10px; }
    .hint-text { font-size: 10px; color: #4b5563; font-style: italic; }

    /* ---- Key Stats Row (Weapon Efficiency + Defense) ---- */
    .key-stats-row {
      display: flex; gap: 8px; padding: 6px 10px;
      background: #0f172a; border-bottom: 1px solid #1e293b; flex-shrink: 0;
    }
    .key-stat-item {
      display: flex; align-items: center; gap: 6px; flex: 1;
      background: #1a2130; border: 1px solid #2d3748; border-radius: 6px; padding: 5px 8px;
    }
    .key-stat-label { font-size: 10px; font-weight: 700; color: #9ca3af; }
    .key-stat-val { font-size: 15px; font-weight: 800; color: #f1f5f9; margin-left: auto; }

    /* ---- Open Dice Button ---- */
    .open-dice-btn {
      display: block; width: 100%; padding: 9px 12px;
      background: #1e293b; border: 1px solid #4338ca; border-radius: 6px;
      color: #a5b4fc; font-size: 13px; font-weight: 700; cursor: pointer;
      text-align: center; transition: all 0.15s;
    }
    .open-dice-btn:hover { background: #2d3748; border-color: #6366f1; color: #e0e7ff; }
    .open-dice-btn.dmg-btn { background: rgba(220,38,38,0.1); border-color: #991b1b; color: #fca5a5; margin-top: 6px; }
    .open-dice-btn.dmg-btn:hover { background: rgba(220,38,38,0.2); border-color: #ef4444; color: #fecaca; }
    .open-dice-btn.abilities-btn { background: rgba(99,102,241,0.1); border-color: #4f46e5; color: #c7d2fe; }
    .open-dice-btn.abilities-btn:hover { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #e0e7ff; }

    /* ---- Lobby Skill Cards ---- */
    .skill-cards-list { display: flex; flex-direction: column; gap: 4px; padding: 2px 8px 8px; }
    .lsc {
      border-radius: 6px; overflow: hidden; border: 1px solid #2d3748;
      background: #1a2130; transition: box-shadow 0.15s, border-color 0.15s;
    }
    .lsc[data-type="active"] { border-color: #3730a3; }
    .lsc[data-type="passive"] { border-color: #166534; }
    .lsc[data-type="stat_bonus"] { border-color: #92400e; }
    .lsc[data-type="dice_bonus"] { border-color: #1e3a5f; }
    .lsc--clickable { cursor: pointer; }
    .lsc--clickable:hover { box-shadow: 0 0 0 2px rgba(99,102,241,0.4); border-color: #4f46e5; }
    .lsc--active { box-shadow: 0 0 0 2px rgba(99,102,241,0.6) !important; border-color: #6366f1 !important; }
    .lsc-bar {
      display: flex; align-items: center; gap: 4px; padding: 5px 8px 4px;
      background: rgba(255,255,255,0.03); flex-wrap: wrap;
    }
    .lsc-type-icon { font-size: 11px; flex-shrink: 0; }
    .lsc-type-lbl {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      color: #6b7280; letter-spacing: 0.05em; flex-shrink: 0;
    }
    .lsc[data-type="active"] .lsc-type-lbl { color: #818cf8; }
    .lsc[data-type="passive"] .lsc-type-lbl { color: #4ade80; }
    .lsc[data-type="stat_bonus"] .lsc-type-lbl { color: #fbbf24; }
    .lsc[data-type="dice_bonus"] .lsc-type-lbl { color: #38bdf8; }
    .lsc-name {
      flex: 1; font-size: 12px; font-weight: 700; color: #f1f5f9;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .lsc-action-tag {
      font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; flex-shrink: 0;
      background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3);
    }
    .lsc-action-tag[data-action="Reaktion"] { background: rgba(245,158,11,0.2); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
    .lsc-action-tag[data-action="Freie Aktion"] { background: rgba(74,222,128,0.2); color: #4ade80; border-color: rgba(74,222,128,0.3); }
    .lsc-enl { font-size: 11px; color: #fbbf24; flex-shrink: 0; }
    .lsc-active-badge {
      font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; flex-shrink: 0;
      background: rgba(99,102,241,0.3); color: #c7d2fe; border: 1px solid rgba(99,102,241,0.4);
    }
    .lsc-desc { font-size: 11px; color: #94a3b8; padding: 3px 8px 4px; line-height: 1.4; }
    .lsc-footer { display: flex; align-items: center; justify-content: space-between; padding: 3px 8px 5px; gap: 6px; }
    .lsc-class { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .lsc-cost { font-size: 11px; font-weight: 700; padding: 1px 5px; border-radius: 3px; }
    .lsc-cost[data-resource="mana"] { background: rgba(99,102,241,0.2); color: #c4b5fd; }
    .lsc-cost[data-resource="energy"] { background: rgba(251,191,36,0.2); color: #fcd34d; }
    .lsc-cost[data-resource="life"] { background: rgba(239,68,68,0.2); color: #fca5a5; }

    /* ---- Library Picker ---- */
    .lib-picker { margin: 4px 8px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; overflow: hidden; }
    .lib-picker-search { width: calc(100% - 16px); margin: 8px; display: block; }
    .lib-picker-list { max-height: 220px; overflow-y: auto; }
    .lib-picker-item {
      display: flex; align-items: center; gap: 8px; padding: 6px 10px; cursor: pointer;
      border-top: 1px solid #1e293b; transition: background 0.12s;
    }
    .lib-picker-item:hover { background: #2d3748; }
    .lib-picker-icon { font-size: 14px; flex-shrink: 0; }
    .lib-picker-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .lib-picker-name { font-size: 12px; font-weight: 600; color: #e2e8f0; }
    .lib-picker-dur { font-size: 10px; color: #6b7280; }

    /* ---- Ausrüstung Tab ---- */
    .equip-tab { padding: 4px 8px 12px; }
    .equip-entry { background: #1a2130; border: 1px solid #2d3748; border-radius: 6px; padding: 7px 10px; margin-bottom: 4px; }
    .equip-entry--weapon { border-color: #1e3a5f; }
    .equip-entry--armor { border-color: #1a3a1f; }
    .equip-top { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .equip-type-icon { font-size: 13px; flex-shrink: 0; }
    .equip-name { flex: 1; font-size: 12px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .equip-broken-badge { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 3px; background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); flex-shrink: 0; }
    .equip-stat-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .equip-stat-label { font-size: 10px; color: #6b7280; }
    .equip-stat-val { font-size: 13px; font-weight: 700; color: #fbbf24; }
    .equip-desc { font-size: 10px; color: #6b7280; margin-top: 3px; line-height: 1.3; }

    /* ---- Dice Roller Overlay ---- */
    .dice-overlay-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999;
      display: flex; align-items: center; justify-content: center;
    }
    .dice-overlay-panel {
      position: relative; max-width: 580px; width: calc(100vw - 32px);
      max-height: calc(100vh - 48px); overflow: auto; background: #111827;
      border-radius: 12px; border: 1px solid #334155;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    }
    .dice-overlay-close {
      position: absolute; top: 10px; right: 10px; z-index: 10;
      background: #1e293b; border: 1px solid #374151; color: #94a3b8;
      border-radius: 4px; width: 28px; height: 28px; cursor: pointer;
      font-size: 14px; display: flex; align-items: center; justify-content: center;
    }
    .dice-overlay-close:hover { background: #374151; color: #ef4444; }
  `]
})
export class LobbyCharacterPanelComponent implements OnChanges, AfterViewInit {

  @Input() token: Token | null = null;
  @Input() character: CharacterSheet | null = null;
  @Input() npc: NpcStatblock | null = null;
  @Input() rolls: DiceRollEvent[] = [];
  @Input() worldName: string = '';
  @Input() isGM: boolean = false;
  @Input() allTokens: Token[] = [];

  @Output() tokenUpdate = new EventEmitter<Partial<Omit<Token, 'id'>>>();
  @Output() deselect = new EventEmitter<void>();
  @Output() requestTokenDraw = new EventEmitter<string>(); // Emits tokenId
  @Output() requestLinkedTokenPlacement = new EventEmitter<{ parentId: string; type: LinkedTokenType; name: string }>();
  @Output() tokenChildDetach = new EventEmitter<{ childId: string }>();

  private worldSocket = inject(WorldSocketService);
  private trueStats = inject(TrueStatsService);
  private charSocket = inject(CharacterSocketService);
  private libraryStore = inject(LibraryStoreService);
  private cdr = inject(ChangeDetectorRef);

  activeTab = signal<PanelTab>('actions');
  selectedDiceType = signal(20);
  customBonus = signal(0);
  showDiceRoller = signal(false);
  showDamageRoller = signal(false);
  showAbilitiesOverlay = signal(false);
  showLibraryPicker = signal(false);
  libraryPickerSearch = '';
  private libraryLoaded = false;

  // ── Per-token ability overlay state ──────────────────────────────────────
  /** Remembered tab per tokenId so reopening restores the last-viewed tab */
  private abilityTabMemory = new Map<string, 'spells' | 'skills'>();
  currentAbilityTab: 'spells' | 'skills' = 'spells';

  // ── Cached NPC sheet (mutable, persists mutations from SpellcastWindow) ──
  private _cachedNpcSheet: CharacterSheet | null = null;
  private _cachedNpcSheetId: string | null = null;

  // Status effect form state
  showAddEffectForm = signal(false);
  newEffectName = '';
  newEffectIcon = '';
  newEffectIsDebuff = false;
  newEffectDuration: number | null = null;

  // Draw canvas state
  @ViewChild('tokenDrawCanvas') tokenDrawCanvasRef?: ElementRef<HTMLCanvasElement>;
  showDrawCanvas = signal(false);
  drawColor = '#000000';
  drawBrushSize = 8;
  private _drawingActive = false;
  private _drawCtx: CanvasRenderingContext2D | null = null;

  // Cosmetic state (local mirrors of token values)
  localName = '';
  localScaleX = 1.0;
  localScaleY = 1.0;
  localRotation = 0;
  localImageMode: 'fill' | 'stretch' = 'fill';
  uniformScale = true;

  // Linked token creation state
  newLinkedType: LinkedTokenType = 'keepOffset';
  newLinkedName = '';

  readonly diceTypes = [4, 6, 8, 10, 12, 20, 100];

  ngOnChanges(changes: SimpleChanges): void {
    // Switch to actions tab and sync local state whenever the selected token changes
    if (changes['token'] && this.token?.id !== changes['token'].previousValue?.id) {
      this.activeTab.set('actions');
      this.syncCosmeticLocals();
      this.showAddEffectForm.set(false);
      this.showDrawCanvas.set(false);
      this.showDiceRoller.set(false);
      this.showDamageRoller.set(false);
      this.showAbilitiesOverlay.set(false);
      this.showLibraryPicker.set(false);
      this.cdr.markForCheck();
    }
    // Rebuild NPC sheet cache whenever token or NPC changes
    if (changes['token'] || changes['npc']) {
      const tokenId = this.token?.id ?? null;
      if (tokenId !== this._cachedNpcSheetId || changes['npc']) {
        this._cachedNpcSheetId = tokenId;
        this._cachedNpcSheet = this.npc ? this._buildNpcSheet() : null;
      }
    }
  }

  ngAfterViewInit(): void {
    // Canvas is rendered lazily; init happens in openDrawCanvas()
  }

  private syncCosmeticLocals(): void {
    if (this.token) {
      this.localName = this.token.name;
      this.localScaleX = this.token.scaleX ?? 1.0;
      this.localScaleY = this.token.scaleY ?? 1.0;
      this.localRotation = this.token.rotation ?? 0;
      this.localImageMode = this.token.imageMode ?? 'fill';
    }
  }

  // ---- Resource getters ----

  get currentHealth(): number {
    if (this.token?.currentHealth !== undefined) return this.token.currentHealth;
    if (this.character) {
      return this.character.statuses?.find(s => s.formulaType === FormulaType.LIFE)?.statusCurrent ?? 0;
    }
    return this.npc?.maxHealth ?? 0;
  }

  get maxHealth(): number {
    if (this.character) {
      const s = this.character.statuses?.find(s => s.formulaType === FormulaType.LIFE);
      if (s) return (s.statusBase || 0) + (s.statusBonus || 0) + (s.statusEffectBonus || 0);
    }
    return this.npc?.maxHealth ?? 0;
  }

  get currentMana(): number {
    if (this.token?.currentMana !== undefined) return this.token.currentMana;
    if (this.character) {
      return this.character.statuses?.find(s => s.formulaType === FormulaType.MANA)?.statusCurrent ?? 0;
    }
    return this.npc?.maxMana ?? 0;
  }

  get maxMana(): number {
    if (this.character) {
      const s = this.character.statuses?.find(s => s.formulaType === FormulaType.MANA);
      if (s) return (s.statusBase || 0) + (s.statusBonus || 0) + (s.statusEffectBonus || 0);
    }
    return this.npc?.maxMana ?? 0;
  }

  get currentEnergy(): number {
    if (this.token?.currentEnergy !== undefined) return this.token.currentEnergy;
    if (this.character) {
      return this.character.statuses?.find(s => s.formulaType === FormulaType.ENERGY)?.statusCurrent ?? 0;
    }
    return this.npc?.maxEnergy ?? 0;
  }

  get maxEnergy(): number {
    if (this.character) {
      const s = this.character.statuses?.find(s => s.formulaType === FormulaType.ENERGY);
      if (s) return (s.statusBase || 0) + (s.statusBonus || 0) + (s.statusEffectBonus || 0);
    }
    return this.npc?.maxEnergy ?? 0;
  }

  // ---- Stat displays ----

  get stats(): StatDisplay[] {
    if (this.character) {
      const s = this.trueStats.getAllStats(this.character);
      return [
        { label: 'STR', value: s.strength,    bonus: this.diceBonus(s.strength) },
        { label: 'GES', value: s.dexterity,   bonus: this.diceBonus(s.dexterity) },
        { label: 'SPD', value: s.speed,        bonus: this.diceBonus(s.speed) },
        { label: 'INT', value: s.intelligence, bonus: this.diceBonus(s.intelligence) },
        { label: 'KON', value: s.constitution, bonus: this.diceBonus(s.constitution) },
        { label: 'WIL', value: s.wille,        bonus: this.diceBonus(s.wille) },
      ];
    }
    if (this.npc) {
      return [
        { label: 'STR', value: this.npc.strength,     bonus: this.diceBonus(this.npc.strength) },
        { label: 'GES', value: this.npc.dexterity,    bonus: this.diceBonus(this.npc.dexterity) },
        { label: 'SPD', value: this.npc.speed,         bonus: this.diceBonus(this.npc.speed) },
        { label: 'INT', value: this.npc.intelligence,  bonus: this.diceBonus(this.npc.intelligence) },
        { label: 'KON', value: this.npc.constitution,  bonus: this.diceBonus(this.npc.constitution) },
        { label: 'WIL', value: this.npc.wille,         bonus: this.diceBonus(this.npc.wille) },
      ];
    }
    return [];
  }

  get activeSkills(): SkillBlock[] {
    if (this.character) return (this.character.skills || []).filter(s => s.type === 'active' && !s.disabled);
    if (this.npc) {
      // Resolve skill-tree skills from learnedSkillIds
      const treeSkills: SkillBlock[] = (this.npc.learnedSkillIds || [])
        .map(id => SKILL_DEFINITIONS.find(s => s.id === id))
        .filter((def): def is NonNullable<typeof def> => !!def && def.type === 'active')
        .map(def => ({
          name: def.name,
          class: def.class,
          description: def.description,
          type: def.type as 'active',
          enlightened: def.enlightened ?? false,
          skillId: def.id,
          cost: def.cost,
          actionType: def.actionType,
        } as SkillBlock));
      const customActive = (this.npc.customSkills || []).filter(s => s.type === 'active');
      return [...treeSkills, ...customActive];
    }
    return [];
  }

  /** All skill types sorted: Active → Passive → Dice Bonus → Stat Bonus */
  get allSkills(): SkillBlock[] {
    const TYPE_ORDER: Record<string, number> = {
      'active': 0, 'passive': 1, 'dice_bonus': 2, 'stat_bonus': 3,
    };
    const sortByType = (skills: SkillBlock[]) =>
      [...skills].sort((a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99));

    if (this.character) return sortByType((this.character.skills || []).filter(s => !s.disabled));
    if (this.npc) {
      const treeSkills: SkillBlock[] = (this.npc.learnedSkillIds || [])
        .map(id => SKILL_DEFINITIONS.find(s => s.id === id))
        .filter((def): def is NonNullable<typeof def> => !!def)
        .map(def => ({
          name: def.name,
          class: def.class,
          description: def.description,
          type: def.type as SkillBlock['type'],
          enlightened: def.enlightened ?? false,
          skillId: def.id,
          cost: def.cost,
          actionType: def.actionType,
        } as SkillBlock));
      const customSkills = this.npc.customSkills || [];
      return sortByType([...treeSkills, ...customSkills]);
    }
    return [];
  }

  get spells(): SpellBlock[] {
    if (this.character) return this.character.spells || [];
    if (this.npc)       return this.npc.spells || [];
    return [];
  }

  get equipment(): ItemBlock[] {
    return this.character?.equipment ?? this.npc?.equipment ?? [];
  }

  /** Highest efficiency among non-lost weapons */
  get weaponEfficiency(): number {
    const weapons = this.equipment.filter(i => i.itemType === 'weapon' && !i.lost && i.efficiency !== undefined);
    if (weapons.length === 0) return 0;
    return Math.max(...weapons.map(w => w.efficiency!));
  }

  /** Combined defense value: sum of all stability / 5 (matches sheet formula) */
  get totalStability(): number {
    const total = this.equipment.filter(i => !i.lost).reduce((sum, i) => sum + (i.stability ?? 0), 0);
    return Math.floor(total / 5);
  }

  /** CharacterSheet for the dice roller / spellcast window.
   *  For characters: returns the live character (mutations persist on the real object).
   *  For NPCs:       returns a cached stub so mutations (activeSkillNames etc.) survive
   *                  change detection cycles. Only rebuilt when the token changes.
   */
  get diceSheet(): CharacterSheet | null {
    if (this.character) return this.character;
    return this._cachedNpcSheet;
  }

  private _buildNpcSheet(): CharacterSheet {
    const npc = this.npc!;
    const sheet = createEmptySheet();
    sheet.name = npc.name;
    sheet.id = this.token?.id ?? '';
    sheet.worldName = this.worldName;
    const makeStatBlock = (name: string, base: number): StatBlock => {
      const sb = new StatBlock(name, base);
      sb.current = base;
      return sb;
    };
    sheet.strength = makeStatBlock('Stärke', npc.strength);
    sheet.dexterity = makeStatBlock('Geschicklichkeit', npc.dexterity);
    sheet.speed = makeStatBlock('Geschwindigkeit', npc.speed);
    sheet.intelligence = makeStatBlock('Intelligenz', npc.intelligence);
    sheet.constitution = makeStatBlock('Konstitution', npc.constitution);
    sheet.chill = makeStatBlock('Wille', npc.wille);
    // Include skills so dice_bonus skills appear in the dice roller
    sheet.skills = this.allSkills;
    // Include spells for the spellcast window
    sheet.spells = npc.spells ?? [];
    return sheet;
  }

  /** Status effects from all loaded libraries */
  get filteredLibraryEffects(): StatusEffect[] {
    const search = this.libraryPickerSearch.toLowerCase().trim();
    const effects: StatusEffect[] = [];
    for (const lib of this.libraryStore.allLibraries) {
      for (const effect of (lib.statusEffects ?? [])) {
        effects.push(effect);
      }
    }
    if (!search) return effects;
    return effects.filter(e =>
      e.name.toLowerCase().includes(search) ||
      (e.tags ?? []).some((t: string) => t.toLowerCase().includes(search))
    );
  }

  get reversedRolls(): DiceRollEvent[] {
    return [...this.rolls].reverse().slice(0, 40);
  }

  // ---- Formulas ----

  diceBonus(val: number): number {
    // Inverted: lower stat value = higher bonus (worse roll) = bad
    return (5 - val / 2) | 0;
  }

  healthPct(): number  { const m = this.maxHealth;  return m > 0 ? Math.max(0, Math.min(100, (this.currentHealth  / m) * 100)) : 0; }
  manaPct():   number  { const m = this.maxMana;    return m > 0 ? Math.max(0, Math.min(100, (this.currentMana    / m) * 100)) : 0; }
  energyPct(): number  { const m = this.maxEnergy;  return m > 0 ? Math.max(0, Math.min(100, (this.currentEnergy  / m) * 100)) : 0; }

  // ---- Resource editing ----

  adjustResource(resource: 'health' | 'mana' | 'energy', delta: number): void {
    if (!this.token) return;
    const cur = resource === 'health' ? this.currentHealth : resource === 'mana' ? this.currentMana : this.currentEnergy;
    const max = resource === 'health' ? this.maxHealth    : resource === 'mana' ? this.maxMana    : this.maxEnergy;
    const newVal = Math.max(0, Math.min(max, cur + delta));
    this.emitResource(resource, newVal);
  }

  setResource(resource: 'health' | 'mana' | 'energy', event: Event): void {
    if (!this.token) return;
    const raw = parseInt((event.target as HTMLInputElement).value, 10);
    if (isNaN(raw)) return;
    const max = resource === 'health' ? this.maxHealth : resource === 'mana' ? this.maxMana : this.maxEnergy;
    this.emitResource(resource, Math.max(0, Math.min(max, raw)));
  }

  private emitResource(resource: 'health' | 'mana' | 'energy', value: number): void {
    if (resource === 'health')  this.tokenUpdate.emit({ currentHealth: value });
    else if (resource === 'mana')   this.tokenUpdate.emit({ currentMana: value });
    else                            this.tokenUpdate.emit({ currentEnergy: value });
  }

  // ---- Skill type helpers ----

  getSkillTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'active': '⚡', 'passive': '🌿', 'stat_bonus': '📊', 'dice_bonus': '🎲',
    };
    return icons[type] ?? '✨';
  }

  getSkillTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'active': 'Aktiv', 'passive': 'Passiv', 'stat_bonus': 'Stat-Bonus', 'dice_bonus': 'Würfelbonus',
    };
    return labels[type] ?? type;
  }

  onSkillCardClick(skill: SkillBlock): void {
    if (skill.type === 'active') this.activateSkill(skill);
  }

  // ---- Dice Roller ----

  openDiceRoller(): void {
    this.showDiceRoller.set(true);
  }

  openDamageRoller(): void {
    this.showDamageRoller.set(true);
  }

  openAbilitiesOverlay(): void {
    const key = this.token?.id ?? 'no-token';
    this.currentAbilityTab = this.abilityTabMemory.get(key) ?? 'spells';
    this.showAbilitiesOverlay.set(true);
  }

  onAbilityTabChange(tab: 'spells' | 'skills'): void {
    const key = this.token?.id ?? 'no-token';
    this.abilityTabMemory.set(key, tab);
    this.currentAbilityTab = tab;
  }

  /** Forward patches from SpellcastWindow to the character socket (ignored for NPCs) */
  handleAbilitiesPatch(patch: JsonPatch): void {
    if (this.character) {
      // ── Player character ──────────────────────────────────────────────
      // When the SpellcastWindow toggles skills (activeSkillNames), also keep
      // activeSkillEntries in sync so the bottom panel's "Aktiv" tab reflects
      // the change immediately (without waiting for a server round-trip).
      if (patch.path === 'activeSkillNames') {
        const names: string[] = patch.value ?? [];
        this._syncActiveSkillEntriesFromNames(names);
      }
      const charId = this.character.id;
      if (charId) {
        this.charSocket.sendPatch(charId, patch);
        this.charSocket.notifyLocalUpdate();
      }
    } else if (this.token) {
      // ── NPC / no-character token ──────────────────────────────────────
      // Patches are not forwarded to a server character socket; instead we
      // translate them into tokenUpdate emissions so the bottom panel and map
      // stay in sync.
      if (patch.path === 'activeSkillNames') {
        const names: string[] = patch.value ?? [];
        const updated = this._buildSkillEntriesFromNames(names, this.token.activeSkillEntries ?? []);
        this.tokenUpdate.emit({ activeSkillNames: names, activeSkillEntries: updated });
      } else if (patch.path === 'castingSpells') {
        this.tokenUpdate.emit({ castingSpells: patch.value });
      }
      this.cdr.markForCheck();
    }
  }

  /** Build a synced activeSkillEntries array from a list of skill names.
   *  Keeps existing entries (with their runtime state) and adds new ones. */
  private _buildSkillEntriesFromNames(names: string[], current: ActiveSkillEntry[]): ActiveSkillEntry[] {
    const kept = current.filter(e => names.includes(e.skillName ?? ''));
    const existingNames = new Set(kept.map(e => e.skillName ?? ''));
    const newEntries: ActiveSkillEntry[] = names
      .filter(n => !existingNames.has(n))
      .map(n => {
        const skill = this.allSkills.find(s => s.name === n);
        return {
          entryId: `skill-${skill?.skillId ?? n}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          skillId: skill?.skillId,
          skillName: n,
          roundsActive: 0,
          counters: (skill?.counters ?? []).map(c => ({ ...c })),
        } as ActiveSkillEntry;
      });
    return [...kept, ...newEntries];
  }

  private _syncActiveSkillEntriesFromNames(names: string[]): void {
    if (!this.character) return;
    const updated = this._buildSkillEntriesFromNames(names, this.character.activeSkillEntries ?? []);
    this.character.activeSkillEntries = updated;
    const charId = this.character.id;
    if (charId) this.charSocket.sendPatch(charId, { path: 'activeSkillEntries', value: updated });
  }

  // ---- Library Picker ----

  openLibraryPicker(): void {
    if (!this.libraryLoaded) {
      this.libraryLoaded = true;
      // Subscribe to allLibraries$ so the view re-renders when HTTP data actually arrives
      this.libraryStore.allLibraries$.subscribe(() => this.cdr.markForCheck());
      this.libraryStore.loadAllLibraries();
    }
    this.showLibraryPicker.set(!this.showLibraryPicker());
  }

  applyLibraryStatusEffect(effect: StatusEffect): void {
    if (!this.token) return;
    const existing = this.tokenStatusEffects.find(e => e.name === effect.name);
    if (existing) {
      this.adjustFxStacks(existing, 1);
    } else {
      const newFx: TokenStatusEffect = {
        id: `fx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        statusEffectId: effect.id,
        name: effect.name,
        icon: effect.icon,
        color: effect.color,
        stacks: 1,
        duration: effect.defaultDuration,
        isDebuff: effect.isDebuff,
      };
      const effects = [...this.tokenStatusEffects, newFx];
      this.tokenUpdate.emit({ activeStatusEffects: effects });
    }
    this.showLibraryPicker.set(false);
  }

  // ---- Dice Rolling ----

  rollStat(stat: StatDisplay): void {
    this.doRoll(20, 1,
      [{ name: stat.label, value: stat.bonus, source: 'stat' }],
      stat.label + '-Wurf', '⚔️');
  }

  rollSkill(_skill: SkillBlock): void { /* replaced by activateSkill */ }
  rollSpell(_spell: SpellBlock): void { /* replaced by activateSpell */ }

  // ---- Activation ----

  private get _charId(): string | null {
    return this.token?.characterId ?? null;
  }

  get characterCastingSpells(): CastingSpellEntry[] {
    if (this.character) return this.character.castingSpells ?? [];
    return this.token?.castingSpells ?? [];
  }

  private get _activeSkillEntries(): ActiveSkillEntry[] {
    if (this.character) return this.character.activeSkillEntries ?? [];
    return this.token?.activeSkillEntries ?? [];
  }

  isSkillActive(skill: SkillBlock): boolean {
    return this._activeSkillEntries.some(e =>
      (e.skillId && skill.skillId && e.skillId === skill.skillId) || e.skillName === skill.name
    );
  }

  isSpellActive(spell: SpellBlock): boolean {
    return this.characterCastingSpells.some(e => e.spellId === spell.id);
  }

  activateSkill(skill: SkillBlock): void {
    const entryId = `skill-${skill.skillId ?? skill.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: ActiveSkillEntry = {
      entryId,
      skillId: skill.skillId,
      skillName: skill.name,
      roundsActive: 0,
      counters: (skill.counters ?? []).map(c => ({ ...c })),
    };
    const updated = [...this._activeSkillEntries, entry];

    if (this.character) {
      this.character.activeSkillEntries = updated;
      const charId = this._charId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'activeSkillEntries', value: updated });
    } else {
      this.tokenUpdate.emit({ activeSkillEntries: updated });
    }
    this.charSocket.notifyLocalUpdate();
    this.cdr.markForCheck();
  }

  activateSpell(spell: SpellBlock): void {
    const entryId = `${spell.id ?? 'spell'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: CastingSpellEntry = {
      spellId: spell.id ?? entryId,
      spellName: spell.name,
      castLevel: 0,
      entryId,
      remainingCast: 0,
      roundsActive: 0,
    };
    const updated = [...this.characterCastingSpells, entry];

    if (this.character) {
      this.character.castingSpells = updated;
      const manaCost = spell.costMana ?? 0;
      if (manaCost > 0) {
        const statuses = [...(this.character.statuses || [])];
        const manaIdx = statuses.findIndex(s => s.formulaType === FormulaType.MANA);
        if (manaIdx >= 0) {
          const newVal = Math.max(0, (statuses[manaIdx].statusCurrent || 0) - manaCost);
          statuses[manaIdx] = { ...statuses[manaIdx], statusCurrent: newVal };
          this.character.statuses = statuses;
          const charId = this._charId;
          if (charId) this.charSocket.sendPatch(charId, { path: 'statuses', value: statuses });
        }
      }
      const charId = this._charId;
      if (charId) this.charSocket.sendPatch(charId, { path: 'castingSpells', value: updated });
    } else {
      this.tokenUpdate.emit({ castingSpells: updated });
    }
    this.charSocket.notifyLocalUpdate();
    this.cdr.markForCheck();
  }

  rollCustom(): void {
    const b = this.customBonus();
    const bonuses: { name: string; value: number; source: string }[] = [];
    if (b !== 0) bonuses.push({ name: 'Bonus', value: b, source: 'manual' });
    this.doRoll(this.selectedDiceType(), 1, bonuses, 'Freier Wurf', '🎲');
  }

  private doRoll(
    diceType: number,
    diceCount: number,
    bonuses: { name: string; value: number; source: string }[],
    actionName?: string,
    actionIcon?: string
  ): void {
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * diceType) + 1);
    }
    const result = rolls.reduce((a, b) => a + b, 0) + bonuses.reduce((a, b) => a + b.value, 0);
    const event: DiceRollEvent = {
      id: `${Date.now()}-${Math.random()}`,
      worldName: this.worldName,
      characterName: this.token?.name ?? this.character?.name ?? this.npc?.name ?? 'Unbekannt',
      characterId: this.token?.characterId ?? '',
      diceType,
      diceCount,
      bonuses,
      result,
      rolls,
      timestamp: new Date(),
      isSecret: false,
      actionName,
      actionIcon,
    };
    this.worldSocket.sendDiceRoll(event);
  }

  // ---- Helpers ----

  getTotalBonus(roll: DiceRollEvent): number {
    return roll.bonuses.reduce((sum, b) => sum + b.value, 0);
  }

  formatTime(timestamp: Date): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (s < 10)  return 'Gerade eben';
    if (s < 60)  return `Vor ${s}s`;
    if (m < 60)  return `Vor ${m}min`;
    return `Vor ${h}h`;
  }

  // ============================================================
  // Status Effects
  // ============================================================

  get tokenStatusEffects(): TokenStatusEffect[] {
    return this.token?.activeStatusEffects ?? [];
  }

  openAddEffectForm(): void {
    this.newEffectName = '';
    this.newEffectIcon = '';
    this.newEffectIsDebuff = false;
    this.newEffectDuration = null;
    this.showAddEffectForm.set(true);
  }

  addStatusEffect(): void {
    if (!this.token || !this.newEffectName.trim()) return;
    const newFx: TokenStatusEffect = {
      id: `fx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: this.newEffectName.trim(),
      icon: this.newEffectIcon.trim() || undefined,
      stacks: 1,
      duration: this.newEffectDuration ? +this.newEffectDuration : undefined,
      isDebuff: this.newEffectIsDebuff,
    };
    const effects = [...this.tokenStatusEffects, newFx];
    this.tokenUpdate.emit({ activeStatusEffects: effects });
    this.showAddEffectForm.set(false);
  }

  removeStatusEffect(id: string): void {
    if (!this.token) return;
    const effects = this.tokenStatusEffects.filter(e => e.id !== id);
    this.tokenUpdate.emit({ activeStatusEffects: effects });
  }

  adjustFxStacks(fx: TokenStatusEffect, delta: number): void {
    if (!this.token) return;
    const effects = this.tokenStatusEffects.map(e =>
      e.id === fx.id ? { ...e, stacks: Math.max(1, e.stacks + delta) } : e
    );
    this.tokenUpdate.emit({ activeStatusEffects: effects });
  }

  adjustFxDuration(fx: TokenStatusEffect, delta: number): void {
    if (!this.token) return;
    const effects = this.tokenStatusEffects.map(e =>
      e.id === fx.id ? { ...e, duration: Math.max(0, (e.duration ?? 0) + delta) } : e
    );
    this.tokenUpdate.emit({ activeStatusEffects: effects });
  }

  // ============================================================
  // Cosmetic
  // ============================================================

  saveName(): void {
    if (!this.token || !this.localName.trim()) return;
    this.tokenUpdate.emit({ name: this.localName.trim() });
  }

  applyCosmetic(): void {
    if (!this.token) return;
    this.tokenUpdate.emit({
      scaleX: this.localScaleX,
      scaleY: this.localScaleY,
      rotation: this.localRotation,
      imageMode: this.localImageMode,
    });
  }

  adjustScale(delta: number): void {
    this.localScaleX = Math.max(0.1, Math.round((this.localScaleX + delta) * 100) / 100);
    if (this.uniformScale) this.localScaleY = this.localScaleX;
    this.applyCosmetic();
  }

  onScaleInputChange(value: string): void {
    const v = Math.max(0.1, +value);
    this.localScaleX = v;
    if (this.uniformScale) this.localScaleY = v;
    this.applyCosmetic();
  }

  rotateBy(degrees: number): void {
    this.localRotation = ((this.localRotation + degrees) % 360 + 360) % 360;
    this.applyCosmetic();
  }

  clearCustomPortrait(): void {
    if (!this.token) return;
    this.tokenUpdate.emit({ customPortraitData: undefined });
  }

  uploadPortrait(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.tokenUpdate.emit({ customPortraitData: reader.result as string });
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    input.value = '';
  }

  openDrawCanvas(): void {
    this.showDrawCanvas.set(true);
    this.cdr.markForCheck();
    // Init canvas on next tick after it's rendered
    setTimeout(() => this.initDrawCanvas(), 0);
  }

  closeDrawCanvas(): void {
    this.showDrawCanvas.set(false);
    this._drawCtx = null;
  }

  saveDrawCanvas(): void {
    if (!this._drawCtx || !this.token) return;
    const dataUrl = this._drawCtx.canvas.toDataURL('image/png');
    this.tokenUpdate.emit({ customPortraitData: dataUrl });
    this.showDrawCanvas.set(false);
    this._drawCtx = null;
  }

  clearDrawCanvas(): void {
    if (!this._drawCtx) return;
    const c = this._drawCtx.canvas;
    this._drawCtx.clearRect(0, 0, c.width, c.height);
    this._drawCtx.fillStyle = '#ffffff';
    this._drawCtx.fillRect(0, 0, c.width, c.height);
  }

  private initDrawCanvas(): void {
    if (!this.tokenDrawCanvasRef) return;
    const canvas = this.tokenDrawCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this._drawCtx = ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // If token already has a custom portrait, load it
    if (this.token?.customPortraitData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = this.token.customPortraitData;
    }
  }

  onDrawCanvasMouseDown(event: MouseEvent): void {
    if (!this._drawCtx) return;
    this._drawingActive = true;
    const pos = this.getCanvasPos(event);
    this._drawCtx.beginPath();
    this._drawCtx.moveTo(pos.x, pos.y);
  }

  onDrawCanvasMouseMove(event: MouseEvent): void {
    if (!this._drawingActive || !this._drawCtx) return;
    const pos = this.getCanvasPos(event);
    this._drawCtx.lineWidth = this.drawBrushSize;
    this._drawCtx.lineCap = 'round';
    this._drawCtx.lineJoin = 'round';
    this._drawCtx.strokeStyle = this.drawColor;
    this._drawCtx.lineTo(pos.x, pos.y);
    this._drawCtx.stroke();
    this._drawCtx.beginPath();
    this._drawCtx.moveTo(pos.x, pos.y);
  }

  onDrawCanvasMouseUp(): void {
    this._drawingActive = false;
    if (this._drawCtx) {
      this._drawCtx.beginPath();
    }
  }

  private getCanvasPos(event: MouseEvent): { x: number; y: number } {
    if (!this.tokenDrawCanvasRef) return { x: 0, y: 0 };
    const rect = this.tokenDrawCanvasRef.nativeElement.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this.tokenDrawCanvasRef.nativeElement.width / rect.width),
      y: (event.clientY - rect.top) * (this.tokenDrawCanvasRef.nativeElement.height / rect.height),
    };
  }

  // ============================================================
  // Linked Tokens
  // ============================================================

  get linkedChildren(): Token[] {
    if (!this.token) return [];
    return this.allTokens.filter(t => t.parentTokenId === this.token!.id);
  }

  getParentName(): string {
    if (!this.token?.parentTokenId) return '';
    const parent = this.allTokens.find(t => t.id === this.token!.parentTokenId);
    return parent?.name ?? '(Unbekannt)';
  }

  getLinkedTypeLabel(type: LinkedTokenType | undefined): string {
    switch (type) {
      case 'free': return 'Frei';
      case 'keepDistance': return 'Abstand';
      case 'keepOffset': return 'Versatz';
      default: return 'Verknüpft';
    }
  }

  detachFromParent(): void {
    if (!this.token) return;
    this.tokenUpdate.emit({ parentTokenId: undefined, linkedTokenType: undefined, linkedOffset: undefined, linkedDistance: undefined });
  }

  detachChild(childId: string): void {
    this.tokenChildDetach.emit({ childId });
  }

  startLinkedTokenPlacement(): void {
    if (!this.token || !this.newLinkedName.trim()) return;
    this.requestLinkedTokenPlacement.emit({
      parentId: this.token.id,
      type: this.newLinkedType,
      name: this.newLinkedName.trim(),
    });
  }
}
