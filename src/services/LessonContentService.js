import { useContentStore } from "stores/ContentStore";
import { getContentWithFallback } from "src/services/ContentLoaderService";
import { buildLessonContentKey } from 'src/utils/ContentKeyBuilder';
import {
  getLessonContentFromDB,
  saveLessonContentToDB,
} from "./IndexedDBService";

export async function getLessonContent(
  study,
  languageCodeHL,
  languageCodeJF,
  lesson
) {
  console.log(
    "getLessonContent called with:" + study,
    languageCodeHL,
    languageCodeJF,
    lesson
  );

  const key = buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson);
  const url = `api/translate/lessonContent/${languageCodeHL}/${languageCodeJF}/${study}/${lesson}`;
  console.log(url);
  const contentStore = useContentStore();

  const result = await getContentWithFallback({
    key,
    store: contentStore,
    storeGetter: (store) =>
      store.getLessonContent(study, languageCodeHL, languageCodeJF, lesson),
    storeSetter: (store, data) =>
      store.setLessonContent(
        study,
        languageCodeHL,
        languageCodeJF,
        lesson,
        data
      ),
    dbGetter: () =>
      getLessonContentFromDB(study, languageCodeHL, languageCodeJF, lesson),
    dbSetter: (data) =>
      saveLessonContentToDB(
        study,
        languageCodeHL,
        languageCodeJF,
        lesson,
        data
      ),
    apiUrl: url,
    translationType: "lessonContent",
  });

  return result;
}
