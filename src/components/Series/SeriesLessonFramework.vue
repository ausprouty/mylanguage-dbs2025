<script>
import { ref, computed, watch, onMounted } from "vue";
import { useContentStore } from "stores/ContentStore";
import { useI18n } from "vue-i18n";
import DbsQuestions from "src/components/series/DbsQuestions.vue";
import SeriesLessonContent from "src/components/series/SeriesLessonContent.vue";
import SeriesReviewLastLesson from "src/components/series/SeriesReviewLastLesson.vue";
import {
  getStudyProgress,
  saveStudyProgress,
} from "src/services/IndexedDBService";

export default {
  name: "SeriesLessonContent",

  components: { DbsQuestions, SeriesLessonContent, SeriesReviewLastLesson },
  props: {
    languageCodeHL: { type: String, required: true },
    languageCodeJF: { type: String, required: true },
    study: { type: String, required: true },
    lesson: { type: Number, required: true },
    commonContent: { type: Object, required: true },
  },
  setup(props) {
    const contentStore = useContentStore();
    const lessonContent = ref(null);
    // i18n variables
    const { t } = useI18n();
    const m = (k) => t(`notes.${k}`);
    const lookBackNoteInstruction = m("lookBackNoteInstruction");
    const lookUpNoteInstruction = m("lookUpNoteInstruction");
    const lookForwardNoteInstruction = m("lookForwardNoteInstruction");

    // ✅ Load lesson content
    const loadLessonContent = async () => {
      try {
        lessonContent.value = await contentStore.loadLessonContent(
          props.languageCodeHL,
          props.languageCodeJF,
          props.study,
          props.lesson
        );
        console.log(lessonContent.value);
      } catch (error) {
        console.error("Error loading lesson content:", error);
      }
    };
    // ✅ Mark lesson as complete
    // This function is called when the user clicks the "Mark as Complete" button
    // It updates the completed lessons in the IndexedDB
    // and logs the result to the console

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

    // ✅ Watch for lesson OR language change
    watch(
      () => [props.lesson, props.languageCodeHL],
      async ([newLesson, newLanguage], [oldLesson, oldLanguage]) => {
        console.log(
          `🔄 Lesson changed from ${oldLesson} to ${newLesson}, or language changed from ${oldLanguage} to ${newLanguage}. Reloading content...`
        );
        await loadLessonContent();
      }
    );

    // ✅ Watch for lessonContent changes
    watch(lessonContent);

    // ✅ Load content when the component mounts
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
    <p>Your lesson content is loading</p>
  </div>
  <div v-else>
    <h1 class="title dbs">{{ lessonContent.title }}</h1>

    <SeriesReviewLastLesson />

    <section v-if="commonContent">
      <DbsQuestions
        :section="look_back"
        :content="commonContent?.look_back || {}"
        :placeholder="lookBackNoteInstruction"
      />

      <SeriesLessonContent
        :section="look_up"
        :commonContent="commonContent?.look_up || {}"
        :lessonContent = "lessonContent"
        :placeholder="lookUpNoteInstruction"
      />

      <DbsQuestions
        :section="look_forward"
        :content="commonContent?.look_forward || {}"
        :placeholder="lookForwardNoteInstruction"
      />
    </section>
  </div>
</template>
