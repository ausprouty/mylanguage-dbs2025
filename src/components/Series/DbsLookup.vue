<script setup>
import { ref, watch, onMounted } from "vue";
import BibleTextDisplayed from "src/components/bible/BibleTextBar.vue";
import NoteSection from "src/components/Notes/NoteSection.vue";

const props = defineProps({
  content: { type: Object, required: true },
  sectionKey: { type: String, required: true },
  placeholder: { type: String, default: "Write your notes here" },
  timing: { type: String, default: "" },
  biblePassage: { type: Object, required: true },
  passageReference: { type: Object, required: true },
  translation: { type: String, required: true },
});

const note = ref("");

const loadNotes = () => {
  console.log("🔄 Loading notes for sectionKey:", props.sectionKey);
  const storedNotes = localStorage.getItem(`notes-${props.sectionKey}`);
  note.value = storedNotes || "";
};

watch(
  () => props.sectionKey,
  (newKey, oldKey) => {
    console.log(`🔄 SectionKey changed from '${oldKey}' to '${newKey}'`);
    loadNotes();
  }
);

watch(note, (newNote) => {
  console.log("💾 Saving notes for", props.sectionKey, ":", newNote);
  localStorage.setItem(`notes-${props.sectionKey}`, newNote);
});

onMounted(loadNotes);
</script>
<template>
  <section v-if="content">
    <h2 class="ltr dbs">{{ content.title }}</h2>
    <p class="timing">{{ timing }}</p>
    <ol class="ltr dbs">
      <li
        v-for="(item, index) in content.instruction"
        :key="'instruction-' + index"
      >
        {{ item }}
      </li>
    </ol>

    <BibleTextDisplayed
      :biblePassage="biblePassage"
      :passageReference="passageReference"
      :translation="translation"
    />

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

<style scoped>
textarea {
  width: 100%;
  height: 100px;
  margin-top: 8px;
}
</style>
