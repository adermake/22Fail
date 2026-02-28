import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MacroAction, MacroActionType, MacroActionParameters } from '../../model/macro-action.model';

@Component({
  selector: 'app-macro-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="macro-editor">
      <div class="form-group">
        <label>Name</label>
        <input type="text" [(ngModel)]="editMacro.name" placeholder="Makro-Name">
      </div>
      
      <div class="form-group">
        <label>Beschreibung</label>
        <textarea [(ngModel)]="editMacro.description" rows="2" placeholder="Beschreibung..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Aktion</label>
        <select [(ngModel)]="editMacro.actionType" (change)="onActionTypeChange()">
          <option value="custom_message">Nachricht anzeigen</option>
          <option value="dice_roll">Würfeln</option>
          <option value="apply_damage">Schaden zufügen</option>
          <option value="apply_healing">Heilen</option>
          <option value="modify_resource">Ressource ändern</option>
          <option value="modify_stat">Stat ändern</option>
        </select>
      </div>
      
      <!-- Action-specific parameters -->
      @switch (editMacro.actionType) {
        @case ('custom_message') {
          <div class="form-group">
            <label>Nachricht</label>
            <textarea [(ngModel)]="editMacro.parameters.message" rows="3" placeholder="Nachricht..."></textarea>
          </div>
          <div class="form-group">
            <label>Farbe</label>
            <input type="color" [(ngModel)]="editMacro.parameters.messageColor" value="#ffffff">
          </div>
        }
        
        @case ('dice_roll') {
          <div class="form-group">
            <label>Würfelformel</label>
            <input type="text" [(ngModel)]="editMacro.parameters.diceFormula" placeholder="z.B. 2d6+3">
          </div>
          <div class="form-group">
            <label>Würfelname</label>
            <input type="text" [(ngModel)]="editMacro.parameters.rollName" placeholder="z.B. Angriff">
          </div>
          <div class="form-group">
            <label>Farbe</label>
            <input type="color" [(ngModel)]="editMacro.parameters.rollColor" value="#4caf50">
          </div>
        }
        
        @case ('apply_damage') {
          <div class="form-group">
            <label>Schadensformel</label>
            <input type="text" [(ngModel)]="editMacro.parameters.diceAmount" placeholder="z.B. 1d8+5">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Oder fester Wert</label>
              <input type="number" [(ngModel)]="editMacro.parameters.amount">
            </div>
          </div>
        }
        
        @case ('apply_healing') {
          <div class="form-group">
            <label>Heilungsformel</label>
            <input type="text" [(ngModel)]="editMacro.parameters.diceAmount" placeholder="z.B. 2d8+3">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Oder fester Wert</label>
              <input type="number" [(ngModel)]="editMacro.parameters.amount">
            </div>
          </div>
        }
        
        @case ('modify_resource') {
          <div class="form-group">
            <label>Ressource</label>
            <select [(ngModel)]="editMacro.parameters.resource">
              <option value="health">Leben</option>
              <option value="mana">Mana</option>
              <option value="energy">Energie</option>
              <option value="fokus">Fokus</option>
            </select>
          </div>
          <div class="form-group">
            <label>Menge (negativ = abziehen)</label>
            <input type="number" [(ngModel)]="editMacro.parameters.resourceAmount">
          </div>
        }
        
        @case ('modify_stat') {
          <div class="form-group">
            <label>Stat</label>
            <select [(ngModel)]="editMacro.parameters.stat">
              <option value="strength">Stärke</option>
              <option value="dexterity">Geschick</option>
              <option value="speed">Tempo</option>
              <option value="intelligence">Intelligenz</option>
              <option value="constitution">Konstitution</option>
              <option value="chill">Chill</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Modifikator</label>
              <input type="number" [(ngModel)]="editMacro.parameters.statModifier">
            </div>
            <div class="form-group">
              <label>Dauer (Runden)</label>
              <input type="number" [(ngModel)]="editMacro.parameters.duration" min="1">
            </div>
          </div>
        }
      }
      
      <div class="form-group">
        <label>Icon</label>
        <input type="text" [(ngModel)]="editMacro.icon" placeholder="z.B. ⚡">
      </div>
      
      <div class="form-group">
        <label>Farbe</label>
        <input type="color" [(ngModel)]="editMacro.color" [value]="editMacro.color || '#4caf50'">
      </div>
      
      <div class="editor-actions">
        <button class="cancel-btn" (click)="cancel.emit()">Abbrechen</button>
        <button class="save-btn" (click)="onSave()">Speichern</button>
      </div>
    </div>
  `,
  styles: [`
    .macro-editor {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-group label {
      font-weight: 600;
      color: var(--muted);
      font-size: 0.85rem;
      text-transform: uppercase;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.5rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text);
      font-size: 0.9rem;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
    }
    
    .form-row .form-group {
      flex: 1;
    }
    
    .editor-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    
    .save-btn {
      padding: 0.5rem 1rem;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .save-btn:hover {
      background: var(--accent-dark);
    }
    
    .cancel-btn {
      padding: 0.5rem 1rem;
      background: transparent;
      color: var(--muted);
      border: 1px solid var(--border);
      border-radius: 4px;
      cursor: pointer;
    }
    
    .cancel-btn:hover {
      border-color: var(--text);
      color: var(--text);
    }
    
    input[type="color"] {
      height: 2rem;
      padding: 2px;
      cursor: pointer;
    }
  `]
})
export class MacroEditorComponent {
  @Input({ required: true }) macro!: MacroAction;
  @Output() save = new EventEmitter<MacroAction>();
  @Output() cancel = new EventEmitter<void>();
  
  editMacro!: MacroAction;
  
  ngOnInit() {
    // Create a deep copy for editing
    this.editMacro = JSON.parse(JSON.stringify(this.macro));
    
    // Ensure parameters object exists
    if (!this.editMacro.parameters) {
      this.editMacro.parameters = {};
    }
  }
  
  onActionTypeChange() {
    // Reset parameters when action type changes
    this.editMacro.parameters = {};
    
    // Set default values based on action type
    switch (this.editMacro.actionType) {
      case 'custom_message':
        this.editMacro.parameters.message = 'Makro ausgelöst!';
        break;
      case 'dice_roll':
        this.editMacro.parameters.diceFormula = '1d20';
        break;
      case 'modify_resource':
        this.editMacro.parameters.resource = 'health';
        this.editMacro.parameters.resourceAmount = 0;
        break;
      case 'modify_stat':
        this.editMacro.parameters.stat = 'strength';
        this.editMacro.parameters.statModifier = 0;
        this.editMacro.parameters.duration = 1;
        break;
    }
  }
  
  onSave() {
    this.editMacro.modifiedAt = Date.now();
    this.save.emit(this.editMacro);
  }
}
