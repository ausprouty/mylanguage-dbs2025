// src/boot/i18n.js
import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";

var DEFAULT_LOCALE = "eng00";
var APP_VER = String(import.meta.env.VITE_APP_VERSION || "dev").trim();
var BASE = String(import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");

function cacheKey(locale) {
  return "i18n:" + locale + ":v:" + APP_VER;
}

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function readCache(locale) {
  try {
    var raw = localStorage.getItem(cacheKey(locale));
    if (!raw) return null;
    var data = JSON.parse(raw);
    return isPlainObject(data) ? data : null;
  } catch (e) {
    return null;
  }
}

function writeCache(locale, messages) {
  try {
    localStorage.setItem(cacheKey(locale), JSON.stringify(messages));
  } catch (e) {}
}

// Try: cache -> dynamic import -> fetch from public assets
async function fetchLocaleMessages(locale) {
  var cached = readCache(locale);
  if (cached) return cached;

  try {
    // Adjust path to where your bundled locale json files live (if any)
    var mod = await import("../i18n/locales/" + locale + ".json");
    var msgs = mod && mod.default ? mod.default : null;
    if (isPlainObject(msgs)) {
      writeCache(locale, msgs);
      return msgs;
    }
  } catch (e) {
    // ignore, fall through
  }

  var urls = [
    BASE + "i18n/" + locale + ".json?v=" + APP_VER,
    BASE + "locales/" + locale + ".json?v=" + APP_VER
  ];
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    try {
      var opts = import.meta.env.DEV ? { cache: "no-store" } : undefined;
      var res = await fetch(url, opts);
      if (!res.ok) continue;
      var json = await res.json();
      if (isPlainObject(json)) {
        writeCache(locale, json);
        return json;
      }
    } catch (e2) {
      // try next
    }
  }

  throw new Error('No messages found for locale "' + locale + '"');
}

// --- i18n instance (no TS) ---
export var i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {},
  missing: function (locale, key) {
    if (!import.meta.env.PROD) {
      console.warn('[i18n] missing key "' + key + '" in ' + locale);
    }
  },
  warnHtmlMessage: false
});

// Runtime switcher (no TS, no ?.)
export async function setLocaleSafe(locale, fallback) {
  var loc = String(locale || "").trim() || DEFAULT_LOCALE;
  var fb = String(fallback || DEFAULT_LOCALE).trim();

  // Already loaded
  if (i18n.global.availableLocales.indexOf(loc) !== -1) {
    i18n.global.locale.value = loc;
    try { document.documentElement.setAttribute("lang", loc); } catch (e) {}
    return true;
  }

  try {
    var messages = await fetchLocaleMessages(loc);
    i18n.global.setLocaleMessage(loc, messages);
    i18n.global.locale.value = loc;
    try { document.documentElement.setAttribute("lang", loc); } catch (e1) {}
    return true;
  } catch (e2) {
    console.warn("[i18n] failed to load " + loc + ":", e2);
    if (loc !== fb) {
      try {
        var fbMsgs = await fetchLocaleMessages(fb);
        i18n.global.setLocaleMessage(fb, fbMsgs);
        i18n.global.locale.value = fb;
        try { document.documentElement.setAttribute("lang", fb); } catch (e3) {}
        return true;
      } catch (e4) {
        console.error("[i18n] fallback also failed:", e4);
        return false;
      }
    }
    return false;
  }
}

export default boot(async function ({ app }) {
  app.use(i18n);

  // Initial locale: prefer SettingsStore if available, but avoid optional chaining
  var initial = DEFAULT_LOCALE;
  try {
    // Lazy import to avoid circulars if your store also imports i18n somewhere
    var mod = await import("src/stores/SettingsStore");
    var useSettingsStore = mod.useSettingsStore;
    if (typeof useSettingsStore === "function") {
      var settings = useSettingsStore();
      var sel = settings && settings.languageSelected;
      var hl = sel && sel.languageCodeHL ? String(sel.languageCodeHL) : "";
      if (hl) initial = hl;
    }
  } catch (e) {
    // ignore
  }

  await setLocaleSafe(initial, DEFAULT_LOCALE);

  // Expose for components: this.$setLocale('ara00')
  app.config.globalProperties.$setLocale = setLocaleSafe;
});
