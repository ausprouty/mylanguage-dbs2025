import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'eng00',
  fallbackLocale: 'eng00',
  messages: {},
  warnHtmlMessage: false
})

export async function loadPublicInterface(locale) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/'
  const url = `${base}interface/${locale}.json`
  console.log("[loadPublicInterface] trying to load url");
  try {
    const res = await fetch(url, { cache: 'no-store' })
    return res.ok ? await res.json() : {}
  } catch { return {} }
}
