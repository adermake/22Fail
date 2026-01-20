import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';

@Component({
  selector: 'app-backstory',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './backstory.component.html',
  styleUrl: './backstory.component.css',
})
export class BackstoryComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  isEditing = false;

  constructor(private sanitizer: DomSanitizer) {}

  get renderedBackstory(): SafeHtml {
    const text = this.sheet.backstory || '';
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('<p class="placeholder">No backstory yet. Click Edit to add your character\'s background.</p>');

    // Simple markdown-like rendering
    const html = this.parseSimpleMarkdown(text);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private parseSimpleMarkdown(text: string): string {
    // Escape HTML first
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Parse headers (# Title, ## Subtitle, ### Subheader)
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');

    // Parse bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Parse italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Parse horizontal rules (---)
    html = html.replace(/^---$/gm, '<hr>');

    // Parse line breaks - convert double newlines to paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs
      .map(p => {
        // Don't wrap headers or hr in p tags
        if (p.startsWith('<h') || p.startsWith('<hr')) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return html;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  updateBackstory(value: string) {
    this.patch.emit({ path: 'backstory', value });
  }
}
