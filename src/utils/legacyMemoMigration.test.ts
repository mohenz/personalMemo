import { describe, expect, it } from 'vitest';
import { legacyMigrationKey, readLegacyMemoState } from './legacyMemoMigration';

const storageWith = (values: Record<string, string>) => ({
  getItem: (key: string) => values[key] ?? null,
});

describe('legacy memo migration', () => {
  it('recovers user notes while excluding bundled sample notes', () => {
    const state = readLegacyMemoState(storageWith({
      personal_notes_data: JSON.stringify([
        { id: 'note-1', groupId: 'work' },
        { id: 'note-1720000000000', groupId: 'work', title: '사용자 메모' },
      ]),
      personal_notes_folders: JSON.stringify([
        { id: 'work', name: '업무' },
        { id: 'custom', name: '직접 만든 폴더' },
      ]),
      personal_notes_dark_mode: 'true',
    }));

    expect(state.notes.map((note) => note.id)).toEqual(['note-1720000000000']);
    expect(state.groups.map((group) => group.id)).toEqual(['work', 'custom']);
    expect(state.darkMode).toBe(true);
  });

  it('returns an empty state for malformed legacy data', () => {
    const state = readLegacyMemoState(storageWith({ personal_notes_data: '{broken' }));
    expect(state.notes).toEqual([]);
  });

  it('scopes the completed marker to the Firebase user', () => {
    expect(legacyMigrationKey('user-123')).toBe('personal_notes_firebase_migrated_user-123');
  });
});
