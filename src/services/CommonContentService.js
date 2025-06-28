import { useContentStore } from "stores/ContentStore";
import { getContentWithFallback } from "src/services/ContentLoaderService";
import { buildCommonContentKey } from 'src/utils/ContentKeyBuilder';
import {
  getCommonContentFromDB,
  saveCommonContentToDB,
} from "./IndexedDBService";

export async function getCommonContent(languageCodeHL, study) {
  console.log (study)
  const key = buildCommonContentKey(study, languageCodeHL);
  const contentStore = useContentStore();
  console.log("getCommonContent called for " + key);
  const result = await getContentWithFallback({
    key,
    store: contentStore, // ✅ inject it here
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
