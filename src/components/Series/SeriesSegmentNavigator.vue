
<script setup>
import { computed, ref } from "vue";
import { useLanguageStore } from "stores/LanguageStore";

const props = defineProps({
  study: String,
  lesson: Number,
});

const emit = defineEmits(["updateLesson"]);

const languageStore = useLanguageStore();
const minLesson = ref(1);
const maxLesson = computed(() => languageStore.maxLesson);

// ✅ Ensure `currentLesson` is always a number
const currentLesson = computed(() => {
  const lesson = languageStore.lessonNumber[props.study] || 1;
  return Number(lesson); // Convert to number to avoid string concatenation issue
});

const showNextLesson = () => {
  const nextLesson = currentLesson.value + 1;
  console.log("Study:", props.study);
  console.log("Next Lesson:", nextLesson);
  languageStore.setLessonNumber(props.study, nextLesson);
  emit("updateLesson", nextLesson);
};

const showPreviousLesson = () => {
  const previousLesson = currentLesson.value - 1;
  console.log("Study:", props.study);
  console.log("Previous Lesson:", previousLesson);
  languageStore.setLessonNumber(props.study, previousLesson);
  emit("updateLesson", previousLesson);
};
</script>
<template>
  <div class="lesson-navigation">
    <!-- Previous Button -->
    <div
      v-if="currentLesson > minLesson"
      class="nav-button prev"
      @click="showPreviousLesson"
    >
      <q-btn flat dense round icon="arrow_back" aria-label="Previous" />
      <span>Previous</span>
    </div>

    <!-- Next Button -->
    <div
      v-if="currentLesson < maxLesson"
      class="nav-button next"
      @click="showNextLesson"
    >
      <span>Next</span>
      <q-btn flat dense round icon="arrow_forward" aria-label="Next" />
    </div>
  </div>
</template>


<style scoped>
/* Parent container to position elements on opposite sides */
.lesson-navigation {
  display: flex;
  justify-content: space-between; /* Pushes items to opposite sides */
  align-items: center;
  width: 100%;
  position: relative;
  padding: 40px 20px; /* Space above and below */
}

/* Previous button on the left */
.prev {
  position: absolute;
  left: 20px;
}

/* Next button on the right */
.next {
  position: absolute;
  right: 20px;
}
</style>
