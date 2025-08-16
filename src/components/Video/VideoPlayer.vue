<script setup>
import { computed, toRefs } from 'vue'

const ARC_BASE = 'https://api.arclight.org/videoPlayerUrl'

const props = defineProps({
  // Accepts [{ index: 1, url: '...' }] or a map {1: '...'}
  videoUrls: { type: [Array, Object], default: () => [] },
  lesson: { type: Number, required: true },
  // Layout controls
  ratio: { type: Number, default: 16 / 9 },
  maxWidth: { type: Number, default: 960 },
  // Fallbacks if no matching lesson URL is found
  fallbackRefId: { type: String, default: '1_529-jf6102-0-0' },
  playerStyle: { type: String, default: 'default' },
})

const { videoUrls, lesson } = toRefs(props)

function findLessonUrl() {
  const list = Array.isArray(videoUrls.value)
    ? videoUrls.value
    : Object.entries(videoUrls.value || {}).map(([index, url]) => ({
        index: Number(index),
        url,
      }))

  const item = list.find(v => v.index === lesson.value)
  return item?.url || null
}

const src = computed(() => {
  const direct = findLessonUrl()
  if (direct) return direct

  const q = new URLSearchParams({
    refId: props.fallbackRefId,
    playerStyle: props.playerStyle,
  })
  return `${ARC_BASE}?${q.toString()}`
})

const paddingTop = computed(() => `${(1 / props.ratio) * 100}%`)
const shellStyle = computed(() => ({ maxWidth: `${props.maxWidth}px` }))
</script>

<template>
  <div class="video-shell" :style="shellStyle">
    <div class="video-box" :style="{ paddingTop }">
      <iframe
        id="jplayer"
        :src="src"
        allowfullscreen
        webkitallowfullscreen
        mozallowfullscreen
        loading="lazy"
        referrerpolicy="origin-when-cross-origin"
      />
    </div>
  </div>
</template>

<style scoped>
.video-shell {
  width: 100%;
  margin: 0 auto;
}
.video-box {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #000;
  border-radius: 8px;
}
.video-box > iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
