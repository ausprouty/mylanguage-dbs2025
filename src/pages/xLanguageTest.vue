<script setup>
import { ref, computed } from 'vue';
import languageList from '@/i18n/metadata/consolidated_languages.json';

const selectedLanguage = ref(null);
const searchInput = ref('');
const filteredOptions = ref([]);

// Convert the raw list to labeled entries
const languageOptions = computed(() =>
  languageList.map(lang => ({
    label: `${lang.name} (${lang.ethnicName})`,
    ...lang,
  }))
);

// When user types, this triggers
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

// Called when user selects an item
function handleChange(value) {
  console.log('Selected:', value);
  selectedLanguage.value = value;
}

// Initialize full list at start
filteredOptions.value = languageOptions.value;
</script>

<template>
  <q-page class="q-pa-md">
    <q-select
      filled
      v-model="selectedLanguage"
      :options="filteredOptions"
      label="Search Language"
      use-input
      input-debounce="200"
      option-label="label"
      @filter="onFilter"
      @update:model-value="handleChange"
    />

    <div class="q-mt-md">
      <p><strong>Selected:</strong></p>
      <pre>{{ selectedLanguage }}</pre>
    </div>
  </q-page>
</template>
