<script>
import NoteSection from "src/components/notes/NoteSection.vue";

export default {
  name: "DbsQuestions",
  components: {
    NoteSection,
  },
  props: {
    content: { type: Object, default: () => ({}) }, // safe fallback
    sectionKey: { type: String, required: true }, // e.g. "life-1-back"
    placeholder: { type: String, default: "Write your notes here" },
  },
};
</script>
<template>
  <section v-if="content">
    <h2 class="ltr dbs">{{ content.title }}</h2>
    <ol class="ltr dbs">
      <li v-for="(item, index) in content.question" :key="'question-' + index">
        {{ item }}
      </li>
    </ol>

    <NoteSection :sectionKey="sectionKey" :placeholder="placeholder" />
  </section>
</template>
