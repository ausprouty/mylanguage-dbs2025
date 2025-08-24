<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  videoUrl: { type: String, required: true },
  videoTitle: { type: String, required: true },
  menu: {
    type: Object,
    default: () => ({
      watch_online: 'Watch this video online',
    })
  }
});
const videoLabel = computed(() => {
  const rawTitle = String(props.videoTitle || '');
  const lines = rawTitle.split(/\r?\n|\r/).map(line => line.trim());
  const cleanTitle = lines.find(line => line.length > 0) || '';

  return props.menu.watch_online?.replace(/\{\{XXX\}\}/g, cleanTitle);
});


const isVisible = ref(false);
</script>

<template>
  <div class="video-container">

    <!-- Toggle Button -->
    <button @click="isVisible = !isVisible" class="toggle-button">
      {{ isVisible ? '▼' : '►' }} {{ videoLabel }}
    </button>

    <!-- Video Content -->
    <div v-show="isVisible" class="video-section">
      <iframe
        :src="videoUrl"
        allowfullscreen
        webkitallowfullscreen
        mozallowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.video-container {
  margin-top: 20px;
  padding: 16px;
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  background-color: var(--color-neutral);
  color: var(--color-minor2);
  box-shadow: 0 2px 6px var(--color-shadow);
}



/* Video Section */
.video-section {
  margin-top: 12px;
  /* SCSS lighten() -> CSS color-mix() for runtime safety */
  background-color: color-mix(in srgb, var(--color-minor1) 85%, white);
  padding: 14px;
  border-left: 4px solid var(--color-accent);
  border-radius: 4px;
}

.video-section iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
</style>

