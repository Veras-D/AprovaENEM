import { create } from 'zustand';
import type { UserProfile } from '@/types';
import { useSessionStore } from '@/stores/useSessionStore';

interface AuthState {
  readonly token: string | null;
  readonly user: UserProfile | null;
  readonly isAuthenticated: boolean;
  readonly isAuthModalOpen: boolean;
  readonly authModalMode: 'login' | 'register';
  readonly setAuth: (token: string, user: UserProfile) => void;
  readonly updateUser: (updatedFields: Partial<UserProfile>) => void;
  readonly clearAuth: () => void;
  readonly syncAuthFromStorage: () => void;
  readonly openAuthModal: (mode?: 'login' | 'register') => void;
  readonly closeAuthModal: () => void;
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
    isAuthModalOpen: false,
    authModalMode: 'login',
    setAuth: (token: string, user: UserProfile) => {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      if (user?.id) {
        useSessionStore.getState().migrateAnonymousProgress(user.id);
      }
      set({ token, user, isAuthenticated: true, isAuthModalOpen: false });
    },
    updateUser: (updatedFields: Partial<UserProfile>) => {
      set((state) => {
        if (!state.user) return state;
        const updated: UserProfile = { ...state.user, ...updatedFields };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
          if (updated.avatarConfig && updated.id) {
            localStorage.setItem(`aprovaenem_avatar_${updated.id}`, JSON.stringify(updated.avatarConfig));
          }
        }
        return { user: updated };
      });
    },
    clearAuth: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ token: null, user: null, isAuthenticated: false, isAuthModalOpen: false });
    },
    openAuthModal: (mode: 'login' | 'register' = 'login') => {
      set({ isAuthModalOpen: true, authModalMode: mode });
    },
    closeAuthModal: () => {
      set({ isAuthModalOpen: false });
    },
    syncAuthFromStorage: () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(STORAGE_KEY_TOKEN);
        let user: UserProfile | null = null;
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
          try {
            user = JSON.parse(storedUser) as UserProfile;
            if (user && user.id && !user.avatarConfig) {
              const savedAvatar = localStorage.getItem(`aprovaenem_avatar_${user.id}`);
              if (savedAvatar) {
                user = { ...user, avatarConfig: JSON.parse(savedAvatar) };
              }
            }
          } catch {
            localStorage.removeItem(STORAGE_KEY_USER);
          }
        }
        set({ token, user, isAuthenticated: Boolean(token) });
      }
    },
  };
});
