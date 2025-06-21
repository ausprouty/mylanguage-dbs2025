const dbName = "MyBibleApp";
const dbVersion = 3;
let dbInstance = null;
import * as ContentKeys from 'src/utils/ContentKeyBuilder';

export function openDatabase() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
      reject("IndexedDB error:", event.target.error);
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("commonContent"))
        db.createObjectStore("commonContent");

      if (!db.objectStoreNames.contains("lessonContent"))
        db.createObjectStore("lessonContent");

      if (!db.objectStoreNames.contains("interface"))
        db.createObjectStore("interface");

      if (!db.objectStoreNames.contains("videoUrls"))
        db.createObjectStore("videoUrls");

      if (!db.objectStoreNames.contains("notes")) db.createObjectStore("notes");

      if (!db.objectStoreNames.contains("completed_lessons"))
        db.createObjectStore("completed_lessons");

      // ✅ NEW store for per-study tracking
      if (!db.objectStoreNames.contains("study_progress"))
        db.createObjectStore("study_progress");
    };
  });
}

async function saveItem(storeName, key, value) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e);
  });
}

async function getItem(storeName, key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

// ----------------- Common Content -----------------

export async function getInterfaceFromDB(lang) {
  const key = ContentKeys.buildInterfaceKey(lang);
  return getItem("interface", key);
}

export async function saveInterfaceToDB(lang, content) {
   const key = ContentKeys.buildInterfaceKey(lang);
  return saveItem("interface", key, content);
}

// ----------------- Common Content -----------------

export async function getCommonContentFromDB(study, lang) {
  const key = ContentKeys.buildCommonContentKey(study, languageCodeHL);
  return getItem("commonContent", key);
}

export async function saveCommonContentToDB(study, languageCodeHL, content) {
  const key = ContentKeys.buildCommonContentKey(study, languageCodeHL);
  return saveItem("commonContent", key, content);
}

// ----------------- Lesson Content -----------------

export async function getLessonContentFromDB(study, languageCodeHL, languageCodeJF, lesson) {
  const key = ContentKeys.buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson);
  return getItem("lessonContent", key);
}

export async function saveLessonContentToDB(study, languageCodeHL,languageCodeJF, lesson, content) {
  const key = ContentKeys.buildLessonContentKey(study, languageCodeHL, languageCodeJF, lesson);
  return saveItem("lessonContent", key, content);
}

// ----------------- Video URLs -----------------

export async function getVideoUrlsFromDB(study, languageCodeJF) {
  const key = ContentKeys.buildVideoUrlsKey(study, languageCodeJF);
  return getItem("videoUrls", key);
}

export async function saveVideoUrlsToDB(study, languageCodeJF,urls) {
  const key = ContentKeys.buildVideoUrlsKey(study, languageCodeJF);
  return saveItem("videoUrls", key, urls);
}

// ----------------- Study Progress and Last Completed Lesson per Study ---------
export async function getStudyProgress(study) {
  return getItem("study_progress", study).then(
    (data) => data || { completedLessons: [], lastCompletedLesson: null }
  );
}

export async function saveStudyProgress(study, progress) {
  // Ensure we store plain objects, not Vue refs
  const safeProgress = {
    completedLessons: [...progress.completedLessons],
    lastCompletedLesson: progress.lastCompletedLesson,
  };
  return saveItem("study_progress", study, safeProgress);
}

// ----------------- Notes -----------------


export async function getNoteFromDB(study, lesson, position) {
  const key = ContentKeys.buildNotesKey(study, lesson, position);
  return getItem("notes", key);
}

export async function saveNoteToDB(study, lesson, position, content) {
  const key = ContentKeys.buildNotesKey(study, lesson, position);
  return saveItem("notes", key, content);
}

export async function deleteNoteFromDB(study, lesson, position) {
  const db = await openDatabase();
  const key = ContentKeys.buildNotesKey(study, lesson, position);
  const tx = db.transaction("notes", "readwrite");
  tx.objectStore("notes").delete(key);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e);
  });
}
