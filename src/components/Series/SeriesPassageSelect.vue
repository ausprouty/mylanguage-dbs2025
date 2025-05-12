<template>
  <div>
    <q-select
      filled
      v-model="selectedValue"
      :options="markedTopics"
      option-label="label"
      option-value="value"
      @update:model-value="updateLessonNumber"
      label="Topic"
      class="select"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            {{ scope.opt.label }}
            <q-icon
              name="check_circle"
              class="q-ml-sm"
              color="green"
              v-if="scope.opt.completed"
            />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useContentStore } from "stores/ContentStore";
import {
  getCompletedLessonsFromDB,
  saveCompletedLessonsToDB,
} from "src/services/IndexedDBService";

const props = defineProps({
  study: String,
  topics: Array,
  lesson: Number,
});

const emit = defineEmits(["updateLesson"]); // ✅ Correctly define emit in Composition API

const ContentStore = useContentStore();
const selectedValue = ref({ label: "SELECT", value: 0 });
const completedLessons = ref([]);



onMounted(async () => {
  // Load completed lessons from DB
  completedLessons.value = (await getCompletedLessonsFromDB(props.study)) || [];

  // Then update the select bar
  if (Array.isArray(props.topics) && props.topics.length > 0) {
    updateSelectBar(props.lesson);
  }
});
const markedTopics = computed(() => {
  return props.topics.map((topic) => ({
    ...topic,
    completed: completedLessons.value.includes(topic.value),
  }));
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
watch(
  () => props.lesson,
  (newLesson) => {
    updateSelectBar(newLesson);
  }
);

const updateSelectBar = (lesson) => {
  if (Array.isArray(props.topics) && lesson > 0) {
    const matchingTopic = props.topics.find((topic) => topic.value === lesson);
    if (matchingTopic) {
      selectedValue.value = {
        label: matchingTopic.label,
        value: matchingTopic.value,
      };
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

  ContentStore.setLessonNumber(studyKey, selectedValue.value.value);
  emit("updateLesson", selectedValue.value.value);
};
</script>
