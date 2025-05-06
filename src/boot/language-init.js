import { boot } from "quasar/wrappers";
import {
  getBrowserLanguageHL,
  getLanguageCodeJF,
} from "src/i18n/detectLanguage";
import { useLanguageStore } from "src/stores/LanguageStore";
import { loadLanguageAsync } from "src/i18n/loadLanguage";

export default boot(async () => {
  const languageStore = useLanguageStore();
  const browserLanguageHL = getBrowserLanguageHL();
  const languageCodeJF = getLanguageCodeJF(browserLanguageHL);

  console.log("browserLanguageHL", browserLanguageHL);
  console.log("languageCodeJF", languageCodeJF);

  languageStore.updateLanguageSelected(browserLanguageHL, languageCodeJF);

  // Load the appropriate language JSON
  await loadLanguageAsync(languageCodeJF);
});
