<template>
  <meta property="og:title" content="Finding Spiritual Community" />
  <meta
    property="og:description"
    content="Spiritual growth isn’t a solo journey — it happens in community. We all need wisdom we can trust and people who encourage us along the way. The lessons below will help you discover how God’s wisdom shapes lives, builds genuine relationships, and reveals His love and care for you."
  />
  <meta
    property="og:image"
    content="https://myfriends.network/sites/myfriends/images/standard/MyFriends-App-Facebook.jpg"
  />
  <meta property="og:url" content="https://dbs.mylanguage.net.au" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@PtCAus" />
  <meta name="twitter:title" content="Finding Spiritual Community" />
  <meta
    name="twitter:description"
    content="Spiritual growth isn’t a solo journey — it happens in community. We all need wisdom we can trust and people who encourage us along the way. The lessons below will help you discover how God’s wisdom shapes lives, builds genuine relationships, and reveals His love and care for you."
  />
  <meta
    name="twitter:image"
    content="https://myfriends.network/sites/myfriends/images/standard/MyFriends-App-Twitter.jpg"
  />

  <q-btn
    class="shareLink"
    flat
    dense
    round
    @click="shareUrl"
    icon="share"
  ></q-btn>
</template>

<script>
import { computed } from "vue";
import { useLanguageStore } from "stores/LanguageStore";

export default {
  name: "ShareLink",
  setup() {
    const languageStore = useLanguageStore();

    const getUrlLink = computed(() => {
      const rootUrl = window.location.origin;
      const pathAfterOrigin = window.location.pathname + window.location.search + window.location.hash;

      if (pathAfterOrigin.includes("video")) {
        return videoUrlLink(rootUrl);
      } else if (pathAfterOrigin.includes("series")) {
        return seriesUrlLink(rootUrl);
      } else {
        return rootUrl;
      }
    });
     //"/jvideo/:lesson?/:languageCodeHL?/:languageCodeJF?",
     const videoUrlLink = (rootUrl) => {
      const languageCodeJF = languageStore.getLanguageCodeJFSelected;
      console.log("Language Code JF:", languageCodeJF); // Debugging
      const languageCodeHL = languageStore.getLanguageCodeHLSelected;
      console.log("Language Code HL:", languageCodeHL); // Debugging
      const lesson = languageStore.getLessonNumber;

      return `${rootUrl}/jvideo/${lesson || ''}/${languageCodeHL || ''}/${languageCodeJF || ''}`;
    };

    // "/series/:study?/:lesson?/:languageCodeHL?",
    const seriesUrlLink = (rootUrl) => {
      const languageCodeHL2 = languageStore.getlanguageCodeHLSelected;
      const series = languageStore.getCurrentStudy;
      const lesson2 = languageStore.getLessonNumber;
      return `${rootUrl}/series/${series}/${lesson2 || ''}/${languageCodeHL2 || ''}`;
    };

    const shareUrl = () => {
      const subject = "Finding Spiritual Community";
      const message = "Here is the link";
      const url = getUrlLink.value; // Ensure computed property is accessed with `.value`

      if ("share" in navigator) {
        navigator.share({
          title: subject,
          text: message,
          url: url,
        });
      } else {
        const body = `${message}: ${url}`;
        location.href = getMailtoUrl("", subject, body);
      }
    };

    return {
      languageStore,
      shareUrl,
      getUrlLink,
    };
  },
};
</script>

<style scoped>
.shareLink {
  padding-right: 40px;
}
</style>
