import { defineStore } from "pinia";
import { languageGetters } from './languageGetters';
import { languageActions } from './languageActions';


export const useLanguageStore = defineStore("languageStore", {
  state: () => ({
    currentStudy: "dbs",
    currentPath: null,
    lessonNumber: {
      dbs: 1,
      lead: 1,
      life: 1,
      jvideo: 1,
    },
    
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
          "currentPath",
          "currentStudy",
          "lessonNumber",
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
