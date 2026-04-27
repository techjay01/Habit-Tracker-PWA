import type { Habit } from '@/types/habit';

/**
 * Toggles a completion date on a habit (immutably).
 * - if date is not in completions, adds it
 * - if date is already in completions, removes it
 * - no duplicate dates in result
 * - original habit is not mutated
 */
export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = [...habit.completions];
  const index = completions.indexOf(date);

  if (index === -1) {
    completions.push(date);
  } else {
    completions.splice(index, 1);
  }

  // Deduplicate just in case
  const unique = Array.from(new Set(completions));

  return { ...habit, completions: unique };
}
