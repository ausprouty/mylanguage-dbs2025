<script>
import { ref, computed, watch, onMounted } from "vue";
import { useContentStore } from "stores/ContentStore";
import { useI18n } from "vue-i18n";
//import DbsQuestions from "src/components/DbsQuestions.vue";
//import VideoBar from "src/components/VideoBar.vue";
//import BibleText from "src/components/BibleTextBar.vue";
// SeriesReviewLastLesson from "src/components/Series/SeriesReviewLastLesson.vue";
//import {
 //// getStudyProgress,
  //saveStudyProgress,
//} from "src/services/IndexedDBService";

export default {
  name: "SeriesLessonContent",
  //components: { DbsQuestions, BibleText, SeriesReviewLastLesson, VideoBar },
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
    const passageReference = ref("No reference found");
    // i18n variables
    const { t } = useI18n();
    const m = (k) => t(`notes.${k}`);
    const lookBackNoteInstruction = m("lookBackNoteInstruction");
    const lookUpNoteInstruction = m("lookUpNoteInstruction");
    const lookForwardNoteInstruction = m("lookForwardNoteInstruction");

    // ✅ Computed section keys (Updates when study or lesson changes)
    const sectionKeyBack = computed(
      () => `${props.study}-${props.lesson}-back`
    );
    const sectionKeyUp = computed(() => `${props.study}-${props.lesson}-up`);
    const sectionKeyForward = computed(
      () => `${props.study}-${props.lesson}-forward`
    );

    // ✅ Load lesson content
    const loadLessonContent = async () => {
      try {
        console.log(
          "Fetching lessonContent with:",
          props.languageCodeHL,
          props.languageCodeJF,
          props.study,
          props.lesson
        );
        lessonContent.value = await contentStore.loadLessonContent(
          props.languageCodeHL,
          props.languageCodeJF,
          props.study,
          props.lesson
        );
        console.log(lessonContent.value);
        updatePassageReference();
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

    // ✅ Update passage reference when lesson content changes
    const updatePassageReference = () => {
      const reference =
        lessonContent.value?.passage.referenceLocalLanguage || "";
      passageReference.value = reference || "No reference found";
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

    // ✅ Watch for lessonContent changes to update passage reference
    watch(lessonContent, updatePassageReference);

    // ✅ Load content when the component mounts
    onMounted(() => {
      loadLessonContent();
    });

    return {
      lessonContent,
      markLessonComplete,
      passageReference,
      sectionKeyBack,
      sectionKeyUp,
      sectionKeyForward,
      lookBackNoteInstruction,
      lookUpNoteInstruction,
      lookForwardNoteInstruction,
    };
  },
};
</script>

<template>
  <div v-if="!lessonContent">
    <p>There is NO lessonContent</p>
  </div>
  <div v-else>
    <h1 class="title dbs">{{ lessonContent.title }}</h1>

   <!-- <SeriesReviewLastLesson :sectionKey="sectionKeyForward" />

    <section v-if="commonContent">
      <DbsQuestions
        :content="commonContent?.look_back || {}"
        :sectionKey="sectionKeyBack"
        :placeholder="lookBackNoteInstruction"
      />

      <DbsQuestions
        :content="commonContent?.look_up || {}"
        :sectionKey="sectionKeyUp"
        :placeholder="lookUpNoteInstruction"
      />
      <BibleText
        :biblePassage="lessonContent.passage"
        :passageReference="passageReference"
        :translation="lessonContent.menu"
      />
      <VideoBar/>

      <DbsQuestions
        :content="commonContent?.look_forward || {}"
        :sectionKey="sectionKeyForward"
        :placeholder="lookForwardNoteInstruction"
      />
    </section>
    --->
  </div>
</template>
