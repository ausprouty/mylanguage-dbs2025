/* eslint-disable no-undef */
// src/boot/brand-hydrate.js
import { boot } from 'quasar/wrappers'
import { useLanguageStore } from 'src/stores/LanguageStore'

export default boot(() => {
  const store = useLanguageStore()

  const current = typeof store.brandTitle === 'string' ? store.brandTitle.trim() : ''
  if (current) {
    console.log('[brand-hydrate] brandTitle already set →', current)
    return
  }

  const envTitle = (import.meta.env.VITE_APP_TITLE || '').toString().trim()
  const injectedTitle = (() => {
    try {
      return (typeof __SITE_META__ !== 'undefined'
        && __SITE_META__?.env?.VITE_APP_TITLE)
        ? String(__SITE_META__.env.VITE_APP_TITLE).trim()
        : ''
    } catch {
      return ''
    }
  })()

  const title = envTitle || injectedTitle

  console.log('[brand-hydrate] envTitle:', envTitle, '| injectedTitle:', injectedTitle, '| chosen:', title)

  if (title) {
    // use action if you added it; otherwise keep direct assignment
    if (typeof store.setBrandTitle === 'function') {
      store.setBrandTitle(title)
    } else {
      store.brandTitle = title
    }
    if (document && document.title !== title) {
      document.title = title
    }
    console.log('[brand-hydrate] stored brandTitle →', store.brandTitle)
  } else {
    console.warn('[brand-hydrate] no title found in env or __SITE_META__')
  }
})
