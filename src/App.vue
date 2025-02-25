<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  mounted() { // <-- Change from onMounted() to mounted()
    const currentPath = window.location.pathname;
    const storedPath = localStorage.getItem('currentPath');

    // Check if user manually entered a URL
    if (currentPath && currentPath !== '/' && currentPath !== '/index') {
      localStorage.setItem('currentPath', currentPath); // Update stored path
      return;
    }

    // Otherwise, check stored path
    if (storedPath) {
      const resolvedRoute = this.$router.resolve(storedPath);
      if (resolvedRoute.route && resolvedRoute.route.matched.length > 0) {
        this.$router.push(storedPath);
      } else {
        this.$router.push('/index'); // Default to /index if stored path is invalid
      }
    } else {
      this.$router.push('/index'); // Default to /index
    }
  }
});
</script>

<style>
.q-header {
  max-width: 600px;
}
.q-page {
  margin: 10px;
  background-color: white;
}
</style>
