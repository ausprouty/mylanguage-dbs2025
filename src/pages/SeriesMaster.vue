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
      :languageCodeHL="computedLanguage"
      :study="route.params.study"
      :lesson="computedLessonNumber"
      :commonContent="commonContent"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { useCommonContent } from "src/composables/useCommonContent";

import SeriesPassageSelect from "src/components/Series/SeriesPassageSelect.vue";
import SeriesSegmentNavigator from "src/components/Series/SeriesSegmentNavigator.vue";
import SeriesLessonContent from "src/components/Series/SeriesLessonContent.vue";

// Access the current route
const route = useRoute();

// Access the i18n instance
const { t } = useI18n();

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
const currentLanguageCodeHL =
  route.params.languageCodeHL || DEFAULTS.languageCodeHL;

// Update store on initial load
languageStore.setCurrentStudy(currentStudy);
languageStore.setLessonNumber(currentStudy, currentLesson);
languageStore.updateLanguageSelected(currentLanguageCodeHL);

// Initialize the composable
const { commonContent, topics, loadCommonContent } = useCommonContent(
  currentStudy,
  currentLanguageCodeHL
);

// Reactive computed properties
const computedLanguage = computed(() => languageStore.languageCodeHLSelected);
const computedLessonNumber = computed(() => languageStore.lessonNumber);

// Load common content when the component mounts
onMounted(() => {
  loadCommonContent();
});

// Watch for changes in computedLanguage and reload common content
watch(computedLanguage, (newLanguage) => {
  loadCommonContent(newLanguage);
});

// Function to update the lesson number
const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(currentStudy, nextLessonNumber);
};
</script>
