import { useContentStore } from "stores/ContentStore";
import { getContentWithFallback } from "src/services/ContentLoaderService";
import {
  getCommonContentFromDB,
  saveCommonContentToDB,
} from "./IndexedDBService";

export async function getCommonContent(languageCodeHL, study) {
  const key = `commonContent-${study}-${languageCodeHL}`;
  const contentStore = useContentStore();
  console.log("getCommonContent called for " + key);
  const result = getContentWithFallback({
    key,
    store: ContentStore, // ✅ inject it here
    storeGetter: (store) => store.getCommonContent(study, languageCodeHL),
    storeSetter: (store, data) =>
      store.setCommonContent(study, languageCodeHL, data),
    dbGetter: () => getCommonContentFromDB(study, languageCodeHL),
    dbSetter: (data) => saveCommonContentToDB(study, languageCodeHL, data),
    apiUrl: `api/translate/commonContent/${languageCodeHL}/${study}`,
    translationType: "commonContent",
  });
  console.log(result);
  return result;
}
