<template>
  <meta property="og:title" content="Finding Spiritual Wisdom" />
  <meta
    property="og:description"
    content="In order to make any real progress in our spiritual life we know we need a reliable source of wisdom."
  />
  <meta
    property="og:image"
    content="https://myfriends.network/sites/myfriends/images/standard/MyFriends-App-Facebook.jpg"
  />
  <meta property="og:url" content="https://wisdom.mmylanguage.net.au" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@PtCAus" />
  <meta name="twitter:title" content="Finding Spiritual Wisdom" />
  <meta
    name="twitter:description"
    content="In order to make any real progress in our spiritual life we know we need a reliable source of wisdom."
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
import { useLanguageStore } from "stores/LanguageStore";
export default {
  name: "ShareLink",
  setup() {
    const languageStore = useLanguageStore();
    return {
      languageStore,
    };
  },
  methods: {
    shareUrl() {
      var subject = "Finding Wisdom";
      var message = "Here is the link";
      let url = window.location.href;
      var page = this.getLastSegment(url);
      console.log(page);
      url += this.getLessonNumber(page);
      url += this.getLanguage(page);

      // we need to reformat this because it may be a local address on an SD card
      // may return  file:///C:/xampp73/htdocs/MC2French/folder/content/M2/fra/tc/index.html
      // and you want https://app.mc2.online/content/M2/fra/tc/index.html
      if ("share" in navigator) {
        navigator.share({
          title: subject,
          text: message,
          url: url,
        });
      } else {
        var body = message + ": " + url;
        // Here we use the WhatsApp API as fallback; remember to encode your text for URI
        //location.href = 'mailto:?body=' + encodeURIComponent(text + ' - ') + location.href + ';subject=' + encodeURIComponent(title);
        location.href = getMailtoUrl("", subject, body);
      }
    },
    getLastSegment(url) {
      const parsedUrl = new URL(url);
      const pathSegments = parsedUrl.pathname
        .split("/")
        .filter((segment) => segment !== ""); // Remove empty segments
      return pathSegments[pathSegments.length - 1];
    },
    getLessonNumber(page) {
      switch (page) {
        case "book":
          return "/" + this.languageStore.getDbsLesson;
        case "following":
          return "/" + this.languageStore.getFollowingHimSegment;
        case "leadership":
          return "/" + this.languageStore.getLeadershipLesson;
        case "life":
          return "/" + this.languageStore.getJVideoSegmentId;
        case "teachings":
          return "/" + this.languageStore.getHisTeachingLesson;

        default:
          return "";
      }
    },
    getLanguage(page) {
      switch (page) {
        case "book":
        case "following":
        case "leadership":
        case "life":
        case "teachings":
          return "/" + this.languageStore.getLanguageCodeHLSelected;
        default:
          return "";
      }
    },
  },
};
</script>
<style scoped>
.shareLink {
  padding-right: 40px;
}
</style>
