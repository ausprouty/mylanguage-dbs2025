<script setup>
import { ref, computed } from 'vue'
import { useLanguageStore } from 'stores/LanguageStore'
import languageList from '@/i18n/metadata/consolidated_languages.json'

const languageStore = useLanguageStore()

// 1) Proxy v-model into Pinia
const selectedLanguage = computed({
  get() {
    return languageStore.languageObjectSelected
  },
  set(value) {
    languageStore.setLanguageObjectSelected(value)
  }
})

// 2) Build the searchable list
const searchInput = ref('')
const filteredOptions = ref([])

// turn your raw JSON into { label, value } entries
const languageOptions = computed(() =>
  languageList.map(lang => ({
    label: `${lang.name} (${lang.ethnicName})`,
    value: lang
  }))
)

// start with the full list
filteredOptions.value = languageOptions.value

// 3) Your existing filter logic
function onFilter(val, update) {
  searchInput.value = val
  const needle = val.toLowerCase()
  update(() => {
    if (!needle) {
      filteredOptions.value = languageOptions.value
    } else {
      filteredOptions.value = languageOptions.value.filter(option =>
        option.label.toLowerCase().includes(needle)
      )
    }
  })
}

// 4) Keep your handleChange (in case you want extra logging, etc.)
function handleChange(value) {
  selectedLanguage.value = value
}

// 5) Computed for “Current Language” display
const currentLanguageLabel = computed(() => {
  const lang = languageStore.languageObjectSelected
  return lang
    ? `${lang.name} (${lang.ethnicName})`
    : 'None'
})

// 6) “Frequently Used” chip picker
function pickChip(lang) {
  selectedLanguage.value = lang
}
</script>

<template>
  <div class="q-pa-md">
    <!-- Current Language at the top -->
    <div class="q-mb-md">
      <p><strong>Current Language:</strong> {{ currentLanguageLabel }}</p>
    </div>

    <!-- Your searchable QSelect -->
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
      @update:model-value="handleChange"
    />

    <!-- Frequently Used chips -->
    <div
      v-if="languageStore.languagesUsed.length"
      class="q-mt-md"
    >
      <p><strong>Frequently Used:</strong></p>
      <q-chip
        v-for="lang in languageStore.languagesUsed.slice(0, 4)"
        :key="lang.languageCodeHL"
        clickable
        @click="pickChip(lang)"
        color="primary"
        text-color="white"
        class="q-mr-sm"
      >
        {{ `${lang.name} (${lang.ethnicName})` }}
      </q-chip>
    </div>

    <!-- Debug: inspect the raw object -->
    <div class="q-mt-lg">
      <p><strong>Selected Object:</strong></p>
      <pre>{{ selectedLanguage }}</pre>
    </div>
  </div>
</template>

