export interface KeywordStyle {
  keywords: string[];
  className: string;
  color?: string;
}

export class KeywordEnhancer {
  private static styles: KeywordStyle[] = [
    // Resouces types
     {
      keywords: ['kosten', 'bedingung' ,'bedingungen','voraussetzung','voraussetzungen','effektivität',"effekt"],
      className: 'keyword-bold',
      color: '#A9A9A9' // DarkGray - neutral but visible
    },
    {
      keywords: ['leben', 'trefferpunkte'],
      className: 'keyword-life',
      color: '#FF6B6B' // Bright Red
    },
    {
      keywords: ['ausdauer'],
      className: 'keyword-energy',
      color: '#4ECDC4' // Teal
    },
    {
      keywords: ['mana'],
      className: 'keyword-mana',
      color: '#45A1FF' // Bright Blue
    },
     {
      keywords: ['fokus'],
      className: 'keyword-fokus',
      color: '#9D6BFF' // Vibrant Purple
    },
    // Stats
    {
      keywords: ['stärke', 'str'],
      className: 'keyword-stat',
      color: '#FF9F6B' // Orange
    },
    {
      keywords: ['geschicklichkeit', 'dex'],
      className: 'keyword-stat',
      color: '#26D0B3' // Bright Teal
    },
    {
      keywords: ['intelligenz', 'int'],
      className: 'keyword-stat',
      color: '#54A0FF' // Bright Blue
    },
    {
      keywords: ['konstitution', 'con', 'hp', 'health'],
      className: 'keyword-stat',
      color: '#FF7675' // Soft Red
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