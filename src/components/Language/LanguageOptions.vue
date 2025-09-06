<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useSettingsStore } from 'src/stores/SettingsStore';

const store = useSettingsStore();

function readMode() {
  if (store && store.languageSelectorMode) return store.languageSelectorMode;
  const meta = globalThis.__SITE_META__;
  if (meta && meta.language && meta.language.selector) {
    return String(meta.language.selector).toLowerCase();
  }
  const envMode = (import.meta.env.VITE_LANG_SELECTOR || '').toLowerCase();
  if (envMode) return envMode;
  return 'select';
}

const mode = computed(() => readMode());

const Impl = computed(() => {
  if (mode.value === 'radio') {
    return defineAsyncComponent(() =>
      import('./LanguageRadioButtons.vue')
    );
  }
  return defineAsyncComponent(() =>
    import('./LanguageSelect.vue')
  );
});

function readFixedList() {
  const meta = globalThis.__SITE_META__;
  if (meta && meta.language && Array.isArray(meta.language.fixed)) {
    return meta.language.fixed;
  }
  if (Array.isArray(store.fixedLanguages) && store.fixedLanguages.length > 0) {
    return store.fixedLanguages;
  }
  const env = import.meta.env.VITE_LANG_FIXED || '';
  if (env) return env.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

const fixedLanguages = computed(() => readFixedList());
</script>

<template>
  <component :is="Impl" :fixed-languages="fixedLanguages" />
</template>
