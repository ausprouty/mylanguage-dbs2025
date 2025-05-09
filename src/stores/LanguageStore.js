import { defineStore } from "pinia";
import { languageGetters } from './languageGetters';
import { languageActions } from './languageActions';


export const useLanguageStore = defineStore("languageStore", {
  state: () => ({
    currentStudy: "dbs",
    currentPath: null,
    commonContent: {}, // cache: language -> study
    lessonContent: {}, // cache: language -> study -> lesson
    videoUrls: {}, // cache: language -> study
    lessonNumber: {
      dbs: 1,
      lead: 1,
      life: 1,
      jvideo: 1,
    },
    maxLessonNumber: {
      dbs: 23,
      lead: 25,
      life: 23,
      jvideo: 61,
    },
    languages: [],
    languageSelected:{},
    followingHimSegment: "1-0-0",
    jVideoSegments: {
      segments: [],
      currentId: 1,
    },
    previousPage: "/index",
  }),
  getters: languageGetters,
  actions: languageActions,
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'languageStore', // optional; defaults to store ID
        storage: localStorage,
        paths: [
          "currentPath",
          "currentStudy",
          "lessonNumber",
          "languageSelected",
          "followingHimSegment",
          "jVideoSegments",
          "previousPage",
          "languages"
        ],
      }
    ]
  }

});
