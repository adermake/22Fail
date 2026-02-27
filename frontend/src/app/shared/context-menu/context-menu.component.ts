import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: string;
  divider?: boolean;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div class="context-menu-overlay" (click)="close()"></div>
      <div class="context-menu"
           [style.left.px]="position().x"
           [style.top.px]="position().y">
        @for (item of items(); track item.action) {
          @if (item.divider) {
            <div class="menu-divider"></div>
          } @else {
            <button class="menu-item" (click)="onItemClick(item.action)">
              @if (item.icon) {
                <span class="menu-icon">{{ item.icon }}</span>
              }
              <span class="menu-label">{{ item.label }}</span>
            </button>
          }
        }
      </div>
    }
  `,
  styles: [`
    .context-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9998;
    }

    .context-menu {
      position: fixed;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      padding: 0.5rem 0;
      min-width: 200px;
      z-index: 9999;
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      color: var(--text);
      font-size: 0.95rem;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s;
    }

    .menu-item:hover {
      background: var(--accent);
    }

    .menu-icon {
      font-size: 1.2rem;
      line-height: 1;
    }

    .menu-label {
      flex: 1;
    }

    .menu-divider {
      height: 1px;
      background: var(--border);
      margin: 0.5rem 0;
    }
  `]
})
export class ContextMenuComponent {
  isVisible = signal(false);
  position = signal<ContextMenuPosition>({ x: 0, y: 0 });
  items = signal<ContextMenuItem[]>([]);
  
  @Output() itemSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  show(x: number, y: number, menuItems: ContextMenuItem[]) {
    // Adjust position to keep menu on screen
    const menuWidth = 200;
    const menuHeight = menuItems.length * 44; // Approximate height
    
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    this.position.set({ x, y });
    this.items.set(menuItems);
    this.isVisible.set(true);
  }

  close() {
    this.isVisible.set(false);
    this.closed.emit();
  }

  onItemClick(action: string) {
    this.itemSelected.emit(action);
    this.close();
  }
}
