import { defineStore } from "pinia";
import { languageGetters } from './languageGetters';
import { languageActions } from './languageActions';


export const useLanguageStore = defineStore("languageStore", {
  state: () => ({
    currentStudy: "ctc",
    appVersion: null,
    currentPath: null,
    // from public-<site>/menu.json
    lessonNumber: {},
    maxLessons: {},
    menu:[],

    languages: [],
    languageSelected:{},
    languagesUsed: [],
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
          "appVersion",
          "currentPath",
          "currentStudy",
          "lessonNumber",
          "maxLessons",
          "menu",
          "languageSelected",
          "languagesUsed",
          "followingHimSegment",
          "jVideoSegments",
          "previousPage",
          "languages"
        ],
      }
    ]
  }

});
