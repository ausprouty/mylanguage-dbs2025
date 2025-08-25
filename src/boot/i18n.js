// src/boot/i18n.js
import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'eng00',
  fallbackLocale: 'eng00',
  messages: {}, // we'll seed from /public-<site>/interface
  warnHtmlMessage: false,
  fallbackWarn: false,
  missingWarn: false,
})

function baseUrl() {
  // Vite/Quasar injects this; includes trailing slash when base !== '/'
  const b = import.meta.env.BASE_URL || '/'
  return b.endsWith('/') ? b : b + '/'
}

async function loadPublicLocale(locale) {
  const url = `${baseUrl()}interface/${locale}.json`
  try {
    const res = await fetch(url, { cache: 'no-store' }) // avoid SW/browser cache while debugging
    if (!res.ok) {
      console.warn('[i18n] public locale not found:', url, res.status)
      return {}
    }
    return await res.json()
  } catch (e) {
    console.warn('[i18n] failed to fetch public locale', url, e)
    return {}
  }
}

export default boot(async ({ app }) => {
  // Seed a safe, site-specific fallback (fast first paint / offline)
  const fallback = await loadPublicLocale('eng00')
  i18n.global.setLocaleMessage('eng00', fallback)

  app.use(i18n)
})
