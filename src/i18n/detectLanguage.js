import languageMap from 'src/i18n/languageMap.json';

export function getBrowserLanguageHL() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();

  const entry = languageMap[langCode];
  return entry && entry.languageCodeHL ? entry.languageCodeHL : 'eng00';
}

export function getLanguageCodeJF(languageCodeHL) {
  for (const entry of Object.values(languageMap)) {
    if (entry.languageCodeHL === languageCodeHL) {
      return entry.languageCodeJF || '529';
    }
  }
  return '529';
}
