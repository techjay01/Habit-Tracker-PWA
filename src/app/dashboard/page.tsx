'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Habit } from '@/types/habit';
import type { Session } from '@/types/auth';
import HabitList from '@/components/habits/HabitList';
import HabitForm from '@/components/habits/HabitForm';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import {
  getHabitsForUser,
  addHabit,
  updateHabit,
  deleteHabit,
} from '@/lib/storage';
import { logOut } from '@/lib/auth';

type FormMode = 'hidden' | 'create' | 'edit';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function DashboardContent({ session }: { session: Session }) {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>(() =>
    getHabitsForUser(session.userId)
  );
  const [formMode, setFormMode] = useState<FormMode>('hidden');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [today] = useState(getTodayString);

  const refreshHabits = useCallback(() => {
    setHabits(getHabitsForUser(session.userId));
  }, [session.userId]);

  function handleCreateHabit(data: {
    name: string;
    description: string;
    frequency: 'daily';
  }) {
    const habit: Habit = {
      id: crypto.randomUUID(),
      userId: session.userId,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      createdAt: new Date().toISOString(),
      completions: [],
    };
    addHabit(habit);
    refreshHabits();
    setFormMode('hidden');
  }

  function handleEditHabit(data: {
    name: string;
    description: string;
    frequency: 'daily';
  }) {
    if (!editingHabit) return;
    const updated: Habit = {
      ...editingHabit,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
    };
    updateHabit(updated);
    refreshHabits();
    setFormMode('hidden');
    setEditingHabit(null);
  }

  function handleUpdateHabit(updated: Habit) {
    updateHabit(updated);
    refreshHabits();
  }

  function handleDeleteHabit(habitId: string) {
    deleteHabit(habitId);
    refreshHabits();
  }

  function startEdit(habit: Habit) {
    setEditingHabit(habit);
    setFormMode('edit');
  }

  function handleLogOut() {
    logOut();
    router.replace('/login');
  }

  const completedToday = habits.filter((h) =>
    h.completions.includes(today)
  ).length;

  return (
    <div
      data-testid="dashboard-page"
      style={{ minHeight: '100dvh', background: 'var(--color-bg)', paddingBottom: '3rem' }}
    >
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-1)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            padding: '0 1rem',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span aria-hidden>✦</span> Habit Tracker
          </span>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogOut}
            className="btn-ghost"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                fontWeight: 400,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              Today
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0' }}>
              {new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {formMode === 'hidden' && (
            <button
              data-testid="create-habit-button"
              onClick={() => {
                setEditingHabit(null);
                setFormMode('create');
              }}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
            >
              + New habit
            </button>
          )}
        </div>

        {formMode !== 'hidden' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <HabitForm
              initialData={
                formMode === 'edit' && editingHabit ? editingHabit : undefined
              }
              onSave={formMode === 'edit' ? handleEditHabit : handleCreateHabit}
              onCancel={() => {
                setFormMode('hidden');
                setEditingHabit(null);
              }}
            />
          </div>
        )}

        <HabitList
          habits={habits}
          today={today}
          onUpdate={handleUpdateHabit}
          onEdit={startEdit}
          onDelete={handleDeleteHabit}
        />

        {habits.length > 0 && (
          <p
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            {completedToday} of {habits.length} habits done today
          </p>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {(session) => <DashboardContent session={session} />}
    </ProtectedRoute>
  );
}
