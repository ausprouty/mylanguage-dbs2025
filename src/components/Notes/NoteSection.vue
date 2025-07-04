

// NoteSection.vue
<script>
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { getNote, saveNote } from "src/services/NoteService";
import { useLanguageStore } from 'stores/LanguageStore';
import debounce from 'lodash.debounce';

export default {
  name: "NoteSection",
  props: {
    section: { type: String, required: true }, // "back", "up", "forward"
    placeholder: { type: String, default: "Write your notes here" }
  },
  setup(props) {
    const note = ref("");
    const textareaRef = ref(null);

    const languageStore = useLanguageStore();

    const study = computed(() => languageStore.currentStudySelected);
    const lesson = computed(() => languageStore.lessonNumberForStudy);

    const loadNote = async () => {
      note.value = await getNote(study.value, lesson.value, props.section);
      await nextTick();
      autoResize();
    };

    const saveNoteContent = debounce(async (newVal) => {
      await saveNote(study.value, lesson.value, props.position, newVal);
    }, 800);


    const autoResize = () => {
      const el = textareaRef.value;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    };

    // Watch the lesson or study changing — reload the note
    watch([study, lesson], loadNote);

    // Watch note value changing — save and resize
    watch(note, (newVal) => {
      saveNoteContent(newVal);
      autoResize();
    });

    onMounted(loadNote);

    return {
      note,
      textareaRef,
      autoResize,
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
    @blur="saveNoteContent.flush && saveNoteContent.flush()"
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

