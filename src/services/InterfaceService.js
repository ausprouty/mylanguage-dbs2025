import { i18n } from "boot/i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { currentApi } from "boot/axios";
import { getLanguageObjectFromHL } from "src/i18n/detectLanguage";
import {
  getInterfaceFromDB,
  saveInterfaceToDB,
} from "src/services/IndexedDBService";

const fallback = "eng00";

/**
 * Load and set the translated interface for a given language code.
 * Tries IndexedDB first, then fetches from API. Falls back to 'eng00' only once.
 *
 * @param {string} languageCodeHL
 * @param {boolean} hasRetried - internal use only
 */
export async function getTranslatedInterface(
  languageCodeHL,
  hasRetried = false
) {
  const languageStore = useLanguageStore();
  const app = import.meta.env.VITE_APP;

  try {
    // 1. Try to load from IndexedDB
    let messages = await getInterfaceFromDB(languageCodeHL);
    console.log(messages);

    // 2. If not available, fetch from API and store
    if (!messages) {
      console.log("no messages");
      const res = await currentApi.get(
        `/api/translate/interface/${languageCodeHL}/${app}`
      );
      console.log(res);
      messages = res.data.data;
      console.log(
        "Interface Service -36 look at db with languageCodeHL" + languageCodeHL
      );
      await saveInterfaceToDB(languageCodeHL, messages);
    }

    // 3. Set in i18n
    i18n.global.setLocaleMessage(languageCodeHL, messages);
    i18n.global.locale.value = languageCodeHL;

    // 4. Update in LocalStorage and Pinia
    // but this leads to circular action
    //const languageObject = getLanguageObjectFromHL(languageCodeHL);
    //if (languageObject) {
    //  languageStore.setLanguageObjectSelected(languageObject);
    //}

    // 5. Update HTML lang attribute
    document.querySelector("html")?.setAttribute("lang", languageCodeHL);
    console.log("Interface Service -53 check db");
  } catch (error) {
    console.error(`Failed to load interface for ${languageCodeHL}:`, error);

    if (!hasRetried && languageCodeHL !== fallback) {
      console.log(
        ` Interface Service -59 Retrying with fallback language: ${fallback}`
      );
      await getTranslatedInterface(fallback, true);
    }
  }
}
