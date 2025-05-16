import { currentApi } from "boot/axios";
import { useContentStore } from "stores/ContentStore";
import {
  getCommonContentFromDB,
  saveCommonContentToDB,
  getLessonContentFromDB,
  saveLessonContentToDB,
  getVideoUrlsFromDB,
  saveVideoUrlsToDB,
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

export async function getLessonContent(languageCodeHL, study, lesson) {
  const key = `lessonContent-${study}-${languageCodeHL}-lesson-${lesson}`;

  return getContentWithFallback({
    key,
    storeGetter: (store) =>
      store.getLessonContent(study, languageCodeHL, lesson),
    storeSetter: (store, data) =>
      store.setLessonContent(study, languageCodeHL, lesson, data),
    dbGetter: () => getLessonContentFromDB(study, languageCodeHL, lesson),
    dbSetter: (data) =>
      saveLessonContentToDB(study, languageCodeHL, lesson, data),
    apiUrl: `api/translate/lessonContent/${languageCodeHL}/${study}/${lesson}`,
  });
}

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

/**
 * Shared loader for any content type: common, lesson, videoUrls
 * @param {Object} options
 * @param {string} options.key - Unique cache key
 * @param {Function} options.storeGetter - function to get value from ContentStore
 * @param {Function} options.storeSetter - function to save to ContentStore
 * @param {Function} options.dbGetter - function to get from IndexedDB
 * @param {Function} options.dbSetter - function to save to IndexedDB
 * @param {string} options.apiUrl - URL to fetch from
 * @returns {any} content
 */
export async function getContentWithFallback({
  key,
  storeGetter,
  storeSetter,
  dbGetter,
  dbSetter,
  apiUrl,
}) {
  const contentStore = useContentStore();

  // 1. Check ContentStore
  const storeValue = storeGetter(contentStore);
  console.log(`🔍 StoreValue for ${key}:`, storeValue);
  if (storeValue) {
    console.log(`✅ Loaded ${key} from ContentStore`);
    return storeValue;
  }

  // 2. Check IndexedDB
  try {
    const dbValue = await dbGetter();
    console.log(`💾 DB data for ${key}:`, dbValue);
    if (dbValue) {
      console.log(`✅ Loaded ${key} from IndexedDB`);
      storeSetter(contentStore, dbValue);
      return dbValue;
    }
  } catch (err) {
    console.warn(`⚠️ DB getter failed for ${key}:`, err);
  }

  // 3. Fetch from API
  try {
    console.log(`🌐 Fetching ${key} from API: ${apiUrl}`);
    const response = await currentApi.get(apiUrl, { timeout: 10000 });

    let data = response.data?.data;

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (parseError) {
        console.error(`❌ JSON.parse failed for ${key}:`, data);
        throw parseError;
      }
    }

    if (!data) {
      console.error(`❌ No data returned from API for ${key}`);
      throw new Error(`Empty API response for ${key}`);
    }
    console.log(`✅ Fetched ${key} from API`);

    storeSetter(contentStore, data);
    await dbSetter(data);

    return data;
  } catch (error) {
    console.error(`❌ Failed to load ${key}:`, error);
    throw error;
  }
}
