/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { configure } from 'quasar/wrappers';
import path from 'node:path';

export default configure((ctx) => {
  return {
    vite: {
      test: {
        globals: true,
        environment: "jsdom",
      },
    },
    eslint: {
      // fix: true,
      // include: [],
      // exclude: [],
      // rawOptions: {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: ["axios", "localStorage", "i18n", "language-init"],
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ["app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons", // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      vueLoaderOptions: {
        runtimeCompiler: true, // Enable Vue runtime compiler for DBS
      },
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },
      chainWebpack: (chain) => {
        chain.module
          .rule("i18n-resource")
          .test(/\.(json5?|ya?ml)$/)
          .include.add(path.resolve(__dirname, "./src/i18n/languages"))
          .end()
          .type("javascript/auto")
          .use("i18n-resource")
          .loader("@intlify/vue-i18n-loader");
        chain.module
          .rule("i18n")
          .resourceQuery(/blockType=i18n/)
          .type("javascript/auto")
          .use("i18n")
          .loader("@intlify/vue-i18n-loader");
      },
      extendViteConf(viteConf) {
        viteConf.define = {
          ...viteConf.define,
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        };

        viteConf.resolve = {
          alias: {
            ...(viteConf.resolve?.alias || {}),
            "@": path.resolve(__dirname, "./src"), // Vite-style alias
          },
        };

        viteConf.css = {
          preprocessorOptions: {
            scss: {
              additionalData: `@import "@/css/quasar.variables.scss";`,
            },
          },
        };
      },
      env: {
        LEGACY_API: ctx.dev
          ? "http://localhost/mylanguage-namespaced/" // Legacy API in development
          : "https://api.mylanguage.net.au/", // Legacy API in production

        CURRENT_API: ctx.dev
          ? "http://localhost/api_mylanguage/" // Current API in development
          : "https://api2.mylanguage.net.au/", // Current API in production
      },

      vueRouterMode: "history", // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      // vitePlugins: [
      //   [ 'package-name', { ..options.. } ]
      // ]
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      port: ctx.mode.pwa ? 9200 : ctx.mode.ssr ? 9300 : 9100,
      proxy: {
        "/api_mylanguage": {
          target: "http://127.0.0.1:5559",
          changeOrigin: true,
        },
      },
      open: true, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //       components: [
      components: [
        "QLayout",
        "QHeader",
        "QDrawer",
        "QToolbar",
        "QToolbarTitle",
        "QPageContainer",
        "QPage",
        "QBtn",
        "QRow",
        "QCol",
        "QSpace",
      ],
      // directives: [],

      // Quasar plugins
      plugins: ["Notify", "Dialog"],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    // Disable PWA when not building for production
    pwa:
      process.env.NODE_ENV === "production"
        ? {
            workboxMode: "generateSW",
            injectPwaMetaTags: true,
            swFilename: "sw.js",
            manifestFilename: "manifest.json",
            useCredentialsForManifestTag: false,
            workboxOptions: {
              skipWaiting: true,
              clientsClaim: true,
              // ADD THIS LINE to suppress logs
              mode: "production",
            },
            manifest: {
              name: "Spiritual Community",
              short_name: "Discover Community",
              description: "Discover Spiritual Community",
              display: "standalone",
              orientation: "portrait",
              background_color: "#ffffff",
              theme_color: "#3e81ef",
              start_url: "/",
              scope: "/",
              icons: [
                {
                  src: "icons/icon-128x128.png",
                  sizes: "128x128",
                  type: "image/png",
                },
                {
                  src: "icons/icon-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "icons/icon-256x256.png",
                  sizes: "256x256",
                  type: "image/png",
                },
                {
                  src: "icons/icon-384x384.png",
                  sizes: "384x384",
                  type: "image/png",
                },
                {
                  src: "icons/icon-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
            },
          }
        : false,

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "mylanguage-admin",
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ["my-content-script"],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
