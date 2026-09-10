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
   * Values the owning spell/item can lend to its own description.
   *
   * `E:X` means "my Effektivität" — written once, it follows the value instead of going stale the
   * way a typed `E:5` does the moment the spell is rebalanced.
   */
  static enhance(
    text: string,
    ctx?: { effectivity?: number; stability?: number; range?: number },
  ): string {
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

    /*
     * Inline shorthand. `E:5` is a literal; `E:X` resolves to the owner's own value, so a
     * description written once keeps up with the number rather than repeating a stale copy of it.
     * With no value to resolve — a complex spell, or an item with none — the placeholder renders
     * as `?` rather than silently reading as zero.
     */
    const resolved = (v: number | undefined): string =>
      v === undefined || v === null ? '?' : String(v);

    result = result
      .replace(/\bE:X\b/gi, `<span class="inline-eff">⚔ ${resolved(ctx?.effectivity)}</span>`)
      .replace(/\bS:X\b/gi, `<span class="inline-stab">🛡 ${resolved(ctx?.stability)}</span>`)
      .replace(/\bR:X\b/gi, `<span class="inline-range">↔ ${resolved(ctx?.range)}m</span>`)
      .replace(/\bE:(\d+(?:\.\d+)?)\b/g, '<span class="inline-eff">⚔ $1</span>')
      .replace(/\bS:(\d+(?:\.\d+)?)\b/g, '<span class="inline-stab">🛡 $1</span>')
      .replace(/\bR:(\d+(?:\.\d+)?)\b/g, '<span class="inline-range">↔ $1m</span>');

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