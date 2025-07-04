<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { useContentStore } from "stores/ContentStore";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker";

import VideoPlayer from "src/components/video/VideoPlayer.vue";
import SeriesPassageSelect from "src/components/series/SeriesPassageSelect.vue";
import SeriesSegmentNavigator from "src/components/series/SeriesSegmentNavigator.vue";
import VideoQuestions from "src/components/video/VideoQuestions.vue";

// Route and i18n
const route = useRoute();
const { t, locale } = useI18n();

// Stores
const languageStore = useLanguageStore();
const contentStore = useContentStore();
const localeKey = computed(() => locale.value);

// Study identifier
const currentStudy = "jvideo";

// Set store values from route
languageStore.setCurrentStudy(currentStudy);
if (route.params.lesson) {
  languageStore.setLessonNumber(currentStudy, route.params.lesson);
}
if (route.params.languageCodeJF) {
  languageStore.setLanguageCodeJF(route.params.languageCodeJF);
}

// Language & lesson reactivity
const computedLanguageHL = computed(() => languageStore.languageCodeHLSelected);
const computedLessonNumber = computed(() => languageStore.lessonNumberForStudy);
const computedLanguageJF = computed(() => languageStore.languageCodeJFSelected);
const computedSectionKey = computed(
  () => `video-${computedLessonNumber.value}`
);

// Content
const { commonContent, topics, loadCommonContent } = useCommonContent(
  currentStudy,
  languageStore.languageCodeHLSelected
);

// Video URLs
const videoUrls = ref([]);

// Progress tracking
const {
  completedLessons,
  isLessonCompleted,
  markLessonComplete,
  loadProgress,
} = useProgressTracker(currentStudy);

// Load content on mount
onMounted(async () => {
  await Promise.all([loadCommonContent(), loadVideoUrls(), loadProgress()]);

  // Should log 'fr'
  //i18n.global.setLocaleMessage(currentLocale, {});
  console.log("jVideo.title:", t("jVideo.title")); // Should log French title
});

const loadVideoUrls = async () => {
  try {
    videoUrls.value = await contentStore.loadVideoUrls(
      computedLanguageJF.value,
      currentStudy
    );
  } catch (error) {
    console.error("Error loading video URLs:", error);
  }
};

// Watchers
watch(computedLanguageJF, loadVideoUrls);
watch(computedLanguageHL, loadCommonContent);

// Lesson change handler
const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(currentStudy, nextLessonNumber);
};
</script>
<template>
  <q-page padding>
    <h2>{{ t("jVideo.title") }}</h2>
    <p>{{ t("jVideo.para.1") }}</p>
    <p>{{ t("jVideo.para.2") }}</p>

    <SeriesPassageSelect
      :study="currentStudy"
      :topics="topics"
      :lesson="computedLessonNumber"
      :completedLessons="completedLessons"
      :isLessonCompleted="isLessonCompleted"
      :markLessonComplete="markLessonComplete"
      @updateLesson="updateLesson"
    />

    <SeriesSegmentNavigator
      :study="currentStudy"
      :lesson="computedLessonNumber"
      @updateLesson="updateLesson"
    />

    <VideoPlayer :videoUrls="videoUrls" :lesson="computedLessonNumber" />

    <VideoQuestions
      :commonContent="commonContent"
      :languageCodeHL="computedLanguageHL"
      :lesson="computedLessonNumber"
      :sectionKey="computedSectionKey"
    />

    <q-btn
      :label="
        isLessonCompleted(computedLessonNumber)
          ? t('lesson.completed')
          : t('lesson.notCompleted')
      "
      :disable="isLessonCompleted(computedLessonNumber)"
      class="mark-complete-btn"
      @click="markLessonComplete(computedLessonNumber)"
    />
  </q-page>
</template>

<style>
.q-page {
  background-color: white;
}
</style>
