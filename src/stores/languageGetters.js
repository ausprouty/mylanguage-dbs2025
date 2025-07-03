import {DEFAULTS, MAX_LESSON_NUMBERS} from "src/constants/Defaults";

export const languageGetters = {
  languageCodeHLSelected: (state) =>
    state.languageSelected?.languageCodeHL || DEFAULTS.languageCodeHL,

  languageCodeJFSelected: (state) =>
    state.languageSelected?.languageCodeJF || DEFAULTS.languageCodeJF,

  languageIdSelected: (state) => state.languageSelected?.languageId ?? null,

  languageObjectSelected: (state) =>
    state.languageSelected || {
      languageCodeHL: DEFAULTS.languageCodeHL,
      languageCodeJF: DEFAULTS.languageCodeJF,
    },

  recentLanguages: (state) => state.languagesUsed || [],

  currentStudySelected: (state) => state.currentStudy || DEFAULTS.study,

  lessonNumberForStudy: (state) => {
    const study = state.currentStudy;
    if (!state.lessonNumber.hasOwnProperty(study)) {
      console.warn(
        `lessonNumber: '${study}' not found. Returning default lesson 1.`
      );
      return 1;
    }

    const lesson = parseInt(state.lessonNumber[study], 10);
    if (isNaN(lesson) || lesson < 1) {
      console.warn(
        `lessonNumber: '${study}' had invalid lesson '${lesson}'. Returning default 1.`
      );
      return 1;
    }

    return lesson;
  },

  maxLesson: (state) => {
    const study = state.currentStudy;

    if (!MAX_LESSON_NUMBERS.hasOwnProperty(study)) {
      console.warn(`maxLesson: '${study}' not found. Returning default max 1.`);
      return 1;
    }

    const max = parseInt(MAX_LESSON_NUMBERS[study], 10);
    if (isNaN(max) || max < 1) {
      console.warn(
        `maxLesson: '${study}' had invalid max '${max}'. Returning default 1.`
      );
      return 1;
    }

    return max;

  },

  isAtMaxLesson: (state) => {
    const study = state.currentStudy;

    const lesson = parseInt(state.lessonNumber?.[study], 10);
    const max = parseInt(MAX_LESSON_NUMBERS?.[study], 10);

    if (isNaN(lesson) || lesson < 1 || isNaN(max) || max < 1) {
      console.warn(
        `isAtMaxLesson: Invalid values for '${study}'. lesson=${lesson}, max=${max}`
      );
      return false;
    }

    return lesson >= max;
  },

};
