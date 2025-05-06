import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'eng00',
  fallbackLocale: 'eng00',
  legacy: false,
  globalInjection: true,
  messages: {eng00}, // Load dynamically later
});

export default ({ app }) => {
  app.use(i18n);
};

export { i18n };
