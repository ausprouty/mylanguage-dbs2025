
<script>
import { watch, toRefs } from "vue";
import DbsQuestions from "src/components/DbsQuestions.vue";

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
      placeholder="Write your notes for this video here"
    />
  </div>
</template>

