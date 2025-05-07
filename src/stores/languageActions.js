import {
  getCommonContent,
  getLessonContent,
  getJesusVideoUrls,
} from "src/services/TranslationService";

import {
  validateLessonNumber,
  validateSegmentFormat,
  validateNonEmptyString,
  validatePositiveInteger,
} from "./validators";

export const languageActions = {
  async loadCommonContent(language, study) {
    if (this.commonContent[language]?.[study]) {
      return this.commonContent[language][study];
    }
    const content = await getCommonContent(language, study);
    if (!this.commonContent[language]) {
      this.commonContent[language] = {};
    }
    this.commonContent[language][study] = content;
    return content;
  },

  async loadLessonContent(language, study, lesson) {
    if (!this.lessonContent[language]) {
      this.lessonContent[language] = {};
    }
    if (!this.lessonContent[language][study]) {
      this.lessonContent[language][study] = {};
    }

    const validatedLesson = validateLessonNumber(lesson);
    if (validatedLesson === null) {
      console.warn(
        `loadLessonContent: Invalid lesson '${lesson}'. No load performed.`
      );
      return null;
    }

    if (this.lessonContent[language][study][validatedLesson]) {
      return this.lessonContent[language][study][validatedLesson];
    }

    try {
      const content = await getLessonContent(language, study, validatedLesson);
      this.lessonContent[language][study][validatedLesson] = content;
      return content;
    } catch (error) {
      console.error("Failed to fetch lesson content:", error);
      throw error;
    }
  },

  async loadVideoUrls(language, study) {
    if (this.videoUrls[language]?.[study]) {
      return this.videoUrls[language][study];
    }
    const content = await getJesusVideoUrls(language, study);
    if (!this.videoUrls[language]) {
      this.videoUrls[language] = {};
    }
    this.videoUrls[language][study] = content;
    return content;
  },

  setCurrentStudy(study) {
    if (!validateNonEmptyString(study)) {
      console.warn(`setCurrentStudy: Invalid study '${study}'.`);
      return;
    }
    this.currentStudy = study;
  },

  setCurrentUrl(url) {
    if (!validateNonEmptyString(url)) {
      console.warn(`setCurrentUrl: Invalid URL '${url}'.`);
      return;
    }
    this.currentUrl = url;
  },

  setLessonNumber(study, lesson) {
    console.log(`setLessonNumber called with study=${study}, lesson=${lesson}`);

    if (!this.lessonNumber.hasOwnProperty(study)) {
      console.warn(
        `setLessonNumber: Invalid study '${study}'. No changes made.`
      );
      return;
    }

    const parsedLesson = validateLessonNumber(lesson);
    if (parsedLesson === null) {
      console.warn(
        `setLessonNumber: Invalid lesson '${lesson}'. No changes made.`
      );
      return;
    }

    const clampedLesson = Math.min(parsedLesson, this.maxLessonNumber[study]);
    this.lessonNumber[study] = clampedLesson;
  },

  updateFollowingHimSegment(newValue) {
    if (!validateSegmentFormat(newValue)) {
      console.warn(
        `updateFollowingHimSegment: Invalid newValue '${newValue}'. Expected format '1-0-0'. No change made.`
      );
      return;
    }
    this.followingHimSegment = newValue;
  },

  updateJVideoSegments(
    languageCodeHL,
    languageCodeJF,
    segments,
    currentId = 1
  ) {
    if (
      !validateNonEmptyString(languageCodeHL) ||
      !validateNonEmptyString(languageCodeJF)
    ) {
      console.warn(
        `updateJVideoSegments: Invalid language codes '${languageCodeHL}', '${languageCodeJF}'.`
      );
      return;
    }
    if (!Array.isArray(segments)) {
      console.warn(`updateJVideoSegments: Segments should be an array.`);
      return;
    }
    if (!validatePositiveInteger(currentId)) {
      console.warn(
        `updateJVideoSegments: Invalid currentId '${currentId}'. Defaulting to 1.`
      );
      currentId = 1;
    }

    this.jVideoSegments = {
      languageCodeHL,
      languageCodeJF,
      segments,
      currentId,
    };
  },

  updateLanguages(newLanguages) {
    if (!Array.isArray(newLanguages)) {
      console.warn(`updateLanguages: Invalid languages input.`);
      return;
    }
    this.languages = newLanguages;
  },
  updateLanguageObjectSelected(languageObject) {
    console.log('updateLanguageObjectSelected called with:', languageObject);
    if (!languageObject) {
      console.warn('updateLanguageObjectSelected: Invalid languageObject input.');
      return;
    }
    this.languageSelected = languageObject;

  },

  updatePreviousPage(newPage) {
    if (!validateNonEmptyString(newPage)) {
      console.warn(`updatePreviousPage: Invalid page '${newPage}'.`);
      return;
    }
    this.previousPage = newPage;
  },
};
