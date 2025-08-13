// boot/route-resume.js
import { boot } from 'quasar/wrappers'

export default boot(({ router }) => {
  router.afterEach((to) => {
    // Skip pages you never want to restore
    if (to.meta?.resume === false) return
    localStorage.setItem('lastGoodPath', to.fullPath)
  })
})
