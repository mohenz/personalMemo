import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CalendarView from './CalendarView';

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
    [new Date(2026, 0, 1, 12), '2026년 1월', '1월 1일 일정'],
    [new Date(2026, 1, 28, 12), '2026년 2월', '2월 28일 일정'],
    [new Date(2028, 1, 29, 12), '2028년 2월', '2월 29일 일정'],
    [new Date(2026, 6, 14, 12), '2026년 7월', '7월 14일 일정'],
    [new Date(2026, 11, 31, 12), '2026년 12월', '12월 31일 일정'],
  ])('uses the system date %#', (date, monthLabel, dayLabel) => {
    vi.useFakeTimers();
    const markup = renderCalendar(date);

    expect(markup).toContain(monthLabel);
    expect(markup).toContain(dayLabel);
  });
});
