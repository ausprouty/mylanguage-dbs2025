<script setup>
import { ref, computed, watch } from "vue";
import languageList from "@/i18n/metadata/consolidated_languages.json";
import { useLanguageStore } from "stores/LanguageStore";

const selectedLanguage = ref(null);
const recentLanguagesToShow = 5;
const languageStore = useLanguageStore();
const searchInput = ref("");
const filteredOptions = ref([]);
const recentLanguages = ref([]); // Max of recentLanguagesToShow frequent languages

// Reactive label for currently selected language
const currentLanguageLabel = computed(() => {
  const lang = languageStore.languageObjectSelected;
  return lang ? `${lang.name} (${lang.ethnicName})` : "None";
});
// Generate list with labels
const languageOptions = computed(() =>
  languageList.map((lang) => ({
    label: `${lang.name} (${lang.ethnicName})`,
    ...lang,
  }))
);

// Filter user input
function onFilter(val, update) {
  const needle = val.toLowerCase();

  update(() => {
    if (!needle) {
      filteredOptions.value = languageOptions.value;
    } else {
      filteredOptions.value = languageOptions.value.filter((option) =>
        option.label.toLowerCase().includes(needle)
      );
    }
  });
}

// Update selection and recents
function handleChange(value) {
  console.log("Selected language:", value);
  selectedLanguage.value = value;
  updateRecentLanguages(value);
  languageStore.setLanguageObjectSelected(value);
}

// Maintain list of 2 most recent languages
function updateRecentLanguages(lang) {
  const existingIndex = recentLanguages.value.findIndex(
    (item) => item.languageCodeHL === lang.languageCodeHL
  );
  if (existingIndex !== -1) {
    recentLanguages.value.splice(existingIndex, 1);
  }
  recentLanguages.value.unshift(lang);
  if (recentLanguages.value.length > recentLanguagesToShow) {
    recentLanguages.value.length = recentLanguagesToShow;
  }
}

// Initialize filtered options
filteredOptions.value = languageOptions.value;
</script>
<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <p>
        <strong>Current Language:</strong>
        {{ currentLanguageLabel }}
      </p>
    </div>

    <q-select
      filled
      v-model="selectedLanguage"
      :options="filteredOptions"
      label="Change Language"
      use-input
      input-debounce="200"
      option-label="label"
      @filter="onFilter"
      @update:model-value="handleChange"
    />

    <div v-if="recentLanguages.length" class="q-mt-md">
      <p><strong>Frequently Used:</strong></p>
      <q-chip
        v-for="lang in recentLanguages"
        :key="lang.languageCodeHL"
        clickable
        @click="handleChange(lang)"
        color="primary"
        text-color="white"
        class="q-mr-sm"
      >
        {{ lang.label }}
      </q-chip>
    </div>
  </div>
</template>
