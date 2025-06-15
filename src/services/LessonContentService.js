
import { useContentStore } from 'stores/ContentStore';
import { getContentWithFallback } from "src/services/ContentLoaderService";
import {
  getLessonContentFromDB,
  saveLessonContentToDB,

} from "./IndexedDBService";


export async function getLessonContent(languageCodeHL, study, lesson) {
  const key = `lessonContent-${study}-${languageCodeHL}-lesson-${lesson}`;
  const ContentStore = useContentStore();
  return getContentWithFallback({
    key,
    store: ContentStore, // ✅ inject it here
    storeGetter: (store) =>
      store.getLessonContent(study, languageCodeHL, lesson),
    storeSetter: (store, data) =>
      store.setLessonContent(study, languageCodeHL, lesson, data),
    dbGetter: () => getLessonContentFromDB(study, languageCodeHL, lesson),
    dbSetter: (data) =>
      saveLessonContentToDB(study, languageCodeHL, lesson, data),
    apiUrl: `api/translate/lessonContent/${languageCodeHL}/${study}/${lesson}`,
    translationType: 'lessonContent'
  });
}

