<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "src/stores/SettingsStore";
import { useContentStore } from "stores/ContentStore";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker";

import VideoPlayer from "src/components/video/VideoPlayer.vue";
import SeriesPassageSelect from "src/components/series/SeriesPassageSelect.vue";
//import SeriesSegmentNavigator from "src/components/series/xSeriesSegmentNavigator.vue";
import VideoQuestions from "src/components/video/VideoQuestions.vue";

// Route & i18n
const route = useRoute();
const { t, tm } = useI18n({ useScope: "global" });

// Intro paragraphs (array) for this study
const paras = computed(function () {
  const v = typeof tm === "function" ? tm("jVideo.para") : [];
  return Array.isArray(v) ? v : [];
});

// Stores
const settingsStore = useSettingsStore();
const contentStore = useContentStore();

// Study key (constant for this page)
const currentStudy = "jvideo";

// Language codes (safe fallbacks)
const languageCodeHL = computed(function () {
  return settingsStore.languageCodeHLSelected || "eng00";
});
const languageCodeJF = computed(function () {
  const code = settingsStore.languageCodeJFSelected;
  return code != null ? String(code) : "";
});

// Lesson number is per-study -> call the getter with the key
const lessonNumber = computed(function () {
  const fn = settingsStore.lessonNumberForStudy;
  if (typeof fn === "function") {
    const n = Number(fn(currentStudy));
    return Number.isFinite(n) && n > 0 ? n : 1;
  }
  const n = Number(settingsStore.lessonNumber);
  return Number.isFinite(n) && n > 0 ? n : 1;
});

// Section key for notes/questions block
const sectionKey = computed(function () {
  return lessonNumber.value > 0 ? "video-" + lessonNumber.value : "";
});

// Aliases expected by child components
const computedLessonNumber = lessonNumber;
const computedLanguageHL = languageCodeHL;
const computedSectionKey = sectionKey;

// Common content
const { commonContent, topics, loadCommonContent } = useCommonContent(
  currentStudy,
  languageCodeHL
);

// Video URLs
const videoUrls = ref([]);

const {
  completedLessons,
  isLessonCompleted,
  markLessonComplete,
  loadProgress,
} = useProgressTracker(currentStudy);

async function loadVideoUrls() {
  try {
    videoUrls.value = await contentStore.loadVideoUrls(
      languageCodeJF.value,
      currentStudy
    );
  } catch (err) {
    console.error("Error loading video URLs:", err);
  }
}

function applyRouteParams() {
  settingsStore.setCurrentStudy(currentStudy);

  // helper: >0 integer from route param
  function toPositiveInt(v) {
    const raw = Array.isArray(v) ? v[0] : v;
    const s = String(raw == null ? "" : raw).trim();
    if (!/^\d+$/.test(s)) return undefined;
    const n = Number(s);
    return n > 0 ? n : undefined;
  }

  const routeLesson = toPositiveInt(route.params.lesson);
  if (routeLesson !== undefined) {
    settingsStore.setLessonNumber(currentStudy, routeLesson);
  }

  // optional JF from route
  const rawJF = Array.isArray(route.params.languageCodeJF)
    ? route.params.languageCodeJF[0]
    : route.params.languageCodeJF;
  const jf = String(rawJF == null ? "" : rawJF).trim();
  if (jf && jf.toLowerCase() !== "undefined") {
    settingsStore.setLanguageCodeJF(jf);
  }
}

onMounted(async function () {
  applyRouteParams();
  await Promise.all([loadCommonContent(), loadVideoUrls(), loadProgress()]);
});

watch(languageCodeJF, loadVideoUrls);
watch(languageCodeHL, loadCommonContent);

function updateLesson(nextLessonNumber) {
  settingsStore.setLessonNumber(currentStudy, nextLessonNumber);
}
</script>

<template>
  <q-page padding>
    <h2>{{ t("jvideo.title") }}</h2>
    <p v-for="(p, i) in paras" :key="i">{{ p }}</p>

    <p class="language-select">{{ $t("interface.changeLanguage") }}</p>

    <SeriesPassageSelect
      :study="currentStudy"
      :topics="topics"
      :lesson="computedLessonNumber"
      :completedLessons="completedLessons"
      :isLessonCompleted="isLessonCompleted"
      :markLessonComplete="markLessonComplete"
      @updateLesson="updateLesson"
    />

    

    <VideoPlayer :videoUrls="videoUrls" :lesson="computedLessonNumber" />

    <VideoQuestions
      v-if="sectionKey && computedLessonNumber"
      :commonContent="commonContent"
      :languageCodeHL="computedLanguageHL"
      :lesson="computedLessonNumber"
      :sectionKey="computedSectionKey"
    />

    <q-btn
      :label="
        isLessonCompleted(computedLessonNumber)
          ? t('interface.completed')
          : t('interface.notCompleted')
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
