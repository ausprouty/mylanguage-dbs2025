import { defineStore } from "pinia";
import { getCommonContent, getLessonContent, getJesusVideoUrls} from 'src/services/TranslationService';

export const useLanguageStore = defineStore("languageStore", {
  state: () => ({
    currentStudy:'dbs',
    currentUrl:null,
    commonContent: {}, // Will store content by language and study
    lessonContent:{}, // Will store content by language, study and lesson
    videoUrls:{},
    lessonNumber: {
      dbs:1,
      lead:1,
      life:1,
      jvideo:1,
    },
    maxLessonNumber:{
      dbs:23,
      lead:25,
      life:23,
      jvideo:61,
    },

    languages: [],
    languageSelected: {
      languageCodeHL: 'eng00',
      languageCodeJF: '529',
      value: 3
    },
    previousPage: '/index'
  }),
  getters: {
    getCurrentStudy() {
      let study = this.currentStudy || localStorage.getItem('currentStudy') || 'dbs';

      // If currentStudy exists, update localStorage
      if (this.currentStudy) {
        localStorage.setItem('currentStudy', this.currentStudy);
      }
      return study;
    },
    getFollowingHimSegment: (state) => {
      if (state.followingHimSegment  == null || typeof state.followingHimSegment == 'undefined'){
        state.followingHimSegment = localStorage.getItem("followingHimSegment", '1-0-0')
      }
      return state.followingHimSegment
    },
    getLessonNumber: (state) => {
      const study = state.currentStudy; // Automatically use current study

      if (!state.lessonNumber.hasOwnProperty(study)) {
        console.warn(`Invalid study: ${study}`);
        return null;
      }
      if (state.lessonNumber[study] !== null) {
        return parseInt(state.lessonNumber[study], 10);
      }
      const savedLesson = localStorage.getItem(`${study}Lesson`);
      if (savedLesson !== null) {
        state.lessonNumber[study] = parseInt(savedLesson, 10);
        return state.lessonNumber[study];
      }

      return 1; // Default value
    },
    getMaxLesson: (state) => (study) => {
      if (!state.maxLessonNumber.hasOwnProperty(study)) {
        console.warn(`Invalid study: ${study}`);
        return 0;
      }
      return state.maxLessonNumber[study];
    },
    isAtMaxLesson: (state) => (study) => {
      const currentLesson = parseInt(state.lessonNumber[study] || 0, 10);
      const maxLesson = state.maxLessonNumber[study] || 0;
      return currentLesson >= maxLesson;
    },
    getJVideoSegmentId: (state) => {
      if (state.jVideoSegments.currentId  == null || typeof state.jVideoSegments.currentId == 'undefined'){
        console.log ('getting jvideoSegmentId from local storage')
        state.jVideoSegments.currentId = localStorage.getItem("jVideoSegments.currentId", 1)
      }
      return state.jVideoSegments.currentId
    },

    getLanguageCodeHLSelected: (state) => {
      if (!state.languageSelected) {
        // Attempt to retrieve from localStorage or fall back to the default
        let local = localStorage.getItem("languageSelected");

        if (local) {
          try {
            state.languageSelected = JSON.parse(local);
          } catch (e) {
            console.error("Failed to parse languageSelected from localStorage", e);
            // Set default if parsing fails
            state.languageSelected = { languageCodeHL: 'eng00' };
          }
        } else {
          // Set default if nothing is found in localStorage
          state.languageSelected = { languageCodeHL: 'eng00',"languageCodeJF":529 };
        }
      }
      // Ensure a valid return value
      const languageCodeHL = state.languageSelected?.languageCodeHL || 'eng00';

      return languageCodeHL;
    },
    getLanguageCodeJFSelected: (state) => {
      if (state.languageSelected == null){
        console.log ('getLanguageCodeJFSelected state is null')
        var local = localStorage.getItem("languageSelected", '{"languageSelected":{"languageCodeHL":"eng00","languageCodeJF":529}}');
          state.languageSelected = JSON.parse(local)
      }
      else{
        console.log ('getLanguageCodeJFSelected state is NOT null')
      }
      console.log(state.languageSelected.languageCodeJF)
      return state.languageSelected.languageCodeJF
    },
    getLanguageSelected: (state) => {
      if (state.languageSelected == null){
        var local = localStorage.getItem("languageSelected", '{"languageSelected":{"languageCodeHL":"eng00","languageCodeJF":529,  "value": 3}}');
          state.languageSelected = JSON.parse(local)
      }
      return state.languageSelected
    },
    getLanguageValue: (state) => {
      if (state.languageSelected == null){
        var local = localStorage.getItem("languageSelected", '{"languageSelected":{"languageCodeHL":"eng00","languageCodeJF":529, "value": 3}}');
          state.languageSelected = JSON.parse(local)
      }
      return state.languageSelected.value
    },

    getPreviousPage: (state) => {
      var selected = localStorage.getItem("previousPage", '/index');
      return selected
    },
  },

  actions :{
    async loadCommonContent(language, study) {
      // Avoid re-fetching if the content is already loaded
      if (this.commonContent[language]?.[study]) {
        return this.commonContent[language][study];
      }
      // Fetch commonContent from service
      const content = await getCommonContent(language, study);
      // Store it in the state
      if (!this.commonContent[language]) {
        this.commonContent[language] = {};
      }
      this.commonContent[language][study] = content;
      return content;
    },
    async loadLessonContent(language, study, lesson) {
      // Initialize lessonContent[language] and lessonContent[language][study]
      // if they don't exist
      if (!this.lessonContent[language]) {
        this.lessonContent[language] = {};
      }
      if (!this.lessonContent[language][study]) {
        this.lessonContent[language][study] = {};
      }
      // Avoid re-fetching if the content is already loaded
      if (this.lessonContent[language][study][lesson]) {
        return this.lessonContent[language][study][lesson];
      }
      // Fetch commonContent from service
      try {
        const content = await getLessonContent(language, study, lesson);
        // Store it in the state
        this.lessonContent[language][study][lesson] = content;
        return content;
      } catch (error) {
        console.error('Failed to fetch lesson content:', error);
        throw error;
      }
    },
    async loadVideoUrls(language, study) {
      // Avoid re-fetching if the content is already loaded
      if (this.videoUrls[language]?.[study]) {
        return this.videoUrls[language][study];
      }
      console.log ('loadingVideoUrls');
      // Fetch videoUrls from service
      const content = await getJesusVideoUrls(language, study);
      // Store it in the state
      if (!this.videoUrls[language]) {
        this.videoUrls[language] = {};
      }
      this.videoUrls[language][study] = content;
      return content;
    },
    setCurrentStudy(study) {
        this.currentStudy = study;
        localStorage.setItem(`currentStudy`, study);
    },
    setCurrentUrl(url) {
      this.currentUrl = url;
      localStorage.setItem(`currentUrl`, url);
    },
    setLessonNumber(study, lesson) {
      if (this.lessonNumber.hasOwnProperty(study)) {
        this.lessonNumber[study] = lesson;
        localStorage.setItem(`${study}Lesson`, lesson);
      } else {
        console.warn(`Attempted to set lesson for an invalid study: ${study}`);
      }
    },
    updateJVideoSegmentId(newValue) {
      if (newValue != null){
        if (newValue > 0 && newValue < 62){
          localStorage.setItem('jVideoSegmentId', newValue);
          this.jVideoSegmentId = newValue;
        }
      }
    },
    updateLanguages(newValue) {
      var languages = JSON.stringify(newValue);
      localStorage.setItem('languages', languages);
      this.languages = languages;
    },
    updateLanguageCodeHLSelected(languageCodeHL){
      this.languageSelected.languageCodeHL = languageCodeHL;
      localStorage.setItem('languageSelected', JSON.stringify(this.languageSelected));
    },
    updateLanguageCodeJFSelected(languageCodeJF){

      this.languageSelected.languageCodeJF = languageCodeJF;
      localStorage.setItem('languageSelected', JSON.stringify(this.languageSelected));
    },
    updateLanguageSelected(languageCodeHL, languageCodeJF){
      this.languageSelected.languageCodeHL = languageCodeHL;
      this.languageSelected.languageCodeJF = languageCodeJF;
      localStorage.setItem('languageSelected', JSON.stringify(this.languageSelected));
    },
    updatePreviousPage(newValue) {
      localStorage.set("previousPage", newValue);
    },
  }
});



