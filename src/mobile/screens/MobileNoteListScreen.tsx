import React, { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Note } from '../../types';
import MobileEmptyState from '../components/MobileEmptyState';

interface MobileNoteListScreenProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  profileImage: string;
  onOpenSettings: () => void;
}

export default function MobileNoteListScreen({
  notes,
  onSelectNote,
  onAddNote,
  profileImage,
  onOpenSettings,
}: MobileNoteListScreenProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visibleNotes = useMemo(() => {
    const activeNotes = notes
      .filter((note) => !note.isDeleted)
      .slice()
      .sort((a, b) => new Date(b.dateString).getTime() - new Date(a.dateString).getTime());

    const q = query.trim().toLowerCase();
    if (!q) return activeNotes;
    return activeNotes.filter(
      (note) => note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="flex items-center gap-2 h-14 px-4 border-b border-grid-line bg-background shrink-0">
        {searchOpen ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="메모 검색"
              className="flex-1 h-11 px-3 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={closeSearch}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
              aria-label="검색 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-9 h-9 shrink-0 rounded-full overflow-hidden border border-outline-variant"
              aria-label="설정"
              title="설정"
            >
              <img src={profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
            <h1 className="flex-1 text-lg font-bold text-primary truncate">MEMOry</h1>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
              aria-label="메모 검색"
            >
              <Search className="w-5 h-5" />
            </button>
          </>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
        {visibleNotes.length === 0 ? (
          <MobileEmptyState message={query.trim() ? '검색 결과가 없습니다' : '메모가 없습니다'} />
        ) : (
          <ul>
            {visibleNotes.map((note) => (
              <li key={note.id} className="border-b border-grid-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelectNote(note.id)}
                  className="w-full min-h-[64px] px-4 py-3 flex flex-col gap-1 text-left active:bg-surface-container transition-colors"
                >
                  <span className="text-sm font-bold text-on-surface truncate">{note.title}</span>
                  <span className="text-xs text-on-surface-variant line-clamp-2">{note.content}</span>
                  <span className="text-[11px] text-outline">{note.updatedAt}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onAddNote}
          className="absolute bottom-4 right-4 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          aria-label="새 메모 작성"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
