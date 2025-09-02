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

const route = useRoute();
const { t } = useI18n({ useScope: "global" });
const settingsStore = useSettingsStore();

useInitializeSettingsStore(route, settingsStore);

const computedStudy = computed(function () {
  return settingsStore.currentStudySelected || "dbs";
});

const computedLessonNumber = computed(function () {
  const fn = settingsStore.lessonNumberForStudy;
  if (typeof fn === "function") {
    return fn(computedStudy.value);
  }
  // fallback if store exposes a simple number
  return typeof settingsStore.lessonNumber === "number"
    ? settingsStore.lessonNumber
    : 1;
});

const computedLanguageHL = computed(function () {
  const sel = settingsStore.languageSelected;
  return sel && sel.languageCodeHL ? sel.languageCodeHL : "eng00";
});

const computedLanguageJF = computed(function () {
  const sel = settingsStore.languageSelected;
  const code = sel && sel.languageCodeJF ? sel.languageCodeJF : "";
  return code != null ? String(code) : "";
});

// Optional variant (?variant=wsu). Accept "variant" or misspelled "varient".
const computedVariant = computed(function () {
  const q = route.query;
  const v = q && (q.variant != null ? q.variant : q.varient);
  const raw = Array.isArray(v) ? v[0] : v;
  if (typeof raw !== "string") return null;
  const lower = raw.trim().toLowerCase();
  const clean = lower.replace(/[^a-z0-9-]/g, "");
  return clean || null;
});

console.log(unref(computedStudy), unref(computedLanguageHL));

// Load common content + progress
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

onMounted(function () {
  try {
    loadProgress();
    loadCommonContent();
  } catch (err) {
    console.error("❌ Could not load common content", err);
  }
});

// Reload when study/languages/variant change
watch(
  [computedLanguageHL, computedLanguageJF, computedStudy, computedVariant],
  function () {
    loadCommonContent();
  }
);

// Child -> parent lesson change
function updateLesson(nextLessonNumber) {
  settingsStore.setLessonNumber(computedStudy.value, nextLessonNumber);
}
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
            ? t('ui.completed')
            : t('ui.notCompleted')
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
