<template>
  <section v-if="content">
    <h2 class="ltr dbs">{{ content.title }}</h2>
    <ol class="ltr dbs">
      <li v-for="(item, index) in content.question" :key="'question-' + index">
        {{ item }}
      </li>
    </ol>
    <textarea
      class="dbs-notes notes"
      v-model="note"
      :placeholder="placeholder"
    ></textarea>

  </section>
</template>

<script>
import { ref, watch, onMounted } from "vue";


export default {
  props: {
    content: { type: Object, required: true },
    sectionKey: { type: String, required: true },
    placeholder: { type: String, default: "Write your notes here" },

  },
  setup(props) {
    const note = ref("");

    // Load notes from localStorage
    const loadNotes = () => {
      console.log("🔄 Loading notes for sectionKey:", props.sectionKey);
      const storedNotes = localStorage.getItem(`notes-${props.sectionKey}`);

      note.value = storedNotes ? storedNotes : ""; // Default to empty if not found
    };

    // Watch `sectionKey` and reload notes when it changes
    watch(() => props.sectionKey, (newKey, oldKey) => {
      console.log(`🔄 SectionKey changed from '${oldKey}' to '${newKey}'`);
      loadNotes();
    });

    // Watch for changes in `note` and save to localStorage
    watch(note, (newNote) => {
      console.log("💾 Saving notes for", props.sectionKey, ":", newNote);
      localStorage.setItem(`notes-${props.sectionKey}`, newNote);
    });

    // Load notes on component mount
    onMounted(loadNotes);

    return {
      note,
    };
  },
};
</script>

<style scoped>
textarea {
  width: 100%;
  height: 100px;
  margin-top: 8px;
}
</style>
