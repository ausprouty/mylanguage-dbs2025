/* eslint-env node */
import { configure } from "quasar/wrappers";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default configure((ctx) => {
  const site = process.env.SITE || process.env.VITE_APP || "dbs";

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

  // --- Determine API target (Node context) ---
  // Priority: env var → meta.json → sensible local default
  const rawViteApi =
    process.env.VITE_API ||
    envFromMeta.VITE_API ||
    "http://localhost/api_mylanguage";
  const apiTarget = rawViteApi.replace(/\/+$/, ""); // strip trailing slash

  // --- Per-site SCSS variables (required) ---
  const brandRel = `src/sites/${site}/quasar.variables.scss`;
  const brandAbs = path.resolve(__dirname, brandRel);
  if (!fs.existsSync(brandAbs)) {
    throw new Error(
      `Missing SCSS variables for site "${site}". Expected: ${brandRel}`
    );
  }

  // --- Public dir (per site, fallback to ./public) ---
  const publicDirCandidate =
    meta.publicDir != null
      ? path.resolve(__dirname, meta.publicDir)
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
  console.log("VITE_API (computed apiTarget):", apiTarget);
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

      // Make VITE_* available at build time (and add VITE_API explicitly)
      env: {
        ...envFromMeta,
        VITE_APP: site,
        VITE_SITE_KEY: site,
        VITE_API: apiTarget,
      },

      // Compile-time constants
      define: {
        __SITE_META__: JSON.stringify(meta),
      },

      extendViteConf(viteConf) {
        // Per-site cache & public folder
        viteConf.cacheDir = path.resolve(
          __dirname,
          `node_modules/.vite-${site}`
        );
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
        // Ensure VITE_API is visible to browser code too
        viteConf.define["import.meta.env.VITE_API"] = JSON.stringify(apiTarget);

        // Aliases
        const prev = (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...prev,
            "@": path.resolve(__dirname, "src"),
            "@site": path.resolve(__dirname, `src/sites/${site}`),
            // allows `@use "@brand"` in Sass
            "@brand": brandAbs,
          },
        };
      },
    },

    devServer: {
      host: dev.host,
      port: dev.port,
      https: dev.https,
      strictPort: true,
      proxy: {
        "^/api(/|$)": {
          target: apiTarget, // e.g. http://localhost/api_mylanguage
          changeOrigin: true,
          secure: false, // false since target is http://localhost
          // keep /api prefix unchanged so:
          //   /api/... -> {apiTarget}/api/...
          rewrite: (path) => path,
        },
      },
      open: true,
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
        icons:
          meta.pwa?.icons ?? [
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
