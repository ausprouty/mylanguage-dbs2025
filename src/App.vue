<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
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
