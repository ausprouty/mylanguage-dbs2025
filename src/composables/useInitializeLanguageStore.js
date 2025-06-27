export function useInitializeLanguageStore(route, languageStore) {

  // Update store initially
  const DEFAULTS = {
    study: "dbs",
    lesson: "1",
    languageCodeHL: "eng00",
    languageCodeJF: "529",
  };

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
