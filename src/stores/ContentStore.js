import { defineStore } from "pinia";
import {
  getCommonContent,
  getLessonContent,
  getJesusVideoUrls,
} from "../services/CommonContentService.js";

import {
  validateLessonNumber,
  validateSegmentFormat,
  validateNonEmptyString,
  validatePositiveInteger,
} from "./validators";

export const useContentStore = defineStore("ContentStore", {
  state: () => ({
    commonContent: {}, // e.g., { 'life-eng00': 'common HTML' }
    lessonContent: {}, // e.g., { 'life-eng00-lesson-1': 'lesson HTML' }
    videoUrls: {}, // e.g., { 'life-eng00-lesson-1': ['url1', 'url2'] }
  }),

  getters: {
    getCommonContent: (state) => (study, languageCodeHL) => {
      const key = `${study}-${languageCodeHL}`;
      return state.commonContent[key] || null;
    },

    getLessonContent: (state) => (study, languageCodeHL, lesson) => {
      const key = `${study}-${languageCodeHL}-Lesson-${lesson}`;
      return state.lessonContent[key] || null;
    },

    getVideoUrls: (state) => (study, languageCodeHL, lesson) => {
      const key = `${study}-${languageCodeHL}-Lesson-${lesson}`;
      return state.videoUrls[key] || [];
    },
  },

  actions: {
    setCommonContent(study, languageCodeHL, data) {
      const key = `${study}-${languageCodeHL}`;
      this.commonContent[key] = data;
    },

    setLessonContent(study, languageCodeHL, lesson, data) {
      const key = `${study}-${languageCodeHL}-Lesson-${lesson}`;
      this.lessonContent[key] = data;
    },

    setVideoUrls(study, languageCodeHL, lesson, urls) {
      const key = `${study}-${languageCodeHL}-Lesson-${lesson}`;
      this.videoUrls[key] = urls;
    },

    async loadCommonContent(languageCodeHL, study) {
      if (this.commonContent[languageCodeHL]?.[study]) {
        return this.commonContent[languageCodeHL][study];
      }
      const content = await getCommonContent(languageCodeHL, study);
      if (!this.commonContent[languageCodeHL]) {
        this.commonContent[languageCodeHL] = {};
      }
      this.commonContent[languageCodeHL][study] = content;
      return content;
    },

    async loadLessonContent(languageCodeHL, study, lesson) {
      console.log(languageCodeHL);
      console.log(study);
      console.log(lesson);
      if (!this.lessonContent[languageCodeHL]) {
        this.lessonContent[languageCodeHL] = {};
      }
      if (!this.lessonContent[languageCodeHL][study]) {
        this.lessonContent[languageCodeHL][study] = {};
      }

      const validatedLesson = validateLessonNumber(lesson);
      if (validatedLesson === null) {
        console.warn(
          `loadLessonContent: Invalid lesson '${lesson}'. No load performed.`
        );
        return null;
      }

      if (this.lessonContent[languageCodeHL][study][validatedLesson]) {
        return this.lessonContent[languageCodeHL][study][validatedLesson];
      }

      try {
        const content = await getLessonContent(
          languageCodeHL,
          study,
          validatedLesson
        );
        this.lessonContent[languageCodeHL][study][validatedLesson] = content;
        return content;
      } catch (error) {
        console.error("Failed to fetch lesson content:", error);
        throw error;
      }
    },

    async loadVideoUrls(languageCodeHL, study) {
      if (this.videoUrls[languageCodeHL]?.[study]) {
        return this.videoUrls[languageCodeHL][study];
      }
      const content = await getJesusVideoUrls(languageCodeHL, study);
      if (!this.videoUrls[languageCodeHL]) {
        this.videoUrls[languageCodeHL] = {};
      }
      this.videoUrls[languageCodeHL][study] = content;
      return content;
    },
    clearAllContent() {
      this.commonContent = {};
      this.lessonContent = {};
      this.videoUrls = {};
    },
  },

  persist: false, // explicitly disable persistence
});
