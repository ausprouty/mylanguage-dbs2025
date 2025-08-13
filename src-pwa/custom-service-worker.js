/* eslint-env serviceworker */

import { clientsClaim } from 'workbox-core'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

self.skipWaiting()
clientsClaim()

// In dev with InjectManifest, __WB_MANIFEST can be empty.
// Using "|| []" is harmless in prod and prevents crashes in dev.
precacheAndRoute(self.__WB_MANIFEST || [])
cleanupOutdatedCaches()

// Build an index.html path that respects the SW scope (handles non-root base paths)
function scopedIndexUrl () {
  const scopePath = new URL(self.registration.scope).pathname
  return (scopePath.endsWith('/') ? scopePath : scopePath + '/') + 'index.html'
}

// Only register the SPA fallback if index.html is actually precached.
// In dev it often isn't, which caused your "non-precached-url" error.
try {
  const handler = createHandlerBoundToURL(scopedIndexUrl())
  const navRoute = new NavigationRoute(handler, {
    // don't fall back for APIs and static files
    denylist: [
      /^\/api/i,
      /\/_/,                                // vite internal, etc.
      /\.(?:json|txt|xml|map)$/i,
      /\.(?:png|jpe?g|gif|webp|svg|ico)$/i,
      /\.(?:css|js|mjs|wasm)$/i,
      /sw\.js$/i,
      /workbox-(?:.*)\.js$/i
    ]
  })
  registerRoute(navRoute)
} catch (e) {
  // In dev, index.html may not be in the precache. Skip the SPA fallback to avoid the error.
}
