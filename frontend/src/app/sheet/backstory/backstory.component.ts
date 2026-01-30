import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;

  isEditing = false;

  constructor(private sanitizer: DomSanitizer) {}

  get renderedBackstory(): SafeHtml {
    const text = this.sheet.backstory || '';
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('<p class="placeholder">Start typing to see your formatted text here...</p>');

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
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Parse horizontal rules (---)
    html = html.replace(/^---$/gm, '<hr>');

    // Parse bold (**text** or __text__) - more greedy to handle multiline
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Parse italic (*text* or _text_)
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Parse line breaks - convert double newlines to paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs
      .map(p => {
        // Don't wrap headers or hr in p tags
        if (p.match(/^<h[1-3]>/) || p.startsWith('<hr>')) return p;
        // Wrap in paragraph and preserve single line breaks
        const content = p.trim();
        if (!content) return '';
        return `<p>${content.replace(/\n/g, '<br>')}</p>`;
      })
      .filter(p => p)
      .join('\n');

    return html;
  }

  updateBackstory(value: string) {
    this.patch.emit({ path: 'backstory', value });
  }

  insertMarkdown(prefix: string, suffix: string) {
    if (!this.textArea) return;
    
    const textarea = this.textArea.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.sheet.backstory || '';
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    this.updateBackstory(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }
}
