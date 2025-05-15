// src/composables/useProgressTracker.js
import { getCompletedLessonsFromDB, saveCompletedLessonsToDB } from "src/services/IndexedDBService";
import { ref } from "vue";

export function useProgressTracker(study) {
  const completedLessons = ref([]);

  const loadProgress = async () => {
    completedLessons.value = (await getCompletedLessonsFromDB(study)) || [];
  };

  const isLessonCompleted = (lesson) => {
    return completedLessons.value.includes(lesson);
  };

  const markLessonComplete = async (lesson) => {
    if (!completedLessons.value.includes(lesson)) {
      completedLessons.value.push(lesson);
      await saveCompletedLessonsToDB(study, [...completedLessons.value]);
      console.log(`✅ Marked lesson ${lesson} as complete`);
    } else {
      console.log(`ℹ️ Lesson ${lesson} already marked as complete`);
    }
  };

  return {
    completedLessons,
    isLessonCompleted,
    markLessonComplete,
    loadProgress,
  };
}


