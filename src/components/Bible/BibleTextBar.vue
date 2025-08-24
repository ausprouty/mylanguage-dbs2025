<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  passage: { type: Object, required: true },
  menu: { type: Object, required: true }
});


const readLabel = computed(() => {
  const fullReference = String(props.passage.referenceLocalLanguage || '');

  // Get first non-empty trimmed line
  const lines = fullReference.split(/\r?\n|\r/).map(line => line.trim());
  const referenceOnly = lines.find(line => line.length > 0) || '';

  return props.menu.read?.replace(/\{\{XXX\}\}/g, referenceOnly);
});


const isVisible = ref(false);
</script>

<template>
  <div class="bible-container">
    <!-- Toggle Button -->
    <button @click="isVisible = !isVisible" class="toggle-button">
      {{ isVisible ? "▼" : "►" }} {{ readLabel }}
    </button>

    <!-- Bible Content -->
    <div v-show="isVisible" class="bible-section">
      <div v-html="passage.passageText" class="bible-text"></div>
      <a :href="passage.passageUrl" class="readmore-button" target="_blank">
        {{ menu.read_more }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.bible-container {
  margin-top: 20px;
  padding: 16px;
  border: 2px solid var(--color-accent); /* Burnt orange */
  border-radius: 8px;
  background-color: var(--color-neutral); /* Off-white */
  color: var(--color-minor2); /* Dark brown */
  box-shadow: 0 2px 6px var(--color-shadow);
}

/* Toggle Button */
.toggle-button {
  width: 100%;
  text-align: left;
  font-size: 18px;
  font-weight: bold;
  padding: 12px;
  border: none;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.toggle-button:hover {
  background-color: var(--color-accent);
  color: var(--color-on-accent);
}

/* Bible section */
.bible-section {
  margin-top: 12px;
  background-color: color-mix(in srgb, var(--color-minor1) 85%, white);
  padding: 14px;
  border-left: 4px solid var(--color-accent);
  border-radius: 4px;
}

/* Bible text */
.bible-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-minor2);
  color:black;
}


</style>
