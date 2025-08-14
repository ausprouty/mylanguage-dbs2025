<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { legacyApi } from "boot/axios";

const router = useRouter();
const { t } = useI18n();
const languageStore = useLanguageStore();

const loading = computed(() =>
  languageStore.menuStatus === 'loading' &&
  (!languageStore.menu || languageStore.menu.length === 0)
);
const error = computed(() => languageStore.menuError);
const menuItems = computed(() => languageStore.menu || []);

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
