import { Group, Note } from '../types';

export const LEGACY_SAMPLE_NOTE_IDS = new Set([
  'note-1', 'note-2', 'note-3', 'note-4', 'note-5',
  'note-6', 'note-7', 'note-8', 'note-9', 'note-10',
]);

export const LEGACY_SAMPLE_GROUP_IDS = new Set(['work', 'personal', 'travel']);

interface LegacyMemoState {
  darkMode: boolean;
  groups: Group[];
  notes: Note[];
  profileImage: string | null;
}

interface StorageReader {
  getItem(key: string): string | null;
}

const readArray = <T>(storage: StorageReader, key: string): T[] => {
  try {
    const value = storage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const readLegacyMemoState = (storage: StorageReader): LegacyMemoState => {
  const notes = readArray<Note>(storage, 'personal_notes_data')
    .filter((note) => note && typeof note.id === 'string' && !LEGACY_SAMPLE_NOTE_IDS.has(note.id));
  const referencedGroupIds = new Set(notes.map((note) => note.groupId));
  const groups = readArray<Group>(storage, 'personal_notes_folders')
    .filter((group) => group && typeof group.id === 'string')
    .filter((group) => !LEGACY_SAMPLE_GROUP_IDS.has(group.id) || referencedGroupIds.has(group.id));

  return {
    notes,
    groups,
    profileImage: storage.getItem('personal_notes_profile_img'),
    darkMode: storage.getItem('personal_notes_dark_mode') === 'true',
  };
};

export const legacyMigrationKey = (userId: string) =>
  `personal_notes_firebase_migrated_${userId}`;
