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

    <div class="menu-grid">
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="menu-col"
        @click="handleImageClick(item.route)"
      >
        <div class="menu-card hoverable">
          <img :src="`menu/${item.image}`" class="menu-picture" />
          <div class="menu-label">
            <h6>{{ t(`${item.key}.title`) }}</h6>
            <p>{{ t(`${item.key}.summary`) }}</p>
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

.menu-col {
  flex: 1 1 calc(50% - 8px); /* 2 items per row with 16px gap */
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .menu-col {
    flex: 1 1 100%; /* stack to 1 item per row on small screens */
  }
}

.menu-card {
  background-color: #dddddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  cursor: pointer;
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


.menu-label h6 {
  margin: 0 0 4px 0; /* top, right, bottom, left */
  font-size: 1.5rem; /* Optional: adjust text size */
  text-align: center;
}

.menu-label p {
  margin: 0;
}

img.icon {
  height: 30px;
  cursor: pointer;
}

</style>
