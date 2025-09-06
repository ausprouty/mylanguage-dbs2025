<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const allowList = [
  'everyperson.com',
  'www.everyperson.com',
  'everystudent.com',
  'www.everystudent.com',
  'docs.google.com',
];

const rawUrl = computed(() => String(route.query.url || ''));

function isHttps(u) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isAllowed(u) {
  try {
    const parsed = new URL(u);
    const host = parsed.hostname.toLowerCase();
    return allowList.some((d) => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

const safeUrl = computed(() => {
  const u = rawUrl.value.trim();
  if (!u) return '';
  if (!isHttps(u)) return '';
  if (!isAllowed(u)) return '';
  return u;
});

const hostLabel = computed(() => {
  try {
    return safeUrl.value ? new URL(safeUrl.value).hostname : '';
  } catch {
    return '';
  }
});

const opened = ref(false);

function openForm() {
  if (!safeUrl.value) return;
  window.open(safeUrl.value, '_blank', 'noopener');
  opened.value = true;
}

function goBack() {
  router.back();
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="page-width">
      <div v-if="safeUrl">
        <div class="text-h5 q-mb-xs">
          You will find this resource at {{ hostLabel }}
        </div>
        <div class="text-body2 q-mb-md">
          We’ll open the page in a new browser tab so your place here is
          preserved. When you’re done, just return to this tab.
        </div>

        <div class="row items-center q-gutter-sm q-mt-sm">
          <q-btn
            label="Open Form in New Tab"
            color="primary"
            unelevated
            @click="openForm"
          />
          <q-btn
            label="Go Back"
            color="primary"
            outline
            @click="goBack"
          />
        </div>

        <div v-if="opened" class="text-positive q-mt-md">
          The form was opened in a new tab.
        </div>
      </div>

      <div v-else>
        <div class="text-negative q-mb-md">
          Sorry, that link is missing or not allowed.
        </div>
        <q-btn
          label="Go Back"
          color="primary"
          outline
          @click="goBack"
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
</style>
