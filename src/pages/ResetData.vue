<template>
  <div class="container">
    <h2>Reset Application Data</h2>
    <p>This will clear all locally stored data and reset the application state.</p>
    <q-btn color="red" @click="confirmClearData">Clear Data</q-btn>
  </div>
</template>

<script setup>
import { useLanguageStore } from 'stores/LanguageStore';
import { useQuasar } from 'quasar';

const languageStore = useLanguageStore();
const $q = useQuasar();

const confirmClearData = () => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to clear all data? This cannot be undone.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    clearData();
  });
};

const clearData = () => {
  localStorage.clear(); // Clear local storage
  languageStore.$reset(); // Reset Pinia store
  location.reload(); // Reload to apply changes
};
</script>

<style scoped>
.container {
  text-align: center;
  padding: 20px;
  background-color: #efefef;
}

</style>
