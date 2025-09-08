// src/utilities/videoSource.js
// Plain JS (no TS). Vue 3 compatible. No optional chaining.
// Purpose: Build a playable video source object (iframe or <video>)
//          for ArcLight, Vimeo, or file-based videos.

/* ===========================
 * Constants
 * =========================== */
var DEFAULT_ARCLIGHT_BASE = "https://api.arclight.org/video-player/?ref=";

/* ===========================
 * Types (JSDoc)
 * =========================== */
/**
 * @typedef {Object} VideoSourceInput
 * @property {"arclight"|"vimeo"|"file"} provider
 * @property {string} study          // e.g., "jvideo"
 * @property {number} lesson         // 1..61 for JESUS; 1 for single-lesson Vimeo
 * @property {string} languageHL     // e.g., "eng00" (kept for completeness)
 * @property {string} languageJF     // e.g., "529" or "6464" (ArcLight JF code)
 * @property {Object=} meta          // adapter-specific: refs, posters, tracks, etc.
 *
 * @typedef {Object} VideoSourceResult
 * @property {"arclight"|"vimeo"|"file"} provider
 * @property {string} src            // iframe src or direct media URL
 * @property {"iframe"|"video"} kind
 * @property {string=} poster
 * @property {string=} title
 * @property {Array<{src:string,srclang:string,label:string,kind?:string}>=} tracks
 */

/* ===========================
 * Small helpers
 * =========================== */

/** Pad an integer to 2 digits ("01".."99"). */
function pad2(n) {
  n = Number(n) || 0;
  return n < 10 ? "0" + n : String(n);
}

/** Safe boolean check for own prop (no prototype surprises). */
function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/* ===========================
 * Public API
 * =========================== */

/**
 * Build a playable source object from a VideoSourceInput.
 * - ArcLight: returns iframe source using deterministic or explicit refs
 * - Vimeo:    returns iframe (Vimeo player) or direct <video> source
 * - File:     returns direct <video> source
 *
 * @param {VideoSourceInput} input
 * @returns {VideoSourceResult}
 */
export function buildVideoSource(input) {
  if (input.provider === "arclight") return buildArcLight(input);
  if (input.provider === "vimeo")    return buildVimeo(input);
  return buildFile(input);
}

/**
 * Vue composable wrapper that recomputes when your input getter changes.
 * Example usage:
 *   const { result } = useVideoSource(() => ({
 *     provider: "arclight",
 *     study: "jvideo",
 *     lesson: 7,
 *     languageHL: "eng00",
 *     languageJF: "529",
 *     meta: { autoJF61: true }
 *   }));
 *
 * @param {() => VideoSourceInput} inputGetter
 * @returns {{ result: import('vue').ComputedRef<VideoSourceResult> }}
 */
import { computed } from "vue";
export function useVideoSource(inputGetter) {
  var result = computed(function () {
    var i = inputGetter();
    if (i.provider === "arclight") return buildArcLight(i);
    if (i.provider === "vimeo")    return buildVimeo(i);
    return buildFile(i);
  });
  return { result: result };
}

/* ===========================
 * ArcLight
 * =========================== */

/**
 * Build ArcLight playable source (iframe).
 * Prefers explicit refs; falls back to the jf61 rule; then to legacy prefix/suffix.
 *
 * Supported meta fields:
 *   - ref: string (fully-formed, e.g., "1_529-jf6107-0-0")
 *   - lessons: { [lessonNumber]: { ref?: string } }
 *   - autoJF61: boolean → generate "1_<JF>-jf61<LL>-0-0"
 *   - prefix/suffix/segments: legacy builder
 *   - embedBase: override base URL (default: DEFAULT_ARCLIGHT_BASE)
 *   - title/poster/tracks: UI metadata passthrough
 *
 * @param {VideoSourceInput} input
 * @returns {VideoSourceResult}
 */
function buildArcLight(input) {
  var meta = input.meta || {};
  var src = assembleArcLightUrl(input);
  return {
    provider: "arclight",
    kind: "iframe",
    src: src,
    title: meta.title || "JESUS Film",
    poster: meta.poster,
    tracks: Array.isArray(meta.tracks) ? meta.tracks : undefined
  };
}

