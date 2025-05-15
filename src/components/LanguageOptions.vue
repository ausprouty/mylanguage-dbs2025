<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from 'stores/LanguageStore';
import languages from 'src/i18n/metadata/consolidated_languages.json';

const { availableLocales, locale, setLocaleMessage } = useI18n();
const languageStore = useLanguageStore();

// Build full options list with label
const allLanguages = languages.map(lang => ({
  ...lang,
  label: `${lang.name} (${lang.ethnicName})${lang.region ? ' – ' + lang.region : ''}`
}));

// Set selectedLanguage by matching object reference
const selectedLanguage = ref(
  allLanguages.find(l => l.id === languageStore.languageSelected?.id) || null
);

// Update logic when user selects a language
const handleLanguageChange = async (languageObject) => {
  if (!languageObject) return;

  if (!availableLocales.includes(languageObject.languageCodeHL)) {
    const messages = await import(`../i18n/languages/${languageObject.languageCodeHL}.json`);
    setLocaleMessage(languageObject.languageCodeHL, messages.default);
  }

  locale.value = languageObject.languageCodeHL;
  languageStore.updateLanguageObjectSelected(languageObject);
};
</script>

<template>
  <q-select
  v-model="selectedLanguage"
  :options="allLanguages"
  label="Search Language"
  use-input
  fill-input
  input-debounce="200"
  option-label="label"
  @update:model-value="handleLanguageChange"
/>
<p>Selected ID: {{ selectedLanguage?.id }}</p>
<p>Matched Label: {{ selectedLanguage?.label }}</p>


</template>

