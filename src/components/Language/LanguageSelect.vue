<script setup>
import { ref, computed, watch, onMounted, inject } from "vue";
import { useSettingsStore } from "src/stores/SettingsStore";

const settingsStore = useSettingsStore();
const emit = defineEmits(["select"]);

// If MainLayout provides a centralized handler, use it.
const handleLanguageSelectInjected = inject("handleLanguageSelect", null);

// Local model mirrors the store's selected language
const selectedLanguage = ref(settingsStore.languageObjectSelected || null);

// Keep model synced with store selection
watch(
  () => settingsStore.languageObjectSelected,
  (val) => { selectedLanguage.value = val || null; },
  { immediate: true }
);

// Build labeled options from the live catalog
const languageOptions = computed(() => {
  const list = Array.isArray(settingsStore.languages) ? settingsStore.languages : [];
  return list.map((lang) => {
    const name = String(lang.name || "").trim();
    const ethnic = String(lang.ethnicName || "").trim();
    const label = ethnic ? `${name} (${ethnic})` : name || "Unknown";
    return { label, ...lang };
  });
});

const filteredOptions = ref([]);
onMounted(() => { filteredOptions.value = languageOptions.value; });
watch(languageOptions, (opts) => { filteredOptions.value = opts; });

// Filter user input
function onFilter(val, update) {
  const needle = String(val || "").toLowerCase();
  update(() => {
    const opts = languageOptions.value;
    filteredOptions.value = needle
      ? opts.filter((o) => o.label.toLowerCase().includes(needle))
      : opts;
  });
}

// Exactly two MRU from the store
const recents = computed(() =>
  Array.isArray(settingsStore.languagesUsed)
    ? settingsStore.languagesUsed.slice(0, 2)
    : []
);

// Normalize selection to a full language object
function normalize(value) {
  if (value && typeof value === "object") return value;
  const hl = String(value || "");
  return languageOptions.value.find(
    (o) => String(o.languageCodeHL || "") === hl
  ) || null;
}

// On selection: emit, then use centralized handler if provided,
// else update the store as a fallback.
function handleChange(value) {
  const lang = normalize(value);
  if (!lang) return;

  selectedLanguage.value = lang;
  emit("select", lang);

  if (typeof handleLanguageSelectInjected === "function") {
    handleLanguageSelectInjected(lang); // parent will update route + MRU + close drawer
    return;
  }

  // Fallback: update store/MRU locally
  if (typeof settingsStore.setLanguageObjectSelected === "function") {
    settingsStore.setLanguageObjectSelected(lang);
  } else {
    settingsStore.languageObjectSelected = lang;
  }
  if (typeof settingsStore.addRecentLanguage === "function") {
    settingsStore.addRecentLanguage(lang); // keeps MRU(2) + persists
  } else {
    // Minimal local MRU(2) fallback
    const list = (settingsStore.languagesUsed || []).filter(
      (x) => x.languageCodeHL !== lang.languageCodeHL
    );
    list.unshift(lang);
    settingsStore.languagesUsed = list.slice(0, 2);
    try {
      localStorage.setItem("lang:recents", JSON.stringify(settingsStore.languagesUsed));
      localStorage.setItem("lang:selected", JSON.stringify(lang));
    } catch {}
  }
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <p>
        <strong>Current Language:</strong>
        {{
          settingsStore.languageObjectSelected
            ? `${settingsStore.languageObjectSelected.name} (${settingsStore.languageObjectSelected.ethnicName || ''})`.replace(/\(\s*\)$/, '')
            : "None"
        }}
      </p>
    </div>

    <q-select
      filled
      v-model="selectedLanguage"
      :options="filteredOptions"
      :label="$t ? $t('interface.changeLanguage') : 'Change Language'"
      use-input
      input-debounce="200"
      option-label="label"
      :emit-value="false"
      map-options
      @filter="onFilter"
      @update:model-value="handleChange"
    />

    <div v-if="recents.length" class="q-mt-md">
      <p class="q-mb-xs"><strong>Frequently Used:</strong></p>
      <q-chip
        v-for="lang in recents"
        :key="lang.languageCodeHL"
        clickable
        color="primary"
        text-color="white"
        class="q-mr-sm q-mb-sm"
        @click="handleChange(lang)"
      >
        {{ `${lang.name} (${lang.ethnicName || ''})`.replace(/\(\s*\)$/, '') }}
      </q-chip>
    </div>
  </div>
</template>
