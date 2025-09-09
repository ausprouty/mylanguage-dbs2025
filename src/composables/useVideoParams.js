// src/composables/useVideoParams.js
import { computed, unref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSettingsStore } from "src/stores/SettingsStore";
import { normPositiveInt, normParamStr } from "src/utils/normalize";

/*
  Priority per field:
  1) route params (if present & valid)
  2) store
  3) provided defaults

  Options:
    studyKey: string|ref (required)
    defaults: { lesson, languageCodeHL, languageCodeJF }
    syncToRoute: boolean (default true)
*/
export function useVideoParams(options) {
  const {
    studyKey,
    defaults = { lesson: 1, languageCodeHL: "eng00", languageCodeJF: "529" },
    syncToRoute = true,
  } = options || {};

  const route = useRoute();
  const router = useRouter();
  const settingsStore = useSettingsStore();

  // ---- Unref once & normalise ---------------------------------------------
  const resolvedStudyKey = computed(() => normParamStr(unref(studyKey)));

  // ---- Route candidates -----------------------------------------------------
  const routeLesson = computed(() => normPositiveInt(route.params.lesson));
  const routeHL     = computed(() => normParamStr(route.params.languageCodeHL));
  const routeJF     = computed(() => normParamStr(route.params.languageCodeJF));

  // ---- Store candidates -----------------------------------------------------
  const storeLesson = computed(() => {
    const fn = settingsStore.lessonNumberForStudy;
    if (typeof fn === "function") {
      const n = Number(fn(resolvedStudyKey.value));
      if (Number.isFinite(n) && n > 0) return n;
    } else {
      const n = Number(settingsStore.lessonNumber);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return undefined;
  });

  const storeHL = computed(() => {
    const s = settingsStore.languageCodeHLSelected;
    return s && String(s).trim() ? String(s).trim() : undefined;
  });

  const storeJF = computed(() => {
    const s = settingsStore.languageCodeJFSelected;
    return s != null ? String(s) : undefined;
  });

  // ---- Resolved values ------------------------------------------------------
  const lesson = computed(() =>
    routeLesson.value || storeLesson.value || Number(defaults.lesson || 1)
  );

  const languageCodeHL = computed(() =>
    routeHL.value || storeHL.value || String(defaults.languageCodeHL)
  );

  const languageCodeJF = computed(() => {
    const v = routeJF.value || storeJF.value || String(defaults.languageCodeJF);
    return v == null ? "" : String(v);
  });

  const sectionKey = computed(() =>
    lesson.value > 0 ? "video-" + lesson.value : ""
  );

  // ---- Apply to store / router ---------------------------------------------
// not sure we need this
  function applyToStore() {
    const key = resolvedStudyKey.value;
    settingsStore.setCurrentStudy(key);
    settingsStore.setLessonNumber(key, Number(lesson.value));
    settingsStore.setLanguageCodeHL(languageCodeHL.value);
    settingsStore.setLanguageCodeJF(languageCodeJF.value);
  }

  function applyToRouteIfEnabled() {
    if (!syncToRoute) return;

    const next = {
      study: resolvedStudyKey.value || route.params.study, // keep study stable
      lesson: String(lesson.value),
      languageCodeHL: languageCodeHL.value,
      languageCodeJF: languageCodeJF.value || undefined, // drop empty
    };

    const p = route.params || {};
    const changed =
      p.study !== next.study ||
      p.lesson !== next.lesson ||
      p.languageCodeHL !== next.languageCodeHL ||
      p.languageCodeJF !== next.languageCodeJF;

    if (changed) {
      router
        .replace({
          name: route.name || "VideoMaster",
          params: next,
          query: route.query,
          hash: route.hash,
        })
        .catch(() => {});
    }
  }

  // Route changes → update store (and maybe URL normalisation)
  watch(
    () => [routeLesson.value, routeHL.value, routeJF.value, resolvedStudyKey.value],
    () => {
      applyToStore();
      applyToRouteIfEnabled();
    }
  );

  // Store changes (e.g., language picker) → keep URL in sync (optional)
  watch(
    () => [
      settingsStore.languageCodeHLSelected,
      settingsStore.languageCodeJFSelected,
      settingsStore.lessonNumberForStudy
        ? settingsStore.lessonNumberForStudy(resolvedStudyKey.value)
        : settingsStore.lessonNumber,
      resolvedStudyKey.value, // if study key itself changes
    ],
    () => {
      applyToRouteIfEnabled();
    }
  );

  onMounted(() => {
    applyToStore();
    applyToRouteIfEnabled();
  });

  return {
    lesson,
    languageCodeHL,
    languageCodeJF,
    sectionKey,
    // expose if you want manual re-apply
    // applyToStore,
  };
}
