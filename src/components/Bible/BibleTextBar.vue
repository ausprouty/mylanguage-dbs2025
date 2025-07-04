<script setup>
import { ref } from 'vue'

const props = defineProps({
  biblePassage: { type: Object, required: true },
  passageReference: { type: String, default: 'No reference found' },
  translation: { type: Object, required: true }
})
console.log (biblePassage)
console.log (passageReference)
console.log (translation)
const isVisible = ref(false)
</script>

<template>
  <div class="bible-container">
    <!-- Toggle Button -->
    <button @click="isVisible = !isVisible" class="toggle-button">
      {{ isVisible ? '▼' : '►' }} {{ passageReference }}
    </button>

    <!-- Bible Content -->
    <div v-show="isVisible" class="bible-section">
      <div v-html="biblePassage.passageText" class="bible-text"></div>
      <a :href="biblePassage.passageUrl" class="readmore-button" target="_blank">
        {{ translation.read_more }}
      </a>
    </div>
  </div>
</template>



<style scoped lang="scss">
// Import theme variables if needed
// @use "@/css/quasar.variables.scss" as *;

.bible-container {
  margin-top: 20px;
  padding: 16px;
  border: 2px solid $accent; // Burnt orange
  border-radius: 8px;
  background-color: $neutral; // Off-white
  color: $minor2; // Dark brown
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
  background-color: $accent; // Burnt orange
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: $warning; // Earthy gold on hover
    color: $minor2; // Dark brown text
  }
}

// Bible section
.bible-section {
  margin-top: 12px;
  background-color: lighten($minor1, 15%);
  padding: 14px;
  border-left: 4px solid $accent;
  border-radius: 4px;
}

// Bible text
.bible-text {
  font-size: 16px;
  line-height: 1.6;
  color: $minor2;
}

// Read more button
.readmore-button {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 12px;
  background-color: $secondary; // Earthy gold
  color: $minor2;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: $info; // Warm brown
    color: white;
  }
}
</style>
