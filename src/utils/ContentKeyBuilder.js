import { unref } from 'vue';

/**
 * Validates a key part to ensure it's usable (not object/undefined/null).
 * Returns unwrapped value if valid, otherwise throws an error.
 */
function safePart(value, label) {
  const v = unref(value);
  const type = typeof v;

  if (v === undefined || v === null) {
    console.error(`Key part "${label}" is missing or null.`);
    throw new Error(`Invalid key part: "${label}" is ${v}`);
  }

  if (type === 'object') {
    console.error(`Key part "${label}" is an object:`, v);
    throw new Error(`Invalid key part: "${label}" is an object`);
  }

  return v;
}

export function buildCommonContentKey(study, languageCodeHL) {
  try {
    const s = safePart(study, 'study');
    const hl = safePart(languageCodeHL, 'languageCodeHL');
    return `commonContent-${s}-${hl}`;
  } catch {
    return null;
  }
}

export function buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson) {
  try {
    const s = safePart(study, 'study');
    const hl = safePart(languageCodeHL, 'languageCodeHL');
    const jf = safePart(languageCodeJF, 'languageCodeJF');
    const l = safePart(lesson, 'lesson');
    return `lessonContent-${s}-${hl}-${jf}-lesson-${l}`;
  } catch {
    return null;
  }
}

export function buildInterfaceKey(languageCodeHL) {
  try {
    const hl = safePart(languageCodeHL, 'languageCodeHL');
    return `interface-${hl}`;
  } catch {
    return null;
  }
}

export function buildNotesKey(study, lesson, position) {
  try {
    const s = safePart(study, 'study');
    const l = safePart(lesson, 'lesson');
    const p = safePart(position ?? '0', 'position'); // default fallback to '0'
    return `notes-${s}-${l}-${p}`;
  } catch {
    return null;
  }
}

export function buildVideoUrlsKey(study, languageCodeJF) {
  try {
    const s = safePart(study, 'study');
    const jf = safePart(languageCodeJF, 'languageCodeJF');
    return `videoUrls-${s}-${jf}`;
  } catch {
    return null;
  }
}

export function buildStudyProgressKey(study) {
  try {
    const s = safePart(study, 'study');
    return `progress-${s}`;
  } catch {
    return null;
  }
}
