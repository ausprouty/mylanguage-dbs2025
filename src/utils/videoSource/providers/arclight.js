// ArcLight-specific builder (plain JS)

function pad2(n) {
  n = Number(n) || 0;
  return n < 10 ? "0" + n : String(n);
}

function flattenMeta(maybeNested) {
  if (
    maybeNested &&
    typeof maybeNested === "object" &&
    !Array.isArray(maybeNested) &&
    maybeNested.meta &&
    typeof maybeNested.meta === "object" &&
    !Array.isArray(maybeNested.meta)
  ) {
    return maybeNested.meta;
  }
  return maybeNested || {};
}

function isSegmentCode(s) {
  var v = String(s == null ? "" : s);
  return /^\d+-\d+-\d+$/.test(v);
}

function hasJFPlaceholder(s) {
  var v = String(s == null ? "" : s);
  return v.indexOf("{JF}") !== -1;
}

function isLikelyFullRefId(s) {
  // e.g., "1_529-fj_1-0-0" or "1_529-jf6103-0-0"
  var v = String(s == null ? "" : s);
  return /^.+_.+-[^_]+-\d+-\d+$/.test(v);
}

/**
 * Build ArcLight refId from meta + lesson + languageCodeJF.
 * Supports, in order of precedence:
 * 1) meta.lessons[lesson].ref  (verbatim)
 * 2) meta.ref                   (verbatim)
 * 3) meta.autoJF61              -> "1_<JF>-jf61NN-0-0"
 * 4) segment map entry:
 *    - full refId               (verbatim)
 *    - "{JF}" placeholder       -> replace
 *    - "3-0-0"                  -> prefix + JF + suffix + code
 * 5) fallback                   -> prefix + JF + suffix + "L-0-0"
 */
export function buildArcLightId(videoMeta, lessonNumber, languageCodeJF) {
  var vm = videoMeta || {};
  var lesson = Number(lessonNumber) || 1;
  var jf = String(languageCodeJF || "");
  var key = String(lesson);

  // 1) Per-lesson explicit ref
  if (
    vm.lessons &&
    typeof vm.lessons === "object" &&
    !Array.isArray(vm.lessons) &&
    vm.lessons[lesson] &&
    typeof vm.lessons[lesson].ref === "string" &&
    vm.lessons[lesson].ref
  ) {
    return vm.lessons[lesson].ref;
  }

  // 2) Single explicit ref
  if (typeof vm.ref === "string" && vm.ref) {
    return vm.ref;
  }

  // 3) JESUS film 61 auto
  if (vm.autoJF61) {
    return "1_" + jf + "-jf61" + pad2(lesson) + "-0-0";
  }

  // Accept "segmentMap" or object "segments" for map
  var map = vm.segmentMap;
  var useSegObj = !map || typeof map !== "object" || Array.isArray(map);
  if (useSegObj) {
    var segs = vm.segments;
    if (segs && typeof segs === "object" && !Array.isArray(segs)) {
      map = segs;
    }
  }

  var entry = map && map[key] ? String(map[key]) : "";
  var prefix = typeof vm.prefix === "string" ? vm.prefix : "";
  var suffix = typeof vm.suffix === "string" ? vm.suffix : "";

  if (isLikelyFullRefId(entry)) return entry;
  if (hasJFPlaceholder(entry)) return entry.replace("{JF}", jf);
  if (isSegmentCode(entry)) return prefix + jf + suffix + entry;
  if (entry) return entry;

  // 5) fallback: "L-0-0"
  return prefix + jf + suffix + (key + "-0-0");
}

/**
 * Build ArcLight API player URL:
 *   https://api.arclight.org/videoPlayerUrl/?refId=...&playerStyle=default
 * Uses URLSearchParams to avoid '&amp;'.
 */
export function buildArcLightPlayerUrl(videoMeta, lesson, languageJF, opts) {
  var base =
    (opts && opts.base) || "https://api.arclight.org/videoPlayerUrl/";
  var style = (opts && opts.playerStyle) || "default";
  var refId = buildArcLightId(videoMeta, lesson, languageJF);

  if (base.charAt(base.length - 1) !== "/") base += "/";
  var params = new URLSearchParams({ refId: refId, playerStyle: style });
  return base + "?" + params.toString();
}

function flattenInputMeta(input) {
  // input.meta might itself be { meta: { ... } } from upstream callsites
  return flattenMeta(input.meta);
}

export function buildArcLightSource(input) {
  var meta = flattenInputMeta(input);
  var url = buildArcLightPlayerUrl(
    meta,
    input.lesson,
    input.languageJF,
    {
      base: meta.embedBase,          // optional override
      playerStyle: meta.playerStyle || "default",
    }
  );

  return {
    provider: "arclight",
    kind: "iframe",
    src: url,
    title: meta.title || "JESUS Film",
    poster: meta.poster,
    tracks: Array.isArray(meta.tracks) ? meta.tracks : undefined,
  };
}
