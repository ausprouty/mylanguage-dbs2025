import { i18n } from "src/lib/i18n";
import { useSettingsStore } from "src/stores/SettingsStore";
import { http } from 'src/lib/http'
import { pollTranslationUntilComplete } from "src/services/TranslationPollingService";
import {
  getInterfaceFromDB,
  saveInterfaceToDB,
} from "src/services/IndexedDBService";
import { normId } from "src/utils/normalize";

const FALLBACK_HL = "eng00";

/* ---------- helpers ---------- */

function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const head = String(text || "").slice(0, 180);
    throw new Error(`[Interface] JSON parse failed. Head: ${head}`);
  }
}

function setByPath(root, path, value) {
  let obj = root;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    obj[k] = obj[k] || {};
    obj = obj[k];
  }
  obj[path[path.length - 1]] = value;
}

/**
 * Validate messages by compiling each string via mergeLocaleMessage.
 * Returns { okTree, bad[] } where bad has { key, err }.
 */
function validateMessages(lang, bundle) {
  const bad = [];
  const okTree = {};

  function walk(path, val) {
    if (typeof val === "string") {
      const flat = path.join(".");
      try {
        const tmp = {};
        tmp[flat] = val;
        // this compiles the string; throws on bad syntax
        i18n.global.mergeLocaleMessage(lang, tmp);
        setByPath(okTree, path, val);
      } catch (e) {
        bad.push({ key: flat, err: String(e && e.message) });
      }
      return;
    }
    if (isObj(val)) {
      for (const k of Object.keys(val)) walk(path.concat(k), val[k]);
    }
  }

  walk([], bundle);
  return { okTree, bad };
}

/* ---------- main ---------- */

/**
 * Loads and sets the translated interface for a given HL code.
 * - Checks IndexedDB first
 * - Falls back to API
 * - Uses eng00 once if needed
 * - Validates i18n strings to avoid runtime compile errors
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
    if (!hasRetried && FALLBACK_HL !== languageCodeHL) {
      return getTranslatedInterface(FALLBACK_HL, true);
    }
    return;
  }

  console.log("[InterfaceService] app:", app, "hl:", hl);

  try {
    // 1) IndexedDB first
    let messages = await getInterfaceFromDB(hl);

    // 2) fetch if not in DB
    if (!messages) {
      const apiPath = `/translate/interface/${hl}/${app}`;
      // fetch as text so we can inspect the head on errors
      const res = await http.get(apiPath, { responseType: "text" });

      const ctype = res?.headers?.["content-type"] || "";
      const body = res?.data ?? "";
      console.debug(
        "[Interface] status=",
        res?.status,
        "ctype=",
        ctype,
        "head=",
        String(body).slice(0, 180)
      );

      const parsed = typeof body === "string" ? safeParseJson(body) : body;

      // support either {data:{...}} or {...}
      messages = parsed?.data ?? parsed ?? null;

      if (messages?.language?.translationComplete) {
        await saveInterfaceToDB(hl, messages);
      } else {
        if (cronKey) {
          http.get(`/translate/cron?token=${cronKey}`).catch(() => {});
        }
        pollTranslationUntilComplete({
          languageCodeHL: hl,
          translationType: "interface",
          apiUrl: apiPath,
          dbSetter: (hlCode, data) => saveInterfaceToDB(hlCode, data),
          maxAttempts: 5,
          interval: 300,
        });
      }
    }

    // 3) apply to i18n with validation
    if (messages) {
      const { okTree, bad } = validateMessages(hl, messages);

      if (bad.length) {
        console.error("[i18n] Bad message strings:", bad.slice(0, 20));
        console.error(`[i18n] Total bad keys: ${bad.length}`);
      }

      // Reset then install only good keys, so app won't crash
      i18n.global.setLocaleMessage(hl, {});
      i18n.global.mergeLocaleMessage(hl, okTree);
      i18n.global.locale.value = hl;

      document.querySelector("html")?.setAttribute("lang", hl);

      // Optional: update Pinia language object (commented to match your code)
      // const langObj = getLanguageObjectFromHL(hl);
      // if (langObj) settingsStore.setLanguageObjectSelected(langObj);

      return;
    }

    // 4) fallback once if nothing came back
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
