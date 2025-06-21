
export function buildCommonContentKey(study, languageCodeHL) {
  return `commonContent-${study}-${languageCodeHL}`;
}
export function buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson) {
  return `lessonContent-${study}-${languageCodeHL}-${languageCodeJF}-lesson-${lesson}`;
}
export function buildInterfaceKey(languageCodeHL) {
  return `interface-${languageCodeHL}`;
}
export function buildNotesKey(study, lesson, position) {
  return `notes-${study}-${lesson}-${position}`;;
}
export function buildVideoUrlsKey(study, languageCodeJF) {
  return `videoUrls-${study}-${languageCodeJF}`;
}
