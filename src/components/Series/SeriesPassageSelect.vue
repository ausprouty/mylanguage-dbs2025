<script setup>
import { computed } from "vue";
import { useSettingsStore } from "src/stores/SettingsStore";
import { useI18n } from "vue-i18n";

const props = defineProps({
  study: String,
  topics: Array,
  lesson: Number,
  markLessonComplete: Function,
  isLessonCompleted: Function,
  completedLessons: Array,
});

const emit = defineEmits(["updateLesson"]);
const settingsStore = useSettingsStore();
const { t } = useI18n({ useScope: "global" });

// Label reacts to locale changes
const topicLabel = computed(() => t("ui.topic"));

// Localized “SELECT” placeholder with safe fallback
const selectPlaceholder = computed(() => {
  const s = t("ui.select");
  return s === "ui.select" ? "SELECT" : s;
});

// Options with completion flag (safe if arrays are missing)
const markedTopics = computed(() => {
  const topics = Array.isArray(props.topics) ? props.topics : [];
  const completed = Array.isArray(props.completedLessons)
    ? props.completedLessons
    : [];
  return topics.map((topic) => ({
    ...topic,
    completed: completed.indexOf(topic.value) !== -1,
  }));
});

// v-model object: { label, value }
const selectedLesson = computed({
  get() {
    const topics = Array.isArray(props.topics) ? props.topics : [];
    const match = topics.find((t) => t.value === props.lesson);
    return match
      ? { label: match.label, value: match.value }
      : { label: selectPlaceholder.value, value: 0 };
  },
  set(newValue) {
    const value =
      newValue && typeof newValue === "object" ? newValue.value : 0;
    const studyKey = props.study || "dbs";
    settingsStore.setLessonNumber(studyKey, value);
    emit("updateLesson", value);
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
      :label="topicLabel"
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
                <q-icon name="check_circle" color="green" size="sm" class="q-ml-xs" />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>
