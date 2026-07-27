import { FormEvent, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Schedule, SchedulePriority } from '../../types';
import { PRIORITY_COLORS, PRIORITY_LABELS, PRIORITY_ORDER, minutesToTime, timeToMinutes } from './scheduleUtils';

export interface ScheduleDraft {
  title: string;
  dateString: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  priority: SchedulePriority;
  memo: string;
}

interface ScheduleFormModalProps {
  schedule: Schedule | null; // null = 신규 등록
  initialDateString: string;
  initialStartTime?: string;
  onSave: (draft: ScheduleDraft) => void;
  onDelete?: (scheduleId: string) => void;
  onClose: () => void;
}

function toDraft(schedule: Schedule | null, initialDateString: string, initialStartTime?: string): ScheduleDraft {
  if (schedule) {
    return {
      title: schedule.title,
      dateString: schedule.dateString,
      allDay: schedule.allDay,
      startTime: schedule.startTime || initialStartTime || '09:00',
      endTime: schedule.endTime || minutesToTime(timeToMinutes(initialStartTime || '09:00') + 60),
      priority: schedule.priority,
      memo: schedule.memo || '',
    };
  }

  const startTime = initialStartTime || '09:00';
  return {
    title: '',
    dateString: initialDateString,
    allDay: false,
    startTime,
    endTime: minutesToTime(timeToMinutes(startTime) + 60),
    priority: 'normal',
    memo: '',
  };
}

export default function ScheduleFormModal({
  schedule,
  initialDateString,
  initialStartTime,
  onSave,
  onDelete,
  onClose,
}: ScheduleFormModalProps) {
  const [draft, setDraft] = useState<ScheduleDraft>(() => toDraft(schedule, initialDateString, initialStartTime));
  const [timeError, setTimeError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;

    if (!draft.allDay && timeToMinutes(draft.endTime) <= timeToMinutes(draft.startTime)) {
      setTimeError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    setTimeError(null);
    onSave({ ...draft, title: draft.title.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[200] animate-fade-in-scale p-4">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-form-title"
        className="bg-surface-container-lowest text-on-surface p-6 rounded-2xl w-96 max-w-full shadow-2xl border border-outline-variant flex flex-col gap-4 select-text"
      >
        <h3 id="schedule-form-title" className="font-bold text-lg text-on-surface">
          {schedule ? '일정 수정' : '새 일정'}
        </h3>

        <input
          type="text"
          autoFocus
          required
          maxLength={80}
          aria-label="일정 제목"
          placeholder="일정 제목"
          value={draft.title}
          onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
          className="w-full h-11 px-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface placeholder:text-outline caret-primary bg-surface-container-low select-text"
        />

        <input
          type="date"
          required
          aria-label="일정 날짜"
          value={draft.dateString}
          onChange={(event) => setDraft((prev) => ({ ...prev, dateString: event.target.value }))}
          className="w-full h-11 px-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-on-surface bg-surface-container-low"
        />

        <label className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant cursor-pointer">
          <input
            type="checkbox"
            checked={draft.allDay}
            onChange={(event) => setDraft((prev) => ({ ...prev, allDay: event.target.checked }))}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          종일(고정) — 시간 없이 하루 상단에 고정 표시
        </label>

        {!draft.allDay && (
          <div className="flex items-center gap-2">
            <input
              type="time"
              required={!draft.allDay}
              aria-label="시작 시간"
              value={draft.startTime}
              onChange={(event) => setDraft((prev) => ({ ...prev, startTime: event.target.value }))}
              className="flex-1 h-11 px-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-on-surface bg-surface-container-low"
            />
            <span className="text-outline text-sm">–</span>
            <input
              type="time"
              required={!draft.allDay}
              aria-label="종료 시간"
              value={draft.endTime}
              onChange={(event) => setDraft((prev) => ({ ...prev, endTime: event.target.value }))}
              className="flex-1 h-11 px-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-on-surface bg-surface-container-low"
            />
          </div>
        )}
        {timeError && <p className="text-xs text-error font-semibold">{timeError}</p>}

        <div className="flex items-center gap-2">
          {PRIORITY_ORDER.map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, priority }))}
              aria-pressed={draft.priority === priority}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                draft.priority === priority
                  ? `${PRIORITY_COLORS[priority].bg} ${PRIORITY_COLORS[priority].border} ${PRIORITY_COLORS[priority].text}`
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[priority].dot}`} />
              {PRIORITY_LABELS[priority]}
            </button>
          ))}
        </div>

        <textarea
          aria-label="일정 메모"
          placeholder="메모 (선택)"
          rows={2}
          maxLength={300}
          value={draft.memo}
          onChange={(event) => setDraft((prev) => ({ ...prev, memo: event.target.value }))}
          className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-on-surface placeholder:text-outline bg-surface-container-low resize-none select-text"
        />

        <div className="flex items-center justify-between gap-2 text-sm font-semibold">
          {schedule && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(schedule.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-error hover:bg-error/10 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-soft"
            >
              저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
