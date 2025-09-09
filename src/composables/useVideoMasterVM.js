// src/composables/useVideoMasterVM.js
import { computed, watch, onMounted, unref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { useSettingsStore } from "src/stores/SettingsStore";
import { useVideoParams } from "src/composables/useVideoParams";
import { useCommonContent } from "src/composables/useCommonContent";
import { useProgressTracker } from "src/composables/useProgressTracker";
import { useVideoSourceFromSpec } from "src/composables/useVideoSourceFromSpec";

import { normParamStr, isObj } from "src/utils/normalize.js";

export function useVideoMasterVM() {
  // Router & i18n
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n({ useScope: "global" });

  // Stores
  const settingsStore = useSettingsStore();

  // Study from route (:study)
  const currentStudy = computed(function () {
    const s = normParamStr(route.params.study);
    return s || "jvideo";
  });

  // Resolve lesson/HL/JF/sectionKey with route → store → defaults (and sync URL)
  const {
    lesson,
    languageCodeHL,
    languageCodeJF,
    sectionKey,
  } = useVideoParams({
    studyKey: currentStudy, // ref; composable unrefs internally
    defaults: { lesson: 1, languageCodeHL: "eng00", languageCodeJF: "529" },
    syncToRoute: true,
  });

  // Common content (with your load helper)
  const { commonContent, topics, loadCommonContent } = useCommonContent(
    currentStudy,
    languageCodeHL
  );

  // Study title from commonContent
  const studyTitle = computed(function () {
    const cc = commonContent.value;
    const studyBlock = cc && typeof cc === "object" ? cc.study : null;
    const raw = studyBlock && studyBlock.title != null ? String(studyBlock.title) : "";
    return raw.trim();
  });

  // Intro paragraphs from commonContent.study.para (array | object | string)
  const paras = computed(function () {
    const cc = commonContent.value;
    const studyBlock = cc && typeof cc === "object" ? cc.study : null;
    const para = studyBlock ? studyBlock.para : null;

    if (Array.isArray(para)) {
      const out = [];
      for (let i = 0; i < para.length; i++) {
        const s = String(para[i] == null ? "" : para[i]).trim();
        if (s) out.push(s);
      }
      return out;
    }
    if (para && typeof para === "object") {
      const keys = Object.keys(para).sort(function (a, b) { return Number(a) - Number(b); });
      const out = [];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const s = String(para[k] == null ? "" : para[k]).trim();
        if (s) out.push(s);
      }
      return out;
    }
    if (typeof para === "string") {
      const s = para.trim();
      return s ? [s] : [];
    }
    return [];
  });

  // Optional i18n fallback per-lesson topic
  const topicTitle = computed(function () {
    const n = Number(lesson.value);
    if (!Number.isFinite(n) || n < 1) return "";
    const key = "commonContent.topic." + String(n);
    const val = t(key);
    return val === key ? "" : String(val).trim();
  });

  // Heading: prefer studyTitle from content, fall back to topicTitle
  const heading = computed(function () {
    return studyTitle.value || topicTitle.value || "";
  });

  // Video spec from content
  const videoSpec = computed(function () {
    const cc = commonContent.value;
    if (!isObj(cc)) return {};
    const v = cc.video;
    return isObj(v) ? v : {};
  });

  // UI gates
  const showLanguageSelect = computed(function () {
    return !!videoSpec.value.multiLanguage;
  });
  const showSeriesPassage = computed(function () {
    const n = Number(videoSpec.value.segments);
    return Number.isFinite(n) && n > 1;
  });

  // Build a single playable source for the dumb player
  const { source } = useVideoSourceFromSpec({
    videoSpec: videoSpec,
    study: currentStudy,
    lesson: lesson,
    languageCodeJF: languageCodeJF,
    languageCodeHL: languageCodeHL,
  });

  // Progress tracking
  const {
    completedLessons,
    isLessonCompleted,
    markLessonComplete,
    loadProgress,
  } = useProgressTracker(currentStudy);

  // Keep commonContent fresh when HL changes
  watch(languageCodeHL, loadCommonContent);

  // Initial loads
  onMounted(async function () {
    await Promise.all([loadCommonContent(), loadProgress()]);
  });

  // Handler: update lesson → store + push new URL (shareable)
  function updateLesson(nextLessonNumber) {
    const studyKey = currentStudy.value || "jvideo";
    const lessonNumber = Number(nextLessonNumber) || 1;

    settingsStore.setLessonNumber(studyKey, lessonNumber);

    router.push({
      name: "VideoMaster",
      params: {
        study: studyKey,
        lesson: String(lessonNumber),
        languageCodeHL: languageCodeHL.value,
        languageCodeJF: languageCodeJF.value || undefined,
      },
      query: route.query,
      hash: route.hash,
    }).catch(function () {});
  }

  return {
    // content
    heading,
    paras,
    topics,

    // params
    lesson,
    languageCodeHL,
    languageCodeJF,
    sectionKey,

    // video
    videoSpec,
    showLanguageSelect,
    showSeriesPassage,
    source,

    // progress
    completedLessons,
    isLessonCompleted,
    markLessonComplete,

    // actions
    updateLesson,
    commonContent,

    // loaders (if page wants to await)
    loadCommonContent,
    loadProgress,
  };
}
