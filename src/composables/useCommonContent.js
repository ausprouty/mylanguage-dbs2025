import { ref } from 'vue';
import { useContentStore } from 'stores/ContentStore';

export function useCommonContent(study, initialLanguageCodeHL) {

  const ContentStore = useContentStore();
  const commonContent = ref({}); // ✅ Default to an empty object
  const topics = ref([]);

  const loadCommonContent = async (languageCode = initialLanguageCodeHL) => {
    try {

      const content = await ContentStore.loadCommonContent(languageCode, study);
      commonContent.value = content || {}; // ✅ Ensure it never becomes null
      topics.value = content?.topic
        ? Object.entries(content.topic).map(([key, value]) => ({
            label: `${parseInt(key)}. ${value}`,
            value: parseInt(key),
          }))
        : [];
    } catch (error) {
      console.error('Failed to load common content:', error);
      commonContent.value = {}; // ✅ Fallback to an empty object
    }
  };

  return {
    commonContent,
    topics,
    loadCommonContent,
  };
}
