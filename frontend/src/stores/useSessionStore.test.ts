import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from './useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
  });

  it('should initialize with anonymousSessionId and empty selectedAnswers', () => {
    const state = useSessionStore.getState();
    expect(state.anonymousSessionId).toBeDefined();
    expect(state.selectedAnswers).toEqual({});
    expect(state.activeSession).toBeNull();
  });

  it('should record an answer for a question', () => {
    useSessionStore.getState().recordAnswer('q-123', 'B');

    const state = useSessionStore.getState();
    expect(state.selectedAnswers['q-123']).toBe('B');
  });

  it('should clear session state when clearSession is invoked', () => {
    useSessionStore.getState().recordAnswer('q-123', 'C');
    expect(useSessionStore.getState().selectedAnswers['q-123']).toBe('C');

    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().selectedAnswers).toEqual({});
    expect(useSessionStore.getState().activeSession).toBeNull();
  });
});
