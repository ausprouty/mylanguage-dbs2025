import { boot } from "quasar/wrappers";
import { getBrowserLanguageObject } from "src/i18n/detectLanguage";
import { loadLanguageAsync } from "src/i18n/loadLanguage";
import { useLanguageStore } from "src/stores/LanguageStore";

export default boot(async () => {
  const languageStore = useLanguageStore();

  // Only set from browser if no languageSelected is present
  if (
    !languageStore.languageSelected ||
    !languageStore.languageSelected.languageCodeHL
  ) {
    const languageObject = getBrowserLanguageObject();
    console.log("Language object (from browser):", languageObject);
    languageStore.setLanguageObjectSelected(languageObject);
    // Use the browser language for the interface
    console.log("calling LoadLanguageAsync from language-init line 18");
    await loadLanguageAsync(languageObject.languageCodeHL);
  } else {
    console.log("calling LoadLanguageAsync from language-init Line21");
    // Use the saved language for the interface
    await loadLanguageAsync(languageStore.languageSelected.languageCodeHL);
  }
});
