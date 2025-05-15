

<script>
import { ref, watch, onMounted, nextTick } from "vue";
import { getNote, saveNote } from "src/services/NoteService";

export default {
  name: "NoteSection",
  props: {
    sectionKey: { type: String, required: true }, // format: study-lesson-position
    placeholder: { type: String, default: "Write your notes here" }
  },
  setup(props) {
    const note = ref("");
    const textareaRef = ref(null);

    const [study, lesson, position] = props.sectionKey.split("-");

    const loadNote = async () => {
      note.value = await getNote(study, lesson, position);
      await nextTick(); // wait for DOM update
      autoResize();
    };

    const saveNoteContent = async (newVal) => {
      await saveNote(study, lesson, position, newVal);
    };

    const autoResize = () => {
      const el = textareaRef.value;
      if (!el) return;
      el.style.height = 'auto'; // reset
      el.style.height = el.scrollHeight + 'px'; // set to content height
    };

    watch(() => props.sectionKey, loadNote);
    watch(note, (newVal) => {
      saveNoteContent(newVal);
      autoResize();
    });

    onMounted(loadNote);

    return {
      note,
      textareaRef,
      autoResize
    };
  }
};
</script>
<template>
  <textarea
    ref="textareaRef"
    class="dbs-notes notes"
    v-model="note"
    :placeholder="placeholder"
    @input="autoResize"
  ></textarea>
</template>

<style scoped lang="scss">
textarea.dbs-notes {
  width: 100%;
  min-height: 120px;
  resize: none;
  overflow: hidden;
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 6px;

  background-color: $neutral;         // soft off-white/cream
  border: 2px solid $gold-highlight;  // warm highlight border
  color: $minor2;                     // dark brown text
  font-size: 15px;
  font-family: inherit;
  line-height: 1.6;
  box-shadow: 2px 2px 6px $shadow;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

textarea.dbs-notes:focus {
  outline: none;
  border-color: $primary;             // warm brown on focus
  box-shadow: 2px 2px 10px $shadow;
}
</style>

