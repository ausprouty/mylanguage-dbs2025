import languages from 'src/i18n/metadata/consolidated_languages.json';

export function getBrowserLanguageHL() {
  const browserLang = navigator.language || navigator.userLanguage;
  const isoCode = browserLang.split('-')[0].toLowerCase();

  const match = languages.find(
    lang => lang.languageCodeIso.startsWith(isoCode)
  );

  return match?.languageCodeHL || 'eng00';
}

export function getLanguageCodeJF(languageCodeHL) {
  const match = languages.find(lang => lang.languageCodeHL === languageCodeHL);
  return match?.languageCodeJF?.toString() || '529';
}
