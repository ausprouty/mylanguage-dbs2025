// src/composables/useVideoSourceFromSpec.js
import { ref, watchEffect, unref } from "vue";
import { safeObj } from "src/utils/normalize.js";
import { buildVideoSource } from "src/utils/videoSource.js";

export function useVideoSourceFromSpec(options) {
  options = options || {};
  var videoSpec       = options.videoSpec;
  var study           = options.study;
  var lesson          = options.lesson;
  var languageCodeJF  = options.languageCodeJF;
  var languageCodeHL  = options.languageCodeHL;

  var source = ref({ provider: "", kind: "video", src: "" });

  watchEffect(function () {
    var resolvedVideoSpec = safeObj(unref(videoSpec));

    // Flatten provider meta if nested under videoSpec.meta
    var providerMeta =
      resolvedVideoSpec &&
      typeof resolvedVideoSpec === "object" &&
      resolvedVideoSpec.meta &&
      typeof resolvedVideoSpec.meta === "object" &&
      !Array.isArray(resolvedVideoSpec.meta)
        ? resolvedVideoSpec.meta
        : resolvedVideoSpec;

    var input = {
      provider: String(resolvedVideoSpec.provider || "").toLowerCase(),
      study: String(unref(study) || "jvideo"),
      lesson: Number(unref(lesson) || 1),
      languageHL: String(unref(languageCodeHL) || "eng00"),
      languageJF: String(unref(languageCodeJF) || "529"),
      meta: providerMeta,
    };

    source.value = buildVideoSource(input) || { provider: input.provider, kind: "video", src: "" };
  });

  return { source: source };
}
