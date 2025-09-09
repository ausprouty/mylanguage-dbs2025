// src/composables/useVideoSourceFromSpec.js
import { ref, watchEffect, unref } from "vue";
import { buildVideoSource } from "src/utilities/videoSource"; // ensure the path & filename match
import { safeObj } from "src/utils/normalize";

export function useVideoSourceFromSpec(options) {
  options = options || {};
  var videoSpec     = options.videoSpec;
  var study         = options.study;
  var lesson        = options.lesson;
  var languageCodeJF= options.languageCodeJF;
  var languageCodeHL= options.languageCodeHL;

  var source = ref({ provider: "", kind: "video", src: "" });

  watchEffect(function () {
    var vs = safeObj(unref(videoSpec));

    var input = {
      provider: String(vs.provider || "").toLowerCase(),
      study: String(unref(study) || "jvideo"),
      lesson: Number(unref(lesson) || 1),
      languageHL: String(unref(languageCodeHL) || "eng00"),
      languageJF: String(unref(languageCodeJF) || "529"),
      meta: vs // pass through the whole spec; videoSource.js knows how to read it
    };

    source.value = buildVideoSource(input);
  });

  return { source: source };
}
