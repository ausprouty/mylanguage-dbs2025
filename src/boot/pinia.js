import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default boot(({ app }) => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate) // you’re persisting the store
  app.use(pinia)

  // handy for debugging in the console
  if (import.meta.env.DEV) {
    window.$pinia = pinia
  }
})
