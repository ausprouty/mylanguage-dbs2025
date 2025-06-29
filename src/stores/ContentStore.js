import { defineStore } from "pinia";
import * as ContentKeys from "src/utils/ContentKeyBuilder";
import { getCommonContent } from "../services/CommonContentService.js";
import { getLessonContent } from "../services/LessonContentService.js";
import { getJesusVideoUrls } from "../services/VideoContentService.js";
import { unref } from "vue";

import {
  validateLessonNumber,
  validateSegmentFormat,
  validateNonEmptyString,
  validatePositiveInteger,
} from "./validators";

export const useContentStore = defineStore("contentStore", {
  state: () => ({
    commonContent: {}, // e.g., { 'commonContent-${study}-${languageCodeHL}': 'common HTML' }
    lessonContent: {}, // e.g., { 'lessonContent-${study}-${languageCodeHL}-${languageCodeJF}-lesson-${lesson}': 'lesson HTML' }
    videoUrls: {}, // e.g., { 'videoUrls-${study}-${languageCodeJF}-lesson-${lesson}': ['url1', 'url2'] }
    translationComplete: {
      interface: false,
      commonContent: false,
      lessonContent: false,
    },
  }),

  getters: {
    getCommonContent: (state) => (study, languageCodeHL) => {
      console.log("getting commonContent for", unref(study));
      const key = ContentKeys.buildCommonContentKey(study, languageCodeHL);
      return state.commonContent[key] || null;
    },

    getLessonContent: (state) => (study, languageCodeHL, languageCodeJF, lesson) => {
      const key = ContentKeys.buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson);
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
      const key = ContentKeys.buildCommonContentKey(study, languageCodeHL);
      console.log("I am setting commonContent for " + key);
      this.commonContent[key] = data;
    },

    setLessonContent(study, languageCodeHL, languageCodeJF, lesson, data) {
      const key = ContentKeys.buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson);
      this.lessonContent[key] = data;
    },

    setVideoUrls(study, languageCodeJF, data) {
      const key = ContentKeys.buildVideoUrlsKey(study, languageCodeJF);
      this.videoUrls[key] = data;
    },

    async loadCommonContent(languageCodeHL, study) {
      return await getCommonContent(languageCodeHL, study);
    },

    async loadLessonContent(languageCodeHL, languageCodeJF, study, lesson) {
      const validatedLesson = validateLessonNumber(unref(lesson));
      if (validatedLesson === null) {
        console.warn(`Invalid lesson '${unref(lesson)}'`);
        return null;
      }
      return await getLessonContent(study, languageCodeHL, languageCodeJF, validatedLesson);
    },

    async loadVideoUrls(languageCodeJF, study) {
      return await getJesusVideoUrls(languageCodeJF, study);
    },

    clearAllContent() {
      this.commonContent = {};
      this.lessonContent = {};
      this.videoUrls = {};
    },

    setTranslationComplete(section, value) {
      if (this.translationComplete.hasOwnProperty(section)) {
        this.translationComplete[section] = value;
      }
    },

    clearTranslationComplete() {
      for (const key in this.translationComplete) {
        this.translationComplete[key] = false;
      }
    },
  },

  persist: false, // explicitly disable persistence
});
