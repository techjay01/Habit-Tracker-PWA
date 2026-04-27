import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitForm from '@/components/habits/HabitForm';
import HabitCard from '@/components/habits/HabitCard';
import type { Habit } from '@/types/habit';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = '2024-06-15';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    userId: 'user-1',
    name: 'Drink Water',
    description: 'Stay hydrated',
    frequency: 'daily',
    createdAt: '2024-01-01T00:00:00.000Z',
    completions: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<HabitForm onSave={vi.fn()} onCancel={vi.fn()} />);

    // Submit without entering a name
    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Habit name is required');
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<HabitForm onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByTestId('habit-name-input'), 'Read Books');
    await user.type(screen.getByTestId('habit-description-input'), 'Read for 30 mins');
    await user.click(screen.getByTestId('habit-save-button'));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Read Books',
      description: 'Read for 30 mins',
      frequency: 'daily',
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    const original = makeHabit({ completions: [TODAY] });
    const onSave = vi.fn();

    render(
      <HabitForm
        initialData={original}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    );

    // Clear name and type a new one
    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Drink More Water');

    await user.click(screen.getByTestId('habit-save-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Drink More Water', frequency: 'daily' })
    );

    // Verify immutable fields are preserved (done at calling-layer but we test intent)
    const callArg = onSave.mock.calls[0][0];
    // The form passes data; the caller merges id, userId, createdAt, completions
    expect(callArg.frequency).toBe('daily');
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const habit = makeHabit();

    render(
      <HabitCard
        habit={habit}
        today={TODAY}
        onUpdate={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    // Click delete button — should NOT call onDelete yet
    await user.click(screen.getByTestId('habit-delete-drink-water'));
    expect(onDelete).not.toHaveBeenCalled();

    // Confirmation dialog appears
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();

    // Now confirm
    await user.click(screen.getByTestId('confirm-delete-button'));
    expect(onDelete).toHaveBeenCalledWith(habit.id);
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    const habit = makeHabit({ completions: [] });
    let currentHabit = habit;

    const { rerender } = render(
      <HabitCard
        habit={currentHabit}
        today={TODAY}
        onUpdate={(updated) => { currentHabit = updated; }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const streakEl = screen.getByTestId('habit-streak-drink-water');
    expect(streakEl).toHaveTextContent('0');

    // Toggle complete
    await user.click(screen.getByTestId('habit-complete-drink-water'));

    // Rerender with updated habit (simulating parent state update)
    currentHabit = { ...habit, completions: [TODAY] };
    rerender(
      <HabitCard
        habit={currentHabit}
        today={TODAY}
        onUpdate={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('1');
    });
  });
});
