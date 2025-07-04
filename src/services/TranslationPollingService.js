import { currentApi } from "boot/axios";
import { i18n } from "boot/i18n";

const activePolls = new Set();

export async function pollTranslationUntilComplete({
  languageCodeHL,
  translationType, // 'interface', 'commonContent', 'lessonContent'
  apiUrl,
  dbSetter,
  store,
  storeSetter,
  maxAttempts = 5,
  interval = 300,
}) {
  const pollKey = `${translationType}:${languageCodeHL}`;
  if (activePolls.has(pollKey)) {
    console.log(`⏳ Polling already active for ${pollKey}`);
    return;
  }
  activePolls.add(pollKey);

  let attempts = 0;

  const poll = async () => {
    attempts++;
    try {
      console.log ('attempting poll')
      const response = await currentApi.get(apiUrl);
      const translation = response.data.data;
      // ✅ Step 1: // ✅ Always keep store updated with latest translation, even if incomplete
      await storeSetter(store, translation);
      console.log (translation);
      if (translation?.language?.translationComplete) {
        console.log(`${translationType} translation complete.`);

        // ✅ Step 2: Update translationComplete flag if complete
        store.setTranslationComplete(translationType, true);

        // ✅ Step 3: Save to IndexedDB
        await dbSetter(translation);

        // ✅ Step 4: (only for interface)
        if (translationType === "interface") {
          i18n.global.setLocaleMessage(languageCodeHL, translation);
          i18n.global.locale.value = languageCodeHL;
        }

        activePolls.delete(pollKey);

      } else if (attempts < maxAttempts) {
        // ✅ Step 2: Update translationComplete flag
        store.setTranslationComplete(translationType, false);
        const cronKey = translation?.language?.cronKey;
        console.log(`${translationType} not complete (attempt ${attempts})`);
        currentApi.get(`/api/translate/cron/${cronKey}`).catch(err =>
        console.warn("Translation queue cron failed:", err)
        );
        setTimeout(poll, interval);
      } else {
        console.warn(`${translationType} polling exceeded max attempts.`);
        activePolls.delete(pollKey);
      }
    } catch (error) {
      console.error(`Polling error for ${translationType}:`, error);
      activePolls.delete(pollKey);
    }
  };

  poll();
}
