
import { useContentStore } from 'stores/ContentStore';
import { getContentWithFallback } from "src/services/ContentLoaderService";
import {
  getLessonContentFromDB,
  saveLessonContentToDB,

} from "./IndexedDBService";


export async function getLessonContent(languageCodeHL, study, lesson) {
  console.log('getLessonContent called with:', languageCodeHL, study, lesson);

  const key = `lessonContent-${study}-${languageCodeHL}-lesson-${lesson}`;
  const ContentStore = useContentStore();

  const result = await getContentWithFallback({
    key,
    store: ContentStore,
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

  console.log("✅ getLessonContent result:", result);
  return result;
}
