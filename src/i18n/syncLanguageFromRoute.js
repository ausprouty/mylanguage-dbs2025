import { useLanguageStore } from "src/stores/LanguageStore";
import { getLanguageObjectFromHL } from "./detectLanguage";

export function syncLanguageFromRoute(route) {
  const languageStore = useLanguageStore();
  const langCodeFromRoute = route.params.languageCodeHL;

  if (!langCodeFromRoute) return;

  const currentHL = languageStore.languageSelected?.languageCodeHL;
  if (langCodeFromRoute !== currentHL) {
    const languageObject = getLanguageObjectFromHL(langCodeFromRoute);
    if (languageObject) {
      languageStore.setLanguageObjectSelected(languageObject);
    } else {
      console.warn(`Unknown language code in route: ${langCodeFromRoute}`);
    }
  }
}
