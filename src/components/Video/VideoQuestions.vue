
<script>
import { watch, toRefs } from "vue";
import DbsQuestions from "src/components/DbsQuestions.vue";
import { useI18n } from "vue-i18n";

export default {
  name: "VideoQuestions",
  components: { DbsQuestions },
  props: {
    commonContent: { type: Object, required: true },
    languageCodeHL: { type: String, required: true },
    lesson: { type: Number, required: true },
    sectionKey: { type: String, required: true },
  },
  setup(props) {
    const { sectionKey } = toRefs(props); // Ensure reactivity
    // Access the i18n instance
    const { t } = useI18n();
    const videoNoteInstruction = t('notes.videoNoteInstruction');

    // Watch for changes in sectionKey and log to console
    watch(sectionKey, (newVal, oldVal) => {
      console.log(`SectionKey changed from '${oldVal}' to '${newVal}'`);
    });

    return {};
  },
};
</script>
<template>
  <div>
    <DbsQuestions
      :content="commonContent"
      :sectionKey="sectionKey"
      :placeholder="videoNoteInstruction"
    />
  </div>

</template>

