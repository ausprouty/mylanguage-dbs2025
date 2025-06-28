import { unref } from 'vue';

export function buildCommonContentKey(study, languageCodeHL) {
  const s = unref(study);
  const hl = unref(languageCodeHL);
  const key = `commonContent-${s}-${hl}`;
  console.log(key);
  return key;
}

export function buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson) {
  const s = unref(study);
  const hl = unref(languageCodeHL);
  const jf = unref(languageCodeJF);
  const l = unref(lesson);
  return `lessonContent-${s}-${hl}-${jf}-lesson-${l}`;
}

export function buildInterfaceKey(languageCodeHL) {
  const hl = unref(languageCodeHL);
  return `interface-${hl}`;
}

export function buildNotesKey(study, lesson, position) {
  const s = unref(study);
  const l = unref(lesson);
  const p = unref(position);
  return `notes-${s}-${l}-${p}`;
}

export function buildVideoUrlsKey(study, languageCodeJF) {
  const s = unref(study);
  const jf = unref(languageCodeJF);
  return `videoUrls-${s}-${jf}`;
}
