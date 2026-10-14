import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { useSessionStore } from '@/stores/useSessionStore';

interface AuthState {
  readonly token: string | null;
  readonly user: UserProfile | null;
  readonly isAuthenticated: boolean;
  readonly setAuth: (token: string, user: UserProfile) => void;
  readonly clearAuth: () => void;
}

const STORAGE_KEY_TOKEN = 'aprovaenem_auth_token';
const STORAGE_KEY_USER = 'aprovaenem_auth_user';

export const useAuthStore = create<AuthState>((set) => {
  let initialToken: string | null = null;
  let initialUser: UserProfile | null = null;

  if (typeof window !== 'undefined') {
    initialToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
      try {
        initialUser = JSON.parse(storedUser) as UserProfile;
      } catch {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
  }

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: Boolean(initialToken),
    setAuth: (token: string, user: UserProfile) => {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      useSessionStore.getState().migrateAnonymousProgress(user.id);
      set({ token, user, isAuthenticated: true });
    },
    clearAuth: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
