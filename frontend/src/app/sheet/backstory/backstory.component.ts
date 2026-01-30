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
    
    // For block formatting (headings and paragraphs), handle specially
    if (command === 'h1' || command === 'h2' || command === 'h3' || command === 'p') {
      this.setBlockFormat(command);
    } else if (command === 'bold') {
      document.execCommand('bold', false);
    } else if (command === 'italic') {
      document.execCommand('italic', false);
    }
    
    // Clean up after formatting
    this.cleanupFormatting();
  }

  private setBlockFormat(tag: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Get the block element containing the selection
    let node = selection.anchorNode;
    if (!node) return;
    
    // Find the closest block element
    let blockElement: HTMLElement | null = null;
    if (node.nodeType === Node.TEXT_NODE) {
      blockElement = (node.parentElement as HTMLElement);
    } else {
      blockElement = node as HTMLElement;
    }

    // Find the actual block element (p, h1, h2, h3)
    while (blockElement && !['P', 'H1', 'H2', 'H3', 'DIV'].includes(blockElement.tagName)) {
      blockElement = blockElement.parentElement;
    }

    if (!blockElement || !this.editorElement.nativeElement.contains(blockElement)) return;

    // Create new element with the desired tag
    const newElement = document.createElement(tag);
    newElement.innerHTML = blockElement.innerHTML;
    
    // Copy only text content without styles
    const textContent = blockElement.textContent || '';
    newElement.textContent = textContent;
    
    // Replace the old element
    blockElement.parentNode?.replaceChild(newElement, blockElement);
    
    // Restore cursor position
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(newElement);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  setTextColor(color: string) {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let colorValue: string;
    if (color === 'white') {
      colorValue = '#ffffff';
    } else if (color === 'purple') {
      colorValue = getComputedStyle(editor).getPropertyValue('--accent').trim() || '#a259ff';
    } else if (color === 'gray') {
      colorValue = getComputedStyle(editor).getPropertyValue('--text-muted').trim() || '#999999';
    } else {
      return;
    }

    // Apply color to selection
    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // Don't apply if nothing selected
    
    const span = document.createElement('span');
    span.style.color = colorValue;
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // If surroundContents fails, use execCommand
      document.execCommand('foreColor', false, colorValue);
    }
    
    this.cleanupFormatting();
  }

  insertHR() {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;
    
    editor.focus();
    const grayColor = getComputedStyle(editor).getPropertyValue('--text-muted').trim() || '#999999';
    document.execCommand('insertHTML', false, `<hr style="border: none; border-top: 2px solid ${grayColor}; margin: 1.5rem 0;"><p><br></p>`);
    this.cleanupFormatting();
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

  private cleanupFormatting() {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;

    // Remove empty spans
    const emptySpans = editor.querySelectorAll('span:empty');
    emptySpans.forEach(span => span.remove());

    // Remove spans with no styling
    const spans = editor.querySelectorAll('span');
    spans.forEach(span => {
      if (!span.hasAttribute('style') || !span.style.cssText) {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent?.insertBefore(span.firstChild, span);
        }
        span.remove();
      }
    });

    // Ensure every text node is wrapped in a block element
    const childNodes = Array.from(editor.childNodes);
    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        const p = document.createElement('p');
        p.textContent = node.textContent;
        node.parentNode?.replaceChild(p, node);
      }
    });
  }

  private saveContent() {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;
    
    this.cleanupFormatting();
    
    let content = editor.innerHTML;
    // Clean up empty paragraphs at start
    if (content === '<p><br></p>' || content === '<br>' || content === '') {
      content = '';
    }
    
    this.patch.emit({ path: 'backstory', value: content });
  }
}
