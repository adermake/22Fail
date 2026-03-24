import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnifiedMacroResult } from '../../services/unified-macro-executor.service';

@Component({
  selector: 'app-execution-result-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './execution-result-popup.component.html',
  styleUrl: './execution-result-popup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionResultPopupComponent {
  @Input({ required: true }) result!: UnifiedMacroResult;
  @Input() isVisible = false;
}
