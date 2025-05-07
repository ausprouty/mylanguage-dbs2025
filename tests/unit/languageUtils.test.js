// languageUtils.test.js
import { describe, it, expect, vi } from 'vitest';
import { getBrowserLanguageHL, getLanguageCodeJF } from 'src/i18n/detectLanguage'
import languages from 'src/i18n/metadata/consolidated_languages.json';

describe('Language Utilities', () => {
  describe('getBrowserLanguageHL()', () => {
    it('returns eng00 for unknown browser language', () => {
      const originalNavigator = global.navigator;
      global.navigator = { language: 'xx' }; // Unknown ISO

      expect(getBrowserLanguageHL()).toBe('eng00');

      global.navigator = originalNavigator;
    });

    it('returns the correct HL code for known language', () => {
      const originalNavigator = global.navigator;
      global.navigator = { language: 'fr-FR' };

      const expected = languages.find(lang =>
        lang.languageCodeIso.startsWith('fr')
      )?.languageCodeHL || 'eng00';

      expect(getBrowserLanguageHL()).toBe(expected);

      global.navigator = originalNavigator;
    });
  });

  describe('getLanguageCodeJF()', () => {
    it('returns correct JF for known HL', () => {
      expect(getLanguageCodeJF('eng00')).toBe('529');
      expect(getLanguageCodeJF('grk00')).toBe('483');
    });

    it('returns 529 for unknown HL code', () => {
      expect(getLanguageCodeJF('xxx99')).toBe('529');
    });
  });
});
