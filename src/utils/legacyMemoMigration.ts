import { Group, Note } from '../types';

interface LegacyMemoState {
  darkMode: boolean;
  groups: Group[];
  hasData: boolean;
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
  const legacyKeys = [
    'personal_notes_data',
    'personal_notes_folders',
    'personal_notes_profile_img',
    'personal_notes_dark_mode',
  ];
  const notes = readArray<Note>(storage, 'personal_notes_data')
    .filter((note) => note && typeof note.id === 'string');
  const groups = readArray<Group>(storage, 'personal_notes_folders')
    .filter((group) => group && typeof group.id === 'string');

  return {
    notes,
    groups,
    hasData: legacyKeys.some((key) => storage.getItem(key) !== null),
    profileImage: storage.getItem('personal_notes_profile_img'),
    darkMode: storage.getItem('personal_notes_dark_mode') === 'true',
  };
};

export const legacyMigrationKey = (userId: string) =>
  `personal_notes_firebase_migrated_v2_${userId}`;
