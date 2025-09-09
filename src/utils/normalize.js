import { unref } from 'vue'

// Pull first item if it's an array (common with route params)
export function pickFirst(v) {
  const r = unref(v)
  return Array.isArray(r) ? r[0] : r
}

// Normalize a string-ish id (study, HL codes, etc.)
export function normId(v) {
  const raw = pickFirst(v)
  const s = String(raw ?? '').trim()
  return s.toLowerCase() === 'undefined' ? '' : s
}

// Normalize numeric-like ids (JF codes, lesson numbers, positions)
export function normIntish(v) {
  const s = normId(v)
  if (!s) return ''
  const n = Number(s)
  return Number.isFinite(n) ? String(n) : s
}

// NEW: strict positive integer (returns number or undefined)
export function normPositiveInt(v) {
  const s = normId(v)
  if (!/^\d+$/.test(s)) return undefined
  const n = Number(s)
  return n > 0 ? n : undefined
}

// NEW: param-safe string ('' if missing/'undefined'/'null')
export function normParamStr(v) {
  const s = normId(v)
  if (!s) return ''
  if (s.toLowerCase() === 'null') return ''
  return s
}

// Optional helper for required params
export function assertRequired(obj, keys, where = 'function') {
  const missing = keys.filter(k => !normId(obj[k]))
  if (missing.length) {
    const msg = `Missing required: ${missing.join(', ')} in ${where}`
    throw new Error(msg)
  }
}

// if v is an object, pull a sensible identifier; otherwise return v
export function fromObjId(v, keys = ['slug','code','id','key','name','title']) {
  const raw = unref(v)
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]
      if (raw[k] !== undefined && raw[k] !== null &&
          String(raw[k]).trim() !== '') {
        return raw[k]
      }
    }
    return ''
  }
  return raw
}

// safe for URL path segments
export function normPathSeg(v) {
  return encodeURIComponent(normId(fromObjId(v)))
}

// For comparing keys like series names/IDs consistently
export function normKey(v) {
  return normId(fromObjId(v)).replace(/[\s_-]+/g, '').toLowerCase()
}

// Basic object guards (useful in loaders/mergers)
export const isObj = v => v && typeof v === 'object' && !Array.isArray(v)
export const safeObj = v => (isObj(v) ? v : {})
export const safeKeys = o => (isObj(o) ? Object.keys(o) : [])

// Join a base path and a relative path cleanly
export function withBase(base, path = '') {
  const b = String(base || '/').replace(/\/+$/, '/')
  const p = String(path || '').replace(/^\/+/, '')
  return b + p
}

// Turn “true/1/yes/on” and “false/0/no/off” into booleans
export function normBoolish(v, def = false) {
  const s = normId(v)
  if (!s) return def
  if (/^(true|1|yes|y|on)$/i.test(s)) return true
  if (/^(false|0|no|n|off)$/i.test(s)) return false
  return def
}
