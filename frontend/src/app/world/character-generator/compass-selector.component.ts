import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compass-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="compass-container">
      <svg #compassSvg width="200" height="200" viewBox="0 0 200 200">
        <!-- Compass circle background -->
        <circle cx="100" cy="100" r="90" fill="#1a1a1a" stroke="#444" stroke-width="2"/>
        
        <!-- Direction markers -->
        <g class="direction-markers">
          <!-- North -->
          <line x1="100" y1="15" x2="100" y2="30" stroke="#666" stroke-width="2"/>
          <text x="100" y="12" text-anchor="middle" fill="#888" font-size="12">N</text>
          
          <!-- East -->
          <line x1="185" y1="100" x2="170" y2="100" stroke="#666" stroke-width="2"/>
          <text x="192" y="105" text-anchor="middle" fill="#888" font-size="12">E</text>
          
          <!-- South -->
          <line x1="100" y1="185" x2="100" y2="170" stroke="#666" stroke-width="2"/>
          <text x="100" y="195" text-anchor="middle" fill="#888" font-size="12">S</text>
          
          <!-- West -->
          <line x1="15" y1="100" x2="30" y2="100" stroke="#666" stroke-width="2"/>
          <text x="8" y="105" text-anchor="middle" fill="#888" font-size="12">W</text>
        </g>
        
        <!-- Draggable arrow -->
        <g #arrow class="arrow" [attr.transform]="'rotate(' + angle + ' 100 100)'" style="cursor: grab;">
          <!-- Arrow shaft -->
          <line x1="100" y1="100" x2="100" y2="35" stroke="#4CAF50" stroke-width="3" stroke-linecap="round"/>
          
          <!-- Arrow head -->
          <polygon points="100,25 95,35 105,35" fill="#4CAF50"/>
          
          <!-- Arrow tail circle -->
          <circle cx="100" cy="100" r="8" fill="#4CAF50" stroke="#2d6e2f" stroke-width="2"/>
        </g>
      </svg>
      <div class="angle-display">{{ Math.round(angle) }}°</div>
    </div>
  `,
  styles: [`
    .compass-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    svg {
      border-radius: 50%;
      background: #0f0f0f;
    }

    .arrow {
      transition: transform 0.05s ease-out;
    }

    .arrow:active {
      cursor: grabbing;
    }

    .angle-display {
      font-size: 14px;
      font-weight: 600;
      color: #4CAF50;
      background: #1a1a1a;
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid #333;
    }
  `]
})
export class CompassSelectorComponent implements AfterViewInit {
  @Input() angle: number = 90; // Default to North
  @Output() angleChange = new EventEmitter<number>();

  @ViewChild('compassSvg') compassSvg!: ElementRef<SVGElement>;
  @ViewChild('arrow') arrow!: ElementRef<SVGElement>;

  private isDragging = false;
  Math = Math;

  ngAfterViewInit() {
    const svg = this.compassSvg.nativeElement;
    const arrowEl = this.arrow.nativeElement;

    arrowEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = true;
      arrowEl.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.updateAngleFromMouse(e.clientX, e.clientY);
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        arrowEl.style.cursor = 'grab';
      }
    });

    // Touch support
    arrowEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isDragging = true;
    });

    document.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        this.updateAngleFromMouse(touch.clientX, touch.clientY);
      }
    });

    document.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  private updateAngleFromMouse(clientX: number, clientY: number) {
    const svg = this.compassSvg.nativeElement;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Calculate angle in degrees (0° = East, 90° = North)
    let newAngle = Math.atan2(-deltaY, deltaX) * (180 / Math.PI) + 90;
    
    // Normalize to 0-360
    if (newAngle < 0) newAngle += 360;
    if (newAngle >= 360) newAngle -= 360;

    this.angle = newAngle;
    this.angleChange.emit(this.angle);
  }
}
