import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/notification/notification.component';
import { AuthService } from './services/auth.service';
import { SummonEditorService } from './services/summon-editor.service';
import { NpcEditorComponent } from './shared/npc-editor/npc-editor.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationComponent, NpcEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  /** App-root outlet for summon (NPC) editors — see SummonEditorService (recursion-safe, no cycles). */
  protected readonly summonEditor = inject(SummonEditorService);

  constructor() {
    // Resolve the stored device identity once at startup (non-blocking; components react to
    // AuthService.loading/currentUser signals).
    void inject(AuthService).init();
  }
}
