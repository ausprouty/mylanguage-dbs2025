import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'eng00',
  fallbackLocale: 'eng00',
  legacy: false,
  globalInjection: true,
  messages: {}, // Load dynamically later
  silentTranslationWarn: false,  // show “cannot translate” warnings
  silentFallbackWarn:    false,  // show “fall back to root locale” notices
});

export default async ({ app }) => {
  app.use(i18n)

}

export { i18n };
