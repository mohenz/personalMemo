import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CalendarView, { clampDayToMonth } from './CalendarView';

const renderCalendar = (date: Date) => {
  vi.setSystemTime(date);
  return renderToStaticMarkup(
    <CalendarView
      notes={[]}
      groups={[]}
      onSelectNote={() => undefined}
      onAddNoteWithDate={() => undefined}
    />
  );
};

describe('CalendarView current date', () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    [new Date(2026, 0, 1, 12), '2026년 1월', '1월 1일 메모'],
    [new Date(2026, 1, 28, 12), '2026년 2월', '2월 28일 메모'],
    [new Date(2028, 1, 29, 12), '2028년 2월', '2월 29일 메모'],
    [new Date(2026, 6, 14, 12), '2026년 7월', '7월 14일 메모'],
    [new Date(2026, 11, 31, 12), '2026년 12월', '12월 31일 메모'],
  ])('uses the system date %#', (date, monthLabel, dayLabel) => {
    vi.useFakeTimers();
    const markup = renderCalendar(date);

    expect(markup).toContain(monthLabel);
    expect(markup).toContain(dayLabel);
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
