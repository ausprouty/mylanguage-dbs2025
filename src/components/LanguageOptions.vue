<template>
  <h4>Select Language</h4>
  <q-option-group
    v-model="selectedLanguage"
    type="radio"
    color="primary"
    :options="languageOptions"
    @update:model-value="handleLanguageChange"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from 'stores/LanguageStore';
import languages from 'src/i18n/metadata/consolidated_languages.json';


const { availableLocales, locale, setLocaleMessage } = useI18n();
const languageStore = useLanguageStore();

// Use state directly from Pinia store (no function call)
const selectedLanguage = ref(languageStore.languageSelected?.id || null);

// Compute language options list
const languageOptions = computed(() =>
  languages.map((item) => ({
    label: `${item.name} (${item.ethnicName})`,
    value: item.id, // This is the ID used in v-model
    languageCodeJF: item.languageCodeJF,
    languageCodeHL: item.languageCodeHL
  }))
);

// Watch for store updates to sync `selectedLanguage`
watch(
  () => languageStore.languageSelected,
  (newVal) => {
    selectedLanguage.value = newVal?.id || null;
  },
  { immediate: true }
);

// Handle language change
const handleLanguageChange = async (selectedLanguageId) => {
  const languageObject = languages.find(lang => lang.id === selectedLanguageId);

  if (languageObject) {
    const { languageCodeHL } = languageObject;

    if (!availableLocales.includes(languageCodeHL)) {
      const messages = await import(`../i18n/languages/${languageCodeHL}.json`);
      setLocaleMessage(languageCodeHL, messages.default);
    }

    locale.value = languageCodeHL;
    console.log('Language options is updating language selected');
    languageStore.updateLanguageSelected(languageObject);
  }
};

</script>
