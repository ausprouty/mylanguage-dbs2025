
<script setup>
import { ref, onMounted, watch } from "vue";
import { getNote } from "src/services/NoteService";
import { useI18n } from "vue-i18n";

const props = defineProps({
  sectionKey: {
    type: String,
    required: true, // e.g. "study-2-forward"
  },
});

const { t } = useI18n();
const cleanedNote = ref("");
const noteLines = ref([]);
const hasNote = ref(false);
const reviewIntro = ref([]);

// Load previous note and intro paragraphs
const loadPreviousNote = async () => {
  const previousKey = getPreviousSectionKey(props.sectionKey);
  if (!previousKey) {
    hasNote.value = false;
    cleanedNote.value = "";
    noteLines.value = [];
    return;
  }

  const note = await getNoteFromKey(previousKey);
  const trimmed = note.trim();

  if (trimmed.length > 0) {
    cleanedNote.value = trimmed;
    noteLines.value = trimmed
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");
    hasNote.value = true;
    reviewIntro.value = loadIntroParagraphs();
  } else {
    hasNote.value = false;
    cleanedNote.value = "";
    noteLines.value = [];
  }
};

onMounted(loadPreviousNote);

// ✅ Watch for changes in the section key
watch(() => props.sectionKey, loadPreviousNote);


// Compute previous lesson's "look forward" sectionKey
function getPreviousSectionKey(currentKey) {
  const [study, lessonStr, section] = currentKey.split("-");
  const lesson = parseInt(lessonStr, 10);
  if (!study || isNaN(lesson) || section !== "forward" || lesson < 2) return null;

  return `${study}-${lesson - 1}-forward`;
}

// Load the note from IndexedDB
async function getNoteFromKey(key) {
  try {
    return await getNote(...key.split("-"));
  } catch (err) {
    console.error("Failed to load last week note:", err);
    return "";
  }
}

// Dynamically load all review.p1, review.p2, etc. from i18n
function loadIntroParagraphs() {
  const paragraphs = [];
  let index = 1;

  while (true) {
    const key = `review.p${index}`;
    const text = t(key);

    // Break if the translation is missing (fallback returns the key itself)
    if (!text || text === key) break;

    paragraphs.push(text);
    index++;
  }

  return paragraphs;
}


</script>

<template>
  <div class="last-week-box">
    <template v-if="hasNote">
      <p v-for="(para, index) in reviewIntro" :key="'review-' + index">{{ para }}</p>
      <p><strong>📝 Last week you said:</strong></p>
      <p v-for="(line, index) in noteLines" :key="'note-' + index">{{ line }}</p>
    </template>
    <template v-else>
      <p>{{ t("review.empty") }}</p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.last-week-box {
  background-color: $minor1;         // soft beige background
  border-left: 6px solid $gold-highlight; // visual cue for importance
  padding: 16px 20px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 2px 2px 8px $shadow;   // subtle depth
  font-size: 15px;
  color: $minor2;                    // warm dark brown text
  transition: background-color 0.3s ease;
}

.last-week-box strong {
  color: $primary;                   // warm brown header
  font-size: 16px;
}

.last-week-box p {
  margin: 8px 0;
  line-height: 1.5;
}
</style>

