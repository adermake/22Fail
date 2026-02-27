import { Component, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibraryStoreService } from '../../services/library-store.service';
import { Library } from '../../model/library.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-library-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()"></div>
    <div class="modal-content" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h2>📚 Manage Libraries</h2>
        <button class="close-btn" (click)="closeModal()">×</button>
      </div>

      <div class="modal-body">
        <div class="actions-bar">
          <input 
            type="text" 
            [(ngModel)]="newLibraryName" 
            placeholder="New library name..."
            (keyup.enter)="createNewLibrary()"
          />
          <button class="create-btn" (click)="createNewLibrary()" [disabled]="!newLibraryName.trim()">
            + Create Library
          </button>
        </div>

        <div class="libraries-list">
          @if (libraryStore.isLoading()) {
            <div class="loading">Loading libraries...</div>
          } @else if (allLibraries().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📚</div>
              <p>No libraries found. Create one to get started!</p>
            </div>
          } @else {
            @for (library of allLibraries(); track library.id) {
              <div class="library-card" [class.selected]="isSelected(library.id)">
                <div class="library-info">
                  <div class="library-header">
                    <h3>{{ library.name }}</h3>
                    @if (library.isPublic) {
                      <span class="public-badge">🌐 Public</span>
                    }
                  </div>
                  @if (library.description) {
                    <p class="library-description">{{ library.description }}</p>
                  }
                  <div class="library-stats">
                    <span>📦 {{ library.items.length }} items</span>
                    <span>✨ {{ library.runes.length }} runes</span>
                    <span>🔮 {{ library.spells.length }} spells</span>
                    <span>🎯 {{ library.skills.length }} skills</span>
                    <span>💫 {{ library.statusEffects.length }} effects</span>
                  </div>
                </div>
                <div class="library-actions">
                  <button 
                    class="toggle-btn" 
                    [class.active]="isSelected(library.id)"
                    (click)="toggleLibrary(library.id)">
                    {{ isSelected(library.id) ? '✓ Linked' : 'Link' }}
                  </button>
                  <button class="edit-btn" (click)="editLibrary(library.id)">
                    ✏️ Edit
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" (click)="closeModal()">Close</button>
        <button class="save-btn" (click)="save()">Save Changes</button>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      z-index: 1001;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid var(--border);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--text);
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text);
      font-size: 2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: var(--accent);
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .actions-bar {
      display: flex;
      gap: 1rem;
    }

    .actions-bar input {
      flex: 1;
      padding: 0.75rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: 0.95rem;
    }

    .create-btn {
      padding: 0.75rem 1.5rem;
      background: #22c55e;
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .create-btn:hover:not(:disabled) {
      background: #16a34a;
      transform: scale(1.05);
    }

    .create-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .libraries-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .library-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg);
      border: 2px solid var(--border);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .library-card.selected {
      border-color: #3b82f6;
      background: #3b82f610;
    }

    .library-card:hover {
      border-color: var(--accent);
    }

    .library-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .library-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .library-header h3 {
      margin: 0;
      color: var(--text);
      font-size: 1.1rem;
    }

    .public-badge {
      padding: 0.25rem 0.5rem;
      background: #10b98120;
      border: 1px solid #10b981;
      border-radius: 12px;
      color: #10b981;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .library-description {
      margin: 0;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .library-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .library-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: center;
    }

    .toggle-btn,
    .edit-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .toggle-btn {
      background: var(--bg);
      color: var(--text);
    }

    .toggle-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .toggle-btn:hover {
      transform: scale(1.05);
    }

    .edit-btn {
      background: var(--card);
      color: var(--text);
    }

    .edit-btn:hover {
      background: var(--accent);
    }

    .loading,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 2px solid var(--border);
    }

    .cancel-btn,
    .save-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-btn {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .cancel-btn:hover {
      background: var(--accent);
    }

    .save-btn {
      background: #3b82f6;
      color: white;
    }

    .save-btn:hover {
      background: #2563eb;
      transform: scale(1.05);
    }
  `]
})
export class LibrarySelectorComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() librariesChanged = new EventEmitter<string[]>();

  libraryStore = inject(LibraryStoreService);
  router = inject(Router);

  selectedLibraryIds = signal<Set<string>>(new Set());
  allLibraries = signal<Library[]>([]);
  newLibraryName = '';

  ngOnInit() {
    this.libraryStore.loadAllLibraries();
    this.libraryStore.allLibraries$.subscribe(libs => {
      this.allLibraries.set(libs);
    });
  }

  setSelectedLibraries(libraryIds: string[]) {
    this.selectedLibraryIds.set(new Set(libraryIds));
  }

  isSelected(libraryId: string): boolean {
    return this.selectedLibraryIds().has(libraryId);
  }

  toggleLibrary(libraryId: string) {
    const selected = new Set(this.selectedLibraryIds());
    if (selected.has(libraryId)) {
      selected.delete(libraryId);
    } else {
      selected.add(libraryId);
    }
    this.selectedLibraryIds.set(selected);
  }

  async createNewLibrary() {
    const name = this.newLibraryName.trim();
    if (!name) return;

    try {
      const library = await this.libraryStore.createLibrary(name);
      this.newLibraryName = '';
      
      // Automatically select the new library
      const selected = new Set(this.selectedLibraryIds());
      selected.add(library.id);
      this.selectedLibraryIds.set(selected);
    } catch (error) {
      console.error('Failed to create library:', error);
    }
  }

  editLibrary(libraryId: string) {
    // Navigate to library editor
    this.router.navigate(['/library', libraryId]);
    this.closeModal();
  }

  save() {
    const selected = Array.from(this.selectedLibraryIds());
    this.librariesChanged.emit(selected);
    this.closeModal();
  }

  closeModal() {
    this.close.emit();
  }
}
