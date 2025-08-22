/* eslint-disable no-undef */
// src/boot/brand-hydrate.js
import { boot } from "quasar/wrappers";
import { useSettingsStore } from "src/stores/SettingsStore";

export default boot(async () => {
  const store = useSettingsStore();

  try {
    // If already hydrated, skip
    const current =
      typeof store.brandTitle === "string" ? store.brandTitle.trim() : "";
    if (current) {
      console.log("[brand-hydrate] brandTitle already set →", current);
      return;
    }

    // Gather candidates (env, then injected build-time meta)
    const envTitle = String(import.meta.env.VITE_APP_TITLE || "").trim();
    const injectedTitle = (() => {
      try {
        return typeof __SITE_META__ !== "undefined" &&
          __SITE_META__?.env?.VITE_APP_TITLE
          ? String(__SITE_META__.env.VITE_APP_TITLE).trim()
          : "";
      } catch {
        return "";
      }
    })();

    const title = envTitle || injectedTitle;

    console.log(
      "[brand-hydrate] envTitle:", envTitle,
      "| injectedTitle:", injectedTitle,
      "| chosen:", title
    );

    if (title) {
      // Prefer an action if present; fall back to direct assignment
      if (typeof store.setBrandTitle === "function") {
        // If your action is async (e.g., persists), await it
        await store.setBrandTitle(title);
      } else {
        store.brandTitle = title;
      }

      if (typeof document !== "undefined" && document.title !== title) {
        document.title = title;
      }

      console.log("[brand-hydrate] stored brandTitle →", store.brandTitle);
    } else {
      console.warn("[brand-hydrate] no title found in env or __SITE_META__");
    }
  } finally {
    // Mark this hydrate complete if you have such an action/flag
    if (typeof store.markHydrated === "function") {
      store.markHydrated("brand");
    } else {
      // optional: add a simple flag to your store if you want
      try { store.hydration = { ...(store.hydration || {}), brand: true }; } catch {}
    }
  }
});
