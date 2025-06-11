/**
 * Polls the server until the translation is complete, then updates i18n and local storage.
 * @param {Object} options - Configuration options
 * @param {string} options.languageCodeHL - The HL language code (e.g., 'eng00')
 * @param {string} options.translationType - 'interface' | 'commonContent' | etc.
 * @param {string} options.endpoint - The API endpoint to call (e.g., `/api/translate/interface`)
 * @param {function} options.saveToDB - Function to save translation data to local DB
 * @param {number} [options.maxAttempts=10] - Maximum polling attempts
 * @param {number} [options.interval=1000] - Polling interval in milliseconds
 */
export async function pollTranslationUntilComplete({
  languageCodeHL,
  translationType,
  endpoint,
  saveToDB,
  maxAttempts = 10,
  interval = 1000,
}) {
  let attempts = 0;

  const poll = async () => {
    attempts++;
    try {
      const response = await currentApi.get(`${endpoint}/${languageCodeHL}`);
      const translation = response.data.data;

      if (translation?.language?.translationComplete) {
        console.log(`${translationType} translation complete.`);
        await saveToDB(languageCodeHL, translation);
        i18n.global.setLocaleMessage(languageCodeHL, translation);
        i18n.global.locale.value = languageCodeHL;
      } else if (attempts < maxAttempts) {
        console.log(`${translationType} not ready (attempt ${attempts})`);
        setTimeout(poll, interval);
      } else {
        console.warn(`${translationType} translation polling exceeded max attempts.`);
      }
    } catch (error) {
      console.error(`Polling error for ${translationType}:`, error);
    }
  };

  poll();
}
