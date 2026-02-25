import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div class="notification" [class]="'notification-' + notification.type">
          <span class="notification-icon">
            @if (notification.type === 'success') { ✓ }
            @if (notification.type === 'error') { ✕ }
            @if (notification.type === 'warning') { ⚠ }
            @if (notification.type === 'info') { ℹ }
          </span>
          <span class="notification-message">{{ notification.message }}</span>
          <button class="notification-close" (click)="notificationService.remove(notification.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      max-width: 500px;
      pointer-events: all;
      animation: slideIn 0.3s ease-out;
      backdrop-filter: blur(8px);
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
      border: 1px solid #22c55e;
      color: white;
    }

    .notification-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
      border: 1px solid #ef4444;
      color: white;
    }

    .notification-warning {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.95));
      border: 1px solid #fbbf24;
      color: #1a1a1a;
    }

    .notification-info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
      border: 1px solid #3b82f6;
      color: white;
    }

    .notification-icon {
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
    }

    .notification-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      font-weight: 500;
    }

    .notification-close {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .notification-close:hover {
      opacity: 1;
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
