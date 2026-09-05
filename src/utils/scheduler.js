import { addMinutes, parse, format, isAfter } from 'date-fns';
import { calculateTaskScore } from './scoring';

/**
 * Sequential scheduling logic with break insertion
 * @param {Array} tasks - Array of task objects
 * @param {Object} workWindow - { start: 'HH:mm', end: 'HH:mm' }
 * @returns {Object} { blocks: Array, overflow: boolean }
 */
export function generateSchedule(tasks, workWindow, options = {}) {
  if (!tasks || tasks.length === 0) return { blocks: [], overflow: false };

  // Parse against an arbitrary date (today) for baseline calculation
  const today = new Date();
  const startTime = parse(workWindow.start, 'HH:mm', today);
  const endTime = parse(workWindow.end, 'HH:mm', today);

  // Filter out completed tasks and sort by dynamic intelligence score descending
  const orderedTasks = tasks
    .filter((t) => !t.completed)
    .map((t) => ({ ...t }))
    .sort((a, b) => calculateTaskScore(b) - calculateTaskScore(a));

  const blocks = [];
  let currentTime = startTime;
  let continuousWork = 0;
  let hasOverflow = false;
  const breakLength = Number.isFinite(Number(options.breakLength)) ? Number(options.breakLength) : 10;
  const breakAfter = Number.isFinite(Number(options.breakAfterMinutes)) ? Number(options.breakAfterMinutes) : 90;
  const fixedBreaksInput = Array.isArray(options.fixedBreaks) ? options.fixedBreaks : [];
  // normalize fixed breaks to parsed Date ranges (today)
  const fixedBreaks = fixedBreaksInput
    .map((b) => {
      const start = parse(b.start, 'HH:mm', today);
      return {
        title: String(b.title || '').trim() || 'Scheduled break',
        start,
        end: addMinutes(start, Number(b.duration || b.durationMinutes || b.length || 0)),
        duration: Number(b.duration || b.durationMinutes || b.length || 0)
      };
    })
    .filter(b => isAfter(b.end, startTime)) // ignore breaks completely before work window
    .sort((a, b) => a.start - b.start);
  let nextFixedIndex = 0;

  for (const task of orderedTasks) {
    // schedule the task in pieces to honor both max chunk size (60) and the 90-min continuous work rule
    let remaining = task.durationMinutes;
    const totalChunks = Math.ceil(task.durationMinutes / 60);
    let chunkIndex = 1;

    while (remaining > 0) {
      // If a fixed break is due now, insert it first
      const nextFixed = fixedBreaks[nextFixedIndex];
      if (nextFixed && !isAfter(nextFixed.start, currentTime)) {
        // if nextFixed.start < currentTime, it means a break overlaps with work Window start
        // or we reached it.
        const actualStart = isAfter(nextFixed.start, currentTime) ? format(nextFixed.start, 'HH:mm') : format(currentTime, 'HH:mm');
        
        blocks.push({
          id: `fixedbreak_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'break',
          title: nextFixed.title || 'Scheduled break',
          startTime: actualStart,
          endTime: format(nextFixed.end, 'HH:mm'),
          duration: nextFixed.duration,
          fixed: true
        });
        currentTime = nextFixed.end;
        continuousWork = 0;
        nextFixedIndex += 1;
        // continue scheduling remaining of the same task after the fixed break
        continue;
      }
      // Insert break if we've already worked >= 90 mins
      if (continuousWork >= breakAfter) {
        const breakEndTime = addMinutes(currentTime, breakLength);
        blocks.push({
          id: `break_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'break',
          title: 'Take a breather',
          startTime: format(currentTime, 'HH:mm'),
          endTime: format(breakEndTime, 'HH:mm'),
          duration: breakLength
        });
        currentTime = breakEndTime;
        continuousWork = 0;
      }

      const availableBeforeBreak = Math.max(0, breakAfter - continuousWork);
      // also cap by time until next fixed break (if any)
      const upcomingFixed = fixedBreaks[nextFixedIndex];
      const minutesUntilFixed = upcomingFixed ? Math.max(0, Math.round((upcomingFixed.start - currentTime) / 60000)) : Infinity;
      // max piece we can schedule now is min(remaining, 60)
      let piece = Math.min(remaining, 60);
      // if scheduling piece would exceed availableBeforeBreak, cap it so break happens mid-task
      if (availableBeforeBreak > 0 && piece > availableBeforeBreak) {
        piece = availableBeforeBreak;
      }
      // if there's a fixed break coming before our piece would end, cap the piece
      if (minutesUntilFixed < piece) {
        piece = minutesUntilFixed;
      }

      const pieceEnd = addMinutes(currentTime, piece);
      if (isAfter(pieceEnd, endTime)) hasOverflow = true;

      blocks.push({
        id: `block_${task.id}_chunk_${chunkIndex}_${Date.now()}`,
        type: 'task',
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        deadline: task.deadline,
        chunkId: chunkIndex,
        totalChunks,
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(pieceEnd, 'HH:mm'),
        duration: piece,
        warning: isAfter(pieceEnd, endTime)
      });

      currentTime = pieceEnd;
      continuousWork += piece;
      remaining -= piece;
      chunkIndex += 1;

      // if we filled up to availableBeforeBreak exactly, the next loop will insert a break
    }
  }

  // Pass 2: Calculate accurate totalChunks post-break-insertions
  const chunkCounts = {};
  for (const block of blocks) {
    if (block.type === 'task') {
      chunkCounts[block.taskId] = (chunkCounts[block.taskId] || 0) + 1;
    }
  }
  for (const block of blocks) {
    if (block.type === 'task') {
      block.totalChunks = chunkCounts[block.taskId];
    }
  }

  return { blocks, overflow: hasOverflow };
}
