<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { legacyApi } from "boot/axios";

const router = useRouter();
const { t } = useI18n();
const languageStore = useLanguageStore();

const SITE_KEY = import.meta.env.VITE_APP || "default";


async function getStudyMenu() {
  const base = import.meta.env.BASE_URL; // respects publicPath/base per site
  const ver = import.meta.env.VITE_APP_VERSION || 'dev';
  const url = `${base}config/menu.json?v=${ver}`;

  const fetchOpts = import.meta.env.DEV ? { cache: 'no-store' } : undefined;
  const res = await fetch(url, fetchOpts);
  if (!res.ok) {
    console.error('Menu fetch failed:', res.status, url);
    return [];
  }
  return res.json();
}

const loading = ref(true);
const error = ref(null);
const menuItems = ref([]);

onMounted(async () => {
  try {
    const data = await getStudyMenu();
    menuItems.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    error.value = "Menu failed to load.";
  } finally {
    loading.value = false;
  }
});

console.log("📦 indexPage.vue mounted");
console.log("languageStore.languageSelected:", languageStore.languageSelected);
console.log("languageCodeHLSelected:", languageStore.languageCodeHLSelected);

const handleImageClick = (to) => {
  if (!to) return;
  router.push(to);
};

const openExternalWebsite = async () => {
  const url = `api/ask/${languageStore.languageCodeHLSelected}`;
  try {
    const { data } = await legacyApi.get(url);
    const externalURL =
      (data && data.contactPage) || "https://www.everyperson.com/contact.php";
    const win = window.open(externalURL, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = externalURL;
    }
  } catch (error) {
    console.error("Error fetching external URL:", error);
  }
};
</script>

<template>
  <q-page class="bg-white q-pa-md">
    <p>{{ t("index.para.1") }}</p>
    <p>{{ t("index.para.2") }}</p>

    <div v-if="error" class="text-negative q-mt-md">{{ error }}</div>
    <div v-else-if="loading" class="q-mt-md">Loading…</div>

    <div v-else class="menu-grid">
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="menu-col"
        @click="handleImageClick(item.route)"
      >
        <div class="menu-card hoverable">
          <img :src="item.image" class="menu-picture" />
          <div class="menu-label">
            <h6>{{ t(item.key + ".title", item.title || item.key) }}</h6>
            <p>{{ t(item.key + ".summary", item.summary || "") }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center" style="margin-top: 3rem">
      <img
        class="icon"
        src="images/settings.png"
        @click="handleImageClick('/reset')"
      />
    </div>
  </q-page>
</template>

<style scoped>
.menu-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
}
.menu-col { flex: 1 1 calc(50% - 8px); box-sizing: border-box; }
@media (max-width: 600px) { .menu-col { flex: 1 1 100%; } }
.menu-card {
  background-color: #dddddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);
  padding: 10px; text-align: center; transition: transform .2s, box-shadow .2s;
  height: 100%; cursor: pointer;
}
.menu-card:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(0,0,0,.2); }
.menu-picture { display: block; width: 85%; margin: 12px auto 2px; height: auto; object-fit: cover; }
.menu-label h6 { margin: 0 0 4px; font-size: 1.5rem; text-align: center; }
.menu-label p { margin: 0; }
img.icon { height: 30px; cursor: pointer; }
</style>
