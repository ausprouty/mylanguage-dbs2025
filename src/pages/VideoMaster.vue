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

// 🧭 Route and i18n setup
const route = useRoute();
const { t, locale } = useI18n();
const localeKey = computed(() => locale.value);

// 📦 Stores
const languageStore = useLanguageStore();
const contentStore = useContentStore();

// 📚 Study ID (hardcoded for jVideo)
const currentStudy = "jvideo";

// 🧠 Reactive language/lesson values from store
const languageCodeHL = computed(() => languageStore.languageCodeHLSelected);
const languageCodeJF = computed(() => languageStore.languageCodeJFSelected);
const lessonNumber = computed(() => languageStore.lessonNumberForStudy);
const sectionKey = computed(() => `video-${lessonNumber.value}`);

// 📋 Content from composables
const { commonContent, topics, loadCommonContent } = useCommonContent(
  currentStudy,
  languageCodeHL
);

// 🎥 Video URLs (from store via action)
const videoUrls = ref([]);

// ✅ Track user lesson progress
const {
  completedLessons,
  isLessonCompleted,
  markLessonComplete,
  loadProgress,
} = useProgressTracker(currentStudy);

// 🔄 Load video URLs for current study/language
const loadVideoUrls = async () => {
  try {
    videoUrls.value = await contentStore.loadVideoUrls(
      languageCodeJF.value,
      currentStudy
    );
  } catch (error) {
    console.error("Error loading video URLs:", error);
  }
};

// 📦 Apply route params to store on initial mount
const applyRouteParams = () => {
  languageStore.setCurrentStudy(currentStudy);
  if (route.params.lesson) {
    languageStore.setLessonNumber(currentStudy, route.params.lesson);
  }
  if (route.params.languageCodeJF) {
    languageStore.setLanguageCodeJF(route.params.languageCodeJF);
  }
};

// 🚀 Initial setup on mount
onMounted(async () => {
  applyRouteParams();
  await Promise.all([
    loadCommonContent(),
    loadVideoUrls(),
    loadProgress()
  ]);
  console.log("jVideo.title:", t("jVideo.title")); // Confirm translation loaded
});

// 🔁 Reactively reload data when language changes
watch(languageCodeJF, loadVideoUrls);
watch(languageCodeHL, loadCommonContent);

// 📌 When user picks a new lesson
const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(currentStudy, nextLessonNumber);
};
</script>

<template>
  <q-page padding>
    <h2>{{ t("jVideo.title") }}</h2>
    <p v-for="(p, i) in tm('jVideo.para')" :key="i">{{ p }}</p>

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
