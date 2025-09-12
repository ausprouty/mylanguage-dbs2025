// src/composables/useInterfaceLocale.js
import { useI18n } from "vue-i18n";

export function useInterfaceLocale() {
  const { locale, availableLocales, setLocaleMessage } =
    useI18n({ useScope: "global" });

  function mapToI18nCode(lang) {
    const br = String(lang?.languageCodeBrowser || "").toLowerCase();
    if (br) return br;
    const hl = String(lang?.languageCodeHL || "").toLowerCase();
    if (hl === "eng00") return "en";
    if (hl === "hnd00") return "hi";
    return "en";
  }

  function isRTL(lang) {
    const dir = String(lang?.direction || "").toLowerCase();
    if (dir === "rtl") return true;
    const br = String(lang?.languageCodeBrowser || "").toLowerCase();
    return br === "ar" || br === "fa" || br === "ur";
  }

  async function fetchJSONSafe(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const ct = String(res.headers.get("content-type") || "");
      if (!res.ok || ct.indexOf("application/json") === -1) {
        console.warn("[i18n] not JSON or !ok:", url, res.status, ct);
        return null;
      }
      return await res.json();
    } catch (e) {
      console.warn("[i18n] fetch failed:", url, e);
      return null;
    }
  }

  async function ensureMessages(code) {
    if (availableLocales.includes(code)) return true;

    // Build base safely (supports Vite/Quasar BASE_URL and override)
    const base =
      String(import.meta.env.VITE_I18N_BASE || import.meta.env.BASE_URL || "/")
        .replace(/\/+$/, "");

    // Try a few likely paths
    const candidates = [
      `${base}/i18n/${code}/interface.json`,
      `${base}/i18n/${code}.json`,
      `/i18n/${code}/interface.json`,
    ];

    for (let i = 0; i < candidates.length; i++) {
      const data = await fetchJSONSafe(candidates[i]);
      if (data) {
        setLocaleMessage(code, data);
        return true;
      }
    }

    // Gentle fallback to English if requested code missing
    if (code !== "en") {
      const enCandidates = [
        `${base}/i18n/en/interface.json`,
        `${base}/i18n/en.json`,
        `/i18n/en/interface.json`,
      ];
      for (let i = 0; i < enCandidates.length; i++) {
        const en = await fetchJSONSafe(enCandidates[i]);
        if (en) {
          setLocaleMessage("en", en);
          return true;
        }
      }
    }

    console.warn("[i18n] no interface messages found for", code);
    return false; // but DO NOT throw
  }

  async function applyInterfaceLanguage(lang) {
    const code = mapToI18nCode(lang);
    await ensureMessages(code); // never throws

    if (locale && "value" in locale) locale.value = code;
    try { document.documentElement.lang = code; } catch {}
    try { document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr"; } catch {}
    return code;
  }

  return { applyInterfaceLanguage, mapToI18nCode };
}
