import { describe, expect, it, vi } from 'vitest';
import { getAutoNoteTitle, resolveNoteTitle } from './autoTitle';

const groups = [
  { id: 'project', name: '프로젝트' },
  { id: 'schedule', name: '일정' },
  { id: 'personal', name: '개인' },
];

describe('getAutoNoteTitle', () => {
  it('uses the local date and project title format for project groups', () => {
    expect(getAutoNoteTitle('project', groups, new Date(2026, 6, 22, 10))).toBe('2026-07-22_프로젝트_일정');
  });

  it('uses the local date and schedule title format for schedule groups', () => {
    expect(getAutoNoteTitle('schedule', groups, new Date(2026, 6, 22, 10))).toBe('2026-07-22_일정');
  });

  it('returns null for groups without an automatic title rule', () => {
    expect(getAutoNoteTitle('personal', groups, new Date(2026, 6, 22, 10))).toBeNull();
  });
});

describe('resolveNoteTitle', () => {
  it('overrides a typed title when a project group is saved', () => {
    vi.setSystemTime(new Date(2026, 6, 22, 10));

    expect(resolveNoteTitle({ groupId: 'project', groups, title: '사용자 입력 제목' })).toBe('2026-07-22_프로젝트_일정');

    vi.useRealTimers();
  });

  it('keeps the typed title for groups without an automatic title rule', () => {
    expect(resolveNoteTitle({ groupId: 'personal', groups, title: '개인 메모' })).toBe('개인 메모');
  });
});
