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

    <!-- Bible Passage Section (Optional) -->
    <div v-if="biblePassage" class="bible-container">
      <div>
        <h3 class="dbs">{{ passageReference }}</h3>
      </div>
      <div v-html="biblePassage.passageText" class="bible-text"></div>
      <div>
        <a :href="biblePassage.passageUrl" class="readmore-button">
          {{ biblePassage.readMoreText }}
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, watch, onMounted } from "vue";

export default {
  props: {
    content: { type: Object, required: true },
    sectionKey: { type: String, required: true }, // Unique key for localStorage
    placeholder: { type: String, default: "Write your notes here" },
    biblePassage: { type: Object, default: null },
    passageReference: { type: String, default: "No reference found" },
  },
  setup(props) {
    const note = ref("");

    // Load notes from localStorage
    const loadNotes = () => {
      console.log("🔄 Loading notes for sectionKey:", props.sectionKey);
      const storedNotes = localStorage.getItem(`notes-${props.sectionKey}`);

      if (storedNotes) {
        console.log("✅ Found stored notes:", storedNotes);
        note.value = storedNotes;
      } else {
        console.log("❌ No notes found, clearing note input.");
        note.value = ""; // Clear notes when sectionKey changes
      }
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
    onMounted(() => {
      loadNotes();
    });

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
