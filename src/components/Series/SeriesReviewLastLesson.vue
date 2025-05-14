
<script>
import NoteSection from "src/components/NoteSection.vue";

export default {
  name: "SeriesReviewLastLesson",
  components: {
    NoteSection
  },
  props: {
    content: { type: Object, default: () => ({})}, // safe fallback
    sectionKey: { type: String, required: true }, // e.g. "life-1-back"

  }
};
</script>
<template>
  <section v-if="content">

      <p v-for="(item, index) in content.question" :key="'question-' + index">
        {{ item }}

    </p>

    <NoteSection :sectionKey="sectionKey" :placeholder="placeholder" />
  </section>
</template>

