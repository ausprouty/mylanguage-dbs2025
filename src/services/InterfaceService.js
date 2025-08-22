import { i18n } from "boot/i18n";
import { useSettingsStore } from "src/stores/SettingsStore";
import { currentApi } from "boot/axios";
import { pollTranslationUntilComplete } from "src/services/TranslationPollingService";
import { getLanguageObjectFromHL } from "src/i18n/detectLanguage";
import {
  getInterfaceFromDB,
  saveInterfaceToDB,
} from "src/services/IndexedDBService";
import { normId } from "src/utils/normalize";

const FALLBACK_HL = "eng00";

/**
 * Loads and sets the translated interface for a given HL code.
 * - Checks IndexedDB first
 * - Falls back to API
 * - Uses fallback language once if needed
 */
export async function getTranslatedInterface(
  languageCodeHL,
  hasRetried = false
) {
  const settingsStore = useSettingsStore();

  const hl = normId(languageCodeHL);
  const app = normId(import.meta.env.VITE_APP) || "default";
  const cronKey = normId(import.meta.env.VITE_CRON_KEY);

  if (!hl) {
    console.error("[InterfaceService] Missing languageCodeHL", {
      languageCodeHL,
    });
    // attempt fallback once
    if (!hasRetried && FALLBACK_HL !== languageCodeHL) {
      return getTranslatedInterface(FALLBACK_HL, true);
    }
    return;
  }

  console.log("[InterfaceService] app:", app, "hl:", hl);

  try {
    // 1) try IndexedDB
    let messages = await getInterfaceFromDB(hl);

    // 2) fetch if not in DB
    if (!messages) {
      const apiUrl = `/translate/interface/${hl}/${app}`;
      const res = await currentApi.get(apiUrl);

      // support either {data:{...}} or {...}
      messages = res?.data?.data ?? res?.data ?? null;

      // 3) save or trigger translation & poll
      if (messages?.language?.translationComplete) {
        await saveInterfaceToDB(hl, messages);
      } else {
        if (cronKey) {
          currentApi.get(`/translate/cron?token=${cronKey}`).catch(() => {});
        }

        // fire-and-forget polling; it will call saveInterfaceToDB when ready
        pollTranslationUntilComplete({
          languageCodeHL: hl,
          translationType: "interface",
          apiUrl,
          dbSetter: (hlCode, data) => saveInterfaceToDB(hlCode, data),
          maxAttempts: 5,
          interval: 300,
        });
      }
    }

    // 4) apply to i18n if we have something
    if (messages) {
      i18n.global.setLocaleMessage(hl, messages);
      i18n.global.locale.value = hl;

      // Optional: update Pinia’s language object
      // const langObj = getLanguageObjectFromHL(hl)
      // if (langObj) settingsStore.setLanguageObjectSelected(langObj)

      document.querySelector("html")?.setAttribute("lang", hl);
      return;
    }

    // 5) fallback once if nothing came back
    if (!hasRetried && hl !== FALLBACK_HL) {
      return getTranslatedInterface(FALLBACK_HL, true);
    }
  } catch (error) {
    console.error(`[InterfaceService] Load failed for ${hl}`, error);
    if (!hasRetried && hl !== FALLBACK_HL) {
      return getTranslatedInterface(FALLBACK_HL, true);
    }
  }
}
