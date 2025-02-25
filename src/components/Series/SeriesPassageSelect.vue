<template>
  <div>
    <q-select
      filled
      v-model="selectedValue"
      :options="topics"
      option-label="label"
      option-value="value"
      @update:model-value="updateLessonNumber"
      label="Topic"
      class="select"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useLanguageStore } from "stores/LanguageStore";

const props = defineProps({
  study: String,
  topics: Array,
  lesson: Number,
});

const emit = defineEmits(["updateLesson"]); // ✅ Correctly define emit in Composition API

const languageStore = useLanguageStore();
const selectedValue = ref({ label: "SELECT", value: 0 });

onMounted(() => {
  if (Array.isArray(props.topics) && props.topics.length > 0) {
    updateSelectBar(props.lesson);
  }
});

// Watch for changes in topics
watch(
  () => props.topics,
  (newTopics) => {
    if (Array.isArray(newTopics) && newTopics.length > 0) {
      updateSelectBar(props.lesson);
    }
  },
  { immediate: true }
);

// Watch for changes in the lesson prop
watch(() => props.lesson, (newLesson) => {
  updateSelectBar(newLesson);
});

const updateSelectBar = (lesson) => {
  if (Array.isArray(props.topics) && lesson > 0) {
    const matchingTopic = props.topics.find((topic) => topic.value === lesson);
    if (matchingTopic) {
      selectedValue.value = { label: matchingTopic.label, value: matchingTopic.value };
    } else {
      resetSelectBar();
    }
  } else {
    resetSelectBar();
  }
};

const resetSelectBar = () => {
  selectedValue.value = { label: "SELECT", value: 0 };
};

const updateLessonNumber = () => {
  const studyKey = props.study || "dbs"; // ✅ Ensure "dbs" is used if no study is provided

  languageStore.setLessonNumber(studyKey, selectedValue.value.value);
  emit("updateLesson", selectedValue.value.value);
};
</script>
