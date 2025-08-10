/* eslint-env node */
import { configure } from 'quasar/wrappers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default configure((ctx) => {
  const site = process.env.SITE || process.env.VITE_APP || 'default';

  // ---- Load per-site meta (single source of truth)
  const metaPath = path.resolve(__dirname, `src/sites/${site}/meta.json`);
  const meta = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    : {};

  // Base path (fallback '/')
  const base = meta.base ?? '/';

  // Variables file (fallback to global)
  const varsPath = meta.varsPath ?? `src/sites/${site}/quasar.variables.scss`;
  const varsFile = fs.existsSync(path.resolve(__dirname, varsPath))
    ? path.resolve(__dirname, varsPath)
    : path.resolve(__dirname, 'src/css/quasar.variables.scss');

  // Public dir (fallback per-site folder or default ./public)
  const publicDir = path.resolve(__dirname, meta.publicDir ?? `public-${site}`);
  const publicDirExists = fs.existsSync(publicDir);
  const finalPublicDir = publicDirExists ? publicDir : path.resolve(__dirname, 'public');

  console.log('▶ site:', site);
  console.log('▶ meta:', publicDirExists ? metaPath : '(no meta/public dir fallback)');
  console.log('▶ vars:', varsFile);
  console.log('▶ base:', base);
  console.log('▶ publicDir:', finalPublicDir);

  return {
    // ---------------------------
    // Test / Lint
    // ---------------------------
    vite: { test: { globals: true, environment: 'jsdom' } },
    eslint: { warnings: true, errors: true },

    // ---------------------------
    // Boot / CSS / Extras
    // ---------------------------
    boot: ['axios', 'localStorage', 'i18n', 'language-init', 'version-check'],
    css: ['app.scss'],
    extras: ['roboto-font', 'material-icons'],

    // ---------------------------
    // Build
    // ---------------------------
    build: {
      env: { VITE_APP: site, VITE_SITE_KEY: site },
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node18'
      },
      vueRouterMode: 'history',

      distDir: `dist/site-${site}`,
      publicPath: base,

      // Key: compile Quasar with the site-specific variables
      sassVariables: varsFile,

      extendViteConf(viteConf) {
        // per-site public folder
        viteConf.publicDir = finalPublicDir;

        // flags & aliases
        viteConf.define = {
          ...viteConf.define,
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
        };

        const existingAlias = (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...existingAlias,
            '@': path.resolve(__dirname, './src'),
            '@site': path.resolve(__dirname, `src/sites/${site}`)
          }
        };

        // Do NOT inject variables via additionalData anymore
      }
    },

    // ---------------------------
    // Dev server
    // ---------------------------
    devServer: {
      port: ctx.mode.pwa ? 9200 : ctx.mode.ssr ? 9300 : 9100,
      proxy: {
        '/api_mylanguage': { target: 'http://127.0.0.1:5559', changeOrigin: true }
      },
      open: true
    },

    // ---------------------------
    // Framework
    // ---------------------------
    framework: {
      config: {},
      plugins: ['Notify', 'Dialog'],
    },

    animations: [],

    // ---------------------------
    // SSR
    // ---------------------------
    ssr: { pwa: false, prodPort: 3000, middlewares: ['render'] },

    // ---------------------------
    // PWA
    // ---------------------------
    pwa: {
      workboxMode: 'InjectManifest',
      swSrc: 'src-pwa/custom-service-worker.js',
      manifest: {
        name:        meta.pwa?.name        ?? 'App',
        short_name:  meta.pwa?.short_name  ?? 'App',
        description: meta.pwa?.description ?? '',
        display:     meta.pwa?.display     ?? 'standalone',
        orientation: meta.pwa?.orientation ?? 'portrait',
        background_color: meta.pwa?.background_color ?? '#ffffff',
        theme_color: meta.pwa?.theme_color ?? '#3e81ef',
        start_url: meta.pwa?.start_url ?? base,
        scope:     meta.pwa?.scope     ?? base,
        icons: meta.pwa?.icons ?? [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    },

    capacitor: { hideSplashscreen: true },
    electron: { inspectPort: 5858, bundler: 'packager', builder: { appId: 'mylanguage-admin' } },
    bex: { contentScripts: ['my-content-script'] }
  };
});
