import { getContentWithFallback } from "services/ContentLoaderService";
import {
  getVideoUrlsFromDB,
  saveVideoUrlsToDB,
} from "./IndexedDBService";

export async function getJesusVideoUrls(languageCodeJF) {
  const study = "jvideo";
  const lesson = 0; // No specific lesson here, but keeping the pattern
  const key = `videoUrls-${study}-${languageCodeJF}-lesson-${lesson}`;

  return getContentWithFallback({
    key,
    storeGetter: (store) => store.getVideoUrls(study, languageCodeJF, lesson),
    storeSetter: (store, data) =>
      store.setVideoUrls(study, languageCodeJF, lesson, data),
    dbGetter: () => getVideoUrlsFromDB(study, languageCodeJF, lesson),
    dbSetter: (data) => saveVideoUrlsToDB(study, languageCodeJF, lesson, data),
    apiUrl: `api/translate/videoUrls/jvideo/${languageCodeJF}`,
  });
}
