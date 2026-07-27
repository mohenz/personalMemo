import { Edit3, FolderOpen } from 'lucide-react';
import { Group, Note, Schedule } from '../../types';
import HolidayBadges from '../../features/holidays/HolidayBadges';
import { KoreanHoliday } from '../../features/holidays/koreanHolidayTypes';
import { toLocalDateString } from '../../utils/date';
import CalendarNoteCard from './CalendarNoteCard';
import { PRIORITY_COLORS } from './scheduleUtils';

interface SelectedDayPanelProps {
  selectedDate: Date;
  notes: Note[];
  schedules: Schedule[];
  holidays: KoreanHoliday[];
  groups: Group[];
  onSelectNote: (noteId: string) => void;
  onAddNoteWithDate: (dateString: string) => void;
  onSelectSchedule: (schedule: Schedule) => void;
}

export default function SelectedDayPanel({
  selectedDate,
  notes,
  schedules,
  holidays,
  groups,
  onSelectNote,
  onAddNoteWithDate,
  onSelectSchedule,
}: SelectedDayPanelProps) {
  const dateLabel = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

  return (
    <aside className="w-full xl:w-[360px] max-h-[42vh] xl:max-h-none border-t xl:border-t-0 xl:border-l border-grid-line bg-surface-container-low flex flex-col shrink-0">
      <div className="p-5 md:p-6 flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold text-on-surface">{dateLabel}</h2>
        </div>
        <HolidayBadges holidays={holidays} />

        <div className="space-y-5 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {/* 일정 섹션 (상단) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">일정</h3>
              <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant font-bold">
                {schedules.length}개
              </span>
            </div>
            {schedules.length === 0 ? (
              <p className="text-xs text-outline py-2">등록된 일정이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div key={schedule.id}>
                    <button
                      type="button"
                      onClick={() => onSelectSchedule(schedule)}
                      className={`w-full text-left rounded-xl border-l-4 px-3 py-2.5 hover:brightness-95 transition-all cursor-pointer ${PRIORITY_COLORS[schedule.priority].bg} ${PRIORITY_COLORS[schedule.priority].border}`}
                    >
                      <span className={`block text-sm font-bold truncate ${PRIORITY_COLORS[schedule.priority].text}`}>
                        {schedule.title}
                      </span>
                      <span className="block text-[11px] text-on-surface-variant mt-0.5">
                        {schedule.allDay ? '종일' : `${schedule.startTime}–${schedule.endTime}`}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-grid-line/60" />

          {/* 메모 섹션 (하단) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">메모</h3>
              <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant font-bold">
                {notes.length}개
              </span>
            </div>
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 opacity-40">
                <FolderOpen className="w-8 h-8 text-outline mb-2 stroke-[1.25]" />
                <p className="text-xs font-semibold text-on-surface">기록된 메모가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id}>
                    <CalendarNoteCard
                      note={note}
                      groups={groups}
                      onSelectNote={onSelectNote}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
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
