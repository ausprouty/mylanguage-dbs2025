
import {  normJF, normHL ,isHLCode} from 'src/utils/normalize'
import { getTranslatedInterface } from "src/services/InterfaceService";
import { MAX_LESSON_NUMBERS } from "src/constants/Defaults";
import {
  validateLessonNumber,
  validateSegmentFormat,
  validateNonEmptyString,
  validatePositiveInteger,
} from "./validators";

export const settingsActions = {
  _updateRecentLanguages(lang) {
    const index = this.languagesUsed.findIndex(
      (item) => item.languageCodeHL === lang.languageCodeHL
    );
    if (index !== -1) {
      this.languagesUsed.splice(index, 1);
    }
    this.languagesUsed.unshift(lang);
    if (this.languagesUsed.length > 5) {
      this.languagesUsed.length = 5;
    }
  },

  normalizeShapes() {
    if (
      !this.lessonNumber ||
      typeof this.lessonNumber !== "object" ||
      Array.isArray(this.lessonNumber)
    ) {
      this.lessonNumber = { ctc: 1, lead: 1, life: 1, jvideo: 1 };
    }
    if (
      !this.maxLessons ||
      typeof this.maxLessons !== "object" ||
      Array.isArray(this.maxLessons)
    ) {
      this.maxLessons = {};
    }
    if (!Array.isArray(this.menu)) this.menu = [];
  },
  setApiProfile(val) {
    this.apiProfile =
      typeof val === "string" && val.trim() ? val.trim() : "standard";
  },

  setBrandTitle(title) {
    this.brandTitle = typeof title === "string" ? title.trim() : "";
  },


  setCurrentStudy(study) {
    if (!validateNonEmptyString(study)) {
      console.warn(`setCurrentStudy: Invalid study '${study}'.`);
      return;
    }
    this.currentStudy = study;
  },

  setFollowingHimSegment(newValue) {
    if (!validateSegmentFormat(newValue)) {
      console.warn(
        `setFollowingHimSegment: Invalid newValue '${newValue}'. ` +
          `Expected format '1-0-0'. No change made.`
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
        `setJVideoSegments: Invalid language codes '${languageCodeHL}', ` +
          `'${languageCodeJF}'.`
      );
      return;
    }
    if (!Array.isArray(segments)) {
      console.warn(`setJVideoSegments: Segments should be an array.`);
      return;
    }
    if (!validatePositiveInteger(currentId)) {
      console.warn(
        `setJVideoSegments: Invalid currentId '${currentId}'. ` +
          `Defaulting to 1.`
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
  // HL like "eng00", "mrt00" (3 letters + 2 digits, case-insensitive)
  setLanguageCodeHL(code) {
    const c = normHL(code);
    if (!c) {
      console.warn(`setLanguageCodeHL: invalid HL '${code}'.`);
      return false;
    }
    if (!this.languageSelected) this.languageSelected = {};
    this.languageSelected.languageCodeHL = c; // ✅ write state only
    return true;
  },

  setLanguageCodeJF(code) {
    const c = normJF(code);
    if (!c) {
      console.warn(`setLanguageCodeJF: invalid JF '${code}'.`);
      return false;
    }
    if (!this.languageSelected) this.languageSelected = {};
    this.languageSelected.languageCodeJF = c; // ✅ write state only
    return true;
  },

  async setLanguageObjectSelected(languageObject) {
    if (!languageObject) {
      console.warn("setLanguageObjectSelected: Invalid languageObject input.");
      return;
    }
    this.languageSelected = languageObject;
    console.log(
      `setLanguageObjectSelected: Setting i18n locale to ` +
        `${languageObject.languageCodeHL}`
    );
    console.log("setLanguageObjectSelected -104");
    await getTranslatedInterface(languageObject.languageCodeHL);
    this._updateRecentLanguages(languageObject);
  },

  setLanguages(newLanguages) {
    if (!Array.isArray(newLanguages)) {
      console.warn(`setLanguages: Invalid languages input.`);
      return;
    }
    this.languages = newLanguages;
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

    const clampedLesson = Math.min(parsedLesson, MAX_LESSON_NUMBERS[study]);
    this.lessonNumber[study] = clampedLesson;
  },


  setVariantForStudy(study, v) {
    const s = study?.toLowerCase();
    const clean = (typeof v === 'string')
      ? v.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      : null;
    this.variantByStudy[s] = clean || null;
  },

  updateLanguageCodeHL(newCodeHL) {
    if (!this.languageSelected) {
      console.warn("updateLanguageCodeHL: No languageSelected set.");
      return;
    }
    if (!newCodeHL) {
      console.warn("updateLanguageCodeHL: Invalid newCodeHL.");
      return;
    }

    this.languageSelected = {
      ...this.languageSelected,
      languageCodeHL: newCodeHL,
    };
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

    this.languageSelected = {
      ...this.languageSelected,
      languageCodeJF: newCodeJF,
    };
  },
};



