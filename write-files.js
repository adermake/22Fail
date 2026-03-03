const fs = require('fs');

const html = `<div class="item-card"
     [class.unusable]="!canUseItem"
     [class.broken]="item.broken"
     [class.lost]="item.lost"
     [class.folded]="isFolded"
     [class.compact]="compact"
     [class.unidentified]="!showDetails"
     [class.weapon]="item.itemType === 'weapon'"
     [class.armor]="item.itemType === 'armor'"
     (contextmenu)="onRightClick($event)"
     (dblclick)="toggleFold(); $event.stopPropagation()">

  <!-- Context menu -->
  @if (showContextMenu) {
    <div class="context-menu" [style.top.px]="contextMenuY" [style.left.px]="contextMenuX" (click)="$event.stopPropagation()">
      <button class="ctx-item" (click)="openEditorFromMenu()">✏️ Bearbeiten</button>
      @if (showDetails) {
        <button class="ctx-item" (click)="toggleLostFromMenu()">
          {{ item.lost ? '✓ Als vorhanden markieren' : '✕ Als verloren markieren' }}
        </button>
      }
      <button class="ctx-item ctx-delete" (click)="deleteFromContextMenu()">🗑 Löschen</button>
    </div>
  }

  <div class="item-view">
    <!-- Always-visible header row -->
    <div class="item-header">
      @if (showDetails && item.itemType) {
        <span class="item-type-icon">{{ itemTypeIcon }}</span>
      }
      @if (!showDetails) {
        <span class="item-type-icon">❓</span>
      }

      <div class="item-name-block">
        <div class="item-title-row">
          <h4>{{ displayName }}</h4>
          @if (!showDetails) {
            <span class="unidentified-badge">Unidentifiziert</span>
          }
          @if (showDetails && item.broken) {
            <span class="broken-badge">⚠ Zerbrochen</span>
          }
          @if (showDetails && item.lost) {
            <span class="lost-badge">Verloren</span>
          }
        </div>
        <div class="item-tags-row">
          @if (showDetails && slotLabel) {
            <span class="tag tag-slot">{{ slotLabel }}</span>
          }
          @if (showDetails) {
            <span class="tag tag-weight" [class.tag-big]="!isFolded">{{ item.weight }} kg</span>
          }
          @if (showDetails && item.itemType === 'weapon' && item.efficiency) {
            <span class="tag tag-eff" [class.tag-big]="!isFolded">⚔ {{ item.efficiency }}</span>
          }
          @if (showDetails && item.itemType === 'armor' && item.stability) {
            <span class="tag tag-stab" [class.tag-big]="!isFolded">🛡 {{ item.stability }}</span>
          }
          @if (showDetails && item.armorDebuff) {
            <span class="tag tag-debuff">-{{ item.armorDebuff }} SPD</span>
          }
          @if (showDetails && !canUseItem && !item.broken && !item.lost) {
            <span class="tag tag-unusable">Unbrauchbar</span>
          }
          @if (showDetails && item.libraryOriginName) {
            <span class="tag tag-lib" [title]="'Aus Bibliothek: ' + item.libraryOriginName">📚 {{ item.libraryOriginName }}</span>
          }
        </div>
      </div>

      <div class="item-controls">
        <button class="fold-btn"
                (click)="toggleFold(); $event.stopPropagation()"
                (mousedown)="$event.stopPropagation()"
                (touchstart)="$event.stopPropagation()"
                [title]="isFolded ? 'Ausklappen' : 'Einklappen'">
          {{ isFolded ? '▼' : '▲' }}
        </button>
      </div>
    </div>

    @if (!isFolded && showDetails) {

      <!-- 1. Description -->
      @if (item.description) {
        <p class="item-description" [innerHTML]="enhancedDescription"></p>
      }

      <!-- 2. Effects -->
      @if (item.primaryEffect || item.secondaryEffect || item.specialEffect) {
        <div class="effects-section">
          @if (item.primaryEffect) {
            <div class="effect-item primary">
              <span class="effect-label">Primäreffekt</span>
              <span class="effect-text">{{ item.primaryEffect }}</span>
            </div>
          }
          @if (item.secondaryEffect) {
            <div class="effect-item secondary">
              <span class="effect-label">Sekundäreffekt</span>
              <span class="effect-text">{{ item.secondaryEffect }}</span>
            </div>
          }
          @if (item.specialEffect) {
            <div class="effect-item special">
              <span class="effect-label">Spezialeffekt</span>
              <span class="effect-text">{{ item.specialEffect }}</span>
            </div>
          }
        </div>
      }

      <!-- 3. Stat Modifiers -->
      @if (item.statModifiers && item.statModifiers.length > 0) {
        <div class="stat-modifiers-section">
          @for (modifier of item.statModifiers; track modifier.stat) {
            <span class="stat-modifier" [class.positive]="modifier.amount > 0" [class.negative]="modifier.amount < 0">
              {{ getStatLabel(modifier.stat) }}: {{ modifier.amount > 0 ? '+' : '' }}{{ modifier.amount }}
            </span>
          }
        </div>
      }

      <!-- 4. Dice Bonuses -->
      @if (item.diceBonuses && item.diceBonuses.length > 0) {
        <div class="dice-bonuses-section">
          @for (bonus of item.diceBonuses; track bonus.name) {
            <span class="dice-bonus" [class.good]="bonus.value < 0" [class.bad]="bonus.value > 0">
              {{ bonus.name }}: {{ bonus.value > 0 ? '+' : '' }}{{ bonus.value }}
            </span>
          }
        </div>
      }

      <!-- 5. Custom Counters (same structure as durability) -->
      @if (item.counters && item.counters.length > 0) {
        <div class="counters-section">
          @for (counter of item.counters; track counter.id) {
            <div class="bar-row" (mousedown)="$event.stopPropagation()">
              <span class="bar-label">{{ counter.name }}</span>
              <div class="bar-with-input">
                <div class="bar-track" [style.--bar-color]="counter.color">
                  <div class="bar-fill"
                       [style.width.%]="getCounterPercent(counter)"
                       [style.backgroundColor]="counter.color">
                  </div>
                  <input
                    type="range"
                    class="bar-slider"
                    [min]="counter.min"
                    [max]="counter.max"
                    [value]="counter.current"
                    [style]="'--bar-color:' + counter.color"
                    (input)="updateCounter(counter, +$any($event.target).value); $event.stopPropagation()"
                    (click)="$event.stopPropagation()" />
                </div>
                <input
                  type="number"
                  class="bar-number-input"
                  [min]="counter.min"
                  [max]="counter.max"
                  [value]="counter.current"
                  (input)="updateCounter(counter, +$any($event.target).value); $event.stopPropagation()"
                  (click)="$event.stopPropagation()" />
              </div>
            </div>
          }
        </div>
      }

      <!-- 6. Durability -->
      @if (item.hasDurability && item.maxDurability) {
        <div class="bar-row" (mousedown)="$event.stopPropagation()">
          <span class="bar-label">Haltbarkeit</span>
          <div class="bar-with-input">
            <div class="bar-track">
              <div class="bar-fill" [class]="'dur-' + durabilityClass" [style.width.%]="durabilityPercent"></div>
              <input
                type="range"
                class="bar-slider"
                [min]="0"
                [max]="item.maxDurability"
                [value]="item.durability || 0"
                (input)="updateDurability(+$any($event.target).value); $event.stopPropagation()" />
            </div>
            <input
              type="number"
              class="bar-number-input"
              [min]="0"
              [max]="item.maxDurability"
              [value]="item.durability || 0"
              (input)="updateDurability(+$any($event.target).value); $event.stopPropagation()"
              (click)="$event.stopPropagation()" />
          </div>
          @if (!item.broken && (item.durability || 0) === 0) {
            <button class="break-test-btn" (click)="requestBreakTest(); $event.stopPropagation()">
              🎲 Bruchtest
            </button>
          }
        </div>
      }

      <!-- 7. Requirements -->
      @if (item.requirements && (item.requirements.strength || item.requirements.dexterity || item.requirements.speed || item.requirements.intelligence || item.requirements.constitution || item.requirements.chill)) {
        <div class="item-requirements">
          <span class="req-label">Anforderungen:</span>
          @if (item.requirements.strength) {
            <span class="req-stat" [class.unmet]="sheet.strength.current < item.requirements.strength">STR {{ item.requirements.strength }}</span>
          }
          @if (item.requirements.dexterity) {
            <span class="req-stat" [class.unmet]="sheet.dexterity.current < item.requirements.dexterity">DEX {{ item.requirements.dexterity }}</span>
          }
          @if (item.requirements.speed) {
            <span class="req-stat" [class.unmet]="sheet.speed.current < item.requirements.speed">SPD {{ item.requirements.speed }}</span>
          }
          @if (item.requirements.intelligence) {
            <span class="req-stat" [class.unmet]="sheet.intelligence.current < item.requirements.intelligence">INT {{ item.requirements.intelligence }}</span>
          }
          @if (item.requirements.constitution) {
            <span class="req-stat" [class.unmet]="sheet.constitution.current < item.requirements.constitution">CON {{ item.requirements.constitution }}</span>
          }
          @if (item.requirements.chill) {
            <span class="req-stat" [class.unmet]="sheet.chill.current < item.requirements.chill">CHL {{ item.requirements.chill }}</span>
          }
        </div>
      }

      <!-- 8. Attached Skills/Spells -->
      @if ((item.attachedSkills && item.attachedSkills.length > 0) || (item.attachedSpells && item.attachedSpells.length > 0)) {
        <div class="attached-section">
          @if (item.attachedSkills && item.attachedSkills.length > 0) {
            <div class="attached-row">
              <span class="attached-label">Fähigkeiten:</span>
              @for (skill of item.attachedSkills; track skill.skillId) {
                <span class="attached-skill">{{ skill.skillName }}</span>
              }
            </div>
          }
          @if (item.attachedSpells && item.attachedSpells.length > 0) {
            <div class="attached-row">
              <span class="attached-label">Zauber:</span>
              @for (spell of item.attachedSpells; track spell.spellId) {
                <span class="attached-spell">{{ spell.spellName }}</span>
              }
            </div>
          }
        </div>
      }

    } <!-- end unfolded+identified -->

    @if (!isFolded && !showDetails) {
      <div class="identify-section">
        <button class="identify-btn"
                (click)="requestIdentify(); $event.stopPropagation()"
                (mousedown)="$event.stopPropagation()">
          🔍 Identifizieren
        </button>
      </div>
    }
  </div>
</div>
`;

fs.writeFileSync('C:/Users/adermake/Documents/22FailApp/frontend/src/app/sheet/item/item.component.html', html, 'utf8');
console.log('item.component.html - ' + html.split('\n').length + ' lines');
