
/* eslint-env node */
import { configure } from 'quasar/wrappers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ESM-safe __dirname for this config file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default configure((ctx) => {

  const site = process.env.SITE || process.env.VITE_APP || 'default';
  // If you deploy sites under subpaths, set them here (otherwise leave '/')
  const baseBySite = {
    default: '/',
    dbs: '/',
    uom: '/',
    guru: '/',
    wisdom: '/',
    uws: '/',
  };
  const base = baseBySite[site] ?? '/';

  // Per-site PWA metadata
  const siteManifest = {
    dbs: {
      name: 'Discover Bible Study',
      short_name: 'DBS',
      description: 'Start discovery groups easily.',
      theme_color: '#009da5',
    },
    uom: {
      name: 'UOM',
      short_name: 'UOM',
      description: 'Site-specific experience for UOM.',
      theme_color: '#3c6e89',
    },
    guru: {
      name: 'Guru',
      short_name: 'Guru',
      description: 'Guides, teachings, and resources.',
      theme_color: '#f38b3c',
    },
    wisdom: {
      name: 'Wisdom',
      short_name: 'Wisdom',
      description: 'Grow in wisdom and community.',
      theme_color: '#65c058',
    },
    uws: {
      name: 'UWS',
      short_name: 'UWS',
      description: 'Site-specific experience for UWS.',
      theme_color: '#3f5864',
    },
    default: {
      name: 'Spiritual Community',
      short_name: 'Discover Community',
      description: 'Discover Spiritual Community',
      theme_color: '#3e81ef',
    },
  }[site] || {};

  return {
    // ---------------------------
    // Test / Lint
    // ---------------------------
    vite: {
      test: { globals: true, environment: 'jsdom' },
    },
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
      env: {
        VITE_APP: site,
        VITE_SITE_KEY: site
      },
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node18'
      },
      vueRouterMode: 'history',

      // ✅ these live INSIDE build
      distDir: `dist/site-${site}`,
      publicPath: base,

      // Vite hook (webpack's chainWebpack does NOT exist here)
      extendViteConf(viteConf) {
        // per-site public folder
        viteConf.publicDir = path.resolve(__dirname, `public-${site}`);

        // flags, aliases, css, etc.
        viteConf.define = {
          ...viteConf.define,
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
        };

        const alias = (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...alias,
            '@': path.resolve(__dirname, './src'),
            '@site': path.resolve(__dirname, `src/sites/${site}`)
          }
        };

        viteConf.css = {
          preprocessorOptions: {
            scss: { additionalData: `@import "@/css/quasar.variables.scss";` }
          }
        };

        // If you previously used chainWebpack for i18n loaders,
        // use the Vite plugin instead:
        // import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
        // viteConf.plugins = [...(viteConf.plugins || []),
        //   VueI18nPlugin({ include: path.resolve(__dirname, './src/i18n/languages/**') })
        // ];
      }
    }, // ← build ENDS here 👈

    // ---------------------------
    // Dev server
    // ---------------------------
    devServer: {
      port: ctx.mode.pwa ? 9200 : ctx.mode.ssr ? 9300 : 9100,
      proxy: {
        '/api_mylanguage': {
          target: 'http://127.0.0.1:5559',
          changeOrigin: true,
        },
      },
      open: true,
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
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: ['render'],
    },

    // ---------------------------
    // PWA
    // ---------------------------

  pwa: {

    workboxMode: 'InjectManifest',
    swSrc: 'src-pwa/custom-service-worker.js',


    manifest: {
      name: siteManifest.name || 'App',
      short_name: siteManifest.short_name || 'App',
      description: siteManifest.description || '',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ffffff',
      theme_color: siteManifest.theme_color || '#3e81ef',

      start_url: base,
      scope: base,

      icons: [
        { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/icon-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: 'icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]

    },
  },

  // ---------------------------
  capacitor: { hideSplashscreen: true },
  electron: { inspectPort: 5858, bundler: 'packager', builder: { appId: 'mylanguage-admin' } },
  bex: { contentScripts: ['my-content-script'] },
  };
});
