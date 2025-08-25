// boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

/* ---------- helpers ---------- */

function clean(val) {
  if (!val) return ''
  let v = String(val)
  v = v.replace(/^["']|["']$/g, '')      // strip surrounding quotes
  v = v.replace(/\s*[#;].*$/, '')        // strip inline comments
  v = v.trim().replace(/\/+$/, '')       // trim + drop trailing slash
  return v
}

function asOrigin(urlStr) {
  try {
    const u = new URL(urlStr)
    return (u.protocol === 'https:' || u.protocol === 'http:')
      ? u.origin
      : ''
  } catch { return '' }
}

function discoverApiOrigin() {
  // 1) .env (mode-aware: .env, .env.production, .env.<mode>)
  const fromEnv = asOrigin(clean(import.meta.env.VITE_API))
  if (fromEnv) return fromEnv

  // 2) <meta name="api-origin" content="https://...">  (your index.html)
  try {
    const meta = document.querySelector('meta[name="api-origin"]')
    if (meta) {
      const m = asOrigin(clean(meta.getAttribute('content')))
      if (m) return m
    }
  } catch {}

  // 3) window.__API__ = 'https://...'
  try {
    if (typeof window !== 'undefined' && window.__API__) {
      const w = asOrigin(clean(window.__API__))
      if (w) return w
    }
  } catch {}

  return ''
}

/* ---------- decide base URL ---------- */

const PROD = !!import.meta.env.PROD
let API_ORIGIN = discoverApiOrigin()

// Final safety net in production: never fall back to localhost.
if (PROD && !API_ORIGIN) {
  API_ORIGIN = 'https://api2.mylanguage.net.au'
}

// Dev uses proxy; Prod must be absolute
const BASE_URL = PROD ? `${API_ORIGIN}/api` : '/api'

/* ---------- harden *all* axios usage ---------- */

/**
 * We configure BOTH:
 *  - the global default axios export (for code that does `import axios from`)
 *  - our own exported instance `currentApi`
 *
 * We also *sanitize* any request that tries to use localhost in PROD.
 */

// 1) Patch the global default axios
axios.defaults.baseURL = BASE_URL
axios.defaults.timeout = 15000
axios.defaults.headers.common['Accept'] =
  'application/json, text/plain, */*'

// Patch axios.create so instances inherit BASE_URL unless caller sets an
// absolute (https?://...) base. If caller sets localhost in PROD, override.
const __create = axios.create.bind(axios)
axios.create = function patchedCreate(cfg = {}) {
  const c = { ...cfg }
  const b = String(c.baseURL || '')
  const isAbs = /^https?:\/\//i.test(b)

  if (!isAbs) {
    c.baseURL = BASE_URL
  } else {
    try {
      const u = new URL(b)
      if (PROD && u.hostname === 'localhost') {
        c.baseURL = BASE_URL
      }
    } catch {}
  }

  // sensibly merge defaults
  c.timeout = c.timeout || axios.defaults.timeout
  c.headers = { Accept: axios.defaults.headers.common['Accept'],
                ...(c.headers || {}) }
  return __create(c)
}

// 2) Create our preferred instance
export const currentApi = axios.create()

/* ---------- request interceptor (global + instance) ---------- */

function installRequestGuards(ax) {
  ax.interceptors.request.use(cfg => {
    // Normalize relative URLs (keep absolute ones)
    const u = String(cfg.url || '')
    if (!/^https?:\/\//i.test(u)) {
      cfg.url = '/' + u.replace(/^\/+/, '')
    }

    // If *either* cfg.url or cfg.baseURL points at localhost in PROD,
    // rewrite to API_ORIGIN + /api.
    if (PROD) {
      try {
        // Check absolute url case (cfg.url)
        if (/^https?:\/\//i.test(cfg.url)) {
          const abs = new URL(cfg.url)
          if (abs.hostname === 'localhost') {
            cfg.url = BASE_URL + abs.pathname + abs.search + abs.hash
          }
        }
      } catch {}
      try {
        // Check baseURL case
        if (cfg.baseURL) {
          const b = new URL(cfg.baseURL)
          if (b.hostname === 'localhost') {
            cfg.baseURL = BASE_URL
          }
        }
      } catch {}
    }

    // Correlation id
    const rid = Math.random().toString(36).slice(2) +
                Date.now().toString(36)
    cfg.headers['X-Request-Id'] = rid

    // Optional compile-time key
    const k = String(import.meta.env.VITE_API_KEY || '').trim()
    if (k) cfg.headers['X-API-Key'] = k

    // Runtime tokens
    try {
      const bearer = localStorage.getItem('auth_token') || ''
      if (bearer) cfg.headers['Authorization'] = 'Bearer ' + bearer
      const second = localStorage.getItem('second_token') || ''
      if (second) cfg.headers['X-Second-Token'] = second
    } catch {}

    // cfg.withCredentials = true // if needed
    return cfg
  })
}

installRequestGuards(axios)
installRequestGuards(currentApi)

/* ---------- response interceptor (gentle retry) ---------- */

function installResponseGuards(ax) {
  ax.interceptors.response.use(
    r => r,
    async err => {
      const cfg = err && err.config ? err.config : null
      const status = err && err.response ? err.response.status : 0
      if (status === 401) return Promise.reject(err)

      const method = (cfg && cfg.method ? cfg.method : '').toUpperCase()
      const isGet = method === 'GET'
      const is5xx = status >= 500 && status <= 599
      const isTimeout = err && err.code === 'ECONNABORTED'
      const noResp = err && !err.response

      if (cfg && isGet && (is5xx || isTimeout || noResp)) {
        const c = typeof cfg.__retryCount === 'number' ? cfg.__retryCount : 0
        if (c < 2) {
          cfg.__retryCount = c + 1
          const delay = Math.min(250 * Math.pow(2, c), 2000)
          await new Promise(res => setTimeout(res, delay))
          return ax.request(cfg)
        }
      }
      return Promise.reject(err)
    }
  )
}

installResponseGuards(axios)
installResponseGuards(currentApi)

/* ---------- quasar boot ---------- */

export default boot(({ app }) => {
  app.config.globalProperties.$currentApi = currentApi

  console.log('[Axios] PROD=', PROD)
  console.log('[Axios] VITE_API(raw)=', import.meta.env.VITE_API || '(none)')
  console.log('[Axios] meta api-origin=',
              document.querySelector('meta[name="api-origin"]')
                ?.getAttribute('content') || '(none)')
  console.log('[Axios] chosen origin=', API_ORIGIN || '(none)')
  console.log('[Axios] baseURL=', currentApi.defaults.baseURL)
})
