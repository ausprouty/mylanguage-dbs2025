import { useContentStore } from "stores/ContentStore";
import { computed, unref } from "vue";

export function useCommonContent(study, languageCodeHLRef) {
  const contentStore = useContentStore();

  const commonContent = computed(() => {
    const lang = unref(languageCodeHLRef);
    return contentStore.getCommonContent(study, lang) || {};
  });

  const topics = computed(() => {
    if (!commonContent.value?.topic) return [];
    return Object.entries(commonContent.value.topic).map(([key, value]) => ({
      label: `${parseInt(key)}. ${value}`,
      value: parseInt(key),
    }));
  });

  const loadCommonContent = async (lang = unref(languageCodeHLRef)) => {
    try {
      await contentStore.loadCommonContent(lang, study);
    } catch (error) {
      console.error("Failed to load common content:", error);
    }
  };

  return {
    commonContent,
    topics,
    loadCommonContent,
  };
}
