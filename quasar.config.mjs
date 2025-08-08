/* eslint-env node */
import { configure } from 'quasar/wrappers';
import path from 'node:path';

export default configure((ctx) => {
  const site = process.env.SITE || 'default';

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
      vueLoaderOptions: { runtimeCompiler: true },
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16',
      },

      // unique output folder per site
      distDir: `dist/site-${site}`,

      // set base/publicPath per site (affects asset URLs)
      publicPath: base,

      chainWebpack: (chain) => {
        chain.module
          .rule('i18n-resource')
          .test(/\.(json5?|ya?ml)$/)
          .include.add(path.resolve(__dirname, './src/i18n/languages'))
          .end()
          .type('javascript/auto')
          .use('i18n-resource')
          .loader('@intlify/vue-i18n-loader');

        chain.module
          .rule('i18n')
          .resourceQuery(/blockType=i18n/)
          .type('javascript/auto')
          .use('i18n')
          .loader('@intlify/vue-i18n-loader');
      },

      extendViteConf(viteConf) {
        // per-site public folder (prevents copying all sites’ assets)
        viteConf.publicDir = path.resolve(__dirname, `public-${site}`);

        // define flags
        viteConf.define = {
          ...viteConf.define,
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        };

        // aliases
        const alias = (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...alias,
            '@': path.resolve(__dirname, './src'),
            '@site': path.resolve(__dirname, `src/sites/${site}`),
          },
        };

        // global SCSS variables
        viteConf.css = {
          preprocessorOptions: {
            scss: {
              additionalData: `@import "@/css/quasar.variables.scss";`,
            },
          },
        };
      },

      // expose env to app code (both Quasar-style and Vite-style)
      env: {
        SITE_KEY: site,
        VITE_SITE_KEY: site,

        LEGACY_API: ctx.dev
          ? 'http://localhost/mylanguage-namespaced/'
          : 'https://api.mylanguage.net.au/',
        VITE_LEGACY_API: ctx.dev
          ? 'http://localhost/mylanguage-namespaced/'
          : 'https://api.mylanguage.net.au/',

        CURRENT_API: ctx.dev
          ? 'http://localhost/api_mylanguage/'
          : 'https://api2.mylanguage.net.au/',
        VITE_CURRENT_API: ctx.dev
          ? 'http://localhost/api_mylanguage/'
          : 'https://api2.mylanguage.net.au/',
      },

      vueRouterMode: 'history',
      rebuildCache: true,
    },

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
    // PWA (prod only)
    // ---------------------------
    pwa:
      process.env.NODE_ENV === 'production'
        ? {
            workboxMode: 'generateSW',
            injectPwaMetaTags: true,

            // Unique filenames per site (avoid SW/manifest collisions)
            swFilename: `sw-${site}.js`,
            manifestFilename: `manifest-${site}.json`,

            useCredentialsForManifestTag: false,
            workboxOptions: {
              skipWaiting: true,
              clientsClaim: true,
              mode: 'production',
            },
            manifest: {
              name: siteManifest.name || 'App',
              short_name: siteManifest.short_name || 'App',
              description: siteManifest.description || '',
              display: 'standalone',
              orientation: 'portrait',
              background_color: '#ffffff',
              theme_color: siteManifest.theme_color || '#3e81ef',

              // align with base/publicPath
              start_url: base,
              scope: base,

              // icons should live under public-<site>/icons
              icons: [
                { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
                { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
                { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
                { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
              ],
            },
          }
        : false,

    // ---------------------------
    // Capacitor / Electron / BEX
    // ---------------------------
    capacitor: { hideSplashscreen: true },
    electron: { inspectPort: 5858, bundler: 'packager', builder: { appId: 'mylanguage-admin' } },
    bex: { contentScripts: ['my-content-script'] },
  };
});
