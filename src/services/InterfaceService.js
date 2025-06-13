import { i18n } from "boot/i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { currentApi } from "boot/axios";
import { pollTranslationUntilComplete } from "src/services/TranslationPollingService";
import { getLanguageObjectFromHL } from "src/i18n/detectLanguage";
import {
  getInterfaceFromDB,
  saveInterfaceToDB,
} from "src/services/IndexedDBService";

const fallback = "eng00";

/**
 * Loads and sets the translated interface for a given HL language code.
 * - Checks IndexedDB first
 * - Falls back to API fetch
 * - Uses fallback language once if needed
 *
 * @param {string} languageCodeHL
 * @param {boolean} hasRetried
 */
export async function getTranslatedInterface(languageCodeHL, hasRetried = false) {
  const languageStore = useLanguageStore();
  const app = import.meta.env.VITE_APP;
  const cronKey = import.meta.env.VITE_CRON_KEY;

  try {
    let messages = await getInterfaceFromDB(languageCodeHL);

    if (!messages) {
      const res = await currentApi.get(`/api/translate/interface/${languageCodeHL}/${app}`);
      messages = res.data.data;

      if (messages?.language?.translationComplete) {
        await saveInterfaceToDB(languageCodeHL, messages);
      } else {
        // Trigger translation cron
        currentApi.get(`/api/translate/cron?token=${cronKey}`).catch(() => {});

        // Poll until translation is complete
        pollTranslationUntilComplete({
          languageCodeHL,
          translationType: 'interface',
          endpoint: `/api/translate/interface/${languageCodeHL}/${app}`,
          saveToDB: saveInterfaceToDB,
          maxAttempts: 5,
          interval: 1000,
        });
      }
    }

    if (messages) {
      i18n.global.setLocaleMessage(languageCodeHL, messages);
      i18n.global.locale.value = languageCodeHL;

      // Optional: update language object in Pinia
      // const languageObject = getLanguageObjectFromHL(languageCodeHL);
      // if (languageObject) {
      //   languageStore.setLanguageObjectSelected(languageObject);
      // }

      document.querySelector("html")?.setAttribute("lang", languageCodeHL);
    }
  } catch (error) {
    console.error(`[InterfaceService] Failed to load interface for ${languageCodeHL}`, error);

    if (!hasRetried && languageCodeHL !== fallback) {
      await getTranslatedInterface(fallback, true);
    }
  }
}
