/* eslint-env node */
import { configure } from 'quasar/wrappers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default configure((ctx) => {
  const site = process.env.SITE || process.env.VITE_APP || 'default';

  // Load per-site meta
  const metaPath = path.resolve(__dirname, `src/sites/${site}/meta.json`);
  const meta = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    : {};

  const base = meta.base ?? '/';

  // Variables file pick per-site vars or fallback
  const varsCandidate = meta.varsPath ?? `src/sites/${site}/quasar.variables.scss`;
  const varsRel = fs.existsSync(path.resolve(__dirname, varsCandidate))
    ? varsCandidate
    : 'src/css/quasar.variables.scss';
  console.log('scssVariables:', varsRel);


  // Public dir: candidate + resolved fallback
  const candidatePublicDir = path.resolve(
    __dirname,
    meta.publicDir ?? `public-${site}`
  );
  const publicDir = fs.existsSync(candidatePublicDir)
    ? candidatePublicDir
    : path.resolve(__dirname, 'public');

  // Dev server settings
  const defaultDevPort = ctx.mode.pwa ? 9200 : ctx.mode.ssr ? 9300 : 9100;
  const dev = {
    host: meta.dev?.host ?? 'localhost',
    port: meta.dev?.port ?? defaultDevPort,
    https: !!meta.dev?.https
  };

  // Logs
  const metaExists = fs.existsSync(metaPath);
  console.group('▶ Build context');
  console.log('site:', site);
  console.log('meta:', metaExists ? metaPath : '(none; using defaults)');
  console.log('base:', base);

  console.log('publicDir (candidate):', candidatePublicDir);
  console.log('publicDir (resolved):', publicDir);
  console.log('dev:', dev);
  console.groupEnd();

  return {
    boot: ['i18n', 'localStorage', 'axios', 'language-init', 'version-check', 'route-resume'],
    css: ['app.scss'],
    extras: [
        'material-icons',      // for icon="menu"
        // OR 'material-icons-round'
        // OR 'mdi-v7' (then use icon="mdi-menu")
    ],
    framework: {
      config: {},
      iconSet: 'material-icons', // optional; controls Quasar’s internal icons
      plugins: ['Notify', 'Dialog']
    },

    build: {
      env: { VITE_APP: site, VITE_SITE_KEY: site },
      vueRouterMode: 'history',
      distDir: `dist/site-${site}`,
      publicPath: base,
      scssVariables: varsRel,

      extendViteConf(viteConf) {
        viteConf.publicDir = publicDir;

        viteConf.define = {
          ...viteConf.define,
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
          __SITE__: JSON.stringify(site)
        };

        const existingAlias =
          (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...existingAlias,
            '@': path.resolve(__dirname, './src'),
            '@site': path.resolve(__dirname, `src/sites/${site}`)
          }
        };
      }
    },

    // Each site gets its own origin in dev
    devServer: {
      host: dev.host,
      port: dev.port,
      https: dev.https,
      strictPort: true,
      proxy: {
        '/api_mylanguage': {
          target: 'http://127.0.0.1:5559',
          changeOrigin: true
        }
      },
      open: true
    },



    pwa: {
      workboxMode: 'InjectManifest',
      swSrc: 'src-pwa/custom-service-worker.js',
      manifest: {
        name: meta.pwa?.name ?? 'App',
        short_name: meta.pwa?.short_name ?? 'App',
        description: meta.pwa?.description ?? '',
        display: meta.pwa?.display ?? 'standalone',
        orientation: meta.pwa?.orientation ?? 'portrait',
        background_color: meta.pwa?.background_color ?? '#ffffff',
        theme_color: meta.pwa?.theme_color ?? '#3e81ef',
        start_url: meta.pwa?.start_url ?? base,
        scope: meta.pwa?.scope ?? base,
        icons: meta.pwa?.icons ?? [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }
  };
});
