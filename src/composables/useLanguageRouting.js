// src/composables/useLanguageRouting.js
import { useRouter, useRoute } from "vue-router";

export function useLanguageRouting() {
  const router = useRouter();
  const route  = useRoute();

  function hasParam(key) {
    return route && route.params &&
      Object.prototype.hasOwnProperty.call(route.params, key);
  }
  function routeHasLangParams() {
    return hasParam("languageCodeHL") || hasParam("languageCodeJF");
  }

  function buildNextLocation(hl, jf) {
    const name = route.name || null;
    const hash = route.hash || "";
    const curQ = Object.assign({}, route.query || {});
    const curP = Object.assign({}, route.params || {});
    if (routeHasLangParams()) {
      const nextParams = Object.assign({}, curP, {
        languageCodeHL: String(hl || curP.languageCodeHL || ""),
        languageCodeJF: String(jf || curP.languageCodeJF || "")
      });
      return name
        ? { name, params: nextParams, query: curQ, hash }
        : { path: route.path, params: nextParams, query: curQ, hash };
    } else {
      const nextQuery = Object.assign({}, curQ);
      if (hl) nextQuery.hl = String(hl);
      if (jf) nextQuery.jf = String(jf);
      return name
        ? { name, params: curP, query: nextQuery, hash }
        : { path: route.path, query: nextQuery, hash };
    }
  }

  function sameLocation(a, b) {
    const sameNameOrPath =
      (a.name && b.name && a.name === b.name) ||
      (!a.name && !b.name && a.path === b.path);
    function J(x){ try { return JSON.stringify(x || {}); } catch(e){ return ""; } }
    return sameNameOrPath &&
      J(a.params) === J(b.params) &&
      J(a.query)  === J(b.query)  &&
      String(a.hash || "") === String(b.hash || "");
  }

  function changeLanguage(hl, jf) {
    const next = buildNextLocation(hl, jf);
    console.debug("[lang] pushing to", next);

    const cur = {
      name: route.name || null,
      path: route.path,
      params: route.params || {},
      query: route.query || {},
      hash: route.hash || ""
    };

    if (sameLocation(next, cur)) {
      // bump query so router navigates even if values are same
      next.query = Object.assign({}, next.query, {
        _langts: Date.now().toString()
      });
      console.debug("[lang] same location; adding _langts", next);
    }

    // IMPORTANT: return the Promise so callers can .finally(...)
    return router.push(next);
  }

  return { changeLanguage };
}
