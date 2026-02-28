import { Component, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
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
        <h2>📚 Library Manager</h2>
        <button class="close-btn" (click)="closeModal()">×</button>
      </div>

      <div class="modal-body">
        <!-- Search and Actions Bar -->
        <div class="toolbar">
          <input 
            type="text" 
            class="search-input"
            [(ngModel)]="searchQuery" 
            placeholder="🔍 Search libraries..."
          />
          <button class="action-btn add-all-btn" (click)="addAll()" [disabled]="availableLibraries().length === 0">
            ➕ Add All
          </button>
          <button class="action-btn create-btn" (click)="showCreateDialog = true">
            ✨ New Library
          </button>
        </div>

        <!-- Create Dialog -->
        @if (showCreateDialog) {
          <div class="create-dialog">
            <input 
              type="text" 
              [(ngModel)]="newLibraryName" 
              placeholder="Library name..."
              (keyup.enter)="createNewLibrary()"
              #newLibInput
            />
            <button class="btn-primary" (click)="createNewLibrary()" [disabled]="!newLibraryName.trim()">
              Create
            </button>
            <button class="btn-secondary" (click)="showCreateDialog = false; newLibraryName = ''">
              Cancel
            </button>
          </div>
        }

        <div class="content-wrapper">
          <!-- Linked Libraries -->
          <div class="section">
            <div class="section-header">
              <h3>✅ Linked Libraries ({{ linkedLibraries().length }})</h3>
              @if (linkedLibraries().length > 0) {
                <button class="text-btn" (click)="removeAll()">Remove All</button>
              }
            </div>
            <div class="library-list">
              @if (linkedLibraries().length === 0) {
                <div class="empty-message">No libraries linked. Add some from below!</div>
              } @else {
                @for (library of linkedLibraries(); track library.id) {
                  <div class="library-item linked">
                    <div class="library-details">
                      <div class="library-name">{{ library.name }}</div>
                      <div class="library-stats">
                        {{ library.items.length }}i · {{ library.spells.length }}s · {{ library.runes.length }}r · {{ library.skills.length }}sk
                      </div>
                    </div>
                    <div class="library-buttons">
                      <button class="icon-btn edit-btn" (click)="editLibrary(library.name)" title="Edit Library">
                        ✏️
                      </button>
                      <button class="icon-btn remove-btn" (click)="remove(library.id)" title="Unlink Library">
                        ➖
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Available Libraries -->
          <div class="section">
            <div class="section-header">
              <h3>📦 Available Libraries ({{ availableLibraries().length }})</h3>
            </div>
            <div class="library-list">
              @if (libraryStore.isLoading()) {
                <div class="loading">Loading...</div>
              } @else if (availableLibraries().length === 0) {
                <div class="empty-message">
                  @if (searchQuery) {
                    No libraries match your search.
                  } @else {
                    All libraries are linked!
                  }
                </div>
              } @else {
                @for (library of availableLibraries(); track library.id) {
                  <div class="library-item available">
                    <div class="library-details">
                      <div class="library-name">
                        {{ library.name }}
                        @if (library.isPublic) {
                          <span class="badge">🌐</span>
                        }
                      </div>
                      <div class="library-stats">
                        {{ library.items.length }}i · {{ library.spells.length }}s · {{ library.runes.length }}r · {{ library.skills.length }}sk
                      </div>
                    </div>
                    <div class="library-buttons">
                      <button class="icon-btn edit-btn" (click)="editLibrary(library.name)" title="Edit Library">
                        ✏️
                      </button>
                      <button class="icon-btn add-btn" (click)="add(library.id)" title="Link Library">
                        ➕
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" (click)="closeModal()">Close</button>
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
    }

    .modal-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 8px;
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      z-index: 1001;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text);
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 28px;
      height: 28px;
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
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toolbar {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .search-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text);
      font-size: 0.9rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .add-all-btn {
      background: #3b82f6;
      color: white;
    }

    .add-all-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .add-all-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .create-btn {
      background: #22c55e;
      color: white;
    }

    .create-btn:hover {
      background: #16a34a;
    }

    .create-dialog {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
    }

    .create-dialog input {
      flex: 1;
      padding: 0.5rem;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text);
    }

    .btn-primary {
      padding: 0.5rem 1rem;
      background: #22c55e;
      border: none;
      border-radius: 4px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #16a34a;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 0.5rem 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: var(--accent);
    }

    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
      overflow: hidden;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h3 {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text);
      font-weight: 600;
    }

    .text-btn {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .text-btn:hover {
      background: #ef444410;
    }

    .library-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
      max-height: 250px;
      padding: 0.25rem;
    }

    .library-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      transition: all 0.2s;
    }

    .library-item.linked {
      border-left: 3px solid #3b82f6;
    }

    .library-item:hover {
      border-color: var(--accent);
      background: var(--card);
    }

    .library-details {
      flex: 1;
      min-width: 0;
    }

    .library-name {
      font-weight: 600;
      color: var(--text);
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .badge {
      font-size: 0.7rem;
    }

    .library-stats {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .library-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--card);
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn:hover {
      transform: scale(1.1);
    }

    .add-btn {
      color: #22c55e;
      border-color: #22c55e;
    }

    .add-btn:hover {
      background: #22c55e20;
    }

    .remove-btn {
      color: #ef4444;
      border-color: #ef4444;
    }

    .remove-btn:hover {
      background: #ef444420;
    }

    .edit-btn {
      color: #f59e0b;
      border-color: #f59e0b;
    }

    .edit-btn:hover {
      background: #f59e0b20;
    }

    .empty-message,
    .loading {
      padding: 2rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
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
  searchQuery = '';
  showCreateDialog = false;
  newLibraryName = '';

  // Filter libraries based on search and linked status
  linkedLibraries = computed(() => {
    const all = this.allLibraries();
    const selected = this.selectedLibraryIds();
    const query = this.searchQuery.toLowerCase();
    
    return all
      .filter(lib => selected.has(lib.id))
      .filter(lib => !query || lib.name.toLowerCase().includes(query));
  });

  availableLibraries = computed(() => {
    const all = this.allLibraries();
    const selected = this.selectedLibraryIds();
    const query = this.searchQuery.toLowerCase();
    
    return all
      .filter(lib => !selected.has(lib.id))
      .filter(lib => !query || lib.name.toLowerCase().includes(query));
  });

  ngOnInit() {
    this.libraryStore.loadAllLibraries();
    this.libraryStore.allLibraries$.subscribe(libs => {
      this.allLibraries.set(libs);
    });
  }

  setSelectedLibraries(libraryIds: string[]) {
    this.selectedLibraryIds.set(new Set(libraryIds));
  }

  add(libraryId: string) {
    const selected = new Set(this.selectedLibraryIds());
    selected.add(libraryId);
    this.selectedLibraryIds.set(selected);
    this.emitChanges();
  }

  remove(libraryId: string) {
    const selected = new Set(this.selectedLibraryIds());
    selected.delete(libraryId);
    this.selectedLibraryIds.set(selected);
    this.emitChanges();
  }

  addAll() {
    const selected = new Set(this.selectedLibraryIds());
    this.availableLibraries().forEach(lib => selected.add(lib.id));
    this.selectedLibraryIds.set(selected);
    this.emitChanges();
  }

  removeAll() {
    this.selectedLibraryIds.set(new Set());
    this.emitChanges();
  }

  async createNewLibrary() {
    const name = this.newLibraryName.trim();
    if (!name) return;

    try {
      const library = await this.libraryStore.createLibrary(name);
      this.newLibraryName = '';
      this.showCreateDialog = false;
      
      // Automatically link the new library
      const selected = new Set(this.selectedLibraryIds());
      selected.add(library.id);
      this.selectedLibraryIds.set(selected);
      this.emitChanges();
    } catch (error) {
      console.error('Failed to create library:', error);
    }
  }

  editLibrary(libraryName: string) {
    this.router.navigate(['/library', libraryName]);
    this.closeModal();
  }

  emitChanges() {
    const selected = Array.from(this.selectedLibraryIds());
    this.librariesChanged.emit(selected);
  }

  closeModal() {
    this.close.emit();
  }
}
