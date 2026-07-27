import { Note, Schedule } from '../../types';
import HolidayBadges from '../../features/holidays/HolidayBadges';
import { KoreanHoliday } from '../../features/holidays/koreanHolidayTypes';
import { getHolidayNames } from '../../features/holidays/koreanHolidayUtils';
import { toLocalDateString } from '../../utils/date';
import CalendarNoteDots from './CalendarNoteDots';
import TimeGrid from './TimeGrid';
import { getWeekDates, isSameLocalDate } from './calendarUtils';

interface WeekCalendarScreenProps {
  selectedDate: Date;
  notesByDate: Map<string, Note[]>;
  schedulesByDate: Map<string, Schedule[]>;
  holidaysByDate: Map<string, KoreanHoliday[]>;
  onSelectDate: (date: Date) => void;
  onSelectNote: (noteId: string) => void;
  onSelectSchedule: (schedule: Schedule) => void;
  onCreateSchedule: (dateString: string, startTime: string) => void;
}

export default function WeekCalendarScreen({
  selectedDate,
  notesByDate,
  schedulesByDate,
  holidaysByDate,
  onSelectDate,
  onSelectNote,
  onSelectSchedule,
  onCreateSchedule,
}: WeekCalendarScreenProps) {
  const today = new Date();
  const weekDates = getWeekDates(selectedDate);

  return (
    <div className="h-full flex flex-col min-h-0 p-2 md:p-4 gap-2">
      <div className="grid grid-cols-7 bg-surface-container-lowest rounded-xl notebook-shadow border border-grid-line overflow-hidden shrink-0">
        {weekDates.map((date) => {
          const dateString = toLocalDateString(date);
          const dayNotes = notesByDate.get(dateString) || [];
          const dayHolidays = holidaysByDate.get(dateString) || [];
          const selected = isSameLocalDate(date, selectedDate);
          const currentDay = isSameLocalDate(date, today);

          return (
            <button
              key={dateString}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`px-2 py-2 border-r border-grid-line last:border-r-0 text-center cursor-pointer transition-colors ${selected ? 'bg-primary/5' : 'hover:bg-surface-container-low'}`}
              aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일${dayHolidays.length > 0 ? `, ${getHolidayNames(dayHolidays)}` : ''} 선택`}
            >
              <span className="block text-[10px] font-bold text-on-surface-variant">
                {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
              </span>
              <span className={`mt-1 mx-auto w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${selected ? 'bg-primary text-white' : currentDay ? 'ring-2 ring-primary text-primary' : 'text-on-surface'}`}>
                {date.getDate()}
              </span>
              <HolidayBadges holidays={dayHolidays} compact />
              <div className="mt-1 flex justify-center">
                <CalendarNoteDots notes={dayNotes} onSelectNote={onSelectNote} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 bg-surface-container-lowest rounded-xl notebook-shadow border border-grid-line overflow-hidden">
        <TimeGrid
          days={weekDates}
          schedulesByDate={schedulesByDate}
          onSelectSchedule={onSelectSchedule}
          onCreateSchedule={onCreateSchedule}
        />
      </div>
    </div>
  );
}
