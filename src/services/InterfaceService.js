import { currentApi } from "boot/axios";
import { getInterface, setInterface } from "src/services/IndexedDBService";


export async function getTranslatedInterface(lang) {
  const project= import.meta.env.VITE_PROJECT

  let messages = await indexedDBService.getInterface(lang);

  if (!messages) {
    const res = await axios.get(`/api/i18n?project=${project}&lang=${lang}`);
    messages = res.data;
    await indexedDBService.setInterface(lang,messages);
  }

  i18n.global.setLocaleMessage(lang, messages);
  i18n.global.locale.value = lang;
}
