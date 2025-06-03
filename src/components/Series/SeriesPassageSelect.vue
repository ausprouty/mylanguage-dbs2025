<script setup>
import { computed } from "vue";
import { useLanguageStore } from "stores/LanguageStore";
import { useI18n } from "vue-i18n";

const props = defineProps({
  study: String,
  topics: Array,
  lesson: Number,
  markLessonComplete: Function,
  isLessonCompleted: Function,
  completedLessons: Array,
});
// Access the i18n instance
const { t } = useI18n();
const topicLabel = t('menu.topic')

const emit = defineEmits(["updateLesson"]);
const LanguageStore = useLanguageStore();

// ✅ Computed list of topics with completion status
const markedTopics = computed(() => {
  return props.topics.map((topic) => ({
    ...topic,
    completed: props.completedLessons.includes(topic.value),
  }));
});

// ✅ v-model binding to currently selected lesson
const selectedLesson = computed({
  get() {
    const topic = props.topics.find((t) => t.value === props.lesson);
    return topic
      ? { label: topic.label, value: topic.value }
      : { label: "SELECT", value: 0 };
  },
  set(newValue) {
    const studyKey = props.study || "dbs";
    LanguageStore.setLessonNumber(studyKey, newValue.value);
    emit("updateLesson", newValue.value);
  },
});
</script>


<template>
  <div>
    <q-select
      filled
      v-model="selectedLesson"
      :options="markedTopics"
      option-label="label"
      option-value="value"
      :label= "topicLabel"
      class="select"
    >
      <template v-slot:option="scope">
        <q-item
          v-bind="scope.itemProps"
          :class="{ 'completed-option': scope.opt.completed }"
        >
          <q-item-section>
            <div class="row items-center no-wrap">
              <div class="text-body1">{{ scope.opt.label }}</div>
              <div v-if="scope.opt.completed">
                <q-icon
                  name="check_circle"
                  color="green"
                  size="sm"
                  class="q-ml-xs"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>
