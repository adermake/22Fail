export interface KeywordStyle {
  keywords: string[];
  className: string;
  color?: string;
}

export class KeywordEnhancer {
  private static styles: KeywordStyle[] = [
    // Resouces types
    {
      keywords: ['leben', 'trefferpunkte'],
      className: 'keyword-fire',
      color: '#a30d0dff'
    },
    {
      keywords: ['ausdauer'],
      className: 'keyword-fire',
      color: '#207934ff'
    },
    {
      keywords: ['mana'],
      className: 'keyword-fire',
      color: '#2a83beff'
    },
     {
      keywords: ['fokus'],
      className: 'keyword-fire',
      color: '#3e13b3ff'
    },
    // Stats
    {
      keywords: ['stärke', 'str'],
      className: 'keyword-stat',
      color: '#631400ff'
    },
    {
      keywords: ['geschicklichkeit', 'dex'],
      className: 'keyword-stat',
      color: '#00b894'
    },
    {
      keywords: ['intelligenz', 'int'],
      className: 'keyword-stat',
      color: '#0984e3'
    },
    {
      keywords: ['konstitution', 'con', 'hp', 'health'],
      className: 'keyword-stat',
      color: '#d63031'
    },
  ];

  /**
   * Enhance text with keyword highlighting
   * @param text The original text
   * @returns HTML string with highlighted keywords
   */
  static enhance(text: string): string {
    if (!text) return '';

    let result = text;
    const replacements: Array<{ start: number; end: number; replacement: string }> = [];

    // Find all keyword matches
    for (const style of this.styles) {
      for (const keyword of style.keywords) {
        // Case-insensitive regex with word boundaries
        const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
          const start = match.index;
          const end = start + match[0].length;
          
          // Check if this position overlaps with existing replacements
          const overlaps = replacements.some(
            r => (start >= r.start && start < r.end) || (end > r.start && end <= r.end)
          );

          if (!overlaps) {
            const replacement = `<span class="${style.className}" style="color: ${style.color}; font-weight: 700;">${match[0]}</span>`;
            replacements.push({ start, end, replacement });
          }
        }
      }
    }

    // Sort replacements by position (descending) to avoid index shifts
    replacements.sort((a, b) => b.start - a.start);

    // Apply replacements
    for (const { start, end, replacement } of replacements) {
      result = result.substring(0, start) + replacement + result.substring(end);
    }

    return result;
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Add custom keyword style
   */
  static addKeywordStyle(style: KeywordStyle) {
    this.styles.push(style);
  }

  /**
   * Get all keyword styles
   */
  static getStyles(): KeywordStyle[] {
    return this.styles;
  }
}