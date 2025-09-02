<script setup>
import { computed, onMounted, watch, unref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "src/stores/SettingsStore";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker.js";
import { useInitializeSettingsStore } from "src/composables/useInitializeSettingsStore.js";
import SeriesPassageSelect from "src/components/series/SeriesPassageSelect.vue";
import SeriesSegmentNavigator from "src/components/series/SeriesSegmentNavigator.vue";
import SeriesLessonFramework from "src/components/series/SeriesLessonFramework.vue";

// Access stores and route
const route = useRoute();
const i18n = useI18n();
const { t } = i18n;
const settingsStore = useSettingsStore();
console.log("i opened language store");

useInitializeSettingsStore(route, settingsStore);

const computedStudy = computed(() => settingsStore.currentStudySelected);
const computedLessonNumber = computed(() => settingsStore.lessonNumberForStudy);
const computedLanguageHL = computed(
  () => settingsStore.languageSelected.languageCodeHL
);
const computedLanguageJF = computed(() => {
  const code = settingsStore.languageSelected.languageCodeJF;
  return code != null ? String(code) : "";
});
// Optional variant (e.g., /series/hope?variant=wsu)
const computedVariant = computed(() => {
  const q = route.query;
  const v = q.variant != null ? q.variant : q.varient; // accept both spellings

  // Vue Router may give string[]; take the first item
  const raw = Array.isArray(v) ? v[0] : v;

  if (typeof raw !== 'string') return null;

  const t = raw.trim().toLowerCase();
  const clean = t.replace(/[^a-z0-9-]/g, '');
  return clean || null;
});


console.log(unref(computedStudy), unref(computedLanguageHL));
// ✅ Load content
const { commonContent, topics, loadCommonContent } = useCommonContent(
  computedStudy,
  computedLanguageHL,
  computedVariant
);

const {
  completedLessons,
  isLessonCompleted,
  markLessonComplete,
  loadProgress,
} = useProgressTracker(computedStudy);

// Load on mount
onMounted(() => {
  try {
    loadProgress();
    loadCommonContent();
  } catch (err) {
    console.error("❌ Could not load common content", err);
  }
});

// Watch language or study changes
watch([computedLanguageHL, computedLanguageJF, computedStudy,computedVariant], () => {
  loadCommonContent();
});

// Lesson update function
const updateLesson = (nextLessonNumber) => {
  settingsStore.setLessonNumber(computedStudy.value, nextLessonNumber);
};
</script>
<template>
  <template v-if="commonContent">
    <q-page padding>
      <h1 class="dbs">{{ t(`${computedStudy}.title`) }}</h1>
      <p v-for="(para, index) in $tm(`${computedStudy}.para`)" :key="index">
        {{ para }}
      </p>

      <p class="language-select">{{ $t("menu.changeLanguage") }}</p>

      <SeriesPassageSelect
        :study="computedStudy"
        :topics="topics"
        :lesson="computedLessonNumber"
        :markLessonComplete="markLessonComplete"
        :isLessonCompleted="isLessonCompleted"
        :completedLessons="completedLessons"
        @updateLesson="updateLesson"
      />

      <SeriesSegmentNavigator
        :study="computedStudy"
        :lesson="computedLessonNumber"
        @updateLesson="updateLesson"
      />

      <hr />
      <SeriesLessonFramework
        :languageCodeHL="computedLanguageHL"
        :languageCodeJF="computedLanguageJF"
        :study="computedStudy"
        :lesson="computedLessonNumber"
        :commonContent="commonContent"
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

  <template v-else>
    <q-page padding>
      <div class="text-negative text-h6">
        Loading failed. Please try again later.
      </div>
    </q-page>
  </template>
</template>
