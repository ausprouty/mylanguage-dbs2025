// boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

const RAW_TARGET = (import.meta.env.VITE_API || 'https://api2.mylanguage.net.au');
const API_TARGET = String(RAW_TARGET).replace(/\/+$/, '');

// Use absolute base in production; relative (proxy) in dev
const BASE_URL = import.meta.env.DEV ? '/api' : API_TARGET + '/api';

// Optional second token from build-time env
const STATIC_API_KEY = String(import.meta.env.VITE_API_KEY || '').trim();

// Simple id generator for request tracing
function rid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Minimal backoff (ms)
function backoff(attempt) {
  const base = 250; // 0.25s
  const max = 2000; // 2s
  const t = base * Math.pow(2, attempt);
  return Math.min(t, max);
}

export const currentApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json, text/plain, */*' },
  // Only treat 2xx as success; keep defaults otherwise
})

// Request interceptor
currentApi.interceptors.request.use(cfg => {
  // Normalize URL: leave absolute URLs alone, fix relative ones
  const u = String(cfg.url || '');
  if (!/^https?:\/\//i.test(u)) {
    cfg.url = '/' + u.replace(/^\/+/, '');
  }

  // Attach correlation id
  cfg.headers['X-Request-Id'] = rid();

  // Add both tokens if available
  try {
    if (STATIC_API_KEY) {
      cfg.headers['X-API-Key'] = STATIC_API_KEY;
    }
  } catch (_) {}

  try {
    // Example local token names; adjust to your app
    const bearer = localStorage.getItem('auth_token') || '';
    if (bearer) cfg.headers['Authorization'] = 'Bearer ' + bearer;

    // If you also keep a second token in storage:
    const second = localStorage.getItem('second_token') || '';
    if (second) cfg.headers['X-Second-Token'] = second;
  } catch (_) {}

  // If you need cookies for same-site APIs:
  // cfg.withCredentials = true;

  return cfg;
});

// Response interceptor with light retry + 401 handling
currentApi.interceptors.response.use(
  function onOk(r) { return r; },
  async function onErr(err) {
    // Axios error anatomy can vary; guard access
    const cfg = err && err.config ? err.config : null;

    // Central 401 handling (e.g., clear auth and send to login)
    try {
      const status = err && err.response ? err.response.status : 0;
      if (status === 401) {
        // Optional: broadcast or update your store here
        // e.g., useSettingsStore().logout();
        // For now: just reject
        return Promise.reject(err);
      }
    } catch (_) {}

    // Retry only idempotent GETs on transient problems
    const method = cfg && cfg.method ? cfg.method.toUpperCase() : '';
    const isGet = method === 'GET';

    const status = err && err.response ? err.response.status : 0;
    const is5xx = status >= 500 && status <= 599;
    const isTimeout = err && err.code === 'ECONNABORTED';
    const noResponse = err && !err.response; // network error, DNS, CORS preflight fail, etc.

    if (cfg && isGet && (is5xx || isTimeout || noResponse)) {
      // Limit retries
      var count = typeof cfg.__retryCount === 'number' ? cfg.__retryCount : 0;
      var limit = 2; // do up to 2 retries (total 3 tries)
      if (count < limit) {
        cfg.__retryCount = count + 1;
        const delay = backoff(count);
        await new Promise(res => setTimeout(res, delay));
        return currentApi.request(cfg);
      }
    }

    return Promise.reject(err);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$currentApi = currentApi;
  // Log at runtime so we can verify in production too
  console.log('[Axios] baseURL:', currentApi.defaults.baseURL);
  if (STATIC_API_KEY) console.log('[Axios] API key present (header X-API-Key)');
});
