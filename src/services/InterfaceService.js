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
    console.log(`[InterfaceService] Checking IndexedDB for ${languageCodeHL}`);
    let messages = await getInterfaceFromDB(languageCodeHL);
    console.log (messages)

    if (!messages) {
      console.log(`[InterfaceService] Not found in DB. Fetching from API for ${languageCodeHL}`);
      const res = await currentApi.get(`/api/translate/interface/${languageCodeHL}/${app}`);
      messages = res.data.data;
      console.log (messages)
      console.log (messages.language.translationComplete)
      if (messages?.language?.translationComplete) {
        console.log(`[InterfaceService] Saving ${languageCodeHL} interface to IndexedDB`);
        await saveInterfaceToDB(languageCodeHL, messages);
      }
      if (!messages?.language?.translationComplete) {
        console.log("Triggering translation cron...");
        currentApi.get(`/api/translate/cron?token=${cronKey}`)
          .catch(err => console.error("Cron trigger failed:", err));

        // Start polling every 5s, max 5 times
        let attempts = 0;
        const maxAttempts = 5;

        const pollTranslation = async () => {
          attempts++;
          try {
            const check = await currentApi.get(`/api/translate/interface/${languageCodeHL}/${app}`);
            const newMessages = check.data.data;

            if (newMessages?.language?.translationComplete) {
              console.log("Translation Complete. Updating UI.");
              await saveInterfaceToDB(languageCodeHL, newMessages);
              i18n.global.setLocaleMessage(languageCodeHL, newMessages);
              i18n.global.locale.value = languageCodeHL;
            } else if (attempts < maxAttempts) {
               console.log("Translation NOT Complete. Try " + attempts);
              setTimeout(pollTranslation, 1000);
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        };
        pollTranslation();
      }

    }
    if (messages) {
      console.log(`[InterfaceService] Applying translation for ${languageCodeHL}`);
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
      console.log(`[InterfaceService] Retrying with fallback language: ${fallback}`);
      await getTranslatedInterface(fallback, true);
    }
  }
}
