// quasar.config.mjs
import { configure } from "quasar/wrappers";
import { loadEnv } from "vite";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// ---------- small helpers ----------
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const presentEnvFiles = (mode) =>
  [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`].filter(exists);

function cleanUrl(v) {
  if (!v) return "";
  let x = String(v);
  x = x
    .replace(/^["']|["']$/g, "") // strip quotes
    .replace(/\s*[#;].*$/, "") // drop inline comments
    .trim();
  return x.replace(/\/+$/, ""); // drop trailing slashes
}
function asOrigin(s) {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.origin : "";
  } catch {
    return "";
  }
}

// ---------- main export ----------
export default configure((ctx) => {
  // site key used by your project structure
  const site = process.env.SITE || process.env.VITE_APP || 'dbs'

  // Base mode = dev/prod; Site mode = uom/wsu/... (optional)
  const baseMode = ctx.dev ? "development" : "production";
  // You can pass V_MODE=uom in your scripts; fallback to SITE for convenience
  const siteMode = process.env.V_MODE || process.env.SITE || "";

  // Load both layers explicitly, so we can merge + log clearly.
  // loadEnv() already includes .env + .env.<mode>(.local) automatically.
  const envBase = loadEnv(baseMode, ROOT, "");
  const envSite = siteMode ? loadEnv(siteMode, ROOT, "") : {};
  // Site overrides base
  const envAll = { ...envBase, ...envSite };

  // Resolve API origin from merged env, with safe fallbacks
  // Keep full base (may include a path, e.g. /api_mylanguage)
  // Keep full base
  const apiFromEnvFull = cleanUrl(envAll.VITE_API);
  const apiFallback = ctx.dev
    ? "http://localhost/api_mylanguage"
    : "https://api2.mylanguage.net.au";

  const apiBase = (apiFromEnvFull || apiFallback).replace(/\/+$/, "");

  let apiOrigin = "";
  let apiPath = "";
  try {
    const u = new URL(apiBase);
    apiOrigin = `${u.protocol}//${u.host}`;
    apiPath = (u.pathname || "").replace(/\/$/, "");
  } catch (e) {
    // fallback: treat as origin-only
    apiOrigin = apiBase.replace(/\/.*$/, "");
    apiPath = "";
  }

  // Optional: per-site public dir (public-uom → else public)
  const publicDir = exists(`public-${site}`) ? `public-${site}` : "public";

  // Optional: per-site SCSS variables path
  const scssVarsPath = `src/sites/${site}/quasar.variables.scss`;
  const hasScssVars = exists(scssVarsPath);


  // Load per-site meta.json (if present)
  const metaPath = path.resolve(ROOT, `src/sites/${site}/meta.json`)
  const meta = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    : {}
  const envFromMeta = Object.fromEntries(
    Object.entries(meta?.env || {}).filter(([k]) => k.startsWith('VITE_'))
  )

  const base = meta.base || "/";
  // for debug
  const debugProd = process.env.DEBUG_BUILD === "1";

  // ---------- friendly build logs ----------
  console.log("▶ Env resolution");
  console.log("  site:", site);
  console.log("  baseMode:", baseMode, "siteMode:", siteMode || "(none)");
  console.log(
    "  present (base):",
    presentEnvFiles(baseMode).join(", ") || "(none)"
  );
  console.log(
    "  present (site):",
    (siteMode && presentEnvFiles(siteMode).join(", ")) || "(none)"
  );
  console.log(
    "  VITE_API from baseMode:",
    cleanUrl(envBase.VITE_API) || "(empty)"
  );
  console.log(
    "  VITE_API from siteMode:",
    cleanUrl(envSite.VITE_API) || "(empty)"
  );
  console.log("  → Effective VITE_API:", apiOrigin);
  console.log("  publicDir:", publicDir);
  console.log(
    "  meta.json:",
    exists(`src/sites/${site}/meta.json`) ? metaPath : "(none)"
  );
  console.log("  base:", base);
  if (hasScssVars) console.log("  scssVariables:", scssVarsPath);

  return {
    // Where Quasar copies static assets from
    sourceFiles: {
      // leave defaults unless you have custom index/template locations
    },

    // Per-site public assets (optional)
    // (Quasar accepts "public" path via vite.publicDir)
    // Use extendViteConf to set it.
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
    extras: ["material-icons"],

    framework: {
      config: {},
      iconSet: "material-icons",
      plugins: ["Notify", "Dialog"],
    },
    build: {
      distDir: `dist/site-${site}`,
      env: {
        ...envFromMeta,
        VITE_APP: site,
        VITE_SITE_KEY: site,
        VITE_API: apiTarget,
      },
      htmlVariables: { SITE_META: meta },
      vueRouterMode: "history",
      publicPath: base, // keep consistent with your hosting path
      // begin debug
      sourcemap: debugProd, // show original source in prod
      minify: debugProd ? false : "esbuild",
      // end debug
      extendViteConf(viteConf) {
        // Public dir
        viteConf.publicDir = publicDir;

        // Ensure the client bundle sees the merged env values
        viteConf.define = {
          ...(viteConf.define || {}),
          "import.meta.env.MODE": JSON.stringify(baseMode),
          "import.meta.env.SITE": JSON.stringify(site),
          "import.meta.env.VITE_API": JSON.stringify(apiBase),
        };

        // Per-site SCSS variables (optional)
        if (hasScssVars) {
          viteConf.css = viteConf.css || {};
          viteConf.css.preprocessorOptions = {
            ...(viteConf.css.preprocessorOptions || {}),
            scss: {
              ...(viteConf.css.preprocessorOptions?.scss || {}),
              additionalData: `@use "${scssVarsPath.replace(
                /\\/g,
                "/"
              )}" as *;`,
            },
          };
        }

        // --- NEW: aliases so @site/meta.json resolves ---
        viteConf.resolve = {
          ...(viteConf.resolve || {}),
          alias: {
            ...(viteConf.resolve?.alias || {}),
            "@": path.resolve(ROOT, "src"),
            "@site": path.resolve(ROOT, `src/sites/${site}`),
            "@sites": path.resolve(ROOT, "src/sites"),
          },
        };

        // Inject (or update) <meta name="api-origin" ...> into index.html
        viteConf.plugins = [
          ...(viteConf.plugins || []),
          {
            name: "inject-api-origin-meta",
            enforce: "pre",
            transformIndexHtml(html) {
              const tag = `<meta name="api-origin" content="${apiOrigin}">`;
              return html.includes('name="api-origin"')
                ? html.replace(/<meta[^>]*name="api-origin"[^>]*>/, tag)
                : html.replace("<head>", `<head>\n    ${tag}`);
            },
          },
        ];
      },
    },

    // Dev server: keep your /api proxy if you use it
    devServer: {
      host: "localhost",
      port: meta?.dev?.port || 9232,
      https: !!meta?.dev?.https,
      open: true,
      proxy: {
        // forward /api to the chosen API origin in dev
        "^/api(/|$)": {
          target: `${apiOrigin}${apiPath}/api`, // e.g. http://localhost/api_mylanguage/api
          changeOrigin: true,
          secure: apiBase.startsWith("https://"), // true for https targets, false for http
          rewrite: (p) => p.replace(/^\/api(?=\/|$)/, ""), // drop leading /api
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              if (req.headers.origin)
                proxyReq.setHeader("Origin", req.headers.origin);
            });
          },
        },
      },
    },
    // --- PWA: ensure precache + useful runtime caches
    pwa: {
      workboxMode: "InjectManifest",
      injectRegister: "auto",
      manifestFilename: "manifest.json",
      extendInjectManifestOptions(config) {
        config.swSrc = "src-pwa/custom-service-worker.js";
        config.globPatterns = ["**/*.{js,css,html,ico,png,svg,webp,woff2}"];
        config.globIgnores = ["**/*.map", "**/stats.html"];
        return config;
      },
      extendGenerateSWOptions(config) {
        // Make sure common asset types are precached
        config.globPatterns = ["**/*.{js,css,html,ico,png,svg,webp,woff2}"];
        // Always include entry point so Workbox never says “nothing to precache”
        config.additionalManifestEntries = [
          { url: `${base}index.html`, revision: null },
        ];
        // Runtime caches
        config.runtimeCaching = [
          // Public interface JSON (e.g., /interface/eng00.json)
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith(`${base}interface/`),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: `interface-${site}`,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // API calls
          {
            urlPattern: ({ url }) => url.pathname.startsWith(`${base}api/`),
            handler: "NetworkFirst",
            options: {
              cacheName: `api-${site}`,
              networkTimeoutSeconds: 4,
            },
          },
        ];
        return config;
      },

      extendManifestJson(manifest) {
        // You can override with src/sites/<site>/meta.json if you have names there
        manifest.name = (meta && meta.name) || "DBS 2025";
        manifest.short_name = (meta && meta.shortName) || "DBS";
        manifest.scope = base;
        manifest.start_url = base;
        manifest.display = "standalone";
        manifest.background_color = "#111111";
        manifest.theme_color = "#a05a2c";
        // If icons already exist in your manifest, this won’t overwrite them
        manifest.icons = manifest.icons?.length
          ? manifest.icons
          : [
              {
                src: `${base}icons/icon-192.png`,
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: `${base}icons/icon-512.png`,
                sizes: "512x512",
                type: "image/png",
              },
              {
                src: `${base}icons/maskable-icon-192.png`,
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable any",
              },
              {
                src: `${base}icons/maskable-icon-512.png`,
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable any",
              },
            ];
        return manifest;
      },
    },
  };
});
