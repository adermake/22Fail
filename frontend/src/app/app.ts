import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/notification/notification.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  constructor() {
    // Resolve the stored device identity once at startup (non-blocking; components react to
    // AuthService.loading/currentUser signals).
    void inject(AuthService).init();
  }
}
