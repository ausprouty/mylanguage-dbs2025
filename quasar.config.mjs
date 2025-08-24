/* eslint-env node */
import { configure } from "quasar/wrappers";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default configure((ctx) => {
  const site = process.env.SITE || process.env.VITE_APP || "dbs";

  // --- meta.json (optional) ---
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

  // --- API target ---
  const rawViteApi =
    process.env.VITE_API ||
    envFromMeta.VITE_API ||
    "http://localhost/api_mylanguage";
  const apiTarget = rawViteApi.replace(/\/+$/, "");

  // --- per-site SCSS variables (required) ---
  const brandRel = `src/sites/${site}/quasar.variables.scss`;
  const brandAbs = path.resolve(__dirname, brandRel);
  if (!fs.existsSync(brandAbs)) {
    throw new Error(
      `Missing SCSS variables for site "${site}". Expected: ${brandRel}`
    );
  }
  const scssInject = `@use "${brandRel}" as *;`;

  // --- public dir (per site, fallback ./public) ---
  const publicDirCandidate =
    meta.publicDir != null
      ? path.resolve(__dirname, meta.publicDir)
      : path.resolve(__dirname, `public-${site}`);
  const publicDir = fs.existsSync(publicDirCandidate)
    ? publicDirCandidate
    : path.resolve(__dirname, "public");

  // --- dev server defaults ---
  const defaultDevPort = ctx.mode.pwa ? 9200 : ctx.mode.ssr ? 9300 : 9100;
  const dev = {
    host: meta.dev?.host ?? "localhost",
    port: meta.dev?.port ?? defaultDevPort,
    https: !!meta.dev?.https,
  };

  console.group("▶ Build context");
  console.log("site:", site);
  console.log("meta:", fs.existsSync(metaPath) ? metaPath : "(none)");
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

    // Make every <style lang="scss"> see site vars ($accent, etc.)
    vite: {
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: scssInject,
          },
        },
      },
    },

    build: {
      vueRouterMode: "history",
      distDir: `dist/site-${site}`,
      publicPath: base,

      // Quasar’s own SCSS also gets the site vars
      scssVariables: brandRel,

      env: {
        ...envFromMeta,
        VITE_APP: site,
        VITE_SITE_KEY: site,
        VITE_API: apiTarget,
      },

      define: {
        __SITE_META__: JSON.stringify(meta),
      },

      extendViteConf(viteConf) {
        viteConf.cacheDir = path.resolve(
          __dirname,
          `node_modules/.vite-${site}`
        );
        viteConf.publicDir = publicDir;

        viteConf.define ??= {};
        Object.assign(viteConf.define, {
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
          __SITE__: JSON.stringify(site),
          __SITE_META__: JSON.stringify(meta),
          "import.meta.env.VITE_APP": JSON.stringify(site),
          "import.meta.env.VITE_SITE_KEY": JSON.stringify(site),
          "import.meta.env.VITE_API": JSON.stringify(apiTarget),
        });

        for (const [k, v] of Object.entries(envFromMeta)) {
          viteConf.define[`import.meta.env.${k}`] = JSON.stringify(v);
        }

        const prev = (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...prev,
            "@": path.resolve(__dirname, "src"),
            "@site": path.resolve(__dirname, `src/sites/${site}`),
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
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p,
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
