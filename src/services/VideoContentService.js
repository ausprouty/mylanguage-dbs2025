import { useContentStore } from "stores/ContentStore";
import { getContentWithFallback } from "src/services/ContentLoaderService";
import { getVideoUrlsFromDB, saveVideoUrlsToDB } from "./IndexedDBService";

export async function getJesusVideoUrls(languageCodeJF) {
  const study = "jvideo";
  const lesson = 0; // No specific lesson here, but keeping the pattern
  const key = `videoUrls-${study}-${languageCodeJF}-lesson-${lesson}`;
  const contentStore = useContentStore();
  const result = getContentWithFallback({
    key,
    store: ContentStore, // ✅ inject it here
    storeGetter: (store) => store.getVideoUrls(study, languageCodeJF, lesson),
    storeSetter: (store, data) =>
      store.setVideoUrls(study, languageCodeJF, lesson, data),
    dbGetter: () => getVideoUrlsFromDB(study, languageCodeJF, lesson),
    dbSetter: (data) => saveVideoUrlsToDB(study, languageCodeJF, lesson, data),
    apiUrl: `api/translate/videoUrls/jvideo/${languageCodeJF}`,
    translationType: "videoContent",
  });
  console.log(result);
  return result;
}
