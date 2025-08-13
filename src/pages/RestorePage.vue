<script>
export default {
  name: "RestorePage",
  async created() {
    const siteKey = process.env.VITE_APP || "default";
    const key = `lastGoodPath:${siteKey}`;
    const fallback = "/index";

    const saved = localStorage.getItem(key) || fallback;
    const resolved = this.$router.resolve(saved);
    const target = resolved.matched.length ? saved : fallback;

    try {
      await this.$router.replace(target);
    } catch {
      await this.$router.replace(fallback);
    }
  },
};
</script>

<template>
  <q-page padding />
</template>
