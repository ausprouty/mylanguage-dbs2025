<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/LanguageStore'
import languages from '@/i18n/metadata/consolidated_languages.json'

const { availableLocales, locale, setLocaleMessage } = useI18n()
const languageStore = useLanguageStore()

// 1) Dedupe + build options so `value` is the entire lang object
const options = computed(() => {
  const seen = new Set()
  return languages
    .filter(l => {
      if (seen.has(l.id)) return false
      seen.add(l.id)
      return true
    })
    .map(l => ({
      label: `${l.name} (${l.ethnicName})${l.region ? ' – ' + l.region : ''}`,
      value: l
    }))
})

// 2) Initialize the selected object (not just an ID)
const selected = ref(
  options.value.find(o => o.value.id === languageStore.languageSelected?.id)?.value || null
)

// 3) Watch for changes—and only import if code is defined!
watch(selected, async lang => {
  if (!lang?.languageCodeHL) {
    console.warn('No HL code on selected language', lang)
    return
  }

  if (!availableLocales.includes(lang.languageCodeHL)) {
    // note the **relative** path here
    const msgs = await import(`../i18n/languages/${lang.languageCodeHL}.json`)
    setLocaleMessage(lang.languageCodeHL, msgs.default)
  }

  locale.value = lang.languageCodeHL
  languageStore.updateLanguageObjectSelected(lang)
})
</script>

<template>
  <q-select
    v-model="selected"
    :options="options"
    label="Search language"
    placeholder="Type to filter…"
    use-input
    filter            
    input-debounce="200"
    option-label="label"
    option-value="value"
  />
</template>
