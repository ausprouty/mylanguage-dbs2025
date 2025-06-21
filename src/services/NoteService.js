import { useContentStore } from "../stores/ContentStore";
import { buildNotesKey } from 'src/utils/ContentKeyBuilder';
import {
  getNoteFromDB,
  saveNoteToDB,
  deleteNoteFromDB,
} from "./IndexedDBService";

export async function getNote(study, lesson, position) {
  const store = useContentStore();
  const key = buildNotesKey(study, lesson, position);

  if (store.lessonContent[key] !== undefined) {
    return store.lessonContent[key];
  }

  const note = await getNoteFromDB(study, lesson, position);
  if (note !== undefined) {
    store.lessonContent[key] = note;
    return note;
  }

  return "";
}

export async function saveNote(study, lesson, position, content) {
  const store = useContentStore();
  const key = buildNotesKey(study, lesson, position);
  store.lessonContent[key] = content;
  await saveNoteToDB(study, lesson, position, content);
}

export async function deleteNote(study, lesson, position) {
  const store = useContentStore();
  const key = buildNotesKey(study, lesson, position);
  delete store.lessonContent[key];
  await deleteNoteFromDB(study, lesson, position);
}
