import { defineStore } from "pinia";
import * as ContentKeys from 'src/utils/ContentKeyBuilder';
import { getCommonContent } from "../services/CommonContentService.js";
import { getLessonContent } from "../services/LessonContentService.js";
import { getJesusVideoUrls } from "../services/VideoContentService.js";

import {
  validateLessonNumber,
  validateSegmentFormat,
  validateNonEmptyString,
  validatePositiveInteger,
} from "./validators";

export const useContentStore = defineStore("contentStore", {
  state: () => ({
    commonContent: {}, // e.g., { 'commonContent-${study}-${languageCodeHL}': 'common HTML' }
    lessonContent: {}, // e.g., { lessonContent-${study}-${languageCodeHL}-lesson-${lesson}': 'lesson HTML' }
    videoUrls: {}, // e.g., { 'videoUrls-${study}-${languageCodeJF}-lesson-${lesson}': ['url1', 'url2'] }
    translationComplete: {
      interface: false,
      commonContent: false,
      lessonContent: false,
    },
  }),

  getters: {
    getCommonContent: (state) => (study, languageCodeHL) => {
      const key = ContentKeys.buildLessonContentKey(study, languageCodeHL) ;
      return state.commonContent[key] || null;
    },

    getLessonContent: (state) => (study, languageCodeHL,languageCodeJF, lesson) => {
      const key = ContentKeys.buildLessonContentKey(
        study, languageCodeHL, languageCodeJF, lesson)
      return state.lessonContent[key] || null;
    },

    getVideoUrls: (state) => (study, languageCodeJF) => {
      const key = ContentKeys.buildVideoUrlsKey(study, languageCodeJF);
      return state.videoUrls[key] || [];
    },
    isFullyTranslated: (state) => {
      return Object.values(state.translationComplete).every(Boolean);
    },
  },
  actions: {
    setCommonContent(study, languageCodeHL, data) {
      const key = ContentKeys.buildLessonContentKey(study, languageCodeHL) ;
      this.commonContent[key] = data;
    },
    setLessonContent(study, languageCodeHL,languageCodeJF, lesson, data) {
       const key = ContentKeys.buildLessonContentKey(
        study, languageCodeHL, languageCodeJF, lesson)
      this.lessonContent[key] = data;
    },

    setVideoUrls(study, languageCodeJF, data) {
       const key = ContentKeys.buildVideoUrlsKey(study, languageCodeJF);
      this.videoUrls[key] = urls;
    },

    async loadCommonContent(languageCodeHL, study) {
      return await getCommonContent(languageCodeHL, study);
    },

    async loadLessonContent(languageCodeHL, languageCodeJF, study, lesson) {
      const validatedLesson = validateLessonNumber(lesson);
      if (validatedLesson === null) {
        console.warn(`Invalid lesson '${lesson}'`);
        return null;
      }
      return await getLessonContent(
        study,
        languageCodeHL,
        languageCodeJF,
        validatedLesson
      );
    },

    async loadVideoUrls(languageCodeJF, study) {
      return await getJesusVideoUrls(languageCodeJF, study);
    },

    clearAllContent() {
      this.commonContent = {};
      this.lessonContent = {};
      this.videoUrls = {};
    },
    // ✅ Mark a specific section complete
    setTranslationComplete(section, value) {
      if (this.translationComplete.hasOwnProperty(section)) {
        this.translationComplete[section] = value;
      } else {
        console.warn(`Unknown translation section: ${section}`);
      }
    },

    // ✅ Reset all flags (e.g., on study/language change)
    clearTranslationComplete() {
      for (const key in this.translationComplete) {
        this.translationComplete[key] = false;
      }
    },
  },

  persist: false, // explicitly disable persistence
});
