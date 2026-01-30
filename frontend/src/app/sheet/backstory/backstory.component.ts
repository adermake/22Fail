import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    if (this.editorElement && !this.sheet.backstory) {
      this.editorElement.nativeElement.innerHTML = '<p><br></p>';
    }
  }

  get safeContent(): SafeHtml {
    const content = this.sheet.backstory || '<p><br></p>';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  formatText(command: string) {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    
    if (command === 'bold') {
      document.execCommand('bold', false);
    } else if (command === 'italic') {
      document.execCommand('italic', false);
    } else if (command === 'h1' || command === 'h2' || command === 'h3' || command === 'p') {
      document.execCommand('formatBlock', false, command);
    }
    
    this.saveContent();
  }

  insertHR() {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;
    
    editor.focus();
    document.execCommand('insertHTML', false, '<hr>');
    this.saveContent();
  }

  onContentChange(event: Event) {
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
