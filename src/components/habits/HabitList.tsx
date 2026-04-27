'use client';

import type { Habit } from '@/types/habit';
import HabitCard from '@/components/habits/HabitCard';

interface HabitListProps {
  habits: Habit[];
  today: string;
  onUpdate: (updated: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitList({
  habits,
  today,
  onUpdate,
  onEdit,
  onDelete,
}: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div
        data-testid="empty-state"
        style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          border: '1px dashed var(--color-border)',
          borderRadius: '1.25rem',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>○</div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            color: 'var(--color-text)',
            margin: '0 0 0.5rem',
          }}
        >
          No habits yet
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Create your first habit to start building consistency.
        </p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {habits.map((habit) => (
        <li key={habit.id}>
          <HabitCard
            habit={habit}
            today={today}
            onUpdate={onUpdate}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
