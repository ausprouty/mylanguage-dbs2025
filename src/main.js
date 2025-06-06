import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from 'App.vue'
import i18n from 'i18n/index.js';
import router from 'router'

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')
