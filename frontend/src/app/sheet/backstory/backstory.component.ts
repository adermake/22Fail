import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';

@Component({
  selector: 'app-backstory',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './backstory.component.html',
  styleUrl: './backstory.component.css',
})
export class BackstoryComponent implements AfterViewInit {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @ViewChild('editor') editorElement!: ElementRef<HTMLDivElement>;

  private isInitialized = false;

  ngAfterViewInit() {
    if (this.editorElement) {
      const content = this.sheet.backstory || '<p><br></p>';
      this.editorElement.nativeElement.innerHTML = content;
      this.isInitialized = true;
    }
  }

  formatText(command: string) {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;

    editor.focus();
    
    if (command === 'bold') {
      document.execCommand('bold', false);
    } else if (command === 'italic') {
      document.execCommand('italic', false);
    } else if (command === 'h1' || command === 'h2' || command === 'h3' || command === 'p') {
      document.execCommand('formatBlock', false, command);
    }
  }

  setTextColor(color: string) {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;

    editor.focus();
    
    let colorValue: string;
    if (color === 'white') {
      colorValue = '#ffffff';
    } else if (color === 'purple') {
      // Get computed accent color from CSS variable
      colorValue = getComputedStyle(editor).getPropertyValue('--accent').trim() || '#a259ff';
    } else if (color === 'gray') {
      // Get computed text-muted color from CSS variable
      colorValue = getComputedStyle(editor).getPropertyValue('--text-muted').trim() || '#999999';
    } else {
      return;
    }
    
    document.execCommand('foreColor', false, colorValue);
  }

  insertHR() {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;
    
    editor.focus();
    const grayColor = getComputedStyle(editor).getPropertyValue('--text-muted').trim() || '#999999';
    document.execCommand('insertHTML', false, `<hr style="border: none; border-top: 2px solid ${grayColor}; margin: 1.5rem 0;">`);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
  }

  onContentChange() {
    if (!this.isInitialized) return;
    this.saveContent();
  }

  onBlur() {
    if (!this.isInitialized) return;
    this.saveContent();
  }

  private saveContent() {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;
    
    let content = editor.innerHTML;
    // Clean up empty paragraphs
    if (content === '<p><br></p>' || content === '<br>' || content === '') {
      content = '';
    }
    
    this.patch.emit({ path: 'backstory', value: content });
  }
}
