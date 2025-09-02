import { normId, normIntish } from 'src/utils/normalize'

// Ensure a normalized part is present
function ensure(part, label) {
  if (!part) throw new Error(`Invalid key part: ${label}`)
  return part
}

export function buildCommonContentKey(study, languageCodeHL, variant = null) {
  const s  = ensure(normId(study), 'study')
  const hl = ensure(normId(languageCodeHL), 'languageCodeHL')
  const v  = variant ? ensure(normId(variant), 'variant') : ''
  return v ? `commonContent-${s}-${hl}-v-${v}` : `commonContent-${s}-${hl}`
}

export function buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson) {
  const s  = ensure(normId(study), 'study')
  const hl = ensure(normId(languageCodeHL), 'languageCodeHL')
  const jf = ensure(normIntish(languageCodeJF), 'languageCodeJF')
  const l  = ensure(normIntish(lesson), 'lesson')
  return `lessonContent-${s}-${hl}-${jf}-lesson-${l}`
}

export function buildInterfaceKey(languageCodeHL) {
  const hl = ensure(normId(languageCodeHL), 'languageCodeHL')
  return `interface-${hl}`
}

export function buildNotesKey(study, lesson, position) {
  const s  = ensure(normId(study), 'study')
  const l  = ensure(normIntish(lesson), 'lesson')
  // default position to '0' after normalization
  const p  = normIntish(position)
  const pos = p || '0'
  return `notes-${s}-${l}-${pos}`
}

export function buildVideoUrlsKey(study, languageCodeJF) {
  const s  = ensure(normId(study), 'study')
  const jf = ensure(normIntish(languageCodeJF), 'languageCodeJF')
  return `videoUrls-${s}-${jf}`
}

export function buildStudyProgressKey(study) {
  const s = ensure(normId(study), 'study')
  return `progress-${s}`
}
