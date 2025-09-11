<script setup>
import { inject } from "vue";
import { useVideoMasterVM } from "src/composables/useVideoMasterVM";
import VideoPlayer from "src/components/video/VideoPlayer.vue";
import SeriesPassageSelect from "src/components/series/SeriesPassageSelect.vue";
import VideoQuestions from "src/components/video/VideoQuestions.vue";

const toggleRightDrawer = inject("toggleRightDrawer", () => {});
const {
  heading,
  paras,
  topics,

  lesson,
  languageCodeHL,
  languageCodeJF,
  sectionKey,

  showLanguageSelect,
  showSeriesPassage,
  source,

  completedLessons,
  isLessonCompleted,
  markLessonComplete,

  updateLesson,
  commonContent,
} = useVideoMasterVM();
</script>

<template>
  <q-page padding>
    <h2 v-if="heading">{{ heading }}</h2>
    <p v-for="(p, i) in paras" :key="i">{{ p }}</p>

    <q-btn
      v-if="showLanguageSelect"
      :label="$t('interface.changeLanguage')"
      icon="language"
      no-caps
      class="mark-complete-btn q-mb-md"
      @click="toggleRightDrawer()"
    />


    <SeriesPassageSelect
      v-if="showSeriesPassage"
      :study="$route.params.study"
      :topics="topics"
      :lesson="lesson"
      :completedLessons="completedLessons"
      :isLessonCompleted="isLessonCompleted"
      :markLessonComplete="markLessonComplete"
      class="q-mb-md"
      @updateLesson="updateLesson"
    />

    <VideoPlayer :source="source" />

    <VideoQuestions
      v-if="sectionKey && lesson"
      :commonContent="commonContent"
      :languageCodeHL="languageCodeHL"
      :lesson="lesson"
      :sectionKey="sectionKey"
    />

    <q-btn
      :label="isLessonCompleted(lesson) ? $t('interface.completed') : $t('interface.notCompleted')"
      :disable="isLessonCompleted(lesson)"
      class="mark-complete-btn"
      @click="markLessonComplete(lesson)"
    />
  </q-page>
</template>

<style>
.q-page { background-color: white; }
</style>
