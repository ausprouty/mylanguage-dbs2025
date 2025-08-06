<script setup>
import { computed, onMounted, watch, unref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker.js";
import { useInitializeLanguageStore } from "src/composables/useInitializeLanguageStore.js";
import SeriesPassageSelect from "src/components/series/SeriesPassageSelect.vue";
import SeriesSegmentNavigator from "src/components/series/SeriesSegmentNavigator.vue";
import SeriesLessonFramework from "src/components/series/SeriesLessonFramework.vue";

// Access stores and route
const route = useRoute();
const i18n = useI18n();
const { t } = i18n;
const languageStore = useLanguageStore();
console.log("i opened language store");

useInitializeLanguageStore(route, languageStore);

const computedStudy = computed(() => languageStore.currentStudySelected);
const computedLessonNumber = computed(() => languageStore.lessonNumberForStudy);
const computedLanguageHL = computed(
  () => languageStore.languageSelected.languageCodeHL
);
const computedLanguageJF = computed(() => {
  const code = languageStore.languageSelected.languageCodeJF;
  return code != null ? String(code) : "";
});

console.log(unref(computedStudy), unref(computedLanguageHL));
// ✅ Load content
const { commonContent, topics, loadCommonContent } = useCommonContent(
  computedStudy,
  computedLanguageHL
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
watch([computedLanguageHL, computedLanguageJF, computedStudy], () => {
  loadCommonContent();
});

// Lesson update function
const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(computedStudy.value, nextLessonNumber);
};
</script>
<template>
  <template v-if="commonContent">
    <q-page padding>
      <h2>{{ t(`${computedStudy}.title`) }}</h2>
      <p v-for="(para, index) in $tm(`${computedStudy}.para`)" :key="index">
        {{ para }}
      </p>

     <p>{{ $t('changeLanguage') }}</p>

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

<style lang="scss">
.mark-complete-btn {
  background-color: darken($positive, 15%); // #6a4e42
  color: white; // #6a4e42
  font-weight: bold;
  border-radius: 8px;

  &:hover {
    background-color: darken($positive, 30%);
  }
}
</style>
