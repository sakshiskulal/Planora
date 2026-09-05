import { differenceInHours, parseISO } from 'date-fns';

/**
 * Calculates the dynamic intelligence score for a task.
 * Higher score = Scheduled earlier.
 * Formula: (priority * 2) + urgency - estimatedFatigueCost
 */
export function calculateTaskScore(task) {
  let score = 0;

  // 1. Priority Weighting (1-5 scale)
  score += (task.priority * 2);

  // 2. Urgency Calculation
  if (task.deadline) {
    const hoursUntilDeadline = differenceInHours(parseISO(task.deadline), new Date());
    
    if (hoursUntilDeadline < 0) {
      // Overdue
      score += 8;
    } else if (hoursUntilDeadline <= 24) {
      // Due within 1 day
      score += 5;
    } else if (hoursUntilDeadline <= 48) {
      // Due within 2 days
      score += 3;
    } else {
      // Just some subtle weight for having a deadline
      score += 1;
    }
  }

  // 3. Fatigue Cost Penalty
  const estimatedFatigueCost = Math.floor(task.durationMinutes / 30);
  score -= estimatedFatigueCost;

  // 4. Chunk Penalty (Spreads splitted tasks out)
  if (task.scorePenalty) {
    score -= task.scorePenalty;
  }

  return score;
}
