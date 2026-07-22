import { Group, Note } from '../../types';
import { toLocalDateString } from '../../utils/date';
import CalendarNoteCard from './CalendarNoteCard';
import { getWeekDates, isSameLocalDate } from './calendarUtils';

interface WeekCalendarScreenProps {
  selectedDate: Date;
  notesByDate: Map<string, Note[]>;
  groups: Group[];
  onSelectDate: (date: Date) => void;
  onSelectNote: (noteId: string) => void;
}

export default function WeekCalendarScreen({
  selectedDate,
  notesByDate,
  groups,
  onSelectDate,
  onSelectNote,
}: WeekCalendarScreenProps) {
  const today = new Date();

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 no-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-7 bg-surface-container-lowest rounded-xl notebook-shadow border border-grid-line overflow-hidden">
        {getWeekDates(selectedDate).map((date) => {
          const dateString = toLocalDateString(date);
          const dayNotes = notesByDate.get(dateString) || [];
          const selected = isSameLocalDate(date, selectedDate);
          const currentDay = isSameLocalDate(date, today);

          return (
            <section key={dateString} className={`min-h-44 md:min-h-[520px] border-b md:border-b-0 md:border-r border-grid-line last:border-0 ${selected ? 'bg-primary/5' : ''}`}>
              <button
                type="button"
                onClick={() => onSelectDate(date)}
                className="sticky top-0 z-10 w-full px-3 py-3 bg-surface-container-low/95 backdrop-blur-sm border-b border-grid-line text-center cursor-pointer"
                aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일 선택`}
              >
                <span className="block text-[10px] font-bold text-on-surface-variant">
                  {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                </span>
                <span className={`mt-1 mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${selected ? 'bg-primary text-white' : currentDay ? 'ring-2 ring-primary text-primary' : 'text-on-surface'}`}>
                  {date.getDate()}
                </span>
              </button>

              <div className="p-2 space-y-2">
                {dayNotes.length === 0 ? (
                  <p className="py-6 text-center text-[10px] text-outline">메모 없음</p>
                ) : dayNotes.map((note) => (
                  <div key={note.id}>
                    <CalendarNoteCard
                      note={note}
                      groups={groups}
                      onSelectNote={onSelectNote}
                      compact
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
