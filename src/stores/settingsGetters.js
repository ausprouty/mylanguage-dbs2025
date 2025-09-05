import { DEFAULTS, MAX_LESSON_NUMBERS } from "src/constants/Defaults";

export const settingsGetters = {
  currentStudySelected: (state) =>
    state.currentStudy || DEFAULTS.study,

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

  isStandardProfile: (s) => s.apiProfile === "standard",

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

  // Pinia getter
  lessonNumberForStudy: (state) => (studyArg) => {
    const study = studyArg ?? state.currentStudy ?? 'dbs';

    console.groupCollapsed(`[store] lessonNumberForStudy("${study}")`);
    console.debug('state.currentStudy =', state.currentStudy);
    console.debug('state.lessonNumber =', state.lessonNumber);

    const dict = state.lessonNumber || {};
    const has =
      dict instanceof Map
        ? dict.has(study)
        : Object.prototype.hasOwnProperty.call(dict, study);

    if (!has) {
      console.warn(`[store] "${study}" not found. Returning default 1.`);
      console.groupEnd();
      return 1;
    }

    const raw =
      dict instanceof Map ? dict.get(study) : dict[study];

    console.debug('raw value =', raw, `(type: ${typeof raw})`);

    const lesson = Number(raw);
    if (!Number.isFinite(lesson) || lesson < 1) {
      console.warn(
        `[store] "${study}" had invalid lesson "${raw}". Returning default 1.`
      );
      console.groupEnd();
      return 1;
    }

    console.debug(`[store] returning lesson = ${lesson}`);
    console.groupEnd();
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

  recentLanguages: (state) => state.languagesUsed || [],

  // current study's variant (null if none set)
  variantForCurrentStudy(state) {
    const s = String(state.currentStudy || "").toLowerCase();
    return state.variantByStudy?.[s] || null;
  },
};
