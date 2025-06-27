<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguageStore } from "stores/LanguageStore";
import { useInitializeLanguageStore } from "src/composables/useInitializeLanguageStore.js";
import { useCommonContent } from "src/composables/useCommonContent";
import SeriesPassageSelect from "src/components/Series/SeriesPassageSelect.vue";



// 🧭 Setup
const route = useRoute();
const { t } = useI18n();
const languageStore = useLanguageStore();

// 🌱 Initialize from route/store/defaults
useInitializeLanguageStore(route, languageStore);

// 🔁 Computed values
const computedStudy = computed(() => languageStore.currentStudy);
const computedLessonNumber = computed(() => languageStore.lessonNumberForStudy);
const computedLanguageHL = computed(
  () => languageStore.languageSelected.languageCodeHL
);

//


// 📖 Common content
const { commonContent, loadCommonContent } = useCommonContent(
  computedStudy,
  computedLanguageHL
);

// 🔄 Load on mount
onMounted(() => {
  loadCommonContent();
});

// 👀 Watch for changes
watch([computedStudy, computedLanguageHL], () => {
  loadCommonContent();
});
</script>

<template>
  <template v-if="commonContent">
    <q-page padding>
      <h2>{{ t(`${computedStudy}.title`) }}</h2>
      <p>{{ t(`${computedStudy}.para.1`) }}</p>
      <p>{{ t(`${computedStudy}.para.2`) }}</p>
      <p>{{ t(`${computedStudy}.para.3`) }}</p>

      <SeriesPassageSelect
        :study="computedStudy"
        :topics="commonContent.topic"
        :lesson="computedLessonNumber"
        :markLessonComplete="markLessonComplete"
        :isLessonCompleted="isLessonCompleted"
        :completedLessons="completedLessons"
        @updateLesson="updateLesson"
      />
    </q-page>
  </template>

  <template v-else>
    <q-page padding>
      <p>Loading failed. Please try again later.</p>
    </q-page>
  </template>
</template>
