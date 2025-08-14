// stores/LanguageStore.js
import { defineStore } from "pinia";
import { languageGetters } from './languageGetters';
import { languageActions } from './languageActions';

export const useLanguageStore = defineStore("languageStore", {
  state: () => ({
    currentStudy: "ctc",
    appVersion: null,
    currentPath: null,

    // keep defaults; we will merge/fill later
    lessonNumber: { ctc: 1, lead: 1, life: 1, jvideo: 1 },
    maxLessons: {},

    menu: [],
    menuStatus: 'idle',
    menuError: null,

    languages: [],
    languageSelected: {},
    languagesUsed: [],
    followingHimSegment: "1-0-0",
    jVideoSegments: { segments: [], currentId: 1 },
    previousPage: "/index",
  }),
  getters: languageGetters,
  actions: languageActions,
  persist: {
    enabled: true,
    strategies: [{
      key: 'languageStore',
      storage: localStorage,
      paths: [
        "appVersion","currentPath","currentStudy",
        "lessonNumber","maxLessons","menu",
        "languageSelected","languagesUsed",
        "followingHimSegment","jVideoSegments",
        "previousPage","languages"
      ],
      // 👇 these hooks run when the plugin restores persisted state
      beforeRestore: (ctx) => { /* optional logging */ },
      afterRestore: (ctx) => {
        ctx.store.normalizeShapes();
      }
    }]
  }
});
