<template>
  <q-page padding>
    <h2>{{ t('jVideo.title') }}</h2>
    <p>{{ t('jVideo.para.1') }}</p>
    <p>{{ t('jVideo.para.2') }}</p>
    <div>
      <SeriesPassageSelect
        :study="currentStudy"
        :topics="topics"
        :lesson="computedLessonNumber"
        @updateLesson="updateLesson"
      />
    </div>
    <div>
      <SeriesSegmentNavigator
        :study="currentStudy"
        :lesson="computedLessonNumber"
        @updateLesson="updateLesson"
      />
    </div>
    <div>
      <VideoPlayer
        :videoUrls="videoUrls"
        :lesson="computedLessonNumber"
      />
    </div>
    <div>
      <VideoQuestions
        :commonContent="commonContent"
        :languageCodeHL = "computedLanguageHL"
        :lesson = "computedLessonNumber"
        :sectionKey="computedSectionKey"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from 'stores/LanguageStore';
import { useCommonContent } from 'src/composables/useCommonContent';

import VideoPlayer from 'src/components/Video/VideoPlayer.vue';
import SeriesPassageSelect from 'src/components/Series/SeriesPassageSelect.vue';
import SeriesSegmentNavigator from 'src/components/Series/SeriesSegmentNavigator.vue';
import VideoQuestions from 'src/components/Video/VideoQuestions.vue';

// Access the current route
const route = useRoute();

// Access the i18n instance
const { t } = useI18n();

// Access the language store
const languageStore = useLanguageStore();

// Props
const props = defineProps({
  video: String,
  lesson: Number,
  languageCodeHL: String,
  languageCodeJF: String,
});

// Static study name
const currentStudy = 'jvideo';

// Set initial values in store
languageStore.setCurrentStudy(currentStudy);
const currentLesson = route.params.lesson || languageStore.getLessonNumber;
const currentLanguageCodeHL = route.params.languageCodeHL || languageStore.getLanguageCodeHLSelected;
const currentLanguageCodeJF = route.params.languageCodeJF || languageStore.getLanguageCodeJFSelected;



languageStore.setLessonNumber(currentStudy, currentLesson);
languageStore.updateLanguageSelected(currentLanguageCodeHL, currentLanguageCodeJF);

// Initialize the composable
const { commonContent, topics, loadCommonContent } = useCommonContent(currentStudy, currentLanguageCodeHL);

// Reactive computed properties
const computedLanguageHL = computed(() => languageStore.getLanguageCodeHLSelected);
const computedLessonNumber = computed(() => languageStore.getLessonNumber);
const computedLanguageJF = computed(() => languageStore.getLanguageCodeJFSelected);
const computedSectionKey = computed(() => `video-${computedLessonNumber.value}`);



// 🔹 Reactive video URLs
const videoUrls = ref([]);

// ✅ Function to load video URLs
const loadVideoUrls = async () => {
  try {
    videoUrls.value = await languageStore.loadVideoUrls(computedLanguageJF.value, currentStudy);
  } catch (error) {
    console.error('Error loading video URLs:', error);
  }
};

// Load common content when the component mounts
onMounted(async () => {

  await loadCommonContent();
  await loadVideoUrls();  // Ensures video URLs load at startup
});

// ✅ Watch `computedLanguageJF` and update video URLs when it changes
watch(computedLanguageJF, async (newLanguageJF) => {
  console.log('Language changed:', newLanguageJF);
  await loadVideoUrls();
});
// Watch for changes in computedLanguage and reload common content
watch(computedLanguageHL, async (newLanguage) => {
  await loadCommonContent(newLanguage);
});

// Function to update the lesson number
const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(currentStudy, nextLessonNumber);
  console.log (computedSectionKey)
  console.log("Lesson updated:", nextLessonNumber);
  console.log("New computedSectionKey:", computedSectionKey.value); // Check if it updates
};
</script>


<style>
.q-page {
  background-color: white;
}
</style>
