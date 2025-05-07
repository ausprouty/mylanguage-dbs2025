import { describe, it, expect, vi } from 'vitest'
import { getBrowserLanguageHL, getLanguageCodeJF } from 'src/i18n/detectLanguage'

vi.mock('src/i18n/languageMap.json', () => ({
  default: {
    en: { languageCodeHL: 'eng00', languageCodeJF: 529 },
    fr: { languageCodeHL: 'frn00', languageCodeJF: 496 },
    es: { languageCodeHL: 'spn00', languageCodeJF: 21028 }
  }
}));

describe('detectLanguage.js', () => {
  it('should return HL code for known browser language', () => {
    vi.stubGlobal('navigator', { language: 'fr-FR' })
    expect(getBrowserLanguageHL()).toBe('frn00')
  });

  it('should fall back to eng00 if language not found', () => {
    vi.stubGlobal('navigator', { language: 'xx-ZZ' })
    expect(getBrowserLanguageHL()).toBe('eng00')
  });

  it('should return JF code for known HL code', () => {
    expect(getLanguageCodeJF('spn00')).toBe('21028')
  });

  it('should return default JF code for unknown HL code', () => {
    expect(getLanguageCodeJF('unknown')).toBe('529')
  });
});

