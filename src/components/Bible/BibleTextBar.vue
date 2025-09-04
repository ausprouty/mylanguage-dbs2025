<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBibleReference } from "src/composables/useBibleReference";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  passage: { type: Object, required: true },
});

const { cleanReference } = useBibleReference();

const isVisible = ref(false);

const readLabel = computed(function () {
  var full = "";
  if (props && props.passage && props.passage.referenceLocalLanguage) {
    full = props.passage.referenceLocalLanguage;
  }
  var title = cleanReference(full);
  return title
    ? t("interface.read", { title: title }).trim()
    : t("interface.readPlain");
});
</script>

<template>
  <div class="bible-container">
    <button
      type="button"
      class="toggle-button"
      @click="isVisible = !isVisible"
      :aria-expanded="isVisible ? 'true' : 'false'"
    >
      {{ isVisible ? "▼" : "►" }} {{ readLabel }}
    </button>

    <div v-show="isVisible" class="bible-section">
      <div v-html="passage.passageText" class="bible-text"></div>
      <a
        v-if="passage && passage.passageUrl"
        :href="passage.passageUrl"
        class="readmore-button"
        target="_blank"
        rel="noopener"
      >
        {{ t("interface.readMore") }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.bible-container {
  margin-top: 20px;
  padding: 16px;
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  background-color: var(--color-neutral);
  color: var(--color-minor2);
  box-shadow: 0 2px 6px var(--color-shadow);
}
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
.bible-section {
  margin-top: 12px;
  background-color: color-mix(in srgb, var(--color-minor1) 85%, white);
  padding: 14px;
  border-left: 4px solid var(--color-accent);
  border-radius: 4px;
}
.bible-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-minor2);
}
</style>
