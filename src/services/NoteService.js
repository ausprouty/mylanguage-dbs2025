import { unref } from 'vue'
import { normId, normIntish } from 'src/utils/normalize'
import { useContentStore } from '../stores/ContentStore'
import { buildNotesKey } from 'src/utils/ContentKeyBuilder'
import {
  getNoteFromDB,
  saveNoteToDB,
  deleteNoteFromDB
} from './IndexedDBService'



export async function getNote(study, lesson, position) {
  const studyId = normPart(study)
  const lessonId = normIntish(lesson)
  const posId = normIntish(position)

  if (!studyId || !lessonId || !posId) {
    console.error('getNote missing params', { study, lesson, position })
    return ''
  }

  const store = useContentStore()
  store.lessonContent ||= {} // ensure object exists

  const key = buildNotesKey(studyId, lessonId, posId)

  if (store.lessonContent[key] !== undefined) {
    return store.lessonContent[key]
  }

  const note = await getNoteFromDB(studyId, lessonId, posId)
  if (note !== undefined) {
    store.lessonContent[key] = note
    return note
  }

  return ''
}

export async function saveNote(study, lesson, position, content) {
  const studyId = normPart(study)
  const lessonId = normIntish(lesson)
  const posId = normIntish(position)
  const text = String(unref(content) ?? '')

  if (!studyId || !lessonId || !posId) {
    console.error('saveNote missing params', { study, lesson, position })
    return
  }

  const store = useContentStore()
  store.lessonContent ||= {}

  const key = buildNotesKey(studyId, lessonId, posId)
  store.lessonContent[key] = text
  await saveNoteToDB(studyId, lessonId, posId, text)
}

export async function deleteNote(study, lesson, position) {
  const studyId = normPart(study)
  const lessonId = normIntish(lesson)
  const posId = normIntish(position)

  if (!studyId || !lessonId || !posId) {
    console.error('deleteNote missing params', { study, lesson, position })
    return
  }

  const store = useContentStore()
  store.lessonContent ||= {}

  const key = buildNotesKey(studyId, lessonId, posId)
  delete store.lessonContent[key]
  await deleteNoteFromDB(studyId, lessonId, posId)
}
