'use client';

import { useState } from 'react';
import type { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import { toggleHabitCompletion } from '@/lib/habits';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onUpdate: (updated: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({ habit, today, onUpdate, onEdit, onDelete }: HabitCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompletedToday = habit.completions.includes(today);

  function handleToggle() {
    const updated = toggleHabitCompletion(habit, today);
    onUpdate(updated);
  }

  function handleDeleteConfirmed() {
    onDelete(habit.id);
    setConfirmingDelete(false);
  }

  return (
    <article
      data-testid={`habit-card-${slug}`}
      style={{
        background: 'var(--color-surface-1)',
        border: `1px solid ${isCompletedToday ? 'rgba(240,145,24,0.35)' : 'var(--color-border)'}`,
        borderRadius: '1.25rem',
        padding: '1.25rem 1.25rem 1rem',
        transition: 'border-color 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Completion glow */}
      {isCompletedToday && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, var(--color-brand), transparent)',
            borderRadius: '1.25rem 1.25rem 0 0',
          }}
        />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 400,
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.2rem',
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {habit.description}
            </p>
          )}
        </div>

        {/* Streak badge */}
        <div
          data-testid={`habit-streak-${slug}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.3rem 0.7rem',
            borderRadius: '999px',
            background: streak > 0 ? 'var(--color-brand-muted)' : 'var(--color-surface-2)',
            border: `1px solid ${streak > 0 ? 'rgba(240,145,24,0.3)' : 'var(--color-border)'}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>{streak > 0 ? '🔥' : '○'}</span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: streak > 0 ? 'var(--color-brand)' : 'var(--color-text-muted)',
            }}
          >
            {streak} day{streak !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
        {/* Complete toggle */}
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={handleToggle}
          aria-pressed={isCompletedToday}
          aria-label={isCompletedToday ? `Unmark ${habit.name} as complete` : `Mark ${habit.name} as complete`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1rem',
            borderRadius: '0.875rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            border: '1px solid',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: isCompletedToday ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-2)',
            borderColor: isCompletedToday ? 'rgba(74,222,128,0.35)' : 'var(--color-border)',
            color: isCompletedToday ? '#4ade80' : 'var(--color-text-muted)',
          }}
        >
          <span aria-hidden>{isCompletedToday ? '✓' : '○'}</span>
          {isCompletedToday ? 'Done today' : 'Mark done'}
        </button>

        {/* Edit */}
        <button
          data-testid={`habit-edit-${slug}`}
          onClick={() => onEdit(habit)}
          aria-label={`Edit ${habit.name}`}
          className="btn-ghost"
          style={{ padding: '0.6rem 0.8rem', flexShrink: 0 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          data-testid={`habit-delete-${slug}`}
          onClick={() => setConfirmingDelete(true)}
          aria-label={`Delete ${habit.name}`}
          className="btn-ghost"
          style={{
            padding: '0.6rem 0.8rem',
            flexShrink: 0,
            color: 'var(--color-danger)',
            borderColor: 'rgba(248,113,113,0.2)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* Delete confirmation overlay */}
      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm delete"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15,14,12,0.93)',
            borderRadius: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', textAlign: 'center', margin: 0 }}>
            Delete <strong>&ldquo;{habit.name}&rdquo;</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="btn-ghost"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}
            >
              Cancel
            </button>
            <button
              data-testid="confirm-delete-button"
              onClick={handleDeleteConfirmed}
              className="btn-danger"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
