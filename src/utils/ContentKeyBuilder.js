import { unref } from 'vue';
import { DEFAULTS } from "src/constants/Defaults";


export function buildCommonContentKey(study, languageCodeHL) {
  const s = unref(study) || DEFAULTS.study;
  const hl = unref(languageCodeHL) || DEFAULTS.languageCodeHL;
  const key = `commonContent-${s}-${hl}`;
  console.log(key);
  return key;
}

export function buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson) {
  const s = unref(study) || DEFAULTS.study;
  const hl = unref(languageCodeHL) || DEFAULTS.languageCodeHL;
  const jf = unref(languageCodeJF) || DEFAULTS.languageCodeJF;
  const l = unref(lesson) || DEFAULTS.lesson;
  const key = `lessonContent-${s}-${hl}-${jf}-lesson-${l}`;
  console.log(key);
  return key;
}

export function buildInterfaceKey(languageCodeHL) {
  const hl = unref(languageCodeHL) || DEFAULTS.languageCodeHL;
  return `interface-${hl}`;
}

export function buildNotesKey(study, lesson, position) {
  const s = unref(study) || DEFAULTS.study;
  const l = unref(lesson) || DEFAULTS.lesson;
  const p = unref(position) ?? "0"; // use 0 if null/undefined
  return `notes-${s}-${l}-${p}`;
}

export function buildVideoUrlsKey(study, languageCodeJF) {
  const s = unref(study) || DEFAULTS.study;
  const jf = unref(languageCodeJF) || DEFAULTS.languageCodeJF;
  return `videoUrls-${s}-${jf}`;
}

export function buildStudyProgressKey(study){
  const s = unref(study) || DEFAULTS.study;
  return `progress-${s}`;
}
