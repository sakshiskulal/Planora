import { describe, expect, it } from 'vitest';
import { normalizeTask } from '@/app/api/gemini/route';

describe('gemini route normalizeTask', () => {
  it('normalizes missing/invalid fields with defaults', () => {
    const out = normalizeTask({}, 0);

    expect(out.title).toBe('Task 1');
    expect(out.durationMinutes).toBe(30);
    expect(out.priority).toBe(3);
    expect(out.deadline).toBeNull();
  });

  it('clamps duration and priority', () => {
    const out = normalizeTask(
      { title: 'X', durationMinutes: 1, priority: 99, deadline: null },
      0,
    );

    expect(out.durationMinutes).toBe(5);
    expect(out.priority).toBe(5);
  });

  it('normalizes valid ISO deadline', () => {
    const out = normalizeTask(
      { title: 'X', durationMinutes: 30, priority: 2, deadline: '2026-04-22T10:00:00Z' },
      0,
    );

    expect(out.deadline).toBe('2026-04-22T10:00:00.000Z');
  });
});
