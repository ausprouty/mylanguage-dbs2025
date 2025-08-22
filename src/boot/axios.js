// boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

const API_TARGET = (import.meta.env.VITE_API || 'https://api2.mylanguage.net.au')
  .replace(/\/+$/, '')

// Use absolute base in production; relative (proxy) in dev
const BASE_URL = import.meta.env.DEV ? '/api' : `${API_TARGET}/api`

export const currentApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json, text/plain, */*' }
})

// Normalize relative paths; leave absolute URLs alone
currentApi.interceptors.request.use(cfg => {
  const u = String(cfg.url || '')
  if (!/^https?:\/\//i.test(u)) cfg.url = `/${u.replace(/^\/+/, '')}`
  return cfg
})

currentApi.interceptors.response.use(
  r => r,
  err => Promise.reject(err)
)

export default boot(({ app }) => {
  app.config.globalProperties.$currentApi = currentApi
  // Log at runtime so we can verify in production too
  // (safe: only prints baseURL, not secrets)
  console.log('Axios baseURL:', currentApi.defaults.baseURL)
})

