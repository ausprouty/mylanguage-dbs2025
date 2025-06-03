import { loadLanguageAsync } from "../i18n/loadLanguage.js";
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

  setFollowingHimSegment(newValue) {
    if (!validateSegmentFormat(newValue)) {
      console.warn(
        `setFollowingHimSegment: Invalid newValue '${newValue}'. Expected format '1-0-0'. No change made.`
      );
      return;
    }
    this.followingHimSegment = newValue;
  },

  setJVideoSegments(languageCodeHL, languageCodeJF, segments, currentId = 1) {
    if (
      !validateNonEmptyString(languageCodeHL) ||
      !validateNonEmptyString(languageCodeJF)
    ) {
      console.warn(
        `setJVideoSegments: Invalid language codes '${languageCodeHL}', '${languageCodeJF}'.`
      );
      return;
    }
    if (!Array.isArray(segments)) {
      console.warn(`setJVideoSegments: Segments should be an array.`);
      return;
    }
    if (!validatePositiveInteger(currentId)) {
      console.warn(
        `setJVideoSegments: Invalid currentId '${currentId}'. Defaulting to 1.`
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

  setLanguages(newLanguages) {
    if (!Array.isArray(newLanguages)) {
      console.warn(`setLanguages: Invalid languages input.`);
      return;
    }
    this.languages = newLanguages;
  },
  async setLanguageObjectSelected(languageObject) {
    if (!languageObject) {
      console.warn("setLanguageObjectSelected: Invalid languageObject input.");
      return;
    }
    this.languageSelected = languageObject;
    // 🟢 Update i18n locale
    console.log(
      `setLanguageObjectSelected: Setting i18n locale to ${languageObject.languageCodeHL}`
    );
    console.log("setLanguageObjectSelected -104");
    await loadLanguageAsync(languageObject.languageCodeHL);

    this._updateRecentLanguages(languageObject);
  },

  _updateRecentLanguages(lang) {
    const index = this.languagesUsed.findIndex(
      (item) => item.languageCodeHL === lang.languageCodeHL
    );
    // Remove existing if already present
    if (index !== -1) {
      this.languagesUsed.splice(index, 1);
    }
    // Add to front
    this.languagesUsed.unshift(lang);

    // Optional: limit to 5 recent items total
    if (this.languagesUsed.length > 5) {
      this.languagesUsed.length = 5;
    }
  },

  setPreviousPage(newPage) {
    if (!validateNonEmptyString(newPage)) {
      console.warn(`setPreviousPage: Invalid page '${newPage}'.`);
      return;
    }
    this.previousPage = newPage;
  },
  updateLanguageCodeJF(newCodeJF) {
    if (!this.languageSelected) {
      console.warn("updateLanguageCodeJF: No languageSelected set.");
      return;
    }
    if (!newCodeJF) {
      console.warn("updateLanguageCodeJF: Invalid newCodeJF.");
      return;
    }

    // Shallow clone the object and update only languageCodeJF
    this.languageSelected = {
      ...this.languageSelected,
      languageCodeJF: newCodeJF,
    };
  },
};
