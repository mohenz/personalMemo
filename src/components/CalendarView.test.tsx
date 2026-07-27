import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CalendarView, { clampDayToMonth } from './CalendarView';

const renderCalendar = (date: Date) => {
  vi.setSystemTime(date);
  return renderToStaticMarkup(
    <CalendarView
      notes={[]}
      schedules={[]}
      groups={[]}
      onSelectNote={() => undefined}
      onAddNoteWithDate={() => undefined}
      onAddSchedule={() => undefined}
      onUpdateSchedule={() => undefined}
      onDeleteSchedule={() => undefined}
    />
  );
};

describe('CalendarView current date', () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    [new Date(2026, 0, 1, 12), '2026년 1월', '1월 1일'],
    [new Date(2026, 1, 28, 12), '2026년 2월', '2월 28일'],
    [new Date(2028, 1, 29, 12), '2028년 2월', '2월 29일'],
    [new Date(2026, 6, 14, 12), '2026년 7월', '7월 14일'],
    [new Date(2026, 11, 31, 12), '2026년 12월', '12월 31일'],
  ])('uses the system date %#', (date, monthLabel, dayLabel) => {
    vi.useFakeTimers();
    const markup = renderCalendar(date);

    expect(markup).toContain(monthLabel);
    expect(markup).toContain(dayLabel);
  });
});

describe('CalendarView selected-day panel', () => {
  it('shows a schedules section above the notes section', () => {
    vi.useFakeTimers();
    const markup = renderCalendar(new Date(2026, 6, 23, 12));

    const scheduleHeadingIndex = markup.indexOf('>일정<');
    const noteHeadingIndex = markup.indexOf('>메모<');

    expect(scheduleHeadingIndex).toBeGreaterThan(-1);
    expect(noteHeadingIndex).toBeGreaterThan(-1);
    expect(scheduleHeadingIndex).toBeLessThan(noteHeadingIndex);

    vi.useRealTimers();
  });
});

describe('CalendarView month navigation', () => {
  it('keeps the selected day when it exists in the target month', () => {
    expect(clampDayToMonth(15, 2026, 7)).toBe(15);
  });

  it('clamps the selected day for a shorter target month', () => {
    expect(clampDayToMonth(31, 2026, 1)).toBe(28);
  });

  it('keeps leap day in a leap year', () => {
    expect(clampDayToMonth(29, 2028, 1)).toBe(29);
  });
});

describe('CalendarView toolbar layout', () => {
  it('places the view controls immediately before memo search', () => {
    vi.useFakeTimers();
    const markup = renderCalendar(new Date(2026, 6, 23, 12));

    expect(markup.indexOf('캘린더 보기 방식')).toBeLessThan(markup.indexOf('캘린더 메모 검색'));

    vi.useRealTimers();
  });
});

describe('CalendarView Korean holidays', () => {
  it('renders an official public holiday on the selected date', () => {
    vi.useFakeTimers();
    const markup = renderCalendar(new Date(2026, 6, 17, 12));

    expect(markup).toContain('제헌절');
    expect(markup).toContain('대한민국 국경일 및 공휴일');

    vi.useRealTimers();
  });
});
