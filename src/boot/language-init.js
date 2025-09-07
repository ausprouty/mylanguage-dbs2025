// src/boot/language-init.ts
console.log('[boot] language-init loaded');
import { boot } from "quasar/wrappers";
import { useSettingsStore } from "src/stores/SettingsStore";
import {
  loadLanguageCatalogOnce,
  getLanguageCatalog,
  findLanguageByHL,
} from "src/i18n/languageCatalog";
import { getBrowserLanguageObject } from "src/i18n/detectLanguage";
import { loadInterfaceTranslation } from "src/i18n/loadInterfaceTranslation";

let ran = false;

export default boot(async () => {

  if (ran) return;
  ran = true;

  const settings = useSettingsStore();

  await loadLanguageCatalogOnce();
  const catalog = getLanguageCatalog();

  // Push into store so UI is reactive
  if (typeof settings.setLanguages === "function") {
    settings.setLanguages(catalog);
  } else {
    settings.languages = catalog;
    settings.languagesLoaded = true;
  }

  // Decide selected language
  let lang = settings.languageSelected || null;

  if (!lang) {
    const wantHL = (import.meta.env.VITE_LANGUAGE_CODE_HL || "").toLowerCase();
    if (wantHL) lang = findLanguageByHL(wantHL);
  }

  if (!lang) {
    lang =
      catalog.find((l) => l.languageCodeHL === "eng00") ||
      catalog[0] || { languageCodeHL: "eng00", name: "English" };
  }

  if (typeof settings.setLanguageObjectSelected === "function") {
    settings.setLanguageObjectSelected(lang);
  } else {
    settings.languageSelected = lang;
  }

  // Load UI strings
  const code = String(lang.languageCodeHL || "eng00");
  try {
    await loadInterfaceTranslation(code);
  } catch (e) {
    console.error("[language-init] UI load failed for", code, e);
    if (code !== "eng00") {
      try {
        await loadInterfaceTranslation("eng00");
        console.warn("[language-init] fell back to English UI");
      } catch (e2) {
        console.error("[language-init] English fallback failed", e2);
      }
    }
  }
  if (typeof settings.markHydrated === "function") {
    settings.markHydrated("language");
  } else {
    settings.hydration = { ...(settings.hydration || {}), language: true };
  }
});
