import { useLanguageStore } from 'src/stores/LanguageStore';

export default ({ router }) => {
  const languageStore = useLanguageStore();

  // Restore the last visited path on initial app load (if user landed on '/')
  router.isReady().then(() => {
    const storedPath = languageStore.currentPath;
    const currentPath = router.currentRoute.value.fullPath;

    // Only redirect if:
    // - There's a stored path
    // - It's not '/' or '/index'
    // - The current route is the default homepage
    if (
      storedPath &&
      storedPath !== '/' &&
      storedPath !== '/index' &&
      currentPath === '/'
    ) {
      const resolved = router.resolve(storedPath);
      if (resolved.matched.length > 0) {
        router.replace(storedPath);
      } else {
        console.warn(`Invalid stored path: ${storedPath}`);
      }
    }
  });

  // Track each route change and store it in the Pinia store
  router.beforeEach((to, from, next) => {
    if (to.path !== '/') {
      languageStore.currentPath = to.path;
    }
    next();
  });
};
