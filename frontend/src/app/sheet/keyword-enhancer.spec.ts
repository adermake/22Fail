import { describe, expect, it } from 'vitest';
import { KeywordEnhancer } from './keyword-enhancer';

describe('KeywordEnhancer inline values', () => {
  it('renders a literal E:5 badge', () => {
    expect(KeywordEnhancer.enhance('Trifft für E:5')).toContain('class="inline-eff">⚔ 5<');
  });

  it('resolves E:X from the owner', () => {
    const html = KeywordEnhancer.enhance('Trifft für E:X', { effectivity: 7 });
    expect(html).toContain('class="inline-eff">⚔ 7<');
  });

  it('shows a question mark when there is nothing to resolve', () => {
    // A complex spell passes no value; reading that as 0 would be a lie.
    expect(KeywordEnhancer.enhance('Trifft für E:X')).toContain('class="inline-eff">⚔ ?<');
  });

  it('accepts a lowercase placeholder', () => {
    expect(KeywordEnhancer.enhance('E:x', { effectivity: 3 })).toContain('⚔ 3');
  });

  it('resolves stability and range placeholders too', () => {
    const html = KeywordEnhancer.enhance('S:X und R:X', { stability: 4, range: 12 });
    expect(html).toContain('🛡 4');
    expect(html).toContain('↔ 12m');
  });

  it('leaves literals alone when a context is given', () => {
    const html = KeywordEnhancer.enhance('E:2 und E:X', { effectivity: 9 });
    expect(html).toContain('⚔ 2');
    expect(html).toContain('⚔ 9');
  });

  it('handles a zero value without falling back to the placeholder', () => {
    expect(KeywordEnhancer.enhance('E:X', { effectivity: 0 })).toContain('⚔ 0');
  });

  it('still highlights keywords', () => {
    expect(KeywordEnhancer.enhance('Kostet Mana')).toContain('keyword-mana');
  });
});
