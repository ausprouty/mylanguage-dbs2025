<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "src/stores/SettingsStore";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker";
import { useVideoParams } from "src/composables/useVideoParams";
import { normParamStr } from "src/utils/normalize";
import { useVideoSourceFromSpec } from "src/composables/useVideoSourceFromSpec";


import VideoPlayer from "src/components/video/VideoPlayer.vue";
import SeriesPassageSelect from "src/components/series/SeriesPassageSelect.vue";
import VideoQuestions from "src/components/video/VideoQuestions.vue";

const route = useRoute();
const { t, tm } = useI18n({ useScope: "global" });
const settingsStore = useSettingsStore();

// study comes from the route: /video/:study/:lesson?/:languageCodeHL?/:languageCodeJF?
const currentStudy = computed(() => normParamStr(route.params.study) || "jvideo");

const {
  lesson,
  languageCodeHL,
  languageCodeJF,
  sectionKey,
  applyToStore,
} = useVideoParams({
  studyKey: currentStudy, // pass ref; composable should unref internally
  defaults: { lesson: 1, languageCodeHL: "eng00", languageCodeJF: "529" },
  syncToRoute: true,
});

// Intro paragraphs from i18n bundle
const paras = computed(() => {
  const v = typeof tm === "function" ? tm("jVideo.para") : [];
  return Array.isArray(v) ? v : [];
});

// Common content for the current study + HL language
const { commonContent, topics, loadCommonContent } = useCommonContent(
  currentStudy,
  languageCodeHL
);

// Progress tracking scoped to study
const {
  completedLessons,
  isLessonCompleted,
  markLessonComplete,
  loadProgress,
} = useProgressTracker(currentStudy);

// Video spec from content (kept dumb in VideoPlayer)
const video = computed(() => (commonContent.value || {}).video || {});

// topic title from i18n: topic.{lesson}; render nothing if missing
const topicTitle = computed(() => {
  const key = "topic." + String(lesson.value);
  const val = t(key);
  return val === key ? null : val;
});

// UI gates
const showLanguageSelect = computed(() => Boolean(video.value.multiLanguage));
const showSeriesPassage = computed(() => {
  const seg = Number(video.value.segments || 0);
  return Number.isFinite(seg) && seg > 1;
});
const { source } = useVideoSourceFromSpec({
  videoSpec: video,
  study: currentStudy,          // ref from route
  lesson,                       // from useVideoParams
  languageCodeJF,               // from useVideoParams (defaults to "529")
  languageCodeHL,               // from useVideoParams
});

onMounted(async () => {
  applyToStore();
  await Promise.all([loadCommonContent(), loadProgress()]);
});

// reload content when HL changes
watch(languageCodeHL, loadCommonContent);

// update lesson via store (route will sync because syncToRoute: true)
function updateLesson(nextLessonNumber) {
  settingsStore.setLessonNumber(currentStudy.value, nextLessonNumber);
}
</script>

<template>
  <q-page padding>
    <h2 v-if="topicTitle">{{ topicTitle }}</h2>
    <p v-for="(p, i) in paras" :key="i">{{ p }}</p>

    <p v-if="showLanguageSelect" class="language-select">
      {{ $t("interface.changeLanguage") }}
    </p>

    <SeriesPassageSelect
      v-if="showSeriesPassage"
      :study="currentStudy"
      :topics="topics"
      :lesson="lesson"
      :completedLessons="completedLessons"
      :isLessonCompleted="isLessonCompleted"
      :markLessonComplete="markLessonComplete"
      @updateLesson="updateLesson"
    />

    <!-- Player gets the whole video spec; it stays dumb -->
    <VideoPlayer :video="source" />

    <VideoQuestions
      v-if="sectionKey && lesson"
      :commonContent="commonContent"
      :languageCodeHL="languageCodeHL"
      :lesson="lesson"
      :sectionKey="sectionKey"
    />

    <q-btn
      :label="
        isLessonCompleted(lesson)
          ? t('interface.completed')
          : t('interface.notCompleted')
      "
      :disable="isLessonCompleted(lesson)"
      class="mark-complete-btn"
      @click="markLessonComplete(lesson)"
    />
  </q-page>
</template>

<style>
.q-page {
  background-color: white;
}
</style>
