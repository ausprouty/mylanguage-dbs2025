import { route } from 'quasar/wrappers';
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory
} from 'vue-router';
import routes from './routes';
import { syncLanguageFromRoute } from 'src/i18n/syncLanguageFromRoute';

// pulls: src/sites/<site>/meta.js via the @site alias
// e.g. export default { title: '...', description: '...' }
import siteMeta from '@site/meta';

function setMetaTag(kind, key, content) {
  if (typeof window === 'undefined') return;
  const sel =
    kind === 'property'
      ? `meta[property="${key}"]`
      : `meta[name="${key}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(kind, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history'
        ? createWebHistory
        : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    // quasar.conf.js / quasar.config.mjs controls mode & base
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  // --- existing guard: keep this
  Router.beforeEach((to, from, next) => {
    syncLanguageFromRoute(to);
    next();
  });

  // --- set default site title/description once (client only)
  if (process.env.CLIENT) {
    const baseTitle = siteMeta?.title || 'App';
    const baseDesc = siteMeta?.description || '';

    document.title = baseTitle;
    setMetaTag('name', 'description', baseDesc);
    setMetaTag('property', 'og:title', baseTitle);
    setMetaTag('property', 'og:description', baseDesc);
    setMetaTag('property', 'og:type', 'website');

    // per-page title: use route.meta.title when present
    Router.afterEach((to) => {
      const pageTitle = to?.meta?.title;
      document.title = pageTitle
        ? `${pageTitle} • ${baseTitle}`
        : baseTitle;
    });
  }

  return Router;
});
