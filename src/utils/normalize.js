import { unref } from 'vue'

// Normalize a string-ish id (study, HL codes, etc.)
// - Accepts refs or plain values
// - Trims
// - Treats literal "undefined" as empty
export function normId(v) {
  const s = String(unref(v) ?? '').trim()
  return s.toLowerCase() === 'undefined' ? '' : s
}

// Normalize numeric-like ids (JF codes, lesson numbers, positions)
// - Returns a string numeric if possible, else the trimmed string
export function normIntish(v) {
  const s = normId(v)
  if (!s) return ''
  const n = Number(s)
  return Number.isFinite(n) ? String(n) : s
}

// Optional helper for required params
export function assertRequired(obj, keys, where = 'function') {
  const missing = keys.filter(k => !normId(obj[k]))
  if (missing.length) {
    const msg = `Missing required: ${missing.join(', ')} in ${where}`
    // Throw or console.error based on your preference
    throw new Error(msg)
  }
}

// if v is an object, pull a sensible identifier; otherwise return v
export function fromObjId(v, keys = ['slug','code','id','key','name','title']) {
  const raw = unref(v);
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (raw[k] !== undefined && raw[k] !== null && String(raw[k]).trim() !== '') {
        return raw[k];
      }
    }
    return '';
  }
  return raw;
}

// safe for URL path segments
export function normPathSeg(v) {
  return encodeURIComponent(normId(fromObjId(v)));
}
