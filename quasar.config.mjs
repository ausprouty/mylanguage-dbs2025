/* eslint-env node */
import { configure } from "quasar/wrappers";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default configure((ctx) => {
  const site = process.env.SITE || process.env.VITE_APP || "dbs";

   const apiTarget = process.env.VITE_API;

  // --- Load per-site meta (optional) ---
  const metaPath = path.resolve(__dirname, `src/sites/${site}/meta.json`);
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    } catch (e) {
      console.warn(`[meta] Failed to parse ${metaPath}:`, e.message);
    }
  }

  const envFromMeta = Object.fromEntries(
    Object.entries(meta?.env || {}).filter(([k]) => k.startsWith("VITE_"))
  );
  const base = meta.base ?? "/";

  // --- Per-site SCSS variables file (single source of truth) ---
  const brandRel = `src/sites/${site}/quasar.variables.scss`;
  const brandAbs = path.resolve(__dirname, brandRel);
  if (!fs.existsSync(brandAbs)) {
    throw new Error(
      `Missing SCSS variables for site "${site}". Expected: ${brandRel}`
    );
  }

  // --- Public dir (per site, fallback to ./public) ---
  const publicDirCandidate =
    meta.publicDir != null ? path.resolve(__dirname, meta.publicDir)
                           : path.resolve(__dirname, `public-${site}`);
  const publicDir = fs.existsSync(publicDirCandidate)
    ? publicDirCandidate
    : path.resolve(__dirname, "public");

  // --- Dev server defaults ---
  const defaultDevPort = ctx.mode.pwa ? 9200 : ctx.mode.ssr ? 9300 : 9100;
  const dev = {
    host: meta.dev?.host ?? "localhost",
    port: meta.dev?.port ?? defaultDevPort,
    https: !!meta.dev?.https,
  };

  // Logs
  console.group("▶ Build context");
  console.log("site:", site);
  console.log("meta:", fs.existsSync(metaPath) ? metaPath : "(none; defaults)");
  console.log("base:", base);
  console.log("scssVariables:", brandRel);
  console.log("publicDir (resolved):", publicDir);
  console.log("dev:", dev);
  console.groupEnd();

  return {
    boot: [
      "i18n",
      "axios",
      "language-init",
      "brand-hydrate",
      "profile-hydrate",
      "menu-hydrate",
      "route-resume",
      "version-check",
    ],

    css: ["app.scss"],

    extras: ["material-icons"],

    framework: {
      config: {},
      iconSet: "material-icons",
      plugins: ["Notify", "Dialog"],
    },

    build: {
      vueRouterMode: "history",
      distDir: `dist/site-${site}`,
      publicPath: base,

      // Let Quasar (its own Sass) see your site variables
      scssVariables: brandRel,

      // Make VITE_* available at build time
      env: {
        ...envFromMeta,
        VITE_APP: site,
        VITE_SITE_KEY: site,
      },

      // Compile-time constants
      define: {
        __SITE_META__: JSON.stringify(meta),
      },

      extendViteConf(viteConf) {
        // Per-site cache & public folder
        viteConf.cacheDir = path.resolve(__dirname, `node_modules/.vite-${site}`);
        viteConf.publicDir = publicDir;

        // Safe merge for define
        viteConf.define ??= {};
        Object.assign(viteConf.define, {
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
          __SITE__: JSON.stringify(site),
          __SITE_META__: JSON.stringify(meta),
        });

        // Inject every VITE_* from meta into import.meta.env.*
        for (const [k, v] of Object.entries(envFromMeta)) {
          viteConf.define[`import.meta.env.${k}`] = JSON.stringify(v);
        }
        viteConf.define["import.meta.env.VITE_APP"] = JSON.stringify(site);
        viteConf.define["import.meta.env.VITE_SITE_KEY"] = JSON.stringify(site);

        // Aliases
        const prev = (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...prev,
            "@": path.resolve(__dirname, "src"),
            "@site": path.resolve(__dirname, `src/sites/${site}`),
            // IMPORTANT: allows `@use "@brand"` in Sass
            "@brand": brandAbs,
          },
        };
      },
    },



    devServer: {
      host: dev.host,     // typically "localhost" or "0.0.0.0"
      port: dev.port,     // your site’s dev port (e.g. 9224, 5173, etc.)
      https: dev.https,   // true/false, depending if you want HTTPS in dev
      strictPort: true,   // fail if port is taken (rather than fallback)
      proxy: {
        '^/api(/|$)': {
          target: apiTarget,      // from your VITE_API (https://api2.mylanguage.net.au)
          changeOrigin: true,     // sets Host header to match apiTarget
          secure: true,           // true since your API has a valid cert
          rewrite: path => path,  // keep /api prefix unchanged
        },
      },
      open: true,        // automatically open the browser
    },

    pwa: {
      workboxMode: "InjectManifest",
      swSrc: "src-pwa/custom-service-worker.js",
      manifest: {
        name: meta.pwa?.name ?? "App",
        short_name: meta.pwa?.short_name ?? "App",
        description: meta.pwa?.description ?? "",
        display: meta.pwa?.display ?? "standalone",
        orientation: meta.pwa?.orientation ?? "portrait",
        background_color: meta.pwa?.background_color ?? "#ffffff",
        theme_color: meta.pwa?.theme_color ?? "#3e81ef",
        start_url: meta.pwa?.start_url ?? base,
        scope: meta.pwa?.scope ?? base,
        icons: meta.pwa?.icons ?? [
          { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-192x192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icons/icon-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    },
  };
});
