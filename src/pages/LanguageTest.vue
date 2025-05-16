<!-- src/pages/LanguageTest.vue -->
<template>
  <q-page class="q-pa-md">
    <q-select
      filled
      v-model="selectedLanguage"
      :options="languageOptions"
      label="Search Language"
      use-input
      input-debounce="200"
      option-label="label"
      @update:model-value="handleChange"
    />

    <div class="q-mt-md">
      <p><strong>Selected:</strong></p>
      <pre>{{ selectedLanguage }}</pre>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import languageList from '@/i18n/metadata/consolidated_languages.json';

const selectedLanguage = ref(null);

const languageOptions = computed(() =>
  languageList.map(lang => ({
    label: `${lang.name} (${lang.ethnicName})`,
    ...lang
  }))
);

function handleChange(value) {
  console.log("Selected language object:", value);
  selectedLanguage.value = value;
}
</script>
