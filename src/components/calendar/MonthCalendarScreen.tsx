import { Note } from '../../types';
import { getMonthCells, isSameLocalDate } from './calendarUtils';

interface MonthCalendarScreenProps {
  selectedDate: Date;
  notesByDate: Map<string, Note[]>;
  onSelectDate: (date: Date) => void;
  onSelectNote: (noteId: string) => void;
}

export default function MonthCalendarScreen({
  selectedDate,
  notesByDate,
  onSelectDate,
  onSelectNote,
}: MonthCalendarScreenProps) {
  const cells = getMonthCells(selectedDate);
  const today = new Date();

  return (
    <div className="h-full overflow-auto p-4 md:p-6 no-scrollbar">
      <div className="bg-surface-container-lowest rounded-xl notebook-shadow border border-grid-line overflow-hidden min-w-[680px]">
        <div className="grid grid-cols-7 border-b border-grid-line bg-surface-container-low text-xs font-bold py-3 text-center text-on-surface-variant">
          <div className="text-error">일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div className="text-primary">토</div>
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(112px,1fr)]">
          {cells.map((cell) => {
            const dayNotes = notesByDate.get(cell.dateString) || [];
            const selected = isSameLocalDate(cell.date, selectedDate);
            const currentDay = isSameLocalDate(cell.date, today);
            const weekday = cell.date.getDay();

            return (
              <div
                key={cell.dateString}
                className={`border-r border-b border-grid-line p-3 flex flex-col text-left hover:bg-primary/5 cursor-pointer transition-colors relative group ${selected ? 'bg-primary/5' : ''} ${cell.isCurrentMonth ? '' : 'bg-slate-50/50 opacity-45'}`}
              >
                <button
                  type="button"
                  onClick={() => onSelectDate(cell.date)}
                  className="flex justify-between items-start w-full cursor-pointer"
                  aria-label={`${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일, 메모 ${dayNotes.length}개`}
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${selected ? 'bg-primary text-white shadow-soft' : currentDay ? 'ring-2 ring-primary text-primary' : weekday === 0 ? 'text-error' : weekday === 6 ? 'text-primary' : 'text-on-surface'}`}>
                    {cell.date.getDate()}
                  </span>
                  {dayNotes.length > 0 && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1" />}
                </button>

                <div className="mt-auto pt-2 flex flex-col gap-1 w-full overflow-hidden">
                  {dayNotes.slice(0, 2).map((note) => (
                    <button
                      type="button"
                      key={note.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectNote(note.id);
                      }}
                      className="bg-surface border-l-2 border-primary text-[10px] font-bold text-on-surface-variant truncate px-1.5 py-0.5 rounded shadow-2xs max-w-full"
                    >
                      {note.title}
                    </button>
                  ))}
                  {dayNotes.length > 2 && (
                    <span className="text-[9px] text-outline font-bold pl-1">+{dayNotes.length - 2}개</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
