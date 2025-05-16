<script setup>
import { ref, computed } from 'vue';
import { useLanguageStore } from 'stores/LanguageStore';
import languageList from '@/i18n/metadata/consolidated_languages.json';

const languageStore = useLanguageStore();

// 1) Computed v-model proxy → Pinia store
const selectedLanguage = computed({
  get() {
    return languageStore.languageObjectSelected;
  },
  set(langObj) {
    languageStore.setLanguageObjectSelected(langObj);
    // reset filter input & options after selection
    searchInput.value = '';
    filteredOptions.value = languageOptions.value;
  }
});

// 2) Your search input & filtered list
const searchInput = ref('');
const filteredOptions = ref([]);

// 3) Build master list once
const languageOptions = computed(() =>
  languageList.map(lang => ({
    label: `${lang.name} (${lang.ethnicName})`,
    value: lang
  }))
);

// init full list
filteredOptions.value = languageOptions.value;

// 4) Custom filter handler
function onFilter(val, update) {
  searchInput.value = val;
  const needle = val.toLowerCase();

  update(() => {
    if (!needle) {
      filteredOptions.value = languageOptions.value;
    } else {
      filteredOptions.value = languageOptions.value.filter(option =>
        option.label.toLowerCase().includes(needle)
      );
    }
  });
}

// 5) Computed for the “Current Language” display
const currentLanguageLabel = computed(() => {
  const lang = languageStore.languageObjectSelected;
  return lang ? `${lang.name} (${lang.ethnicName})` : 'None';
});

// 6) Handler for “Frequently Used” chips
function pickChip(lang) {
  selectedLanguage.value = lang;
}
</script>

<template>
  <div class="q-pa-md">
    <!-- Current Language -->
    <div class="q-mb-md">
      <p><strong>Current Language:</strong> {{ currentLanguageLabel }}</p>
    </div>

    <!-- Searchable Select -->
    <q-select
      filled
      v-model="selectedLanguage"
      :options="filteredOptions"
      label="Search Language"
      use-input
      input-debounce="200"
      option-label="label"
      option-value="value"
      @filter="onFilter"
    />

    <!-- Frequently Used -->
    <div v-if="languageStore.languagesUsed.length" class="q-mt-md">
      <p><strong>Frequently Used:</strong></p>
      <q-chip
        v-for="lang in languageStore.languagesUsed.slice(0, 4)"
        :key="lang.languageCodeHL"
        clickable
        @click="pickChip(lang)"
        color="primary"
        text-color="white"
        class="q-mr-sm q-mb-sm"
      >
        {{ `${lang.name} (${lang.ethnicName})` }}
      </q-chip>
    </div>

    <!-- Debug display -->
    <div class="q-mt-lg">
      <p><strong>Selected Object:</strong></p>
      <pre>{{ selectedLanguage }}</pre>
    </div>
  </div>
</template>
