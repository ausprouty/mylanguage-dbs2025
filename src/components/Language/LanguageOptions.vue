<script setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue';
import { useSettingsStore } from 'src/stores/SettingsStore';

const store = useSettingsStore();

/* ------------ MODE: 'select' | 'radio' ------------ */
const mode = computed(() => {
  if (store?.languageSelectorMode) return store.languageSelectorMode;
  const envMode = (import.meta.env.VITE_LANGUAGE_PICKER_TYPE || '').toLowerCase();
  return envMode === 'radio' || envMode === 'select' ? envMode : 'select';
});



/* ------------ PICK IMPLEMENTATION ------------ */
const Impl = computed(() =>
  mode.value === 'radio'
    ? defineAsyncComponent(() => import('./LanguageRadioButtons.vue'))
    : defineAsyncComponent(() => import('./LanguageSelect.vue'))
);

/* Optional: only pass extra props to radio version */
const implProps = computed(() =>
  mode.value === 'radio'
    ? {
        languages: store.languages,
        labelMode: 'ethnicName (name)',   // show Ethnic (English)
        valueField: 'languageCodeHL'      // default; can omit if already default
      }
    : {
        languages: store.languages
      }
);
</script>

<template>
  <component :is="Impl" v-bind="implProps" />
</template>
