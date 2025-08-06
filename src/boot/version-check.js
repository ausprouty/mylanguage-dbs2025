import { DEFAULTS } from 'src/constants/Defaults';
import { clearOrUpdateData } from 'src/utils/versionUtilities';

export default async () => {
  const currentAppVersion = DEFAULTS.appVersion;

  try {
    const lastSeenAppVersion = localStorage.getItem('appVersion');

    if (lastSeenAppVersion !== currentAppVersion) {
      localStorage.setItem('appVersion', currentAppVersion);
      await clearOrUpdateData();
    }
  } catch (err) {
    console.warn('App version check failed:', err);
  }
};
