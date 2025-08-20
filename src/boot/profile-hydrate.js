import { boot } from 'quasar/wrappers';
import { useLanguageStore } from 'src/stores/LanguageStore';

export default boot(() => {
  const meta = globalThis.__SITE_META__ || {};
  // Back-compat: accept apiVariant too
  const raw = meta.apiProfile ?? meta.apiVariant ?? 'standard';
  const profile = typeof raw === 'string' ? raw.trim() : 'standard';

  const store = useLanguageStore();
  if (store.setApiProfile) store.setApiProfile(profile);
  else store.apiProfile = profile; // fallback if action not present
});
