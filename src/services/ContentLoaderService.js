import { currentApi } from "boot/axios";
import { useContentStore } from "stores/ContentStore";
import { pollTranslationUntilComplete } from "src/services/TranslationPollingService";

/**
 * Loads content from store, IndexedDB, or API. Triggers polling if translation is incomplete.
 */
export async function getContentWithFallback({
  key,
  store,
  storeGetter,
  storeSetter,
  dbGetter,
  dbSetter,
  apiUrl,
  languageCodeHL,
  translationType,
}) {


  // 1. Check Vuex Store
  const storeValue = storeGetter(store);
  if (storeValue) {
    console.log(`✅ Loaded ${key} from ContentStore`);

    if (storeValue.language?.translationComplete === true) {
      setTranslationComplete(translationType, true);
      return storeValue; // ✅ Fully translated, done
    }
  }

  // 2. Check IndexedDB
  try {
    const dbValue = await dbGetter();
    if (dbValue) {
      console.log(`✅ Loaded ${key} from IndexedDB`);
      storeSetter(store, dbValue);
      if (dbValue.language?.translationCompleted === true) {
        setTranslationComplete(translationType, true);
        return dbValue; // ✅ Fully translated
      }
      console.log("translation in store not complete");
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
    if (!data || typeof data !== "object") {
      console.error(`❌ No valid data returned from API for ${key}`);
      throw new Error(`Empty or invalid API response for ${key}`);
    }
    // update store with whatever we get
    storeSetter(store, data);
    if (data.language?.translationCompleted === true) {
      console.log(`✅ ${key} from API is complete — caching to DB`);
      setTranslationComplete(translationType, true);
      await dbSetter(data);
      //todo
      return data;
    } else {
      console.warn(`⚠️ ${key} from API is incomplete — polling`);
      pollTranslationUntilComplete({
        languageCodeHL,
        translationType: translationType,
        apiUrl: apiUrl,
        dbSetter: dbSetter,
        store:store,
        storeSetter: storeSetter,
      });
    }
  } catch (error) {
    console.error(`❌ Failed to load ${key} from API:`, error);
    throw error;
  }
}
