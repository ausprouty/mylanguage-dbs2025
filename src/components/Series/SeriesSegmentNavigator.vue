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
const maxLesson = computed(() => languageStore.getMaxLesson(props.study));

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

/* Styles for rounded navigation buttons */
.nav-button {
  display: flex;
  align-items: center;
  background-color: #3498db; /* Blue background */
  color: white; /* White text */
  padding: 5px 15px; /* Spacing inside the button */
  border-radius: 50px; /* Makes it rounded */
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* Soft shadow */
  transition: background 0.3s ease, transform 0.2s ease;
}

/* Hover effect (background changes when hovering anywhere inside the button) */
.nav-button:hover {
  background-color: darkred; /* Darker red on hover */
  transform: scale(1.05);
}

/* Active effect (when button is pressed) */
.nav-button.active {
  background-color: #8b0000; /* Even darker red when clicked */
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
