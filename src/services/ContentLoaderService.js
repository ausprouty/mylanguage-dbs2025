import { currentApi } from 'boot/axios'
import { pollTranslationUntilComplete }
  from 'src/services/TranslationPollingService'

/**
 * Loads content from Pinia store, IndexedDB, or API.
 * Triggers polling if translation is incomplete.
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
  skipTranslationCheck = false
}) {
  // ---- input validation ----
  if (!key || typeof key !== 'string') {
    throw new TypeError('getContentWithFallback: key must be a string')
  }
  if (!store) throw new TypeError('getContentWithFallback: store is required')
  if (typeof storeGetter !== 'function') {
    throw new TypeError('getContentWithFallback: storeGetter must be a function')
  }
  if (typeof storeSetter !== 'function') {
    throw new TypeError('getContentWithFallback: storeSetter must be a function')
  }
  if (typeof dbGetter !== 'function') {
    throw new TypeError('getContentWithFallback: dbGetter must be a function')
  }
  if (typeof dbSetter !== 'function') {
    throw new TypeError('getContentWithFallback: dbSetter must be a function')
  }
  if (!apiUrl || typeof apiUrl !== 'string' || apiUrl.trim() === '') {
    throw new TypeError('getContentWithFallback: apiUrl must be a non-empty string')
  }
  if (!translationType || typeof translationType !== 'string') {
    throw new TypeError('getContentWithFallback: translationType must be a string')
  }

  // local helper
  const isTrueFlag = (v) =>
    v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true'

  // 1) Try Pinia store
  try {
    const storeValue = storeGetter(store)
    if (storeValue) {
      console.log(`✅ Loaded ${key} from ContentStore`)
      if (isTrueFlag(storeValue?.language?.translationComplete)) {
        if (typeof store.setTranslationComplete === 'function') {
          store.setTranslationComplete(translationType, true)
        }
        return storeValue
      }
    }
  } catch (e) {
    console.warn(`⚠️ storeGetter failed for ${key}:`, e)
    // continue to DB
  }

  // 2) Try IndexedDB
  try {
    console.log('trying indexedDB')
    const dbValue = await dbGetter()
    if (dbValue) {
      console.log(`✅ Loaded ${key} from IndexedDB`)
      try {
        storeSetter(store, dbValue)
      } catch (e) {
        console.warn('⚠️ storeSetter threw while applying DB value:', e)
      }
      if (isTrueFlag(dbValue?.language?.translationComplete)) {
        if (typeof store.setTranslationComplete === 'function') {
          store.setTranslationComplete(translationType, true)
        }
        return dbValue
      }
      console.log('translation in DB not complete')
    }
  } catch (err) {
    console.warn(`⚠️ DB getter failed for ${key}:`, err)
  }

  // 3) Fetch from API
  try {
    console.log(`🌐 Fetching ${key} from API: ${apiUrl}`)
    const response = await currentApi.get(apiUrl, { timeout: 10000 })

    // tolerate both {data:{...}} and {...}
    let data = response?.data?.data ?? response?.data ?? null

    // accept stringified JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (parseError) {
        console.error(`❌ JSON.parse failed for ${key}:`, data)
        throw parseError
      }
    }

    if (!data || typeof data !== 'object') {
      console.error(`❌ No valid data returned from API for ${key}`)
      throw new Error(`Empty or invalid API response for ${key}`)
    }

    // update store with whatever we get
    try {
      storeSetter(store, data)
    } catch (e) {
      console.warn('⚠️ storeSetter threw while applying API value:', e)
    }

    const complete = skipTranslationCheck || isTrueFlag(data?.language?.translationComplete)

    if (complete) {
      console.log(`✅ ${key} from API is complete - caching to DB`)
      if (typeof store.setTranslationComplete === 'function') {
        store.setTranslationComplete(translationType, true)
      }
      try {
        await dbSetter(data)
      } catch (e) {
        console.warn('⚠️ dbSetter threw while caching complete data:', e)
      }
      return data
    }

    // not complete - kick off polling and still return partial data
    console.warn(`⚠️ ${key} from API is incomplete — polling`)
    try {
      pollTranslationUntilComplete({
        languageCodeHL,
        translationType,
        apiUrl,
        dbSetter,
        store,
        storeSetter
      })
    } catch (e) {
      console.warn('⚠️ pollTranslationUntilComplete failed to start:', e)
    }

    // cache partial to DB too (optional, but keeps offline UX improving)
    try {
      await dbSetter(data)
    } catch (e) {
      console.warn('⚠️ dbSetter threw while caching partial data:', e)
    }

    return data
  } catch (error) {
    console.error(`❌ Failed to load ${key} from API:`, error)
    console.error (apiUrl)
    throw error
  }
}
