import { currentApi } from "boot/axios";
import { i18n } from "boot/i18n";

const activePolls = new Set();

/**
 * Polls for translation completion and updates store, IndexedDB, and i18n state.
 *
 * @param {Object} options - Options for polling translation status.
 * @param {string} options.languageCodeHL - HL language code.
 * @param {string} options.translationType - 'interface' | 'commonContent' | 'lessonContent'.
 * @param {string} options.apiUrl - URL to fetch translation data.
 * @param {Function} options.dbSetter - Function to save translation to IndexedDB.
 * @param {Object} options.store - Pinia content store.
 * @param {Function} options.storeSetter - Function to save translation into the store.
 * @param {number} [options.maxAttempts=5] - Maximum polling attempts.
 * @param {number} [options.interval=300] - Delay between polling attempts (ms).
 */
export async function pollTranslationUntilComplete({
  languageCodeHL,
  translationType,
  apiUrl,
  dbSetter,
  store,
  storeSetter,
  maxAttempts = 5,
  interval = 300,
}) {

  // ❗ Hard stop if apiUrl is missing/empty
  if (typeof apiUrl !== 'string' || apiUrl.trim() === '') {
     console.log(`❌ pollTranslationUntilComplete: 'apiUrl' must be a non-empty string.`);
    throw new TypeError(
      "pollTranslationUntilComplete: 'apiUrl' must be a non-empty string."
    );
  }

  const pollKey = `${translationType}:${languageCodeHL}`;

  // Prevent duplicate polling for the same language/type
  if (activePolls.has(pollKey)) {
    console.log(`⏳ Polling already active for ${pollKey}`);
    return;
  }
  activePolls.add(pollKey);

  let attempts = 0;

  const poll = async () => {
    attempts++;
    try {
      console.log(`🔄 Polling ${translationType} (attempt ${attempts})`);

      // Fetch translation from the API
      console.log(apiUrl)
      const response = await currentApi.get(apiUrl);
      const translation = response.data.data;


      // ✅ Update store if provided
      if (typeof storeSetter === "function" && store) {
        storeSetter(store, translation);
      }
      // ✅ Set i18n messages if this is interface translation
      if (translationType === "interface") {
        i18n.global.setLocaleMessage(languageCodeHL, translation);
        i18n.global.locale.value = languageCodeHL;
        const googleLangCode = translation?.language?.google;
        if (googleLangCode) {
          document.querySelector("html")?.setAttribute("lang", googleLangCode);
        }
      }

      const isComplete = translation?.language?.translationComplete === true;

      // ✅ Update translationComplete flag in store
      if (store?.setTranslationComplete) {
        store.setTranslationComplete(translationType, isComplete);
      }

      // ✅ Save to IndexedDB if applicable
      if (typeof dbSetter === "function") {
        await dbSetter(translation);
      }


      if (isComplete) {
        console.log(`✅ ${translationType} translation complete.`);
        activePolls.delete(pollKey);
      } else if (attempts < maxAttempts) {
        // 🔁 Not complete yet — requeue cron job and poll again later
        const cronKey = translation?.language?.cronKey;
        console.log(`⏳ ${translationType} incomplete. Queueing cron job...`);
        currentApi.get(`/api/translate/cron/${cronKey}`).catch(err => {
          console.warn("⚠️ Translation queue cron failed:", err);
        });
        setTimeout(poll, interval);
      } else {
        console.warn(`❌ ${translationType} polling exceeded max attempts.`);
        activePolls.delete(pollKey);
      }
    } catch (error) {
      console.error(`💥 Polling error for ${translationType}:`, error);
      activePolls.delete(pollKey);
    }
  };

  poll();
}
