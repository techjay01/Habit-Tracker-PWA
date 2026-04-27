'use client';

import { useState, FormEvent, useEffect } from 'react';
import type { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface HabitFormProps {
  initialData?: Partial<Habit>;
  onSave: (data: { name: string; description: string; frequency: 'daily' }) => void;
  onCancel: () => void;
}

export default function HabitForm({ initialData, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const frequency: 'daily' = 'daily';
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setNameError(null);
  }, [initialData?.name, initialData?.description]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }
    setNameError(null);
    onSave({ name: validation.value, description: description.trim(), frequency });
  }

  return (
    <div
      data-testid="habit-form"
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 400,
          marginBottom: '1.25rem',
          color: 'var(--color-text)',
        }}
      >
        {initialData?.name ? 'Edit habit' : 'New habit'}
      </h2>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="habit-name"
            style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)' }}
          >
            Habit name <span aria-hidden>*</span>
          </label>
          <input
            id="habit-name"
            data-testid="habit-name-input"
            type="text"
            placeholder="e.g. Drink Water"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            className="input-field"
            aria-required="true"
            aria-describedby={nameError ? 'habit-name-error' : undefined}
          />
          {nameError && (
            <p
              id="habit-name-error"
              role="alert"
              style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '0.15rem' }}
            >
              {nameError}
            </p>
          )}
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="habit-description"
            style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)' }}
          >
            Description <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
          </label>
          <textarea
            id="habit-description"
            data-testid="habit-description-input"
            placeholder="Why does this habit matter to you?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field"
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        </div>

        {/* Frequency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="habit-frequency"
            style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)' }}
          >
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            value={frequency}
            onChange={() => {/* only daily is supported in this stage */}}
            className="input-field"
            style={{ cursor: 'default', opacity: 0.7 }}
          >
            <option value="daily">Daily</option>
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" data-testid="habit-save-button" className="btn-primary">
            Save habit
          </button>
        </div>
      </form>
    </div>
  );
}
