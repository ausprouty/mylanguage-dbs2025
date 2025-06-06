// src/i18n/loadLanguage.js

import { getTranslatedInterface } from "src/services/InterfaceService";

/**
 * Loads and applies the specified language using the InterfaceService.
 * Falls back to default language if unavailable.
 *
 * @param {string} languageCodeHL- The language code to load (e.g., 'eng00', 'spa00').
 */
export async function loadLanguageAsync(languageCodeHL) {
  console.log ('loadLanguageAsync is calling getTranslatedInterface with '+ languageCodeHL)
  await getTranslatedInterface(languageCodeHL);
}
