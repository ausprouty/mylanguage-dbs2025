
import { DEFAULTS } from "src/constants/Defaults";
export function useInitializeLanguageStore(route, languageStore) {

  // Update store initially
 

  const initialStudy = (
    route.params.study ||
    languageStore.currentStudy ||
    DEFAULTS.study
  );
  const initialLessonNumber = (
    route.params.lesson ||
    languageStore.lessonNumberForStudy ||
    DEFAULTS.lesson
  );
  const initialLanguageHL = (
    route.params.languageCodeHL ||
    languageStore.languageSelected.languageCodeHL ||
    DEFAULTS.languageCodeHL
  );
  const initialLanguageJF = (
    languageStore.languageSelected.languageCodeJF ||
    DEFAULTS.languageCodeJF
  );
  languageStore.setCurrentStudy(initialStudy);
  languageStore.setLessonNumber(initialStudy, initialLessonNumber);
  languageStore.updateLanguageCodeHL(initialLanguageHL);
  languageStore.updateLanguageCodeJF(initialLanguageJF);
}
