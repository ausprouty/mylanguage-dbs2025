import { useContentStore } from "stores/ContentStore";
import { computed, unref, watch } from "vue";

export function useCommonContent(study, languageCodeHLRef) {
  const contentStore = useContentStore();
  const topics = computed(() => {
    const lang = unref(languageCodeHLRef);
    const content = contentStore.getCommonContent(study, lang);
    if (!content?.topic) return [];
    return Object.entries(content.topic).map(([key, value]) => ({
      label: `${parseInt(key)}. ${value}`,
      value: parseInt(key),
    }));
  });

  const commonContent = computed(() => {
    const lang = unref(languageCodeHLRef);
    return contentStore.getCommonContent(study, lang) || {};
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
