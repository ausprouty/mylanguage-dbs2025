<script>
import { computed, watch, onMounted } from "vue";
import { useContentStore } from "stores/ContentStore";
import { useI18n } from "vue-i18n";

import DbsSection from "src/components/series/DbsSection.vue";
import LookupSection from "src/components/series/LookupSection.vue";
import SeriesReviewLastLesson from "src/components/series/SeriesReviewLastLesson.vue";

import {
  getStudyProgress,
  saveStudyProgress,
} from "src/services/IndexedDBService";

export default {
  name: "SeriesLessonFramework",

  components: {
    DbsSection,
    LookupSection,
    SeriesReviewLastLesson,
  },

  props: {
    languageCodeHL: { type: String, required: true },
    languageCodeJF: { type: String, required: true },
    study: { type: String, required: true },
    lesson: { type: Number, required: true },
    commonContent: { type: Object, required: true },
  },

  setup(props) {
    const contentStore = useContentStore();

    // 🎯 Use computed to get the latest lesson content reactively from the store
    const lessonContent = computed(() =>
      contentStore.lessonContentFor(
        props.study,
        props.languageCodeHL,
        props.languageCodeJF,
        props.lesson
      )
    );

    // 🌍 i18n helpers
    const { t } = useI18n();
    const m = (k) => t(`notes.${k}`);
    const lookBackNoteInstruction = m("lookBackNoteInstruction");
    const lookUpNoteInstruction = m("lookUpNoteInstruction");
    const lookForwardNoteInstruction = m("lookForwardNoteInstruction");

    // 🔄 Loads lesson content into the store by calling the store action
    const loadLessonContent = async () => {
      try {
        await contentStore.loadLessonContent(
          props.languageCodeHL,
          props.languageCodeJF,
          props.study,
          props.lesson
        );
        console.log("✅ Lesson content requested and loading into store.");
      } catch (error) {
        console.error("❌ Error loading lesson content:", error);
      }
    };

    // ✅ Called when user clicks "Mark as Complete"
    const markLessonComplete = async () => {
      const { study, lesson } = props;
      try {
        const completed = (await getStudyProgress(study)) || [];
        if (!completed.includes(lesson)) {
          completed.push(lesson);
          await saveStudyProgress(study, completed);
          console.log(`✅ Marked lesson ${lesson} as complete`);
        } else {
          console.log(`ℹ️ Lesson ${lesson} already marked as complete`);
        }
      } catch (error) {
        console.error("❌ Failed to mark lesson complete:", error);
      }
    };

    // 📡 Watch for changes in the lesson number or language and reload content
    watch(
      () => [props.lesson, props.languageCodeHL],
      async ([newLesson, newLang], [oldLesson, oldLang]) => {
        console.log(
          `🔄 Lesson changed (${oldLesson} → ${newLesson}) or language changed (${oldLang} → ${newLang}). Reloading content...`
        );
        await loadLessonContent();
      }
    );

    // 🚀 Initial content load on mount
    onMounted(() => {
      loadLessonContent();
    });

    return {
      lessonContent,
      markLessonComplete,
      lookBackNoteInstruction,
      lookUpNoteInstruction,
      lookForwardNoteInstruction,
    };
  },
};
</script>

<template>
  <div v-if="!lessonContent">
    <p>Your lesson content is loading...</p>
  </div>
  <div v-else>
    <h1 class="title dbs">{{ lessonContent.title }}</h1>

    <SeriesReviewLastLesson />

    <DbsSection
      section="look_back"
      :content="commonContent?.look_back || {}"
      :placeholder="lookBackNoteInstruction"
      :timing="commonContent?.timing || ''"
    />

    <LookupSection
      section="look_up"
      :commonContent="commonContent?.look_up || {}"
      :lessonContent="lessonContent"
      :placeholder="lookUpNoteInstruction"
      :timing="commonContent?.timing || ''"
    />

    <DbsSection
      section="look_forward"
      :content="commonContent?.look_forward || {}"
      :placeholder="lookForwardNoteInstruction"
      :timing="commonContent?.timing || ''"
    />
  </div>
</template>
