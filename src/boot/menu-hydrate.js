// src/boot/menu-hydrate.js
import { boot } from 'quasar/wrappers'
import { useLanguageStore } from 'src/stores/LanguageStore'

async function fetchFirst(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(
        url,
        import.meta.env.DEV ? { cache: 'no-store' } : undefined
      )
      if (res.ok) return await res.json()
      console.warn('[menu-hydrate] fetch failed', res.status, url)
    } catch (e) {
      console.warn('[menu-hydrate] fetch error', url, e)
    }
  }
  return null
}

export default boot(async () => {
  const store = useLanguageStore()
  store.normalizeShapes?.()

  // If cached, we're done
  if (Array.isArray(store.menu) && store.menu.length > 0) {
    store.menuStatus = 'ready'
    return
  }

  store.menuStatus = 'loading'
  store.menuError = null

  const base = import.meta.env.BASE_URL || '/'
  const site = import.meta.env.VITE_APP || 'default'
  const ver  = import.meta.env.VITE_APP_VERSION || 'dev'

  const urls = [
    `${base}menu.json?v=${ver}`,
    `${base}config/menu.json?v=${ver}`,
    `/public-${site}/menu.json?v=${ver}`,
    `/sites-${site}/menu.json?v=${ver}`,
  ]
  const data = await fetchFirst(urls)

  if (!Array.isArray(data)) {
    store.menuStatus = 'error'
    store.menuError = 'Menu failed to load.'
    return
  }

  const nextLessons = { ...(store.lessonNumber || {}) }
  const nextMax     = { ...(store.maxLessons || {}) }

  for (const { key, maxLessons } of data) {
    if (!key) continue
    if (nextLessons[key] == null) nextLessons[key] = 1
    if (Number.isInteger(maxLessons) && maxLessons > 0) nextMax[key] = maxLessons
  }

  store.$patch({
    menu: data,
    menuStatus: 'ready',
    menuError: null,
    lessonNumber: nextLessons,
    maxLessons: nextMax,
  })
})
