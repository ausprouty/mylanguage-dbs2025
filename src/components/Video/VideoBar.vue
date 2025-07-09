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

<style scoped lang="scss">
.video-container {
  margin-top: 20px;
  padding: 16px;
  border: 2px solid $accent;
  border-radius: 8px;
  background-color: $neutral;
  color: $minor2;
  box-shadow: 0 2px 6px $shadow;
}

// Toggle Button
.toggle-button {
  width: 100%;
  text-align: left;
  font-size: 18px;
  font-weight: bold;
  padding: 12px;
  border: none;
  background-color: $accent;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: $warning;
    color: $minor2;
  }
}

// Video Section
.video-section {
  margin-top: 12px;
  background-color: lighten($minor1, 15%);
  padding: 14px;
  border-left: 4px solid $accent;
  border-radius: 4px;

  iframe {
    width: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
  }
}
</style>
