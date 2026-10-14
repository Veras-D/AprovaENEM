import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { useSessionStore } from './useSessionStore';
import type { UserProfile, PracticeSession } from '@/types';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useSessionStore.getState().clearSession();
    localStorage.clear();
  });

  it('should initialize unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should set authentication state and save to localStorage', () => {
    const mockUser: UserProfile = {
      id: 'usr-123',
      email: 'student@example.com',
      name: 'Maria Silva',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-10-14T10:00:00Z',
    };

    useAuthStore.getState().setAuth('jwt-test-token-xyz', mockUser);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('jwt-test-token-xyz');
    expect(state.user).toEqual(mockUser);
    expect(localStorage.getItem('aprovaenem_auth_token')).toBe('jwt-test-token-xyz');
  });

  it('should automatically trigger session progress migration on setAuth', () => {
    const mockSession: PracticeSession = {
      id: 'sess-anon-1',
      title: 'Simulado Anônimo',
      questionCount: 5,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      correctCount: 0,
      createdAt: '2026-10-14T10:00:00Z',
    };

    useSessionStore.getState().startSession(mockSession);
    expect(useSessionStore.getState().activeSession?.userId).toBeUndefined();

    const mockUser: UserProfile = {
      id: 'usr-999',
      email: 'authenticated@example.com',
      name: 'João Santos',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-10-14T10:00:00Z',
    };

    useAuthStore.getState().setAuth('jwt-session-token', mockUser);

    expect(useSessionStore.getState().activeSession?.userId).toBe('usr-999');
    expect(localStorage.getItem('aprovaenem_migrated_progress')).not.toBeNull();
  });

  it('should clear authentication state on clearAuth', () => {
    const mockUser: UserProfile = {
      id: 'usr-123',
      email: 'student@example.com',
      name: 'Maria Silva',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      createdAt: '2026-10-14T10:00:00Z',
    };

    useAuthStore.getState().setAuth('jwt-test-token-xyz', mockUser);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorage.getItem('aprovaenem_auth_token')).toBeNull();
  });
});
