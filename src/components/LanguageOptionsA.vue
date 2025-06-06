<script setup>
import { computed, onMounted } from 'vue';
import { useLanguageStore } from 'stores/LanguageStore';
import languageList from '@/i18n/metadata/consolidated_languages.json';

const languageStore = useLanguageStore();

// Generate all language options with display labels
const languageOptions = computed(() =>
  languageList.map(lang => ({
    label: `${lang.name} (${lang.ethnicName})`,
    ...lang,
  }))
);

// Reactive label for currently selected language
const currentLanguageLabel = computed(() => {
  const lang = languageStore.languageObjectSelected;
  return lang ? `${lang.name} (${lang.ethnicName})` : 'None';
});

// Filter options when typing
function onFilter(val, update) {
  const needle = val.toLowerCase();
  update(() => {
    if (!needle) {
      return languageOptions.value;
    }
    return languageOptions.value.filter(option =>
      option.label.toLowerCase().includes(needle)
    );
  });
}

// When user selects a language
function handleChange(value) {
  languageStore.setLanguageObjectSelected(value);
}

// Optional: confirm store was restored correctly
onMounted(() => {
  console.log('Language selected on load:', languageStore.languageObjectSelected);
  console.log('Languages used:', languageStore.languagesUsed);
});
</script>

<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <p><strong>Current Language:</strong> {{ currentLanguageLabel }}</p>
    </div>

    <q-select
      filled
      v-model="languageStore.languageObjectSelected"
      :options="languageOptions"
      label="Change Language"
      use-input
      input-debounce="200"
      option-label="label"
      @filter="onFilter"
      @update:model-value="handleChange"
    />

    <div v-if="languageStore.languagesUsed.length" class="q-mt-md">
      <p><strong>Frequently Used:</strong></p>
      <q-chip
        v-for="lang in languageStore.languagesUsed.slice(0, 4)"
        :key="lang.languageCodeHL"
        clickable
        @click="handleChange(lang)"
        color="primary"
        text-color="white"
        class="q-mr-sm q-mb-sm"
      >
        {{ `${lang.name} (${lang.ethnicName})` }}
      </q-chip>
    </div>
  </div>
</template>
