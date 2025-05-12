const dbName = 'MyBibleApp';
const dbVersion = 1;
let dbInstance = null;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
      reject('IndexedDB error:', event.target.error);
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('commonContent')) db.createObjectStore('commonContent');
      if (!db.objectStoreNames.contains('lessonContent')) db.createObjectStore('lessonContent');
      if (!db.objectStoreNames.contains('videoUrls')) db.createObjectStore('videoUrls');
      if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes');
      if (!db.objectStoreNames.contains('completed_lessons')) db.createObjectStore('completed_lessons');

    };
  });
}

async function saveItem(storeName, key, value) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e);
  });
}

async function getItem(storeName, key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

// ----------------- Common Content -----------------

export async function getCommonContentFromDB(study, lang) {
  const key = `${study}-${lang}-CommonContent`;
  return getItem('commonContent', key);
}

export async function saveCommonContentToDB(study, lang, content) {
  const key = `${study}-${lang}-CommonContent`;
  return saveItem('commonContent', key, content);
}

// ----------------- Lesson Content -----------------

export async function getLessonContentFromDB(study, lang, lesson) {
  const key = `${study}-${lang}-${lesson}-LessonContent`;
  return getItem('lessonContent', key);
}

export async function saveLessonContentToDB(study, lang, lesson, content) {
  const key = `${study}-${lang}-${lesson}-LessonContent`;
  return saveItem('lessonContent', key, content);
}

// ----------------- Video URLs -----------------

export async function getVideoUrlsFromDB(study, lang, lesson) {
  const key = `${study}-${lang}-Video-${lesson}`;
  return getItem('videoUrls', key);
}

export async function saveVideoUrlsToDB(study, lang, lesson, urls) {
  const key = `${study}-${lang}-Video-${lesson}`;
  return saveItem('videoUrls', key, urls);
}
// ----------------- Completed Lessons -----------------

export async function getCompletedLessonsFromDB(study) {
  return getItem('completed_lessons', study);
}

export async function saveCompletedLessonsToDB(study, lessonsArray) {
  return saveItem('completed_lessons', study, lessonsArray);
}

