import { DEFAULTS } from "src/constants/Defaults";
export function useInitializesettingsStore(route, settingsStore) {
  // Update store initially

  const initialStudy =
    route.params.study || settingsStore.currentStudy || DEFAULTS.study;
  const initialLessonNumber =
    route.params.lesson ||
    settingsStore.lessonNumberForStudy ||
    DEFAULTS.lesson;
  const initialLanguageHL =
    route.params.languageCodeHL ||
    settingsStore.languageSelected.languageCodeHL ||
    DEFAULTS.languageCodeHL;
  const initialLanguageJF =
    settingsStore.languageSelected.languageCodeJF || DEFAULTS.languageCodeJF;
  settingsStore.setCurrentStudy(initialStudy);
  settingsStore.setLessonNumber(initialStudy, initialLessonNumber);
  settingsStore.updateLanguageCodeHL(initialLanguageHL);
  settingsStore.updateLanguageCodeJF(initialLanguageJF);
}
