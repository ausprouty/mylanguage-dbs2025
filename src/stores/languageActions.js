

import {
  validateLessonNumber,
  validateSegmentFormat,
  validateNonEmptyString,
  validatePositiveInteger,
} from "./validators";

export const languageActions = {
  

  setCurrentStudy(study) {
    if (!validateNonEmptyString(study)) {
      console.warn(`setCurrentStudy: Invalid study '${study}'.`);
      return;
    }
    this.currentStudy = study;
  },

  setCurrentPath(url) {
    if (!validateNonEmptyString(url)) {
      console.warn(`setCurrentUrl: Invalid URL '${url}'.`);
      return;
    }
    this.currentPath = url;
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
  updateLanguageCodeJF(newCodeJF) {
    if (!this.languageSelected) {
      console.warn('updateLanguageCodeJF: No languageSelected set.');
      return;
    }
    if (!newCodeJF) {
      console.warn('updateLanguageCodeJF: Invalid newCodeJF.');
      return;
    }

    // Shallow clone the object and update only languageCodeJF
    this.languageSelected = {
      ...this.languageSelected,
      languageCodeJF: newCodeJF
    };
  },


  updatePreviousPage(newPage) {
    if (!validateNonEmptyString(newPage)) {
      console.warn(`updatePreviousPage: Invalid page '${newPage}'.`);
      return;
    }
    this.previousPage = newPage;
  },
};
