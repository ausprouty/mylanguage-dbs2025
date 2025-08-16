<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from 'stores/LanguageStore'
import { useContentStore } from 'stores/ContentStore'
import { useCommonContent } from 'src/composables/useCommonContent'
import { useProgressTracker } from 'src/composables/useProgressTracker'

import VideoPlayer from 'src/components/video/VideoPlayer.vue'
import SeriesPassageSelect from 'src/components/series/SeriesPassageSelect.vue'
import SeriesSegmentNavigator from 'src/components/series/SeriesSegmentNavigator.vue'
import VideoQuestions from 'src/components/video/VideoQuestions.vue'

// Route & i18n
const route = useRoute()
const { t, tm, locale } = useI18n({ useScope: 'global' })
const paras = computed(() => {
  const v = typeof tm === 'function' ? tm('jVideo.para') : []
  return Array.isArray(v) ? v : []
})
const localeKey = computed(() => locale.value)

// Stores
const languageStore = useLanguageStore()
const contentStore = useContentStore()

// Study
const currentStudy = 'jvideo'

// Reactive language/lesson values
const languageCodeHL = computed(() => languageStore.languageCodeHLSelected)
const languageCodeJF = computed(() => languageStore.languageCodeJFSelected)

// lessonNumber from store can be string - normalize to number
const lessonNumber = computed(() => {
  const n = Number(languageStore.lessonNumberForStudy)
  return Number.isFinite(n) && n > 0 ? n : 1   // or return undefined and v-if guard
})

const sectionKey = computed(() =>
  lessonNumber.value ? `video-${lessonNumber.value}` : undefined
)
// Aliases expected by the template
const computedLessonNumber = lessonNumber
const computedLanguageHL = languageCodeHL
const computedSectionKey = sectionKey

// Common content
const { commonContent, topics, loadCommonContent } =
  useCommonContent(currentStudy, languageCodeHL)

// Video URLs
const videoUrls = ref([])

const {
  completedLessons,
  isLessonCompleted,
  markLessonComplete,
  loadProgress
} = useProgressTracker(currentStudy)

const loadVideoUrls = async () => {
  try {
    videoUrls.value = await contentStore.loadVideoUrls(
      languageCodeJF.value,
      currentStudy
    )
  } catch (err) {
    console.error('Error loading video URLs:', err)
  }
}

const applyRouteParams = () => {
  languageStore.setCurrentStudy(currentStudy)

  // helper: parse >0 integer from a route param (string or array)
  const toPositiveInt = (v) => {
    const raw = Array.isArray(v) ? v[0] : v
    const s = String(raw ?? '').trim()
    if (!/^\d+$/.test(s)) return undefined
    const n = Number(s)
    return n > 0 ? n : undefined
  }

  const lessonNumber = toPositiveInt(route.params.lesson)
  if (lessonNumber !== undefined) {
    languageStore.setLessonNumber(currentStudy, lessonNumber)
  }

  // if you also support languageCodeJF via route:
  const rawJF = Array.isArray(route.params.languageCodeJF)
    ? route.params.languageCodeJF[0]
    : route.params.languageCodeJF
  const jf = String(rawJF ?? '').trim()
  if (jf && jf.toLowerCase() !== 'undefined') {
    languageStore.setLanguageCodeJF(jf)
  }
}


onMounted(async () => {
  applyRouteParams()
  await Promise.all([loadCommonContent(), loadVideoUrls(), loadProgress()])
  console.log('jVideo.title:', t('jVideo.title'))
})

watch(languageCodeJF, loadVideoUrls)
watch(languageCodeHL, loadCommonContent)

const updateLesson = (nextLessonNumber) => {
  languageStore.setLessonNumber(currentStudy, nextLessonNumber)
}
</script>

<template>
  <q-page padding>
    <h2>{{ t('jVideo.title') }}</h2>
    <p v-for="(p, i) in paras" :key="i">{{ p }}</p>

    <p class="warning">{{ $t('menu.changeLanguage') }}</p>

    <SeriesPassageSelect
      :study="currentStudy"
      :topics="topics"
      :lesson="computedLessonNumber"
      :completedLessons="completedLessons"
      :isLessonCompleted="isLessonCompleted"
      :markLessonComplete="markLessonComplete"
      @updateLesson="updateLesson"
    />

    <SeriesSegmentNavigator
      :study="currentStudy"
      :lesson="computedLessonNumber"
      @updateLesson="updateLesson"
    />

    <VideoPlayer :videoUrls="videoUrls" :lesson="computedLessonNumber" />

    <VideoQuestions
      v-if="sectionKey && computedLessonNumber"
      :commonContent="commonContent"
      :languageCodeHL="computedLanguageHL"
      :lesson="computedLessonNumber"
      :sectionKey="computedSectionKey"
      section="video"
    />

    <q-btn
      :label="
        isLessonCompleted(computedLessonNumber)
          ? t('lesson.completed')
          : t('lesson.notCompleted')
      "
      :disable="isLessonCompleted(computedLessonNumber)"
      class="mark-complete-btn"
      @click="markLessonComplete(computedLessonNumber)"
    />
  </q-page>
</template>

<style>
.q-page { background-color: white; }
</style>
