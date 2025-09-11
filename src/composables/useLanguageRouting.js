import { useRouter, useRoute } from "vue-router";

export function useLanguageRouting() {
  const router = useRouter();
  const route = useRoute();

  function routeHasLangParams(r) {
    return r && r.params && ("languageCodeHL" in r.params || "languageCodeJF" in r.params);
  }

  function buildNextLocation(hl, jf) {
    const name = route.name;
    const params = Object.assign({}, route.params);
    const query  = Object.assign({}, route.query);
    const hash   = route.hash || "";

    if (routeHasLangParams(route)) {
      params.languageCodeHL = hl;
      params.languageCodeJF = jf;
      return { name, params, query, hash };
    } else {
      query.hl = hl;
      query.jf = jf;
      return { name, params, query, hash };
    }
  }

  function changeLanguage(hl, jf, onAfter) {
    const loc = buildNextLocation(hl, jf);
    router.replace(loc)
      .then(function () { if (typeof onAfter === "function") onAfter(); })
      .catch(function (err) {
        console.warn("[lang] navigation failed", err);
        if (typeof onAfter === "function") onAfter();
      });
  }

  return { changeLanguage };
}
