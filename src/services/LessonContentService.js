import { normId, normIntish } from 'src/utils/normalize'
import { useContentStore } from 'stores/ContentStore'
import { getContentWithFallback } from 'src/services/ContentLoaderService'
import { buildLessonContentKey } from 'src/utils/ContentKeyBuilder'
import {
  getLessonContentFromDB,
  saveLessonContentToDB
} from './IndexedDBService'




export async function getLessonContent(
  study,
  languageCodeHL,
  languageCodeJF,
  lesson
) {
  const studyId = normId(study)
  const hl = normId(languageCodeHL)
  const jf = normIntish(languageCodeJF)
  const lessonId = normIntish(lesson)

  if (!studyId || !hl || !jf || !lessonId) {
    console.error('Missing required params', { study, languageCodeHL, languageCodeJF, lesson })
    throw new Error('getLessonContent requires study, languageCodeHL, languageCodeJF, and lesson')
  }

  // You said your URL order is /hl/jf/study/lesson
  const url = `/translate/lessonContent/${hl}/${jf}/${studyId}/${lessonId}`
  const key = buildLessonContentKey(studyId, hl, jf, lessonId)
  const contentStore = useContentStore()

  console.log('getLessonContent url:', url)
  console.log('getLessonContent key:', key)

  const result = await getContentWithFallback({
    key,
    store: contentStore,
    storeGetter: (store) => store.lessonContentFor(studyId, hl, jf, lessonId),
    storeSetter: (store, data) =>
      store.setLessonContent(studyId, hl, jf, lessonId, data),
    dbGetter: () => getLessonContentFromDB(studyId, hl, jf, lessonId),
    dbSetter: (data) => saveLessonContentToDB(studyId, hl, jf, lessonId, data),
    apiUrl: url,
    translationType: 'lessonContent'
  })

  return result
}
