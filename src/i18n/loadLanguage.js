// src/i18n/loadLanguage.js
import { i18n } from 'boot/i18n'

const fallback = 'eng00'
const loaded = new Set()

export async function loadLanguageAsync (lang) {
  // 1. load fallback first
  if (!loaded.has(fallback)) {
    const { default: engMessages } = await import('./languages/eng00.json')
    i18n.global.setLocaleMessage(fallback, engMessages)
    loaded.add(fallback)
  }

  // 2. if you’re asking for the fallback itself, just switch to it
  if (lang === fallback) {
    i18n.global.locale.value = fallback
    return
  }

  // 3. load the requested locale if not already
  if (!loaded.has(lang)) {
    const { default: localeMessages } = await import(`./languages/${lang}.json`)
    i18n.global.setLocaleMessage(lang, localeMessages)
    loaded.add(lang)
  }

  // 4. switch to it
  i18n.global.locale.value = lang
  // (optionally update <html lang="…"> too)
  //document.querySelector('html').setAttribute('lang', lang)
}
