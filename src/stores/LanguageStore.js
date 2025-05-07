import { defineStore } from "pinia";
import { languageGetters } from './languageGetters';
import { languageActions } from './languageActions';


export const useLanguageStore = defineStore("languageStore", {
  state: () => ({
    currentStudy: "dbs",
    currentUrl: null,
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
    languageSelected: {
      languageCodeHL: "eng00",
      languageCodeJF: 529,
      value: 3,
    },
    followingHimSegment: "1-0-0",
    jVideoSegments: {
      languageCodeHL: "eng00",
      languageCodeJF: "529",
      segments: [],
      currentId: 1,
    },
    previousPage: "/index",
  }),
  getters: languageGetters,
  actions: languageActions,
  persist: {
    paths: [
      "currentStudy",
      "lessonNumber",
      "languageSelected",
      "followingHimSegment",
      "jVideoSegments",
      "previousPage",
      "languages",
    ],
  },
});