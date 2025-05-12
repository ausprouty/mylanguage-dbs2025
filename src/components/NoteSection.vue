<template>
  <textarea
    ref="textareaRef"
    class="dbs-notes notes"
    v-model="note"
    :placeholder="placeholder"
    @input="autoResize"
  ></textarea>
</template>

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

<style scoped>
textarea {
  width: 100%;
  min-height: 100px;
  resize: none;
  overflow: hidden;
  margin-top: 8px;
}
</style>
