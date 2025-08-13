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
  const app = process.env.VITE_APP;
  console.log('in services/InterfaceService for App ' + app);
  const cronKey = process.env.VITE_CRON_KEY;

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
          apiUrl: `/api/translate/interface/${languageCodeHL}/${app}`,
          dbSetter: saveInterfaceToDB,
          maxAttempts: 5,
          interval: 300,
        });
      }
    }

    if (messages) {
      console.log (messages)
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
