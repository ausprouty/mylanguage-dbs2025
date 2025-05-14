
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
</script>
<template>
  <q-page class="bg-white" padding>
    <p>{{ t("index.para.1") }}</p>
    <p>{{ t("index.para.2") }}</p>
    <table>
      <tbody>
        <tr class="full-width">
          <td
            class="side-by-side"
            @click="handleImageClick('/jvideo///')"
            clickable
            v-ripple
          >
            <img class="menu_picture" src="menu/JesusLife.webp" />
          </td>
          <td
            class="side-by-side"
            @click="handleImageClick('/series/life')"
            clickable
            v-ripple
          >
            <img class="menu_picture" src="menu/LifePrinciples.webp" />
          </td>
        </tr>
        <tr class="full-width">
          <td
            class="side-by-side"
            @click="handleImageClick('/series/dbs')"
            clickable
            v-ripple
          >
            <img class="menu_picture" src="menu/Community.webp" />
          </td>
          <td
            class="side-by-side"
            @click="handleImageClick('/series/lead')"
            clickable
            v-ripple
          >
            <img class="menu_picture" src="menu/Leadership.webp" />
          </td>
        </tr>
      </tbody>
    </table>
    <br />
    <br />
    <p class="icon">
      <img
        class="icon"
        src="images/settings.png"
        @click="handleImageClick('/reset')"
        clickable
      />
    </p>
  </q-page>
</template>


<style scoped>
.menu_item {
  margin-left: 10px;
  margin-right: 10px;
  max-width: 200px;
  width: calc(100% - 20px);
  margin: 0 auto;
  background-color: #f0f0f0; /* Just for visibility */
  padding: 10px; /* Optional: Add padding for content within the element */
}
.menu_picture {
  width: calc(100% - 10px);
  margin: 0 auto;
  background-color: #eee; /* Just for visibility */
  padding: 10px; /* Optional: Add padding for content within the element */
}
td.side-by-side {
  width: 45%;
  padding: 0px;
}
tr.full-width {
  width: 100%;
}
p.icon {
  text-align: center;
}
img.icon {
  height: 30px;
}
</style>
