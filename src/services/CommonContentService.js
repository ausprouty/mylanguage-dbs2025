
import { getContentWithFallback } from "services/ContentLoaderService";
import {
  getCommonContentFromDB,
  saveCommonContentToDB,
} from "./IndexedDBService";

export async function getCommonContent(languageCodeHL, study) {
  const key = `commonContent-${study}-${languageCodeHL}`;

  return getContentWithFallback({
    key,
    storeGetter: (store) => store.getCommonContent(study, languageCodeHL),
    storeSetter: (store, data) =>
      store.setCommonContent(study, languageCodeHL, data),
    dbGetter: () => getCommonContentFromDB(study, languageCodeHL),
    dbSetter: (data) => saveCommonContentToDB(study, languageCodeHL, data),
    apiUrl: `api/translate/commonContent/${languageCodeHL}/${study}`,
  });
}
