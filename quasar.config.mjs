/* eslint-env node */
import { configure } from "quasar/wrappers";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default configure((ctx) => {
  const site = process.env.SITE || process.env.VITE_APP || "default";

  // --- Load per-site meta ---
  const metaPath = path.resolve(__dirname, `src/sites/${site}/meta.json`);
  const meta = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, "utf-8"))
    : {};
  const envFromMeta = Object.fromEntries(
    Object.entries(meta?.env || {}).filter(([k]) => k.startsWith("VITE_"))
  );

  const base = meta.base ?? "/";

  // --- SCSS variables file (per-site or fallback) ---
  const varsCandidate =
    meta.varsPath ?? `src/sites/${site}/quasar.variables.scss`;
  const varsRel = fs.existsSync(path.resolve(__dirname, varsCandidate))
    ? varsCandidate
    : "src/css/quasar.variables.scss";
  const varsAbs = path.resolve(__dirname, varsRel);
  const varsAbsPosix = varsAbs.split(path.sep).join("/");

  // --- Public dir ---
  const candidatePublicDir = path.resolve(
    __dirname,
    meta.publicDir ?? `public-${site}`
  );
  const publicDir = fs.existsSync(candidatePublicDir)
    ? candidatePublicDir
    : path.resolve(__dirname, "public");

  // --- Dev server ---
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
  console.log("scssVariables (rel):", varsRel);
  console.log("scssVariables (abs):", varsAbsPosix);
  console.log("publicDir (resolved):", publicDir);
  console.log("dev:", dev);
  console.groupEnd();

  return {
    boot: [
      "i18n",
      "axios",
      "language-init",
      "brand-hydrate",
      "menu-hydrate",
      "route-resume",
      "version-check",
    ],

    // Your global stylesheet (src/css/app.scss)
    css: ["app.scss"],

    extras: ["material-icons"],

    framework: {
      config: {},
      iconSet: "material-icons",
      plugins: ["Notify", "Dialog"],
    },

    // ✅ All build-related wiring goes under "build"
    build: {
      vueRouterMode: "history",
      distDir: `dist/site-${site}`,
      publicPath: base,

      // ✅ Let Quasar components see your variables
      scssVariables: varsAbsPosix,

      // Optional: pass VITE_* to Quasar (server-side) too
      env: {
        ...envFromMeta,
        VITE_APP: site,
        VITE_SITE_KEY: site,
      },

      // Compile-time constants (available via bare identifiers)
      define: {
        __SITE_META__: JSON.stringify(meta),
      },

      // ✅ Extend Vite correctly
      extendViteConf(viteConf) {
        // site-specific cache
        viteConf.cacheDir = path.resolve(__dirname, `node_modules/.vite-${site}`);

        // Serve the correct per-site public folder
        viteConf.publicDir = publicDir;

        // ----- define: merge safely -----
        viteConf.define ??= {};
        Object.assign(viteConf.define, {
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
          __SITE__: JSON.stringify(site),
          __SITE_META__: JSON.stringify(meta), // ensure it survives merges
        });

        // Inject every VITE_* into import.meta.env.*
        for (const [k, v] of Object.entries(envFromMeta)) {
          viteConf.define[`import.meta.env.${k}`] = JSON.stringify(v);
        }
        viteConf.define["import.meta.env.VITE_APP"] = JSON.stringify(site);
        viteConf.define["import.meta.env.VITE_SITE_KEY"] = JSON.stringify(site);

        // ----- SCSS: inject vars into ALL your scss files -----
        viteConf.css ??= {};
        viteConf.css.preprocessorOptions ??= {};
        viteConf.css.preprocessorOptions.scss ??= {};
        const add = `@use "${varsAbsPosix}" as *;`;
        const existing =
          viteConf.css.preprocessorOptions.scss.additionalData || "";
        viteConf.css.preprocessorOptions.scss.additionalData = add + existing;

        // ----- Aliases -----
        const existingAlias =
          (viteConf.resolve && viteConf.resolve.alias) || {};
        viteConf.resolve = {
          ...viteConf.resolve,
          alias: {
            ...existingAlias,
            "@": path.resolve(__dirname, "./src"),
            "@site": path.resolve(__dirname, `src/sites/${site}`),
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
        "/api_mylanguage": {
          target: "http://127.0.0.1:5559",
          changeOrigin: true,
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
