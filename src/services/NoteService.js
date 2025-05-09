import { useContentStore } from '/stores/ContentStore';
import { getItem, saveItem } from './IndexedDBService';
import { openDatabase } from './IndexedDBService'; // Make sure it's exported

const NOTES_STORE = 'notes';

function makeNoteKey(study, lesson, position) {
  return `notes-${study}-${lesson}-${position}`;
}

export async function getNote(study, lesson, position) {
  const store = useContentStore();
  const key = makeNoteKey(study, lesson, position);

  // 1. Check ContentStore
  const content = store.lessonContent[key];
  if (content !== undefined) {
    console.log(`✅ Note loaded from ContentStore: ${key}`);
    return content;
  }

  // 2. Check IndexedDB
  const dbNote = await getItem(NOTES_STORE, key);
  if (dbNote !== undefined) {
    console.log(`✅ Note loaded from IndexedDB: ${key}`);
    store.lessonContent[key] = dbNote; // cache into store
    return dbNote;
  }

  // 3. Not found
  console.log(`⚠️ Note not found: ${key}`);
  return '';
}

export async function saveNote(study, lesson, position, content) {
  const store = useContentStore();
  const key = makeNoteKey(study, lesson, position);

  store.lessonContent[key] = content;
  await saveItem(NOTES_STORE, key, content);
  console.log(`💾 Note saved to store and DB: ${key}`);
}

export async function deleteNote(study, lesson, position) {
  const store = useContentStore();
  const key = makeNoteKey(study, lesson, position);

  delete store.lessonContent[key];

  const db = await openDatabase();

  const tx = db.result.transaction(NOTES_STORE, 'readwrite');
  tx.objectStore(NOTES_STORE).delete(key);
  console.log(`🗑️ Note deleted: ${key}`);
}

export async function getAllNotes() {
  const db = await openDatabase();
  const tx = db.result.transaction(NOTES_STORE, 'readonly');
  const store = tx.objectStore(NOTES_STORE);
  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}
