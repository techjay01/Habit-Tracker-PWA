/**
 * Calculates the current consecutive streak from an array of completion dates.
 *
 * Rules:
 * - completions are YYYY-MM-DD strings
 * - duplicates are removed before calculation
 * - dates are sorted before logic
 * - if today is not completed, streak is 0
 * - if today is completed, count consecutive calendar days backwards from today
 */
export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  const todayDate = today ?? new Date().toISOString().split('T')[0];

  // Deduplicate
  const unique = Array.from(new Set(completions));

  // Sort ascending
  unique.sort();

  // Must include today to have any streak
  if (!unique.includes(todayDate)) {
    return 0;
  }

  let streak = 0;
  let current = todayDate;

  while (unique.includes(current)) {
    streak++;
    // Move one day back
    const d = new Date(current + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    current = d.toISOString().split('T')[0];
  }

  return streak;
}
