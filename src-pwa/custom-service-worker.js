/* eslint-env serviceworker */

import {clientsClaim} from 'workbox-core'
import {enable as enableNavigationPreload} from 'workbox-navigation-preload'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL
} from 'workbox-precaching'
import {registerRoute, NavigationRoute} from 'workbox-routing'
import {StaleWhileRevalidate, NetworkFirst} from 'workbox-strategies'
import {CacheableResponsePlugin} from 'workbox-cacheable-response'

// --- Activation strategy ---
self.skipWaiting()
clientsClaim()
enableNavigationPreload()

// --- Precache ---
precacheAndRoute(self.__WB_MANIFEST || [], {
  ignoreURLParametersMatching: [/^v$/, /^__WB_REVISION__$/]
})
cleanupOutdatedCaches()

// --- SPA fallback aware of non-root base path ---
const scopePath = new URL(self.registration.scope).pathname
const indexURL = (scopePath.endsWith('/') ? scopePath : scopePath + '/') + 'index.html'

try {
  const handler = createHandlerBoundToURL(indexURL)
  registerRoute(new NavigationRoute(handler, {
    denylist: [
      new RegExp(`^${scopePath}api/`, 'i'), // don’t hijack API navigations
      new RegExp(`^${scopePath}_/`),        // typical Next/Quasar pattern
      /\/[^/?]+\.[^/]+$/i,                  // any “/file.ext”
      /service-worker\.js$/i,
      /sw\.js$/i,
      /workbox-(?:.*)\.js$/i
    ]
  }))
} catch (_) {
  // In dev, index.html might not be precached; skip SPA fallback.
}

// --- Runtime caching (site-aware cache names) ---
const scopeSlug = scopePath.replace(/[^\w-]+/g, '_')

// Interface JSON: fast + updates in background, ignore Vary: Origin
const interfacePrefix = (scopePath.endsWith('/') ? scopePath : scopePath + '/') + 'interface/'
const interfaceHandler = new StaleWhileRevalidate({
  cacheName: 'interface-cache',                 // or `interface-${scopeSlug}`
  matchOptions: { ignoreVary: true },
  plugins: [ new CacheableResponsePlugin({ statuses: [0, 200] }) ],
})
registerRoute(({url}) => url.pathname.startsWith(interfacePrefix), interfaceHandler)

// API: prefer network, cache fallback if slow/offline
registerRoute(
  ({url}) => url.pathname.startsWith(`${scopePath}api/`),
  new NetworkFirst({
    cacheName: `api-${scopeSlug}`,
    networkTimeoutSeconds: 4,
    plugins: [ new CacheableResponsePlugin({ statuses: [0, 200] }) ]
  })
)

/* Optional controlled updates:
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
*/
