import { boot } from 'quasar/wrappers'
import { http, attachInterceptors /*, patchGlobalAxios */ }
  from 'src/lib/http'

export default boot(({ app }) => {
  attachInterceptors()
  // patchGlobalAxios() // only if you need to support legacy axios usage
  app.config.globalProperties.$http = http
  if (import.meta.env.DEV) {
    console.log('[Axios] base =', http.defaults.baseURL)
  }
})

export { http }
