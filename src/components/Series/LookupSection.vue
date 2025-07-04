<script setup>
import { ref, watch, onMounted } from "vue";
import BibleText from "src/components/bible/BibleTextBar.vue";
import VideoBar from "src/components/video/VideoBar.vue";
import NoteSection from "src/components/notes/NoteSection.vue";

const props = defineProps({
  section: { type: String, required: true },
  commonContent: { type: Object, required: true },
  lessonContent: { type: Object, required: true },
  placeholder: { type: String, default: "Write your notes here" },
  timing: { type: String, default: "Spend 20 to 30 minutes on this section" },
});

</script>
<template>

  <section v-if="commonContent">
    <h2 class="ltr dbs">{{ commonContent.title }}</h2>
    <p class="timing">{{ timing }}</p>
    <ol class="ltr dbs">
      <li
        v-for="(item, index) in commonContent.instruction"
        :key="'instruction-' + index"
      >
        {{ item }}
      </li>
    </ol>

    <BibleText
        :passage="lessonContent.passage"
        :menu="lessonContent.menu"
      />

      <VideoBar
        v-if="lessonContent.videoUrl"
        :videoUrl="lessonContent.videoUrl"
        :videoTitle = "lessonContent.passage.referenceLocalLanguage"
        :menu="lessonContent.menu"
      />

    <ol class="ltr dbs">
      <li v-for="(item, index) in commonContent.question" :key="'question-' + index">
        {{ item }}
      </li>
    </ol>
    <NoteSection :sectionKey="section" :placeholder="placeholder" />
  </section>
</template>

<style scoped>
textarea {
  width: 100%;
  height: 100px;
  margin-top: 8px;
}
</style>
