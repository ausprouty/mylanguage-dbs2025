// src/boot/menu-hydrate.js
import { boot } from 'quasar/wrappers'
import { nextTick } from 'vue'
import { useLanguageStore } from 'src/stores/LanguageStore'

const site = import.meta.env.VITE_APP || 'default'
const base = import.meta.env.BASE_URL || '/'
const version = import.meta.env.VITE_APP_VERSION || 'dev'

// Try these in order
const MENU_URLS = [
  `${base}config/menu.json?v=${version}`,
  `/public-${site}/menu.json?v=${version}`,
  `/sites-${site}/menu.json?v=${version}`,
  `/menu.json?v=${version}`,
]

async function fetchFirst(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url, import.meta.env.DEV ? { cache: 'no-store' } : undefined)
      if (res.ok) return await res.json()
    } catch (_) {}
  }
  return null
}

export default boot(async ({ router }) => {
  // Ensure persisted state is in place before we patch
  await router.isReady()
  await nextTick()

  const store = useLanguageStore()

  // If we already have a menu, skip the network unless you want a fresh pull
  if (Array.isArray(store.menu) && store.menu.length > 0) {
    store.menuStatus = 'ready'
    return
  }

  store.menuStatus = 'loading'
  store.menuError = null

  const data = await fetchFirst(MENU_URLS)

  if (!Array.isArray(data)) {
    store.menuStatus = 'error'
    store.menuError = 'Menu failed to load.'
    // If we had a persisted menu previously, keep using it
    if (Array.isArray(store.menu) && store.menu.length > 0) {
      store.menuStatus = 'ready'
      store.menuError = null
    }
    return
  }

  // Build new lesson/max maps without mutating existing objects
  const nextLessons = { ...(store.lessonNumber || {}) }
  const nextMax = { ...(store.maxLessons || {}) }

  for (const item of data) {
    const key = item && item.key
    if (!key) continue

    if (nextLessons[key] == null) nextLessons[key] = 1

    const max = item.maxLessons
    if (Number.isInteger(max) && max > 0) nextMax[key] = max
  }

  // Patch in one go (Pinia persist writes once)
  store.$patch({
    menu: data,
    menuStatus: 'ready',
    menuError: null,
    lessonNumber: nextLessons,
    maxLessons: nextMax,
  })
})
