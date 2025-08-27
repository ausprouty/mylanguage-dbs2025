<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { useSettingsStore } from "src/stores/SettingsStore";
import LanguageOptions from "src/components/language/LanguageOptionsB.vue";
import ShareLink from "src/components/ShareLink.vue";

const route = useRoute();
const store = useSettingsStore();

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

const appbarStyle = computed(
  () =>
    route.meta?.appbar ?? globalThis.__SITE_META__?.appbar?.style ?? "surface"
);

const appbarClass = computed(() => ({
  "appbar--surface": appbarStyle.value === "surface",
  "appbar--primary": appbarStyle.value === "primary",
  "appbar--transparent": appbarStyle.value === "transparent",
}));

const scrolled = ref(false);
function onScroll() {
  scrolled.value = window.scrollY > 2;
}
onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});

const actionBtnColor = computed(() =>
  appbarStyle.value === "primary" ? "white" : "primary"
);
</script>

<template>
  <q-layout view="lHh lpr lFf">
    <q-header
      :elevated="appbarStyle === 'surface' || scrolled"
      class="appbar"
      :class="appbarClass"
    >
      <q-toolbar>
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
          :color="actionBtnColor"
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
.appbar {
  background: var(--appbar-bg);
  color: var(--appbar-fg);
  transition: background 120ms ease, color 120ms ease, box-shadow 120ms ease;
}

.appbar--surface {
  --appbar-bg: var(--color-surface);
  --appbar-fg: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.appbar--primary {
  --appbar-bg: var(--color-primary);
  --appbar-fg: var(--color-on-primary);
}

.appbar--transparent {
  --appbar-bg: color-mix(in srgb, var(--color-surface) 75%, transparent);
  --appbar-fg: var(--color-text);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid
    color-mix(in srgb, var(--color-border) 50%, transparent);
}

.toolbar-title {
  color: inherit;
  text-decoration: none;
  font-size: 1.5rem;
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
}

.page-width {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
