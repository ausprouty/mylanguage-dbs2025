<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useSettingsStore } from 'src/stores/SettingsStore';

const props = defineProps({
  languages: { type: Array, default: () => [] },

  // Quick toggles for how labels look; pick one default and edit later
  labelMode: {
    type: String,
    default: 'ethnicName', // 'ethnicName' | 'name' | 'iso' | 'hl' | 'ethnicName (name)' | 'name [ISO]'
  },

  // Which field to use as the value (stored in v-model) — we still send the full object to the store
  valueField: {
    type: String,
    default: 'languageCodeHL' // 'languageCodeHL' | 'languageCodeIso'
  }
});

const store = useSettingsStore();
const model = ref(null); // holds the "value" (e.g., languageCodeHL)

function makeLabel(lang) {
  const iso = lang.languageCodeIso || '';
  const hl  = lang.languageCodeHL  || '';
  const nm  = lang.name            || '';
  const eth = lang.ethnicName      || '';

  switch (props.labelMode) {
    case 'name': return nm || eth || iso || hl;
    case 'iso':  return iso || nm || eth || hl;
    case 'hl':   return hl  || nm || eth || iso;
    case 'ethnicName (name)': return eth && nm ? `${eth} (${nm})` : (eth || nm || iso || hl);
    case 'name [ISO]': return nm && iso ? `${nm} [${iso}]` : (nm || eth || iso || hl);
    case 'ethnicName':
    default:     return eth || nm || iso || hl;
  }
}

const options = computed(() => (props.languages || []).map(l => ({
  label: makeLabel(l),
  value: String(l[props.valueField] || l.languageCodeIso || ''),
  _obj: l // keep the full object for store updates
})));

// helpers to match current selection to options
function sameLang(a, b) {
  if (!a || !b) return false;
  const aHL = String(a.languageCodeHL || '');
  const bHL = String(b.languageCodeHL || '');
  const aIso = String(a.languageCodeIso || '');
  const bIso = String(b.languageCodeIso || '');
  return (aHL && aHL === bHL) || (aIso && aIso === bIso);
}
function findOptionByLang(lang) {
  return options.value.find(o => sameLang(o._obj, lang)) || null;
}
function findOptionByValue(val) {
  return options.value.find(o => o.value === val) || null;
}

function commitToStore(val) {
  const hit = findOptionByValue(val);
  store.setLanguageObjectSelected(hit ? hit._obj : null);
}

onMounted(() => {
  const current = store.languageSelected || null;
  const opt = findOptionByLang(current);
  model.value = opt ? opt.value : null;
  if (!opt && current) store.setLanguageObjectSelected(null);
});

watch(model, (val) => commitToStore(val));
</script>

<template>
  <div class="column q-gutter-sm">
    <q-option-group
      v-if="options.length"
      v-model="model"
      type="radio"
      :options="options"
      color="primary"
    />
    <div v-else class="text-negative">No languages available.</div>
  </div>
</template>
