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
    lessonContentFor:
      (state) => (study, languageCodeHL, languageCodeJF, lesson) => {
        const key = ContentKeys.buildLessonContentKey(
          study,
          languageCodeHL,
          languageCodeJF,
          lesson
        );
        return state.lessonContent[key] || null;
      },

    commonContentFor: (state) => (study, languageCodeHL) => {
      const key = ContentKeys.buildCommonContentKey(study, languageCodeHL);
      return state.commonContent[key] || null;
    },

    videoUrlsFor: (state) => (study, languageCodeJF) => {
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
      if (key) {
        console.log("I am setting commonContent for " + key);
        console.log(data);
        this.commonContent[key] = data;
      } else {
        console.warn("commonContent key is null — skipping set.");
      }
    },

    setLessonContent(study, languageCodeHL, languageCodeJF, lesson, data) {
      const key = ContentKeys.buildLessonContentKey(
        study,
        languageCodeHL,
        languageCodeJF,
        lesson
      );
      if (key) {
        console.log("I am setting lessonContent for " + key);
        console.log(data);
        this.lessonContent[key] = data;
      } else {
        console.warn("lessonContent key is null — skipping set.");
      }
    },

    setVideoUrls(study, languageCodeJF, data) {
      const key = ContentKeys.buildVideoUrlsKey(study, languageCodeJF);
      if (key) {
        this.videoUrls[key] = data;
      } else {
        console.warn("videoUrls key is null — skipping set.");
      }
    },

    async loadCommonContent(languageCodeHL, study) {
      console.log("I am in Content Store about to get CommonContent");
      return await getCommonContent(languageCodeHL, study);
    },

    async loadLessonContent(languageCodeHL, languageCodeJF, study, lesson) {
      const validatedLesson = validateLessonNumber(unref(lesson));
      if (validatedLesson === null) {
        console.warn(`Invalid lesson '${unref(lesson)}'`);
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
