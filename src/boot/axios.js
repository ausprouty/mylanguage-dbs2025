import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// Create Axios instances for each API
const legacyApi = axios.create({ baseURL: process.env.LEGACY_API });
const currentApi = axios.create({ baseURL: process.env.CURRENT_API });


export default boot(({ app }) => {
  // Make them available globally in Vue
  app.config.globalProperties.$legacyApi = legacyApi;
  app.config.globalProperties.$currentApi = currentApi;
});

// Export Axios instances for direct import elsewhere
export { legacyApi, currentApi };
