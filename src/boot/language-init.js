import { boot } from "quasar/wrappers";
import {getBrowserLanguageObject} from "src/i18n/detectLanguage";
import { loadLanguageAsync } from "src/i18n/loadLanguage";
import { useLanguageStore } from "src/stores/LanguageStore";


export default boot(async () => {
  const languageStore = useLanguageStore();
  const languageObject = getBrowserLanguageObject();
  console.log("Language object:", languageObject);
  languageStore.updateLanguageObjectSelected(languageObject);
  await loadLanguageAsync(languageObject.languageCodeHL);
});
