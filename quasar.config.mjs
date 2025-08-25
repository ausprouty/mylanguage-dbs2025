// quasar.config.mjs
import { configure } from 'quasar/wrappers'
import { loadEnv } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// ---------- small helpers ----------
const exists = p => fs.existsSync(path.join(ROOT, p))
const presentEnvFiles = mode => [
  '.env',
  '.env.local',
  `.env.${mode}`,
  `.env.${mode}.local`,
].filter(exists)

function cleanUrl(v) {
  if (!v) return ''
  let x = String(v)
  x = x.replace(/^["']|["']$/g, '')     // strip quotes
       .replace(/\s*[#;].*$/, '')       // drop inline comments
       .trim()
  return x.replace(/\/+$/, '')          // drop trailing slashes
}
function asOrigin(s) {
  try {
    const u = new URL(s)
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.origin : ''
  } catch { return '' }
}

// ---------- main export ----------
export default configure((ctx) => {
  // site key used by your project structure
  const site = process.env.SITE || 'dbs'

  // Base mode = dev/prod; Site mode = uom/wsu/... (optional)
  const baseMode = ctx.dev ? 'development' : 'production'
  // You can pass V_MODE=uom in your scripts; fallback to SITE for convenience
  const siteMode = process.env.V_MODE || process.env.SITE || ''

  // Load both layers explicitly, so we can merge + log clearly.
  // loadEnv() already includes .env + .env.<mode>(.local) automatically.
  const envBase = loadEnv(baseMode, ROOT, '')
  const envSite = siteMode ? loadEnv(siteMode, ROOT, '') : {}
  // Site overrides base
  const envAll  = { ...envBase, ...envSite }

  // Resolve API origin from merged env, with safe fallbacks
  const apiFromEnv = asOrigin(cleanUrl(envAll.VITE_API))
  const apiFallback = ctx.dev
    ? 'http://localhost:5173' // change if your dev API is elsewhere
    : 'https://api2.mylanguage.net.au'
  const apiOrigin = apiFromEnv || apiFallback

  // Optional: per-site public dir (public-uom → else public)
  const publicDir = exists(`public-${site}`) ? `public-${site}` : 'public'

  // Optional: per-site SCSS variables path
  const scssVarsPath = `src/sites/${site}/quasar.variables.scss`
  const hasScssVars = exists(scssVarsPath)

  // Optional: per-site meta.json (for base path, etc.)
  const metaPath = path.join(ROOT, `src/sites/${site}/meta.json`)
  const meta = exists(`src/sites/${site}/meta.json`)
    ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    : {}
  const base = meta.base || '/'

  // ---------- friendly build logs ----------
  console.log('▶ Env resolution')
  console.log('  site:', site)
  console.log('  baseMode:', baseMode, 'siteMode:', siteMode || '(none)')
  console.log('  present (base):',
    presentEnvFiles(baseMode).join(', ') || '(none)')
  console.log('  present (site):',
    (siteMode && presentEnvFiles(siteMode).join(', ')) || '(none)')
  console.log('  VITE_API from baseMode:',
    cleanUrl(envBase.VITE_API) || '(empty)')
  console.log('  VITE_API from siteMode:',
    cleanUrl(envSite.VITE_API) || '(empty)')
  console.log('  → Effective VITE_API:', apiOrigin)
  console.log('  publicDir:', publicDir)
  console.log('  meta.json:', exists(`src/sites/${site}/meta.json`) ? metaPath : '(none)')
  console.log('  base:', base)
  if (hasScssVars) console.log('  scssVariables:', scssVarsPath)

  return {
    // Where Quasar copies static assets from
    sourceFiles: {
      // leave defaults unless you have custom index/template locations
    },

    // Per-site public assets (optional)
    // (Quasar accepts "public" path via vite.publicDir)
    // Use extendViteConf to set it.
    build: {
      vueRouterMode: 'history',
      publicPath: base, // keep consistent with your hosting path
      // any other build options you already use…
      extendViteConf(viteConf) {
        // Public dir
        viteConf.publicDir = publicDir

        // Ensure the client bundle sees the merged env values
        viteConf.define = {
          ...(viteConf.define || {}),
          'import.meta.env.MODE': JSON.stringify(baseMode),
          'import.meta.env.SITE': JSON.stringify(site),
          'import.meta.env.VITE_API': JSON.stringify(apiOrigin),
        }

        // Per-site SCSS variables (optional)
        if (hasScssVars) {
          viteConf.css = viteConf.css || {}
          viteConf.css.preprocessorOptions = {
            ...(viteConf.css.preprocessorOptions || {}),
            scss: {
              ...(viteConf.css.preprocessorOptions?.scss || {}),
              additionalData:
                `@use "${scssVarsPath.replace(/\\/g, '/')}" as *;`
            }
          }
        }

        // --- NEW: aliases so @site/meta.json resolves ---
        viteConf.resolve = {
          ...(viteConf.resolve || {}),
          alias: {
            ...(viteConf.resolve?.alias || {}),
            '@': path.resolve(ROOT, 'src'),
            '@site': path.resolve(ROOT, `src/sites/${site}`),
            '@sites': path.resolve(ROOT, 'src/sites'),
          },
        }

        // Inject (or update) <meta name="api-origin" ...> into index.html
        viteConf.plugins = [
          ...(viteConf.plugins || []),
          {
            name: 'inject-api-origin-meta',
            enforce: 'pre',
            transformIndexHtml(html) {
              const tag = `<meta name="api-origin" content="${apiOrigin}">`
              return html.includes('name="api-origin"')
                ? html.replace(/<meta[^>]*name="api-origin"[^>]*>/, tag)
                : html.replace('<head>', `<head>\n    ${tag}`)
            }
          }
        ]
      }
    },

    // Dev server: keep your /api proxy if you use it
    devServer: {
      host: 'localhost',
      port: meta?.dev?.port || 9232,
      https: !!meta?.dev?.https,
      open: true,
      proxy: {
        // forward /api to the chosen API origin in dev
        '^/api(/|$)': {
          target: `${apiOrigin}/api`,
          changeOrigin: true,
          secure: true,
          rewrite: p => p, // keep /api
        }
      }
    },

    framework: {
      // keep your usual Quasar plugins here if needed
      plugins: []
    }
  }
})
