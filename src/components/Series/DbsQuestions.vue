<script>
import NoteSection from "src/components/notes/NoteSection.vue";

export default {
  name: "DbsQuestions",
  components: {
    NoteSection,
  },
  props: {
    section: { type: String, required: true }, // e.g. "back, up, forwrd"
    content: { type: Object, default: () => ({}) }, // safe fallback
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

    <NoteSection :sectionKey="section" :placeholder="placeholder" />
  </section>
</template>
