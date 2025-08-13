// boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

const currentBase = import.meta.env.VITE_CURRENT_API || '/api_mylanguage'
const legacyBase  = import.meta.env.VITE_LEGACY_API || ''

export const currentApi = axios.create({ baseURL: currentBase })
export const legacyApi  = axios.create({ baseURL: legacyBase })

export default boot(({ app }) => {
  app.config.globalProperties.$currentApi = currentApi
  app.config.globalProperties.$legacyApi  = legacyApi
  console.log('Axios bases:', { currentBase, legacyBase, mode: import.meta.env.MODE })
})
