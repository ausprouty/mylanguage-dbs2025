import { i18n } from "src/lib/i18n";
import { http } from "src/lib/http";
import { pollTranslationUntilComplete } from "src/services/TranslationPollingService";
import {
  getInterfaceFromDB,
  saveInterfaceToDB,
} from "src/services/IndexedDBService";
import { normId } from "src/utils/normalize";
// debug setup
import { debug } from "src/lib/debug";
const log = debug("InterfaceService");
const net = debug("InterfaceService:net");

const FALLBACK_HL = "eng00";

/* ---------- tiny guards used below ---------- */
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const safeKeys = (o) => (isObj(o) ? Object.keys(o) : []);

/* ---------- main ---------- */

/**
 * Load and install the translated interface for a given HL.
 *
 * @param {string} languageCodeHL - e.g., "eng00"
 * @param {boolean} [hasRetried=false] - internal guard to avoid infinite loops
 * @returns {Promise<object|undefined>} The validated message tree that was installed (okTree), or undefined on failure.
 * - Checks IndexedDB first
 * - Falls back to API
 * - Uses eng00 once if needed
 * - Validates i18n strings to avoid runtime compile errors
 */
export async function getTranslatedInterface(languageCodeHL, hasRetried = false) {
  const hl = normId(languageCodeHL);
  const app = normId(import.meta.env.VITE_APP) || "default";
  const cronKey = normId(import.meta.env.VITE_CRON_KEY);

  if (!hl) {
    console.error("[InterfaceService] Missing languageCodeHL", { languageCodeHL });
    if (!hasRetried && FALLBACK_HL !== languageCodeHL) {
      return getTranslatedInterface(FALLBACK_HL, true);
    }
    return;
  }

  log("load", { app, hl });

  try {
    /* 1) Try IndexedDB first ------------------------------------------------ */
    let messages = await getInterfaceFromDB(hl);
    const hasIDB = isObj(messages) && safeKeys(messages).length > 0;
    messages = hasIDB ? messages : null;
    log("from IDB", { has: hasIDB, keys: hasIDB ? safeKeys(messages).length : 0 });

    /* 2) If missing/empty, fetch from API ---------------------------------- */
    if (!messages) {
      const apiPath = `/translate/interface/${hl}/${app}`;
      net("GET", apiPath);

      // fetch as text so we can inspect/log raw body & headers
      const { status, headers, data } = await http.get(apiPath, {
        responseType: "text",
        transformResponse: (v) => v,     // prevent auto-parse
        validateStatus: () => true,      // let us inspect non-2xx
      });

      const h = Object.fromEntries(
        Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), v])
      );
      const ctype = String(h["content-type"] || "");
      const body = String(data ?? "");

      net.groupCollapsed("response", status, ctype);
      net.log(h);
      net.log(body.slice(0, 180));
      net.groupEnd();

      if (status < 200 || status >= 300) {
        throw new Error(`HTTP ${status} from ${apiPath}`);
      }
      if (!ctype.includes("application/json")) {
        throw new Error(
          `[interface] non-JSON from API. CT=${ctype} HEAD=${body.slice(0, 120)}`
        );
      }

      const parsed = safeParseJson(body);
      // support either {data:{...}} or {...}
      messages = parsed?.data ?? parsed ?? null;

      if (messages?.language?.translationComplete) {
        await saveInterfaceToDB(hl, messages);
      } else {
        // nudge queue using path param (server expects /cron/{token})
        if (cronKey) {
          http.get(`/translate/cron/${encodeURIComponent(cronKey)}`).catch(() => {});
        }
        // begin polling until complete, persisting to IDB as it updates
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

    /* 3) apply to i18n with validation */
    if (isObj(messages)) {
      const { okTree, bad } = validateMessages(hl, messages);

      // Debug/visibility
      log("validated", {
        goodTopKeys: Object.keys(okTree || {}),
        badCount: bad.length,
      });
      if (bad.length) {
        console.error(
          "[i18n] Bad message strings (showing up to 20):",
          bad.slice(0, 20)
        );
        console.error(`[i18n] Total bad keys: ${bad.length}`);
      }

      // If nothing validated, try the fallback once
      if (!Object.keys(okTree || {}).length) {
        console.warn("[i18n] No valid keys after validation for", hl);
        if (!hasRetried && hl !== FALLBACK_HL) {
          return getTranslatedInterface(FALLBACK_HL, true);
        }
        return; // give up quietly if already retried
      }

      // Replace locale entirely with only the valid keys
      i18n.global.setLocaleMessage(hl, {});
      i18n.global.mergeLocaleMessage(hl, okTree);
      i18n.global.locale.value = hl;

      // Accessibility / layout hints
      const htmlLang =
        messages?.language?.html || messages?.language?.google || hl;
      document.documentElement.setAttribute("lang", htmlLang);

      const dir = (
        messages?.language?.dir || messages?.language?.direction || ""
      ).toLowerCase();
      if (dir === "rtl" || dir === "ltr") {
        document.documentElement.setAttribute("dir", dir);
      }

      return okTree; // optionally return what we installed
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** parse JSON with a helpful head preview on error */
function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const head = String(text || "").slice(0, 180);
    throw new Error(`[Interface] JSON parse failed. Head: ${head}`);
  }
}

/** set nested value given a path array, creating objects as needed */
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
 * Validate messages by compiling each string via i18n.
 * Returns { okTree, bad[] } where bad has { key, err }.
 */
function validateMessages(lang, bundle) {
  const bad = [];
  const okTree = {};

  function walk(path, val) {
    if (typeof val === "string") {
      const flat = path.join(".");
      try {
        // Compile-check just this key
        const tmp = {};
        tmp[flat] = val;
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
