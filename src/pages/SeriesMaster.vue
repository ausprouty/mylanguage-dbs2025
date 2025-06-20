<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker.js";

import SeriesPassageSelect from "src/components/Series/SeriesPassageSelect.vue";
import SeriesSegmentNavigator from "src/components/Series/SeriesSegmentNavigator.vue";
import SeriesLessonContent from "src/components/Series/SeriesLessonContent.vue";

// Access the current route
const route = useRoute();

// Access the i18n instance
const i18n = useI18n();
const { t } =  i18n;

// Access the language store
const languageStore = useLanguageStore();

// Default values
const DEFAULTS = {
  study: "dbs",
  lesson: "1",
  languageCodeHL: "eng00",
};

// Set defaults if parameters are not provided
const currentStudy = route.params.study || DEFAULTS.study;
const currentLesson = route.params.lesson || DEFAULTS.lesson;

// Update store on initial load
languageStore.setCurrentStudy(currentStudy);
languageStore.setLessonNumber(currentStudy, currentLesson);



// Reactive computed properties
const computedLanguageHL = computed(
  () => languageStore.languageSelected.languageCodeHL
);
const computedLanguageJF = computed(
  () => languageStore.languageSelected.languageCodeJF
);
const computedLessonNumber = computed(() => languageStore.lessonNumberForStudy);

// Initialize the composable
const { commonContent, topics, loadCommonContent } = useCommonContent(
  currentStudy,
  computedLanguageHL
);
// Progress tracker

const {
  completedLessons,
  isLessonCompleted,
  markLessonComplete,
  loadProgress,
} = useProgressTracker(currentStudy);

// Load common content when the component mounts
onMounted(() => {
  loadProgress();  // find out which lessons you have completed
  loadCommonContent(); // use composable to load Common Content
  //console.log('Locales:', i18n.availableLocales);
  //console.log('Locales Messages:', i18n.getLocaleMessage('eng00'));
});

// Watch for changes in computedLanguageHL and reload common content
watch(computedLanguageHL, (newLanguage) => {
  loadCommonContent(newLanguage);
});
watch(computedLanguageJF, (newLanguage) => {
  loadCommonContent(newLanguage);
});

// Function to update the lesson number
const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(currentStudy, nextLessonNumber);
};
</script>
<template>
  <q-page padding>
    <h2>{{ t(`${currentStudy}.title`) }}</h2>
    <p>{{ t(`${currentStudy}.para.1`) }}</p>
    <p>{{ t(`${currentStudy}.para.2`) }}</p>
    <p>{{ t(`${currentStudy}.para.3`) }}</p>

    <div>
      <SeriesPassageSelect
        :study="route.params.study"
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
        :study="route.params.study"
        :lesson="computedLessonNumber"
        @updateLesson="updateLesson"
      />
    </div>

    <hr />

    <SeriesLessonContent
      :languageCodeHL="computedLanguageHL"
      :languageCodeJF="computedLanguageJF"
      :study="route.params.study"
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
