export interface KeywordStyle {
  keywords: string[];
  className: string;
  color?: string;
}

export class KeywordEnhancer {
  private static styles: KeywordStyle[] = [
    // Damage types
    {
      keywords: ['fire', 'flame', 'burn', 'burning'],
      className: 'keyword-fire',
      color: '#ff6b35'
    },
    {
      keywords: ['ice', 'frost', 'freeze', 'frozen', 'cold'],
      className: 'keyword-ice',
      color: '#4ecdc4'
    },
    {
      keywords: ['lightning', 'thunder', 'shock', 'electric'],
      className: 'keyword-lightning',
      color: '#ffe66d'
    },
    {
      keywords: ['poison', 'venom', 'toxic'],
      className: 'keyword-poison',
      color: '#95e1d3'
    },
    {
      keywords: ['shadow', 'dark', 'darkness'],
      className: 'keyword-shadow',
      color: '#6c5ce7'
    },
    {
      keywords: ['holy', 'light', 'divine', 'blessed'],
      className: 'keyword-holy',
      color: '#ffd700'
    },
    
    // Effects
    {
      keywords: ['stun', 'stunned', 'paralyze', 'paralyzed'],
      className: 'keyword-stun',
      color: '#fdcb6e'
    },
    {
      keywords: ['heal', 'healing', 'restore', 'regenerate'],
      className: 'keyword-heal',
      color: '#00b894'
    },
    {
      keywords: ['damage', 'dmg', 'hurt'],
      className: 'keyword-damage',
      color: '#d63031'
    },
    {
      keywords: ['buff', 'enhance', 'strengthen'],
      className: 'keyword-buff',
      color: '#0984e3'
    },
    {
      keywords: ['debuff', 'weaken', 'curse'],
      className: 'keyword-debuff',
      color: '#6c5ce7'
    },
    
    // Stats
    {
      keywords: ['strength', 'str'],
      className: 'keyword-stat',
      color: '#e17055'
    },
    {
      keywords: ['dexterity', 'dex'],
      className: 'keyword-stat',
      color: '#00b894'
    },
    {
      keywords: ['intelligence', 'int'],
      className: 'keyword-stat',
      color: '#0984e3'
    },
    {
      keywords: ['constitution', 'con', 'hp', 'health'],
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
            const replacement = `<span class="${style.className}" style="color: ${style.color}; font-weight: 600;">${match[0]}</span>`;
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