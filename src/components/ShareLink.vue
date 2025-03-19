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

  <div class="share-container">
    <q-btn class="shareLink" flat dense round @click="shareUrl" icon="share" />
    <q-btn class="copyLink" flat dense round @click="copyToClipboard(getUrlLink.value)" icon="content_copy" />
  </div>
</template>

<script>
import { computed } from "vue";
import { useQuasar } from "quasar";
import { useLanguageStore } from "stores/LanguageStore";

export default {
  name: "ShareLink",
  setup() {
    const $q = useQuasar();
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

    const videoUrlLink = (rootUrl) => {
      const languageCodeJF = languageStore.getLanguageCodeJFSelected;
      const languageCodeHL = languageStore.getLanguageCodeHLSelected;
      const lesson = languageStore.getLessonNumber;

      return `${rootUrl}/jvideo/${lesson || ""}/${languageCodeHL || ""}/${languageCodeJF || ""}`;
    };

    const seriesUrlLink = (rootUrl) => {
      const languageCodeHL2 = languageStore.getLanguageCodeHLSelected;
      const series = languageStore.getCurrentStudy;
      const lesson2 = languageStore.getLessonNumber;
      return `${rootUrl}/series/${series || ""}/${lesson2 || ""}/${languageCodeHL2 || ""}`;
    };

    const shareUrl = async () => {
      const subject = "Finding Spiritual Community";
      const message = "Here is the link";
      const url = getUrlLink.value;

      if (navigator.share) {
        try {
          await navigator.share({ title: subject, text: message, url });
          $q.notify({ type: "positive", message: "Shared successfully!" });
        } catch (error) {
          console.error("Error sharing:", error);
          $q.notify({ type: "negative", message: "Sharing failed!" });
        }
      } else {
        $q.notify({ type: "warning", message: "Sharing not supported. Using fallback." });
        shareFallback(url, subject, message);
      }
    };

    const shareFallback = (url, subject, message) => {
      const encodedSubject = encodeURIComponent(subject);
      const encodedMessage = encodeURIComponent(`${message}: ${url}`);

      const shareOptions = {
        email: `mailto:?subject=${encodedSubject}&body=${encodedMessage}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedMessage}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      };

      $q.dialog({
        title: "Share via",
        message: "Choose a platform:",
        options: Object.keys(shareOptions).map((platform) => ({
          label: platform.charAt(0).toUpperCase() + platform.slice(1),
          handler: () => window.open(shareOptions[platform], "_blank"),
        })),
        cancel: true,
      });
    };

    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        $q.notify({ type: "positive", message: "Link copied to clipboard!" });
      } catch (err) {
        console.error("Failed to copy:", err);
        $q.notify({ type: "negative", message: "Failed to copy the link." });
      }
    };

    return {
      shareUrl,
      copyToClipboard,
      getUrlLink,
    };
  },
};
</script>

<style scoped>
.share-container {
  display: flex;
  gap: 10px;
}

.shareLink,
.copyLink {
  padding-right: 40px;
}
</style>
