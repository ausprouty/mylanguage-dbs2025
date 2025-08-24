// Keep lines short and avoid dynamic-import warnings.
import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

const loaders = import.meta.glob('../i18n/locales/*.json')

async function loadLocaleMessages (locale) {
  const path = `../i18n/locales/${locale}.json`
  const load = loaders[path]
  if (!load) return {}
  const mod = await load()
  return mod?.default ?? {}
}

const i18n = createI18n({
  locale: 'eng00',
  fallbackLocale: 'eng00',
  legacy: false,
  globalInjection: true,
  messages: {}
})

export async function setLocale (locale) {
  const msgs = await loadLocaleMessages(locale)
  i18n.global.setLocaleMessage(locale, msgs)
  i18n.global.locale.value = locale
}

export default boot(async ({ app }) => {
  const bootMsgs = await loadLocaleMessages('eng00')
  i18n.global.setLocaleMessage('eng00', bootMsgs)
  app.use(i18n)
})

export { i18n }
