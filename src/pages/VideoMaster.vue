
<script setup>
import { ref, computed, watch, watchEffect, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { useContentStore } from "stores/ContentStore";
import { noteSection } from "src/components/NoteSection.vue";
import { useCommonContent } from "src/composables/useCommonContent";

import VideoPlayer from "src/components/Video/VideoPlayer.vue";
import SeriesPassageSelect from "src/components/Series/SeriesPassageSelect.vue";
import SeriesSegmentNavigator from "src/components/Series/SeriesSegmentNavigator.vue";
import VideoQuestions from "src/components/Video/VideoQuestions.vue";

// Access the current route
const route = useRoute();

// Access the i18n instance
const { t } = useI18n();

// Access the stores
const languageStore = useLanguageStore();
const contentStore = useContentStore();

// Props
const props = defineProps({
  video: String,
  lesson: Number,
  languageCodeHL: String,
  languageCodeJF: String,
});

// Static study name
const currentStudy = "jvideo";

// Set initial values in store
languageStore.setCurrentStudy(currentStudy);
if (route.params.lesson) {
  languageStore.setLessonNumber(currentStudy, route.params.lesson);
}
if (route.params.languageCodeJF) {
  languageStore.setLanguageCodeJF(route.params.languageCodeJF);
}

// Initialize the composable
const { commonContent, topics, loadCommonContent } = useCommonContent(
  currentStudy,
  languageStore.languageCodeHLSelected
);

// Reactive computed properties
const computedLanguageHL = computed(() => languageStore.languageCodeHLSelected);
const computedLessonNumber = computed(() => languageStore.lessonNumberForStudy);
const computedLanguageJF = computed(() => languageStore.languageCodeJFSelected);
const computedSectionKey = computed(
  () => `video-${computedLessonNumber.value}`
);

// 🔹 Reactive video URLs
const videoUrls = ref([]);

// ✅ Function to load video URLs
const loadVideoUrls = async () => {
  try {
    videoUrls.value = await useContentStore.loadVideoUrls(
      computedLanguageJF.value,
      currentStudy
    );
  } catch (error) {
    console.error("Error loading video URLs:", error);
  }
};

// Load common content when the component mounts
onMounted(async () => {
  await loadCommonContent();
  await loadVideoUrls(); // Ensures video URLs load at startup
});

// ✅ Watch `computedLanguageJF` and update video URLs when it changes
watch(computedLanguageJF, async (newLanguageJF) => {
  console.log("Language changed:", newLanguageJF);
  await loadVideoUrls();
});
// Watch for changes in computedLanguage and reload common content
watch(computedLanguageHL, async (newLanguage) => {
  await loadCommonContent(newLanguage);
});

// Function to update the lesson number
const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(currentStudy, nextLessonNumber);
  console.log(computedSectionKey);
  console.log("Lesson updated:", nextLessonNumber);
  console.log("New computedSectionKey:", computedSectionKey.value); // Check if it updates
};
</script>
<template>
  <q-page padding>
    <h2>{{ t("jVideo.title") }}</h2>
    <p>{{ t("jVideo.para.1") }}</p>
    <p>{{ t("jVideo.para.2") }}</p>
    <div>
      <SeriesPassageSelect
        :study="currentStudy"
        :topics="topics"
        :lesson="computedLessonNumber"
        @updateLesson="updateLesson"
      />
    </div>
    <div>
      <SeriesSegmentNavigator
        :study="currentStudy"
        :lesson="computedLessonNumber"
        @updateLesson="updateLesson"
      />
    </div>
    <div>
      <VideoPlayer :videoUrls="videoUrls" :lesson="computedLessonNumber" />
    </div>
    <div>
      <VideoQuestions
        :commonContent="commonContent"
        :languageCodeHL="computedLanguageHL"
        :lesson="computedLessonNumber"
        :sectionKey="computedSectionKey"
      />
    </div>
    <div>
      <noteSection
        :sectionKey="computedSectionKey"
        placeholder="Your comments here"
      />
    </div>
  </q-page>
</template>


<style>
.q-page {
  background-color: white;
}
</style>
