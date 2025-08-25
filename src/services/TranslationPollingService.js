import { http } from 'src/lib/http'
import { i18n } from "src/lib/i18n";
import { normId } from "src/utils/normalize"; // if you don't have this, inline a simple normalizer

const activePolls = new Set();
const ALLOWED_TYPES = new Set(["interface", "commonContent", "lessonContent"]);

/**
 * Polls for translation completion and updates store, IndexedDB, and i18n state.
 *
 * @param {Object} options
 * @param {string} options.languageCodeHL
 * @param {'interface'|'commonContent'|'lessonContent'} options.translationType
 * @param {string} options.apiUrl
 * @param {Function} options.dbSetter             // save to IDB. Accepts (hl, data) or (data)
 * @param {Object=} options.store                 // Pinia store instance (optional)
 * @param {Function=} options.storeSetter         // (store, data) -> void (optional)
 * @param {number=} options.maxAttempts           // default 5
 * @param {number=} options.interval              // ms, default 300
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
  // ---- input validation ----
  const hl = normId
    ? normId(languageCodeHL)
    : String(languageCodeHL ?? "").trim();
  if (!hl) throw new Error("[poll] 'languageCodeHL' is required");

  if (!ALLOWED_TYPES.has(translationType)) {
    throw new TypeError(`[poll] Invalid translationType: ${translationType}`);
  }

  if (typeof apiUrl !== "string" || apiUrl.trim() === "") {
    throw new TypeError("[poll] 'apiUrl' must be a non-empty string");
  }

  maxAttempts = Math.max(1, parseInt(maxAttempts, 10) || 5);
  interval = Math.max(100, parseInt(interval, 10) || 300); // don't hammer the server

  const pollKey = `${translationType}:${hl}`;

  // prevent duplicate polls
  if (activePolls.has(pollKey)) {
    console.log(`⏳ Poll already active for ${pollKey}`);
    return;
  }
  activePolls.add(pollKey);

  let attempts = 0;

  const finish = () => activePolls.delete(pollKey);

  const poll = async () => {
    attempts++;
    try {
      console.log(
        `🔄 Polling ${translationType} for ${hl} (attempt ${attempts})`
      );
      const res = await http.get(apiUrl);
      const translation = res?.data?.data ?? res?.data ?? null;

      if (!translation || typeof translation !== "object") {
        console.warn("[poll] Empty or invalid translation payload");
      }

      // update store (optional)
      if (typeof storeSetter === "function" && store) {
        try {
          storeSetter(store, translation);
        } catch (e) {
          console.warn("[poll] storeSetter threw:", e);
        }
      }

      // i18n updates for interface
      if (translationType === "interface" && translation) {
        i18n.global.setLocaleMessage(hl, translation);
        i18n.global.locale.value = hl;

        // prefer explicit html lang if present, else HL
        const htmlLang =
          translation?.language?.html || translation?.language?.google || hl;
        document.querySelector("html")?.setAttribute("lang", htmlLang);
      }

      const isComplete = translation?.language?.translationComplete === true;
      console.log("translationComplete:", isComplete);

      if (store?.setTranslationComplete) {
        try {
          store.setTranslationComplete(translationType, !!isComplete);
        } catch (e) {
          console.warn("[poll] setTranslationComplete threw:", e);
        }
      }

      // save to IDB (support both arities)
      if (typeof dbSetter === "function") {
        try {
          if (dbSetter.length >= 2) {
            await dbSetter(hl, translation);
          } else {
            await dbSetter(translation);
          }
        } catch (e) {
          console.warn("[poll] dbSetter threw:", e);
        }
      }

      if (isComplete) {
        console.log(`✅ ${translationType} for ${hl} is complete`);
        finish();
        return;
      }

      if (attempts < maxAttempts) {
        // nudge the backend queue if we have a token on the payload
        const cronKey = translation?.language?.cronKey;
        if (cronKey) {
          http
            .get(`/translate/cron?token=${encodeURIComponent(cronKey)}`)
            .catch((err) => console.warn("⚠️ Cron trigger failed:", err));
        }

        setTimeout(poll, interval);
      } else {
        console.warn(
          `❌ ${translationType} polling exceeded max attempts for ${hl}`
        );
        finish();
      }
    } catch (error) {
      console.error(`💥 Polling error for ${translationType} ${hl}:`, error);
      finish();
    }
  };

  // fire-and-forget
  poll();
}
