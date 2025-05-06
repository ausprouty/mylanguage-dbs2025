import { i18n } from 'boot/i18n';

export async function loadLanguageAsync(langCodeRaw) {
  const langCode = langCodeRaw.toLowerCase();
  // If already loaded, skip
  if (i18n.global.availableLocales.includes(langCode)) {
    i18n.global.locale.value = langCode;
    return;
  }

  try {
    const messages = await import(`./languages/${langCode}.json`);
    i18n.global.setLocaleMessage(langCode, messages.default || messages);
    i18n.global.locale.value = langCode;
  } catch (err) {
    console.error(`Failed to load language file: ${langCode}`, err);
  }
}
