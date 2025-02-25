import { createI18n } from 'vue-i18n';
import eng00 from 'src/i18n/eng00.json';
import frn00 from 'src/i18n/frn00.json';

export default ({ app }) => {
  const i18n = createI18n({
    locale: 'eng00',
    legacy: false,
    globalInjection: true,
    messages: {
      'eng00': eng00,
      'frn00': frn00,
      // Add other locales as needed
    },
  });

  app.use(i18n);
};
