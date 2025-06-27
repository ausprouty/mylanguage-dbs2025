<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker.js";

import SeriesPassageSelect from "src/components/Series/SeriesPassageSelect.vue";
import SeriesSegmentNavigator from "src/components/Series/SeriesSegmentNavigator.vue";
import SeriesLessonContent from "src/components/Series/SeriesLessonContent.vue";

// Access stores and route
const route = useRoute();
const i18n = useI18n();
const { t } = i18n;
const languageStore = useLanguageStore();

const DEFAULTS = {
  study: "dbs",
  lesson: "1",
  languageCodeHL: "eng00",
  languageCodeJF: "529",
};

// ✅ Reactively determine currentStudy and currentLesson
const computedStudy = computed(() =>
  route.params.study ||
  languageStore.currentStudy ||
  DEFAULTS.study
);
const computedLessonNumber = computed(() =>
  route.params.lesson ||
  languageStore.lessonNumberForStudy ||
  DEFAULTS.lesson
);
// Computed values for language codes
const computedLanguageHL = computed( () =>
  route.params.languageCodeHL ||
  languageStore.languageSelected.languageCodeHL ||
  DEFAULTS.languageCodeHL
);
const computedLanguageJF = computed(() =>
  languageStore.languageSelected.languageCodeJF ||
  DEFAULTS.languageCodeJF
);
// Update store initially
languageStore.setCurrentStudy(computedStudy.value);
languageStore.setLessonNumber(computedStudy.value, computedLessonNumber.value);
languageStore.setLanguageCodeHL(computedLanguageHL.value);
languageStore.setLanguageCodeJF(computedLanguageJF.value);



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
      <p>{{ t(`${computedStudy}.para.1`) }}</p>
      <p>{{ t(`${computedStudy}.para.2`) }}</p>
      <p>{{ t(`${computedStudy}.para.3`) }}</p>

    <div>
        <SeriesPassageSelect
          :study="computedStudy"
          :topics="topics"
          :lesson="computedLessonNumber"
          :markLessonComplete="markLessonComplete"
          :isLessonCompleted="isLessonCompleted"
          :completedLessons="completedLessons"
          @updateLesson="updateLesson"
        />
      </div>

      <div>
        <SeriesSegmentNavigator
          :study="computedStudy"
          :lesson="computedLessonNumber"
          @updateLesson="updateLesson"
        />
      </div>
      <hr />
      <SeriesLessonContent
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

  <template v-if="!commonContent">Loading failed. Please try again later.
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
