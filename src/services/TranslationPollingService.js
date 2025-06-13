import { currentApi } from "boot/axios";
import { i18n } from "boot/i18n";

const activePolls = new Set();

export async function pollTranslationUntilComplete({
  languageCodeHL,
  translationType,
  endpoint,
  saveToDB,
  maxAttempts = 10,
  interval = 1000,
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
      const response = await currentApi.get(endpoint);
      const translation = response.data.data;

      if (translation?.language?.translationComplete) {
        console.log(`${translationType} translation complete.`);
        await saveToDB(languageCodeHL, translation);

        if (translationType === "interface") {
          i18n.global.setLocaleMessage(languageCodeHL, translation);
          i18n.global.locale.value = languageCodeHL;
        }

        activePolls.delete(pollKey);
      } else if (attempts < maxAttempts) {
        console.log(`${translationType} not ready (attempt ${attempts})`);
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
