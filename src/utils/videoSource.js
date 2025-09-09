// src/utils/videoSource.js
// Keep your Vimeo and File builders as they were; ArcLight bits below are updated.

const DEFAULT_ARCLIGHT_BASE = "https://api.arclight.org/videoPlayerUrl/?refId=";

function pad2(n) {
  n = Number(n) || 0;
  return n < 10 ? "0" + n : String(n);
}

function flattenMeta(maybeNested) {
  // Accept either { meta: { ... } } or a flat object
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

export function buildVideoSource(input) {
  if (input.provider === "arclight") return buildArcLight(input);
  if (input.provider === "vimeo")    return buildVimeo(input);
  return buildFile(input);
}

/* ---------------- ArcLight ---------------- */

function buildArcLight(input) {
  var meta = flattenMeta(input.meta);
  var refToken = buildArcLightRef(meta, input.lesson, input.languageJF);
  var src = buildArcLightSrc(meta, refToken);
  return {
    provider: "arclight",
    kind: "iframe",
    src: src,
    title: meta.title || "JESUS Film",
    poster: meta.poster,
    tracks: Array.isArray(meta.tracks) ? meta.tracks : undefined,
  };
}

// Decide the <REF> token (e.g., "1_529-jf6107-0-0")
function buildArcLightRef(meta, lessonNumber, languageCodeJF) {
  var lesson = Number(lessonNumber) || 1;
  var jf = String(languageCodeJF || "");

  // 1) explicit per-lesson ref
  if (
    meta.lessons &&
    typeof meta.lessons === "object" &&
    !Array.isArray(meta.lessons) &&
    meta.lessons[lesson] &&
    typeof meta.lessons[lesson].ref === "string" &&
    meta.lessons[lesson].ref
  ) {
    return meta.lessons[lesson].ref;
  }

  // 2) explicit single ref
  if (typeof meta.ref === "string" && meta.ref) {
    return meta.ref;
  }

  // 3) deterministic JESUS-film rule (61 parts)
  if (meta.autoJF61) {
    return "1_" + jf + "-jf61" + pad2(lesson) + "-0-0";
  }

  // 4) legacy builder: prefix + JF + suffix + segmentMap[lesson]
  var prefix = typeof meta.prefix === "string" ? meta.prefix : "";
  var suffix = typeof meta.suffix === "string" ? meta.suffix : "";
  var segMap =
    meta.segments && typeof meta.segments === "object" && !Array.isArray(meta.segments)
      ? meta.segments
      : {};
  var seg = segMap[String(lesson)] ? String(segMap[String(lesson)]) : "";
  return prefix + jf + suffix + seg;
}

// Build the final iframe src using ONLY the single base with ?refId=
function buildArcLightSrc(meta, refToken) {
  var base =
    typeof meta.embedBase === "string" && meta.embedBase
      ? meta.embedBase
      : DEFAULT_ARCLIGHT_BASE;

  // Always append the refId value
  var url = base + encodeURIComponent(refToken);

  // Append additional query params if provided (e.g., playerStyle, etc.)
  // Default playerStyle if not provided
  var playerStyle =
    typeof meta.playerStyle === "string" && meta.playerStyle ? meta.playerStyle : "default";

  var extraParams = [];
  extraParams.push("playerStyle=" + encodeURIComponent(playerStyle));

  if (meta.query && typeof meta.query === "object" && !Array.isArray(meta.query)) {
    var keys = Object.keys(meta.query);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      // avoid overriding refId or playerStyle accidentally
      if (k === "refId" || k === "ref" || k === "playerStyle") continue;
      var v = meta.query[k];
      if (v == null) continue;
      extraParams.push(k + "=" + encodeURIComponent(String(v)));
    }
  }

  if (extraParams.length) {
    url += "&" + extraParams.join("&");
  }
  return url;
}

/* ---------------- Vimeo / File (unchanged) ---------------- */

function buildVimeo(input) {
  var v = flattenMeta(input.meta);
  var vimeoId = null;
  var direct = null;

  if (v.lessons && v.lessons[input.lesson]) {
    var l = v.lessons[input.lesson];
    if (l && l.vimeoId) vimeoId = l.vimeoId;
    if (l && l.src) direct = l.src;
  }
  if (!vimeoId && v.vimeoId) vimeoId = v.vimeoId;
  if (!direct && v.src) direct = v.src;

  if (vimeoId) {
    return {
      provider: "vimeo",
      kind: "iframe",
      src:
        "https://player.vimeo.com/video/" +
        String(vimeoId) +
        "?badge=0&byline=0&title=0",
      title: v.title || "Video",
      poster: v.poster,
      tracks: Array.isArray(v.tracks) ? v.tracks : undefined,
    };
  }

  return {
    provider: "vimeo",
    kind: "video",
    src: String(direct || ""),
    title: v.title || "Video",
    poster: v.poster,
    tracks: Array.isArray(v.tracks) ? v.tracks : undefined,
  };
}

function buildFile(input) {
  var v = flattenMeta(input.meta);
  return {
    provider: "file",
    kind: "video",
    src: String(v.src || ""),
    title: v.title || "Video",
    poster: v.poster,
    tracks: Array.isArray(v.tracks) ? v.tracks : undefined,
  };
}

export { buildArcLightRef }; // if you like to test it elsewhere
