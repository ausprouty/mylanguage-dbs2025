// src/boot/localStorage.js

export default ({ app, router }) => {
  // Use the router's navigation guard to update local storage on route change
  router.beforeEach((to, from, next) => {
    if (to.path != '/'){
      localStorage.setItem('currentPath', to.path);
    }
    // Store the current route path in local storag
    next();
  });
};
