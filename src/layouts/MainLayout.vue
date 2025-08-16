<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useLanguageStore } from "stores/LanguageStore";
import LanguageOptions from "components/language/LanguageOptionsB.vue";
import ShareLink from "components/ShareLink.vue";

const route = useRoute();
const store = useLanguageStore();

const rightDrawerOpen = ref(false);
const brandTitle = computed(() => store.brandTitle || "Not Set");

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}

watch(
  () => route.fullPath,
  () => {
    rightDrawerOpen.value = false;
  }
);
</script>

<template>
  <q-layout view="lHh lpr lFf">
    <q-header elevated>
      <q-toolbar class="dark_toolbar text-white">
        <q-btn flat dense round icon="menu" aria-label="Menu" to="/index" />

        <q-toolbar-title>
          <router-link to="/index" class="toolbar-title">
            {{ brandTitle }}
          </router-link>
        </q-toolbar-title>

        <q-space />

        <ShareLink />

        <q-btn
          flat
          dense
          round
          icon="language"
          aria-label="Language selector"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      side="right"
      v-model="rightDrawerOpen"
      overlay
      elevated
      :width="320"
    >
      <LanguageOptions />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style>
.dark_toolbar{
  background-color:dark;
}
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

  margin: 0 auto;
}
h2 {
  font-size: 2rem;
}
.q-toolbar__title {
  font-size: 16px;
}

.toolbar-width {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  /* REMOVE display: flex */
}

.page-width {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
