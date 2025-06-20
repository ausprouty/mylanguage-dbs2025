import { defineStore } from "pinia";

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
      const key = `commonContent-${study}-${languageCodeHL}`;
      return state.commonContent[key] || null;
    },

    getLessonContent: (state) => (study, languageCodeHL,languageCodeJF, lesson) => {
      const key = `lessonContent-${study}-${languageCodeHL}-${languageCodeJF}-lesson-${lesson}`;
      return state.lessonContent[key] || null;
    },

    getVideoUrls: (state) => (study, languageCodeJF) => {
      const key = `videoUrls-${study}-${languageCodeJF}`;
      return state.videoUrls[key] || [];
    },
    isFullyTranslated: (state) => {
      return Object.values(state.translationComplete).every(Boolean);
    },
  },

  actions: {
    setCommonContent(study, languageCodeHL, data) {
      const key = `commonContent-${study}-${languageCodeHL}`;
      this.commonContent[key] = data;
    },

    setLessonContent(study, languageCodeHL, lesson, data) {
      const key = `lessonContent-${study}-${languageCodeHL}-lesson-${lesson}`;
      this.lessonContent[key] = data;
    },

    setVideoUrls(study, languageCodeJF, lesson, urls) {
       const key = `videoUrls-${study}-${languageCodeJF}`;
      this.videoUrls[key] = urls;
    },

    async loadCommonContent(languageCodeHL, study) {
      const key = `commonContent-${study}-${languageCodeHL}`;
      if (this.commonContent[key]) {
        return this.commonContent[key];
      }
      const content = await getCommonContent(languageCodeHL, study);
      this.commonContent[key] = content;
      return content;
    },

    async loadLessonContent(languageCodeHL, languageCodeJF, study, lesson) {
      console.log({ languageCodeHL, study, lesson });
      const validatedLesson = validateLessonNumber(lesson);
      if (validatedLesson === null) {
        console.warn(
          `loadLessonContent: Invalid lesson '${lesson}'. No load performed.`
        );
        return null;
      }
      const key = `lessonContent-${study}-${languageCodeHL}-${languageCodeJF}-lesson-${validatedLesson}`;
      if (this.lessonContent[key]) {
        const content =  this.lessonContent[key];
        console.log (content);
        return content;
      }
      try {
        const content = await getLessonContent(
          study,
          languageCodeHL,
          languageCodeJF,
          lesson
        );
        this.lessonContent[key] = content;
        console.log (content);
        return content;
      } catch (error) {
        console.error("Failed to fetch lesson content:", error);
        throw error;
      }
    },

    async loadVideoUrls(languageCodeJF, study) {
      const key = `videoUrls-${study}-${languageCodeJF}`;
      if (this.videoUrls[key]) {
        return this.videoUrls[key];
      }
      const content = await getJesusVideoUrls(languageCodeJF, study);
      this.videoUrls[key] = content;
      return content;
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
