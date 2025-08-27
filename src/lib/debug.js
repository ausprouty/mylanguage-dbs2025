// src/lib/debug.js
// Lightweight namespaced logger with runtime enable toggles.
// Enable patterns via:
//   - VITE_DEBUG="*" or "Interface*,Menu,Service:poll"
//   - localStorage.DEBUG = "InterfaceService*"
//   - ?debug=InterfaceService* in the URL

const DEV = import.meta.env.DEV;

function globToRegex(glob) {
  // "Interface*" -> /^Interface.*$/i ; allow comma-separated list
  const parts = String(glob || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!parts.length) return null;
  const re = parts.map(p =>
    '^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'
  ).join('|');
  return new RegExp(re, 'i');
}

function currentPattern() {
  // precedence: ?debug=… > localStorage.DEBUG > VITE_DEBUG > DEV? '*' : ''
  try {
    const qp = new URL(location.href).searchParams.get('debug');
    if (qp) return qp;
  } catch {}
  try {
    if (typeof localStorage !== 'undefined') {
      const ls = localStorage.getItem('DEBUG');
      if (ls) return ls;
    }
  } catch {}
  if (import.meta.env.VITE_DEBUG) return String(import.meta.env.VITE_DEBUG);
  return DEV ? '*' : '';
}

let enabledRE = globToRegex(currentPattern());

export function setDebug(pattern = '') {
  try { localStorage.setItem('DEBUG', pattern); } catch {}
  enabledRE = globToRegex(pattern);
}

export function debug(ns) {
  const prefix = `[${ns}]`;
  const isOn = () => (enabledRE ? enabledRE.test(ns) : false);

  const mk = (method) => (...args) => { if (isOn()) console[method](prefix, ...args); };

  const d = mk('log');          // default fn: log
  d.log = mk('log');
  d.info = mk('info');
  d.warn = mk('warn');
  d.error = mk('error');
  d.group = mk('group');
  d.groupEnd = () => { if (isOn()) console.groupEnd(); };
  d.time = (label = '') => { if (isOn()) console.time(`${prefix} ${label}`); };
  d.timeEnd = (label = '') => { if (isOn()) console.timeEnd(`${prefix} ${label}`); };
  d.enabled = isOn;
  return d;
}
