<script setup>
import { ref, onMounted } from "vue";
import LanguageOptions from "src/components/Language/LanguageOptionsB.vue";
import ShareLink from "components/ShareLink.vue";
const rightDrawerOpen = ref(false);

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<template>
  <q-layout view="lHh lpr lFf" class="max-width">
    <q-header elevated>
      <q-toolbar class="toolbar-width">
        <q-btn flat dense round icon="menu" aria-label="Menu" to="/index" />

        <q-toolbar-title>
          <router-link to="/index" exact class="toolbar-title">
            Discovering Community
          </router-link>
        </q-toolbar-title>

        <ShareLink />
        <q-btn
          flat
          dense
          round
          icon="language"
          aria-label="Button on top right"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="rightDrawerOpen" side="right" show-if-above bordered>
      <LanguageOptions />
    </q-drawer>

    <q-page-container class="set_size">
      <router-view />
      <footer class="footer">Copyright 2025 Power to Change</footer>
    </q-page-container>
  </q-layout>
</template>

<style>
.toolbar-title {
  color: white;
  text-decoration: none;
  font-size: 1.5em;
}
.footer {
  background-color: darkgrey;
  color: white;
  padding: 10px;
  text-align: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
h2 {
  font-size: 2rem;
}
.q-toolbar__title {
  font-size: 16px;
}

.q-header {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.toolbar-width,
.max-width {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
