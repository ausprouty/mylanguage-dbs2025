<template>
  <div class="bible-container">
    <div>
      <h3 class="dbs">{{ passageReference }}</h3>
    </div>
    <div v-html="biblePassage.passageText" class="bible-text"></div>
    <div>
      <a :href="biblePassage.passageUrl" class="readmore-button">
        {{ translation.read_more }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "BiblePassage",
  props: {
    passageReference: { type: String, default: "No reference found" },
    biblePassage: { type: Object, required: true },
    translation: { type: Object, required: true },
  },
};
</script>

<style scoped>
.bible-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.bible-text {
  font-size: 16px;
  line-height: 1.5;
}

.readmore-button {
  display: inline-block;
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 3px;
}

.readmore-button:hover {
  background-color: #0056b3;
}
</style>
