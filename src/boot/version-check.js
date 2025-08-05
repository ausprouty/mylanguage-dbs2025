// src/boot/version-check.js

import { clearTable } from 'src/services/IndexedDBService';
import { useContentStore } from 'src/stores/ContentStore';
import { DEFAULTS } from 'src/constants/Defaults';

async function clearContentTables() {
  const tables = ['commonContent', 'lessonContent', 'interface', 'videoUrls'];

  for (const table of tables) {
    try {
      await clearTable(table);
      console.log(`Cleared ${table}`);
    } catch (err) {
      console.warn(`Failed to clear ${table}:`, err);
    }
  }
}

async function clearOrUpdateData() {
  const contentStore = useContentStore();
  contentStore.$reset();
  deleteLocalStorageContentKeys();
  await clearContentTables();
}

function deleteLocalStorageContentKeys() {
  const keysToDelete = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key.endsWith('commonContent') ||
      key.endsWith('lessonContent')
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });
}


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
