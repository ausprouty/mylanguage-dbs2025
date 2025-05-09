import { boot } from "quasar/wrappers";
import {getBrowserLanguageObject} from "src/i18n/detectLanguage";
import { loadLanguageAsync } from "src/i18n/loadLanguage";
import { useLanguageStore } from "src/stores/LanguageStore";


export default boot(async () => {
  const languageStore = useLanguageStore();

  // Only set from browser if no languageSelected is present
  if (!languageStore.languageSelected || !languageStore.languageSelected.languageCodeHL) {
    const languageObject = getBrowserLanguageObject();
    console.log("Language object (from browser):", languageObject);
    languageStore.updateLanguageObjectSelected(languageObject);
    // Use the browser language for the interface
    await loadLanguageAsync(languageObject.languageCodeHL);
  } else {
    // Use the saved language for the interface
    await loadLanguageAsync(languageStore.languageSelected.languageCodeHL);
  }
});
