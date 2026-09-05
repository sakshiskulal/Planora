import { describe, expect, it } from 'vitest';
import { generateSchedule } from '@/utils/scheduler';

describe('generateSchedule', () => {
  it('returns empty schedule for empty tasks', () => {
    const result = generateSchedule([], { start: '09:00', end: '17:00' });
    expect(result.blocks).toHaveLength(0);
    expect(result.overflow).toBe(false);
  });

  it('inserts a break after 90+ minutes of continuous work', () => {
    const tasks = [
      { id: 'a', title: 'Task A', durationMinutes: 50, priority: 5, deadline: null, completed: false },
      { id: 'b', title: 'Task B', durationMinutes: 50, priority: 5, deadline: null, completed: false },
      { id: 'c', title: 'Task C', durationMinutes: 20, priority: 1, deadline: null, completed: false },
    ];

    const result = generateSchedule(tasks, { start: '09:00', end: '17:00' });
    const breakBlock = result.blocks.find((b) => b.type === 'break');

    expect(breakBlock).toBeDefined();
    expect(breakBlock.duration).toBe(10);
  });

  it('marks overflow when task exceeds work window', () => {
    const tasks = [
      { id: 'a', title: 'Task A', durationMinutes: 120, priority: 5, deadline: null, completed: false },
    ];

    const result = generateSchedule(tasks, { start: '09:00', end: '10:00' });

    expect(result.overflow).toBe(true);
    expect(result.blocks.some((b) => b.warning)).toBe(true);
  });

  it('splits long tasks into chunks', () => {
    const tasks = [
      { id: 'a', title: 'Task A', durationMinutes: 130, priority: 3, deadline: null, completed: false },
    ];

    const result = generateSchedule(tasks, { start: '09:00', end: '17:00' });
    const taskBlocks = result.blocks.filter((b) => b.type === 'task');
    // With 130 minutes, chunks are 60,60,10; expect 3 task blocks after scheduling.
    expect(taskBlocks).toHaveLength(3);
    expect(taskBlocks[0].chunkId).toBe(1);
    expect(taskBlocks[0].totalChunks).toBe(3);
  });

  it('inserts fixed scheduled breaks at specified times', () => {
    const tasks = [
      { id: 'a', title: 'Task A', durationMinutes: 120, priority: 3, deadline: null, completed: false },
    ];

    const result = generateSchedule(tasks, { start: '09:00', end: '17:00' }, { fixedBreaks: [{ start: '10:00', duration: 30 }] });
    // Expect a break at 10:00 with duration 30
    const fixed = result.blocks.find(b => b.type === 'break' && b.duration === 30 && b.startTime === '10:00');
    expect(fixed).toBeDefined();
    // Ensure task chunks exist before and after the fixed break
    const taskBlocks = result.blocks.filter(b => b.type === 'task');
    expect(taskBlocks.length).toBeGreaterThanOrEqual(2);
    expect(taskBlocks[0].endTime).toBe('10:00');
  });

  it('uses custom fixed break title when provided', () => {
    const tasks = [
      { id: 'a', title: 'Task A', durationMinutes: 90, priority: 3, deadline: null, completed: false },
    ];

    const result = generateSchedule(
      tasks,
      { start: '09:00', end: '17:00' },
      { fixedBreaks: [{ title: 'Lunch', start: '10:00', duration: 30 }] }
    );

    const fixed = result.blocks.find((b) => b.type === 'break' && b.startTime === '10:00');
    expect(fixed).toBeDefined();
    expect(fixed.title).toBe('Lunch');
  });
});
