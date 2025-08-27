[33mcommit 1532a751da0685e18f12f53b31ddb0140e5e9dd3[m
Author: ausprouty2 <bob.prouty@powertochange.org.au>
Date:   Mon Aug 25 15:34:31 2025 +1000

    about to debug

[1mdiff --git a/quasar.config.mjs b/quasar.config.mjs[m
[1mindex fb17d2c..2abe9d8 100644[m
[1m--- a/quasar.config.mjs[m
[1m+++ b/quasar.config.mjs[m
[36m@@ -1,207 +1,177 @@[m
[31m-/* eslint-env node */[m
[31m-import { configure } from "quasar/wrappers";[m
[31m-import path from "node:path";[m
[31m-import { fileURLToPath } from "node:url";[m
[31m-import fs from "node:fs";[m
[31m-[m
[31m-const __dirname = path.dirname(fileURLToPath(import.meta.url));[m
[31m-[m
[32m+[m[32m// quasar.config.mjs[m
[32m+[m[32mimport { configure } from 'quasar/wrappers'[m
[32m+[m[32mimport { loadEnv } from 'vite'[m
[32m+[m[32mimport fs from 'node:fs'[m
[32m+[m[32mimport path from 'node:path'[m
[32m+[m
[32m+[m[32mconst ROOT = process.cwd()[m
[32m+[m
[32m+[m[32m// ---------- small helpers ----------[m
[32m+[m[32mconst exists = p => fs.existsSync(path.join(ROOT, p))[m
[32m+[m[32mconst presentEnvFiles = mode => [[m
[32m+[m[32m  '.env',[m
[32m+[m[32m  '.env.local',[m
[32m+[m[32m  `.env.${mode}`,[m
[32m+[m[32m  `.env.${mode}.local`,[m
[32m+[m[32m].filter(exists)[m
[32m+[m
[32m+[m[32mfunction cleanUrl(v) {[m
[32m+[m[32m  if (!v) return ''[m
[32m+[m[32m  let x = String(v)[m
[32m+[m[32m  x = x.replace(/^["']|["']$/g, '')     // strip quotes[m
[32m+[m[32m       .replace(/\s*[#;].*$/, '')       // drop inline comments[m
[32m+[m[32m       .trim()[m
[32m+[m[32m  return x.replace(/\/+$/, '')          // drop trailing slashes[m
[32m+[m[32m}[m
[32m+[m[32mfunction asOrigin(s) {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const u = new URL(s)[m
[32m+[m[32m    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.origin : ''[m
[32m+[m[32m  } catch { return '' }[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// ---------- main export ----------[m
 export default configure((ctx) => {[m
[31m-  const site = process.env.SITE || process.env.VITE_APP || "dbs";[m
[31m-[m
[31m-  // --- meta.json (optional) ---[m
[31m-  const metaPath = path.resolve(__dirname, `src/sites/${site}/meta.json`);[m
[31m-  let meta = {};[m
[31m-  if (fs.existsSync(metaPath)) {[m
[31m-    try {[m
[31m-      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));[m
[31m-    } catch (e) {[m
[31m-      console.warn(`[meta] Failed to parse ${metaPath}:`, e.message);[m
[31m-    }[m
[31m-  }[m
[31m-[m
[31m-  const envFromMeta = Object.fromEntries([m
[31m-    Object.entries(meta?.env || {}).filter(([k]) => k.startsWith("VITE_"))[m
[31m-  );[m
[31m-  const base = meta.base ?? "/";[m
[31m-[m
[31m-  // --- API target ---[m
[31m-  const rawViteApi =[m
[31m-    process.env.VITE_API ||[m
[31m-    envFromMeta.VITE_API ||[m
[31m-    "http://localhost/api_mylanguage";[m
[31m-  const apiTarget = rawViteApi.replace(/\/+$/, "");[m
[31m-[m
[31m-  // --- per-site SCSS variables (required) ---[m
[31m-  const brandRel = `src/sites/${site}/quasar.variables.scss`;[m
[31m-  const brandAbs = path.resolve(__dirname, brandRel);[m
[31m-  if (!fs.existsSync(brandAbs)) {[m
[31m-    throw new Error([m
[31m-      `Missing SCSS variables for site "${site}". Expected: ${brandRel}`[m
[31m-    );[m
[31m-  }[m
[31m-  const scssInject = `@use "${brandRel}" as *;`;[m
[31m-[m
[31m-  // --- public dir (per site, fallback ./public) ---[m
[31m-  const publicDirCandidate =[m
[31m-    meta.publicDir != null[m
[31m-      ? path.resolve(__dirname, meta.publicDir)[m
[31m-      : path.resolve(__dirname, `public-${site}`);[m
[31m-  const publicDir = fs.existsSync(publicDirCandidate)[m
[31m-    ? publicDirCandidate[m
[31m-    : path.resolve(__dirname, "public");[m
[31m-[m
[31m-  // --- dev server defaults ---[m
[31m-  const defaultDevPort = ctx.mode.pwa ? 9200 : ctx.mode.ssr ? 9300 : 9100;[m
[31m-  const dev = {[m
[31m-    host: meta.dev?.host ?? "localhost",[m
[31m-    port: meta.dev?.port ?? defaultDevPort,[m
[31m-    https: !!meta.dev?.https,[m
[31m-  };[m
[31m-[m
[31m-  console.group("▶ Build context");[m
[31m-  console.log("site:", site);[m
[31m-  console.log("meta:", fs.existsSync(metaPath) ? metaPath : "(none)");[m
[31m-  console.log("base:", base);[m
[31m-  console.log("scssVariables:", brandRel);[m
[31m-  console.log("publicDir (resolved):", publicDir);[m
[31m-  console.log("dev:", dev);[m
[31m-  console.log("VITE_API (computed apiTarget):", apiTarget);[m
[31m-  console.groupEnd();[m
[32m+[m[32m  // site key used by your project structure[m
[32m+[m[32m  const site = process.env.SITE || 'dbs'[m
[32m+[m
[32m+[m[32m  // Base mode = dev/prod; Site mode = uom/wsu/... (optional)[m
[32m+[m[32m  const baseMode = ctx.dev ? 'development' : 'production'[m
[32m+[m[32m  // You can pass V_MODE=uom in your scripts; fallback to SITE for convenience[m
[32m+[m[32m  const siteMode = process.env.V_MODE || process.env.SITE || ''[m
[32m+[m
[32m+[m[32m  // Load both layers explicitly, so we can merge + log clearly.[m
[32m+[m[32m  // loadEnv() already includes .env + .env.<mode>(.local) automatically.[m
[32m+[m[32m  const envBase = loadEnv(baseMode, ROOT, '')[m
[32m+[m[32m  const envSite = siteMode ? loadEnv(siteMode, ROOT, '') : {}[m
[32m+[m[32m  // Site overrides base[m
[32m+[m[32m  const envAll  = { ...envBase, ...envSite }[m
[32m+[m
[32m+[m[32m  // Resolve API origin from merged env, with safe fallbacks[m
[32m+[m[32m  const apiFromEnv = asOrigin(cleanUrl(envAll.VITE_API))[m
[32m+[m[32m  const apiFallback = ctx.dev[m
[32m+[m[32m    ? 'http://localhost:5173' // change if your dev API is elsewhere[m
[32m+[m[32m    : 'https://api2.mylanguage.net.au'[m
[32m+[m[32m  const apiOrigin = apiFromEnv || apiFallback[m
[32m+[m
[32m+[m[32m  // Optional: per-site public dir (public-uom → else public)[m
[32m+[m[32m  const publicDir = exists(`public-${site}`) ? `public-${site}` : 'public'[m
[32m+[m
[32m+[m[32m  // Optional: per-site SCSS variables path[m
[32m+[m[32m  const scssVarsPath = `src/sites/${site}/quasar.variables.scss`[m
[32m+[m[32m  const hasScssVars = exists(scssVarsPath)[m
[32m+[m
[32m+[m[32m  // Optional: per-site meta.json (for base path, etc.)[m
[32m+[m[32m  const metaPath = path.join(ROOT, `src/sites/${site}/meta.json`)[m
[32m+[m[32m  const meta = exists(`src/sites/${site}/meta.json`)[m
[32m+[m[32m    ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))[m
[32m+[m[32m    : {}[m
[32m+[m[32m  const base = meta.base || '/'[m
[32m+[m
[32m+[m[32m  // ---------- friendly build logs ----------[m
[32m+[m[32m  console.log('▶ Env resolution')[m
[32m+[m[32m  console.log('  site:', site)[m
[32m+[m[32m  console.log('  baseMode:', baseMode, 'siteMode:', siteMode || '(none)')[m
[32m+[m[32m  console.log('  present (base):',[m
[32m+[m[32m    presentEnvFiles(baseMode).join(', ') || '(none)')[m
[32m+[m[32m  console.log('  present (site):',[m
[32m+[m[32m    (siteMode && presentEnvFiles(siteMode).join(', ')) || '(none)')[m
[32m+[m[32m  console.log('  VITE_API from baseMode:',[m
[32m+[m[32m    cleanUrl(envBase.VITE_API) || '(empty)')[m
[32m+[m[32m  console.log('  VITE_API from siteMode:',[m
[32m+[m[32m    cleanUrl(envSite.VITE_API) || '(empty)')[m
[32m+[m[32m  console.log('  → Effective VITE_API:', apiOrigin)[m
[32m+[m[32m  console.log('  publicDir:', publicDir)[m
[32m+[m[32m  console.log('  meta.json:', exists(`src/sites/${site}/meta.json`) ? metaPath : '(none)')[m
[32m+[m[32m  console.log('  base:', base)[m
[32m+[m[32m  if (hasScssVars) console.log('  scssVariables:', scssVarsPath)[m
 [m
   return {[m
[31m-    boot: [[m
[31m-      "i18n",[m
[31m-      "axios",[m
[31m-      "language-init",[m
[31m-      "brand-hydrate",[m
[31m-      "profile-hydrate",[m
[31m-      "menu-hydrate",[m
[31m-      "route-resume",[m
[31m-      "version-check",[m
[31m-    ],[m
