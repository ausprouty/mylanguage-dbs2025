<script setup>
const props = defineProps({
  fixedLanguages: { type: Array, default: () => [] }
});
</script>

<template>
  <div class="column q-gutter-sm">
    <q-option-group
      v-if="props.fixedLanguages.length"
      type="radio"
      :options="props.fixedLanguages.map(code => ({ label: code, value: code }))"
      v-model="currentCode"
      @update:model-value="onPick"
    />
    <div v-else class="text-negative">
      No languages configured.
    </div>
  </div>
</template>
