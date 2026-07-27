import { Schedule, SchedulePriority } from '../../types';

export const HOUR_HEIGHT_PX = 56;
export const GRID_START_HOUR = 0;
export const GRID_END_HOUR = 24;
export const DEFAULT_SCROLL_HOUR = 7;

export const PRIORITY_ORDER: SchedulePriority[] = ['high', 'normal', 'low'];

export const PRIORITY_LABELS: Record<SchedulePriority, string> = {
  high: '높음',
  normal: '보통',
  low: '낮음',
};

// 기존 테마 토큰(index.css @theme, .dark)을 그대로 재사용 — 새 CSS 변수를 추가하지 않는다.
export const PRIORITY_COLORS: Record<SchedulePriority, { bg: string; border: string; text: string; dot: string }> = {
  high: {
    bg: 'bg-error/10',
    border: 'border-error',
    text: 'text-error',
    dot: 'bg-error',
  },
  normal: {
    bg: 'bg-primary/10',
    border: 'border-primary',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  low: {
    bg: 'bg-outline-variant/20',
    border: 'border-outline',
    text: 'text-on-surface-variant',
    dot: 'bg-outline',
  },
};

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function scheduleTopPx(startTime: string): number {
  return (timeToMinutes(startTime) / 60) * HOUR_HEIGHT_PX;
}

export function scheduleHeightPx(startTime: string, endTime: string): number {
  const durationMinutes = Math.max(15, timeToMinutes(endTime) - timeToMinutes(startTime));
  return (durationMinutes / 60) * HOUR_HEIGHT_PX;
}

export function groupSchedulesByDate(schedules: Schedule[], searchQuery: string) {
  const query = searchQuery.trim().toLocaleLowerCase('ko-KR');
  const schedulesByDate = new Map<string, Schedule[]>();

  schedules.forEach((schedule) => {
    if (query && !`${schedule.title} ${schedule.memo ?? ''}`.toLocaleLowerCase('ko-KR').includes(query)) return;

    const daySchedules = schedulesByDate.get(schedule.dateString) || [];
    daySchedules.push(schedule);
    schedulesByDate.set(schedule.dateString, daySchedules);
  });

  schedulesByDate.forEach((daySchedules) => {
    daySchedules.sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      if (a.allDay) return 0;
      return timeToMinutes(a.startTime || '00:00') - timeToMinutes(b.startTime || '00:00');
    });
  });

  return schedulesByDate;
}

export function splitAllDaySchedules(schedules: Schedule[]) {
  return {
    allDay: schedules.filter((schedule) => schedule.allDay),
    timed: schedules.filter((schedule) => !schedule.allDay),
  };
}
