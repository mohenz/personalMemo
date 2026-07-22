import { Edit3, FolderOpen } from 'lucide-react';
import { Group, Note } from '../../types';
import { toLocalDateString } from '../../utils/date';
import CalendarNoteCard from './CalendarNoteCard';

interface SelectedDayPanelProps {
  selectedDate: Date;
  notes: Note[];
  groups: Group[];
  onSelectNote: (noteId: string) => void;
  onAddNoteWithDate: (dateString: string) => void;
}

export default function SelectedDayPanel({
  selectedDate,
  notes,
  groups,
  onSelectNote,
  onAddNoteWithDate,
}: SelectedDayPanelProps) {
  const dateLabel = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

  return (
    <aside className="w-full xl:w-[360px] max-h-[42vh] xl:max-h-none border-t xl:border-t-0 xl:border-l border-grid-line bg-surface-container-low flex flex-col shrink-0">
      <div className="p-5 md:p-6 flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold text-on-surface">{dateLabel} 메모</h2>
          <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant font-bold">
            {notes.length}개
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 opacity-40">
              <FolderOpen className="w-10 h-10 text-outline mb-2 stroke-[1.25]" />
              <p className="text-xs font-semibold text-on-surface">기록된 메모가 없습니다</p>
            </div>
          ) : notes.map((note) => (
            <div key={note.id}>
              <CalendarNoteCard
                note={note}
                groups={groups}
                onSelectNote={onSelectNote}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onAddNoteWithDate(toLocalDateString(selectedDate))}
          className="bg-primary/10 text-primary border border-primary/20 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all text-sm font-bold cursor-pointer shadow-2xs active:scale-95 shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          <span>이 날짜에 새 메모 추가</span>
        </button>
      </div>
    </aside>
  );
}
