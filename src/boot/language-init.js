// src/boot/language-init.ts
import { boot } from "quasar/wrappers";
import { getBrowserLanguageObject } from "src/i18n/detectLanguage";
import { loadInterfaceTranslation } from "src/i18n/loadInterfaceTranslation";
import { useSettingsStore } from "src/stores/SettingsStore";

export default boot(async () => {
  const settings = useSettingsStore();

  // Prevent double-runs if Quasar hot-reloads or multiple boots touch language
  if (settings?.hydration?.languageInFlight) return;
  settings.hydration = {
    ...(settings.hydration || {}),
    languageInFlight: true,
  };

  try {
    // Decide which language to use
    let langObj = settings.languageSelected;

    if (!langObj || !langObj.languageCodeHL) {
      const detected = getBrowserLanguageObject();
      if (detected && detected.languageCodeHL) {
        // Only set if actually different to avoid unnecessary writes
        const same =
          settings.languageSelected?.languageCodeHL === detected.languageCodeHL;
        if (!same && typeof settings.setLanguageObjectSelected === "function") {
          settings.setLanguageObjectSelected(detected);
        } else {
          settings.languageSelected = detected;
        }
        langObj = detected;
        console.log("[language-init] from browser:", detected);
      } else {
        console.warn(
          "[language-init] no valid browser language detected; falling back to 'en'"
        );
        langObj = { languageCodeHL: "en" };
        if (typeof settings.setLanguageObjectSelected === "function") {
          settings.setLanguageObjectSelected(langObj);
        } else {
          settings.languageSelected = langObj;
        }
      }
    }

    // Load interface strings for the chosen language
    const code = String(langObj.languageCodeHL || "en");
    console.log("[language-init] loading interface translation:", code);

    try {
      await loadInterfaceTranslation(code);
    } catch (e) {
      console.error(
        "[language-init] loadInterfaceTranslation failed for",
        code,
        e
      );
      // Fallback to English once, if not already tried
      if (code !== "en") {
        try {
          await loadInterfaceTranslation("en");
          console.warn("[language-init] fell back to English UI");
        } catch (e2) {
          console.error(
            "[language-init] English fallback also failed",
            e2
          );
        }
      }
    }
  } finally {
    // Mark hydrated
    if (typeof settings.markHydrated === "function") {
      settings.markHydrated("language");
    } else {
      settings.hydration = {
        ...(settings.hydration || {}),
        language: true,
      };
    }
    settings.hydration.languageInFlight = false;
  }
});
