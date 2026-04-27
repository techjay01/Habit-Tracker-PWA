import type { User, Session } from '@/types/auth';
import { AUTH_ERRORS } from '@/lib/constants';
import {
  getUserByEmail,
  addUser,
  getUsers,
  saveSession,
  clearSession,
  getSession,
} from '@/lib/storage';

export type AuthResult =
  | { success: true; session: Session }
  | { success: false; error: string };

export function signUp(email: string, password: string): AuthResult {
  if (!email.trim()) {
    return { success: false, error: 'Email is required' };
  }
  if (!password.trim()) {
    return { success: false, error: 'Password is required' };
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return { success: false, error: AUTH_ERRORS.USER_ALREADY_EXISTS };
  }

  const user: User = {
    id: crypto.randomUUID(),
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  addUser(user);

  const session: Session = { userId: user.id, email: user.email };
  saveSession(session);

  return { success: true, session };
}

export function logIn(email: string, password: string): AuthResult {
  if (!email.trim() || !password.trim()) {
    return { success: false, error: AUTH_ERRORS.INVALID_CREDENTIALS };
  }
  
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: AUTH_ERRORS.INVALID_CREDENTIALS };
  }

  const session: Session = { userId: user.id, email: user.email };
  saveSession(session);

  return { success: true, session };
}

export function logOut(): void {
  clearSession();
}

export function requireSession(): Session | null {
  return getSession();
}
