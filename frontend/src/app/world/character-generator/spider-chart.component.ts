import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatDistribution {
  strength: number;
  dexterity: number;
  speed: number;
  intelligence: number;
  chill: number;
  constitution: number;
}

interface StatPoint {
  name: string;
  key: keyof StatDistribution;
  angle: number;
  label: string;
}

@Component({
  selector: 'app-spider-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spider-chart-container">
      <svg #chartSvg width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <radialGradient id="chartGradient" cx="50%" cy="50%">
            <stop offset="0%" style="stop-color:#2a2a2a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <circle cx="200" cy="200" r="190" fill="url(#chartGradient)" stroke="#333" stroke-width="2"/>
        
        <!-- Concentric circles (guides) -->
        <circle cx="200" cy="200" r="38" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        <circle cx="200" cy="200" r="76" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        <circle cx="200" cy="200" r="114" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        <circle cx="200" cy="200" r="152" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        
        <!-- Axis lines -->
        <g class="axes">
          @for (stat of stats; track stat.key) {
            <line 
              [attr.x1]="200" 
              [attr.y1]="200"
              [attr.x2]="getAxisX(stat.angle, 152)"
              [attr.y2]="getAxisY(stat.angle, 152)"
              stroke="#444" 
              stroke-width="1"
            />
          }
        </g>
        
        <!-- Data polygon -->
        <polygon 
          [attr.points]="getPolygonPoints()"
          [attr.fill]="'rgba(76, 175, 80, 0.2)'"
          [attr.stroke]="'#4CAF50'"
          stroke-width="2"
        />
        
        <!-- Draggable points -->
        <g class="data-points">
          @for (stat of stats; track stat.key) {
            <g>
              <!-- Point circle -->
              <circle
                [attr.cx]="getPointX(stat)"
                [attr.cy]="getPointY(stat)"
                r="8"
                [attr.fill]="draggedStat === stat.key ? '#66BB6A' : '#4CAF50'"
                stroke="#2d6e2f"
                stroke-width="2"
                style="cursor: grab;"
                (mousedown)="startDrag($event, stat.key)"
                (touchstart)="startDragTouch($event, stat.key)"
              />
              
              <!-- Label -->
              <text
                [attr.x]="getLabelX(stat.angle)"
                [attr.y]="getLabelY(stat.angle)"
                text-anchor="middle"
                [attr.dy]="getLabelDy(stat.angle)"
                fill="#aaa"
                font-size="14"
                font-weight="600"
                pointer-events="none"
              >
                {{ stat.label }}
              </text>
              
              <!-- Value label -->
              <text
                [attr.x]="getValueLabelX(stat)"
                [attr.y]="getValueLabelY(stat)"
                text-anchor="middle"
                dy="4"
                fill="#4CAF50"
                font-size="12"
                font-weight="700"
                pointer-events="none"
              >
                {{ getStatValue(stat.key) }}
              </text>
            </g>
          }
        </g>
        
        <!-- Center dot -->
        <circle cx="200" cy="200" r="4" fill="#666"/>
      </svg>
      
      <div class="stat-summary">
        <div class="stat-info">Total Points: <span class="highlight">{{ totalPoints }} / {{ maxPoints }}</span></div>
      </div>
    </div>
  `,
  styles: [`
    .spider-chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    svg {
      border-radius: 8px;
      background: #0f0f0f;
    }

    .data-points circle:hover {
      r: 10;
      filter: brightness(1.2);
    }

    .data-points circle:active {
      cursor: grabbing;
    }

    .stat-summary {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #888;
    }

    .stat-info {
      background: #1a1a1a;
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid #333;
    }

    .highlight {
      color: #4CAF50;
      font-weight: 600;
    }
  `]
})
export class SpiderChartComponent implements AfterViewInit {
  @Input() distribution: StatDistribution = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    chill: 0,
    constitution: 0
  };
  
  @Input() maxPoints: number = 10;
  @Output() distributionChange = new EventEmitter<StatDistribution>();

  @ViewChild('chartSvg') chartSvg!: ElementRef<SVGElement>;

  draggedStat: keyof StatDistribution | null = null;
  private maxRadius = 152; // Max distance from center
  
  stats: StatPoint[] = [
    { name: 'Strength', key: 'strength', angle: 90, label: 'STR' },
    { name: 'Dexterity', key: 'dexterity', angle: 30, label: 'DEX' },
    { name: 'Speed', key: 'speed', angle: -30, label: 'SPD' },
    { name: 'Intelligence', key: 'intelligence', angle: -90, label: 'INT' },
    { name: 'Chill', key: 'chill', angle: -150, label: 'CHL' },
    { name: 'Constitution', key: 'constitution', angle: 150, label: 'CON' }
  ];

  ngAfterViewInit() {
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchmove', (e) => this.onDragTouch(e));
    document.addEventListener('touchend', () => this.endDrag());
  }

  startDrag(event: MouseEvent, statKey: keyof StatDistribution) {
    event.preventDefault();
    this.draggedStat = statKey;
  }

  startDragTouch(event: TouchEvent, statKey: keyof StatDistribution) {
    event.preventDefault();
    this.draggedStat = statKey;
  }

  onDrag(event: MouseEvent) {
    if (!this.draggedStat) return;
    this.updateStatFromMouse(event.clientX, event.clientY);
  }

  onDragTouch(event: TouchEvent) {
    if (!this.draggedStat || event.touches.length === 0) return;
    const touch = event.touches[0];
    this.updateStatFromMouse(touch.clientX, touch.clientY);
  }

  endDrag() {
    this.draggedStat = null;
  }

  private updateStatFromMouse(clientX: number, clientY: number) {
    if (!this.draggedStat) return;

    const svg = this.chartSvg.nativeElement;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalize to 0-maxPoints scale (maxRadius = maxPoints in distance)
    const normalizedDistance = Math.min(distance / rect.width * 2 * this.maxRadius, this.maxRadius);
    const value = Math.round((normalizedDistance / this.maxRadius) * this.maxPoints);
    
    // Update the stat value
    this.distribution[this.draggedStat] = Math.max(0, Math.min(this.maxPoints, value));
    this.distributionChange.emit({ ...this.distribution });
  }

  get totalPoints(): number {
    return Object.values(this.distribution).reduce((sum, val) => sum + val, 0);
  }

  getStatValue(key: keyof StatDistribution): number {
    return this.distribution[key];
  }

  // Get point position based on value
  getPointX(stat: StatPoint): number {
    const value = this.distribution[stat.key];
    const radius = (value / this.maxPoints) * this.maxRadius;
    return this.getAxisX(stat.angle, radius);
  }

  getPointY(stat: StatPoint): number {
    const value = this.distribution[stat.key];
    const radius = (value / this.maxPoints) * this.maxRadius;
    return this.getAxisY(stat.angle, radius);
  }

  // Get axis end point
  getAxisX(angle: number, radius: number): number {
    return 200 + radius * Math.sin(angle * Math.PI / 180);
  }

  getAxisY(angle: number, radius: number): number {
    return 200 - radius * Math.cos(angle * Math.PI / 180);
  }

  // Get label position (outside the chart)
  getLabelX(angle: number): number {
    return this.getAxisX(angle, 175);
  }

  getLabelY(angle: number): number {
    return this.getAxisY(angle, 175);
  }

  getLabelDy(angle: number): string {
    // Adjust vertical alignment based on angle
    if (angle > -30 && angle < 30) return '0.3em';
    if (angle > 150 || angle < -150) return '0.3em';
    return '0.3em';
  }

  // Get value label position (next to point)
  getValueLabelX(stat: StatPoint): number {
    const value = this.distribution[stat.key];
    const radius = (value / this.maxPoints) * this.maxRadius;
    return this.getAxisX(stat.angle, radius * 0.7); // 70% toward center for label
  }

  getValueLabelY(stat: StatPoint): number {
    const value = this.distribution[stat.key];
    const radius = (value / this.maxPoints) * this.maxRadius;
    return this.getAxisY(stat.angle, radius * 0.7);
  }

  // Get polygon points for the data shape
  getPolygonPoints(): string {
    return this.stats.map(stat => {
      const x = this.getPointX(stat);
      const y = this.getPointY(stat);
      return `${x},${y}`;
    }).join(' ');
  }
}
