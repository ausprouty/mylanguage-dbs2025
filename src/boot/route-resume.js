// boot/route-resume.js
import { boot } from 'quasar/wrappers'
import { useLanguageStore } from 'src/stores/LanguageStore'

const KEY = 'lastGoodPath'

export default boot(({ router }) => {
  const languageStore = useLanguageStore()

  // Save the successful destination after each navigation.
  router.afterEach((to) => {
    if (to.meta?.resume === false) return
    if (to.path === '/' || to.path === '/index') return

    const p = to.fullPath
    languageStore.currentPath = p
    try { localStorage.setItem(KEY, p) } catch (_) {}
  })

  // On first load, if user landed on '/', try to resume.
  router.isReady().then(() => {
    const here = router.currentRoute.value
    if (here.path !== '/') return

    const fromStore = languageStore.currentPath
    const fromLS = (() => {
      try { return localStorage.getItem(KEY) || '' } catch (_) { return '' }
    })()

    const target = [fromStore, fromLS].find(
      v => v && v !== '/' && v !== '/index'
    )
    if (!target) return

    const resolved = router.resolve(target)
    if (resolved.matched.length > 0) {
      router.replace(target)
    } else {
      // Bad/old path; clear it.
      languageStore.currentPath = '/'
      try { localStorage.removeItem(KEY) } catch (_) {}
      console.warn('Ignoring invalid stored path:', target)
    }
  })
})
