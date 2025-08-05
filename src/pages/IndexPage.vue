<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { legacyApi } from "boot/axios";
// Access the router instance
const router = useRouter();

// Access the i18n instance
const { t } = useI18n();

// Access the language store
const languageStore = useLanguageStore();

console.log("📦 indexPage.vue mounted");
console.log("languageStore.languageSelected:", languageStore.languageSelected);
console.log("languageCodeHLSelected:", languageStore.languageCodeHLSelected);

// Function to handle image click and navigate to the specified route
const handleImageClick = (to) => {
  console.log("Image clicked, navigating to:", to);
  router.push(to);
};

// Function to open an external website based on the selected language
const openExternalWebsite = async () => {
  const url = `api/ask/${languageStore.languageCodeHLSelected}`;
  console.log(url);
  try {
    const response = await legacyApi.get(url);
    let externalURL = "https://www.everyperson.com/contact.php";
    if (response.data.contactPage) {
      externalURL = response.data.contactPage;
    }
    // Try to open the URL in a new tab or window
    const newWindow = window.open(externalURL, "_blank");
    // Check if the popup was blocked
    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === "undefined"
    ) {
      console.warn(
        "Popup was blocked, falling back to same window navigation."
      );
      window.location.href = externalURL; // Fallback to same window navigation
    }
  } catch (error) {
    console.error("Error fetching external URL:", error);
  }
};
const menuItems = [
  {
    key: "jVideo",
    image: "jesus.png",
    route: "/jvideo",
  },
  {
    key: "life",
    image: "life.png",
    route: "/series/life",
  },
  {
    key: "ctc",
    image: "community.png",
    route: "/series/ctc",
  },
  {
    key: "lead",
    image: "leadership.png",
    route: "/series/lead",
  },
];
</script>
<template>
  <q-page class="bg-white q-pa-md">
  <p>{{ t("index.para.1") }}</p>
  <p>{{ t("index.para.2") }}</p>

  <q-row class="q-col-gutter-md q-row-gutter-md justify-start">
    <q-col
      v-for="item in menuItems"
      :key="item.key"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <div
        class="menu-card q-hoverable cursor-pointer"
        @click="handleImageClick(item.route)"
      >
        <img :src="`menu/${item.image}`" class="menu-picture" />
        <div class="menu-label">
          <h6 class="q-mt-none q-mb-xs">{{ t(`${item.key}.title`) }}</h6>
          <p class="q-mb-none">{{ t(`${item.key}.summary`) }}</p>
        </div>
      </div>
    </q-col>
  </q-row>

  <div class="text-center q-mt-xl">
    <img
      class="icon"
      src="images/settings.png"
      @click="handleImageClick('/reset')"
    />
  </div>
</q-page>

</template>

<style scoped>
.menu-card {
  background-color: #dddddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.menu-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.menu-picture {
  display: block;
  width: 85%;
  margin: 12px auto 2px auto;
  height: auto;
  object-fit: cover;
}

.menu-label {
  padding: 0 6px 16px 6px;
  text-align: center;
}

img.icon {
  height: 30px;
  cursor: pointer;
}

</style>
