import { Edit3, FolderOpen } from 'lucide-react';
import { Group, Note } from '../../types';
import HolidayBadges from '../../features/holidays/HolidayBadges';
import { KoreanHoliday } from '../../features/holidays/koreanHolidayTypes';
import { toLocalDateString } from '../../utils/date';
import CalendarNoteCard from './CalendarNoteCard';

interface DayCalendarScreenProps {
  selectedDate: Date;
  notes: Note[];
  holidays: KoreanHoliday[];
  groups: Group[];
  onSelectNote: (noteId: string) => void;
  onAddNoteWithDate: (dateString: string) => void;
}

export default function DayCalendarScreen({
  selectedDate,
  notes,
  holidays,
  groups,
  onSelectNote,
  onAddNoteWithDate,
}: DayCalendarScreenProps) {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 no-scrollbar">
      <section className="max-w-4xl mx-auto bg-surface-container-lowest rounded-xl notebook-shadow border border-grid-line p-5 md:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-grid-line pb-5">
          <div>
            <p className="text-xs font-bold text-primary">하루 기록</p>
            <h2 className="mt-1 text-xl font-bold text-on-surface">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </h2>
            <HolidayBadges holidays={holidays} />
          </div>
          <span className="text-xs bg-surface-container-high px-3 py-1 rounded-full text-on-surface-variant font-bold">
            {notes.length}개
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 opacity-40">
              <FolderOpen className="w-12 h-12 text-outline mb-3 stroke-[1.25]" />
              <p className="text-sm font-semibold text-on-surface">기록된 메모가 없습니다</p>
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
          className="mt-6 w-full bg-primary text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all text-sm font-bold cursor-pointer shadow-soft active:scale-[0.99]"
        >
          <Edit3 className="w-4 h-4" />
          <span>이 날짜에 새 메모 추가</span>
        </button>
      </section>
    </div>
  );
}
