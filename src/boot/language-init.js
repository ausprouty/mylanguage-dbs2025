import { boot } from "quasar/wrappers";
import { getBrowserLanguageObject } from "src/i18n/detectLanguage";
import { loadInterfaceTranslation } from "src/i18n/loadInterfaceTranslation";
import { useSettingsStore } from "src/stores/SettingsStore";

export default boot(async () => {
  const settingsStore = useSettingsStore();

  // Only set from browser if no languageSelected is present
  if (
    !settingsStore.languageSelected ||
    !settingsStore.languageSelected.languageCodeHL
  ) {
    const languageObject = getBrowserLanguageObject();
    console.log("setLanguageObjectSelected (from browser):", languageObject);
    settingsStore.setLanguageObjectSelected(languageObject);
    // Use the browser language for the interface
    console.log("calling loadInterfaceTranslation from language-init line 18");
    await loadInterfaceTranslation(languageObject.languageCodeHL);
  } else {
    console.log("calling loadInterfaceTranslation from language-init Line21");
    // Use the saved language for the interface
    await loadInterfaceTranslation(
      settingsStore.languageSelected.languageCodeHL
    );
  }
});