/**
 * Turn the input into a fully-qualified ArcLight iframe URL.
 * Resolution order:
 *   1) Explicit ref (meta.ref or meta.lessons[lesson].ref)
 *   2) autoJF61 rule  → "1_<JF>-jf61<LL>-0-0"  (LL = 2-digit lesson)
 *   3) Legacy builder → prefix + languageJF + suffix + segments[lesson]
 *
 * @param {VideoSourceInput} input
 * @returns {string}
 */
function assembleArcLightUrl(input) {
  var meta = input.meta || {};
  var ref = "";

  // 1) Explicit refs win
  if (typeof meta.ref === "string" && meta.ref.length > 0) {
    ref = meta.ref;
  } else if (meta.lessons && meta.lessons[input.lesson] &&
             typeof meta.lessons[input.lesson].ref === "string" &&
             meta.lessons[input.lesson].ref.length > 0) {
    ref = meta.lessons[input.lesson].ref;
  }

  // 2) Deterministic JESUS (61-part) rule
  //    Requires languageJF; lesson is zero-padded to 2 digits.
  if (!ref && meta.autoJF61) {
    var jf = String(input.languageJF || "");
    var ll = pad2(input.lesson);
    if (!jf) {
      // Defensive: make it obvious in dev if JF is missing
      // (still return a string so UI doesn't crash)
      ref = "MISSING_JF_CODE";
    } else {
      ref = "1_" + jf + "-jf61" + ll + "-0-0";
    }
  }

  // 3) Legacy builder (prefix/suffix + per-lesson segment code)
  if (!ref) {
    var prefix = typeof meta.prefix === "string" ? meta.prefix : "";
    var suffix = typeof meta.suffix === "string" ? meta.suffix : "";
    var segMap = meta.segments || {};
    var segKey = String(input.lesson);
    var segment = has(segMap, segKey) && typeof segMap[segKey] === "string"
      ? segMap[segKey]
      : "";
    ref = prefix + String(input.languageJF || "") + suffix + String(segment);
  }

  var base =
    typeof meta.embedBase === "string" && meta.embedBase.length > 0
      ? meta.embedBase
      : DEFAULT_ARCLIGHT_BASE;

  // ArcLight expects the ref in the querystring; we URL-encode it to be safe.
  return base + encodeURIComponent(ref);
}

/* ===========================
 * Vimeo
 * =========================== */

/**
 * Build Vimeo playable source.
 * Resolution order:
 *   1) Per-lesson override: meta.lessons[lesson].vimeoId or .src (direct file)
 *   2) Top-level meta.vimeoId or meta.src
 * Returns iframe for vimeoId, or <video> for direct media.
 *
 * @param {VideoSourceInput} input
 * @returns {VideoSourceResult}
 */
function buildVimeo(input) {
  var v = input.meta || {};
  var vimeoId = null;
  var direct  = null;

  if (v.lessons && v.lessons[input.lesson]) {
    var l = v.lessons[input.lesson];
    if (l && l.vimeoId) vimeoId = l.vimeoId;
    if (l && l.src)     direct  = l.src;
  }
  if (!vimeoId && v.vimeoId) vimeoId = v.vimeoId;
  if (!direct  && v.src)     direct  = v.src;

  if (vimeoId) {
    return {
      provider: "vimeo",
      kind: "iframe",
      src: "https://player.vimeo.com/video/" + String(vimeoId) +
           "?badge=0&byline=0&title=0",
      title: v.title || "Video",
      poster: v.poster,
      tracks: Array.isArray(v.tracks) ? v.tracks : undefined
    };
  }

  // Fallback to direct file (MP4/HLS) if provided
  return {
    provider: "vimeo",
    kind: "video",
    src: String(direct || ""),
    title: v.title || "Video",
    poster: v.poster,
    tracks: Array.isArray(v.tracks) ? v.tracks : undefined
  };
}

/* ===========================
 * File
 * =========================== */

/**
 * Build a direct <video> source from a file URL in meta.src.
 * @param {VideoSourceInput} input
 * @returns {VideoSourceResult}
 */
function buildFile(input) {
  var v = input.meta || {};
  return {
    provider: "file",
    kind: "video",
    src: String(v.src || ""),
    title: v.title || "Video",
    poster: v.poster,
    tracks: Array.isArray(v.tracks) ? v.tracks : undefined
  };
}

/* ===========================
 * Optional named export(s)
 * =========================== */
export { assembleArcLightUrl }; // useful for testing or batch-link generation
