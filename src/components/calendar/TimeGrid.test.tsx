import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Schedule } from '../../types';
import TimeGrid from './TimeGrid';

describe('TimeGrid schedule layout', () => {
  it('places the time before the schedule title', () => {
    const date = new Date(2026, 6, 23, 12);
    const schedule: Schedule = {
      id: 'schedule-1',
      title: '요구사항인터뷰(디전팀)',
      dateString: '2026-07-23',
      allDay: false,
      startTime: '09:30',
      endTime: '11:30',
      priority: 'high',
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
    };
    const markup = renderToStaticMarkup(
      <TimeGrid
        days={[date]}
        schedulesByDate={new Map([[schedule.dateString, [schedule]]])}
        onSelectSchedule={() => undefined}
        onCreateSchedule={() => undefined}
      />
    );
    const scheduleContent = markup.match(
      /aria-label="09:30–11:30 요구사항인터뷰\(디전팀\)"[^>]*>(.*?)<\/button>/,
    )?.[1];

    expect(scheduleContent).toBeDefined();
    expect(scheduleContent!.indexOf('09:30–11:30')).toBeLessThan(
      scheduleContent!.indexOf('요구사항인터뷰(디전팀)'),
    );
  });
});
