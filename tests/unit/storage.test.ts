import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUsers,
  saveUsers,
  getUserByEmail,
  addUser,
  getSession,
  saveSession,
  clearSession,
  getAllHabits,
  saveAllHabits,
  getHabitsForUser,
  addHabit,
  updateHabit,
  deleteHabit,
} from '@/lib/storage';
import type { User, Session } from '@/types/auth';
import type { Habit } from '@/types/habit';

function makeUser(email = 'alice@example.com'): User {
  return { id: 'user-1', email, password: 'password123', createdAt: new Date().toISOString() };
}

function makeHabit(userId = 'user-1', name = 'Drink Water'): Habit {
  return { id: 'habit-1', userId, name, description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] };
}

describe('storage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('getUsers returns empty array when no users stored', () => {
    expect(getUsers()).toEqual([]);
  });

  it('saveUsers and getUsers round-trips correctly', () => {
    const user = makeUser();
    saveUsers([user]);
    expect(getUsers()).toEqual([user]);
  });

  it('addUser appends to the users list', () => {
    addUser(makeUser('alice@example.com'));
    addUser({ ...makeUser('bob@example.com'), id: 'user-2' });
    expect(getUsers()).toHaveLength(2);
  });

  it('getUserByEmail returns the correct user', () => {
    const user = makeUser('alice@example.com');
    addUser(user);
    expect(getUserByEmail('alice@example.com')).toEqual(user);
  });

  it('getUserByEmail returns undefined for unknown email', () => {
    expect(getUserByEmail('nobody@example.com')).toBeUndefined();
  });

  it('getSession returns null when no session stored', () => {
    expect(getSession()).toBeNull();
  });

  it('saveSession and getSession round-trips correctly', () => {
    const session: Session = { userId: 'user-1', email: 'alice@example.com' };
    saveSession(session);
    expect(getSession()).toEqual(session);
  });

  it('clearSession sets session to null', () => {
    saveSession({ userId: 'user-1', email: 'alice@example.com' });
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('saveSession with null clears the session', () => {
    saveSession({ userId: 'user-1', email: 'alice@example.com' });
    saveSession(null);
    expect(getSession()).toBeNull();
  });

  it('getAllHabits returns empty array when no habits stored', () => {
    expect(getAllHabits()).toEqual([]);
  });

  it('addHabit appends a habit', () => {
    const habit = makeHabit();
    addHabit(habit);
    expect(getAllHabits()).toHaveLength(1);
    expect(getAllHabits()[0]).toEqual(habit);
  });

  it("getHabitsForUser returns only that user's habits", () => {
    addHabit(makeHabit('user-1', 'Drink Water'));
    addHabit({ ...makeHabit('user-2', 'Read Books'), id: 'habit-2' });
    expect(getHabitsForUser('user-1')).toHaveLength(1);
    expect(getHabitsForUser('user-1')[0].name).toBe('Drink Water');
  });

  it('updateHabit replaces the matching habit in storage', () => {
    const habit = makeHabit();
    addHabit(habit);
    updateHabit({ ...habit, name: 'Drink More Water' });
    expect(getAllHabits()[0].name).toBe('Drink More Water');
  });

  it('deleteHabit removes the habit by id', () => {
    addHabit(makeHabit('user-1', 'Drink Water'));
    addHabit({ ...makeHabit('user-1', 'Read Books'), id: 'habit-2' });
    deleteHabit('habit-1');
    const remaining = getAllHabits();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('habit-2');
  });

  it('saveAllHabits overwrites the entire habits list', () => {
    addHabit(makeHabit());
    saveAllHabits([]);
    expect(getAllHabits()).toEqual([]);
  });

  it('returns empty array from getUsers when localStorage contains corrupt JSON', () => {
    localStorage.setItem('habit-tracker-users', 'INVALID_JSON{{{');
    expect(getUsers()).toEqual([]);
  });

  it('returns null from getSession when localStorage contains corrupt JSON', () => {
    localStorage.setItem('habit-tracker-session', 'INVALID_JSON{{{');
    expect(getSession()).toBeNull();
  });

  it('returns empty array from getAllHabits when localStorage contains corrupt JSON', () => {
    localStorage.setItem('habit-tracker-habits', 'INVALID_JSON{{{');
    expect(getAllHabits()).toEqual([]);
  });
});