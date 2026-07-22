import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { Group, Note } from '../types';
import { toLocalDateString } from '../utils/date';
import DayCalendarScreen from './calendar/DayCalendarScreen';
import MonthCalendarScreen from './calendar/MonthCalendarScreen';
import SelectedDayPanel from './calendar/SelectedDayPanel';
import WeekCalendarScreen from './calendar/WeekCalendarScreen';
import {
  CalendarViewMode,
  formatCalendarPeriod,
  groupCalendarNotes,
  shiftCalendarDate,
} from './calendar/calendarUtils';

export { clampDayToMonth } from './calendar/calendarUtils';

interface CalendarViewProps {
  notes: Note[];
  groups: Group[];
  onSelectNote: (noteId: string) => void;
  onAddNoteWithDate: (dateString: string) => void;
}

const VIEW_OPTIONS: Array<{ value: CalendarViewMode; label: string }> = [
  { value: 'month', label: '월간' },
  { value: 'week', label: '주간' },
  { value: 'day', label: '일간' },
];

const MOVE_LABEL: Record<CalendarViewMode, string> = {
  month: '달',
  week: '주',
  day: '일',
};

export default function CalendarView({
  notes,
  groups,
  onSelectNote,
  onAddNoteWithDate,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const notesByDate = useMemo(
    () => groupCalendarNotes(notes, searchQuery),
    [notes, searchQuery],
  );
  const selectedNotes = notesByDate.get(toLocalDateString(selectedDate)) || [];

  const movePeriod = (offset: number) => {
    setSelectedDate((date) => shiftCalendarDate(date, viewMode, offset));
  };

  const moveToToday = () => setSelectedDate(new Date());

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-background select-none relative">
      <header className="sticky top-0 w-full flex flex-col gap-3 px-4 md:px-8 py-3 z-20 bg-background/90 backdrop-blur-md border-b border-grid-line shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <h1 className="font-sans text-lg md:text-xl font-bold text-on-background truncate">
              {formatCalendarPeriod(selectedDate, viewMode)}
            </h1>

            <div className="flex items-center bg-surface-container rounded-full p-1 shrink-0">
              <button
                type="button"
                onClick={() => movePeriod(-1)}
                aria-label={`이전 ${MOVE_LABEL[viewMode]}`}
                className="p-1 hover:bg-surface-dim rounded-full transition-all active:scale-90 text-on-surface-variant cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={moveToToday}
                className="px-3 md:px-4 py-1 font-sans text-xs font-bold text-primary bg-surface-container-lowest rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                오늘
              </button>
              <button
                type="button"
                onClick={() => movePeriod(1)}
                aria-label={`다음 ${MOVE_LABEL[viewMode]}`}
                className="p-1 hover:bg-surface-dim rounded-full transition-all active:scale-90 text-on-surface-variant cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        <div className="flex items-center gap-2 w-full md:justify-end">
          <div className="flex items-center bg-surface-container rounded-xl p-1 shrink-0" aria-label="캘린더 보기 방식">
            {VIEW_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setViewMode(option.value)}
                aria-pressed={viewMode === option.value}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === option.value ? 'bg-primary text-white shadow-soft' : 'text-on-surface-variant hover:bg-surface-container-lowest'}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="search"
              aria-label="캘린더 메모 검색"
              placeholder="메모 검색..."
              className="bg-surface border border-transparent rounded-xl h-10 pl-9 pr-4 w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-xs font-medium text-on-surface placeholder:text-outline select-text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => onAddNoteWithDate(toLocalDateString(selectedDate))}
            className="bg-primary text-white text-xs font-bold px-4 h-10 rounded-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-soft cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>새 메모</span>
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'day' ? (
          <DayCalendarScreen
            selectedDate={selectedDate}
            notes={selectedNotes}
            groups={groups}
            onSelectNote={onSelectNote}
            onAddNoteWithDate={onAddNoteWithDate}
          />
        ) : (
          <div className="h-full flex flex-col xl:flex-row min-h-0 overflow-hidden">
            <div className="flex-1 min-w-0 min-h-0">
              {viewMode === 'month' ? (
                <MonthCalendarScreen
                  selectedDate={selectedDate}
                  notesByDate={notesByDate}
                  onSelectDate={setSelectedDate}
                  onSelectNote={onSelectNote}
                />
              ) : (
                <WeekCalendarScreen
                  selectedDate={selectedDate}
                  notesByDate={notesByDate}
                  groups={groups}
                  onSelectDate={setSelectedDate}
                  onSelectNote={onSelectNote}
                />
              )}
            </div>

            <SelectedDayPanel
              selectedDate={selectedDate}
              notes={selectedNotes}
              groups={groups}
              onSelectNote={onSelectNote}
              onAddNoteWithDate={onAddNoteWithDate}
            />
          </div>
        )}
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
    </div>
  );
}
