import { useContentStore } from "stores/ContentStore";
import { computed, watch, unref } from "vue";

export function useCommonContent(study, languageCodeHLRef) {
  const contentStore = useContentStore();

  const commonContent = computed(() => {
    const lang = unref(languageCodeHLRef);
    return contentStore.commonContentFor(study, lang) || {};
  });

  const topics = computed(() => {
    const topicEntries = commonContent.value?.topic;
    if (!topicEntries || typeof topicEntries !== 'object') return [];

    return Object.entries(topicEntries)
      .map(([key, value]) => {
        const index = parseInt(key, 10);
        return {
          label: `${index}. ${value}`,
          value: index,
        };
      })
      .filter(({ value }) => !isNaN(value));
  });


  const loadCommonContent = async (lang = unref(languageCodeHLRef)) => {
    try {
      console.log('I am going to content store to load common content')
      await contentStore.loadCommonContent(lang, study);
       console.log('I returned from  content store to load common content')
    } catch (error) {
      console.error("Failed to load common content:", error);
    }
  };
  watch(commonContent, (val) => {
    console.log("commonContent changed:", val);
  });

  watch(topics, (val) => {
    console.log("topics changed:", val);
  });

  return {
    commonContent,
    topics,
    loadCommonContent,
  };
}
