import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../../model/character-sheet-model';
import { StatusBlock } from '../../../model/status-block.model';
import { ActionExecution } from '../action-macros.component';

@Component({
  selector: 'app-resource-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-panel.component.html',
  styleUrls: ['./resource-panel.component.css']
})
export class ResourcePanelComponent {
  @Input() sheet!: CharacterSheet;
  @Input() actionHistory: ActionExecution[] = [];

  getResourceIcon(formulaType: string): string {
    switch (formulaType) {
      case 'LIFE': return '❤️';
      case 'ENERGY': return '⚡';
      case 'MANA': return '✨';
      default: return '📊';
    }
  }

  getResourcePercent(status: StatusBlock): number {
    const max = this.getStatusMax(status);
    return max > 0 ? (status.statusCurrent / max) * 100 : 0;
  }

  getStatusMax(status: StatusBlock): number {
    return status.statusBase + status.statusBonus;
  }
}
