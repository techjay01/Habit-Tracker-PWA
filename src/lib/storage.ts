import type { User, Session } from '@/types/auth';
import type { Habit } from '@/types/habit';
import { STORAGE_KEYS as KEYS } from '@/lib/constants';

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    if (!raw || raw === 'null') return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.setItem(KEYS.SESSION, 'null');
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export function getAllHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.HABITS);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    return [];
  }
}

export function saveAllHabits(habits: Habit[]): void {
  localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
}

export function getHabitsForUser(userId: string): Habit[] {
  return getAllHabits().filter((h) => h.userId === userId);
}

export function addHabit(habit: Habit): void {
  const habits = getAllHabits();
  habits.push(habit);
  saveAllHabits(habits);
}

export function updateHabit(updated: Habit): void {
  const habits = getAllHabits().map((h) =>
    h.id === updated.id ? updated : h
  );
  saveAllHabits(habits);
}

export function deleteHabit(habitId: string): void {
  const habits = getAllHabits().filter((h) => h.id !== habitId);
  saveAllHabits(habits);
}
