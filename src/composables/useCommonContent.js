import { useContentStore } from "stores/ContentStore";
import {computed} from "vue";

export function useCommonContent(study, initialLanguageCodeHL) {
  const ContentStore = useContentStore();

  const topics = computed(() => {
    const content = ContentStore.getCommonContent(study, initialLanguageCodeHL);
    if (!content?.topic) return [];
    return Object.entries(content.topic).map(([key, value]) => ({
      label: `${parseInt(key)}. ${value}`,
      value: parseInt(key),
    }));
  });

  const loadCommonContent = async (languageCode = initialLanguageCodeHL) => {
    try {
      await ContentStore.loadCommonContent(languageCode, study);
    } catch (error) {
      console.error("Failed to load common content:", error);
    }
  };

  return {
    commonContent: computed(
      () => ContentStore.getCommonContent(study, initialLanguageCodeHL) || {}
    ),
    topics,
    loadCommonContent,
  };
}
