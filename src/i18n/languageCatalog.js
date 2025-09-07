// src/i18n/languageCatalog.js
let _languages = null;
let _loading = null;

const base = import.meta.env.BASE_URL || "/";
const rel  = (import.meta.env.VITE_LANGUAGE_DATA || 'config/languages.json').replace(/^\//, '');



async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function loadFromPublic() {
  const url = base + rel;                 // -> /config/languages.json (served from public-wisdom)
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return await res.json();                 // must be valid JSON array
}

async function loadFromCode() {
  // Aliases must be defined in quasar.config (you already have @ and @site)
  const siteGlobs = import.meta.glob("@site/config/languages.json", {
    import: "default",
  });
  const globalGlobs = import.meta.glob("@/i18n/metadata/languages.json", {
    import: "default",
  });

  console.log('siteGlobs:', Object.keys(siteGlobs));
  console.log('globalGlobs:', Object.keys(globalGlobs));

  const siteKeys = Object.keys(siteGlobs);
  if (siteKeys.length) {
    const mod = await siteGlobs[siteKeys[0]]();
    return Array.isArray(mod) ? mod : mod?.default || [];
  }

  const globalKeys = Object.keys(globalGlobs);
  if (globalKeys.length) {
    const mod = await globalGlobs[globalKeys[0]]();
    return Array.isArray(mod) ? mod : mod?.default || [];
  }

  return [];
}

export async function loadLanguageCatalogOnce() {
  if (_languages) return _languages;
  if (_loading) return _loading;

  _loading = (async () => {
    let list = await loadFromPublic();
    if (!list) list = await loadFromCode();
    _languages = Array.isArray(list) ? list : [];
    _loading = null;
    return _languages;
  })();

  return _loading;
}

export function getLanguageCatalog() {
  return _languages || [];
}

export function findLanguageByHL(code) {
  if (!code) return null;
  const want = String(code).toLowerCase();
  return (getLanguageCatalog() || []).find(
    (l) => String(l.languageCodeHL || "").toLowerCase() === want
  ) || null;
}

export function findLanguageByISO(code) {
  if (!code) return null;
  const want = String(code).toLowerCase();
  return (getLanguageCatalog() || []).find(
    (l) => String(l.languageCodeIso || "").toLowerCase() === want
  ) || null;
}

// Optional: force reload (rarely needed)
export function clearLanguageCatalogCache() {
  _languages = null;
  _loading = null;
}
