// src/utils/arclightBuilder.js

function isSegmentCode(s) {
  var v = String(s == null ? "" : s);
  return /^\d+-\d+-\d+$/.test(v);
}

function hasJFPlaceholder(s) {
  var v = String(s == null ? "" : s);
  return v.indexOf("{JF}") !== -1;
}

/**
 * Build ArcLight ID from meta + lesson + languageCodeJF.
 * Supports:
 * 1) Map entry is full ID            -> returns it
 * 2) Map entry has {JF}              -> replaces and returns
 * 3) Map entry is "3-0-0"            -> prefix + JF + suffix + code
 * 4) No map entry                    -> prefix + JF + suffix + "L-0-0"
 */
export function buildArcLightId(videoMeta, lesson, languageCodeJF) {
  var vm = videoMeta || {};
  var prefix = String(vm.prefix || "");
  var suffix = String(vm.suffix || "");
  var jf = String(languageCodeJF || "");
  var key = String(lesson || 1);

  // accept "segmentMap" or object "segments"
  var map = vm.segmentMap;
  var useSegObj = !map || typeof map !== "object" || Array.isArray(map);
  if (useSegObj) {
    var segs = vm.segments;
    if (segs && typeof segs === "object" && !Array.isArray(segs)) {
      map = segs;
    }
  }

  var entry = map && map[key] ? String(map[key]) : "";

  if (hasJFPlaceholder(entry)) {
    return entry.replace("{JF}", jf);
  }

  if (isSegmentCode(entry)) {
    return prefix + jf + suffix + entry;
  }

  if (entry) return entry;

  var code = String(lesson || 1) + "-0-0";
  return prefix + jf + suffix + code;
}

/**
 * Optionally wrap with a base URL; if base is empty, return the ID.
 * Example base: "https://player.arclight.org/video"
 */
export function buildArcLightSrc(base, videoMeta, lesson, languageCodeJF) {
  var id = buildArcLightId(videoMeta, lesson, languageCodeJF);
  var b = String(base || "");
  if (!b) return id;
  if (b.charAt(b.length - 1) !== "/") b += "/";
  return b + id;
}
