import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';

function makeHabit(completions: string[] = []): Habit {
  return {
    id: 'test-id-123',
    userId: 'user-1',
    name: 'Drink Water',
    description: 'Stay hydrated',
    frequency: 'daily',
    createdAt: '2024-01-01T00:00:00.000Z',
    completions,
  };
}

const DATE = '2024-06-15';
const OTHER_DATE = '2024-06-14';

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const habit = makeHabit([]);
    const result = toggleHabitCompletion(habit, DATE);
    expect(result.completions).toContain(DATE);
    expect(result.completions).toHaveLength(1);
  });

  it('removes a completion date when the date already exists', () => {
    const habit = makeHabit([DATE, OTHER_DATE]);
    const result = toggleHabitCompletion(habit, DATE);
    expect(result.completions).not.toContain(DATE);
    expect(result.completions).toContain(OTHER_DATE);
    expect(result.completions).toHaveLength(1);
  });

  it('does not mutate the original habit object', () => {
    const original = makeHabit([]);
    const originalCompletionsCopy = [...original.completions];
    toggleHabitCompletion(original, DATE);
    expect(original.completions).toEqual(originalCompletionsCopy);
  });

  it('does not return duplicate completion dates', () => {
    // Even if input has duplicates, output should be clean
    const habit = makeHabit([DATE, DATE, OTHER_DATE]);
    const result = toggleHabitCompletion(habit, OTHER_DATE); // removes OTHER_DATE
    const unique = new Set(result.completions);
    expect(unique.size).toBe(result.completions.length);

    // Adding to a habit with duplicates should also deduplicate
    const habit2 = makeHabit([DATE, DATE]);
    const result2 = toggleHabitCompletion(habit2, OTHER_DATE);
    const unique2 = new Set(result2.completions);
    expect(unique2.size).toBe(result2.completions.length);
  });
});
